"use client";

import { PurchasePolicyNotice } from "./PurchasePolicyNotice";
import { Dispatch, SetStateAction } from "react";

export type PackageDraft = {
  id: string;
  total_classes: string;
  price: string;
  offer_price: string;
  validity_days: string;
};

export const newPackage = (count: number): PackageDraft => ({
  id: crypto.randomUUID(),
  total_classes: String(count),
  price: "",
  offer_price: "",
  validity_days: "30",
});

const fields = [
  ["total_classes", "Sessions", "1"],
  ["price", "Regular price (₹)", "0"],
  ["offer_price", "Offer price (₹)", "0"],
  ["validity_days", "Validity (days)", "1"],
] as const;

export function ClassPackageEditor({ packages, setPackages }: {
  packages: PackageDraft[];
  setPackages: Dispatch<SetStateAction<PackageDraft[]>>;
}) {
  return (
    <section className="rounded-2xl border border-[#CEDECF] bg-[#F5F8F3] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg text-[#0C2417]">Ways to practice</h3>
          <p className="text-xs text-slate-500">Create session packages. Students can buy any option directly.</p>
        </div>
        <button
          type="button"
          disabled={packages.length >= 20}
          onClick={() => setPackages(prev => [...prev, newPackage(Math.max(0, ...prev.map(p => Number(p.total_classes))) + 1)])}
          className="shrink-0 text-xs font-bold text-[#133623] bg-white border border-[#CEDECF] rounded-xl px-3 py-2"
        >
          + Add option
        </button>
      </div>
      {packages.map((pkg, index) => (
        <div key={pkg.id} className="rounded-xl border border-[#CEDECF] bg-white p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#133623]">Option {index + 1} · {pkg.total_classes || "—"} {pkg.total_classes === "1" ? "session" : "sessions"}</span>
            <button
              type="button"
              aria-label={`Remove option ${index + 1}`}
              disabled={packages.length === 1}
              onClick={() => setPackages(prev => prev.filter(p => p.id !== pkg.id))}
              className="text-xs text-red-600 disabled:opacity-30"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fields.map(([field, label, min]) => (
              <label key={field} className="text-[11px] font-semibold text-slate-600">
                {label}
                <input
                  required={field !== "offer_price"}
                  type="number"
                  min={min}
                  max={field === "offer_price" ? pkg.price || 0 : field === "total_classes" ? 10000 : field === "validity_days" ? 3650 : undefined}
                  step={field === "price" || field === "offer_price" ? "0.01" : "1"}
                  value={pkg[field]}
                  placeholder={field === "offer_price" ? "Optional" : ""}
                  onChange={e => setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, [field]: e.target.value } : p))}
                  className="mt-1 w-full rounded-lg border border-[#CEDECF] p-2 text-sm font-normal"
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-slate-500">Session count is the number of classes purchased. Validity is the time allowed to use them.</p>
      <PurchasePolicyNotice />
    </section>
  );
}
