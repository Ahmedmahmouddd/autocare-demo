import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PartnerStatusBadge, PartnerTypeBadge, PHOTOS } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { pageHead, formatDate } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import type { PartnerStatus } from "@/lib/market/types";

const STATUS_TOAST: Record<PartnerStatus, string> = {
  approved: "معتمد",
  pending: "معلق",
  rejected: "مرفوض",
  suspended: "موقوف",
  deactivated: "معطّل",
};

export const Route = createFileRoute("/admin/partners")({
  head: () => pageHead("الشركاء", "اعتمد أو ارفض أو أوقف شركاء السوق."),
  component: AdminPartners,
});

function AdminPartners() {
  const partners = useMarket((s) => s.partners);
  const setPartnerStatus = useMarket((s) => s.setPartnerStatus);

  const setStatus = (id: string, status: PartnerStatus) => {
    setPartnerStatus(id, status);
    toast.success(`تم تعليم الشريك: ${STATUS_TOAST[status]}`);
  };

  return (
    <div>
      <div className="eyebrow">الشبكة</div>
      <h1 className="mt-1 text-3xl font-extrabold">الشركاء</h1>
      <div className="mt-6 space-y-3">
        {[...partners].sort((a, b) => b.joinedAt.localeCompare(a.joinedAt)).map((p) => (
          <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:flex-row sm:items-center">
            <img src={PHOTOS[p.photo]} alt="" className="size-16 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">{p.name}</span>
                <PartnerTypeBadge type={p.type} />
                <PartnerStatusBadge status={p.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.ownerName} · {p.area}</p>
              <p className="figure mt-1 text-xs text-muted-foreground">انضم {formatDate(p.joinedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => setStatus(p.id, "approved")}>
                    اعتماد
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "rejected")}>
                    رفض
                  </Button>
                </>
              )}
              {p.status === "approved" && (
                <Button size="sm" variant="destructive" onClick={() => setStatus(p.id, "suspended")}>
                  إيقاف
                </Button>
              )}
              {p.status === "suspended" && (
                <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "approved")}>
                  إعادة التفعيل
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}