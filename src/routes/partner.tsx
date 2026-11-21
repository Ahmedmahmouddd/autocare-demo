import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Banknote, Briefcase, Home, Inbox, Wrench } from "lucide-react";
import { BottomNav, DemoSidePanel, DeviceFrame } from "@/components/market/DeviceFrame";
import { useMarket } from "@/lib/market/store";
import { pageHead } from "@/lib/brand";
import { ACTIVE_STATUSES } from "@/lib/market/rules";

export const Route = createFileRoute("/partner")({
  head: () => pageHead("تطبيق الشريك", "رد على الطلبات، نفّذ الأعمال وتابع الأرباح على AutoCare."),
  component: PartnerLayout,
});

function PartnerLayout() {
  const partnerId = useMarket((s) => s.activePartnerId);
  const orders = useMarket((s) => s.orders);
  const requests = orders.filter(
    (o) => (o.status === "pending" || o.status === "offers_received") && !o.declinedBy.includes(partnerId) && !o.partnerId,
  ).length;
  const active = orders.filter((o) => o.partnerId === partnerId && ACTIVE_STATUSES.includes(o.status)).length;

  return (
    <DeviceFrame
      side={
        <DemoSidePanel
          current="partner"
          tips={[
            "أرسل عرضًا لطلب معلّق من تبويب الطلبات.",
            "ابدأ العمل على طلب مقبول بعد دفع العربون.",
            "علّم الطلب منجزًا ثم تابعه من تطبيق العميل.",
            "عطّل خدمة من صفحة الخدمات لإخفائها من البحث.",
          ]}
        />
      }
      nav={
        <BottomNav
          items={[
            { to: "/partner", label: "الرئيسية", icon: Home, exact: true },
            { to: "/partner/requests", label: "الطلبات", icon: Inbox, badge: requests },
            { to: "/partner/orders", label: "الأعمال", icon: Briefcase, badge: active },
            { to: "/partner/services", label: "الخدمات", icon: Wrench },
            { to: "/partner/earnings", label: "الأرباح", icon: Banknote },
          ]}
        />
      }
    >
      <Outlet />
    </DeviceFrame>
  );
}