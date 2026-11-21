import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { EmptyState, Initials, PHOTOS } from "@/components/market/bits";
import { formatDateTime, pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/chats/")({
  head: () => pageHead("المحادثات", "راسل ورش AutoCare والفنيين المستقلين."),
  component: CustomerChats,
});

function CustomerChats() {
  const customerId = useMarket((s) => s.customerId);
  const allChats = useMarket((s) => s.chats);
  const partners = useMarket((s) => s.partners);
  const chats = useMemo(() => allChats.filter((c) => c.customerId === customerId), [allChats, customerId]);

  return (
    <div className="pb-6">
      <ScreenHeader title="المحادثات" />
      <div className="space-y-2 px-4 pt-3">
        {chats.map((c) => {
          const p = partners.find((x) => x.id === c.partnerId);
          const last = c.messages[c.messages.length - 1];
          return (
            <Link
              key={c.id}
              to="/customer/chats/$threadId"
              params={{ threadId: c.id }}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card hover:border-primary/40"
            >
              {p ? <img src={PHOTOS[p.photo]} alt="" className="size-11 rounded-md object-cover" /> : <Initials name="?" />}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold">{p?.name ?? "شريك"}</div>
                  {last && <span className="figure shrink-0 text-[10px] text-muted-foreground">{formatDateTime(last.at)}</span>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{last?.text ?? "لا رسائل بعد"}</p>
              </div>
            </Link>
          );
        })}
        {!chats.length && <EmptyState icon={MessageCircle} title="لا محادثات بعد" body="افتح ملف مزود واضغط محادثة لبدء التواصل." />}
      </div>
    </div>
  );
}
