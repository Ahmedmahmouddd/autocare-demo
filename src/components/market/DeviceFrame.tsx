import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, LayoutDashboard, RotateCcw, Smartphone, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/lib/market/store";
import { cn } from "@/lib/utils";

export function DemoSidePanel({ current, tips }: { current: "customer" | "partner"; tips: string[] }) {
  const reset = useMarket((s) => s.resetDemo);
  return (
    <div className="w-56 space-y-5 lg:w-72 lg:space-y-6">
      <Link to="/" className="inline-flex justify-start">
        <Logo sub="عرض تفاعلي" />
      </Link>
      <div className="text-start">
        <div className="eyebrow">أنت تشاهد</div>
        <h2 className="mt-1 text-xl font-extrabold lg:text-2xl">
          {current === "customer" ? "تطبيق العميل" : "تطبيق الشريك"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {current === "customer"
            ? "مسجّلة الدخول كسارة القحطاني، صاحبة سيارة في شمال الرياض."
            : "أنت تمثّل ورشة العليا للسيارات — رد على الطلبات ونفّذ الأعمال وتابع الأرباح."}
        </p>
      </div>
      <div className="space-y-2 text-start">
        <div className="eyebrow">جرّب هذا</div>
        <ol className="space-y-2 text-sm">
          {tips.map((t, i) => (
            <li key={t} className="flex gap-2">
              <span className="figure mt-0.5 shrink-0 text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="space-y-2">
        <div className="eyebrow text-center">تبديل التطبيق</div>
        <div className="grid gap-2">
          {current !== "customer" && (
            <Button asChild variant="outline" className="justify-center">
              <Link to="/customer">
                <Smartphone /> تطبيق العميل
              </Link>
            </Button>
          )}
          {current !== "partner" && (
            <Button asChild variant="outline" className="justify-center">
              <Link to="/partner">
                <Wrench /> تطبيق الشريك
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="justify-center">
            <Link to="/admin">
              <LayoutDashboard /> لوحة التحكم
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            reset();
            toast.success("تمت استعادة بيانات العرض");
          }}
        >
          <RotateCcw /> إعادة تعيين العرض
        </Button>
      </div>
    </div>
  );
}

function DynamicIsland() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-50 hidden h-[59px] items-start justify-center pt-[12px] min-[698px]:flex"
      aria-hidden
    >
      <div
        className="relative h-[34px] w-[90px] rounded-full bg-black"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
      >
        <div className="absolute top-1/2 right-[12px] size-[9px] -translate-y-1/2 rounded-full bg-[#0a0a0c] ring-1 ring-white/10" />
        <div className="absolute top-1/2 right-[24px] size-1 -translate-y-1/2 rounded-full bg-[#1a1a22]" />
      </div>
    </div>
  );
}

/** Paints inner chrome above scrolling content so it can't cover the bezel corners. */
function InnerBezelMask() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 hidden rounded-[40px] shadow-[0_0_0_24px_#1c1c1e] min-[698px]:block"
      aria-hidden
    />
  );
}

function HomeIndicator() {
  return (
    <div className="hidden h-[34px] items-end justify-center bg-card pb-2 min-[698px]:flex" aria-hidden>
      <div className="h-[5px] w-[134px] rounded-full bg-[#1c1c1e]" />
    </div>
  );
}

/**
 * Framed layout min width:
 * 24 (start) + 224 (side w-56) + 24 (gap) + 402 (phone) + 24 (end) = 698
 * Below that: full-bleed app only. Same for customer + partner.
 */
const phoneShellClass = [
  "relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-background",
  "min-[698px]:aspect-[402/874] min-[698px]:h-[min(874px,calc(100dvh-4rem))] min-[698px]:w-auto min-[698px]:max-h-[calc(100dvh-4rem)] min-[698px]:shrink-0",
  "min-[698px]:rounded-[48px] min-[698px]:border-[7px] min-[698px]:border-[#1c1c1e] min-[698px]:bg-[#1c1c1e] min-[698px]:p-[2px] min-[698px]:shadow-device",
].join(" ");

export function DeviceFrame({ children, nav, side }: { children: ReactNode; nav: ReactNode; side: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideBottomNav = /\/chats\/[^/]+\/?$/.test(pathname);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div
      className={cn(
        "min-h-dvh",
        "min-[698px]:flex min-[698px]:items-center min-[698px]:justify-center",
        "min-[698px]:gap-6 min-[698px]:bg-muted/40 min-[698px]:px-6 min-[698px]:py-8",
      )}
    >
      <aside className="hidden shrink-0 min-[698px]:flex min-[698px]:items-center">{side}</aside>

      <div className={phoneShellClass}>
        <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-background min-[698px]:rounded-[40px]">
          <div
            ref={scrollRef}
            data-device-scroll
            className={cn(
              "no-scrollbar relative z-0 min-h-0 flex-1",
              hideBottomNav ? "flex flex-col overflow-hidden" : "overflow-y-auto",
            )}
          >
            {children}
          </div>

          <div className="relative z-0 shrink-0 bg-card">
            {!hideBottomNav && nav}
            <HomeIndicator />
          </div>

          <InnerBezelMask />
          <DynamicIsland />
        </div>
      </div>
    </div>
  );
}

export function BottomNav({
  items,
}: {
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: number;
    iconClassName?: string;
  }[];
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="grid shrink-0 border-t border-border bg-card px-1 pt-1.5 pb-1.5"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((it) => {
        const active = it.exact ? pathname === it.to || pathname === `${it.to}/` : pathname.startsWith(it.to);
        const I = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "relative flex flex-col items-center gap-0.5 rounded-md px-0.5 py-1 text-[10.5px] font-medium leading-none",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="relative grid size-6 shrink-0 place-items-center">
              <I className={cn("size-5", it.iconClassName)} />
              {!!it.badge && (
                <span className="figure absolute -top-1 -end-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground ring-2 ring-card">
                  {it.badge > 9 ? "9+" : it.badge}
                </span>
              )}
            </span>
            <span className="h-3.5 max-w-full truncate text-center leading-none">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ScreenHeader({ title, back, right, sub }: { title: string; back?: boolean; right?: ReactNode; sub?: string }) {
  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background pt-0 min-[698px]:pt-[59px]">
      <div className="flex items-center gap-2 px-4 py-3">
        {back && (
          <button
            type="button"
            onClick={() => window.history.back()}
            aria-label="رجوع"
            className="-ms-1 grid size-8 place-items-center rounded-md hover:bg-muted"
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-extrabold">{title}</h1>
          {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
        </div>
        {right}
      </div>
    </header>
  );
}
