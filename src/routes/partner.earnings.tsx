import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { formatDate, formatMoney, pageHead } from "@/lib/brand";
import { partnerLedger } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";
import { Badge } from "@/components/ui/badge";

const TX_STATUS: Record<string, string> = {
  succeeded: "ناجحة",
  partially_paid: "مدفوعة جزئيًا",
  refunded: "مستردة",
};

const PAYOUT_STATUS: Record<string, string> = {
  paid: "مدفوع",
  failed: "فاشل",
  processing: "قيد المعالجة",
  pending: "معلق",
};

export const Route = createFileRoute("/partner/earnings")({
  head: () => pageHead("الأرباح", "الدفتر والمعاملات والتحويلات الشهرية."),
  component: PartnerEarnings,
});

function PartnerEarnings() {
  const partnerId = useMarket((s) => s.activePartnerId);
  const transactions = useMarket((s) => s.transactions);
  const payouts = useMarket((s) => s.payouts);
  const orders = useMarket((s) => s.orders);

  const ledger = partnerLedger(partnerId, transactions, payouts);
  const mineTx = transactions.filter((t) => t.partnerId === partnerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const minePayouts = payouts.filter((p) => p.partnerId === partnerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const stats = [
    ["متاح", ledger.available],
    ["قيد التحويل", ledger.inPayout],
    ["تم التحويل", ledger.paidOut],
    ["فاشل", ledger.failed],
  ] as const;

  return (
    <div className="pb-6">
      <ScreenHeader title="الأرباح" sub={`إجمالي الأرباح ${formatMoney(ledger.earned)}`} />
      <dl className="grid grid-cols-2 gap-2 px-4 pt-3">
        {stats.map(([label, amount]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3 shadow-card">
            <dt className="eyebrow">{label}</dt>
            <dd className="figure mt-1 text-lg font-bold">{formatMoney(amount)}</dd>
          </div>
        ))}
      </dl>

      <EarningsSection title="أحدث المعاملات">
        <div className="space-y-2">
          {mineTx.slice(0, 8).map((t) => {
            const order = orders.find((o) => o.id === t.orderId);
            return (
              <div key={t.id} className="rounded-lg border border-border bg-card p-3 text-sm shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{order?.title ?? t.orderId}</div>
                    <div className="figure mt-0.5 text-xs text-muted-foreground">{formatDate(t.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="figure font-bold">{formatMoney(t.partnerNet)}</div>
                    <Badge variant={t.status === "succeeded" ? "success" : "muted"} className="mt-1">
                      {TX_STATUS[t.status] ?? t.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
          {!mineTx.length && <p className="text-center text-sm text-muted-foreground">لا معاملات بعد.</p>}
        </div>
      </EarningsSection>

      <EarningsSection title="التحويلات">
        <div className="space-y-2">
          {minePayouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-card">
              <div>
                <div className="text-sm font-semibold">{p.period}</div>
                <div className="text-xs text-muted-foreground">{p.method}</div>
              </div>
              <div className="text-right">
                <div className="figure font-bold">{formatMoney(p.amount)}</div>
                <Badge variant={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "warning"} className="mt-1">
                  {PAYOUT_STATUS[p.status] ?? p.status}
                </Badge>
              </div>
            </div>
          ))}
          {!minePayouts.length && <p className="text-center text-sm text-muted-foreground">لا تحويلات بعد.</p>}
        </div>
      </EarningsSection>
    </div>
  );
}

function EarningsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 px-4">
      <div className="eyebrow">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}