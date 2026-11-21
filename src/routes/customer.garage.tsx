import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BadgeCheck, Battery, Car, Disc, Droplet, FileText, Gauge, MapPin, Palette, Plus,
  ScanLine, Snowflake, Sparkles, Wrench, type LucideIcon,
} from "lucide-react";
import camryPhoto from "@/assets/vehicles/camry.jpg";
import tucsonPhoto from "@/assets/vehicles/tucson.jpg";
import { EmptyState, Plate } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { formatDate, formatMileageRange, formatMoney, formatNumber, pageHead } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { computeUpcoming } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";
import type { MaintenanceType } from "@/lib/market/types";
import { cn } from "@/lib/utils";

const MAINT_META: Record<MaintenanceType, { label: string; icon: LucideIcon }> = {
  oil: { label: "زيوت", icon: Droplet },
  filter: { label: "فلاتر", icon: Wrench },
  tires: { label: "إطارات", icon: Disc },
  brakes: { label: "فرامل", icon: Disc },
  battery: { label: "بطارية", icon: Battery },
  ac: { label: "تكييف", icon: Snowflake },
  repair: { label: "إصلاح", icon: Wrench },
  inspection: { label: "فحص", icon: ScanLine },
  other: { label: "أخرى", icon: FileText },
};

export const Route = createFileRoute("/customer/garage")({
  head: () => pageHead("الجراچ", "سياراتك وسجل الصيانة وتذكيرات الخدمة القادمة."),
  component: MyGarage,
});

/** Demo hero photos — Camry Toyota press kit; Tucson real Hyundai NX4 */
const VEHICLE_PHOTOS: Record<string, string> = {
  Camry: camryPhoto,
  Tucson: tucsonPhoto,
};

function vehiclePhoto(model: string) {
  return VEHICLE_PHOTOS[model] ?? VEHICLE_PHOTOS.Camry;
}

function MyGarage() {
  const customerId = useMarket((s) => s.customerId);
  const allVehicles = useMarket((s) => s.vehicles);
  const maintenance = useMarket((s) => s.maintenance);
  const partners = useMarket((s) => s.partners);
  const transactions = useMarket((s) => s.transactions);
  const vehicles = useMemo(() => allVehicles.filter((v) => v.customerId === customerId), [allVehicles, customerId]);
  const [sel, setSel] = useState("");

  const vehicle = vehicles.find((v) => v.id === sel) ?? vehicles[0];
  const activeId = vehicle?.id ?? "";
  const records = useMemo(
    () => maintenance.filter((m) => m.vehicleId === activeId).sort((a, b) => b.date.localeCompare(a.date)),
    [maintenance, activeId],
  );
  const upcoming = useMemo(
    () => (vehicle ? computeUpcoming(vehicle, maintenance, new Date().toISOString()) : []),
    [vehicle, maintenance],
  );
  const nextUp = upcoming.find((u) => u.state === "overdue" || u.state === "soon") ?? upcoming[0];

  return (
    <div className="pb-10">
      {!vehicles.length && (
        <div className="px-4 pt-[72px]">
          <div className="mb-4 flex justify-end">
            <Button size="sm" onClick={() => toastDemoOnly()}>
              <Plus /> إضافة
            </Button>
          </div>
          <EmptyState icon={Car} title="لا سيارات بعد" body="أضف سيارة لتتبع الصيانة والتذكيرات." />
        </div>
      )}

      {vehicle && (
        <>
          {/* Full-bleed car hero */}
          <section className="relative isolate min-h-[min(62dvh,560px)] overflow-hidden bg-ink text-ink-foreground">
            <img
              key={vehicle.id}
              src={vehiclePhoto(vehicle.model)}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="absolute inset-0 size-full object-cover object-[center_40%]"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/80" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />

            <div className="relative flex min-h-[min(62dvh,560px)] flex-col pt-[59px]">
              <div className="flex items-center justify-end px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  onClick={() => toastDemoOnly()}
                >
                  <Plus /> إضافة
                </Button>
              </div>

              <div className="mt-auto space-y-4 px-4">
                {vehicles.length > 1 && (
                  <div className="flex gap-2">
                    {vehicles.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSel(v.id)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md transition-colors",
                          v.id === vehicle.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/15 text-white/85 ring-1 ring-white/20",
                        )}
                      >
                        {v.model}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <div className="figure text-xs text-white/60">{vehicle.year}</div>
                    <h2 className="mt-0.5 text-[28px] font-black leading-none tracking-tight">
                      {vehicle.make}{" "}
                      <span className="text-primary">{vehicle.model}</span>
                    </h2>
                    {vehicle.trim && (
                      <div className="mt-1.5 text-sm text-white/70">{vehicle.trim}</div>
                    )}
                  </div>
                  <div className="shrink-0">
                    <Plate value={vehicle.plate} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 px-3 pb-3 pt-3">
                <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-md ring-1 ring-white/15">
                  <div className="flex items-center gap-1 text-[10px] text-white/55">
                    <Gauge className="size-3" /> تقدير المسافة
                  </div>
                  <div className="figure mt-1 text-sm font-bold">{formatMileageRange(vehicle.mileage)}</div>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-md ring-1 ring-white/15">
                  <div className="flex items-center gap-1 text-[10px] text-white/55">
                    <Palette className="size-3" /> اللون
                  </div>
                  <div className="mt-1 truncate text-sm font-bold">{vehicle.color}</div>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur-md ring-1 ring-white/15">
                  <div className="flex items-center gap-1 text-[10px] text-white/55">
                    <Sparkles className="size-3" /> التالية
                  </div>
                  <div className="mt-1 truncate text-sm font-bold">
                    {nextUp ? nextUp.label : "—"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Records sheet flush to hero edge — 12px under stats is inside the image */}
          <div className="relative z-10 space-y-5 rounded-t-2xl bg-background px-4 pt-5 pb-2 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            <section>
              <div className="mb-2 flex items-end justify-between">
                <div className="eyebrow">صيانة قادمة</div>
                {upcoming.some((u) => u.state === "overdue") && (
                  <span className="text-[11px] font-semibold text-destructive">يوجد متأخر</span>
                )}
              </div>
              {/* Edge-to-edge scroll; 16px inset only before first / after last item */}
              <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {upcoming.slice(0, 6).map((u) => (
                  <div
                    key={u.type}
                    className={cn(
                      "min-w-[148px] shrink-0 rounded-xl border px-3 py-2.5",
                      u.state === "overdue"
                        ? "border-destructive/30 bg-destructive/5"
                        : u.state === "soon"
                          ? "border-warning/40 bg-warning/10"
                          : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold">{u.label}</div>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                          u.state === "overdue"
                            ? "bg-destructive/15 text-destructive"
                            : u.state === "soon"
                              ? "bg-warning/25 text-warning-foreground"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {u.state === "overdue" ? "متأخرة" : u.state === "soon" ? "قريبًا" : "جيدة"}
                      </span>
                    </div>
                    <div className="figure mt-1.5 text-[11px] text-muted-foreground">
                      {u.kmLeft <= 0 ? "تجاوزت المسافة" : `${formatNumber(u.kmLeft)} كم`}
                      {" · "}
                      {u.daysLeft <= 0 ? "انتهى الموعد" : `${formatNumber(u.daysLeft)} يوم`}
                    </div>
                  </div>
                ))}
                {!upcoming.length && (
                  <p className="px-0 text-sm text-muted-foreground">أضف سجل صيانة لتفعيل التذكيرات.</p>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-end justify-between gap-2">
                <div>
                  <div className="eyebrow">سجل الخدمة</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{formatNumber(records.length)} عملية مسجّلة</div>
                </div>
              </div>
              <div className="space-y-3">
                {records.map((r) => {
                  const p = partners.find((x) => x.id === r.partnerId);
                  const tx = transactions.find((t) => t.orderId === r.orderId && t.status === "succeeded");
                  const meta = MAINT_META[r.type] ?? MAINT_META.other;
                  const Icon = meta.icon;
                  return (
                    <article key={r.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                      <div className="flex gap-3 p-3">
                        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                          <Icon className="size-[18px]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold leading-snug">{r.title}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  {meta.label}
                                </span>
                                {r.source === "order" ? (
                                  <span className="inline-flex items-center gap-0.5 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                    <BadgeCheck className="size-3" /> موثّق عبر الطلب
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    إدخال يدوي
                                  </span>
                                )}
                              </div>
                            </div>
                            {tx && (
                              <div className="shrink-0 text-end">
                                <div className="text-[10px] text-muted-foreground">المدفوع</div>
                                <div className="figure text-sm font-bold">{formatMoney(tx.customerPaid)}</div>
                              </div>
                            )}
                          </div>

                          <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                            <div>
                              <dt className="text-muted-foreground">التاريخ</dt>
                              <dd className="figure font-medium">{formatDate(r.date)}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground">عند المسافة</dt>
                              <dd className="figure font-medium">{formatMileageRange(r.mileage)}</dd>
                            </div>
                            {p && (
                              <div className="col-span-2">
                                <dt className="text-muted-foreground">المزود</dt>
                                <dd className="mt-0.5 flex items-center gap-1 font-medium">
                                  <span className="truncate">{p.name}</span>
                                  <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                                    <MapPin className="size-3" /> {p.area}
                                  </span>
                                </dd>
                              </div>
                            )}
                          </dl>

                          {r.notes && (
                            <p className="mt-2 rounded-lg bg-muted/60 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
                              {r.notes}
                            </p>
                          )}
                          {r.orderId && (
                            <div className="figure mt-2 text-[10px] text-muted-foreground">طلب #{r.orderId}</div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {!records.length && (
                  <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                    لا سجلات صيانة بعد.
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}

    </div>
  );
}
