import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Wrench } from "lucide-react";
import { toast } from "sonner";
import { ScreenHeader } from "@/components/market/DeviceFrame";
import { CategoryIcon, EmptyState, MethodChips, Price } from "@/components/market/bits";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/brand";
import { toastDemoOnly } from "@/lib/demo";
import { useMarket } from "@/lib/market/store";
import type { DeliveryMethod, PriceType, Service } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/partner/services")({
  head: () => pageHead("خدماتك", "أدر الخدمات المعروضة والأسعار والظهور."),
  component: PartnerServices,
});

const METHOD_OPTIONS: { id: DeliveryMethod; label: string }[] = [
  { id: "garage", label: "في الورشة" },
  { id: "mobile", label: "يصل إليك" },
  { id: "roadside", label: "على الطريق" },
];

type FormState = {
  name: string;
  categoryId: string;
  description: string;
  price: string;
  priceType: PriceType;
  durationMin: string;
  methods: DeliveryMethod[];
  inspectionNote: boolean;
  active: boolean;
};

const emptyForm = (categoryId: string): FormState => ({
  name: "",
  categoryId,
  description: "",
  price: "100",
  priceType: "fixed",
  durationMin: "60",
  methods: ["garage"],
  inspectionNote: false,
  active: true,
});

function fromService(s: Service): FormState {
  return {
    name: s.name,
    categoryId: s.categoryId,
    description: s.description,
    price: String(s.price),
    priceType: s.priceType,
    durationMin: String(s.durationMin),
    methods: [...s.methods],
    inspectionNote: s.inspectionNote,
    active: s.active,
  };
}

function PartnerServices() {
  const partnerId = useMarket((s) => s.activePartnerId);
  const services = useMarket((s) => s.services);
  const categories = useMarket((s) => s.categories);
  const mine = services.filter((s) => s.partnerId === partnerId);
  const defaultCat = categories[0]?.id ?? "oil";

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultCat));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(defaultCat));
    setOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm(fromService(s));
    setOpen(true);
  };

  const toggle = () => {
    toastDemoOnly();
  };

  const toggleMethod = (m: DeliveryMethod) => {
    setForm((f) => {
      const has = f.methods.includes(m);
      if (has && f.methods.length === 1) return f;
      return { ...f, methods: has ? f.methods.filter((x) => x !== m) : [...f.methods, m] };
    });
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("أدخل اسم الخدمة");
      return;
    }
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("أدخل سعراً صحيحاً");
      return;
    }
    if (!form.methods.length) {
      toast.error("اختر طريقة تنفيذ واحدة على الأقل");
      return;
    }

    toastDemoOnly();
    setOpen(false);
  };

  const onDelete = () => {
    if (!editingId) return;
    toastDemoOnly();
    setOpen(false);
  };

  return (
    <div className="pb-6">
      <ScreenHeader
        title="الخدمات"
        sub="أضف خدماتك وعدّل الأسعار والظهور في البحث"
        right={
          <Button size="sm" onClick={openCreate}>
            <Plus /> إضافة
          </Button>
        }
      />
      <div className="space-y-2 px-4 pt-3">
        {mine.map((s) => {
          const cat = categories.find((c) => c.id === s.categoryId);
          return (
            <div key={s.id} className="flex gap-3 rounded-lg border border-border bg-card p-3 shadow-card">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                <CategoryIcon icon={cat?.icon ?? "wrench"} className="size-5" />
              </div>
              <button type="button" onClick={() => openEdit(s)} className="min-w-0 flex-1 text-start">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">{s.name}</span>
                  <Pencil className="size-3 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.description}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <MethodChips methods={s.methods} />
                  <Price amount={s.price} type={s.priceType} size="sm" />
                </div>
              </button>
              <Switch checked={s.active} onCheckedChange={() => toggle()} aria-label={`تبديل ${s.name}`} className="mt-1" />
            </div>
          );
        })}
        {!mine.length && (
          <EmptyState icon={Wrench} title="لا خدمات بعد" body="أضف أول خدمة لتظهر في بحث العملاء." />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "تعديل الخدمة" : "إضافة خدمة"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="svc-name">اسم الخدمة</Label>
              <Input
                id="svc-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="مثال: تغيير زيت كامل"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>التصنيف</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger aria-label="التصنيف">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="svc-price">السعر (ر.س)</Label>
                <Input
                  id="svc-price"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>نوع السعر</Label>
                <Select
                  value={form.priceType}
                  onValueChange={(v) => setForm((f) => ({ ...f, priceType: v as PriceType }))}
                >
                  <SelectTrigger aria-label="نوع السعر">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">سعر ثابت</SelectItem>
                    <SelectItem value="starting">يبدأ من</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-duration">المدة التقديرية (دقيقة)</Label>
              <Input
                id="svc-duration"
                inputMode="numeric"
                value={form.durationMin}
                onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>طرق التنفيذ</Label>
              <div className="flex flex-wrap gap-2">
                {METHOD_OPTIONS.map((m) => {
                  const on = form.methods.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMethod(m.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                      )}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="svc-desc">الوصف</Label>
              <Textarea
                id="svc-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="ماذا تشمل الخدمة؟"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <div>
                <div className="text-sm font-semibold">السعر قد يتغير بعد الفحص</div>
                <p className="text-[11px] text-muted-foreground">يظهر تنبيه للعميل عند الحجز</p>
              </div>
              <Switch
                checked={form.inspectionNote}
                onCheckedChange={(v) => setForm((f) => ({ ...f, inspectionNote: v }))}
                aria-label="تنبيه الفحص"
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
              <div>
                <div className="text-sm font-semibold">ظاهرة في البحث</div>
                <p className="text-[11px] text-muted-foreground">إيقافها يخفيها عن العملاء</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                aria-label="الظهور في البحث"
              />
            </div>

            <div className="flex gap-2 pt-1">
              {editingId && (
                <Button type="button" variant="outline" className="text-destructive" onClick={onDelete}>
                  حذف
                </Button>
              )}
              <Button type="submit" className="flex-1">
                {editingId ? "حفظ التعديلات" : "إضافة الخدمة"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
