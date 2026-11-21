import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { MethodChips, Plate, StatusBadge } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import type { DeliveryMethod, PaymentPolicy, PriceType } from "@/lib/market/types";

export const Route = createFileRoute("/partner/requests/$orderId")({
  head: () => pageHead("تفاصيل الطلب", "راجع العمل وأرسل عرضك."),
  component: PartnerRequestDetail,
});

function PartnerRequestDetail() {
  const { orderId } = Route.useParams();
  const partnerId = useMarket((s) => s.activePartnerId);
  const partner = useMarket((s) => s.partners.find((p) => p.id === partnerId));
  const order = useMarket((s) => s.orders.find((o) => o.id === orderId));
  const customers = useMarket((s) => s.customers);
  const vehicles = useMarket((s) => s.vehicles);
  const categories = useMarket((s) => s.categories);
  const sendOffer = useMarket((s) => s.sendOffer);
  const declineRequest = useMarket((s) => s.declineRequest);

  const existing = order?.offers.find((x) => x.partnerId === partnerId);
  const [price, setPrice] = useState(existing?.price?.toString() ?? "350");
  const [priceType, setPriceType] = useState<PriceType>(existing?.priceType ?? "fixed");
  const [etaLabel, setEtaLabel] = useState(existing?.etaLabel ?? "Today");
  const [note, setNote] = useState(existing?.note ?? "");
  const [method, setMethod] = useState<DeliveryMethod>(existing?.method ?? order?.method ?? "garage");
  const [paymentPolicy, setPaymentPolicy] = useState<PaymentPolicy>(existing?.paymentPolicy ?? partner?.paymentPolicy ?? "deposit");
  const [depositPercent, setDepositPercent] = useState(String(existing?.depositPercent ?? partner?.depositPercent ?? 30));

  if (!order) {
    return (
      <div className="p-4">
        <ScreenHeader title="طلب" back />
        <p className="mt-4 text-sm text-muted-foreground">الطلب غير موجود.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/partner/requests">العودة للطلبات</Link>
        </Button>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === order.customerId);
  const vehicle = vehicles.find((v) => v.id === order.vehicleId);
  const category = categories.find((c) => c.id === order.categoryId);
  const declined = order.declinedBy.includes(partnerId);

  const onQuote = () => {
    const num = parseFloat(price);
    if (!Number.isFinite(num) || num <= 0) {
      toast.error("أدخل سعرًا صحيحًا.");
      return;
    }
    const res = sendOffer(orderId, partnerId, {
      price: num,
      priceType,
      etaLabel: etaLabel.trim() || "قريبًا",
      note: note.trim(),
      method,
      paymentPolicy,
      depositPercent: parseFloat(depositPercent) || 0,
    });
    if (res.ok) toast.success(existing ? "تم تحديث العرض" : "تم إرسال العرض");
    else toast.error(res.reason);
  };

  const onDecline = () => {
    declineRequest(orderId, partnerId);
    toast.success("تم رفض الطلب");
  };

  return (
    <div className="pb-8">
      <ScreenHeader title={order.title} sub={formatDateTime(order.createdAt)} back />
      <div className="space-y-4 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          {order.urgent && <span className="text-xs font-medium text-destructive">عاجل</span>}
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-card">
          <div className="eyebrow">العميل والسيارة</div>
          <div className="mt-1 text-sm font-semibold">{customer?.name}</div>
          {vehicle && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
              <Plate value={vehicle.plate} />
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">{order.locationLabel}</div>
          <div className="mt-2">
            <MethodChips methods={[order.method]} />
          </div>
          {category && <div className="mt-2 text-xs text-muted-foreground">التصنيف: {category.name}</div>}
          {order.description && <p className="mt-2 text-sm">{order.description}</p>}
        </div>

        {declined ? (
          <p className="text-sm text-muted-foreground">رفضت هذا الطلب.</p>
        ) : (
          <div className="space-y-3 rounded-lg border border-border bg-card p-3 shadow-card">
            <div className="eyebrow">عرضك</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="price">السعر (ر.س)</Label>
                <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
              </div>
              <div className="space-y-1">
                <Label>نوع السعر</Label>
                <Select value={priceType} onValueChange={(v) => setPriceType(v as PriceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">ثابت</SelectItem>
                    <SelectItem value="starting">يبدأ من</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="eta">مدة التنفيذ</Label>
              <Input id="eta" value={etaLabel} onChange={(e) => setEtaLabel(e.target.value)} placeholder="نفس اليوم" />
            </div>
            <div className="space-y-1">
              <Label>طريقة الخدمة</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as DeliveryMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="garage">في الورشة</SelectItem>
                  <SelectItem value="mobile">يصل للعميل</SelectItem>
                  <SelectItem value="roadside">مساعدة على الطريق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>الدفع</Label>
                <Select value={paymentPolicy} onValueChange={(v) => setPaymentPolicy(v as PaymentPolicy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">عربون + المتبقي</SelectItem>
                    <SelectItem value="after_completion">بعد الإنجاز</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dep">نسبة العربون %</Label>
                <Input id="dep" value={depositPercent} onChange={(e) => setDepositPercent(e.target.value)} disabled={paymentPolicy !== "deposit"} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="note">ملاحظة للعميل</Label>
              <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="القطع المشمولة، تنبيهات الفحص…" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={onQuote}>
                {existing ? "تحديث العرض" : "إرسال العرض"}
              </Button>
              <Button type="button" variant="outline" onClick={onDecline}>
                رفض
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}