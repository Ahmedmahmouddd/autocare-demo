import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutDashboard, Smartphone, Wrench } from "lucide-react";
import { Logo } from "@/components/market/Logo";
import { APP_NAME } from "@/lib/brand";
import { LIFECYCLE, statusLabel } from "@/lib/market/rules";
import { useMarket } from "@/lib/market/store";
import hero from "@/assets/workshop-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP_NAME} — عرض تفاعلي لسوق خدمات السيارات` },
      { name: "description", content: "جوّل في تطبيق العميل وتطبيق الشريك ولوحة التحكم في AutoCare مع بيانات تجريبية من الرياض وجدة." },
      { property: "og:title", content: `${APP_NAME} — عرض تفاعلي للسوق` },
      { property: "og:description", content: "تطبيق العميل والشريك ولوحة التحكم لسوق صيانة وإصلاح السيارات في المملكة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const APPS = [
  {
    to: "/customer" as const,
    icon: Smartphone,
    label: "تطبيق العميل",
    who: "مالكو السيارات",
    body: "تصفّح الورش والفنيين المتنقلين، اطلب عروضًا، قارنها، ادفع داخل التطبيق واحتفظ بسجل صيانة كل سيارة في مرآبي.",
  },
  {
    to: "/partner" as const,
    icon: Wrench,
    label: "تطبيق الشريك",
    who: "ورش ومستقلون",
    body: "ردّ على الطلبات بعروض، نفّذ الأعمال من القبول حتى الإنجاز، وأدر الخدمات والأسعار وتابع الأرباح قبل التحويل الشهري.",
  },
  {
    to: "/admin" as const,
    icon: LayoutDashboard,
    label: "لوحة التحكم",
    who: "فريق AutoCare",
    body: "اعتمد الشركاء، تابع الطلبات والمعاملات، اضبط العمولات، فعّل أكواد الخصم وسوِّ التحويلات الشهرية.",
  },
];

function Index() {
  const partners = useMarket((s) => s.partners);
  const services = useMarket((s) => s.services);
  const orders = useMarket((s) => s.orders);
  const approved = partners.filter((p) => p.status === "approved");

  return (
    <div className="min-h-dvh">
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img src={hero} alt="فني يفحص سيارة على رافعة عند الغروب" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-6 md:px-10">
          <div className="flex items-center justify-between">
            <Logo sub="الرياض · جدة" />
            <span className="eyebrow !text-ink-muted">عرض تفاعلي · بيانات تجريبية</span>
          </div>
          <div className="mt-20 max-w-2xl animate-rise">
            <div className="eyebrow !text-primary">سوق صيانة وإصلاح السيارات</div>
            <h1 className="mt-4 text-5xl font-black leading-none md:text-7xl">
              <span className="block">الفني المناسب</span>
              <span className="mt-3 block whitespace-nowrap text-primary max-sm:text-[1.85rem] md:mt-4">
                لصيانة وإصلاح سيارتك
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-muted">
              يربط {APP_NAME} مالكي السيارات بورش معتمدة وفنيين مستقلين — من تشغيل على الطريق إلى صيانة السير — مع دفع داخل التطبيق وسجل خدمة لكل سيارة.
            </p>
          </div>
          <dl className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-ink-foreground/15 pt-6">
            {[
              [approved.length, "شركاء معتمدون"],
              [services.filter((s) => s.active).length, "خدمات معروضة"],
              [orders.length, "طلبات في العرض"],
            ].map(([n, l]) => (
              <div key={l as string}>
                <dt className="eyebrow !text-ink-muted">{l}</dt>
                <dd className="figure mt-1 text-3xl font-semibold">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="eyebrow">ثلاثة تطبيقات · سوق واحد</div>
        <h2 className="mt-2 text-3xl font-extrabold">اختر دورك في المنصة</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">كل شيء مترابط: العرض الذي ترسله كشريك يظهر للعميل، والدفع يظهر في لوحة التحكم مع عمولة محسوبة مسبقًا.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {APPS.map((a) => (
            <Link key={a.to} to={a.to} className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <div className="grid size-11 place-items-center rounded-lg bg-ink text-ink-foreground"><a.icon className="size-5" /></div>
                <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </div>
              <div className="eyebrow mt-6">{a.who}</div>
              <h3 className="mt-1 text-xl font-extrabold">{a.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
          <div className="eyebrow">دورة الطلب</div>
          <h2 className="mt-2 text-2xl font-extrabold">من الطلب إلى التقييم</h2>
          <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4 lg:grid-cols-7">
            {LIFECYCLE.map((s, i) => (
              <li key={s} className="bg-card p-4">
                <div className="figure text-xs text-primary">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-2 text-sm font-semibold">{statusLabel(s)}</div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">تأكيد استلام السيارة يفتح الدفع — لا يكتمل الطلب إلا بعد نجاح الدفع، وعندها يتاح التقييم للطرفين.</p>
        </div>
      </section>
    </div>
  );
}