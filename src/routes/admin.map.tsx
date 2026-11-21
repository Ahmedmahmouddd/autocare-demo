import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapView, type MapPoint } from "@/components/market/MapView";
import { PartnerStatusBadge, PartnerTypeBadge } from "@/components/market/bits";
import { pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/admin/map")({
  head: () => pageHead("خريطة الشركاء", "الورش وتغطية الفنيين المتنقلين في المدن النشطة."),
  component: AdminMap,
});

function AdminMap() {
  const partners = useMarket((s) => s.partners);
  const [sel, setSel] = useState<string | undefined>(partners[0]?.id);

  const points: MapPoint[] = useMemo(
    () =>
      partners.map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        label: p.name,
        kind: p.status === "approved" ? p.type : "pending",
        radiusKm: p.coverageKm,
      })),
    [partners],
  );

  const selected = partners.find((p) => p.id === sel);
  const center: [number, number] = selected ? [selected.lat, selected.lng] : [24.7136, 46.6753];

  return (
    <div>
      <div className="eyebrow">الجغرافيا</div>
      <h1 className="mt-1 text-3xl font-extrabold">خريطة الشركاء</h1>
      <p className="mt-1 text-sm text-muted-foreground">الشركاء المعلقون يظهرون كعلامات رمادية. المستقلون تظهر دوائر تغطيتهم.</p>
      <div className="relative mt-6 h-[min(520px,70vh)] overflow-hidden rounded-xl border border-border">
        <MapView points={points} center={center} zoom={10} onSelect={setSel} selectedId={sel} className="absolute inset-0" />
        {selected && (
          <div className="absolute bottom-4 left-4 z-[500] max-w-sm rounded-lg border border-border bg-card p-3 shadow-lift">
            <div className="font-bold">{selected.name}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <PartnerTypeBadge type={selected.type} />
              <PartnerStatusBadge status={selected.status} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{selected.area}</p>
          </div>
        )}
      </div>
    </div>
  );
}