import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <rect width="32" height="32" rx="7" className="fill-primary" />
      <path d="M8 21.5 13.2 9h5.6L24 21.5h-4.2l-1-2.6h-5.6l-1 2.6H8Zm6.4-5.8h3.2L16 11.6l-1.6 4.1Z" className="fill-primary-foreground" />
      <rect x="8" y="23.5" width="16" height="2" rx="1" className="fill-primary-foreground/60" />
    </svg>
  );
}

export function Logo({ className, sub }: { className?: string; sub?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={sub ? "size-9" : "size-7"} />
      <div className="leading-none">
        <div className="font-display text-[17px] font-extrabold tracking-tight">{APP_NAME}</div>
        {sub && <div className="eyebrow mt-0.5 !text-[11px]">{sub}</div>}
      </div>
    </div>
  );
}
