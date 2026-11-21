import { describe, expect, it } from "vitest";
import {
  canReview,
  checkTransition,
  computeSettlement,
  computeUpcoming,
  evaluatePromo,
  partnerLedger,
} from "./rules";
import type { PromoCode } from "./types";

const promo = (p: Partial<PromoCode>): PromoCode => ({
  id: "x",
  code: "X",
  discountType: "percentage",
  value: 15,
  startsAt: "2026-01-01T00:00:00Z",
  expiresAt: "2026-12-31T00:00:00Z",
  usageLimit: 100,
  usedCount: 0,
  minOrder: 0,
  active: true,
  ...p,
});
const ctx = { subtotal: 1000, customerId: "c1", categoryId: "brakes", now: "2026-11-20T00:00:00Z" };

describe("commission settlement", () => {
  it("platform-funded discount: commission on full gross, partner keeps gross minus commission", () => {
    const s = computeSettlement({ gross: 1000, discount: 150, commissionRate: 12, fundedBy: "platform" });
    expect(s.commissionAmount).toBe(120);
    expect(s.partnerNet).toBe(880);
    expect(s.customerPaid).toBe(850);
  });
  it("partner-funded discount: commission on the discounted amount", () => {
    const s = computeSettlement({ gross: 1000, discount: 150, commissionRate: 12, fundedBy: "partner" });
    expect(s.commissionAmount).toBe(102);
    expect(s.partnerNet).toBe(748);
    expect(s.customerPaid).toBe(850);
  });
});

describe("promo codes", () => {
  it("caps a percentage discount at the maximum discount", () => {
    expect(evaluatePromo(promo({ value: 50, maxDiscount: 200 }), ctx)).toEqual({ ok: true, discount: 200 });
  });
  it("rejects orders below the minimum order value", () => {
    expect(evaluatePromo(promo({ minOrder: 1500 }), ctx).ok).toBe(false);
  });
  it("rejects expired codes and codes past their usage limit", () => {
    expect(evaluatePromo(promo({ expiresAt: "2026-10-01T00:00:00Z" }), ctx).ok).toBe(false);
    expect(evaluatePromo(promo({ usageLimit: 5, usedCount: 5 }), ctx).ok).toBe(false);
  });
  it("respects selected customers and selected services", () => {
    expect(evaluatePromo(promo({ customerIds: ["c2"] }), ctx).ok).toBe(false);
    expect(evaluatePromo(promo({ categoryIds: ["oil"] }), ctx).ok).toBe(false);
  });
  it("a fixed discount never exceeds the order amount", () => {
    expect(evaluatePromo(promo({ discountType: "fixed", value: 5000 }), ctx)).toEqual({ ok: true, discount: 1000 });
  });
});

describe("order lifecycle", () => {
  it("customer confirmation moves to awaiting payment, not completed", () => {
    const r = checkTransition({ status: "awaiting_confirmation" }, "confirm_delivery", "customer");
    expect(r).toEqual({ ok: true, to: "awaiting_payment" });
  });
  it("only a successful payment completes the order", () => {
    expect(checkTransition({ status: "awaiting_payment" }, "payment_succeeded", "system")).toEqual({ ok: true, to: "completed" });
    expect(checkTransition({ status: "awaiting_confirmation" }, "payment_succeeded", "system").ok).toBe(false);
  });
  it("partner cannot start a deposit order before the deposit is paid", () => {
    expect(checkTransition({ status: "accepted", paymentPolicy: "deposit", depositPaid: false }, "start_work", "partner").ok).toBe(false);
    expect(checkTransition({ status: "accepted", paymentPolicy: "deposit", depositPaid: true }, "start_work", "partner").ok).toBe(true);
  });
  it("partners cannot confirm delivery on the customer's behalf", () => {
    expect(checkTransition({ status: "awaiting_confirmation" }, "confirm_delivery", "partner").ok).toBe(false);
  });
});

describe("mutual reviews", () => {
  it("no reviews before the order is completed and paid", () => {
    expect(canReview({ id: "o1", status: "awaiting_payment" }, "customer", []).ok).toBe(false);
  });
  it("each party reviews at most once per order", () => {
    const reviews = [{ orderId: "o1", reviewerRole: "customer" as const }];
    expect(canReview({ id: "o1", status: "completed" }, "customer", reviews).ok).toBe(false);
    expect(canReview({ id: "o1", status: "completed" }, "partner", reviews).ok).toBe(true);
  });
});

describe("maintenance schedule", () => {
  it("oil change is due 5,000 km after the last one", () => {
    const items = computeUpcoming(
      { id: "v1", mileage: 68000 },
      [{ id: "m", vehicleId: "v1", type: "oil", title: "Oil", date: "2026-10-01T00:00:00Z", mileage: 64000, source: "order" }],
      "2026-11-20T00:00:00Z",
    );
    expect(items[0].dueKm).toBe(69000);
    expect(items[0].state).toBe("soon");
  });
});

describe("partner earnings ledger", () => {
  it("separates available, in-payout, paid and failed amounts", () => {
    const l = partnerLedger(
      "p1",
      [
        { partnerId: "p1", status: "succeeded", partnerNet: 100 },
        { partnerId: "p1", status: "succeeded", partnerNet: 200, payoutId: "a" },
        { partnerId: "p1", status: "succeeded", partnerNet: 300, payoutId: "b" },
        { partnerId: "p1", status: "partially_paid", partnerNet: 999 },
      ],
      [
        { id: "a", status: "paid" },
        { id: "b", status: "failed" },
      ],
    );
    expect(l).toEqual({ earned: 600, available: 100, inPayout: 0, paidOut: 200, failed: 300 });
  });
});
