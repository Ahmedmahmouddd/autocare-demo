import { useEffect, useMemo, useState } from "react";
import { useMarket } from "./store";
import { ratingFor } from "./selectors";

/** True once saved demo progress has loaded from this browser. */
export function useStoreReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useMarket.persist.hasHydrated()) setReady(true);
    return useMarket.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}

export function usePartnerRatings() {
  const reviews = useMarket((s) => s.reviews);
  const partners = useMarket((s) => s.partners);
  return useMemo(() => {
    const m = new Map<string, { avg: number; count: number }>();
    partners.forEach((p) => {
      const r = ratingFor(p.id, reviews, "customer");
      m.set(p.id, { avg: r.avg, count: r.count });
    });
    return m;
  }, [reviews, partners]);
}
