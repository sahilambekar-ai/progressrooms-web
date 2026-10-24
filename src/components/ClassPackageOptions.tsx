"use client";

import { Pricing } from "@/types";
import { Purchase } from "./StoreCheckout";

type PackagePricing = Omit<Pricing, "total_classes"> & { total_classes?: number | null };

export function ClassPackageOptions({ id, name, pricing, onBuy, disabled = false }: {
  id: string;
  name: string;
  pricing: PackagePricing;
  onBuy: (purchase: Purchase) => void;
  disabled?: boolean;
}) {
  const options = pricing.packages?.length ? pricing.packages : [{
    id: "",
    price: pricing.price,
    offer_price: null,
    total_classes: pricing.total_classes,
    validity_days: pricing.validity_days || 30,
  }];
  const money = (amount: number) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: pricing.currency, maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className="space-y-2" aria-label={`Packages for ${name}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Choose your practice</p>
      {options.map(option => (
        <div key={option.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#CEDECF] bg-white p-3">
          <div>
            <p className="text-sm font-bold text-[#0C2417]">
              {option.total_classes ? `${option.total_classes} ${option.total_classes === 1 ? "session" : "sessions"}` : "Unlimited sessions"}
            </p>
            <p className="text-[11px] text-slate-500">Valid for {option.validity_days} days</p>
            <div className="flex flex-wrap items-baseline gap-2 mt-1">
              <span className="font-bold text-sm text-[#133623]">{money(option.offer_price ?? option.price)}</span>
              {option.offer_price != null && option.offer_price < option.price && (
                <span className="text-xs text-slate-400 line-through">{money(option.price)}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Buy ${option.total_classes || "unlimited"} sessions of ${name}`}
            onClick={() => onBuy({
              id, kind: "class",
              name: `${name}${option.id ? ` · ${option.total_classes} sessions` : ""}`,
              package_id: option.id || undefined,
              price: option.price,
              offer_price: option.offer_price,
              currency: pricing.currency,
              total_classes: option.total_classes ?? undefined,
              validity_days: option.validity_days,
            })}
            className="shrink-0 rounded-xl bg-[#133623] px-4 py-2 text-xs font-bold text-white hover:bg-[#0C2417] disabled:opacity-40"
          >
            {disabled ? "Full" : "Buy"}
          </button>
        </div>
      ))}
    </div>
  );
}
