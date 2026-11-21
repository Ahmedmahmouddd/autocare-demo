import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Briefcase } from "lucide-react";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { EmptyState } from "@/components/market/bits";
import { OrderRow } from "@/components/market/OrderRow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pageHead } from "@/lib/brand";
import { ACTIVE_STATUSES } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/partner/orders/")({
  head: () => pageHead("أعمالك", "الطلبات المقبولة والمكتملة لورشتك."),
  component: PartnerOrders,
});

function PartnerOrders() {
  const orders = useMarket((s) => s.orders);
  const partnerId = useMarket((s) => s.activePartnerId);
  const customers = useMarket((s) => s.customers);
  const vehicles = useMarket((s) => s.vehicles);
  const [tab, setTab] = useState<"active" | "past">("active");

  const list = useMemo(
    () =>
      orders
        .filter((o) => o.partnerId === partnerId && (tab === "active" ? ACTIVE_STATUSES.includes(o.status) || o.status === "accepted" : !ACTIVE_STATUSES.includes(o.status) && o.status !== "accepted"))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [orders, partnerId, tab]);

  return (
    <div className="pb-6">
      <ScreenHeader title="الأعمال" sub="نفّذ العمل حتى الإنجاز" />
      <div className="px-4 pt-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">نشطة</TabsTrigger>
            <TabsTrigger value="past">سابقة</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-3 space-y-2">
          {list.map((o) => {
            const customer = customers.find((c) => c.id === o.customerId);
            const vehicle = vehicles.find((v) => v.id === o.vehicleId);
            return (
              <OrderRow
                key={o.id}
                order={o}
                to="/partner/orders/$orderId"
                params={{ orderId: o.id }}
                subtitle={`${customer?.name ?? ""}${vehicle ? ` · ${vehicle.make} ${vehicle.model}` : ""}`}
              />
            );
          })}
          {!list.length && (
            <EmptyState
              icon={Briefcase}
              title={tab === "active" ? "لا أعمال نشطة" : "لا أعمال سابقة"}
              body={tab === "active" ? "اربح طلبًا لتظهر الأعمال هنا." : "المكتملة والملغاة تظهر في السابقة."}
            />
          )}
        </div>
      </div>
    </div>
  );
}