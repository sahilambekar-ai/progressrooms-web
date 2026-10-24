"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { staffApi } from "@/lib/staff-api";
import { SAAS_INTERNATIONAL_NOTICE, SAAS_PRICING_POLICY_VERSION, SAAS_SUPPORT_EMAIL, SAAS_TAX_NOTICE, SAAS_USAGE_NOTICE } from "@/lib/saas-pricing";

type Quote = { plan_id: string; plan_name: string; currency: string; base_paise: number; platform_fee_paise: number; gst_paise: number; total_paise: number; gst_bps: number };
type Purchase = { id: string; status: string; quote: Quote; razorpay_key_id: string; razorpay_order_id: string | null; paid_at: string | null; service_starts_at: string | null; service_ends_at: string | null; receipt_number: string | null };
type Summary = { studio_name: string; plan_name: string | null; checkout_available: boolean; checkout_message: string;
  enforcement_enabled: boolean;
  access: { state: string; trial_ends_at?: string; restriction_at?: string; paid_through?: string };
  plans: { id: string; name: string; slug: string; base_paise: number; interval: string }[]; purchases: Purchase[] };
type Result = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type CheckoutOptions = { key: string; amount: number; currency: string; name: string; description: string; order_id: string; handler: (result: Result) => void; modal: { ondismiss: () => void }; theme: { color: string } };
type RazorpayConstructor = new (options: CheckoutOptions) => { open: () => void; on: (event: string, handler: () => void) => void };
const formatMoney = (paise: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paise / 100);
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

let checkoutScript: Promise<RazorpayConstructor> | null = null;
function loadCheckout() {
  const current = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
  if (current) return Promise.resolve(current);
  if (!checkoutScript) checkoutScript = new Promise<RazorpayConstructor>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      const constructor = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay;
      if (constructor) resolve(constructor); else { checkoutScript = null; reject(new Error("Payment window could not load. Please try again.")); }
    };
    script.onerror = () => { script.remove(); checkoutScript = null; reject(new Error("Razorpay could not load. Check your connection and try again.")); };
    document.body.appendChild(script);
  });
  return checkoutScript;
}

export function SaaSBilling({ orgId }: { orgId: string }) {
  const [data, setData] = useState<Summary | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [country, setCountry] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const path = `/organizations/${orgId}/saas-billing`;
  const refresh = useCallback(async () => { const result = await staffApi(path); setData(result); }, [path]);
  useEffect(() => { setData(null); setQuote(null); setConsent(false); setError(""); refresh().catch(e => setError(e.message)); }, [refresh]);
  const post = (url: string, body: unknown = {}) => staffApi(url, { method: "POST", body: JSON.stringify(body) });

  async function review(planId: string) {
    setError(""); setMessage(""); setConsent(false); setQuote(null); setBusy(true);
    try { setQuote(await post(`${path}/quote`, { plan_id: planId, billing_country: country })); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load price"); }
    finally { setBusy(false); }
  }

  async function checkPayment(purchase: Purchase) {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await post(`${path}/checkouts/${purchase.id}/reconcile`);
      setMessage(result.status === "PAID" ? "Payment verified. Your subscription is active." : "Payment is not yet confirmed. Check again if your account was debited.");
      await refresh(); window.dispatchEvent(new Event("saas-billing-updated"));
    } catch (e) { setError(e instanceof Error ? e.message : "Payment could not be checked"); }
    finally { setBusy(false); }
  }

  async function pay() {
    if (!quote || !consent || busy || !data?.checkout_available) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const Razorpay = await loadCheckout();
      const keyName = `saas-checkout:${orgId}:${quote.plan_id}`;
      const key = sessionStorage.getItem(keyName) || crypto.randomUUID();
      sessionStorage.setItem(keyName, key);
      const purchase: Purchase = await post(`${path}/checkouts`, { plan_id: quote.plan_id, billing_country: country,
        idempotency_key: key, expected_total_paise: quote.total_paise, accepted_policy_version: SAAS_PRICING_POLICY_VERSION });
      if (purchase.status === "PAID") {
        sessionStorage.removeItem(keyName); setMessage("This payment has already been verified."); await refresh(); setBusy(false); return;
      }
      if (!purchase.razorpay_order_id || purchase.status !== "PENDING") throw new Error("This checkout needs support review. Please avoid starting another payment.");
      if (purchase.quote.total_paise !== quote.total_paise) throw new Error("An earlier checkout has a different total. Contact support before payment.");
      const widget = new Razorpay({ key: purchase.razorpay_key_id, amount: purchase.quote.total_paise,
        currency: purchase.quote.currency, order_id: purchase.razorpay_order_id, name: "Progress Rooms",
        description: `${purchase.quote.plan_name} · Monthly subscription`, theme: { color: "#133623" },
        modal: { ondismiss: () => { setBusy(false); setMessage("Checkout closed. If your account was debited, use Check payment below."); void refresh().catch(() => setError("Payment history could not refresh. Reload before retrying payment.")); } },
        handler: async (result) => {
          setMessage("Confirming your payment…");
          try {
            await post(`${path}/checkouts/${purchase.id}/verify`, result);
            sessionStorage.removeItem(keyName); setQuote(null); setConsent(false);
            setMessage("Payment verified. Your subscription is active.");
            window.dispatchEvent(new Event("saas-billing-updated"));
          } catch (e) { setMessage(""); setError(e instanceof Error ? e.message : "Payment confirmation is pending. Use Check payment below."); }
          finally { setBusy(false); await refresh().catch(() => setError("Payment history could not refresh. Reload before retrying payment.")); }
        } });
      widget.on("payment.failed", () => { setError("Payment was not completed. If money was debited, check its status before retrying."); });
      widget.open(); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Checkout could not open"); setBusy(false); await refresh().catch(() => {}); }
  }

  return <div className="space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-widest text-[#2D7A58]">Your platform subscription</p><h1 className="mt-1 text-3xl font-bold text-[#133623]">Progress Rooms Billing</h1><p className="mt-2 text-sm text-slate-500">{data?.studio_name || "Studio"} · Plans, payments and renewal</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">{message}</p>}
    {!data && !error && <p role="status">Loading your subscription…</p>}
    {data && <>
      <section className="rounded-2xl border border-[#CEDECF] bg-[#F4F7F4] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#275539]">{data.access.state === "LEGACY" ? "Existing account" : data.access.state.replaceAll("_", " ")}</p>
        <h2 className="mt-2 text-xl font-bold">{data.plan_name || "Choose your subscription"}</h2>
        {["TRIAL", "TRIAL_ENDING", "GRACE"].includes(data.access.state) ? <><p className="mt-2 text-sm">Subscription trial ends {formatDate(data.access.trial_ends_at)}. Access restriction date: {formatDate(data.access.restriction_at)}.</p><p className="mt-2 text-sm">The trial waives the subscription price. Active-student usage remains chargeable.</p></> :
          ["ACTIVE", "PAID_ENDING", "PAID_GRACE"].includes(data.access.state) ? <p className="mt-2 text-sm">Paid access through {formatDate(data.access.paid_through)}. Renew before {formatDate(data.access.restriction_at)} to avoid restrictions. Renewals extend your existing coverage.</p> :
          data.access.state === "RESTRICTED" ? <p className="mt-2 text-sm">{data.enforcement_enabled ? "Choose a plan to restore your studio. Your data is saved; Billing and Settings remain available." : "Your subscription has ended. Contact support to activate your subscription."}</p> :
          <p className="mt-2 text-sm">Review the available plans below. Contact support if your existing subscription needs to be linked.</p>}
      </section>
      <section className="space-y-3 rounded-2xl border bg-white p-5">
        <label className="block text-sm font-semibold">Where does your studio or teaching business operate?<select value={country} onChange={e => { setCountry(e.target.value); setQuote(null); setConsent(false); }} className="mt-2 block w-full rounded-xl border bg-white p-3 sm:max-w-sm"><option value="">Select location</option><option value="IN">India</option><option value="OTHER">Outside India</option></select></label>
        {country === "OTHER" && <p className="text-sm text-slate-600">{SAAS_INTERNATIONAL_NOTICE} <a href={`mailto:${SAAS_SUPPORT_EMAIL}`} className="font-semibold underline">Contact support</a></p>}
      </section>
      <div className="grid gap-5 md:grid-cols-2">{data.plans.map(plan => <section key={plan.id} className="rounded-2xl border border-[#CEDECF] bg-white p-6">
        <h2 className="text-xl font-bold text-[#133623]">{plan.name}</h2><p className="mt-3 text-3xl font-bold">{formatMoney(plan.base_paise)}<span className="text-sm font-normal text-slate-500"> / month</span></p>
        <p className="mt-2 text-sm text-slate-500">Before GST · Active-student usage billed separately</p>
        <button disabled={busy || country !== "IN"} onClick={() => review(plan.id)} className="mt-5 rounded-xl bg-[#133623] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Review {plan.name} plan</button>
      </section>)}</div>
      {quote && <section aria-label="Review payment" className="space-y-4 rounded-2xl border-2 border-[#275539] bg-white p-6">
        <h2 className="text-xl font-bold">Review your {quote.plan_name} purchase</h2>
        <dl className="space-y-3 text-sm">{[["Monthly subscription", quote.base_paise], ["Customer platform fee", quote.platform_fee_paise], [`GST (${quote.gst_bps / 100}%)`, quote.gst_paise], ["Total payable", quote.total_paise]].map(([label, amount]) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-bold">{formatMoney(Number(amount))}</dd></div>)}</dl>
        <p className="text-xs text-slate-500">Early purchase preserves your remaining trial. Your paid month follows the trial; after the trial, it starts when payment is verified. Active-student usage is excluded from this payment.</p>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1"/><span>I have reviewed the total and the <Link href="/pricing-policy" target="_blank" className="underline">pricing policy</Link>, including separate usage charges during the trial.</span></label>
        {!data.checkout_available && <p role="status" className="text-sm text-amber-800">{data.checkout_message}</p>}
        <button disabled={busy || !consent || !data.checkout_available} onClick={pay} className="rounded-xl bg-[#133623] px-5 py-3 font-semibold text-white disabled:opacity-40">{busy ? "Processing…" : `Pay ${formatMoney(quote.total_paise)} with Razorpay`}</button>
      </section>}
      <section className="space-y-3 rounded-2xl border bg-white p-5 text-sm text-slate-600"><p>{SAAS_TAX_NOTICE}</p><p>{SAAS_USAGE_NOTICE}</p><p>{SAAS_INTERNATIONAL_NOTICE}</p><Link href="/pricing-policy" className="inline-block font-semibold underline">Read pricing policy</Link></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-bold">Payment history</h2><div className="mt-4 space-y-3">{data.purchases.length ? data.purchases.map(p => <article key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"><div><p className="font-semibold">{p.quote.plan_name} · {formatMoney(p.quote.total_paise)}</p><p className="mt-1 text-xs text-slate-500">{p.status} {p.receipt_number && `· ${p.receipt_number}`}</p>{p.service_starts_at && <p className="mt-1 text-xs text-slate-500">{formatDate(p.service_starts_at)} – {formatDate(p.service_ends_at)}</p>}</div>{p.status !== "PAID" && <button disabled={busy} onClick={() => checkPayment(p)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Check payment</button>}</article>) : <p className="text-sm text-slate-500">No subscription payments yet.</p>}</div></section>
    </>}
  </div>;
}
