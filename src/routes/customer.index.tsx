import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Map as MapIcon, MapPin, Search, Siren, SlidersHorizontal } from "lucide-react";
import { AreaLine, CategoryIcon, MethodChips, PartnerTypeBadge, PHOTOS, Price, Stars } from "@/components/market/bits";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pageHead } from "@/lib/brand";
import { usePartnerRatings } from "@/lib/market/hooks";
import { CUSTOMER_LOCATION, distanceKm, visibleServices } from "@/lib/market/selectors";
import { useMarket } from "@/lib/market/store";
import type { DeliveryMethod } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/")({
  head: () => pageHead("استكشف الورش والفنيين", "تصفّح كل ورشة وفني معتمد على AutoCare، قارن الأسعار واحجز."),
  component: Explore,
});

type Sort = "distance" | "rating" | "price";

function Explore() {
  const partners = useMarket((s) => s.partners);
  const services = useMarket((s) => s.services);
  const categories = useMarket((s) => s.categories);
  const cities = useMarket((s) => s.cities);
  const ratings = usePartnerRatings();
  const [tab, setTab] = useState<"services" | "providers">("providers");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [method, setMethod] = useState<DeliveryMethod | "any">("any");
  const [sort, setSort] = useState<Sort>("distance");
  const [city, setCity] = useState("riyadh");
  const [availableNow, setAvailableNow] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const visible = useMemo(() => visibleServices(services, partners), [services, partners]);
  const partnerById = useMemo(() => new Map(partners.map((p) => [p.id, p])), [partners]);

  const filteredServices = useMemo(() => {
    const term = q.trim().toLowerCase();
    return visible
      .filter((s) => {
        const p = partnerById.get(s.partnerId)!;
        const catName = categories.find((c) => c.id === s.categoryId)?.name ?? "";
        if (p.cityId !== city) return false;
        if (cat && s.categoryId !== cat) return false;
        if (method !== "any" && !s.methods.includes(method)) return false;
        if (availableNow && !p.availableNow) return false;
        if (term && !`${s.name} ${s.description} ${p.name} ${catName}`.toLowerCase().includes(term)) return false;
        return true;
      })
      .map((s) => ({ s, p: partnerById.get(s.partnerId)!, d: distanceKm(CUSTOMER_LOCATION, partnerById.get(s.partnerId)!), r: ratings.get(s.partnerId)?.avg ?? 0 }))
      .sort((a, b) => (sort === "price" ? a.s.price - b.s.price : sort === "rating" ? b.r - a.r : a.d - b.d));
  }, [visible, partnerById, categories, q, cat, method, availableNow, sort, city, ratings]);

  const filteredProviders = useMemo(() => {
    const ids = new Set(filteredServices.map((x) => x.p.id));
    const term = q.trim().toLowerCase();
    return partners
      .filter((p) => p.status === "approved" && p.cityId === city && (ids.has(p.id) || (!cat && method === "any" && term && p.name.toLowerCase().includes(term))))
      .map((p) => {
        const ps = visible.filter((s) => s.partnerId === p.id);
        return { p, d: distanceKm(CUSTOMER_LOCATION, p), r: ratings.get(p.id) ?? { avg: 0, count: 0 }, min: Math.min(...ps.map((s) => s.price)), n: ps.length };
      })
      .sort((a, b) => (sort === "price" ? a.min - b.min : sort === "rating" ? b.r.avg - a.r.avg : a.d - b.d));
  }, [filteredServices, partners, visible, ratings, sort, city, cat, method, q]);

  return (
    <div className="pb-6">
      <div className="bg-ink-gradient px-4 pb-5 pt-3 text-ink-foreground min-[698px]:pt-[59px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow !text-ink-muted">مساء الخير، سارة</div>
            <div className="mt-1 flex items-center gap-1 text-sm font-medium"><MapPin className="size-3.5 text-primary" /> {CUSTOMER_LOCATION.label}</div>
          </div>
          <Link to="/customer/map" className="flex items-center gap-1 rounded-md border border-ink-foreground/20 px-2.5 py-1.5 text-xs hover:bg-ink-foreground/10"><MapIcon className="size-3.5" /> الخريطة</Link>
        </div>
        <h1 className="mt-4 text-[26px] font-black leading-tight">ما الذي تحتاجه سيارتك؟</h1>
        <div className="relative mt-3">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="تغيير زيت، فرامل، تكييف، اسم ورشة…" className="h-11 border-0 bg-card ps-9 text-foreground" aria-label="البحث عن خدمات ومزودين" />
        </div>
        <Link to="/customer/request" search={{ categoryId: "roadside", urgent: true }} className="mt-3 flex items-center gap-3 overflow-hidden rounded-lg bg-card text-foreground">
          <div className="hazard h-full w-2 self-stretch" />
          <Siren className="size-5 text-destructive" />
          <div className="flex-1 py-2.5">
            <div className="text-sm font-bold">تعطلت السيارة؟ مساعدة على الطريق</div>
            <div className="text-xs text-muted-foreground">أرسل موقعك — يصلك عروض من أقرب الفنيين</div>
          </div>
          <ChevronRight className="me-3 size-4 text-muted-foreground rtl:rotate-180" />
        </Link>
      </div>

      {/* Safe-area veil only in framed phone; full-bleed mobile has no notch inset */}
      <div className="pointer-events-none sticky top-0 z-40 hidden h-[59px] bg-background min-[698px]:block" aria-hidden />
      <div className="sticky top-0 z-50 border-b border-border bg-background min-[698px]:top-[59px] min-[698px]:-mt-[59px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4 pb-1">
          <button onClick={() => setCat(null)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium", !cat ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card")}>الكل</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCat(cat === c.id ? null : c.id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium", cat === c.id ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card")}>
              <CategoryIcon icon={c.icon} className="size-3.5" /> {c.name}
            </button>
          ))}
        </div>
        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services">الخدمات ({filteredServices.length})</TabsTrigger>
                <TabsTrigger value="providers">المزودون ({filteredProviders.length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <button onClick={() => setShowFilters((v) => !v)} aria-label="تصفية" className={cn("grid size-9 place-items-center rounded-md border", showFilters ? "border-primary text-primary" : "border-border")}>
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-2 gap-2 animate-rise">
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger aria-label="المدينة"><SelectValue /></SelectTrigger>
                <SelectContent>{cities.filter((c) => c.active).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger aria-label="ترتيب"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">الأقرب أولًا</SelectItem>
                  <SelectItem value="rating">الأعلى تقييمًا</SelectItem>
                  <SelectItem value="price">الأقل سعرًا</SelectItem>
                </SelectContent>
              </Select>
              <Select value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                <SelectTrigger aria-label="طريقة الخدمة"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">أي طريقة</SelectItem>
                  <SelectItem value="mobile">يصل إلي</SelectItem>
                  <SelectItem value="garage">في الورشة</SelectItem>
                  <SelectItem value="roadside">مساعدة على الطريق</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between rounded-md border border-input px-3">
                <Label htmlFor="now" className="text-xs">مفتوح الآن</Label>
                <Switch id="now" checked={availableNow} onCheckedChange={setAvailableNow} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5 px-4 pt-3">
        {tab === "providers" &&
          filteredProviders.map(({ p, d, r, min, n }) => (
            <Link key={p.id} to="/customer/providers/$partnerId" params={{ partnerId: p.id }} className="flex gap-3 rounded-lg border border-border bg-card p-2.5 shadow-card transition-colors hover:border-primary/40">
              <img src={PHOTOS[p.photo]} alt="" className="size-20 shrink-0 rounded-md object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate text-sm font-bold">{p.name}</div>
                  <Stars value={r.avg} count={r.count} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <PartnerTypeBadge type={p.type} />
                  <span className="figure text-[11px] text-muted-foreground">{d} كم</span>
                  {p.availableNow && <span className="text-[11px] font-medium text-success">● مفتوح</span>}
                </div>
                <div className="mt-1"><AreaLine area={p.area} privateArea={p.type === "freelancer"} /></div>
                <div className="mt-1.5 flex items-end justify-between">
                  <MethodChips methods={p.methods} />
                  <span className="text-[11px] text-muted-foreground">{n} {n === 1 ? "خدمة" : "خدمات"} · من <span className="figure font-semibold text-foreground">{min}</span></span>
                </div>
              </div>
            </Link>
          ))}
        {tab === "services" &&
          filteredServices.map(({ s, p, d, r }) => (
            <Link key={s.id} to="/customer/services/$serviceId" params={{ serviceId: s.id }} className="block rounded-lg border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold">{s.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.name} · <span className="figure">{d} كم</span></div>
                </div>
                <Price amount={s.price} type={s.priceType} className="text-right" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <MethodChips methods={s.methods} />
                <Stars value={r} />
              </div>
              {s.inspectionNote && <div className="mt-2 rounded bg-warning/15 px-2 py-1 text-[11px] text-warning-foreground">السعر النهائي بعد الفحص</div>}
            </Link>
          ))}
        {((tab === "providers" && !filteredProviders.length) || (tab === "services" && !filteredServices.length)) && (
          <p className="py-10 text-center text-sm text-muted-foreground">لا نتائج بهذه التصفية. جرّب تصنيفًا أو مدينة أخرى.</p>
        )}
      </div>
    </div>
  );
}