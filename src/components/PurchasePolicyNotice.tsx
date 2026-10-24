import { PURCHASE_SUPPORT, PURCHASE_TERMS } from "@/lib/purchase-policy";

export function PurchasePolicyNotice() {
  return <aside aria-label="Studio and teacher refund guidance" className="rounded-xl border border-[#CEDECF] bg-[#F4F7F4] p-3 text-xs leading-relaxed text-slate-600">
    <p className="font-semibold text-[#133623]">For Studio staff and teachers · Refund handling</p>
    <p className="mt-1">{PURCHASE_TERMS}</p>
    <p className="mt-1">{PURCHASE_SUPPORT}</p>
  </aside>;
}
