import { toast } from "sonner";

/** Shown when the visitor tries to create something new in the interactive demo. */
export const DEMO_NO_PERSIST =
  "هذا عرض تفاعلي فقط — لا تُحفظ الإضافات الجديدة في النظام.";

export function toastDemoOnly() {
  toast.message(DEMO_NO_PERSIST);
}
