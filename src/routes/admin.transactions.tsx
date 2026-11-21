import { createFileRoute } from "@tanstack/react-router";
import { formatDateTime, formatMoney, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import { Badge } from "@/components/ui/badge";

const TX_STATUS: Record<string, string> = {
  succeeded: "ناجحة",
  partially_paid: "مدفوعة جزئيًا",
  refunded: "مستردة",
};

export const Route = createFileRoute("/admin/transactions")({
  head: () => pageHead("المعاملات", "المدفوعات والعمولة وصافي الشريك."),
  component: AdminTransactions,
});

function AdminTransactions() {
  const transactions = useMarket((s) => s.transactions);
  const orders = useMarket((s) => s.orders);
  const partners = useMarket((s) => s.partners);

  const list = [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="eyebrow">المالية</div>
      <h1 className="mt-1 text-3xl font-extrabold">المعاملات</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">معاملة</th>
              <th className="px-3 py-2 font-medium">طلب</th>
              <th className="px-3 py-2 font-medium">شريك</th>
              <th className="px-3 py-2 font-medium">دفع العميل</th>
              <th className="px-3 py-2 font-medium">العمولة</th>
              <th className="px-3 py-2 font-medium">صافي الشريك</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => {
              const order = orders.find((o) => o.id === t.orderId);
              const partner = partners.find((p) => p.id === t.partnerId);
              return (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="figure px-3 py-2 text-muted-foreground">{t.id}</td>
                  <td className="px-3 py-2">{order?.title ?? t.orderId}</td>
                  <td className="px-3 py-2 text-muted-foreground">{partner?.name}</td>
                  <td className="figure px-3 py-2">{formatMoney(t.customerPaid)}</td>
                  <td className="figure px-3 py-2 text-muted-foreground">
                    {formatMoney(t.commissionAmount)} ({t.commissionRate}%)
                  </td>
                  <td className="figure px-3 py-2 font-medium">{formatMoney(t.partnerNet)}</td>
                  <td className="px-3 py-2">
                    <Badge variant={t.status === "succeeded" ? "success" : "muted"}>
                      {TX_STATUS[t.status] ?? t.status}
                    </Badge>
                  </td>
                  <td className="figure px-3 py-2 text-muted-foreground">{formatDateTime(t.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}