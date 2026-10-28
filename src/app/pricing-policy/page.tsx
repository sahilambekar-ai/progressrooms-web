import Link from "next/link";
import { SAAS_INTERNATIONAL_NOTICE, SAAS_PRICING_POLICY_VERSION, SAAS_SUPPORT_EMAIL, SAAS_TAX_NOTICE, SAAS_USAGE_NOTICE } from "@/lib/saas-pricing";

export default function PricingPolicyPage() {
  return <main className="mx-auto max-w-3xl space-y-6 px-6 py-12 text-slate-700">
    <Link href="/#pricing" className="text-sm font-semibold text-[#275539]">← Back to plans</Link>
    <h1 className="text-3xl font-bold text-[#133623]">Progress Rooms pricing policy</h1>
    <p className="text-sm text-slate-600">Version {SAAS_PRICING_POLICY_VERSION}</p>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Prices, taxes and fees</h2><p>{SAAS_TAX_NOTICE}</p><p>Review the final amount and service period before proceeding to Razorpay. Selecting a plan during registration is not a completed payment.</p></section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Active-student pricing</h2><p>{SAAS_USAGE_NOTICE}</p><p>21 eligible active students means ₹630 before applicable taxes. A student counts once per studio per month after using Join with a valid subscription.</p><p>{SAAS_INTERNATIONAL_NOTICE}</p></section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Payment confirmation</h2><p>Access purchased through Razorpay is activated after server verification of the full payment. A pending payment or a closed checkout window does not confirm a purchase. Contact support if money has been debited but confirmation is delayed.</p></section>
    <a className="inline-flex rounded-xl bg-[#133623] px-5 py-3 font-semibold text-white" href={`mailto:${SAAS_SUPPORT_EMAIL}?subject=Progress%20Rooms%20pricing%20enquiry`}>Contact support</a>
  </main>;
}
