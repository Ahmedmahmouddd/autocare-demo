import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PartnerTypeBadge, Stars } from "@/components/market/bits";
import { usePartnerRatings } from "@/lib/market/hooks";
import { formatMoney, pageHead } from "@/lib/brand";
import { ACTIVE_STATUSES, partnerLedger } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";
import type { Order } from "@/lib/market/types";

export const Route = createFileRoute("/partner/")({
  head: () => pageHead("لوحة الشريك", "طلبات اليوم والأعمال النشطة والأرباح بنظرة واحدة."),
  component: PartnerHome,
});

function openRequests(orders: Order[], partnerId: string) {
  return orders.filter(
    (o) => (o.status === "pending" || o.status === "offers_received") && !o.declinedBy.includes(partnerId) && !o.partnerId,
  );
}

function PartnerHome() {
  const partners = useMarket((s) => s.partners);
  const partnerId = useMarket((s) => s.activePartnerId);
  const orders = useMarket((s) => s.orders);
  const transactions = useMarket((s) => s.transactions);
  const payouts = useMarket((s) => s.payouts);
  const ratings = usePartnerRatings();

  const partner = partners.find((p) => p.id === partnerId);
  const open = openRequests(orders, partnerId);
  const active = orders.filter((o) => o.partnerId === partnerId && ACTIVE_STATUSES.includes(o.status));
  const ledger = partnerLedger(partnerId, transactions, payouts);

  const quick = [
    { to: "/partner/requests", label: "طلبات جديدة", count: open.length, body: "أرسل عرضًا قبل أن يفوز شريك آخر بالطلب." },
    { to: "/partner/orders", label: "أعمال نشطة", count: active.length, body: "ابدأ العمل، علّم الإنجاز واترك تقييمًا." },
    { to: "/partner/services", label: "الخدمات", count: null, body: "الأسعار وطرق التنفيذ والظهور في الكتالوج." },
    { to: "/partner/earnings", label: "الأرباح", count: null, body: `${formatMoney(ledger.available)} متاح للتحويل.` },
  ];

  return (
    <div className="pb-6">
      <div className="bg-ink-gradient px-4 pb-5 pt-3 text-ink-foreground min-[698px]:pt-[59px]">
        <div className="eyebrow !text-ink-muted">لوحة الشريك</div>
        {partner && (
          <>
            <h1 className="mt-2 text-[26px] font-black leading-tight">{partner.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PartnerTypeBadge type={partner.type} />
              <Stars value={ratings.get(partner.id)?.avg ?? 0} count={ratings.get(partner.id)?.count} className="!text-ink-muted" />
            </div>
          </>
        )}
      </div>

      <dl className="grid grid-cols-3 gap-2 px-4 pt-4">
        {[
          [open.length, "طلبات مفتوحة"],
          [active.length, "أعمال نشطة"],
          [formatMoney(ledger.earned), "إجمالي الأرباح"],
        ].map(([n, l]) => (
          <div key={l as string} className="flex min-h-[4.75rem] flex-col rounded-lg border border-border bg-card p-3 shadow-card">
            <dt className="eyebrow">{l}</dt>
            <dd className="figure mt-auto pt-1 text-lg font-bold leading-none">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 space-y-2 px-4">
        <div className="eyebrow">اختصارات</div>
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{q.label}</span>
                {q.count != null && <span className="figure rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">{q.count}</span>}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{q.body}</p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
          </Link>
        ))}
      </div>
    </div>
  );
}