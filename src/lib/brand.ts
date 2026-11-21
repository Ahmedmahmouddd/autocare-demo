export const APP_NAME = "AutoCare";
export const CURRENCY = "SAR";
export const TIME_ZONE = "Asia/Riyadh";

/** Arabic locale with Western (Latin) digits 0–9 everywhere. */
const LOCALE = "ar-SA-u-nu-latn";

const moneyFmt = new Intl.NumberFormat(LOCALE, {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number) {
  return `ر.س ${moneyFmt.format(Math.round(amount * 100) / 100)}`;
}

export function formatNumber(n: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(LOCALE, opts).format(n);
}

/** Approximate odometer band — we don't track exact km in the demo. */
export function formatMileageRange(km: number) {
  const step = 5000;
  const lo = Math.floor(km / step) * step;
  const hi = lo + step;
  return `${formatNumber(lo / 1000)}–${formatNumber(hi / 1000)} ألف كم`;
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});
const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

export function pageHead(title: string, description: string) {
  const full = `${title} · ${APP_NAME}`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}