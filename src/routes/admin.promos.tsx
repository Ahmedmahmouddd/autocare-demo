import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { formatDate, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/promos")({
  head: () => pageHead("أكواد الخصم", "تفعيل أو إيقاف رموز الخصم."),
  component: AdminPromos,
});

function AdminPromos() {
  const promoCodes = useMarket((s) => s.promoCodes);
  const togglePromo = useMarket((s) => s.togglePromo);

  const toggle = (id: string) => {
    togglePromo(id);
    const p = promoCodes.find((x) => x.id === id);
    toast.success(p?.active ? "تم إيقاف الرمز" : "تم تفعيل الرمز");
  };

  return (
    <div>
      <div className="eyebrow">النمو</div>
      <h1 className="mt-1 text-3xl font-extrabold">أكواد الخصم</h1>
      <div className="mt-6 space-y-3">
        {promoCodes.map((p) => (
          <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold">{p.code}</span>
                <Badge variant={p.active ? "success" : "muted"}>{p.active ? "نشط" : "متوقف"}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.discountType === "percentage" ? `خصم ${p.value}%` : `خصم ${p.value} ر.س`} · حد أدنى {p.minOrder} · استُخدم {p.usedCount}/{p.usageLimit}
              </p>
              <p className="figure mt-1 text-xs text-muted-foreground">
                {formatDate(p.startsAt)} – {formatDate(p.expiresAt)}
              </p>
            </div>
            <Switch checked={p.active} onCheckedChange={() => toggle(p.id)} aria-label={`تبديل ${p.code}`} />
          </div>
        ))}
      </div>
    </div>
  );
}