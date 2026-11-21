import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Inbox } from "lucide-react";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { EmptyState } from "@/components/market/bits";
import { OrderRow } from "@/components/market/OrderRow";
import { pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/partner/requests/")({
  head: () => pageHead("الطلبات الواردة", "طلبات العملاء بانتظار عرضك."),
  component: PartnerRequests,
});

function PartnerRequests() {
  const orders = useMarket((s) => s.orders);
  const partnerId = useMarket((s) => s.activePartnerId);
  const customers = useMarket((s) => s.customers);
  const vehicles = useMarket((s) => s.vehicles);

  const list = useMemo(
    () =>
      orders
        .filter(
          (o) => (o.status === "pending" || o.status === "offers_received") && !o.declinedBy.includes(partnerId) && !o.partnerId,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, partnerId],
  );

  return (
    <div className="pb-6">
      <ScreenHeader title="الطلبات" sub="أرسل عرضًا أو ارفض" />
      <div className="space-y-2 px-4 pt-3">
        {list.map((o) => {
          const customer = customers.find((c) => c.id === o.customerId);
          const vehicle = vehicles.find((v) => v.id === o.vehicleId);
          const mine = o.offers.find((x) => x.partnerId === partnerId);
          const subtitle = `${customer?.name ?? "عميل"}${vehicle ? ` · ${vehicle.make} ${vehicle.model}` : ""}${mine ? " · تم إرسال العرض" : ""}`;
          return <OrderRow key={o.id} order={o} to="/partner/requests/$orderId" params={{ orderId: o.id }} subtitle={subtitle} />;
        })}
        {!list.length && <EmptyState icon={Inbox} title="لا طلبات مفتوحة" body="تظهر هنا طلبات العملاء الجديدة بعد إرسالهم لطلب." />}
      </div>
    </div>
  );
}