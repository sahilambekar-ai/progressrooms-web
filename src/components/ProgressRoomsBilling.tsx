"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { staffApi } from "@/lib/staff-api";

interface Invoice { id: string; number: string; month: string; active_students: number; rate: number; free_limit: number; amount: number; currency: string; generated_at: string }
interface Billing {
  studio_name: string; month: string; timezone: string; active_students: number; join_clicks: number;
  studio_active_students: number; total_teachers: number; total_students: number; active_subscriptions: number;
  active_plans: { name: string; subscriptions: number }[]; total_revenue: { currency: string; amount: number }[];
  free_limit: number; rate: number; platform_amount: number | null; currency: string; billing_status: string;
  invoices: Invoice[]; calculation_note: string;
}
const money = (value: number, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
const monthLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export function ProgressRoomsBilling({ orgId, isAdmin = false }: { orgId: string; isAdmin?: boolean }) {
  const [month, setMonth] = useState("");
  const [teacher, setTeacher] = useState("");
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [data, setData] = useState<Billing | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const path = isAdmin ? `/admin/organizations/${orgId}` : `/organizations/${orgId}/billing`;

  useEffect(() => {
    let cancelled = false;
    setTeachers([]);
    staffApi(`${path}/teachers`).then(result => { if (!cancelled) setTeachers(result); })
      .catch(() => { if (!cancelled) setError("Teacher filters could not be loaded. Refresh to try again."); });
    return () => { cancelled = true; };
  }, [path, revision]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setData(null);
    const query = new URLSearchParams();
    if (month) query.set("month", `${month}-01`);
    if (teacher) query.set("teacher_id", teacher);
    staffApi(`${path}/progressrooms?${query}`).then(result => { if (!cancelled) setData(result); })
      .catch(reason => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Billing could not be loaded."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path, month, teacher, revision]);

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-[#2D7A58]">{isAdmin ? "Studio performance" : "Billing details"}</p>
        <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Progress Rooms Billing</h1>
        <p className="mt-1 text-sm text-slate-500">{data?.studio_name || "Studio"} · Monthly active-student usage and platform statements</p></div>
      <button onClick={() => setRevision(value => value + 1)} className="rounded-xl border bg-white p-3" aria-label="Refresh platform billing"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
    </div>
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border bg-white p-4">
      <label className="text-xs font-semibold text-slate-600">Billing month<input type="month" value={month || data?.month.slice(0, 7) || ""} onChange={event => setMonth(event.target.value)} className="mt-2 block rounded-xl border p-2 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">Teacher<select value={teacher} onChange={event => setTeacher(event.target.value)} className="mt-2 block min-w-48 rounded-xl border p-2 text-sm"><option value="">All teachers · Studio overview</option>{teachers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <button onClick={() => { setMonth(""); setTeacher(""); setRevision(value => value + 1); }} className="rounded-xl border px-4 py-2 text-sm">Current month</button>
      {data && <p className="pb-2 text-xs text-slate-500">{monthLabel(data.month)} · {data.timezone}</p>}
    </div>
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading && <p role="status" className="p-6 text-sm text-slate-500">Loading active students and billing…</p>}
    {data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Active students this month", data.active_students, "Unique students with a valid subscription who clicked Join"],
          ["Successful join clicks", data.join_clicks, "Repeat clicks are recorded; each student counts once"],
          ["Active subscriptions now", data.active_subscriptions, "Currently valid plans with available class credits"],
          [data.billing_status === "ESTIMATE" ? "Estimated usage fee" : "Usage statement amount", data.platform_amount === null ? "Contact support" : money(data.platform_amount), "Whole studio · Before tax"]].map(([label, value, note]) =>
          <div key={String(label)} className="rounded-2xl border border-[#E1E9E2] bg-white p-5"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="my-2 text-3xl font-bold text-[#133623]">{value}</p><p className="text-xs text-slate-500">{note}</p></div>)}
      </div>
      <div className="rounded-2xl border border-[#CEDECF] bg-[#F4F7F4] p-5">
        <h2 className="font-bold text-[#133623]">{data.billing_status === "CONTACT_SUPPORT" ? "Country-based pricing · Contact support" : data.studio_active_students <= data.free_limit ? `Free usage tier · ${data.studio_active_students} of ${data.free_limit} active students` : `${data.studio_active_students} active students × ${money(data.rate)}`}</h2>
        <p className="mt-2 text-sm text-slate-600">{data.calculation_note}</p>
        <p className="mt-2 text-xs text-slate-500">{data.billing_status === "CONTACT_SUPPORT" ? "International or unconfirmed countries require review. An automatic Indian-rate statement will not be generated for this month." : data.billing_status === "ESTIMATE" ? "This estimate grows during the month. A fixed statement is generated after the month ends." : data.billing_status === "NO_ACTIVITY" ? "No qualifying activity was recorded for this month." : "This month’s statement has been generated and its amount is fixed."} Joining is recorded when a meeting link is successfully returned; this does not confirm attendance. Tracking starts with this feature; earlier joins are not reconstructed.</p>
        {teacher && <p className="mt-2 text-xs font-semibold text-[#133623]">Teacher filters apply to student activity, active plans and collected revenue. Platform fees and invoice history remain studio-wide. Students and shared orders may appear under multiple teachers.</p>}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5"><h2 className="font-serif text-lg font-bold">Studio snapshot</h2><div className="mt-4 grid grid-cols-2 gap-4"><p className="text-sm text-slate-500">Total teachers<strong className="mt-1 block text-2xl text-[#133623]">{data.total_teachers}</strong></p><p className="text-sm text-slate-500">Total students<strong className="mt-1 block text-2xl text-[#133623]">{data.total_students}</strong></p></div><h3 className="mt-5 text-sm font-semibold">Total collected revenue · All time</h3><p className="mt-2 text-xl font-bold text-[#133623]">{data.total_revenue.map(row => money(row.amount, row.currency)).join(" · ") || "No paid orders"}</p><p className="mt-2 text-xs text-slate-500">Paid student orders, counted once per order. This is studio revenue; Progress Rooms fees are shown separately.</p></section>
        <section className="rounded-2xl border bg-white p-5"><h2 className="font-serif text-lg font-bold">Active plans now</h2>{data.active_plans.length ? <ul className="mt-3 max-h-80 divide-y overflow-y-auto pr-2">{data.active_plans.map(plan => <li key={plan.name} className="flex justify-between gap-4 py-3 text-sm"><span>{plan.name}</span><strong>{plan.subscriptions} subscription{plan.subscriptions === 1 ? "" : "s"}</strong></li>)}</ul> : <p className="py-8 text-sm text-slate-400">No active plans with available credits.</p>}</section>
      </div>
      <section className="overflow-hidden rounded-2xl border bg-white"><div className="p-5"><h2 className="font-serif text-lg font-bold">Generated monthly statements</h2><p className="mt-1 text-xs text-slate-500">Completed months with recorded usage. Amounts are fixed at generation; payment collection is handled separately.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#F4F7F4] text-xs text-slate-500"><tr>{["Statement", "Month", "Active students", "Rate", "Platform fee"].map(label => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody className="divide-y">{data.invoices.length ? data.invoices.map(invoice => <tr key={invoice.id}><td className="px-5 py-4 font-mono text-xs">{invoice.number}</td><td className="px-5 py-4">{monthLabel(invoice.month)}</td><td className="px-5 py-4">{invoice.active_students}</td><td className="px-5 py-4">{invoice.active_students <= invoice.free_limit ? "Free" : money(invoice.rate, invoice.currency)}</td><td className="px-5 py-4 font-bold">{money(invoice.amount, invoice.currency)}</td></tr>) : <tr><td colSpan={5} className="p-8 text-center text-slate-400">No completed monthly statements yet.</td></tr>}</tbody></table></div></section>
    </>}
  </div>;
}
