import { createFileRoute, Link } from "@tanstack/react-router";
import { formatMoney, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import { statusLabel } from "@/lib/market/rules";

export const Route = createFileRoute("/admin/")({
  head: () => pageHead("لوحة التحكم", "نظرة على صحة السوق."),
  component: AdminDashboard,
});

function AdminDashboard() {
  const partners = useMarket((s) => s.partners);
  const customers = useMarket((s) => s.customers);
  const orders = useMarket((s) => s.orders);
  const transactions = useMarket((s) => s.transactions);
  const payouts = useMarket((s) => s.payouts);
  const reviews = useMarket((s) => s.reviews);

  const pendingPartners = partners.filter((p) => p.status === "pending").length;
  const openOrders = orders.filter((o) => !["completed", "cancelled", "refunded", "expired", "rejected"].includes(o.status)).length;
  const gmv = transactions.filter((t) => t.status === "succeeded").reduce((a, t) => a + t.customerPaid, 0);
  const platformNet = transactions.filter((t) => t.status === "succeeded").reduce((a, t) => a + (t.customerPaid - t.partnerNet), 0);
  const processingPayouts = payouts.filter((p) => p.status === "processing").length;
  const flaggedReviews = reviews.filter((r) => r.reported && !r.hidden).length;

  const stats = [
    [pendingPartners, "شركاء بانتظار الاعتماد", "/admin/partners"],
    [customers.length, "العملاء", "/admin/customers"],
    [openOrders, "طلبات مفتوحة", "/admin/orders"],
    [formatMoney(gmv), "إجمالي المدفوع", "/admin/transactions"],
    [formatMoney(platformNet), "صافي المنصة", "/admin/commission"],
    [processingPayouts, "تحويلات قيد المعالجة", "/admin/payouts"],
    [flaggedReviews, "تقييمات للمراجعة", "/admin/reviews"],
  ] as const;

  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div>
      <div className="eyebrow">العمليات</div>
      <h1 className="mt-1 text-3xl font-extrabold">الرئيسية</h1>
      <p className="mt-1 text-sm text-muted-foreground">بيانات العرض المشتركة مع تطبيقي العميل والشريك.</p>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([value, label, to]) => (
          <Link key={label} to={to} className="rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40">
            <dt className="eyebrow">{label}</dt>
            <dd className="figure mt-2 text-2xl font-bold">{value}</dd>
          </Link>
        ))}
      </dl>

      <section className="mt-10">
        <div className="eyebrow">أحدث الطلبات</div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">الطلب</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2 font-medium">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium">{o.title}</td>
                  <td className="px-3 py-2 text-muted-foreground">{statusLabel(o.status)}</td>
                  <td className="figure px-3 py-2 text-muted-foreground">{o.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}