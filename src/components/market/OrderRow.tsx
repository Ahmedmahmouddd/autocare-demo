import { Link } from "@tanstack/react-router";
import { ChevronRight, Siren } from "lucide-react";
import { StatusBadge } from "./bits";
import { formatDateTime, formatMoney } from "@/lib/brand";
import type { Order } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export function OrderRow({
  order,
  to,
  params,
  subtitle,
}: {
  order: Order;
  to: "/customer/orders/$orderId" | "/partner/orders/$orderId" | "/partner/requests/$orderId";
  params: { orderId: string };
  subtitle?: string;
}) {
  return (
    <Link to={to} params={params} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
      <div className={cn("w-1 self-stretch rounded-full", order.urgent ? "hazard" : "bg-border")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {order.urgent && <Siren className="size-3.5 shrink-0 text-destructive" />}
          <div className="truncate text-sm font-semibold">{order.title}</div>
        </div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle ?? order.locationLabel}</div>
        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={order.status} />
          {order.status === "offers_received" && <span className="text-[11px] text-muted-foreground">{order.offers.length} {order.offers.length === 1 ? "عرض" : "عروض"}</span>}
          {order.agreedPrice != null && <span className="figure text-[11px] text-muted-foreground">{formatMoney(order.agreedPrice)}</span>}
          <span className="figure ml-auto text-[10px] text-muted-foreground">{formatDateTime(order.createdAt)}</span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
    </Link>
  );
}
