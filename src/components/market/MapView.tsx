import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import { cn } from "@/lib/utils";

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind: "garage" | "freelancer" | "pending";
  radiusKm?: number;
}

/** Leaflet is browser-only, so it loads after mount. Freelancers render as coverage circles, never a home pin. */
export function MapView({
  points, center, zoom = 11, className, onSelect, selectedId,
}: {
  points: MapPoint[];
  center: [number, number];
  zoom?: number;
  className?: string;
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const LRef = useRef<typeof Leaflet | null>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !el.current || mapRef.current) return;
      const L = (mod as unknown as { default?: typeof Leaflet }).default ?? (mod as unknown as typeof Leaflet);
      LRef.current = L;
      const map = L.map(el.current, { zoomControl: true, attributionControl: true }).setView(center, zoom);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      draw();
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const L = LRef.current;
    const layer = layerRef.current;
    if (!L || !layer) return;
    layer.clearLayers();
    const cssVar = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    for (const p of points) {
      if (p.kind === "freelancer" && p.radiusKm) {
        L.circle([p.lat, p.lng], {
          radius: p.radiusKm * 1000,
          color: cssVar("--teal"),
          weight: selectedId === p.id ? 3 : 1.5,
          fillOpacity: selectedId === p.id ? 0.22 : 0.1,
        })
          .on("click", () => selectRef.current?.(p.id))
          .bindTooltip(`${p.label} · covers ${p.radiusKm} km`)
          .addTo(layer);
      }
      const icon = L.divIcon({
        className: "",
        html: `<div class="ac-pin ${p.kind === "freelancer" ? "is-free" : p.kind === "pending" ? "is-pending" : ""}" style="${selectedId === p.id ? "outline:3px solid " + cssVar("--ink") : ""}"><span>${p.kind === "garage" ? "G" : p.kind === "freelancer" ? "M" : "?"}</span></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      L.marker([p.lat, p.lng], { icon }).on("click", () => selectRef.current?.(p.id)).bindTooltip(p.label).addTo(layer);
    }
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, selectedId]);

  useEffect(() => {
    mapRef.current?.setView(center, mapRef.current.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);

  return <div ref={el} className={cn("relative z-0 h-full w-full overflow-hidden rounded-lg bg-muted", className)} />;
}
