import { createFileRoute } from "@tanstack/react-router";
import { pageHead, formatDate } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import { Initials } from "@/components/market/bits";

export const Route = createFileRoute("/admin/customers")({
  head: () => pageHead("العملاء", "مالكو السيارات المسجلون على AutoCare."),
  component: AdminCustomers,
});

function AdminCustomers() {
  const customers = useMarket((s) => s.customers);
  const vehicles = useMarket((s) => s.vehicles);
  const orders = useMarket((s) => s.orders);

  return (
    <div>
      <div className="eyebrow">مالكو السيارات</div>
      <h1 className="mt-1 text-3xl font-extrabold">العملاء</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">العميل</th>
              <th className="px-3 py-2 font-medium">التواصل</th>
              <th className="px-3 py-2 font-medium">السيارات</th>
              <th className="px-3 py-2 font-medium">الطلبات</th>
              <th className="px-3 py-2 font-medium">تاريخ الانضمام</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const vc = vehicles.filter((v) => v.customerId === c.id).length;
              const oc = orders.filter((o) => o.customerId === c.id).length;
              return (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2">
                    <CustomerCell name={c.name} />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {c.phone}
                    <br />
                    <span className="text-xs">{c.email}</span>
                  </td>
                  <td className="figure px-3 py-2">{vc}</td>
                  <td className="figure px-3 py-2">{oc}</td>
                  <td className="figure px-3 py-2 text-muted-foreground">{formatDate(c.joinedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerCell({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <Initials name={name} className="size-8 text-xs" />
      <span className="font-medium">{name}</span>
    </div>
  );
}