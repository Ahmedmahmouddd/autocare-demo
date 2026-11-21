import { computeSettlement, commissionRateFor } from "./rules";
import type {
  Category,
  ChatThread,
  City,
  CommissionConfig,
  Customer,
  MaintenanceRecord,
  Order,
  Partner,
  Payout,
  PromoCode,
  Review,
  Service,
  Transaction,
  Vehicle,
} from "./types";

export const DEMO_CUSTOMER_ID = "c1";
export const DEMO_PARTNER_ID = "p1";

export const cities: City[] = [
  { id: "riyadh", name: "الرياض", active: true, areas: ["العليا", "الملقا", "النخيل", "السليمانية", "الياسمين", "الروضة", "النسيم", "الملز"] },
  { id: "jeddah", name: "جدة", active: true, areas: ["الحمراء", "الروضة", "الشاطئ", "الصفا"] },
  { id: "dammam", name: "الدمام", active: false, areas: ["الفيصلية", "الشاطئ"] },
];

export const categories: Category[] = [
  { id: "oil", name: "الزيوت والسوائل", icon: "droplet" },
  { id: "brakes", name: "الفرامل", icon: "disc" },
  { id: "tyres", name: "الإطارات والعجلات", icon: "circle-dot" },
  { id: "battery", name: "البطارية والكهرباء", icon: "battery" },
  { id: "diagnostics", name: "التشخيص والفحص", icon: "scan" },
  { id: "engine", name: "إصلاح المحرك", icon: "wrench" },
  { id: "ac", name: "التكييف والتبريد", icon: "snowflake" },
  { id: "roadside", name: "مساعدة على الطريق", icon: "siren" },
];

const docsGarage = [
  { name: "السجل التجاري", status: "verified" as const },
  { name: "رخصة البلدية", status: "verified" as const },
  { name: "هوية المالك الوطنية", status: "verified" as const },
];
const docsFreelancer = [
  { name: "الهوية الوطنية / الإقامة", status: "verified" as const },
  { name: "رخصة القيادة", status: "verified" as const },
  { name: "شهادة الحرفة", status: "verified" as const },
];

export const partners: Partner[] = [
  {
    id: "p1", type: "garage", name: "ورش العليا للسيارات", ownerName: "فهد الراشد", phone: "+966 5• ••• 0141",
    cityId: "riyadh", area: "العليا", lat: 24.6936, lng: 46.6853, methods: ["garage", "mobile"],
    hours: "السبت–الخميس · 8:00–22:00", availableNow: true,
    bio: "ورشة متكاملة بأربعة أجنحة، متخصصة في السيارات اليابانية والكورية السيدان ودفع رباعي. فحص مجاني مع كل صيانة.",
    specialties: ["Toyota", "Hyundai", "أنظمة التكييف", "سيور التوقيت"], brands: ["Toyota", "Hyundai", "Kia", "Nissan"],
    joinedAt: "2025-09-14T09:00:00Z", status: "approved", docs: docsGarage, paymentPolicy: "after_completion", depositPercent: 0,
    payoutMethod: "مصرف الراجحي ••4410", photo: "garage", staffCount: 6,
  },
  {
    id: "p2", type: "garage", name: "مركز الملز للفرامل والإطارات", ownerName: "ناصر السبيعي", phone: "+966 5• ••• 2290",
    cityId: "riyadh", area: "الملز", lat: 24.662, lng: 46.729, methods: ["garage"],
    hours: "يومياً · 9:00–23:00", availableNow: true,
    bio: "فرامل وإطارات وترصيف وموازنة أثناء الانتظار. قطع أصلية ومعتمدة من الأسواق.",
    specialties: ["فحمات وأقراص الفرامل", "ترصيف العجلات", "الإطارات"], brands: ["جميع الماركات"],
    joinedAt: "2025-10-02T09:00:00Z", status: "approved", docs: docsGarage, paymentPolicy: "deposit", depositPercent: 30,
    payoutMethod: "الأهلي ••9021", photo: "workshop", staffCount: 4,
  },
  {
    id: "p3", type: "freelancer", name: "ماجد الزهراني", ownerName: "ماجد الزهراني", phone: "+966 5• ••• 7713",
    cityId: "riyadh", area: "النخيل", lat: 24.748, lng: 46.644, coverageKm: 12, methods: ["mobile", "roadside"],
    hours: "يومياً · 7:00–23:00", availableNow: true,
    bio: "ميكانيكي متنقل بخبرة 11 سنة في وكالة تويوتا. أتيت إلى منزلك أو مكتبك بشاحنة مجهزة بالكامل.",
    specialties: ["التشخيص", "خدمة الزيت", "الفرامل"], brands: ["Toyota", "Lexus", "Honda"],
    joinedAt: "2025-11-20T09:00:00Z", status: "approved", docs: docsFreelancer, paymentPolicy: "after_completion", depositPercent: 0,
    payoutMethod: "STC Pay ••5530", photo: "mobile",
  },
  {
    id: "p4", type: "garage", name: "مختبر السليمانية للتشخيص", ownerName: "عبدالرحمن الفرج", phone: "+966 5• ••• 3307",
    cityId: "riyadh", area: "السليمانية", lat: 24.7049, lng: 46.7009, methods: ["garage", "mobile"],
    hours: "السبت–الخميس · 10:00–21:00", availableNow: false,
    bio: "تشخيص كمبيوتري بمستوى الوكالة، كشف أعطال كهربائية وفحص ما قبل الشراء مع تقرير مكتوب.",
    specialties: ["لمبات المحرك", "الكهرباء", "فحص ما قبل الشراء"], brands: ["جميع الماركات", "الماركات الألمانية"],
    joinedAt: "2025-08-30T09:00:00Z", status: "approved", docs: docsGarage, paymentPolicy: "after_completion", depositPercent: 0,
    payoutMethod: "بنك الرياض ••1187", photo: "garage", staffCount: 3,
  },
  {
    id: "p5", type: "freelancer", name: "تركي المطيري", ownerName: "تركي المطيري", phone: "+966 5• ••• 6624",
    cityId: "riyadh", area: "الياسمين", lat: 24.827, lng: 46.639, coverageKm: 15, methods: ["mobile", "roadside"],
    hours: "مساعدة على الطريق على مدار الساعة", availableNow: true,
    bio: "بطاريات وإشعال واستجابة كهربائية في شمال الرياض. متوسط الوصول أقل من 35 دقيقة.",
    specialties: ["البطاريات", "الإشعال", "المحرك الكهربائي والدينامو"], brands: ["جميع الماركات"],
    joinedAt: "2026-01-12T09:00:00Z", status: "approved", docs: docsFreelancer, paymentPolicy: "after_completion", depositPercent: 0,
    payoutMethod: "مصرف الراجحي ••0093", photo: "mobile",
  },
  {
    id: "p6", type: "garage", name: "نسيم موتورز والسطحات", ownerName: "مشعل العنزي", phone: "+966 5• ••• 4458",
    cityId: "riyadh", area: "النسيم", lat: 24.721, lng: 46.827, methods: ["garage", "roadside"],
    hours: "يومياً · 24 ساعة", availableNow: true,
    bio: "ورشة ثقيلة مع سطحات فردية في أنحاء الرياض. إصلاحات المحرك وناقل الحركة.",
    specialties: ["السطحات", "إعادة بناء المحرك", "ناقل الحركة"], brands: ["جميع الماركات", "البيك أب ودفع رباعي"],
    joinedAt: "2025-07-05T09:00:00Z", status: "approved", docs: docsGarage, paymentPolicy: "deposit", depositPercent: 25,
    payoutMethod: "مصرف الإنماء ••7731", photo: "workshop", staffCount: 9,
  },
  {
    id: "p7", type: "freelancer", name: "حسن العمري", ownerName: "حسن العمري", phone: "+966 5• ••• 8812",
    cityId: "riyadh", area: "الروضة", lat: 24.733, lng: 46.774, coverageKm: 10, methods: ["mobile"],
    hours: "السبت–الخميس · 16:00–23:00", availableNow: false,
    bio: "خدمة متنقلة مسائية لتغيير الزيت وشحن التكييف.",
    specialties: ["خدمة الزيت", "التكييف"], brands: ["جميع الماركات"],
    joinedAt: "2026-11-17T09:00:00Z", status: "pending",
    docs: [{ name: "الهوية الوطنية / الإقامة", status: "submitted" }, { name: "رخصة القيادة", status: "submitted" }, { name: "شهادة الحرفة", status: "missing" }],
    paymentPolicy: "after_completion", depositPercent: 0, payoutMethod: "غير محدد", photo: "mobile",
  },
  {
    id: "p8", type: "garage", name: "عناية الحمراء للسيارات", ownerName: "ياسر بكر", phone: "+966 5• ••• 1209",
    cityId: "jeddah", area: "الحمراء", lat: 21.52, lng: 39.15, methods: ["garage", "mobile"],
    hours: "السبت–الخميس · 9:00–22:00", availableNow: false,
    bio: "تلميع وصيانة وتكييف — أول فرع لنا على الكورنيش.",
    specialties: ["التكييف", "الصيانة الدورية"], brands: ["جميع الماركات"],
    joinedAt: "2026-11-18T09:00:00Z", status: "pending",
    docs: [{ name: "السجل التجاري", status: "submitted" }, { name: "رخصة البلدية", status: "submitted" }, { name: "هوية المالك الوطنية", status: "submitted" }],
    paymentPolicy: "after_completion", depositPercent: 0, payoutMethod: "غير محدد", photo: "garage", staffCount: 5,
  },
  {
    id: "p9", type: "freelancer", name: "سعد القرني", ownerName: "سعد القرني", phone: "+966 5• ••• 3376",
    cityId: "riyadh", area: "الملز", lat: 24.668, lng: 46.735, coverageKm: 8, methods: ["mobile"],
    hours: "يومياً · 10:00–20:00", availableNow: false,
    bio: "تركيب إطارات متنقل.", specialties: ["الإطارات"], brands: ["جميع الماركات"],
    joinedAt: "2025-12-01T09:00:00Z", status: "suspended", docs: docsFreelancer, paymentPolicy: "after_completion", depositPercent: 0,
    payoutMethod: "الأهلي ••2201", photo: "mobile",
  },
];

let sid = 0;
const svc = (partnerId: string, categoryId: string, name: string, price: number, priceType: "fixed" | "starting", methods: Service["methods"], durationMin: number, description: string, inspectionNote = false): Service => ({
  id: `s${++sid}`, partnerId, categoryId, name, price, priceType, methods, durationMin, description, inspectionNote, active: true,
});

export const services: Service[] = [
  svc("p1", "oil", "تغيير زيت صناعي + فلتر", 220, "starting", ["garage", "mobile"], 45, "زيت صناعي كامل 5W-30 أو حسب مواصفات الشركة، فلتر زيت جديد وفحص من 20 نقطة. السعر يعتمد على سعة زيت المحرك.", true),
  svc("p1", "ac", "شحن تكييف وفحص تسرب", 220, "fixed", ["garage"], 60, "اختبار تفريغ، صباغ أشعة للتسرب وإعادة شحن R134a/R1234yf حسب مواصفات المصنع."),
  svc("p1", "engine", "استبدال سير التوقيت", 1400, "starting", ["garage"], 240, "سير وشداد وبكرات. استبدال مضخة الماء يُسعَّر بعد الفحص.", true),
  svc("p1", "diagnostics", "فحص تشخيصي بالكمبيوتر", 150, "fixed", ["garage", "mobile"], 30, "مسح OBD كامل مع تقرير أعطال مطبوع وشرح."),
  svc("p1", "brakes", "فحمات فرامل أمامية", 480, "starting", ["garage"], 60, "فحمات بجودة OEM مع التشغيل. خراطة الأقراص عند الحاجة تُسعَّر بعد الفحص.", true),
  svc("p2", "brakes", "فحمات فرامل أمامية", 450, "fixed", ["garage"], 50, "فحمات سيراميك معتمدة مع التركيب والاختبار. يشمل تعبئة سائل الفرامل."),
  svc("p2", "brakes", "أقراص وفحمات فرامل (محور)", 1100, "starting", ["garage"], 90, "أقراص وفحمات جديدة لكل محور. السعر يختلف حسب السيارة.", true),
  svc("p2", "tyres", "ترصيف وموازنة العجلات", 160, "fixed", ["garage"], 45, "ترصيف وموازنة للعجلات الأربع بالكمبيوتر."),
  svc("p2", "tyres", "تدوير الإطارات", 80, "fixed", ["garage"], 20, "تدوير الإطارات الأربعة وضبط الضغط."),
  svc("p3", "oil", "تغيير زيت عند بابك", 250, "starting", ["mobile"], 40, "أحضر الزيت والفلتر وصحن التقطير. السعر يعتمد على سعة الزيت.", true),
  svc("p3", "diagnostics", "تشخيص متنقل", 180, "fixed", ["mobile", "roadside"], 40, "مسح OBD في موقعك واختبار على الطريق."),
  svc("p3", "brakes", "استبدال فحمات الفرامل في المنزل", 520, "starting", ["mobile"], 75, "فحمات أمامية أو خلفية في منزلك أو مكتبك.", true),
  svc("p4", "diagnostics", "فحص ما قبل الشراء", 250, "fixed", ["garage", "mobile"], 90, "فحص من 180 نقطة مع قياس الطلاء والمسح وتقرير مكتوب قبل شراء سيارة مستعملة."),
  svc("p4", "diagnostics", "كشف أعطال كهربائية", 300, "starting", ["garage"], 120, "تشخيص الأسلاك والوحدات. الإصلاح يُسعَّر بشكل منفصل.", true),
  svc("p4", "engine", "ضبط المحرك", 600, "starting", ["garage"], 180, "شمعات الإشعال، تنظيف بوابة الخانق، الفلاتر وإعادة ضبط التكييف.", true),
  svc("p5", "battery", "استبدال بطارية (توصيل)", 480, "starting", ["mobile", "roadside"], 30, "توريد وتركيب البطارية أينما كنت، إعادة تدوير البطارية القديمة. السعر يختلف حسب حجم البطارية.", true),
  svc("p5", "roadside", "إشعال البطارية", 90, "fixed", ["roadside"], 20, "إشعال سريع وفحص نظام الشحن."),
  svc("p5", "battery", "فحص الدينامو والمحرك الكهربائي", 120, "fixed", ["mobile"], 30, "اختبار حمل البطارية والمحرك الكهربائي وخرج الدينامو."),
  svc("p6", "roadside", "سطحة فردية (داخل الرياض)", 250, "starting", ["roadside"], 60, "سحب بسطحة فردية إلى أي ورشة داخل حدود الرياض. المسافة فوق 30 كم تُسعَّر.", true),
  svc("p6", "roadside", "إطار منكمش على الطريق", 100, "fixed", ["roadside"], 30, "تركيب الاحتياطي أو إصلاح الثقب في الموقع."),
  svc("p6", "engine", "تقييم إعادة بناء المحرك", 350, "fixed", ["garage"], 120, "اختبار ضغط وتسرب مع عرض سعر مكتوب كامل."),
  svc("p7", "oil", "تغيير زيت مسائي", 230, "starting", ["mobile"], 45, "تغيير زيت بعد ساعات العمل.", true),
  svc("p8", "ac", "صيانة التكييف", 260, "fixed", ["garage"], 60, "تنظيف التكييف وإعادة الشحن وفلتر المقصورة."),
  svc("p9", "tyres", "تركيب إطارات متنقل", 120, "fixed", ["mobile"], 40, "تركيب إطارات جديدة في موقعك."),
];

export const customers: Customer[] = [
  { id: "c1", name: "سارة القحطاني", phone: "+966 5• ••• 4821", email: "sara.q@example.com", cityId: "riyadh", area: "الملقا", joinedAt: "2025-10-11T09:00:00Z" },
  { id: "c2", name: "فيصل الحربي", phone: "+966 5• ••• 1094", email: "faisal.h@example.com", cityId: "riyadh", area: "الياسمين", joinedAt: "2025-11-02T09:00:00Z" },
  { id: "c3", name: "نورة الدوسري", phone: "+966 5• ••• 3381", email: "noura.d@example.com", cityId: "riyadh", area: "العليا", joinedAt: "2026-01-19T09:00:00Z" },
  { id: "c4", name: "عبدالله الشهري", phone: "+966 5• ••• 7205", email: "abdullah.s@example.com", cityId: "riyadh", area: "السليمانية", joinedAt: "2026-02-08T09:00:00Z" },
  { id: "c5", name: "ريم العتيبي", phone: "+966 5• ••• 6612", email: "reem.o@example.com", cityId: "riyadh", area: "النخيل", joinedAt: "2026-03-23T09:00:00Z" },
  { id: "c6", name: "خالد الغامدي", phone: "+966 5• ••• 9930", email: "khalid.g@example.com", cityId: "riyadh", area: "الملز", joinedAt: "2026-04-14T09:00:00Z" },
  { id: "c7", name: "لمى آل سعود", phone: "+966 5• ••• 2278", email: "lama.s@example.com", cityId: "jeddah", area: "الروضة", joinedAt: "2026-05-30T09:00:00Z" },
  { id: "c8", name: "عمر الجهني", phone: "+966 5• ••• 5541", email: "omar.j@example.com", cityId: "riyadh", area: "النسيم", joinedAt: "2026-07-07T09:00:00Z" },
];

export const vehicles: Vehicle[] = [
  { id: "v1", customerId: "c1", make: "Toyota", model: "Camry", year: 2025, trim: "XLE Hybrid", plate: "4821 RKA", vin: "4T1B11HK5SU•••291", mileage: 12400, color: "رمادي معدني", shareWithPartners: true },
  { id: "v2", customerId: "c1", make: "Hyundai", model: "Tucson", year: 2023, trim: "Smart 2.0", plate: "7735 SJD", mileage: 31200, color: "رمادي غرافيت", shareWithPartners: true },
  { id: "v3", customerId: "c2", make: "Nissan", model: "Patrol", year: 2019, plate: "1190 HBA", mileage: 121000, color: "أسود", shareWithPartners: true },
  { id: "v4", customerId: "c3", make: "Kia", model: "Sportage", year: 2021, plate: "3302 LND", mileage: 54100, color: "فضي", shareWithPartners: true },
  { id: "v5", customerId: "c4", make: "Lexus", model: "ES 350", year: 2018, plate: "8820 KSA", mileage: 98700, color: "أزرق داكن", shareWithPartners: false },
  { id: "v6", customerId: "c5", make: "Honda", model: "Accord", year: 2022, plate: "6671 RMM", mileage: 40300, color: "أبيض", shareWithPartners: true },
  { id: "v7", customerId: "c6", make: "Chevrolet", model: "Tahoe", year: 2017, plate: "2045 DAH", mileage: 160200, color: "أبيض", shareWithPartners: true },
  { id: "v8", customerId: "c7", make: "Toyota", model: "Land Cruiser", year: 2021, plate: "5512 JED", mileage: 72000, color: "بيج", shareWithPartners: true },
  { id: "v9", customerId: "c8", make: "Hyundai", model: "Elantra", year: 2020, plate: "9013 NSM", mileage: 88500, color: "أحمر", shareWithPartners: true },
];

export const initialCommission: CommissionConfig = {
  freelancerRate: 10,
  garageRate: 12,
  discountFundedBy: "platform",
  history: [
    { at: "2025-07-01T00:00:00Z", freelancerRate: 10, garageRate: 15, discountFundedBy: "platform" },
    { at: "2026-09-01T00:00:00Z", freelancerRate: 10, garageRate: 12, discountFundedBy: "platform" },
  ],
};

export const promoCodes: PromoCode[] = [
  { id: "pr1", code: "WELCOME15", discountType: "percentage", value: 15, startsAt: "2026-01-01T00:00:00Z", expiresAt: "2026-12-31T23:59:00Z", usageLimit: 2000, usedCount: 412, minOrder: 150, maxDiscount: 75, active: true },
  { id: "pr2", code: "BRAKES50", discountType: "fixed", value: 50, startsAt: "2026-10-01T00:00:00Z", expiresAt: "2026-12-15T23:59:00Z", usageLimit: 300, usedCount: 87, minOrder: 400, active: true, categoryIds: ["brakes"] },
  { id: "pr3", code: "NATIONALDAY", discountType: "percentage", value: 20, startsAt: "2026-09-20T00:00:00Z", expiresAt: "2026-09-30T23:59:00Z", usageLimit: 1000, usedCount: 1000, minOrder: 100, maxDiscount: 100, active: false },
  { id: "pr4", code: "SARA-VIP", discountType: "fixed", value: 100, startsAt: "2026-11-01T00:00:00Z", expiresAt: "2027-01-31T23:59:00Z", usageLimit: 1, usedCount: 0, minOrder: 500, active: true, customerIds: ["c1"] },
];

/* ---------- Deterministic history ---------- */

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rand = rng(20261120);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const pad = (n: number) => String(n).padStart(2, "0");

function rateAt(iso: string, type: "garage" | "freelancer") {
  const h = [...initialCommission.history].reverse().find((x) => x.at <= iso)!;
  return commissionRateFor(h, type);
}

const orders: Order[] = [];
const transactions: Transaction[] = [];
const reviews: Review[] = [];
const payouts: Payout[] = [];
const maintenance: MaintenanceRecord[] = [];

const approved = partners.filter((p) => p.status === "approved");
const customerComments = [
  "في الموعد وشرح كل شيء بوضوح.",
  "سعر مناسب، والسيارة كأنها جديدة.",
  "محترف جداً، سأحجز مرة أخرى.",
  "عمل سريع ومنطقة عمل نظيفة.",
  "استغرق وقتاً أطول قليلاً من المتوقع لكن النتيجة جيدة.",
  "أراني القطع القديمة — أقدّر الصراحة.",
];
const partnerComments = ["وصف واضح للمشكلة.", "دقيق وسهل التعامل.", "السيارة كانت جاهزة في الوقت المتفق عليه.", "مؤدب ودفع بسرعة."];

let oid = 1100;
let tid = 5000;
function addCompleted(opts: { customerId: string; vehicleId: string; partnerId: string; service: Service; date: string; gross: number; promo?: { code: string; discount: number }; review?: boolean; partnerReview?: boolean; rating?: number }) {
  const partner = partners.find((p) => p.id === opts.partnerId)!;
  const id = `o-${++oid}`;
  const rate = rateAt(opts.date, partner.type);
  const s = computeSettlement({ gross: opts.gross, discount: opts.promo?.discount ?? 0, commissionRate: rate, fundedBy: "platform" });
  const policy = partner.paymentPolicy;
  const offerId = `of-${id}`;
  const d = new Date(opts.date).getTime();
  const iso = (h: number) => new Date(d + h * 3600_000).toISOString();
  orders.push({
    id, customerId: opts.customerId, vehicleId: opts.vehicleId, categoryId: opts.service.categoryId, serviceId: opts.service.id,
    partnerId: partner.id, title: opts.service.name, description: opts.service.description, locationLabel: partner.area,
    method: opts.service.methods[0], urgent: opts.service.categoryId === "roadside", mediaCount: 0, status: "completed",
    offers: [{ id: offerId, partnerId: partner.id, price: opts.gross, priceType: "fixed", etaLabel: "في نفس اليوم", note: "", method: opts.service.methods[0], paymentPolicy: policy, depositPercent: partner.depositPercent, createdAt: iso(0.5) }],
    declinedBy: [], acceptedOfferId: offerId, agreedPrice: opts.gross, paymentPolicy: policy, depositPercent: partner.depositPercent,
    depositPaid: policy === "deposit", promoCode: opts.promo?.code, createdAt: iso(0), vehicleShared: true,
    timeline: [
      { status: "pending", at: iso(0), by: "customer" },
      { status: "offers_received", at: iso(0.5), by: "partner" },
      { status: "accepted", at: iso(1), by: "customer" },
      { status: "in_progress", at: iso(3), by: "partner" },
      { status: "awaiting_confirmation", at: iso(5), by: "partner" },
      { status: "awaiting_payment", at: iso(5.5), by: "customer" },
      { status: "completed", at: iso(5.6), by: "system" },
    ],
    paymentAttempts: [{ at: iso(5.6), ok: true, amount: s.customerPaid, kind: "full" }],
  });
  const txPayments: Transaction["payments"] =
    policy === "deposit"
      ? [
          { kind: "deposit", amount: Math.round(opts.gross * partner.depositPercent) / 100, at: iso(1.2), gatewayRef: `HP-${tid}D` },
          { kind: "balance", amount: Math.round((s.customerPaid - (opts.gross * partner.depositPercent) / 100) * 100) / 100, at: iso(5.6), gatewayRef: `HP-${tid}B` },
        ]
      : [{ kind: "full", amount: s.customerPaid, at: iso(5.6), gatewayRef: `HP-${tid}` }];
  transactions.push({
    id: `tx-${++tid}`, orderId: id, customerId: opts.customerId, partnerId: partner.id, partnerType: partner.type,
    gross: s.gross, discount: s.discount, promoCode: opts.promo?.code, discountFundedBy: "platform",
    commissionRate: s.commissionRate, commissionAmount: s.commissionAmount, partnerNet: s.partnerNet, customerPaid: s.customerPaid,
    status: "succeeded", payments: txPayments, createdAt: iso(5.6),
  });
  if (opts.review) {
    reviews.push({ id: `rv-${id}-c`, orderId: id, reviewerRole: "customer", reviewerId: opts.customerId, targetId: partner.id, rating: opts.rating ?? 5, comment: pick(customerComments), createdAt: iso(8) });
  }
  if (opts.partnerReview) {
    reviews.push({ id: `rv-${id}-p`, orderId: id, reviewerRole: "partner", reviewerId: partner.id, targetId: opts.customerId, rating: rand() > 0.15 ? 5 : 4, comment: pick(partnerComments), createdAt: iso(9) });
  }
  return id;
}

// Sara's own history (Camry + Tucson)
const svcById = (id: string) => services.find((s) => s.id === id)!;
const saraOil = addCompleted({ customerId: "c1", vehicleId: "v1", partnerId: "p1", service: svcById("s1"), date: "2026-06-10T07:00:00Z", gross: 240, review: true, partnerReview: true, rating: 5 });
const saraBrakes = addCompleted({ customerId: "c1", vehicleId: "v1", partnerId: "p2", service: svcById("s6"), date: "2026-03-02T09:00:00Z", gross: 450, review: true, partnerReview: true, rating: 4 });
const saraRotation = addCompleted({ customerId: "c1", vehicleId: "v1", partnerId: "p2", service: svcById("s9"), date: "2026-06-24T10:00:00Z", gross: 80, review: false, partnerReview: true });
const saraTucsonOil = addCompleted({ customerId: "c1", vehicleId: "v2", partnerId: "p3", service: svcById("s10"), date: "2026-08-18T15:00:00Z", gross: 260, review: true, partnerReview: false, rating: 5 });

maintenance.push(
  { id: "m1", vehicleId: "v1", type: "oil", title: "تغيير زيت صناعي + فلتر", date: "2026-06-10T07:00:00Z", mileage: 9800, partnerId: "p1", orderId: saraOil, source: "order", notes: "زيت 0W-20 كامل التصنيع + فلتر زيت أصلي. تمت تعبئة 4.3 لتر." },
  { id: "m2", vehicleId: "v1", type: "brakes", title: "فحص فرامل أول خدمة", date: "2026-03-02T09:00:00Z", mileage: 6200, partnerId: "p2", orderId: saraBrakes, source: "order", notes: "سمك الفحمات الأمامية ضمن المدى الآمن. لا حاجة للاستبدال حاليًا." },
  { id: "m3", vehicleId: "v1", type: "tires", title: "تدوير الإطارات", date: "2026-06-24T10:00:00Z", mileage: 10100, partnerId: "p2", orderId: saraRotation, source: "order", notes: "تدوير أمامي/خلفي مع موازنة خفيفة وضغط حسب مواصفات الوكالة." },
  { id: "m4", vehicleId: "v1", type: "inspection", title: "فحص تسليم الوكالة", date: "2025-11-15T10:00:00Z", mileage: 40, notes: "فحص ما بعد الاستلام من الوكالة — كل الأنظمة سليمة.", source: "customer" },
  { id: "m5", vehicleId: "v1", type: "ac", title: "فحص التكييف", date: "2025-12-01T10:00:00Z", mileage: 1800, notes: "تبريد ممتاز. لا تسريب ظاهر في الدائرة.", source: "customer" },
  { id: "m6", vehicleId: "v2", type: "oil", title: "تغيير زيت عند بابك", date: "2026-08-18T15:00:00Z", mileage: 27100, partnerId: "p3", orderId: saraTucsonOil, source: "order", notes: "خدمة متنقلة أمام المنزل. زيت 5W-30 + فلتر." },
  { id: "m7", vehicleId: "v2", type: "inspection", title: "فحص السنة الأولى", date: "2025-12-20T10:00:00Z", mileage: 15400, notes: "فحص دوري سنوي — سوائل وإطارات وإضاءة.", source: "customer" },
);

// Marketplace history Jun–Nov
const otherCustomers = customers.filter((c) => c.id !== "c1");
for (let m = 6; m <= 11; m++) {
  const count = 7 + Math.floor(rand() * 5) + (m - 6);
  for (let i = 0; i < count; i++) {
    const partner = pick(approved);
    const pServices = services.filter((s) => s.partnerId === partner.id);
    const service = pick(pServices);
    const customer = pick(otherCustomers);
    const vehicle = vehicles.find((v) => v.customerId === customer.id)!;
    const day = 1 + Math.floor(rand() * (m === 11 ? 18 : 27));
    const date = `2026-${pad(m)}-${pad(day)}T${pad(6 + Math.floor(rand() * 12))}:00:00Z`;
    const gross = Math.round((service.price * (1 + rand() * 0.35)) / 5) * 5;
    const usePromo = rand() < 0.18 && gross >= 150;
    const discount = usePromo ? Math.min(Math.round(gross * 0.15), 75) : 0;
    const roll = rand();
    addCompleted({
      customerId: customer.id, vehicleId: vehicle.id, partnerId: partner.id, service, date, gross,
      promo: usePromo ? { code: "WELCOME15", discount } : undefined,
      review: rand() < 0.75, partnerReview: rand() < 0.55, rating: roll < 0.6 ? 5 : roll < 0.88 ? 4 : roll < 0.96 ? 3 : 2,
    });
  }
}

// Monthly payouts Jun–Oct (paid on the 5th of the next month)
let pid = 300;
for (let m = 6; m <= 10; m++) {
  for (const partner of approved) {
    const monthTx = transactions.filter((t) => t.partnerId === partner.id && t.createdAt.startsWith(`2026-${pad(m)}`));
    if (!monthTx.length) continue;
    const failed = m === 10 && partner.id === "p6";
    const payout: Payout = {
      id: `po-${++pid}`, partnerId: partner.id, period: `2026-${pad(m)}`,
      amount: Math.round(monthTx.reduce((s, t) => s + t.partnerNet, 0) * 100) / 100,
      status: failed ? "failed" : "paid", createdAt: `2026-${pad(m + 1)}-05T06:00:00Z`, method: partner.payoutMethod,
      transactionIds: monthTx.map((t) => t.id), failureReason: failed ? "رفض البنك التحويل: عدم تطابق اسم صاحب الآيبان" : undefined,
    };
    monthTx.forEach((t) => (t.payoutId = payout.id));
    payouts.push(payout);
  }
}

/* ---------- Live demo orders ---------- */
const at = (s: string) => `2026-11-${s}`;

orders.push(
  {
    id: "o-2001", customerId: "c1", vehicleId: "v1", categoryId: "diagnostics", title: "لمبة المحرك مضاءة وتباطؤ غير مستقر",
    description: "ظهرت لمبة المحرك أمس على طريق الملك فهد. التباطؤ غير مستقر عند الإشارات، بدون أصوات تحذيرية.",
    locationLabel: "الملقا، الرياض", method: "garage", urgent: false, mediaCount: 2, status: "offers_received", declinedBy: [],
    createdAt: at("19T06:20:00Z"), vehicleShared: true, paymentAttempts: [],
    offers: [
      { id: "of-1", partnerId: "p4", price: 150, priceType: "starting", etaLabel: "اليوم 4 م", note: "مسح كامل + اختبار على الطريق. إذا كانت المشكلة في الملفات/شمعات الإشعال سأعطيك عرض سعر قبل الاستبدال.", method: "garage", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("19T07:05:00Z") },
      { id: "of-2", partnerId: "p3", price: 180, priceType: "fixed", etaLabel: "خلال ساعتين", note: "أمكنني القدوم إلى الملقا والمسح في موقفك.", method: "mobile", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("19T07:40:00Z") },
      { id: "of-3", partnerId: "p1", price: 150, priceType: "fixed", etaLabel: "غداً 10 ص", note: "مسح تشخيصي مع تقرير مطبوع. يشمل الفحص المجاني.", method: "garage", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("19T08:15:00Z") },
    ],
    timeline: [{ status: "pending", at: at("19T06:20:00Z"), by: "customer" }, { status: "offers_received", at: at("19T07:05:00Z"), by: "partner" }],
  },
  {
    id: "o-2002", customerId: "c1", vehicleId: "v2", categoryId: "brakes", serviceId: "s7", partnerId: "p2", title: "أقراص وفحمات فرامل (المحور الأمامي)",
    description: "صوت طحن عند الكبح بسرعة منخفضة.", locationLabel: "مركز الملز للفرامل والإطارات", method: "garage", urgent: false, mediaCount: 1,
    status: "in_progress", declinedBy: [], acceptedOfferId: "of-4", agreedPrice: 1180, paymentPolicy: "deposit", depositPercent: 30, depositPaid: true,
    createdAt: at("17T09:00:00Z"), vehicleShared: true,
    offers: [{ id: "of-4", partnerId: "p2", price: 1180, priceType: "fixed", etaLabel: "ثلاثاء 10 ص", note: "الأقراص أقل من السُمك الأدنى — أقراص جديدة وفحمات سيراميك.", method: "garage", paymentPolicy: "deposit", depositPercent: 30, createdAt: at("17T10:00:00Z") }],
    timeline: [
      { status: "pending", at: at("17T09:00:00Z"), by: "customer" },
      { status: "offers_received", at: at("17T10:00:00Z"), by: "partner" },
      { status: "accepted", at: at("17T11:00:00Z"), by: "customer" },
      { status: "in_progress", at: at("19T07:00:00Z"), by: "partner" },
    ],
    paymentAttempts: [{ at: at("17T11:02:00Z"), ok: true, amount: 354, kind: "deposit" }],
  },
  {
    id: "o-2003", customerId: "c1", vehicleId: "v1", categoryId: "ac", serviceId: "s2", partnerId: "p1", title: "شحن تكييف وفحص تسرب",
    description: "التكييف يخرج هواء دافئاً بعد 10 دقائق من القيادة.", locationLabel: "ورش العليا للسيارات", method: "garage", urgent: false, mediaCount: 0,
    status: "awaiting_confirmation", declinedBy: [], acceptedOfferId: "of-5", agreedPrice: 220, paymentPolicy: "after_completion", depositPercent: 0,
    createdAt: at("18T08:00:00Z"), requestedPartnerId: "p1", vehicleShared: true,
    offers: [{ id: "of-5", partnerId: "p1", price: 220, priceType: "fixed", etaLabel: "اليوم", note: "السعر المعروض مؤكد — لا رسوم إضافية إلا إذا وُجد تسرب.", method: "garage", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("18T08:30:00Z") }],
    timeline: [
      { status: "pending", at: at("18T08:00:00Z"), by: "customer" },
      { status: "offers_received", at: at("18T08:30:00Z"), by: "partner" },
      { status: "accepted", at: at("18T09:00:00Z"), by: "customer" },
      { status: "in_progress", at: at("19T06:00:00Z"), by: "partner" },
      { status: "awaiting_confirmation", at: at("19T09:10:00Z"), by: "partner", note: "لم يُعثر على تسرب. أُعيد الشحن بكمية 650 غ." },
    ],
    paymentAttempts: [],
  },
  {
    id: "o-2004", customerId: "c2", vehicleId: "v3", categoryId: "roadside", title: "بطارية فارغة في موقف المول",
    description: "السيارة لا تشتغل، أضواء لوحة العداد تومض. رياض بارك، الطابق P2.", locationLabel: "رياض بارك، الياسمين",
    method: "roadside", urgent: true, mediaCount: 1, status: "pending", offers: [], declinedBy: [], createdAt: at("19T21:40:00Z"), vehicleShared: true,
    timeline: [{ status: "pending", at: at("19T21:40:00Z"), by: "customer" }], paymentAttempts: [],
  },
  {
    id: "o-2005", customerId: "c3", vehicleId: "v4", categoryId: "oil", title: "تغيير زيت + فلاتر",
    description: "حان موعد تغيير الزيت، يرجى أيضاً فحص فلتر الهواء.", locationLabel: "العليا، الرياض", method: "garage", urgent: false,
    mediaCount: 0, status: "pending", offers: [], declinedBy: [], createdAt: at("19T16:10:00Z"), vehicleShared: true,
    timeline: [{ status: "pending", at: at("19T16:10:00Z"), by: "customer" }], paymentAttempts: [],
  },
  {
    id: "o-2006", customerId: "c4", vehicleId: "v5", categoryId: "diagnostics", title: "فحص ما قبل الشراء — Kia Cerato مستعملة",
    description: "البائع في السليمانية. أحتاج فحصاً كاملاً قبل الدفع يوم الخميس.", locationLabel: "السليمانية، الرياض",
    method: "mobile", urgent: false, mediaCount: 3, status: "offers_received", declinedBy: [], createdAt: at("19T12:00:00Z"), vehicleShared: false,
    offers: [{ id: "of-6", partnerId: "p4", price: 250, priceType: "fixed", etaLabel: "خميس 9 ص", note: "يشمل التقرير المكتوب.", method: "mobile", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("19T12:40:00Z") }],
    timeline: [{ status: "pending", at: at("19T12:00:00Z"), by: "customer" }, { status: "offers_received", at: at("19T12:40:00Z"), by: "partner" }], paymentAttempts: [],
  },
  {
    id: "o-2007", customerId: "c5", vehicleId: "v6", categoryId: "engine", serviceId: "s3", partnerId: "p1", title: "استبدال سير التوقيت",
    description: "بلغت فترة صيانة 100 ألف كم.", locationLabel: "ورش العليا للسيارات", method: "garage", urgent: false, mediaCount: 0,
    status: "accepted", declinedBy: [], acceptedOfferId: "of-7", agreedPrice: 1550, paymentPolicy: "after_completion", depositPercent: 0,
    createdAt: at("18T13:00:00Z"), requestedPartnerId: "p1", vehicleShared: true,
    offers: [{ id: "of-7", partnerId: "p1", price: 1550, priceType: "fixed", etaLabel: "سبت 9 ص", note: "يشمل مضخة الماء — أصلية وموعد استبدالها.", method: "garage", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("18T14:00:00Z") }],
    timeline: [{ status: "pending", at: at("18T13:00:00Z"), by: "customer" }, { status: "offers_received", at: at("18T14:00:00Z"), by: "partner" }, { status: "accepted", at: at("18T15:00:00Z"), by: "customer" }],
    paymentAttempts: [],
  },
  {
    id: "o-2008", customerId: "c6", vehicleId: "v7", categoryId: "brakes", serviceId: "s5", partnerId: "p1", title: "فحمات فرامل أمامية",
    description: "لمبة تحذير الفرامل مضاءة.", locationLabel: "ورش العليا للسيارات", method: "garage", urgent: false, mediaCount: 0,
    status: "in_progress", declinedBy: [], acceptedOfferId: "of-8", agreedPrice: 560, paymentPolicy: "after_completion", depositPercent: 0,
    createdAt: at("19T05:00:00Z"), vehicleShared: true,
    offers: [{ id: "of-8", partnerId: "p1", price: 560, priceType: "fixed", etaLabel: "اليوم", note: "فحمات دفع رباعي ثقيلة.", method: "garage", paymentPolicy: "after_completion", depositPercent: 0, createdAt: at("19T05:30:00Z") }],
    timeline: [{ status: "pending", at: at("19T05:00:00Z"), by: "customer" }, { status: "offers_received", at: at("19T05:30:00Z"), by: "partner" }, { status: "accepted", at: at("19T06:00:00Z"), by: "customer" }, { status: "in_progress", at: at("19T08:00:00Z"), by: "partner" }],
    paymentAttempts: [],
  },
  {
    id: "o-2009", customerId: "c8", vehicleId: "v9", categoryId: "engine", partnerId: "p6", title: "انزلاق في ناقل الحركة",
    description: "العميل يعترض على المبلغ النهائي بعد الإصلاح.", locationLabel: "نسيم موتورز والسطحات", method: "garage", urgent: false, mediaCount: 2,
    status: "disputed", declinedBy: [], acceptedOfferId: "of-9", agreedPrice: 2400, paymentPolicy: "deposit", depositPercent: 25, depositPaid: true,
    createdAt: at("10T09:00:00Z"), vehicleShared: true,
    offers: [{ id: "of-9", partnerId: "p6", price: 2400, priceType: "starting", etaLabel: "3 أيام", note: "إعادة بناء حزمة القابض.", method: "garage", paymentPolicy: "deposit", depositPercent: 25, createdAt: at("10T10:00:00Z") }],
    timeline: [{ status: "pending", at: at("10T09:00:00Z"), by: "customer" }, { status: "accepted", at: at("10T11:00:00Z"), by: "customer" }, { status: "in_progress", at: at("11T08:00:00Z"), by: "partner" }, { status: "awaiting_confirmation", at: at("14T15:00:00Z"), by: "partner" }, { status: "disputed", at: at("14T18:00:00Z"), by: "customer", note: "المبلغ النهائي أعلى من العرض." }],
    paymentAttempts: [{ at: at("10T11:05:00Z"), ok: true, amount: 600, kind: "deposit" }],
  },
  {
    id: "o-2010", customerId: "c7", vehicleId: "v8", categoryId: "tyres", title: "ثقب — خلفي يسار",
    description: "ثقب بطيء.", locationLabel: "الروضة، جدة", method: "mobile", urgent: false, mediaCount: 0,
    status: "expired", offers: [], declinedBy: [], createdAt: at("02T09:00:00Z"), vehicleShared: true,
    timeline: [{ status: "pending", at: at("02T09:00:00Z"), by: "customer" }, { status: "expired", at: at("04T09:00:00Z"), by: "system", note: "لم تُستلم عروض خلال 48 ساعة." }],
    paymentAttempts: [],
  },
  {
    id: "o-2011", customerId: "c2", vehicleId: "v3", categoryId: "oil", partnerId: "p3", title: "تغيير زيت في المنزل",
    description: "ألغاه العميل.", locationLabel: "الياسمين، الرياض", method: "mobile", urgent: false, mediaCount: 0,
    status: "cancelled", offers: [], declinedBy: [], createdAt: at("08T09:00:00Z"), vehicleShared: true,
    timeline: [{ status: "pending", at: at("08T09:00:00Z"), by: "customer" }, { status: "cancelled", at: at("08T12:00:00Z"), by: "customer" }],
    paymentAttempts: [],
  },
);

transactions.push({
  id: "tx-6001", orderId: "o-2002", customerId: "c1", partnerId: "p2", partnerType: "garage", gross: 1180, discount: 0, discountFundedBy: "platform",
  commissionRate: 12, commissionAmount: 141.6, partnerNet: 1038.4, customerPaid: 354, status: "partially_paid",
  payments: [{ kind: "deposit", amount: 354, at: at("17T11:02:00Z"), gatewayRef: "HP-6001D" }], createdAt: at("17T11:02:00Z"),
});
transactions.push({
  id: "tx-6002", orderId: "o-2009", customerId: "c8", partnerId: "p6", partnerType: "garage", gross: 2400, discount: 0, discountFundedBy: "platform",
  commissionRate: 12, commissionAmount: 288, partnerNet: 2112, customerPaid: 600, status: "partially_paid",
  payments: [{ kind: "deposit", amount: 600, at: at("10T11:05:00Z"), gatewayRef: "HP-6002D" }], createdAt: at("10T11:05:00Z"),
});

// One reported review for moderation demo
reviews.push({ id: "rv-flag", orderId: orders[20].id, reviewerRole: "customer", reviewerId: orders[20].customerId, targetId: orders[20].partnerId!, rating: 1, comment: "احتيال بالكامل!!! تواصل معي على واتساب للسعر الحقيقي", createdAt: "2026-11-12T10:00:00Z", reported: true });

export const chats: ChatThread[] = [
  {
    id: "ch1", customerId: "c1", partnerId: "p4", orderId: "o-2001",
    messages: [
      { id: "m1", from: "partner", text: "مرحباً سارة، شفت صورك. اللمبة تومض ولا ثابتة؟", at: at("19T07:06:00Z") },
      { id: "m2", from: "customer", text: "ثابتة. ومّضت مرة على الطريق السريع.", at: at("19T07:12:00Z") },
      { id: "m3", from: "partner", text: "يبدو عطل إشعال — غالباً ملف. المسح يؤكد. أعطيك عرض سعر قبل ما أبدل أي شيء.", at: at("19T07:15:00Z") },
    ],
  },
  {
    id: "ch2", customerId: "c1", partnerId: "p1", orderId: "o-2003",
    messages: [
      { id: "m4", from: "customer", text: "أقدر أسلّم السيارة الساعة 8 صباحاً؟", at: at("18T09:05:00Z") },
      { id: "m5", from: "partner", text: "أيوه، جناح 2 جاهز. جيبي ريموت المفتاح بس.", at: at("18T09:10:00Z") },
      { id: "m6", from: "partner", text: "خلصنا — ما في تسرب، شحنا حسب المواصفات. أكدي لي بعد ما تستلمين السيارة.", at: at("19T09:12:00Z") },
    ],
  },
  {
    id: "ch3", customerId: "c1", partnerId: "p2", orderId: "o-2002",
    messages: [
      { id: "m7", from: "partner", text: "الأقراص خلصت — صح إنك جيتي. نجهزها الساعة 5 م.", at: at("19T07:30:00Z") },
    ],
  },
  {
    id: "ch4", customerId: "c5", partnerId: "p1", orderId: "o-2007",
    messages: [{ id: "m8", from: "customer", text: "أشوفك السبت الساعة 9.", at: at("18T15:05:00Z") }],
  },
];

export const seed = {
  cities,
  categories,
  partners,
  services,
  customers,
  vehicles,
  maintenance,
  orders,
  transactions,
  payouts,
  reviews,
  promoCodes,
  commission: initialCommission,
  chats,
};

export type SeedData = typeof seed;