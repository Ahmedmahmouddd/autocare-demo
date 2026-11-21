import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, LocateFixed, Siren, X } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { Plate, Price } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatMileageRange, pageHead } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { CUSTOMER_LOCATION } from "@/lib/market/selectors";
import { useMarket } from "@/lib/market/store";
import type { DeliveryMethod } from "@/lib/market/types";
import { cn } from "@/lib/utils";
import garagePhoto from "@/assets/garage-bay.jpg";

type Search = { serviceId?: string; partnerId?: string; categoryId?: string; urgent?: boolean };

export const Route = createFileRoute("/customer/request")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    serviceId: typeof s.serviceId === "string" ? s.serviceId : undefined,
    partnerId: typeof s.partnerId === "string" ? s.partnerId : undefined,
    categoryId: typeof s.categoryId === "string" ? s.categoryId : undefined,
    urgent: s.urgent === true || s.urgent === "true" ? true : undefined,
  }),
  head: () => pageHead("طلب خدمة", "صِف المشكلة، اختر سيارتك وموقعك، واحصل على عروض من شركاء AutoCare."),
  component: RequestPage,
});

function RequestPage() {
  const search = Route.useSearch();
  const customerId = useMarket((s) => s.customerId);
  const allVehicles = useMarket((s) => s.vehicles);
  const categories = useMarket((s) => s.categories);
  const services = useMarket((s) => s.services);
  const partners = useMarket((s) => s.partners);
  const vehicles = allVehicles.filter((v) => v.customerId === customerId);
  const service = services.find((s) => s.id === search.serviceId);
  const partner = partners.find((p) => p.id === (search.partnerId ?? service?.partnerId));

  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(service?.categoryId ?? search.categoryId ?? "");
  const [title, setTitle] = useState(service?.name ?? (search.urgent ? "تعطلت السيارة — أحتاج مساعدة" : ""));
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>(search.urgent ? "roadside" : (service?.methods[0] ?? "garage"));
  const [urgent, setUrgent] = useState(!!search.urgent);
  const [useCurrent, setUseCurrent] = useState(true);
  const [manualLocation, setManualLocation] = useState("");
  const [media, setMedia] = useState(0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !categoryId || !title.trim()) {
      toast.error("اختر السيارة ونوع الخدمة وأضف عنوانًا مختصرًا.");
      return;
    }
    toastDemoOnly();
  };

  return (
    <div className="pb-8">
      <ScreenHeader title={urgent ? "مساعدة على الطريق" : "طلب خدمة"} back />
      <form onSubmit={onSubmit} className="space-y-5 px-4 pt-4">
        {urgent && (
          <div className="flex items-center gap-3 overflow-hidden rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="hazard w-2 self-stretch" />
            <Siren className="size-5 text-destructive" />
            <p className="py-2.5 pr-3 text-xs">يُشارك موقعك المباشر مع فنيي الطريق القريبين. غالبًا تصل العروض خلال دقائق.</p>
          </div>
        )}
        {service && partner && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div>
              <div className="eyebrow">الحجز من</div>
              <div className="text-sm font-semibold">{partner.name}</div>
              <div className="text-xs text-muted-foreground">{service.name}</div>
            </div>
            <Price amount={service.price} type={service.priceType} size="sm" className="text-right" />
          </div>
        )}

        <div className="space-y-2">
          <Label>أي سيارة؟</Label>
          <div className="grid gap-2">
            {vehicles.map((v) => (
              <button type="button" key={v.id} onClick={() => setVehicleId(v.id)} className={cn("flex items-center justify-between rounded-lg border p-3 text-left", vehicleId === v.id ? "border-primary bg-accent/40" : "border-border bg-card")}>
                <div>
                  <div className="text-sm font-semibold">{v.year} {v.make} {v.model}</div>
                  <div className="figure text-[11px] text-muted-foreground">{formatMileageRange(v.mileage)}</div>
                </div>
                <Plate value={v.plate} />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat">نوع الخدمة</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="cat"><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">ما المشكلة؟</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: صرير في الفرامل" />
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="متى بدأت؟ أي أصوات أو مؤشرات أو روائح؟" rows={3} aria-label="الوصف" />
        </div>

        <div className="space-y-2">
          <Label>صور أو فيديو</Label>
          <div className="flex gap-2">
            {Array.from({ length: media }).map((_, i) => (
              <div key={i} className="relative size-16 overflow-hidden rounded-md">
                <img src={garagePhoto} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="إزالة" onClick={() => setMedia((m) => m - 1)} className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-ink/80 text-ink-foreground"><X className="size-3" /></button>
              </div>
            ))}
            {media < 4 && (
              <button type="button" onClick={() => setMedia((m) => m + 1)} className="grid size-16 place-items-center rounded-md border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary" aria-label="إضافة صورة">
                <Camera className="size-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>كيف تُنفَّذ الخدمة؟</Label>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as DeliveryMethod)} className="grid grid-cols-3 gap-2">
            {([["garage", "في الورشة"], ["mobile", "يصل إلي"], ["roadside", "على الطريق"]] as const).map(([v, l]) => (
              <Label key={v} htmlFor={`m-${v}`} className={cn("flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border p-2.5 text-xs", method === v ? "border-primary bg-accent/40" : "border-border bg-card")}>
                <RadioGroupItem id={`m-${v}`} value={v} className="sr-only" />
                {l}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>الموقع</Label>
          <button type="button" onClick={() => setUseCurrent(true)} className={cn("flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm", useCurrent ? "border-primary bg-accent/40" : "border-border bg-card")}>
            <LocateFixed className="size-4 text-primary" /> استخدم موقعي الحالي <span className="ml-auto text-xs text-muted-foreground">{CUSTOMER_LOCATION.label}</span>
          </button>
          <Input value={manualLocation} onFocus={() => setUseCurrent(false)} onChange={(e) => setManualLocation(e.target.value)} placeholder="أو اكتب منطقة، مثل العليا" aria-label="الموقع يدويًا" />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div>
            <Label htmlFor="urgent">عاجل — السيارة لا تتحرك</Label>
            <p className="text-xs text-muted-foreground">يعطي أولوية للشركاء المؤهلين للطريق</p>
          </div>
          <Switch id="urgent" checked={urgent} onCheckedChange={setUrgent} />
        </div>

        <p className="text-xs text-muted-foreground">لا يعيّن AutoCare فنيًا لك — يرسل الشركاء عروضًا وأنت تختار.</p>
        <Button type="submit" variant="signal" size="xl">إرسال الطلب</Button>
      </form>
    </div>
  );
}