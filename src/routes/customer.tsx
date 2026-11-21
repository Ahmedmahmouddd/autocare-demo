import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Car, Compass, MessageCircle, ReceiptText, Wallet } from "lucide-react";
import { BottomNav, DemoSidePanel, DeviceFrame } from "@/components/market/DeviceFrame";
import { useMarket } from "@/lib/market/store";
import { pageHead } from "@/lib/brand";

export const Route = createFileRoute("/customer")({
  head: () => pageHead("تطبيق العميل", "اعثر على ورش وفنيين في الرياض، قارن العروض، ادفع داخل التطبيق وتابع سجل صيانة سيارتك."),
  component: CustomerLayout,
});

function CustomerLayout() {
  const orders = useMarket((s) => s.orders);
  const customerId = useMarket((s) => s.customerId);
  const actionable = orders.filter((o) => o.customerId === customerId && ["offers_received", "awaiting_confirmation", "awaiting_payment"].includes(o.status)).length;
  return (
    <DeviceFrame
      side={
        <DemoSidePanel
          current="customer"
          tips={[
            "افتح الطلبات ← «مؤشر المحرك» وقارن العروض الثلاثة.",
            "افتح طلب التكييف، أكّد استلام السيارة، ثم ادفع.",
            "جرّب رفض البطاقة أولًا — يبقى الطلب غير مدفوع.",
            "أضف تقييمًا ثم شاهده في لوحة التحكم.",
          ]}
        />
      }
      nav={
        <BottomNav
          items={[
            { to: "/customer", label: "استكشف", icon: Compass, exact: true },
            { to: "/customer/orders", label: "الطلبات", icon: ReceiptText, badge: actionable },
            { to: "/customer/garage", label: "الجراچ", icon: Car, iconClassName: "size-[22px] stroke-[1.5]" },
            { to: "/customer/chats", label: "المحادثات", icon: MessageCircle },
            { to: "/customer/wallet", label: "المدفوعات", icon: Wallet },
          ]}
        />
      }
    >
      <Outlet />
    </DeviceFrame>
  );
}