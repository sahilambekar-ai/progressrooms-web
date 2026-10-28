"use client";
import { useCallback, useEffect, useState } from "react";
import { communicationRequest } from "@/lib/communication-api";

type Log = { id: string; recipient_email?: string; channel: string; message_type: string; status: string; error_details?: string; suppression_reason?: string; created_at: string };
export function CommunicationChannelsPanel(_props: { isEmbedded?: boolean; inModal?: boolean; onClose?: () => void }) {
  const [enabled, setEnabled] = useState(true);
  const [history, setHistory] = useState<Log[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [notice, setNotice] = useState("");
  const refresh = useCallback(async () => {
    try {
      const [settings, logs] = await Promise.all([communicationRequest("/settings"), communicationRequest("/history?page_size=30")]);
      setEnabled(settings.email_enabled);
      setHistory((logs.items || []).filter((log: Log) => log.channel === "EMAIL" || log.channel === "ZOOM_MAIL"));
      setError("");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load email settings."); }
  }, []);
  useEffect(() => { void refresh(); try { setRecipient(JSON.parse(localStorage.getItem("pr_user") || "null")?.email || ""); } catch {} }, [refresh]);
  async function toggle() {
    setBusy(true);
    try { await communicationRequest("/settings", { method: "PATCH", body: JSON.stringify({ email_enabled: !enabled }) }); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update email settings."); }
    finally { setBusy(false); }
  }
  async function test() {
    setBusy(true); setNotice("");
    try { const result = await communicationRequest("/test", { method: "POST", body: JSON.stringify({channel: "EMAIL", recipient}) }); setNotice(result.details || result.status); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not send test."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5 p-5 text-sm">
    <p>Class invitations, 30-minute reminders, cancellations and class changes use the connected host’s Zoom Mail. Login codes, purchases and payment reminders use Progress Rooms email.</p>
    <button type="button" role="switch" aria-checked={enabled} disabled={busy} onClick={() => void toggle()} className="rounded-lg border px-3 py-2 font-semibold">Email notifications: {enabled ? "On" : "Paused"}</button>
    <p className="text-xs text-slate-500">Login codes remain available when operational email is paused. Zoom hosts must reconnect with Zoom Mail permission and have an enabled mailbox.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <section className="space-y-2 border-t pt-4"><h3 className="font-semibold">Test Progress Rooms email</h3><p className="text-xs text-slate-500">This tests the billing and login email provider. To test Zoom Mail, use Send invite on an upcoming class.</p><div className="flex flex-wrap gap-2"><input type="email" aria-label="Test recipient email" value={recipient} onChange={e => setRecipient(e.target.value)} className="rounded-lg border p-2" /><button disabled={busy} type="button" onClick={() => void test()} className="rounded-lg border px-3 py-2">Send test</button></div>{notice && <p role="status">{notice}</p>}</section>
    <section className="space-y-2 border-t pt-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Email activity</h3><button type="button" onClick={() => void refresh()} className="text-xs underline">Refresh</button></div><div className="max-h-80 space-y-2 overflow-auto">{history.length ? history.map(log => <div key={log.id} className="rounded-lg border p-3 text-xs"><p className="font-semibold">{log.message_type} · {log.status}</p><p>{log.recipient_email} · {log.channel === "ZOOM_MAIL" ? "Zoom Mail" : "Progress Rooms email"}</p>{(log.error_details || log.suppression_reason) && <p className="mt-1 text-amber-800">{log.error_details || log.suppression_reason}</p>}</div>) : <p className="text-xs text-slate-500">No email activity yet.</p>}</div></section>
  </div>;
}
