import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Stars } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { formatDateTime, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/reviews")({
  head: () => pageHead("التقييمات", "إدارة التقييمات المبلّغ عنها والظهور."),
  component: AdminReviews,
});

function AdminReviews() {
  const reviews = useMarket((s) => s.reviews);
  const orders = useMarket((s) => s.orders);
  const partners = useMarket((s) => s.partners);
  const customers = useMarket((s) => s.customers);
  const moderateReview = useMarket((s) => s.moderateReview);

  const hide = (id: string, hidden: boolean) => {
    moderateReview(id, hidden);
    toast.success(hidden ? "تم إخفاء التقييم" : "تمت استعادة التقييم");
  };

  const list = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="eyebrow">الثقة والأمان</div>
      <h1 className="mt-1 text-3xl font-extrabold">التقييمات</h1>
      <div className="mt-6 space-y-3">
        {list.map((r) => {
          const order = orders.find((o) => o.id === r.orderId);
          const target =
            r.reviewerRole === "customer"
              ? partners.find((p) => p.id === r.targetId)?.name
              : customers.find((c) => c.id === r.targetId)?.name;
          return (
            <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Stars value={r.rating} />
                  <p className="mt-2 text-sm">{r.comment ?? <em className="text-muted-foreground">بدون تعليق</em>}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    تقييم {r.reviewerRole === "customer" ? "عميل" : "شريك"} · الهدف {target} · {order?.title}
                  </p>
                  <p className="figure text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {r.hidden && <Badge variant="muted">مخفي</Badge>}
                  {r.reported && !r.hidden && <Badge variant="danger">مُبلّغ عنه</Badge>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => hide(r.id, !r.hidden)}>
                      {r.hidden ? "إظهار" : "إخفاء"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}