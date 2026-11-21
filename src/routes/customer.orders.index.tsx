import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, ReceiptText } from "lucide-react";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { EmptyState } from "@/components/market/bits";
import { OrderRow } from "@/components/market/OrderRow";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pageHead } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/orders/")({
  head: () => pageHead("طلباتي", "تابع طلباتك وعروضك على AutoCare."),
  component: CustomerOrders,
});

const OPEN = ["pending", "offers_received", "accepted", "in_progress", "awaiting_confirmation", "awaiting_payment", "disputed"];

function CustomerOrders() {
  const orders = useMarket((s) => s.orders);
  const partners = useMarket((s) => s.partners);
  const vehicles = useMarket((s) => s.vehicles);
  const customerId = useMarket((s) => s.customerId);
  const [tab, setTab] = useState<"open" | "past">("open");
  const list = useMemo(
    () => orders.filter((o) => o.customerId === customerId && (tab === "open" ? OPEN.includes(o.status) : !OPEN.includes(o.status))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, customerId, tab],
  );
  return (
    <div className="pb-6">
      <ScreenHeader
        title="الطلبات"
        right={
          <Button size="sm" onClick={() => toastDemoOnly()}>
            <Plus /> جديد
          </Button>
        }
      />
      <div className="px-4 pt-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="past">سابقة</TabsTrigger>
            <TabsTrigger value="open">مفتوحة</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-3 space-y-2">
          {list.map((o) => {
            const v = vehicles.find((x) => x.id === o.vehicleId);
            const p = partners.find((x) => x.id === o.partnerId);
            return <OrderRow key={o.id} order={o} to="/customer/orders/$orderId" params={{ orderId: o.id }} subtitle={`${v ? `${v.make} ${v.model}` : ""}${p ? ` · ${p.name}` : ""}`} />;
          })}
          {!list.length && <EmptyState icon={ReceiptText} title={tab === "open" ? "لا طلبات مفتوحة" : "لا طلبات سابقة"} body="اطلب خدمة وسيرسل لك الشركاء القريبون عروضًا." />}
        </div>
      </div>
    </div>
  );
}
