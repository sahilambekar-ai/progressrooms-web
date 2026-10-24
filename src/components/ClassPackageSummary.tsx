import type { Pricing } from "@/types";
export function ClassPackageSummary({ pricing }: { pricing?: (Omit<Pick<Pricing, "packages" | "price" | "currency" | "total_classes" | "validity_days">, "total_classes"> & { total_classes?: number | null }) | null }) {
  if (!pricing) return <p className="text-xs text-slate-500">Packages not configured</p>;
  const options = pricing.packages?.length ? pricing.packages : [{ total_classes: pricing.total_classes, price: pricing.price, offer_price: null, validity_days: pricing.validity_days || 30 }];
  const cheapest = options.reduce((best, option) => (option.offer_price ?? option.price) < (best.offer_price ?? best.price) ? option : best);
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: pricing.currency || "INR", maximumFractionDigits: 2 }).format(cheapest.offer_price ?? cheapest.price);
  return <div className="space-y-2" aria-label="Available session packages">
    <p className="text-xs text-slate-600"><span className="font-bold text-[#133623]">{options.length} {options.length === 1 ? "package" : "packages"}</span> · from <span className="font-bold text-[#133623]">{money}</span><span className="text-slate-500"> · {cheapest.validity_days} days validity</span></p>
    <div className="flex flex-wrap gap-2">{[...options].sort((a, b) => (a.total_classes ?? Infinity) - (b.total_classes ?? Infinity)).map((option, index) => <span key={index} className="rounded-lg bg-[#F4F7F4] px-2.5 py-1.5 text-xs font-semibold text-[#133623]">{option.total_classes ? `${option.total_classes} ${option.total_classes === 1 ? "session" : "sessions"}` : "Unlimited sessions"}</span>)}</div>
  </div>;
}
