import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Navigation } from "lucide-react";
import { MapView, type MapPoint } from "@/components/market/MapView";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { AreaLine, PartnerTypeBadge, Stars } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/brand";
import { usePartnerRatings } from "@/lib/market/hooks";
import { CUSTOMER_LOCATION, directionsUrl } from "@/lib/market/selectors";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/map")({
  head: () => pageHead("ورش قريبة منك", "خريطة ورش AutoCare ومناطق تغطية الفنيين في الرياض."),
  component: CustomerMap,
});

function CustomerMap() {
  const partners = useMarket((s) => s.partners);
  const ratings = usePartnerRatings();
  const [sel, setSel] = useState<string | undefined>("p1");
  const visible = useMemo(() => partners.filter((p) => p.status === "approved" && p.cityId === "riyadh"), [partners]);
  const points: MapPoint[] = useMemo(
    () => visible.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.name, kind: p.type, radiusKm: p.coverageKm })),
    [visible],
  );
  const selected = visible.find((p) => p.id === sel);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="بالقرب منك" sub="و = ورشة · الدائرة = تغطية فني متنقل" back />
      <div className="relative min-h-[420px] flex-1">
        <MapView points={points} center={[CUSTOMER_LOCATION.lat - 0.06, CUSTOMER_LOCATION.lng + 0.06]} zoom={11} onSelect={setSel} selectedId={sel} className="absolute inset-0 rounded-none" />
        {selected && (
          <div className="absolute inset-x-3 bottom-3 z-[500] rounded-xl border border-border bg-card p-3 shadow-lift animate-rise">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold">{selected.name}</div>
                <div className="mt-1 flex items-center gap-2"><PartnerTypeBadge type={selected.type} /><Stars value={ratings.get(selected.id)?.avg ?? 0} count={ratings.get(selected.id)?.count} /></div>
                <div className="mt-1"><AreaLine area={selected.area} privateArea={selected.type === "freelancer"} /></div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button asChild size="sm" className="flex-1"><Link to="/customer/providers/$partnerId" params={{ partnerId: selected.id }}>عرض الملف</Link></Button>
              {selected.type === "garage" && (
                <Button asChild size="sm" variant="outline" className="flex-1"><a href={directionsUrl(selected.lat, selected.lng)} target="_blank" rel="noreferrer"><Navigation /> الاتجاهات</a></Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
