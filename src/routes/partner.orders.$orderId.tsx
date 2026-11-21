import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { MethodChips, Plate, StarInput, StatusBadge } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatMoney, pageHead } from "@/lib/brand";
import { canReview, depositAmount, statusLabel } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/partner/orders/$orderId")({
  head: () => pageHead("تفاصيل العمل", "حدّث الحالة وقيّم العميل."),
  component: PartnerOrderDetail,
});

function PartnerOrderDetail() {
  const { orderId } = Route.useParams();
  const partnerId = useMarket((s) => s.activePartnerId);
  const order = useMarket((s) => s.orders.find((o) => o.id === orderId));
  const reviews = useMarket((s) => s.reviews);
  const customers = useMarket((s) => s.customers);
  const vehicles = useMarket((s) => s.vehicles);
  const advance = useMarket((s) => s.advance);
  const submitReview = useMarket((s) => s.submitReview);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (!order || order.partnerId !== partnerId) {
    return (
      <div className="p-4">
        <ScreenHeader title="عمل" back />
        <p className="mt-4 text-sm text-muted-foreground">العمل غير موجود لهذا الشريك.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/partner/orders">العودة للأعمال</Link>
        </Button>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === order.customerId);
  const vehicle = vehicles.find((v) => v.id === order.vehicleId);
  const reviewCheck = canReview(order, "partner", reviews);
  const deposit =
    order.paymentPolicy === "deposit" && order.agreedPrice != null
      ? depositAmount(order.agreedPrice, order.depositPercent ?? 0)
      : null;

  const act = (action: "start_work" | "mark_done") => {
    const res = advance(orderId, action, "partner");
    if (res.ok) toast.success(action === "start_work" ? "بدأ العمل" : "تم التعليم كمنجز — بانتظار تأكيد العميل");
    else toast.error(res.reason);
  };

  const onReview = () => {
    if (!reviewCheck.ok) {
      toast.error(reviewCheck.reason);
      return;
    }
    submitReview(orderId, "partner", rating, comment.trim());
    toast.success("تم إرسال التقييم");
    setComment("");
  };

  return (
    <div className="pb-8">
      <ScreenHeader title={order.title} sub={`#${order.id}`} back />
      <div className="space-y-4 px-4 pt-4">
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {order.agreedPrice != null && <span className="figure text-sm font-semibold">{formatMoney(order.agreedPrice)}</span>}
        </div>

        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <div className="eyebrow">العميل</div>
          <div className="text-sm font-semibold">{customer?.name}</div>
          {vehicle && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
              <Plate value={vehicle.plate} />
            </div>
          )}
          <div className="mt-2">
            <MethodChips methods={[order.method]} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{order.locationLabel}</p>
          {order.description && <p className="mt-2 text-sm">{order.description}</p>}
          {deposit != null && (
            <p className="mt-2 text-xs text-muted-foreground">
              عربون {formatMoney(deposit)} {order.depositPaid ? "· مدفوع" : "· بانتظار العميل"}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <div className="eyebrow">الجدول الزمني</div>
          <ol className="mt-2 space-y-2">
            {order.timeline.map((e, i) => (
              <li key={i} className="flex justify-between gap-2 text-xs">
                <span className="font-medium">{statusLabel(e.status)}</span>
                <span className="figure text-muted-foreground">{formatDateTime(e.at)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.status === "accepted" && (
            <Button onClick={() => act("start_work")} className="flex-1">
              بدء العمل
            </Button>
          )}
          {order.status === "in_progress" && (
            <Button onClick={() => act("mark_done")} className="flex-1">
              تعليم كمنجز
            </Button>
          )}
          {["awaiting_confirmation", "awaiting_payment", "completed"].includes(order.status) && (
            <p className="text-sm text-muted-foreground">بانتظار تأكيد العميل والدفع.</p>
          )}
        </div>

        {order.status === "completed" && (
          <div className="rounded-lg border border-border bg-card p-3 shadow-card">
            <div className="eyebrow">تقييم العميل</div>
            {reviewCheck.ok ? (
              <>
                <StarInput value={rating} onChange={setRating} />
                <Textarea className="mt-3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="تعليق اختياري" rows={2} />
                <Button className="mt-3 w-full" onClick={onReview}>
                  إرسال التقييم
                </Button>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{reviewCheck.reason}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}