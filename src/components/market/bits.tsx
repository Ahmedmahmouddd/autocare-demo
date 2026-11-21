import {
  Battery, CircleDot, Disc, Droplet, MapPin, ScanLine, Siren, Snowflake, Star, Truck, Warehouse, Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/brand";
import { statusLabel } from "@/lib/market/rules";
import type { DeliveryMethod, OrderStatus, PartnerStatus, PartnerType, PriceType } from "@/lib/market/types";
import garagePhoto from "@/assets/garage-bay.jpg";
import mobilePhoto from "@/assets/mobile-mechanic.jpg";
import workshopPhoto from "@/assets/workshop-hero.jpg";

export const PHOTOS = { garage: garagePhoto, mobile: mobilePhoto, workshop: workshopPhoto };

const ICONS: Record<string, LucideIcon> = {
  droplet: Droplet, disc: Disc, "circle-dot": CircleDot, battery: Battery, scan: ScanLine, wrench: Wrench, snowflake: Snowflake, siren: Siren,
};
export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const I = ICONS[icon] ?? Wrench;
  return <I className={className} />;
}

const STATUS_VARIANT: Record<OrderStatus, "muted" | "info" | "accent" | "warning" | "success" | "danger" | "ink"> = {
  pending: "muted",
  offers_received: "info",
  accepted: "accent",
  in_progress: "accent",
  awaiting_confirmation: "warning",
  awaiting_payment: "warning",
  completed: "success",
  cancelled: "muted",
  rejected: "danger",
  expired: "muted",
  disputed: "danger",
  refunded: "ink",
};
export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return <Badge variant={STATUS_VARIANT[status]} className={className}>{statusLabel(status)}</Badge>;
}

const PARTNER_VARIANT: Record<PartnerStatus, "success" | "warning" | "danger" | "muted"> = {
  approved: "success", pending: "warning", rejected: "danger", suspended: "danger", deactivated: "muted",
};
const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  approved: "معتمد",
  pending: "قيد المراجعة",
  rejected: "مرفوض",
  suspended: "موقوف",
  deactivated: "معطّل",
};

export function PartnerStatusBadge({ status }: { status: PartnerStatus }) {
  return <Badge variant={PARTNER_VARIANT[status]}>{PARTNER_STATUS_LABELS[status]}</Badge>;
}

export function PartnerTypeBadge({ type }: { type: PartnerType }) {
  return (
    <Badge variant={type === "garage" ? "ink" : "outline"} className="gap-1">
      {type === "garage" ? <Warehouse className="size-3" /> : <Wrench className="size-3" />}
      {type === "garage" ? "ورشة" : "مستقل"}
    </Badge>
  );
}

export function Price({ amount, type, className, size = "md" }: { amount: number; type: PriceType; className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={cn("leading-none", className)}>
      {type === "starting" && <div className="eyebrow mb-1 !text-[9px]">يبدأ من</div>}
      <div className={cn("figure font-semibold", size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base")}>{formatMoney(amount)}</div>
      {type === "fixed" && <div className="eyebrow mt-1 !text-[9px]">سعر ثابت</div>}
    </div>
  );
}

export function Stars({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Star className="size-3.5 fill-primary text-primary" />
      <span className="figure font-semibold">{value ? value.toFixed(1) : "جديد"}</span>
      {count != null && <span className="text-muted-foreground">({count})</span>}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="التقييم">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} نجمة`} onClick={() => onChange(n)} className="p-0.5">
          <Star className={cn("size-8 transition-colors", n <= value ? "fill-primary text-primary" : "text-border")} />
        </button>
      ))}
    </div>
  );
}

const METHOD: Record<DeliveryMethod, { label: string; icon: LucideIcon }> = {
  mobile: { label: "يصل إليك", icon: Truck },
  garage: { label: "في الورشة", icon: Warehouse },
  roadside: { label: "مساعدة على الطريق", icon: Siren },
};
export const methodLabel = (m: DeliveryMethod) => METHOD[m].label;
export function MethodChips({ methods, className }: { methods: DeliveryMethod[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {methods.map((m) => {
        const I = METHOD[m].icon;
        return (
          <span key={m} className="inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[11px] text-muted-foreground">
            <I className="size-3" /> {METHOD[m].label}
          </span>
        );
      })}
    </div>
  );
}

export function AreaLine({ area, city, privateArea }: { area: string; city?: string; privateArea?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <MapPin className="size-3" />
      {privateArea ? `يغطي ${area}${city ? `، ${city}` : ""}` : `${area}${city ? `، ${city}` : ""}`}
    </span>
  );
}

export function Plate({ value }: { value?: string }) {
  if (!value) return null;
  return <span className="plate text-[11px]">{value}</span>;
}

export function EmptyState({ icon: I = Wrench, title, body, children }: { icon?: LucideIcon; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <I className="size-6 text-muted-foreground" />
      <div className="font-semibold">{title}</div>
      {body && <p className="max-w-xs text-sm text-muted-foreground">{body}</p>}
      {children}
    </div>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const i = name.split(/[\s-]+/).filter((w) => w && w[0] === w[0].toUpperCase() && w !== "Al").slice(0, 2).map((w) => w[0]).join("");
  return <div className={cn("grid size-10 shrink-0 place-items-center rounded-md bg-ink font-display text-sm font-bold text-ink-foreground", className)}>{i}</div>;
}
