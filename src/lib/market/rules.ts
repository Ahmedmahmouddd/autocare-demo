import type {
  CommissionConfig,
  DiscountFunding,
  MaintenanceRecord,
  MaintenanceType,
  Order,
  OrderStatus,
  PartnerType,
  PromoCode,
  Review,
  Role,
  Vehicle,
} from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ---------------- Commission ---------------- */

export function commissionRateFor(config: Pick<CommissionConfig, "freelancerRate" | "garageRate">, type: PartnerType) {
  return type === "garage" ? config.garageRate : config.freelancerRate;
}

export interface Settlement {
  gross: number;
  discount: number;
  commissionRate: number;
  commissionAmount: number;
  partnerNet: number;
  customerPaid: number;
  platformNet: number;
}

/**
 * Splits one order payment. The rate passed in is snapshotted on the transaction,
 * so later config changes never alter historical records.
 * - platform-funded discount: commission on the full gross; the platform absorbs the discount.
 * - partner-funded discount: commission on the discounted amount; the partner absorbs it.
 */
export function computeSettlement(input: {
  gross: number;
  discount: number;
  commissionRate: number;
  fundedBy: DiscountFunding;
}): Settlement {
  const gross = round2(input.gross);
  const discount = round2(Math.min(Math.max(input.discount, 0), gross));
  const base = input.fundedBy === "platform" ? gross : gross - discount;
  const commissionAmount = round2((base * input.commissionRate) / 100);
  const partnerNet = round2(base - commissionAmount);
  const customerPaid = round2(gross - discount);
  return {
    gross,
    discount,
    commissionRate: input.commissionRate,
    commissionAmount,
    partnerNet,
    customerPaid,
    platformNet: round2(customerPaid - partnerNet),
  };
}

/* ---------------- Promo codes ---------------- */

export type PromoResult = { ok: true; discount: number } | { ok: false; reason: string };

export function evaluatePromo(
  promo: PromoCode | undefined,
  ctx: { subtotal: number; customerId: string; categoryId: string; now: string },
): PromoResult {
  if (!promo) return { ok: false, reason: "هذا الرمز غير موجود." };
  if (!promo.active) return { ok: false, reason: "هذا الرمز لم يعد نشطًا." };
  const now = new Date(ctx.now).getTime();
  if (now < new Date(promo.startsAt).getTime()) return { ok: false, reason: "هذا الرمز لم يبدأ بعد." };
  if (now > new Date(promo.expiresAt).getTime()) return { ok: false, reason: "انتهت صلاحية هذا الرمز." };
  if (promo.usedCount >= promo.usageLimit) return { ok: false, reason: "وصل هذا الرمز إلى حد الاستخدام." };
  if (promo.customerIds?.length && !promo.customerIds.includes(ctx.customerId))
    return { ok: false, reason: "هذا الرمز غير متاح لحسابك." };
  if (promo.categoryIds?.length && !promo.categoryIds.includes(ctx.categoryId))
    return { ok: false, reason: "هذا الرمز لا ينطبق على هذه الخدمة." };
  if (ctx.subtotal < promo.minOrder)
    return { ok: false, reason: `الحد الأدنى للطلب لهذا الرمز هو ${promo.minOrder} ر.س.` };

  let discount =
    promo.discountType === "percentage" ? (ctx.subtotal * promo.value) / 100 : promo.value;
  if (promo.maxDiscount != null) discount = Math.min(discount, promo.maxDiscount);
  discount = Math.min(discount, ctx.subtotal);
  return { ok: true, discount: round2(discount) };
}

/* ---------------- Deposits ---------------- */

export function depositAmount(agreedPrice: number, depositPercent: number) {
  return round2((agreedPrice * depositPercent) / 100);
}

/* ---------------- Order lifecycle ---------------- */

export type OrderAction =
  | "send_offer"
  | "accept_offer"
  | "pay_deposit"
  | "start_work"
  | "mark_done"
  | "confirm_delivery"
  | "payment_succeeded"
  | "cancel"
  | "dispute";

const RULES: Record<OrderAction, { from: OrderStatus[]; actors: Role[]; to?: OrderStatus }> = {
  send_offer: { from: ["pending", "offers_received"], actors: ["partner"], to: "offers_received" },
  accept_offer: { from: ["offers_received"], actors: ["customer"], to: "accepted" },
  pay_deposit: { from: ["accepted"], actors: ["customer"] },
  start_work: { from: ["accepted"], actors: ["partner"], to: "in_progress" },
  mark_done: { from: ["in_progress"], actors: ["partner"], to: "awaiting_confirmation" },
  confirm_delivery: { from: ["awaiting_confirmation"], actors: ["customer"], to: "awaiting_payment" },
  payment_succeeded: { from: ["awaiting_payment"], actors: ["system"], to: "completed" },
  cancel: { from: ["pending", "offers_received", "accepted"], actors: ["customer", "partner", "admin"], to: "cancelled" },
  dispute: { from: ["awaiting_confirmation", "awaiting_payment"], actors: ["customer", "partner"], to: "disputed" },
};

export type TransitionCheck = { ok: true; to: OrderStatus } | { ok: false; reason: string };

const ROLE_LABELS: Record<Role, string> = {
  customer: "العميل",
  partner: "الشريك",
  admin: "المسؤول",
  system: "النظام",
};

export function checkTransition(order: Pick<Order, "status" | "paymentPolicy" | "depositPaid">, action: OrderAction, actor: Role): TransitionCheck {
  const rule = RULES[action];
  if (!rule.actors.includes(actor))
    return { ok: false, reason: `يسمح بهذا الإجراء لـ ${rule.actors.map((a) => ROLE_LABELS[a]).join(" أو ")} فقط.` };
  if (!rule.from.includes(order.status)) return { ok: false, reason: `غير مسموح بينما الطلب ${statusLabel(order.status)}.` };
  if (action === "pay_deposit") {
    if (order.paymentPolicy !== "deposit") return { ok: false, reason: "هذا الطلب لا يتطلب عربونًا." };
    if (order.depositPaid) return { ok: false, reason: "تم دفع العربون مسبقًا." };
  }
  if (action === "start_work" && order.paymentPolicy === "deposit" && !order.depositPaid) {
    return { ok: false, reason: "بانتظار عربون العميل." };
  }
  return { ok: true, to: rule.to ?? order.status };
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  offers_received: "عروض مستلمة",
  accepted: "مقبول",
  in_progress: "قيد التنفيذ",
  awaiting_confirmation: "بانتظار التأكيد",
  awaiting_payment: "بانتظار الدفع",
  completed: "مكتمل",
  cancelled: "ملغى",
  rejected: "مرفوض",
  expired: "منتهٍ",
  disputed: "متنازع عليه",
  refunded: "مسترد",
};
export const statusLabel = (s: OrderStatus) => STATUS_LABELS[s];

export const LIFECYCLE: OrderStatus[] = [
  "pending",
  "offers_received",
  "accepted",
  "in_progress",
  "awaiting_confirmation",
  "awaiting_payment",
  "completed",
];

export const ACTIVE_STATUSES: OrderStatus[] = ["accepted", "in_progress", "awaiting_confirmation", "awaiting_payment"];

/* ---------------- Reviews ---------------- */

export type ReviewCheck = { ok: true } | { ok: false; reason: string };

export function canReview(order: Pick<Order, "id" | "status">, role: "customer" | "partner", reviews: Pick<Review, "orderId" | "reviewerRole">[]): ReviewCheck {
  if (order.status !== "completed") return { ok: false, reason: "تفتح التقييمات بعد إتمام الدفع واكتمال الطلب." };
  if (reviews.some((r) => r.orderId === order.id && r.reviewerRole === role))
    return { ok: false, reason: "لقد قيّمت هذا الطلب مسبقًا." };
  return { ok: true };
}

export function averageRating(reviews: Pick<Review, "rating" | "hidden">[]) {
  const visible = reviews.filter((r) => !r.hidden);
  if (!visible.length) return 0;
  return Math.round((visible.reduce((s, r) => s + r.rating, 0) / visible.length) * 10) / 10;
}

/* ---------------- Maintenance schedule ---------------- */

export const MAINTENANCE_INTERVALS: Partial<Record<MaintenanceType, { km: number; months: number; label: string }>> = {
  oil: { km: 5000, months: 6, label: "تغيير الزيت" },
  filter: { km: 10000, months: 12, label: "فلاتر الهواء والمقصورة" },
  tires: { km: 10000, months: 12, label: "تدوير الإطارات" },
  brakes: { km: 30000, months: 24, label: "خدمة الفرامل" },
  battery: { km: 60000, months: 36, label: "فحص البطارية" },
  ac: { km: 40000, months: 12, label: "صيانة التكييف" },
  inspection: { km: 20000, months: 12, label: "فحص عام" },
};

export type DueState = "overdue" | "soon" | "ok";

export interface UpcomingItem {
  type: MaintenanceType;
  label: string;
  dueKm: number;
  dueDate: string;
  kmLeft: number;
  daysLeft: number;
  state: DueState;
  lastDone?: { date: string; mileage: number };
}

function addMonths(iso: string, months: number) {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

/** Next due point per maintenance type: whichever of mileage or time comes first. */
export function computeUpcoming(vehicle: Pick<Vehicle, "id" | "mileage">, records: MaintenanceRecord[], now: string): UpcomingItem[] {
  const items: UpcomingItem[] = [];
  const nowMs = new Date(now).getTime();
  for (const [type, interval] of Object.entries(MAINTENANCE_INTERVALS) as [MaintenanceType, { km: number; months: number; label: string }][]) {
    const last = records
      .filter((r) => r.vehicleId === vehicle.id && r.type === type)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!last) continue;
    const dueKm = last.mileage + interval.km;
    const dueDate = addMonths(last.date, interval.months);
    const kmLeft = dueKm - vehicle.mileage;
    const daysLeft = Math.floor((new Date(dueDate).getTime() - nowMs) / 86_400_000);
    const state: DueState = kmLeft <= 0 || daysLeft <= 0 ? "overdue" : kmLeft <= 1000 || daysLeft <= 30 ? "soon" : "ok";
    items.push({ type, label: interval.label, dueKm, dueDate, kmLeft, daysLeft, state, lastDone: { date: last.date, mileage: last.mileage } });
  }
  const rank: Record<DueState, number> = { overdue: 0, soon: 1, ok: 2 };
  return items.sort((a, b) => rank[a.state] - rank[b.state] || a.kmLeft - b.kmLeft);
}

/* ---------------- Earnings ledger ---------------- */

export interface LedgerTx {
  partnerId: string;
  status: "partially_paid" | "succeeded" | "refunded";
  partnerNet: number;
  payoutId?: string;
}
export interface LedgerPayout {
  id: string;
  status: "pending" | "processing" | "paid" | "failed";
}

export function partnerLedger(partnerId: string, txs: LedgerTx[], payouts: LedgerPayout[]) {
  const mine = txs.filter((t) => t.partnerId === partnerId && t.status === "succeeded");
  const byId = new Map(payouts.map((p) => [p.id, p]));
  let earned = 0, available = 0, inPayout = 0, paidOut = 0, failed = 0;
  for (const t of mine) {
    earned += t.partnerNet;
    const p = t.payoutId ? byId.get(t.payoutId) : undefined;
    if (!p) available += t.partnerNet;
    else if (p.status === "paid") paidOut += t.partnerNet;
    else if (p.status === "failed") failed += t.partnerNet;
    else inPayout += t.partnerNet;
  }
  return { earned: round2(earned), available: round2(available), inPayout: round2(inPayout), paidOut: round2(paidOut), failed: round2(failed) };
}
