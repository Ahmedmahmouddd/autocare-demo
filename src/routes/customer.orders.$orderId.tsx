import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { PaymentSheet } from "@/components/market/PaymentSheet";
import { EmptyState, MethodChips, PartnerTypeBadge, PHOTOS, Price, StarInput, StatusBadge } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateTime, formatMoney, pageHead } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { canReview, depositAmount, evaluatePromo, statusLabel } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/orders/$orderId")({
  head: () => pageHead("تفاصيل الطلب", "قارن العروض، أكّد الاستلام، ادفع داخل التطبيق واترك تقييمًا."),
  component: CustomerOrderDetail,
});

function CustomerOrderDetail() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const order = useMarket((s) => s.orders.find((o) => o.id === orderId));
  const partners = useMarket((s) => s.partners);
  const vehicles = useMarket((s) => s.vehicles);
  const reviews = useMarket((s) => s.reviews);
  const promoCodes = useMarket((s) => s.promoCodes);
  const customerId = useMarket((s) => s.customerId);
  const acceptOffer = useMarket((s) => s.acceptOffer);
  const payDeposit = useMarket((s) => s.payDeposit);
  const payBalance = useMarket((s) => s.payBalance);
  const advance = useMarket((s) => s.advance);
  const submitReview = useMarket((s) => s.submitReview);
  const openThread = useMarket((s) => s.openThread);

  const [shareVehicle, setShareVehicle] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payKind, setPayKind] = useState<"deposit" | "balance">("balance");
  const [promo, setPromo] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const vehicle = vehicles.find((v) => v.id === order?.vehicleId);
  const partner = partners.find((p) => p.id === order?.partnerId);
  const reviewCheck = order ? canReview(order, "customer", reviews) : { ok: false as const, reason: "" };

  const depositDue = order?.paymentPolicy === "deposit" && order.agreedPrice != null
    ? depositAmount(order.agreedPrice, order.depositPercent ?? 0)
    : 0;

  const balanceDue = useMemo(() => {
    if (!order?.agreedPrice) return 0;
    const promoObj = promo ? promoCodes.find((p) => p.code.toUpperCase() === promo.toUpperCase()) : undefined;
    const r = evaluatePromo(promoObj, {
      subtotal: order.agreedPrice,
      customerId,
      categoryId: order.categoryId,
      now: new Date().toISOString(),
    });
    const discount = r.ok ? r.discount : 0;
    const paid = order.customerId ? (order.depositPaid ? depositDue : 0) : 0;
    return Math.max(0, Math.round((order.agreedPrice - discount - paid) * 100) / 100);
  }, [order, promo, promoCodes, customerId, depositDue]);

  if (!order || order.customerId !== customerId) {
    return (
      <div className="p-6">
        <ScreenHeader title="طلب" back />
        <EmptyState title="الطلب غير موجود" body="هذا الطلب غير مرتبط بحسابك." />
      </div>
    );
  }

  const onAccept = (offerId: string) => {
    const res = acceptOffer(orderId, offerId, shareVehicle);
    if (res.ok) {
      toast.success("تم قبول العرض");
      const offer = order.offers.find((o) => o.id === offerId);
      if (offer?.paymentPolicy === "deposit") {
        setPayKind("deposit");
        setPayOpen(true);
      }
    } else toast.error(res.reason);
  };

  const onConfirm = () => {
    const res = advance(orderId, "confirm_delivery", "customer");
    if (res.ok) {
      toast.success("تم تأكيد الاستلام — تابع للدفع");
      setPayKind("balance");
      setPayOpen(true);
    } else toast.error(res.reason);
  };

  const onPay = (succeed: boolean) => {
    if (payKind === "deposit") {
      const res = payDeposit(orderId, succeed);
      if (res.ok) {
        toast.success("تم دفع العربون");
        setPayOpen(false);
      } else toast.error(res.reason);
      return res.ok;
    }
    const res = payBalance(orderId, succeed, promo.trim() || undefined);
    if (res.ok) {
      toast.success("تم الدفع — اكتمل الطلب");
      setPayOpen(false);
    } else toast.error(res.reason);
    return res.ok;
  };

  const onReview = () => {
    if (!reviewCheck.ok) {
      toast.error(reviewCheck.reason);
      return;
    }
    submitReview(orderId, "customer", rating, comment.trim());
    toast.success("شكرًا على تقييمك");
  };

  const payAmount = payKind === "deposit" ? depositDue : balanceDue;
  const payLines =
    payKind === "deposit"
      ? [
          { label: "المبلغ المتفق عليه", value: formatMoney(order.agreedPrice ?? 0) },
          { label: `عربون (${order.depositPercent ?? 0}%)`, value: formatMoney(depositDue), strong: true },
        ]
      : [
          { label: "المبلغ المتفق عليه", value: formatMoney(order.agreedPrice ?? 0) },
          ...(order.depositPaid ? [{ label: "العربون المدفوع", value: `− ${formatMoney(depositDue)}` }] : []),
          ...(promo ? [{ label: "رمز الخصم", value: promo.toUpperCase() }] : []),
          { label: "المستحق الآن", value: formatMoney(payAmount), strong: true },
        ];

  return (
    <div className="pb-8">
      <ScreenHeader title={order.title} sub={`#${order.id}`} back />
      <div className="space-y-4 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <MethodChips methods={[order.method]} />
        </div>

        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <p className="text-sm text-muted-foreground">{order.description || "لا يوجد وصف"}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{order.locationLabel}</span>
            {vehicle && <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>}
            {order.mediaCount > 0 && <span>{order.mediaCount} {order.mediaCount === 1 ? "صورة" : "صور"}</span>}
          </div>
        </div>

        {order.status === "offers_received" && (
          <section className="space-y-2">
            <div className="eyebrow">قارن العروض ({order.offers.length})</div>
            {order.offers.map((offer) => {
              const p = partners.find((x) => x.id === offer.partnerId);
              if (!p) return null;
              const active = selectedOffer === offer.id;
              return (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setSelectedOffer(offer.id)}
                  className={cn("w-full rounded-lg border p-3 text-left shadow-card", active ? "border-primary bg-accent/30" : "border-border bg-card")}
                >
                  <div className="flex gap-3">
                    <img src={PHOTOS[p.photo]} alt="" className="size-12 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">{p.name}</div>
                          <PartnerTypeBadge type={p.type} />
                        </div>
                        <Price amount={offer.price} type={offer.priceType} size="sm" className="text-right" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{offer.note}</p>
                      <div className="mt-1 figure text-[11px] text-muted-foreground">{offer.etaLabel} · {offer.paymentPolicy === "deposit" ? `عربون ${offer.depositPercent}%` : "الدفع بعد الإنجاز"}</div>
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <Checkbox id="share" checked={shareVehicle} onCheckedChange={(v) => setShareVehicle(v === true)} />
              <Label htmlFor="share" className="text-xs font-normal">مشاركة تفاصيل السيارة مع الشريك المختار</Label>
            </div>
            <Button
              variant="signal"
              size="xl"
              disabled={!selectedOffer}
              onClick={() => selectedOffer && onAccept(selectedOffer)}
            >
              قبول العرض المختار
            </Button>
          </section>
        )}

        {partner && order.status !== "offers_received" && order.status !== "pending" && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <img src={PHOTOS[partner.photo]} alt="" className="size-12 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{partner.name}</div>
              {order.agreedPrice != null && <div className="figure text-xs text-muted-foreground">{formatMoney(order.agreedPrice)}</div>}
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="محادثة"
              onClick={() => {
                const id = openThread(customerId, partner.id);
                if (!id) {
                  toastDemoOnly();
                  return;
                }
                void navigate({ to: "/customer/chats/$threadId", params: { threadId: id } });
              }}
            >
              <MessageCircle />
            </Button>
          </div>
        )}

        {order.status === "accepted" && order.paymentPolicy === "deposit" && !order.depositPaid && (
          <Button variant="signal" size="xl" onClick={() => { setPayKind("deposit"); setPayOpen(true); }}>
            ادفع العربون {formatMoney(depositDue)}
          </Button>
        )}

        {order.status === "awaiting_confirmation" && (
          <div className="space-y-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4" /> الشريك أنهى العمل</div>
            <p className="text-xs text-muted-foreground">أكّد استلام السيارة/الخدمة. التأكيد يفتح الدفع ولا يكمل الطلب بحد ذاته.</p>
            <Button variant="signal" size="xl" onClick={onConfirm}>تأكيد الاستلام</Button>
          </div>
        )}

        {order.status === "awaiting_payment" && (
          <div className="space-y-3 rounded-lg border border-border bg-card p-3 shadow-card">
            <div className="text-sm font-semibold">ادفع لإكمال الطلب</div>
            <div className="space-y-1.5">
              <Label htmlFor="promo">رمز الخصم</Label>
              <Input id="promo" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="مثال: WELCOME15" />
            </div>
            <Button variant="signal" size="xl" onClick={() => { setPayKind("balance"); setPayOpen(true); }}>
              ادفع {formatMoney(balanceDue)}
            </Button>
          </div>
        )}

        {order.status === "completed" && reviewCheck.ok && (
          <div className="space-y-3 rounded-lg border border-border bg-card p-3 shadow-card">
            <div className="eyebrow">قيّم {partner?.name ?? "الشريك"}</div>
            <StarInput value={rating} onChange={setRating} />
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="تعليق اختياري" />
            <Button onClick={onReview}>إرسال التقييم</Button>
          </div>
        )}

        {order.status === "completed" && !reviewCheck.ok && (
          <p className="text-center text-xs text-muted-foreground">{reviewCheck.reason}</p>
        )}

        <section className="rounded-lg border border-border bg-card p-3 shadow-card">
          <div className="eyebrow">الجدول الزمني</div>
          <ol className="mt-2 space-y-2">
            {order.timeline.map((e, i) => (
              <li key={i} className="flex justify-between gap-2 text-xs">
                <span className="font-medium">{statusLabel(e.status)}</span>
                <span className="figure text-muted-foreground">{formatDateTime(e.at)}</span>
              </li>
            ))}
          </ol>
        </section>

        {(order.status === "pending" || order.status === "offers_received" || order.status === "accepted") && (
          <Button
            variant="outline"
            className="w-full text-destructive"
            onClick={() => {
              const res = advance(orderId, "cancel", "customer");
              if (res.ok) toast.success("تم إلغاء الطلب");
              else toast.error(res.reason);
            }}
          >
            إلغاء الطلب
          </Button>
        )}

        <Button asChild variant="ghost" className="w-full">
          <Link to="/customer/orders">كل الطلبات</Link>
        </Button>
      </div>

      <PaymentSheet
        open={payOpen}
        onOpenChange={setPayOpen}
        amount={payAmount}
        title={payKind === "deposit" ? "دفع العربون" : "دفع الخدمة"}
        lines={payLines}
        onPay={onPay}
      />
    </div>
  );
}
