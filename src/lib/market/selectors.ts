import { averageRating } from "./rules";
import type { Partner, Review, Service } from "./types";

export function ratingFor(targetId: string, reviews: Review[], reviewerRole: "customer" | "partner" = "customer") {
  const list = reviews.filter((r) => r.targetId === targetId && r.reviewerRole === reviewerRole && !r.hidden);
  return { avg: averageRating(list), count: list.length, list };
}

export const isVisiblePartner = (p?: Partner) => p?.status === "approved";

export function visibleServices(services: Service[], partners: Partner[]) {
  const ok = new Set(partners.filter(isVisiblePartner).map((p) => p.id));
  return services.filter((s) => s.active && ok.has(s.partnerId));
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
}

/** Demo customer's "current location" — Al Malqa, Riyadh. */
export const CUSTOMER_LOCATION = { lat: 24.8086, lng: 46.6106, label: "الملقا، الرياض" };

export const directionsUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
