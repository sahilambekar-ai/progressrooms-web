"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Building2, ChevronDown, ExternalLink, Landmark, MapPin, RefreshCw, Search, ShieldCheck, Users, Video } from "lucide-react";
import { staffApi } from "@/lib/staff-api";
import { Modal } from "@/components/Modal";
import { ProgressRoomsBilling } from "@/components/ProgressRoomsBilling";

interface Studio {
  id: string; name: string; slug: string; status: string; created_at: string;
  owner: { name: string; email: string } | null; phone: string | null;
  city: string | null; state: string | null; teaching_mode: string | null; account_completed: boolean;
  total_teachers: number; total_students: number; active_students: number;
  estimated_platform_fee: number | null; billing_currency: string; billing_month: string; timezone: string;
}
interface Details { website_url: string | null; id: string; name: string; slug: string; status: string; timezone: string; currency: string; created_at: string; profile: Record<string, string | boolean | number | null>; contacts: { name: string; email: string }[]; total_teachers: number; total_students: number; active_students: number }
const zoomFields = ["zoom_auto_meeting_enabled", "zoom_waiting_room", "zoom_host_video", "zoom_enforce_basic_login", "zoom_enforce_zoom_login", "zoom_group_allow_self_buy_subscriptions", "zoom_group_active_subscription_required", "zoom_group_confirm_checkin_everytime", "zoom_personal_allow_self_buy_subscriptions", "zoom_personal_active_subscription_required", "zoom_personal_confirm_checkin_everytime", "zoom_personal_no_show_penalty", "zoom_join_before_host", "zoom_cloud_recording_mode"];
const labels: Record<string, string> = {
  studio_tagline: "Tagline", teaching_mode: "Teaching mode", whatsapp_number: "WhatsApp number", support_email: "Support email",
  support_phone: "Support phone", brand_color: "Brand colour", has_gst: "GST registered", gst_number: "GST number", pan_number: "PAN number",
  ifsc_code: "IFSC code", upi_id: "UPI ID", address_line1: "Address line 1", address_line2: "Address line 2",
  zoom_group_confirm_checkin_everytime: "Group classes · Confirm each check-in", zoom_personal_confirm_checkin_everytime: "Personal classes · Confirm each check-in",
};
const label = (value: string) => labels[value] || value.replace(/_/g, " ").replace(/\b\w/g, character => character.toUpperCase()).replace(/^Zoom /, "");
const display = (value: string | boolean | number | null | undefined) => typeof value === "boolean" ? (value ? "Yes" : "No") : value === null || value === undefined || value === "" ? "Not provided" : String(value).replace(/_/g, " ");
const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function Status({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}><span className={`h-1.5 w-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-600" : "bg-amber-600"}`} />{status === "ACTIVE" ? "Active" : display(status)}</span>;
}
function ProfileSection({ title, icon, fields, profile }: { title: string; icon: ReactNode; fields: string[]; profile: Details["profile"] }) {
  return <section className="overflow-hidden rounded-2xl border border-[#DFE7E1] bg-white">
    <div className="flex items-center gap-2.5 border-b border-[#E9EEE9] bg-[#F8FAF8] px-5 py-3.5"><span className="text-[#52745E]">{icon}</span><h3 className="text-sm font-bold text-[#173C29]">{title}</h3></div>
    <dl className="grid gap-x-5 gap-y-5 p-5 sm:grid-cols-2">{fields.map(field => <div key={field} className="min-w-0"><dt className="text-[11px] font-semibold text-slate-500">{label(field)}</dt><dd className={`mt-1.5 break-words text-[13px] leading-relaxed ${profile[field] === null || profile[field] === "" || profile[field] === undefined ? "text-slate-400" : "font-medium text-slate-800"}`}>{field === "brand_color" && /^#[0-9a-f]{6}$/i.test(String(profile[field])) ? <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded-md border border-black/10" style={{ backgroundColor: String(profile[field]) }} />{display(profile[field])}</span> : display(profile[field])}</dd></div>)}</dl>
  </section>;
}

export function AdminStudios({ mode, onViewMore }: { mode: "directory" | "billing"; onViewMore: (id: string) => void }) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<Details | null>(null);
  const [detailId, setDetailId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError("");
    const requested = new URLSearchParams(window.location.search).get("studio");
    staffApi("/admin/organizations").then(rows => { if (!cancelled) { setStudios(rows); if (requested && rows.some((row: Studio) => row.id === requested)) setSelected(requested); } })
      .catch(reason => { if (!cancelled) setError(reason.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [revision]);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    if (detailId) staffApi(`/admin/organizations/${detailId}`).then(row => { if (!cancelled) setDetails(row); })
      .catch(reason => { if (!cancelled) setError(reason.message); });
    return () => { cancelled = true; };
  }, [detailId]);

  const chooseStudio = (id: string) => {
    setSelected(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("studio", id); else url.searchParams.delete("studio");
    window.history.replaceState({}, "", url.toString());
  };
  const filtered = studios.filter(studio => (status === "ALL" || (status === "ACTIVE" ? studio.status === "ACTIVE" : studio.status !== "ACTIVE")) &&
    [studio.name, studio.slug, studio.owner?.name, studio.owner?.email, studio.phone, studio.city, studio.state].join(" ").toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const openStudio = (id: string) => { setError(""); setDetailId(id); };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#547760]">Platform administration</p><h1 className="text-2xl font-serif font-bold text-[#0C2417]">{mode === "directory" ? "Manage Studios" : "Studio Billing & Activity"}</h1><p className="mt-2 text-xs leading-relaxed text-slate-500">{mode === "directory" ? "Your studio directory — ownership, student activity and billing at a glance." : "Select a studio to review active students, revenue and platform statements."}</p></div><button onClick={() => setRevision(value => value + 1)} className="inline-flex items-center gap-2 rounded-xl border border-[#DDE6DF] bg-white px-4 py-2.5 text-xs font-semibold text-[#244B34]"><RefreshCw size={14} className={loading ? "animate-spin" : ""} />Refresh</button></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {mode === "billing" ? <>
      <label className="block rounded-2xl border bg-white p-4 text-xs font-semibold text-slate-600">Studio<select value={selected} onChange={event => chooseStudio(event.target.value)} className="mt-2 block w-full rounded-xl border p-3 text-sm"><option value="">Select a studio</option>{studios.map(studio => <option key={studio.id} value={studio.id}>{studio.name} · {studio.status}</option>)}</select></label>
      {selected ? <ProgressRoomsBilling key={selected} orgId={selected} isAdmin /> : <p role={loading ? "status" : undefined} className="rounded-2xl border bg-white p-12 text-center text-slate-400">{loading ? "Loading studios…" : "Choose a studio to open its dashboard. All teachers are included by default."}</p>}
    </> : <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[
        ["Registered studios", studios.length, "Across the platform"],
        ["Active studios", studios.filter(studio => studio.status === "ACTIVE").length, "Currently enabled"],
        ["Total students", studios.reduce((sum, studio) => sum + studio.total_students, 0), "Studio enrollments"],
        ["Active students this month", studios.reduce((sum, studio) => sum + studio.active_students, 0), "Unique within each studio"],
      ].map(([name, value, note]) => <div key={String(name)} className="rounded-2xl border border-[#DFE7E1] bg-white px-5 py-4"><p className="text-[11px] font-semibold text-slate-500">{name}</p><p className="mt-2 text-2xl font-bold text-[#143822]">{loading ? "—" : Number(value).toLocaleString("en-IN")}</p><p className="mt-1 text-[10px] text-slate-400">{note}</p></div>)}</div>
      <div className="overflow-hidden rounded-2xl border border-[#DFE7E1] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7EDE8] p-4"><label className="relative block min-w-56 flex-1 sm:max-w-md"><span className="sr-only">Search studios</span><Search size={15} className="absolute left-3 top-3 text-slate-400" /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search studio, owner, email or location…" className="w-full rounded-xl border border-[#DDE6DF] bg-[#FAFCFA] py-2.5 pl-9 pr-3 text-xs" /></label><label className="flex items-center gap-2 text-xs text-slate-500">Status<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-[#DDE6DF] px-3 py-2.5 text-xs text-slate-700"><option value="ALL">All studios</option><option value="ACTIVE">Active</option><option value="OTHER">Inactive / suspended</option></select></label></div>
        <div className="overflow-x-auto" role="region" aria-label="Studio directory" tabIndex={0}><table className="w-full text-left text-xs" style={{ minWidth: 1220, tableLayout: "fixed" }}><colgroup>{[180, 180, 125, 75, 75, 125, 100, 120, 110, 130].map((width, index) => <col key={index} style={{ width }} />)}</colgroup><thead className="border-b border-[#E7EDE8] bg-[#F5F8F5] text-[10px] uppercase tracking-wider text-[#5C7264]"><tr>{["Studio", "Owner & contact", "Location / mode", "Teachers", "Students", "Active this month", "Platform fee", "Status / setup", "Registered", ""].map((name, index) => <th key={index} className={`whitespace-nowrap px-3 py-3.5 font-bold ${index >= 3 && index <= 6 ? "text-right" : ""} ${index === 9 ? "sticky right-0 z-20 bg-[#F5F8F5]" : index === 0 ? "sticky left-0 z-10 bg-[#F5F8F5]" : ""}`} scope="col">{name || <span className="sr-only">Actions</span>}</th>)}</tr></thead><tbody className="divide-y divide-[#E9EEE9]">{visible.map(studio => <tr key={studio.id} className="transition-colors hover:bg-[#FAFCFA]">
          <td className="sticky left-0 z-10 max-w-56 bg-white px-3 py-4"><button onClick={() => openStudio(studio.id)} className="text-left text-[13px] font-bold leading-snug text-[#173F2A] hover:underline">{studio.name}</button><p className="mt-1.5 truncate text-[10px] text-slate-400" title={`/${studio.slug}`}>/{studio.slug}</p></td>
          <td className="sticky left-0 z-10 max-w-56 bg-white px-3 py-4"><p className="font-semibold text-slate-700">{studio.owner?.name || "Not provided"}</p><p className="mt-1 truncate text-[10px] text-slate-500" title={studio.owner?.email}>{studio.owner?.email || "No owner email"}</p>{studio.phone && <p className="mt-1 text-[10px] text-slate-400">{studio.phone}</p>}</td>
          <td className="px-3 py-4"><p className="max-w-40 text-slate-700">{[studio.city, studio.state].filter(Boolean).join(", ") || "Not provided"}</p><p className="mt-1.5 text-[10px] capitalize text-slate-400">{studio.teaching_mode?.toLowerCase() || "Mode not set"}</p></td>
          <td className="px-3 py-4 text-right font-semibold tabular-nums text-slate-700">{studio.total_teachers.toLocaleString("en-IN")}</td><td className="px-3 py-4 text-right font-semibold tabular-nums text-slate-700">{studio.total_students.toLocaleString("en-IN")}</td>
          <td className="px-3 py-4 text-right"><span className="inline-flex rounded-lg bg-[#EDF5EF] px-2.5 py-1.5 font-bold tabular-nums text-[#28613D]" title={`Current month in ${studio.timezone}`}>{studio.active_students.toLocaleString("en-IN")}</span></td>
          <td className="px-3 py-4 text-right"><p className="font-bold text-[#173F2A]">{studio.estimated_platform_fee === null ? "Quote required" : money(studio.estimated_platform_fee)}</p><p className="mt-1 text-[10px] text-slate-400">{studio.estimated_platform_fee === null ? "Country review" : studio.estimated_platform_fee === 0 ? "Free usage tier" : "Before tax"}</p></td>
          <td className="px-3 py-4"><Status status={studio.status} /><p className={`mt-1.5 text-[10px] ${studio.account_completed ? "text-slate-400" : "text-amber-700"}`}>{studio.account_completed ? "Setup complete" : "Setup incomplete"}</p></td>
          <td className="whitespace-nowrap px-3 py-4 text-[10px] text-slate-500">{dateLabel(studio.created_at)}</td><td className="sticky right-0 border-l border-[#E9EEE9] bg-white px-3 py-4"><button onClick={() => openStudio(studio.id)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#D8E3DA] px-3 py-2 text-[11px] font-semibold text-[#244B34] hover:bg-[#F1F6F2]">View studio<ArrowRight size={12} /></button></td>
        </tr>)}</tbody></table>{loading ? <p role="status" className="p-10 text-center text-sm text-slate-400">Loading studios…</p> : !filtered.length && <p className="p-10 text-center text-sm text-slate-400">No studios match your search.</p>}</div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EDE8] bg-[#FCFDFC] px-4 py-3 text-[11px] text-slate-500"><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} studios</span><div className="flex items-center gap-3"><button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
      </div><p className="text-[10px] leading-relaxed text-slate-400">Scroll the table horizontally to see all columns. Monthly activity uses each studio’s timezone. Up to 20 active students is free; above 20, every active student costs ₹30. Fees shown are current-month estimates in INR.</p>
    </>}
    {detailId && <Modal onClose={() => setDetailId("")} title={details?.name || "Studio details"} subtitle="Studio overview, contact details and account information" maxWidth="max-w-4xl" footer={details && <div className="flex w-full items-center justify-between gap-3">
      <div>{details.website_url ? <a href={details.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#CEDDD2] bg-white px-4 py-2.5 text-xs font-bold text-[#244B34] hover:bg-[#F4F8F4]">Visit Studio website<ExternalLink size={14} /></a> : <><button disabled className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DFE7E1] bg-[#F7F9F7] px-4 py-2.5 text-xs font-bold text-slate-400" title="This studio has no published website available.">Visit Studio website<ExternalLink size={14} /></button><p className="mt-1.5 text-[10px] text-slate-400">Website not published or studio inactive</p></>}</div>
      <button onClick={() => { onViewMore(details.id); setDetailId(""); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#133623] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#204C32]">View more · Billing & activity<ArrowRight size={14} /></button>
    </div>}>
      {details ? <div className="space-y-5 bg-[#F7F9F7] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Status status={details.status} /><span className="text-[11px] text-slate-500">/{details.slug}</span></div><span className="text-[11px] text-slate-500">Registered {dateLabel(details.created_at)}</span></div>
        <div className="grid grid-cols-3 gap-3">{[["Teachers", details.total_teachers], ["Total students", details.total_students], ["Active this month", details.active_students]].map(([name, value]) => <div key={name} className="rounded-2xl border border-[#DFE7E1] bg-white p-4"><p className="text-[11px] font-semibold text-slate-500">{name}</p><p className="mt-2 text-2xl font-bold text-[#163B27]">{Number(value).toLocaleString("en-IN")}</p></div>)}</div>
        <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-slate-500"><Users size={14} className="mt-0.5 shrink-0 text-[#6A8974]" />Active students have a valid subscription and clicked Join this month. Each student counts once · {details.timezone}.</p>
        <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#DFE7E1] bg-white p-5"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B8272]">Studio ownership</p>{details.contacts.length ? details.contacts.map(contact => <div key={contact.email} className="mt-2"><p className="text-sm font-bold text-slate-800">{contact.name}</p><p className="mt-1 break-all text-xs text-slate-500">{contact.email}</p></div>) : <p className="text-xs text-slate-400">No owner contact provided</p>}</div><div className="text-xs text-slate-500"><p className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold ${details.profile.account_completed ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}><ShieldCheck size={14} />{details.profile.account_completed ? "Account setup complete" : "Account setup incomplete"}</p><p className="mt-3 text-right">{details.timezone} · {details.currency}</p></div></section>
        <ProfileSection title="Profile & contact" icon={<Building2 size={16} />} fields={["studio_tagline", "disciplines", "teaching_mode", "phone", "whatsapp_number", "support_email", "support_phone", "brand_color"]} profile={details.profile} />
        <ProfileSection title="Studio address" icon={<MapPin size={16} />} fields={["address_line1", "address_line2", "city", "state", "pincode", "country"]} profile={details.profile} />
        <div className="grid items-start gap-5 md:grid-cols-2"><ProfileSection title="Legal & tax" icon={<ShieldCheck size={16} />} fields={["legal_business_name", "has_gst", "gst_number", "pan_number"]} profile={details.profile} /><ProfileSection title="Bank & settlement" icon={<Landmark size={16} />} fields={["bank_name", "account_holder_name", "account_number", "ifsc_code", "upi_id", "settlement_cycle"]} profile={details.profile} /></div>
        <details className="group rounded-2xl border border-[#DFE7E1] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-bold text-[#173C29]"><span className="flex items-center gap-2.5"><Video size={16} className="text-[#52745E]" />Class access & Zoom preferences</span><ChevronDown size={16} className="transition-transform group-open:rotate-180" /></summary><dl className="grid gap-5 border-t border-[#E9EEE9] p-5 sm:grid-cols-2">{zoomFields.map(field => <div key={field}><dt className="text-[11px] leading-relaxed text-slate-500">{label(field)}</dt><dd className="mt-1.5 text-xs font-semibold text-slate-800">{display(details.profile[field])}</dd></div>)}</dl></details>
      </div> : <p role={error ? "alert" : "status"} className="p-8 text-sm text-slate-500">{error || "Loading studio profile…"}</p>}
    </Modal>}
  </div>;
}
