"use client";
import { useEffect, useState } from "react";
import { staffApi } from "@/lib/staff-api";
import { Modal } from "@/components/Modal";
type Person = { id: string; full_name: string; email: string; phone: string | null; whatsapp_number: string | null; address: string | null; location: string | null; account_status: string; is_verified: boolean; created_at: string; studios: string[] };
export function AdminPeople({ role }: { role: "TEACHER" | "STUDENT" }) {
  const [data, setData] = useState<{items: Person[]; total_items: number; total_pages: number} | null>(null);
  const [search, setSearch] = useState(""); const [page, setPage] = useState(1); const [revision, setRevision] = useState(0);
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [selected, setSelected] = useState<Person | null>(null);
  useEffect(() => { let alive = true; setData(null); setError(""); const timer = setTimeout(() => {
    staffApi(`/admin/people?${new URLSearchParams({role, search, page: String(page)})}`).then(value => { if (alive) setData(value); }).catch(e => { if (alive) setError(e.message); });
  }, 250); return () => { alive = false; clearTimeout(timer); }; }, [role, search, page, revision]);
  async function remove(person: Person) {
    if (!window.confirm(`Delete ${person.full_name}'s account across all studios? Access will be revoked. Historical and billing records are retained.`)) return;
    setBusy(true); setError("");
    try { await staffApi(`/admin/people/${person.id}`, {method: "DELETE"}); setSelected(null); setPage(1); setRevision(v => v+1); } catch(e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="space-y-5"><div><p className="text-xs uppercase tracking-widest text-[#547760]">Platform administration</p><h1 className="mt-2 text-2xl font-serif font-bold">Manage {role === "TEACHER" ? "Teachers" : "Students"}</h1><p className="mt-2 text-sm text-slate-500">All accounts across the database, including accounts without a studio. View profile data and remove account access.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border bg-white"><div className="flex gap-3 p-4"><input aria-label="Search accounts" placeholder="Search name or email…" value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} className="w-full rounded-xl border p-3 text-sm"/><button onClick={() => setRevision(v => v+1)} className="rounded-xl border px-4 text-sm">Refresh</button></div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#F4F7F4] text-xs text-slate-500"><tr>{["Name", "Email / phone", "Studios", "Status", "Actions"].map(t => <th key={t} className="p-4">{t}</th>)}</tr></thead><tbody>{data?.items.map(p => <tr key={p.id} className="border-t"><td className="p-4 font-semibold">{p.full_name}</td><td className="p-4">{p.email}<p className="text-xs text-slate-500">{p.phone || "No phone provided"}</p></td><td className="p-4">{p.studios.join(", ") || "No studio"}</td><td className="p-4">{p.account_status}</td><td className="space-x-3 whitespace-nowrap p-4"><button className="text-emerald-800 underline" onClick={() => setSelected(p)}>View profile</button><button disabled={busy} className="text-red-700 underline disabled:opacity-40" onClick={() => remove(p)}>Delete</button></td></tr>)}</tbody></table></div>
    {!data && !error && <p role="status" className="p-8 text-center">Loading accounts…</p>}{data?.items.length === 0 && <p className="p-8 text-center">No accounts found.</p>}
    <div className="flex items-center justify-between border-t p-4 text-xs"><span>{data?.total_items ?? "—"} accounts</span><div className="space-x-4"><button disabled={page<=1 || !data} onClick={() => setPage(p=>p-1)}>Previous</button><span>{page} / {data?.total_pages ?? "—"}</span><button disabled={!data || page>=data.total_pages} onClick={() => setPage(p=>p+1)}>Next</button></div></div></div>
    {selected && <Modal title={selected.full_name} subtitle="Account profile · attendance excluded" onClose={() => setSelected(null)}><dl className="grid gap-5 p-6 sm:grid-cols-2">{Object.entries(selected).filter(([k])=> k !== "id" && k !== "whatsapp_number").map(([key,value]) => <div key={key}><dt className="text-xs capitalize text-slate-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1 break-words text-sm">{Array.isArray(value) ? value.join(", ") || "Not provided" : typeof value === "boolean" ? value ? "Yes" : "No" : value || "Not provided"}</dd></div>)}</dl></Modal>}
  </div>;
}
