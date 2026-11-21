import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, BadgeCheck, Clock, MessageCircle, Navigation, ShieldCheck, Users } from "lucide-react";
import { AreaLine, EmptyState, MethodChips, PartnerTypeBadge, PHOTOS, Price, Stars } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { formatDate, pageHead } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { CUSTOMER_LOCATION, directionsUrl, distanceKm, ratingFor } from "@/lib/market/selectors";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/providers/$partnerId")({
  head: () => pageHead("ملف المزود", "الخدمات والأسعار وساعات العمل والموقع والتقييمات لورشة أو فني على AutoCare."),
  component: ProviderPage,
});

function ProviderPage() {
  const { partnerId } = Route.useParams();
  const navigate = useNavigate();
  const partner = useMarket((s) => s.partners.find((p) => p.id === partnerId));
  const services = useMarket((s) => s.services);
  const reviews = useMarket((s) => s.reviews);
  const customers = useMarket((s) => s.customers);
  const categories = useMarket((s) => s.categories);
  const customerId = useMarket((s) => s.customerId);
  const openThread = useMarket((s) => s.openThread);
  const mine = useMemo(() => services.filter((s) => s.partnerId === partnerId && s.active), [services, partnerId]);
  const rating = useMemo(() => ratingFor(partnerId, reviews), [partnerId, reviews]);

  if (!partner || partner.status !== "approved") {
    return <div className="p-6"><EmptyState title="هذا المزود غير متاح" body="قد يكون قيد المراجعة أو غير نشط على AutoCare." /></div>;
  }
  const isGarage = partner.type === "garage";

  return (
    <div className="pb-8">
      <div className="relative h-52 pt-[59px]">
        <img src={PHOTOS[partner.photo]} alt={partner.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/50" />
        <button onClick={() => window.history.back()} aria-label="رجوع" className="absolute start-3 top-[68px] z-10 grid size-9 place-items-center rounded-full bg-card/90 shadow-card"><ArrowLeft className="size-5 rtl:rotate-180" /></button>
        <div className="absolute bottom-3 left-4 right-4 text-ink-foreground">
          <PartnerTypeBadge type={partner.type} />
          <h1 className="mt-1.5 text-2xl font-black leading-tight">{partner.name}</h1>
        </div>
      </div>

      <div className="space-y-5 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Stars value={rating.avg} count={rating.count} className="text-sm" />
          <span className="figure text-xs text-muted-foreground">{distanceKm(CUSTOMER_LOCATION, partner)} كم</span>
          <span className="inline-flex items-center gap-1 text-xs text-success"><BadgeCheck className="size-3.5" /> معتمد من AutoCare</span>
        </div>
        <p className="text-sm text-muted-foreground">{partner.bio}</p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-border bg-card p-3">
            <Clock className="mb-1 size-4 text-primary" />
            <div className="font-semibold">{partner.hours}</div>
            <div className={partner.availableNow ? "text-success" : "text-muted-foreground"}>{partner.availableNow ? "مفتوح الآن" : "مغلق الآن"}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            {isGarage ? <Users className="mb-1 size-4 text-primary" /> : <ShieldCheck className="mb-1 size-4 text-primary" />}
            <div className="font-semibold">{isGarage ? `${partner.staffCount ?? 1} فني` : `يغطي ${partner.coverageKm} كم`}</div>
            <AreaLine area={partner.area} privateArea={!isGarage} />
          </div>
        </div>
        {!isGarage && (
          <p className="rounded-md bg-muted px-3 py-2 text-[11px] text-muted-foreground">عناوين منازل المستقلين خاصة. ترى منطقة الخدمة ويصلون إليك.</p>
        )}
        <MethodChips methods={partner.methods} />

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const id = openThread(customerId, partner.id);
              if (!id) {
                toastDemoOnly();
                return;
              }
              void navigate({ to: "/customer/chats/$threadId", params: { threadId: id } });
            }}
          >
            <MessageCircle /> محادثة
          </Button>
          {isGarage && (
            <Button asChild variant="outline" className="flex-1">
              <a href={directionsUrl(partner.lat, partner.lng)} target="_blank" rel="noreferrer"><Navigation /> الاتجاهات</a>
            </Button>
          )}
        </div>

        <section>
          <div className="eyebrow mb-2">الخدمات والأسعار</div>
          <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {mine.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link to="/customer/services/$serviceId" params={{ serviceId: s.id }} className="text-sm font-semibold hover:text-primary">{s.name}</Link>
                  <div className="text-[11px] text-muted-foreground">{categories.find((c) => c.id === s.categoryId)?.name} · ~{s.durationMin} د</div>
                  {s.inspectionNote && <div className="mt-1 text-[11px] text-warning-foreground">السعر النهائي بعد الفحص</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Price amount={s.price} type={s.priceType} size="sm" className="text-right" />
                  <Button asChild size="sm"><Link to="/customer/request" search={{ serviceId: s.id, partnerId: partner.id }}>احجز</Link></Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow mb-2">التقييمات ({rating.count})</div>
          <div className="space-y-2">
            {rating.list.slice(0, 6).map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{customers.find((c) => c.id === r.reviewerId)?.name.split(" ")[0] ?? "عميل"}</span>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                <div className="figure mt-1 text-[10px] text-muted-foreground">{formatDate(r.createdAt)} · طلب موثّق</div>
              </div>
            ))}
            {!rating.count && <p className="text-sm text-muted-foreground">لا تقييمات بعد.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
