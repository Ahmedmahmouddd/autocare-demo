import { useState } from "react";
import { Camera, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarket } from "@/lib/market/store";
import { formatTime } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { cn } from "@/lib/utils";

export function ChatView({ threadId, as }: { threadId: string; as: "customer" | "partner" }) {
  const thread = useMarket((s) => s.chats.find((c) => c.id === threadId));
  const [text, setText] = useState("");
  if (!thread) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    toastDemoOnly();
    setText("");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="no-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">رحّب — صف المشكلة أو اسأل عن السعر.</p>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={cn("flex", m.from === as ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[78%] rounded-xl px-3 py-2 text-sm",
                m.from === as ? "rounded-br-sm bg-ink text-ink-foreground" : "rounded-bl-sm bg-card shadow-card",
              )}
            >
              {m.text}
              <div className={cn("figure mt-1 text-[10px]", m.from === as ? "text-ink-muted" : "text-muted-foreground")}>
                {formatTime(m.at)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="flex shrink-0 gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="outline" size="icon" aria-label="إرفاق صورة أو فيديو">
          <Camera />
        </Button>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="رسالة" aria-label="رسالة" />
        <Button type="submit" size="icon" aria-label="إرسال">
          <SendHorizonal />
        </Button>
      </form>
    </div>
  );
}
