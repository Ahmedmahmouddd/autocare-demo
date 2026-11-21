import { createFileRoute } from "@tanstack/react-router";
import { StatusBadge } from "@/components/market/bits";
import { formatDateTime, formatMoney, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/admin/orders")({
  head: () => pageHead("الطلبات", "كل طلبات السوق وحالاتها."),
  component: AdminOrders,
});

function AdminOrders() {
  const orders = useMarket((s) => s.orders);
  const partners = useMarket((s) => s.partners);
  const customers = useMarket((s) => s.customers);

  const list = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="eyebrow">التنفيذ</div>
      <h1 className="mt-1 text-3xl font-extrabold">الطلبات</h1>
      <p className="mt-1 text-sm text-muted-foreground">{list.length} طلب في بيانات العرض</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">المعرّف</th>
              <th className="px-3 py-2 font-medium">العنوان</th>
              <th className="px-3 py-2 font-medium">العميل</th>
              <th className="px-3 py-2 font-medium">الشريك</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium">القيمة</th>
              <th className="px-3 py-2 font-medium">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => {
              const customer = customers.find((c) => c.id === o.customerId);
              const partner = partners.find((p) => p.id === o.partnerId);
              return (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="figure px-3 py-2 text-muted-foreground">{o.id}</td>
                  <td className="px-3 py-2 font-medium">{o.title}</td>
                  <td className="px-3 py-2 text-muted-foreground">{customer?.name ?? "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{partner?.name ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="figure px-3 py-2">{o.agreedPrice != null ? formatMoney(o.agreedPrice) : "—"}</td>
                  <td className="figure px-3 py-2 text-muted-foreground">{formatDateTime(o.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}