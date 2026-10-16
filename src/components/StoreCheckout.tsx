"use client";
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { WhatsAppNotificationHint } from './WhatsAppNotificationHint';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export interface Purchase { id: string; kind: 'class' | 'pass'; name: string; price: number; offer_price?: number | null; currency: string; total_classes?: number; validity_days?: number }
export function StoreCheckout({ offering, onClose }: { offering: Purchase; onClose: () => void }) {
  const amountDue = offering.offer_price ?? offering.price;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState<any>(null);
  const recoveryKey = `pr_payment_recovery_${offering.kind}_${offering.id}`;
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(recoveryKey);
      if (saved) { setPending(JSON.parse(saved)); setError('Your payment still needs confirmation. Please retry below.'); }
    } catch { sessionStorage.removeItem(recoveryKey); }
  }, [recoveryKey]);
  async function request(path: string, body: object) {
    const response = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('pr_access_token')}` }, body: JSON.stringify(body) });
    const data = await response.json();
    if (response.status === 401) {
      localStorage.removeItem('pr_access_token'); localStorage.removeItem('pr_user');
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
    if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Could not complete purchase. Please try again.');
    return data;
  }
  async function verify(order: any, payment: any) {
    setBusy(true); setPending({ order, payment });
    sessionStorage.setItem(recoveryKey, JSON.stringify({ order, payment }));
    try {
      await request('/commerce/payments/verify', { order_id: order.order_id, ...payment });
      setSuccess(true); setPending(null); sessionStorage.removeItem(recoveryKey);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not confirm payment.'); }
    finally { setBusy(false); }
  }
  async function buy() {
    if (!localStorage.getItem('pr_access_token')) {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`); return;
    }
    setBusy(true); setError('');
    try {
      const order = await request('/commerce/orders', offering.kind === 'class' ? { session_id: offering.id } : { tier_id: offering.id });
      if (order.free) {
        await verify(order, { razorpay_order_id: order.razorpay_order_id, razorpay_payment_id: `free_${order.order_id.replaceAll('-', '')}`, razorpay_signature: 'free-enrollment' });
        return;
      }
      if (order.mock) {
        await verify(order, { razorpay_order_id: order.razorpay_order_id, razorpay_payment_id: `dev_${order.order_id.replaceAll('-', '')}`, razorpay_signature: 'development-only' });
        return;
      }
      if (!(window as any).Razorpay) await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(); script.onerror = () => reject(new Error('Payment window could not load. Please try again.')); document.head.appendChild(script);
      });
      const checkout = new (window as any).Razorpay({ key: order.razorpay_key_id, order_id: order.razorpay_order_id,
        amount: Math.round(order.amount * 100), currency: order.currency, name: offering.name,
        handler: (payment: any) => { void verify(order, payment); },
        modal: { ondismiss: () => { setBusy(false); } }, theme: { color: '#133623' } });
      checkout.on('payment.failed', () => { setError('Payment was unsuccessful. You can try again.'); setBusy(false); });
      checkout.open();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not start checkout.'); setBusy(false); }
  }
  return <Modal title={success ? 'Purchase complete' : 'Review your purchase'} subtitle={success ? 'You’re ready to begin.' : offering.name} onClose={onClose}>
    <div className="relative p-6 max-w-lg space-y-5">
      {success ? <><p>Your purchase is active. Your classes and session allowance are available in your dashboard.</p><a className="block rounded-xl bg-[#133623] text-white text-center p-4" href="/student">Go to my dashboard</a></> : <>
        {offering.offer_price != null && offering.offer_price < offering.price && (
          <p className="text-sm text-slate-500">
            <span className="line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: offering.currency }).format(offering.price)}</span>{" "}
            <span className="ml-2 font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">Special Offer</span>
          </p>
        )}
        <p className="text-3xl font-serif font-black text-[#0C2417]">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: offering.currency }).format(amountDue)}
        </p>

        {/* Clear Policy Breakdown */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#CEDECF] text-xs space-y-2.5 text-slate-700">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-slate-500">Plan Type:</span>
            <span className="font-bold text-[#0C2417] capitalize">{offering.kind === 'pass' ? 'Studio Pass / Membership' : 'Class Enrollment'}</span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
            <span className="font-semibold text-slate-500">Session Credits:</span>
            <span className="font-bold text-[#0C2417]">
              {offering.total_classes ? `${offering.total_classes} session credits` : 'Unlimited sessions'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
            <span className="font-semibold text-slate-500">Validity Period:</span>
            <span className="font-bold text-[#0C2417]">{offering.validity_days || 30} days from purchase</span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
            <span className="font-semibold text-slate-500">Activation:</span>
            <span className="font-bold text-emerald-800">Immediate upon confirmed payment</span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
            <span className="font-semibold text-slate-500">Renewal Policy:</span>
            <span className="text-slate-700">One-time purchase; no automatic recurring deductions.</span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
            <span className="font-semibold text-slate-500">Live Classroom Access:</span>
            <span className="text-slate-700">Join links open 15 minutes before scheduled start in your Student Portal.</span>
          </div>

          <div className="flex items-start justify-between gap-2 border-t border-[#E1E9E2] pt-2">
            <span className="font-semibold text-slate-500">Cancellation:</span>
            <span className="text-slate-700">Free cancellation up to 2 hours prior to start. Credits refunded to pass.</span>
          </div>
        </div>

        {error && <p role="alert" className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">{error}</p>}
        <button
          disabled={busy}
          className="w-full p-4 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold transition disabled:opacity-50 shadow-md"
          onClick={() => pending ? void verify(pending.order, pending.payment) : void buy()}
        >
          {busy ? 'Please wait…' : pending ? 'Retry payment confirmation' : amountDue === 0 ? 'Confirm free enrollment' : `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: offering.currency }).format(amountDue)}`}
        </button>
      </>}
      <WhatsAppNotificationHint description="ProgressRooms Admin: payment confirmation after verified payment. ProgressRooms Classes: reminders 2 hours and 15 minutes before class, with the latest details and access link. Join 5 minutes early." />
    </div>
  </Modal>;
}
