import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import type { DiscountFunding } from "@/lib/market/types";

export const Route = createFileRoute("/admin/commission")({
  head: () => pageHead("العمولة", "اضبط نسب عمولة المنصة للورش والمستقلين."),
  component: AdminCommission,
});

function AdminCommission() {
  const commission = useMarket((s) => s.commission);
  const updateCommission = useMarket((s) => s.updateCommission);

  const [freelancerRate, setFreelancerRate] = useState(String(commission.freelancerRate));
  const [garageRate, setGarageRate] = useState(String(commission.garageRate));
  const [discountFundedBy, setDiscountFundedBy] = useState<DiscountFunding>(commission.discountFundedBy);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fr = parseFloat(freelancerRate);
    const gr = parseFloat(garageRate);
    if (!Number.isFinite(fr) || !Number.isFinite(gr)) {
      toast.error("أدخل نسبًا صحيحة.");
      return;
    }
    updateCommission({ freelancerRate: fr, garageRate: gr, discountFundedBy });
    toast.success("تم تحديث العمولة — تُسجَّل للطلبات الجديدة.");
  };

  return (
    <div className="max-w-lg">
      <div className="eyebrow">الإيرادات</div>
      <h1 className="mt-1 text-3xl font-extrabold">العمولة</h1>
      <p className="mt-1 text-sm text-muted-foreground">التغييرات تنطبق على المعاملات الجديدة؛ الطلبات السابقة تحتفظ بنسبها المسجّلة.</p>

      <form onSubmit={onSave} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="fr">نسبة المستقل %</Label>
            <Input id="fr" value={freelancerRate} onChange={(e) => setFreelancerRate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="gr">نسبة الورشة %</Label>
            <Input id="gr" value={garageRate} onChange={(e) => setGarageRate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>تحمّل خصم الرمز على</Label>
          <Select value={discountFundedBy} onValueChange={(v) => setDiscountFundedBy(v as DiscountFunding)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="platform">المنصة</SelectItem>
              <SelectItem value="partner">الشريك</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">حفظ العمولة</Button>
      </form>

      <section className="mt-8">
        <div className="eyebrow">السجل</div>
        <ul className="mt-2 space-y-2">
          {[...commission.history].reverse().map((h, i) => (
            <li key={i} className="rounded-lg border border-border px-3 py-2 text-sm">
              <span className="figure text-muted-foreground">{formatDateTime(h.at)}</span>
              <span className="ml-2">
                مستقل {h.freelancerRate}% · ورشة {h.garageRate}% · خصوم {h.discountFundedBy === "platform" ? "المنصة" : "الشريك"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}