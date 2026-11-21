import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { checkTransition, commissionRateFor, computeSettlement, depositAmount, evaluatePromo, type OrderAction } from "./rules";
import { DEMO_CUSTOMER_ID, DEMO_PARTNER_ID, seed, type SeedData } from "./seed";
import type {
  CommissionConfig,
  DeliveryMethod,
  Offer,
  Order,
  Partner,
  PartnerStatus,
  PaymentPolicy,
  PriceType,
  PromoCode,
  Review,
  Role,
  Service,
  Vehicle,
} from "./types";

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

type Result = { ok: true } | { ok: false; reason: string };

interface Actions {
  resetDemo: () => void;
  setActivePartner: (id: string) => void;
  submitRequest: (input: { vehicleId: string; categoryId: string; serviceId?: string; partnerId?: string; title: string; description: string; locationLabel: string; method: DeliveryMethod; urgent: boolean; mediaCount: number }) => string;
  sendOffer: (orderId: string, partnerId: string, offer: { price: number; priceType: PriceType; etaLabel: string; note: string; method: DeliveryMethod; paymentPolicy: PaymentPolicy; depositPercent: number }) => Result;
  declineRequest: (orderId: string, partnerId: string) => void;
  acceptOffer: (orderId: string, offerId: string, shareVehicle: boolean) => Result;
  payDeposit: (orderId: string, succeed: boolean) => Result;
  advance: (orderId: string, action: Extract<OrderAction, "start_work" | "mark_done" | "confirm_delivery" | "cancel" | "dispute">, actor: Role) => Result;
  payBalance: (orderId: string, succeed: boolean, promoCode?: string) => Result;
  submitReview: (orderId: string, role: "customer" | "partner", rating: number, comment: string) => void;
  sendMessage: (threadId: string, from: "customer" | "partner", text: string) => void;
  openThread: (customerId: string, partnerId: string) => string;
  setPartnerStatus: (partnerId: string, status: PartnerStatus) => void;
  updateCommission: (c: Omit<CommissionConfig, "history">) => void;
  savePromo: (p: PromoCode) => void;
  togglePromo: (id: string) => void;
  saveService: (s: Service) => void;
  deleteService: (id: string) => void;
  addVehicle: (v: Omit<Vehicle, "id" | "customerId">) => void;
  addCategory: (name: string) => void;
  toggleCity: (id: string) => void;
  runMonthlyPayouts: () => number;
  setPayoutStatus: (id: string, status: "paid" | "failed" | "processing", reason?: string) => void;
  moderateReview: (id: string, hidden: boolean) => void;
  registerPartner: (p: Omit<Partner, "id" | "status" | "joinedAt">) => string;
  updatePartner: (id: string, patch: Partial<Partner>) => void;
}

export type MarketState = SeedData & {
  activePartnerId: string;
  customerId: string;
} & Actions;

const initial = () => ({ ...clone(seed), activePartnerId: DEMO_PARTNER_ID, customerId: DEMO_CUSTOMER_ID });

export const useMarket = create<MarketState>()(
  persist(
    (set, get) => {
      const patchOrder = (id: string, fn: (o: Order) => Order) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? fn(o) : o)) }));
      const getOrder = (id: string) => get().orders.find((o) => o.id === id);

      return {
        ...initial(),

        resetDemo: () => set({ ...initial() }),
        setActivePartner: (id) => set({ activePartnerId: id }),

        // Demo: never persist newly created orders into the shared list.
        submitRequest: (_input) => "",

        sendOffer: (orderId, partnerId, input) => {
          const order = getOrder(orderId);
          if (!order) return { ok: false, reason: "Order not found" };
          const check = checkTransition(order, "send_offer", "partner");
          if (!check.ok) return check;
          const offer: Offer = { id: uid("of"), partnerId, createdAt: now(), ...input };
          patchOrder(orderId, (o) => ({
            ...o,
            status: "offers_received",
            offers: [...o.offers.filter((x) => x.partnerId !== partnerId), offer],
            timeline: o.status === "pending" ? [...o.timeline, { status: "offers_received", at: now(), by: "partner" }] : o.timeline,
          }));
          return { ok: true };
        },

        declineRequest: (orderId, partnerId) => patchOrder(orderId, (o) => ({ ...o, declinedBy: [...o.declinedBy, partnerId] })),

        acceptOffer: (orderId, offerId, shareVehicle) => {
          const order = getOrder(orderId);
          const offer = order?.offers.find((x) => x.id === offerId);
          if (!order || !offer) return { ok: false, reason: "Offer not found" };
          const check = checkTransition(order, "accept_offer", "customer");
          if (!check.ok) return check;
          patchOrder(orderId, (o) => ({
            ...o, status: "accepted", acceptedOfferId: offerId, partnerId: offer.partnerId, agreedPrice: offer.price,
            paymentPolicy: offer.paymentPolicy, depositPercent: offer.depositPercent, depositPaid: false, method: offer.method,
            vehicleShared: shareVehicle, timeline: [...o.timeline, { status: "accepted", at: now(), by: "customer" }],
          }));
          return { ok: true };
        },

        payDeposit: (orderId, succeed) => {
          const order = getOrder(orderId);
          if (!order) return { ok: false, reason: "Order not found" };
          const check = checkTransition(order, "pay_deposit", "customer");
          if (!check.ok) return check;
          const amount = depositAmount(order.agreedPrice ?? 0, order.depositPercent ?? 0);
          const at = now();
          if (!succeed) {
            patchOrder(orderId, (o) => ({ ...o, paymentAttempts: [...o.paymentAttempts, { at, ok: false, amount, kind: "deposit", reason: "Card declined by issuer" }] }));
            return { ok: false, reason: "Payment failed — your card was declined. Nothing was charged." };
          }
          const s = get();
          const partner = s.partners.find((p) => p.id === order.partnerId)!;
          const rate = commissionRateFor(s.commission, partner.type);
          const settle = computeSettlement({ gross: order.agreedPrice ?? 0, discount: 0, commissionRate: rate, fundedBy: s.commission.discountFundedBy });
          set((st) => ({
            transactions: [
              {
                id: uid("tx"), orderId, customerId: order.customerId, partnerId: partner.id, partnerType: partner.type,
                gross: settle.gross, discount: 0, discountFundedBy: st.commission.discountFundedBy, commissionRate: rate,
                commissionAmount: settle.commissionAmount, partnerNet: settle.partnerNet, customerPaid: amount, status: "partially_paid",
                payments: [{ kind: "deposit", amount, at, gatewayRef: `HP-${Math.floor(Math.random() * 90000 + 10000)}D` }], createdAt: at,
              },
              ...st.transactions,
            ],
          }));
          patchOrder(orderId, (o) => ({ ...o, depositPaid: true, paymentAttempts: [...o.paymentAttempts, { at, ok: true, amount, kind: "deposit" }] }));
          return { ok: true };
        },

        advance: (orderId, action, actor) => {
          const order = getOrder(orderId);
          if (!order) return { ok: false, reason: "Order not found" };
          const check = checkTransition(order, action, actor);
          if (!check.ok) return check;
          patchOrder(orderId, (o) => ({ ...o, status: check.to, timeline: [...o.timeline, { status: check.to, at: now(), by: actor }] }));
          return { ok: true };
        },

        payBalance: (orderId, succeed, promoCode) => {
          const s = get();
          const order = getOrder(orderId);
          if (!order) return { ok: false, reason: "Order not found" };
          const check = checkTransition(order, "payment_succeeded", "system");
          if (!check.ok) return check;
          const partner = s.partners.find((p) => p.id === order.partnerId)!;
          const gross = order.agreedPrice ?? 0;
          let discount = 0;
          const promo = promoCode ? s.promoCodes.find((p) => p.code.toUpperCase() === promoCode.toUpperCase()) : undefined;
          if (promoCode) {
            const r = evaluatePromo(promo, { subtotal: gross, customerId: order.customerId, categoryId: order.categoryId, now: now() });
            if (!r.ok) return r;
            discount = r.discount;
          }
          const existing = s.transactions.find((t) => t.orderId === orderId);
          const rate = existing?.commissionRate ?? commissionRateFor(s.commission, partner.type);
          const fundedBy = existing?.discountFundedBy ?? s.commission.discountFundedBy;
          const settle = computeSettlement({ gross, discount, commissionRate: rate, fundedBy });
          const deposit = existing?.payments.filter((p) => p.kind === "deposit").reduce((a, p) => a + p.amount, 0) ?? 0;
          const due = Math.round((settle.customerPaid - deposit) * 100) / 100;
          const at = now();
          const kind = deposit > 0 ? "balance" : "full";
          if (!succeed) {
            patchOrder(orderId, (o) => ({ ...o, paymentAttempts: [...o.paymentAttempts, { at, ok: false, amount: due, kind, reason: "Card declined by issuer" }] }));
            return { ok: false, reason: "Payment failed — your card was declined. Nothing was charged and the order is still awaiting payment." };
          }
          const payment = { kind, amount: due, at, gatewayRef: `HP-${Math.floor(Math.random() * 90000 + 10000)}` } as const;
          set((st) => {
            const base = {
              gross: settle.gross, discount: settle.discount, promoCode: promo?.code, discountFundedBy: fundedBy, commissionRate: rate,
              commissionAmount: settle.commissionAmount, partnerNet: settle.partnerNet, customerPaid: settle.customerPaid, status: "succeeded" as const,
            };
            const transactions = existing
              ? st.transactions.map((t) => (t.id === existing.id ? { ...t, ...base, payments: [...t.payments, payment] } : t))
              : [{ id: uid("tx"), orderId, customerId: order.customerId, partnerId: partner.id, partnerType: partner.type, ...base, payments: [payment], createdAt: at }, ...st.transactions];
            const vehicle = st.vehicles.find((v) => v.id === order.vehicleId);
            const typeMap: Record<string, "oil" | "brakes" | "tires" | "battery" | "ac" | "inspection" | "repair"> = {
              oil: "oil", brakes: "brakes", tyres: "tires", battery: "battery", ac: "ac", diagnostics: "inspection", engine: "repair", roadside: "repair",
            };
            return {
              transactions,
              promoCodes: promo ? st.promoCodes.map((p) => (p.id === promo.id ? { ...p, usedCount: p.usedCount + 1 } : p)) : st.promoCodes,
              maintenance: [
                { id: uid("m"), vehicleId: order.vehicleId, type: typeMap[order.categoryId] ?? "other", title: order.title, date: at, mileage: vehicle?.mileage ?? 0, partnerId: partner.id, orderId, source: "order" as const },
                ...st.maintenance,
              ],
            };
          });
          patchOrder(orderId, (o) => ({
            ...o, status: "completed", promoCode: promo?.code,
            paymentAttempts: [...o.paymentAttempts, { at, ok: true, amount: due, kind }],
            timeline: [...o.timeline, { status: "completed", at, by: "system" }],
          }));
          return { ok: true };
        },

        submitReview: (orderId, role, rating, comment) => {
          const s = get();
          const order = getOrder(orderId);
          if (!order || order.status !== "completed") return;
          if (s.reviews.some((r) => r.orderId === orderId && r.reviewerRole === role)) return;
          const review: Review = {
            id: uid("rv"), orderId, reviewerRole: role,
            reviewerId: role === "customer" ? order.customerId : order.partnerId!,
            targetId: role === "customer" ? order.partnerId! : order.customerId,
            rating, comment: comment || undefined, createdAt: now(),
          };
          set((st) => ({ reviews: [review, ...st.reviews] }));
        },

        // Demo: do not append new chat messages.
        sendMessage: () => {},

        openThread: (customerId, partnerId) => {
          const existing = get().chats.find((c) => c.customerId === customerId && c.partnerId === partnerId);
          // Demo: never create a new thread — only open an existing seeded chat.
          return existing?.id ?? "";
        },

        setPartnerStatus: (partnerId, status) => set((s) => ({ partners: s.partners.map((p) => (p.id === partnerId ? { ...p, status } : p)) })),

        updateCommission: (c) =>
          set((s) => ({ commission: { ...c, history: [...s.commission.history, { at: now(), ...c }] } })),

        savePromo: (p) => set((s) => ({ promoCodes: s.promoCodes.some((x) => x.id === p.id) ? s.promoCodes.map((x) => (x.id === p.id ? p : x)) : [p, ...s.promoCodes] })),
        togglePromo: (id) => set((s) => ({ promoCodes: s.promoCodes.map((p) => (p.id === id ? { ...p, active: !p.active } : p)) })),

        // Demo: do not create/update/delete services or vehicles in the live lists.
        saveService: () => {},
        deleteService: () => {},
        addVehicle: () => {},
        addCategory: () => {},
        toggleCity: (id) => set((s) => ({ cities: s.cities.map((c) => (c.id === id ? { ...c, active: !c.active } : c)) })),

        runMonthlyPayouts: () => {
          const s = get();
          const at = now();
          const period = at.slice(0, 7);
          const unpaid = s.transactions.filter((t) => t.status === "succeeded" && !t.payoutId);
          const byPartner = new Map<string, typeof unpaid>();
          unpaid.forEach((t) => byPartner.set(t.partnerId, [...(byPartner.get(t.partnerId) ?? []), t]));
          const newPayouts = [...byPartner.entries()].map(([partnerId, txs]) => ({
            id: uid("po"), partnerId, period, status: "processing" as const, createdAt: at,
            amount: Math.round(txs.reduce((a, t) => a + t.partnerNet, 0) * 100) / 100,
            method: s.partners.find((p) => p.id === partnerId)?.payoutMethod ?? "Bank transfer",
            transactionIds: txs.map((t) => t.id),
          }));
          const txToPayout = new Map<string, string>();
          newPayouts.forEach((p) => p.transactionIds.forEach((t) => txToPayout.set(t, p.id)));
          set((st) => ({
            payouts: [...newPayouts, ...st.payouts],
            transactions: st.transactions.map((t) => (txToPayout.has(t.id) ? { ...t, payoutId: txToPayout.get(t.id) } : t)),
          }));
          return newPayouts.length;
        },

        setPayoutStatus: (id, status, reason) =>
          set((s) => ({ payouts: s.payouts.map((p) => (p.id === id ? { ...p, status, failureReason: status === "failed" ? reason : undefined } : p)) })),

        moderateReview: (id, hidden) => set((s) => ({ reviews: s.reviews.map((r) => (r.id === id ? { ...r, hidden, reported: false } : r)) })),

        registerPartner: (p) => {
          const id = uid("p");
          set((s) => ({ partners: [...s.partners, { ...p, id, status: "pending", joinedAt: now() }] }));
          return id;
        },
        updatePartner: (id, patch) => set((s) => ({ partners: s.partners.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      };
    },
    {
      name: "autocare-demo-ar-v4",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { ...data } = s;
        return Object.fromEntries(Object.entries(data).filter(([, v]) => typeof v !== "function")) as Partial<MarketState>;
      },
    },
  ),
);

/* ---------- Selectors / helpers ---------- */
export const usePartner = (id?: string) => useMarket((s) => s.partners.find((p) => p.id === id));
export const useCustomer = (id?: string) => useMarket((s) => s.customers.find((c) => c.id === id));
