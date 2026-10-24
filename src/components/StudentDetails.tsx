"use client";

import { useEffect, useState } from "react";
import { AdvancedOptions } from "@/components/AdvancedOptions";
import { Modal } from "@/components/Modal";
import { staffApi } from "@/lib/staff-api";
import { WhatsAppNotificationHint } from "@/components/WhatsAppNotificationHint";
import { useCommunicationSettings } from "@/components/CommunicationSettingsProvider";

export interface StudentProfile {
  id: string; student_record_id?: string; name: string; email: string;
  phone?: string | null; whatsapp_number?: string | null; location?: string | null;
  address?: string | null; student_notes?: string | null;
  attended: number; total: number; status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRING_SOON"; is_verified?: boolean;
}
interface Pass {
  id: string; name: string; status: string; valid_until: string | null;
  remaining_days: number | null; total_sessions: number | null; sessions_attended: number;
}
const inputClass = "w-full rounded-xl border border-[#CEDECF] p-2.5 text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#133623]";
const validPhone = (value: string) => /^\+?[0-9 ()-]+$/.test(value.trim()) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;

export function StudentDetails({ student, onClose, onSaved }: { student: StudentProfile; onClose: () => void; onSaved: () => void }) {
  const { whatsappCompletelyDisabled } = useCommunicationSettings();
  const [form, setForm] = useState({ full_name: student.name, phone: student.phone || "", whatsapp_number: student.whatsapp_number || "", location: student.location || "", address: student.address || "", student_notes: student.student_notes || "", status: student.status === "EXPIRING_SOON" ? "ACTIVE" : student.status || "ACTIVE" });
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [passError, setPassError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingPass, setCancellingPass] = useState<Pass | null>(null);
  const base = `/students/${student.student_record_id}`;
  async function loadPasses() {
    setPassError("");
    try { setPasses(await staffApi(`${base}/enrollments`)); }
    catch (err) { setPassError(err instanceof Error ? err.message : "Could not load passes"); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (student.student_record_id) void loadPasses(); else setLoading(false); }, [student.student_record_id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function save(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!form.full_name.trim()) { setError("Enter the student’s name."); return; }
    if (whatsappCompletelyDisabled) {
      if (!validPhone(form.phone)) {
        setError("Enter a valid phone number (7–15 digits)."); return;
      }
    } else {
      if (!validPhone(form.phone) || (form.whatsapp_number.trim() && !validPhone(form.whatsapp_number))) {
        setError("Enter a valid phone number (7–15 digits). WhatsApp is optional but must be a valid number if provided."); return;
      }
    }
    setBusy(true);
    try {
      await staffApi(base, { method: "PATCH", body: JSON.stringify({ ...form, full_name: form.full_name.trim(), phone: form.phone.trim(), whatsapp_number: form.whatsapp_number.trim() || null }) });
      onSaved(); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save student details"); }
    finally { setBusy(false); }
  }
  async function changePass(pass: Pass) {
    setBusy(true); setPassError(""); setMessage("");
    try {
      const result = await staffApi(`${base}/enrollments/${pass.id}/${pass.status === "PAUSED" ? "resume" : "pause"}`, { method: "POST" });
      setMessage(result.message); await loadPasses(); onSaved();
    } catch (err) { setPassError(err instanceof Error ? err.message : "Could not update pass"); }
    finally { setBusy(false); }
  }
  async function cancelPass() {
    if (!cancellingPass) return;
    setBusy(true); setPassError(""); setMessage("");
    try {
      const result = await staffApi(`${base}/enrollments/${cancellingPass.id}/cancel`, { method: "POST" });
      setMessage(result.message); setCancellingPass(null); await loadPasses(); onSaved();
    } catch (err) { setPassError(err instanceof Error ? err.message : "Could not cancel pass"); }
    finally { setBusy(false); }
  }
  return <Modal footer={<footer className="flex justify-end gap-2 border-t border-[#E1E9E2] pt-4"><button type="button" disabled={busy} onClick={onClose} className="rounded-xl border border-[#CEDECF] px-4 py-2 text-sm">Cancel</button><button form="student-details-form" disabled={busy || !student.student_record_id} className="rounded-xl bg-[#133623] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button></footer>} title="Edit student details" subtitle="Profile changes update the student’s account. Practice notes belong to your studio." onClose={() => { if (!busy) onClose(); }} confirmDiscard>
    <div className="space-y-5 p-6">
      <form id="student-details-form" onSubmit={save} className="space-y-4">
        <fieldset disabled={busy || !student.student_record_id} className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#1b4332]">Full name *<input className={inputClass} required maxLength={255} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></label>
          <label className="text-xs font-semibold text-[#1b4332]">Phone number *<input className={inputClass} type="tel" autoComplete="tel" required maxLength={50} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="text-xs font-semibold text-[#1b4332]">Student status<select className={inputClass} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as typeof form.status })}><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="SUSPENDED">Suspended</option></select></label>
<AdvancedOptions className="sm:col-span-2" description="WhatsApp, location, address, and practice notes">
<div className="grid gap-4 sm:grid-cols-2">          <div className={`relative ${whatsappCompletelyDisabled ? "hidden" : ""}`}><div className="mb-1 flex items-center gap-2"><label htmlFor="student-whatsapp-number" className="text-xs font-semibold text-[#1b4332]">WhatsApp number (optional)</label><WhatsAppNotificationHint kind="contact" /></div><input id="student-whatsapp-number" aria-label="WhatsApp number (optional)" className={inputClass} type="tel" maxLength={50} value={form.whatsapp_number} onChange={e => setForm({ ...form, whatsapp_number: e.target.value })} /></div>
          <label className="text-xs font-semibold text-[#1b4332]">Location<input className={inputClass} maxLength={255} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></label>

          <label className="text-xs font-semibold text-[#1b4332] sm:col-span-2">Address<textarea className={inputClass} maxLength={1000} rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
          <label className="text-xs font-semibold text-[#1b4332] sm:col-span-2">Student practice notes<textarea className={inputClass} maxLength={5000} rows={3} value={form.student_notes} onChange={e => setForm({ ...form, student_notes: e.target.value })} /></label>
</div>
</AdvancedOptions>
        </fieldset>
        {!student.phone && <p className="text-xs text-amber-700">Phone number missing. Add it before saving this profile.</p>}
        <div className="rounded-xl bg-[#F4F7F4] p-3 text-xs text-[#40514E]"><p>Email: {student.email}</p><p className="mt-1">Email is the login identity; changing it requires a separate account verification flow.</p><p className="mt-2">{student.is_verified ? "Verified" : "Not verified"} · Attendance: {student.attended} / {student.total} classes (calculated)</p></div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!student.student_record_id && <p role="alert" className="text-sm text-red-700">Reload the directory to edit a saved student record.</p>}
      </form>
      <section className="space-y-3 border-t border-[#E1E9E2] pt-4">
        <h4 className="font-semibold text-[#0C2417]">Enrolled passes</h4><p className="text-xs text-slate-500">Pause freezes remaining validity until you resume. No student notification is sent.</p>
        {loading && <p className="flex items-center gap-2 text-sm text-slate-600"><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-[#CEDECF] border-t-[#133623]" />Loading passes…</p>}
        {passError && <p role="alert" className="text-sm text-red-700">{passError}</p>}
        {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
        {!loading && !passError && passes.length === 0 && <p className="text-sm text-slate-500">No enrolled passes.</p>}
        {passes.map(pass => <div key={pass.id} className="rounded-xl border border-[#CEDECF] p-3">
          <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-[#0C2417]">{pass.name}</p><span className="rounded-full bg-[#E8F0E9] px-2 py-1 text-[10px] font-bold">{pass.status}</span></div>
          <p className="mt-2 text-xs text-slate-500">{pass.remaining_days === null ? "No expiry date" : `${pass.remaining_days} days ${pass.status === "PAUSED" ? "preserved" : "remaining"}`}{pass.status !== "PAUSED" && pass.valid_until ? ` · Valid until ${new Date(pass.valid_until).toLocaleDateString()}` : ""}</p>
          <p className="mt-1 text-xs text-slate-500">{pass.sessions_attended} attended{pass.total_sessions !== null ? ` / ${pass.total_sessions} sessions` : ""}</p>
          {(pass.status === "PAUSED" || (pass.status === "ACTIVE" && (pass.remaining_days === null || pass.remaining_days > 0) && (pass.total_sessions === null || pass.sessions_attended < pass.total_sessions))) && <div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => changePass(pass)} className="rounded-lg bg-[#E8F0E9] px-3 py-2 text-xs font-semibold text-[#133623] disabled:opacity-50">{pass.status === "PAUSED" ? "Resume pass" : "Pause pass"}</button><button type="button" disabled={busy} onClick={() => setCancellingPass(pass)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Cancel membership</button></div>}
        </div>)}
      </section>

      {cancellingPass && <div className="discard-prompt" role="alertdialog" aria-modal="true" aria-label="Cancel membership confirmation" onClick={(e) => e.stopPropagation()}><div className="discard-prompt-card" onClick={(e) => e.stopPropagation()}><h4 className="font-serif text-xl font-bold text-[#0C2417]">Cancel this membership?</h4><p className="mt-1.5 text-sm text-slate-600">{cancellingPass.name} will be cancelled. This cannot be resumed; a new membership can be created later. No payment is returned. Contact the teacher or studio directly about exceptional payment issues.</p><div className="mt-5 flex flex-wrap gap-2 justify-end confirmation-actions"><button type="button" className="btn-sage px-3.5 py-1.5 text-xs font-semibold rounded-lg !min-h-0 inline-flex items-center justify-center transition" onClick={() => setCancellingPass(null)} disabled={busy}>Keep membership</button><button type="button" className="rounded-lg bg-red-700 px-3.5 py-1.5 text-xs font-semibold text-white !min-h-0 inline-flex items-center justify-center hover:bg-red-800 transition" onClick={cancelPass} disabled={busy}>{busy ? "Cancelling…" : "Cancel membership"}</button></div></div></div>}
    </div>
  </Modal>;
}
