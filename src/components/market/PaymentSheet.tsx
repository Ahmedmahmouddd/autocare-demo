import { useState } from "react";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Simulated payment gateway checkout. The gateway provider is still an open decision. */
export function PaymentSheet({
  open, onOpenChange, amount, title, lines, onPay,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
  title: string;
  lines: { label: string; value: string; strong?: boolean }[];
  onPay: (succeed: boolean) => boolean;
}) {
  const [method, setMethod] = useState<"mada" | "apple">("mada");
  const [busy, setBusy] = useState(false);
  const pay = (succeed: boolean) => {
    setBusy(true);
    setTimeout(() => {
      const ok = onPay(succeed);
      setBusy(false);
      if (ok) onOpenChange(false);
    }, 900);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>دفع آمن داخل التطبيق</DialogDescription>
        </DialogHeader>
        <dl className="space-y-1.5 rounded-lg bg-muted p-3 text-sm">
          {lines.map((l) => (
            <div key={l.label} className={cn("flex justify-between", l.strong && "border-t border-border pt-1.5 font-semibold")}>
              <dt className={l.strong ? "" : "text-muted-foreground"}>{l.label}</dt>
              <dd className="figure">{l.value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-2">
          {([["mada", "mada •• 4821", CreditCard], ["apple", "Apple Pay", Smartphone]] as const).map(([k, l, I]) => (
            <button key={k} type="button" onClick={() => setMethod(k)} className={cn("flex items-center gap-2 rounded-lg border p-3 text-sm", method === k ? "border-primary bg-accent/40" : "border-border")}>
              <I className="size-4" /> {l}
            </button>
          ))}
        </div>
        <Button variant="signal" size="xl" disabled={busy} onClick={() => pay(true)}>
          {busy ? <Loader2 className="animate-spin" /> : null} ادفع {formatMoney(amount)}
        </Button>
        <button type="button" disabled={busy} onClick={() => pay(false)} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
          للعرض: محاكاة رفض البطاقة
        </button>
      </DialogContent>
    </Dialog>
  );
}
