import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { EmptyState } from "@/components/market/bits";
import { formatDateTime, formatMoney, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/wallet")({
  head: () => pageHead("المدفوعات", "سجل معاملاتك وإيصالات الدفع على AutoCare."),
  component: CustomerWallet,
});

function CustomerWallet() {
  const customerId = useMarket((s) => s.customerId);
  const allTransactions = useMarket((s) => s.transactions);
  const partners = useMarket((s) => s.partners);
  const orders = useMarket((s) => s.orders);
  const transactions = useMemo(
    () => allTransactions.filter((t) => t.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allTransactions, customerId],
  );

  return (
    <div className="pb-6">
      <ScreenHeader title="المدفوعات" />
      <div className="space-y-2 px-4 pt-3">
        {transactions.map((t) => {
          const p = partners.find((x) => x.id === t.partnerId);
          const o = orders.find((x) => x.id === t.orderId);
          return (
            <Link
              key={t.id}
              to="/customer/orders/$orderId"
              params={{ orderId: t.orderId }}
              className="block rounded-lg border border-border bg-card p-3 shadow-card hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{o?.title ?? t.orderId}</div>
                  <div className="text-xs text-muted-foreground">{p?.name ?? "شريك"} · {t.status.replace("_", " ")}</div>
                  <div className="figure mt-1 text-[10px] text-muted-foreground">{formatDateTime(t.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="figure text-sm font-semibold">{formatMoney(t.customerPaid)}</div>
                  {t.discount > 0 && <div className="figure text-[10px] text-success">−{formatMoney(t.discount)} خصم</div>}
                </div>
              </div>
            </Link>
          );
        })}
        {!transactions.length && <EmptyState icon={Wallet} title="لا مدفوعات بعد" body="ستظهر هنا المدفوعات المكتملة داخل التطبيق مع الإيصالات." />}
      </div>
    </div>
  );
}
