import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { EmptyState, MethodChips, PartnerTypeBadge, PHOTOS, Price, Stars } from "@/components/market/bits";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/brand";
import { usePartnerRatings } from "@/lib/market/hooks";
import { CUSTOMER_LOCATION, distanceKm, visibleServices } from "@/lib/market/selectors";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/services/$serviceId")({
  head: () => pageHead("تفاصيل الخدمة", "السعر والشروط ومقدم الخدمة مع مزودين آخرين للمقارنة."),
  component: ServicePage,
});

function ServicePage() {
  const { serviceId } = Route.useParams();
  const services = useMarket((s) => s.services);
  const partners = useMarket((s) => s.partners);
  const categories = useMarket((s) => s.categories);
  const ratings = usePartnerRatings();
  const service = services.find((s) => s.id === serviceId);
  const partner = partners.find((p) => p.id === service?.partnerId);
  const compare = useMemo(() => {
    if (!service) return [];
    return visibleServices(services, partners)
      .filter((s) => s.categoryId === service.categoryId && s.id !== service.id)
      .map((s) => ({ s, p: partners.find((p) => p.id === s.partnerId)! }))
      .sort((a, b) => a.s.price - b.s.price);
  }, [service, services, partners]);

  if (!service || !partner || partner.status !== "approved" || !service.active) {
    return <div className="p-6"><EmptyState title="الخدمة غير متاحة" /></div>;
  }
  const cat = categories.find((c) => c.id === service.categoryId);

  return (
    <div className="pb-8">
      <ScreenHeader title={service.name} sub={cat?.name} back />
      <div className="space-y-5 px-4 pt-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <Price amount={service.price} type={service.priceType} size="lg" />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" /> ~{service.durationMin} د</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{service.description}</p>
          <MethodChips methods={service.methods} className="mt-3" />
          {(service.inspectionNote || service.priceType === "starting") && (
            <div className="mt-3 flex gap-2 rounded-md bg-warning/15 p-2.5 text-xs text-warning-foreground">
              <AlertTriangle className="size-4 shrink-0" />
              <span>قد يتغير المبلغ النهائي بعد فحص السيارة. ستعرض السعر النهائي وتوافق عليه قبل قبول الطلب.</span>
            </div>
          )}
          <Button asChild variant="signal" size="xl" className="mt-4"><Link to="/customer/request" search={{ serviceId: service.id, partnerId: partner.id }}>اطلب هذه الخدمة</Link></Button>
        </div>

        <Link to="/customer/providers/$partnerId" params={{ partnerId: partner.id }} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
          <img src={PHOTOS[partner.photo]} alt="" className="size-12 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{partner.name}</div>
            <div className="mt-0.5 flex items-center gap-2"><PartnerTypeBadge type={partner.type} /><Stars value={ratings.get(partner.id)?.avg ?? 0} count={ratings.get(partner.id)?.count} /></div>
          </div>
        </Link>

        {compare.length > 0 && (
          <section>
            <div className="eyebrow mb-2">قارن: مزودون آخرون لـ {cat?.name ?? "نفس التصنيف"}</div>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {compare.map(({ s, p }) => (
                <Link key={s.id} to="/customer/services/$serviceId" params={{ serviceId: s.id }} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{p.name} · <span className="figure">{distanceKm(CUSTOMER_LOCATION, p)} كم</span> · ★ {(ratings.get(p.id)?.avg ?? 0).toFixed(1)}</div>
                  </div>
                  <Price amount={s.price} type={s.priceType} size="sm" className="text-right" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
