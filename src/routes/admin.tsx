import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Banknote,
  LayoutDashboard,
  Map,
  MessageSquare,
  Percent,
  Receipt,
  ShoppingBag,
  Tag,
  Users,
  UserCircle,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/market/Logo";
import { pageHead } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => pageHead("لوحة التحكم", "تشغيل سوق AutoCare — الشركاء والطلبات والمدفوعات وأكواد الخصم."),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { to: "/admin/partners", label: "الشركاء", icon: Wrench },
  { to: "/admin/customers", label: "العملاء", icon: UserCircle },
  { to: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { to: "/admin/transactions", label: "المعاملات", icon: Receipt },
  { to: "/admin/commission", label: "العمولة", icon: Percent },
  { to: "/admin/promos", label: "أكواد الخصم", icon: Tag },
  { to: "/admin/payouts", label: "التحويلات", icon: Banknote },
  { to: "/admin/reviews", label: "التقييمات", icon: MessageSquare },
  { to: "/admin/map", label: "الخريطة", icon: Map },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-7xl gap-0 lg:gap-8">
        <aside className="hidden w-56 shrink-0 border-r border-border px-4 py-6 lg:block">
          <Link to="/">
            <Logo sub="لوحة التحكم" />
          </Link>
          <nav className="mt-8 space-y-0.5">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to || pathname === `${item.to}/` : pathname.startsWith(item.to);
              const I = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                    active ? "bg-ink text-ink-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <I className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <DemoAppLinks />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:py-8">
          <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    active ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function DemoAppLinks() {
  return (
    <div className="mt-10 space-y-2 border-t border-border pt-6">
      <div className="eyebrow">تطبيقات العرض</div>
      <Link to="/customer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <Users className="size-4" /> تطبيق العميل
      </Link>
      <Link to="/partner" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <Wrench className="size-4" /> تطبيق الشريك
      </Link>
    </div>
  );
}