import { createFileRoute } from "@tanstack/react-router";
import { ChatView } from "@/components/market/ChatView";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { pageHead } from "@/lib/brand";
import { useMarket } from "@/lib/market/store";

export const Route = createFileRoute("/customer/chats/$threadId")({
  head: () => pageHead("محادثة", "راسل شريكك على AutoCare."),
  component: CustomerChatThread,
});

function CustomerChatThread() {
  const { threadId } = Route.useParams();
  const thread = useMarket((s) => s.chats.find((c) => c.id === threadId));
  const partner = useMarket((s) => s.partners.find((p) => p.id === thread?.partnerId));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScreenHeader title={partner?.name ?? "محادثة"} back />
      {thread ? (
        <ChatView threadId={threadId} as="customer" />
      ) : (
        <p className="p-6 text-sm text-muted-foreground">المحادثة غير موجودة.</p>
      )}
    </div>
  );
}
