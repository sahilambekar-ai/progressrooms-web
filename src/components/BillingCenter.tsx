"use client";

import { ScheduleInput } from "@/components/ScheduleInput";

import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, Printer, RefreshCw } from "lucide-react";
import { staffApi } from "@/lib/staff-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
type Interval = "daily" | "weekly" | "monthly";
type Mode = "dashboard" | "downloads";
type DownloadMode = "financial-year" | "month" | "custom";
interface Teacher { id: string; name: string }
interface BillingRow { id: string; billing_date: string; student_name: string; student_email: string; class_name: string; teacher_names: string[]; subscription_type: string; subscription_value: number; currency: string; enrollment_status: string; sessions_taken: number; sessions_excused_or_cancelled: number }
interface BillingData { start_date: string; end_date: string; interval: Interval; currency: string; total_billed: number; billing_count: number; average_billing: number; active_count: number; series: { period: string; label: string; amount: number }[]; rows: BillingRow[]; total_items: number; page: number; page_size: number; total_pages: number; calculation_note: string }

const iso = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const html = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character] || character));
const financialYear = (startYear: number) => ({ start: `${startYear}-04-01`, end: `${startYear + 1}-03-31` });
const period = (kind: "month" | "last-30-days" | "financial-year") => {
  const today = new Date();
  if (kind === "month") return { start: iso(new Date(today.getFullYear(), today.getMonth(), 1)), end: iso(new Date(today.getFullYear(), today.getMonth() + 1, 0)) };
  if (kind === "last-30-days") return { start: iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)), end: iso(today) };
  const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return financialYear(startYear);
};
const money = (amount: number, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

export function BillingCenter({ orgId, mode }: { orgId: string; mode: Mode }) {
  const initial = mode === "downloads" ? period("financial-year") : period("month");
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  const [interval, setInterval] = useState<Interval>("monthly");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentFinancialYear = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const [downloadMode, setDownloadMode] = useState<DownloadMode>("financial-year");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(currentFinancialYear);
  const [monthRange, setMonthRange] = useState("current-month");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<"date" | "name" | "amount" | "sessions">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const query = useMemo(() => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate, interval,
      page: String(page), page_size: String(mode === "downloads" ? 100 : pageSize), sort_by: sortBy, sort_order: sortOrder });
    if (teacherId) params.set("teacher_id", teacherId);
    return params.toString();
  }, [startDate, endDate, interval, teacherId, page, pageSize, sortBy, sortOrder, mode]);

  const load = async () => {
    if (!orgId || !startDate || !endDate) return;
    setLoading(true); setError("");
    try { setData(await staffApi(`/organizations/${orgId}/billing/summary?${query}`)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Billing details could not be loaded."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (orgId) staffApi(`/organizations/${orgId}/billing/teachers`).then(setTeachers).catch(() => setTeachers([])); }, [orgId]);
  useEffect(() => { void load(); }, [query, orgId]); // eslint-disable-line react-hooks/exhaustive-deps

  const chooseDownloadMode = (value: DownloadMode) => {
    setDownloadMode(value);
    if (value === "financial-year") {
      const selected = financialYear(selectedFinancialYear); setStartDate(selected.start); setEndDate(selected.end); setInterval("monthly"); setPage(1);
    } else if (value === "month") {
      applyMonthRange(monthRange);
    }
  };
  const applyMonthRange = (value: string) => {
    setMonthRange(value); setPage(1); setInterval("daily");
    if (value === "current-month" || value === "last-30-days") {
      const selected = period(value === "current-month" ? "month" : "last-30-days"); setStartDate(selected.start); setEndDate(selected.end); return;
    }
    const month = Number(value);
    const year = new Date().getFullYear();
    setStartDate(iso(new Date(year, month, 1))); setEndDate(iso(new Date(year, month + 1, 0)));
  };
  const downloadCsv = async () => {
    setError("");
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    if (teacherId) params.set("teacher_id", teacherId);
    const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
    try {
      const response = await fetch(`${API_BASE}/organizations/${orgId}/billing/export.csv?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setError("CSV download failed. Please check permissions or select a valid date range.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `billing-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Network error occurred during CSV download.");
    }
  };
  const printStatement = () => {
    if (!data) return;
    const teacher = teachers.find(item => item.id === teacherId)?.name || "All teachers";
    const rows = data.rows.map(row => `<tr><td>${html(row.billing_date)}</td><td>${html(row.student_name)}</td><td>${html(row.class_name)}</td><td>${html(row.teacher_names.join(", ") || "—")}</td><td>${html(row.subscription_type)}</td><td style="text-align:right">${html(money(row.subscription_value, row.currency))}</td></tr>`).join("");
    const popup = window.open("", "_blank");
    if (!popup) { setError("Allow pop-ups to print this billing statement."); return; }
    popup.opener = null;
    const fontFamily = getComputedStyle(document.body).fontFamily;
    const fontFaces = Array.from(document.styleSheets).flatMap(sheet => {
      try { return Array.from(sheet.cssRules).filter(rule => rule.type === CSSRule.FONT_FACE_RULE).map(rule => rule.cssText); }
      catch { return []; }
    }).join("\n");
    popup.document.write(`<!doctype html><html><head><title>Billing statement</title><style>${fontFaces}body{font-size:13px;font-family:${fontFamily};color:#17271f;padding:32px}h1{margin-bottom:4px}.muted{color:#66756c}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:9px;border-bottom:1px solid #dce7df;text-align:left}th{background:#f1f6f2}.total{font-size:20px;font-weight:bold;margin-top:20px}button{font-family:inherit}@media print{button{display:none}}</style></head><body><h1>Subscription billing statement</h1><p class="muted">${html(startDate)} to ${html(endDate)} · ${html(teacher)}</p><p>This statement is calculated from subscription values and excludes payment transactions.</p><div class="total">Total billed: ${html(money(data.total_billed, data.currency))}</div><table><thead><tr><th>Date</th><th>Student</th><th>Class</th><th>Teacher</th><th>Plan</th><th>Value</th></tr></thead><tbody>${rows || `<tr><td colspan="6">No billing values in this period.</td></tr>`}</tbody></table><button onclick="window.print()">Print / Save as PDF</button></body></html>`);
    popup.document.close(); popup.focus();
  };
  const max = Math.max(...(data?.series.map(item => item.amount) || [0]), 1);

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#2D7A58]">Owner finance workspace</p><h1 className="text-2xl font-serif font-bold text-[#0C2417]">{mode === "dashboard" ? "Billing Dashboard" : "Download Bills"}</h1><p className="mt-1 max-w-3xl text-xs text-[#40514E]">Subscription-value reporting for your studio. Payment transactions and gateway details are excluded.</p></div>
      <label className="text-xs font-bold text-slate-600">Teacher view<select value={teacherId} onChange={event => setTeacherId(event.target.value)} className="mt-1 block min-w-56 rounded-xl border border-[#CEDECF] bg-white px-3 py-2 font-medium"><option value="">All teachers</option>{teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></label>
    </div>

    {mode === "dashboard" ? <>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E1E9E2] bg-white p-3">
        {(["daily", "weekly", "monthly"] as Interval[]).map(value => <button key={value} onClick={() => setInterval(value)} className={`rounded-xl px-4 py-2 text-xs font-bold capitalize ${interval === value ? "bg-[#133623] text-white" : "bg-[#F4F7F4] text-[#40514E]"}`}>{value}</button>)}
        <span className="ml-auto text-xs text-slate-500">{startDate} → {endDate}</span>
        <button onClick={downloadCsv} className="flex items-center gap-1.5 rounded-xl border border-[#133623] px-3 py-1.5 text-xs font-bold text-[#133623] hover:bg-[#F4F7F4] transition"><FileSpreadsheet size={14}/>Export CSV</button>
        <button onClick={load} aria-label="Refresh billing" className="rounded-xl border p-2"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/></button>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[ ["Total billed", money(data?.total_billed || 0, data?.currency)], ["Subscription billings", data?.billing_count || 0], ["Average subscription", money(data?.average_billing || 0, data?.currency)], ["Active enrollments", data?.active_count || 0] ].map(([label, value]) => <div key={String(label)} className="rounded-3xl border border-[#E1E9E2] bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-[#0C2417]">{value}</p></div>)}
      </div>
      <div className="rounded-3xl border border-[#E1E9E2] bg-white p-5 shadow-sm"><div className="mb-6"><h2 className="font-serif text-lg font-bold text-[#0C2417]">Subscription billing trend</h2><p className="text-xs text-slate-500">Values are grouped by the selected view.</p></div><div className="flex min-h-64 items-end gap-3 overflow-x-auto border-b border-l border-[#DCE7DF] px-4 pt-4">{data?.series.length ? data.series.map(item => <div key={item.period} className="flex min-w-16 flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-[#40514E]">{money(item.amount, data.currency)}</span><div className="w-full max-w-20 rounded-t-xl bg-gradient-to-t from-[#133623] to-[#81A882]" style={{ height: `${Math.max(8, item.amount / max * 180)}px` }}/><span className="pb-2 text-[10px] text-slate-500">{item.label}</span></div>) : <div className="m-auto pb-20 text-sm text-slate-400">No subscription billings in this period.</div>}</div></div>
      <div className="overflow-hidden rounded-3xl border border-[#E1E9E2] bg-white shadow-sm"><div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-serif text-lg font-bold text-[#0C2417]">Billing details</h2><p className="text-xs text-slate-500">Paginated subscription values for this period.</p></div><div className="flex gap-2"><select value={sortBy} onChange={event => { setSortBy(event.target.value as typeof sortBy); setPage(1); }} className="rounded-lg border px-2 py-1.5 text-xs"><option value="date">Sort by date</option><option value="name">Sort by name</option><option value="amount">Sort by amount</option><option value="sessions">Sort by sessions</option></select><button onClick={() => { setSortOrder(value => value === "asc" ? "desc" : "asc"); setPage(1); }} className="rounded-lg border px-3 py-1.5 text-xs font-bold">{sortOrder === "asc" ? "Ascending" : "Descending"}</button></div></div><div className="max-h-96 overflow-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="sticky top-0 bg-[#F4F7F4] text-[#1b4332]"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Teacher</th><th className="px-5 py-3">Sessions</th><th className="px-5 py-3">Excused/cancelled</th><th className="px-5 py-3 text-right">Billing value</th></tr></thead><tbody className="divide-y divide-[#E1E9E2]">{data?.rows.length ? data.rows.map(row => <tr key={row.id}><td className="px-5 py-3">{row.billing_date}</td><td className="px-5 py-3"><span className="font-semibold text-[#0C2417]">{row.student_name}</span><span className="block text-[10px] text-slate-400">{row.student_email}</span></td><td className="px-5 py-3">{row.class_name}</td><td className="px-5 py-3">{row.teacher_names.join(", ") || "Unassigned"}</td><td className="px-5 py-3">{row.sessions_taken}</td><td className="px-5 py-3">{row.sessions_excused_or_cancelled}</td><td className="px-5 py-3 text-right font-bold">{money(row.subscription_value, row.currency)}</td></tr>) : <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No billing details for this period.</td></tr>}</tbody></table></div><div className="flex flex-col gap-3 border-t px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between"><span>Showing {data?.total_items ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, data?.total_items || 0)} of {data?.total_items || 0}</span><div className="flex items-center gap-2"><select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded-lg border px-2 py-1"><option value="10">10 rows</option><option value="20">20 rows</option><option value="50">50 rows</option></select><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page {page} of {data?.total_pages || 1}</span><button disabled={page >= (data?.total_pages || 1)} onClick={() => setPage(value => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div></div>
    </> : <>
      <div className="rounded-3xl border border-[#E1E9E2] bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-[#0C2417]">Choose a billing cycle</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">{([ ["financial-year", "Financial year", "Select an April–March year"], ["month", "Month", "Current month or last 30 days"], ["custom", "Custom", "Choose exact start and end dates"] ] as const).map(([value, title, description]) => <button key={value} type="button" onClick={() => chooseDownloadMode(value)} className={`rounded-2xl border p-4 text-left transition ${downloadMode === value ? "border-[#2D7A58] bg-[#E8F0E9] ring-2 ring-[#81A882]/30" : "border-[#DCE7DF] bg-white"}`}><span className="block text-sm font-bold text-[#0C2417]">{title}</span><span className="mt-1 block text-[11px] text-slate-500">{description}</span></button>)}</div>
        {downloadMode === "financial-year" && <label className="mt-5 block max-w-sm text-xs font-bold text-slate-600">Select financial year<select value={selectedFinancialYear} onChange={event => { const year = Number(event.target.value); setSelectedFinancialYear(year); const selected = financialYear(year); setStartDate(selected.start); setEndDate(selected.end); }} className="mt-1 w-full rounded-xl border border-[#CEDECF] bg-white px-3 py-2">{Array.from({ length: 8 }, (_, index) => currentFinancialYear - index).map(year => <option key={year} value={year}>FY {year}–{String(year + 1).slice(-2)}{year === currentFinancialYear ? " (Current)" : ""}</option>)}</select></label>}
        {downloadMode === "month" && <label className="mt-5 block max-w-sm text-xs font-bold text-slate-600">Select month period<select value={monthRange} onChange={event => applyMonthRange(event.target.value)} className="mt-1 w-full rounded-xl border border-[#CEDECF] bg-white px-3 py-2"><option value="current-month">Current month</option><option value="last-30-days">Last 30 days</option>{Array.from({ length: 12 }, (_, month) => <option key={month} value={month}>{new Date(2026, month, 1).toLocaleString("en-IN", { month: "long" })}</option>)}</select></label>}
        {downloadMode === "custom" && <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600">Start date<ScheduleInput type="date" value={startDate} max={endDate} onValueChange={setStartDate} className="mt-1 w-full rounded-xl border border-[#CEDECF] px-3 py-2"/></label><label className="text-xs font-bold text-slate-600">End date<ScheduleInput type="date" value={endDate} min={startDate} onValueChange={setEndDate} className="mt-1 w-full rounded-xl border border-[#CEDECF] px-3 py-2"/></label></div>}
        <p className="mt-4 text-xs text-slate-500">Selected period: <strong>{startDate}</strong> to <strong>{endDate}</strong></p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-3"><button onClick={downloadCsv} className="flex items-center gap-2 rounded-xl bg-[#133623] px-4 py-2.5 text-xs font-bold text-white"><FileSpreadsheet size={16}/>Download CSV</button><button onClick={printStatement} className="flex items-center gap-2 rounded-xl border border-[#133623] px-4 py-2.5 text-xs font-bold text-[#133623]"><Printer size={16}/>Print / Save PDF</button></div>
      </div>
      <div className="rounded-3xl border border-[#E1E9E2] bg-white p-5"><div className="flex items-center gap-2"><Download size={18}/><h2 className="font-bold text-[#0C2417]">Statement preview</h2></div><p className="mt-2 text-xs text-slate-500">{data?.billing_count || 0} billing records · {money(data?.total_billed || 0, data?.currency)} · {startDate} to {endDate}</p></div>
    </>}
  </div>;
}
