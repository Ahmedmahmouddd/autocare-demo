import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatMoney, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";
import { Badge } from "@/components/ui/badge";
import type { PayoutStatus } from "@/lib/market/types";

const PAYOUT_STATUS: Record<PayoutStatus, string> = {
  paid: "مدفوع",
  failed: "فاشل",
  processing: "قيد المعالجة",
  pending: "معلق",
};

export const Route = createFileRoute("/admin/payouts")({
  head: () => pageHead("التحويلات", "تشغيل تحويلات الشركاء الشهرية وتحديث الحالة."),
  component: AdminPayouts,
});

function AdminPayouts() {
  const payouts = useMarket((s) => s.payouts);
  const partners = useMarket((s) => s.partners);
  const runMonthlyPayouts = useMarket((s) => s.runMonthlyPayouts);
  const setPayoutStatus = useMarket((s) => s.setPayoutStatus);
  const [failReason, setFailReason] = useState<Record<string, string>>({});

  const onRun = () => {
    const n = runMonthlyPayouts();
    toast.success(n ? `تم إنشاء ${n} دفعة تحويل` : "لا معاملات غير مدفوعة للتحويل");
  };

  const setStatus = (id: string, status: PayoutStatus) => {
    setPayoutStatus(id, status, status === "failed" ? failReason[id] || "رفض البنك التحويل" : undefined);
    toast.success(`تم تعليم التحويل: ${PAYOUT_STATUS[status]}`);
  };

  const list = [...payouts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">الخزينة</div>
          <h1 className="mt-1 text-3xl font-extrabold">التحويلات</h1>
        </div>
        <Button onClick={onRun}>تشغيل التحويلات الشهرية</Button>
      </div>

      <div className="mt-6 space-y-3">
        {list.map((p) => {
          const partner = partners.find((x) => x.id === p.partnerId);
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{partner?.name ?? p.partnerId}</div>
                  <div className="text-sm text-muted-foreground">
                    {p.period} · {p.method} · {p.transactionIds.length} معاملة
                  </div>
                  <div className="figure mt-1 text-xs text-muted-foreground">{formatDate(p.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="figure text-xl font-bold">{formatMoney(p.amount)}</div>
                  <Badge variant={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "warning"} className="mt-1">
                    {PAYOUT_STATUS[p.status]}
                  </Badge>
                </div>
              </div>
              {p.status === "processing" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setStatus(p.id, "paid")}>
                    تعليم مدفوع
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "failed")}>
                    تعليم فاشل
                  </Button>
                  <Input
                    className="max-w-xs"
                    placeholder="سبب الفشل"
                    value={failReason[p.id] ?? ""}
                    onChange={(e) => setFailReason((s) => ({ ...s, [p.id]: e.target.value }))}
                  />
                </div>
              )}
              {p.failureReason && <p className="mt-2 text-xs text-destructive">{p.failureReason}</p>}
            </div>
          );
        })}
        {!list.length && <p className="text-sm text-muted-foreground">لا تحويلات بعد. شغّل التحويلات الشهرية عند نجاح المعاملات.</p>}
      </div>
    </div>
  );
}