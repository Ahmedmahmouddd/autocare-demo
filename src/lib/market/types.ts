export type PartnerType = "freelancer" | "garage";
export type DeliveryMethod = "mobile" | "garage" | "roadside";
export type PartnerStatus = "pending" | "approved" | "rejected" | "suspended" | "deactivated";
export type PriceType = "fixed" | "starting";
export type PaymentPolicy = "after_completion" | "deposit";
export type Role = "customer" | "partner" | "admin" | "system";
export type DiscountFunding = "platform" | "partner";

export type OrderStatus =
  | "pending"
  | "offers_received"
  | "accepted"
  | "in_progress"
  | "awaiting_confirmation"
  | "awaiting_payment"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired"
  | "disputed"
  | "refunded";

export interface City {
  id: string;
  name: string;
  areas: string[];
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface PartnerDoc {
  name: string;
  status: "submitted" | "verified" | "missing";
}

export interface Partner {
  id: string;
  type: PartnerType;
  name: string;
  ownerName: string;
  phone: string;
  cityId: string;
  area: string;
  lat: number;
  lng: number;
  /** Freelancers: radius of service coverage around their public service point. */
  coverageKm?: number | undefined;
  methods: DeliveryMethod[];
  hours: string;
  availableNow: boolean;
  bio: string;
  specialties: string[];
  brands: string[];
  joinedAt: string;
  status: PartnerStatus;
  docs: PartnerDoc[];
  paymentPolicy: PaymentPolicy;
  depositPercent: number;
  payoutMethod: string;
  photo: "garage" | "mobile" | "workshop";
  staffCount?: number | undefined;
}

export interface Service {
  id: string;
  partnerId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  priceType: PriceType;
  /** Final amount may change after inspection — must be disclosed. */
  inspectionNote: boolean;
  methods: DeliveryMethod[];
  durationMin: number;
  active: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  cityId: string;
  area: string;
  joinedAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  trim?: string | undefined;
  plate?: string | undefined;
  vin?: string | undefined;
  mileage: number;
  color: string;
  shareWithPartners: boolean;
}

export type MaintenanceType =
  | "oil"
  | "filter"
  | "tires"
  | "brakes"
  | "battery"
  | "ac"
  | "repair"
  | "inspection"
  | "other";

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  title: string;
  date: string;
  mileage: number;
  partnerId?: string | undefined;
  orderId?: string | undefined;
  notes?: string | undefined;
  /** "order" = linked to a completed platform order (verified); "customer" = self-reported. */
  source: "order" | "customer";
}

export interface Offer {
  id: string;
  partnerId: string;
  price: number;
  priceType: PriceType;
  etaLabel: string;
  note: string;
  method: DeliveryMethod;
  paymentPolicy: PaymentPolicy;
  depositPercent: number;
  createdAt: string;
}

export interface TimelineEntry {
  status: OrderStatus;
  at: string;
  by: Role;
  note?: string | undefined;
}

export interface PaymentAttempt {
  at: string;
  ok: boolean;
  amount: number;
  kind: "deposit" | "balance" | "full";
  reason?: string | undefined;
}

export interface Order {
  id: string;
  customerId: string;
  vehicleId: string;
  categoryId: string;
  serviceId?: string | undefined;
  /** Partner the customer opened the request from (direct booking). Others can still be invited. */
  requestedPartnerId?: string | undefined;
  partnerId?: string | undefined;
  title: string;
  description: string;
  locationLabel: string;
  method: DeliveryMethod;
  urgent: boolean;
  mediaCount: number;
  status: OrderStatus;
  offers: Offer[];
  declinedBy: string[];
  acceptedOfferId?: string | undefined;
  agreedPrice?: number | undefined;
  paymentPolicy?: PaymentPolicy | undefined;
  depositPercent?: number | undefined;
  depositPaid?: boolean | undefined;
  promoCode?: string | undefined;
  createdAt: string;
  timeline: TimelineEntry[];
  paymentAttempts: PaymentAttempt[];
  /** Vehicle details the customer agreed to share with the chosen partner. */
  vehicleShared: boolean;
}

export interface TxPayment {
  kind: "deposit" | "balance" | "full";
  amount: number;
  at: string;
  gatewayRef: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  customerId: string;
  partnerId: string;
  partnerType: PartnerType;
  gross: number;
  discount: number;
  promoCode?: string | undefined;
  discountFundedBy: DiscountFunding;
  commissionRate: number;
  commissionAmount: number;
  partnerNet: number;
  customerPaid: number;
  status: "partially_paid" | "succeeded" | "refunded";
  payments: TxPayment[];
  createdAt: string;
  payoutId?: string | undefined;
}

export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

export interface Payout {
  id: string;
  partnerId: string;
  period: string; // yyyy-mm
  amount: number;
  status: PayoutStatus;
  createdAt: string;
  method: string;
  transactionIds: string[];
  failureReason?: string | undefined;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerRole: "customer" | "partner";
  reviewerId: string;
  targetId: string;
  rating: number;
  comment?: string | undefined;
  createdAt: string;
  reported?: boolean | undefined;
  hidden?: boolean | undefined;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  startsAt: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  minOrder: number;
  maxDiscount?: number | undefined;
  active: boolean;
  customerIds?: string[] | undefined;
  categoryIds?: string[] | undefined;
}

export interface CommissionConfig {
  freelancerRate: number;
  garageRate: number;
  discountFundedBy: DiscountFunding;
  history: { at: string; freelancerRate: number; garageRate: number; discountFundedBy: DiscountFunding }[];
}

export interface ChatMessage {
  id: string;
  from: "customer" | "partner";
  text: string;
  at: string;
}

export interface ChatThread {
  id: string;
  customerId: string;
  partnerId: string;
  orderId?: string | undefined;
  messages: ChatMessage[];
}
