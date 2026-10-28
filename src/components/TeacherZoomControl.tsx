"use client";
import { PasswordInput } from "@/components/PasswordInput";
import { useEffect, useState } from "react";
import { openMeetingTab } from "@/lib/meeting-window";
import { useZoomRefresh } from "@/lib/zoom-refresh";
import { FeatureHelp } from "./FeatureHelp";
import { Modal } from "./Modal";
import { staffApi } from "@/lib/staff-api";
import { useFeedback } from "./FeedbackProvider";
import type { TeacherZoomState } from "@/types";

export function zoomLabel(state?: Partial<TeacherZoomState>) {
  switch (state?.zoom_connection_status) {
    case "ACTIVE": return `Connected · ${state.zoom_verified_email || "Verified account"}`;
    case "SIMULATED": return "Development simulation";
    case "RECONNECT_REQUIRED": return "Reconnect required";
    case "PENDING": return "Awaiting authorization";
    default: return state?.effective_zoom_host ? "Not connected · Uses studio host" : "Not connected · Setup needed for Zoom classes";
  }
}

export function TeacherZoomControl({ org, member, name, userId, currentUserId, owner = false, initialState, onChanged }: {
  org: string; member: string; name: string; userId: string; currentUserId?: string; owner?: boolean;
  initialState?: Partial<TeacherZoomState>; onChanged?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [zoomHostId, setZoomHostId] = useState("");
  const [studioPassword, setStudioPassword] = useState("");
  const [state, setState] = useState<Partial<TeacherZoomState> | undefined>(initialState);
  const [busy, setBusy] = useState(false);
  const [requestLink, setRequestLink] = useState("");
  const { notify, confirm } = useFeedback();
  const path = `/organizations/${org}/teachers/${member}/zoom`;
  useEffect(() => setState(initialState), [initialState]);
  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try { await work(); } catch (e) { notify((e as Error).message, "error"); } finally { setBusy(false); }
  };
  const reload = async () => { setState(await staffApi(path)); onChanged?.(); };
  useZoomRefresh(() => { void reload().catch(() => {}); });
  const fallback = Boolean(state?.effective_zoom_host && state.effective_zoom_host.member_id !== member);
  const help = fallback ? (state?.fallback_host_is_owner ? "Classes use the studio owner’s connected Zoom account. The account holder must start the meeting." : "Classes use the studio’s connected fallback Zoom account. The account holder must start the meeting.") : state?.zoom_connection_status === "ACTIVE" ? "Classes use this teacher’s connected Zoom account. The account holder must start the meeting." : "This teacher needs to connect Zoom before hosting Zoom classes. Studio fallback is unavailable.";
  const connect = () => run(async () => {
    if (state?.zoom_connection) {
      const preview = await staffApi(path + "/impact");
      if (!await confirm({ title: "Reconnect or replace this account?", description: `${preview.future_class_count} future classes may need attention. Existing meetings retain their original account and links. Review the Zoom identity on the confirmation screen before activating it.`, confirmLabel: "Continue to authorization" })) return;
    }
    await openMeetingTab(async () => (await staffApi(path + "/connect", { method: "POST" })).authorization_url);
  });
  return <>
    <span className="inline-flex items-center gap-1"><button type="button" className={`text-left text-xs font-semibold underline decoration-dotted underline-offset-4 ${state?.zoom_connection_status === "ACTIVE" ? "text-emerald-800" : "text-orange-700"}`} onClick={(event) => {
      event.stopPropagation(); setOpen(true); void run(async () => { setState(await staffApi(path)); });
    }}>{zoomLabel(state)}</button><FeatureHelp label={`Zoom account for ${name}`}>{help}</FeatureHelp></span>
    {open && <Modal title={`Zoom · ${name}`} subtitle="Connect an account and see who starts the class" onClose={() => { setOpen(false); onChanged?.(); }}>
      <div className="space-y-4 p-6 text-sm" onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-2"><p className="font-semibold">{zoomLabel(state)}</p><FeatureHelp label="Connection status">Connected means Progress Rooms can use this teacher’s Zoom account. Reconnect means the teacher needs to give permission again. Awaiting authorization means the teacher still needs to finish setup. A development simulation does not connect to real Zoom.</FeatureHelp></div>
        {state?.zoom_connection?.zoom_host_id && <p>Zoom Host ID: {state.zoom_connection.zoom_host_id}</p>}
        {state?.zoom_connection?.email && <p>Connected Zoom account: {state.zoom_connection.email}</p>}
        {state?.effective_zoom_host && <p className="text-xs text-slate-600">{state.effective_zoom_host.zoom_mail_authorized ? "Email invitations: permission granted. The Zoom mailbox must also be enabled." : "Email invitations: reconnect the class host’s Zoom account to enable Zoom Mail."}</p>}
        {state?.is_default_zoom_host && <p className="font-semibold text-emerald-800">Studio default host</p>}
        <div className="flex items-center gap-2"><p>Account used for classes: {state?.effective_zoom_host?.email || "No account available yet"}</p><FeatureHelp label="Account used for classes">{help}</FeatureHelp></div>
        <p>{state?.start_responsibility || "Connect your account or ask the owner to enable studio host fallback."}</p>
        {state?.zoom_connection?.is_simulated && <p role="status" className="rounded-xl bg-amber-50 p-3 text-amber-900">Development simulation. No real Zoom account or meeting is connected. Authorize again after live configuration.</p>}
        <p className="text-xs text-slate-600">Studio fallback requires that account holder to start the meeting and manage teaching permissions. Joining before the host does not grant host permission.</p>
        {owner && <form className="space-y-3 rounded-xl border p-4" onSubmit={event => {
          event.preventDefault(); void run(async () => {
            const password = studioPassword; setStudioPassword("");
            await openMeetingTab(async () => (await staffApi(path + "/studio-connect", { method: "POST", body: JSON.stringify({ studio_password: password, zoom_host_id: zoomHostId.trim() || null }) })).authorization_url);
          });
        }}>
          <p className="font-semibold">Optional teacher Zoom setup</p>
          <label className="block">Zoom Host ID<input type="text" maxLength={255} pattern="[A-Za-z0-9_-]+" value={zoomHostId} onChange={event => setZoomHostId(event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
          <label className="block">Confirm Studio password<PasswordInput required type="password" autoComplete="current-password" value={studioPassword} onChange={event => setStudioPassword(event.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
          <p className="text-xs">Enter the teacher’s Zoom Host ID, then authorize the matching Zoom account to connect it with Progress Rooms. You can skip Zoom setup.</p>
          <button disabled={busy} type="submit" className="rounded-xl bg-emerald-900 px-4 py-2 text-white">Authenticate Zoom here</button>
        </form>}
        <div className="flex flex-wrap gap-3">
          {userId === currentUserId && <div className="flex items-center gap-1"><button disabled={busy} className="rounded-xl bg-emerald-900 px-4 py-2 text-white" onClick={connect}>{state?.zoom_connection ? "Reconnect / Replace my Zoom" : "Connect my Zoom"}</button><FeatureHelp label="Connect or replace my Zoom">Sign in to Zoom yourself and allow Progress Rooms to manage your class meetings. Check the account email before confirming. Replacing an account keeps existing meetings with their original host until you explicitly replace those meetings.</FeatureHelp></div>}
          {owner && <div className="flex items-center gap-1"><button disabled={busy} className="rounded-xl border px-4 py-2" onClick={() => run(async () => {
            const data = await staffApi(path + "/authorization-request", { method: "POST" });
            setRequestLink(data.request_url); setState(await staffApi(path));
          })}>Create teacher connection link</button><FeatureHelp label="Create teacher connection link">Create a link and send it to this teacher yourself. The teacher must sign in to their own Progress Rooms account, then approve their Zoom account. The link expires in 15 minutes. No message is sent automatically.</FeatureHelp></div>}
          {owner && state?.zoom_connection && ["ACTIVE", "SIMULATED"].includes(state.zoom_connection_status || "") && <div className="flex items-center gap-1"><button disabled={busy} className="rounded-xl border px-4 py-2" onClick={() => run(async () => {
            const prefs = await staffApi(`/organizations/${org}/zoom/settings`);
            const impact = prefs.default_host_member_id ? await staffApi(`/organizations/${org}/teachers/${prefs.default_host_member_id}/zoom/impact`) : null;
            if (!await confirm({ title: "Change the studio default host?", description: `${impact?.future_class_count || 0} future classes may be affected. Existing provisioned meetings retain their saved host.`, confirmLabel: "Set default host" })) return;
            const body: Record<string, unknown> = { version: prefs.version, default_host_member_id: member, fallback_enabled: prefs.fallback_enabled, acknowledge_impact: true };
            Object.entries(prefs).forEach(([key, value]) => { if (key.startsWith("zoom_") && typeof value === "boolean") body[key.slice(5)] = value; });
            delete body.connected;
            await staffApi(`/organizations/${org}/zoom/settings`, { method: "PUT", body: JSON.stringify(body) }); await reload(); notify("Default host updated. Existing meetings retain their saved host.", "success");
          })}>Set as studio host</button><FeatureHelp label="Set as studio host">Use this connected account as the studio default for new meetings. Backup must also be enabled for unconnected teachers to use it. This saves immediately and does not move existing meetings.</FeatureHelp></div>}
          {state?.zoom_connection && <div className="flex items-center gap-1"><button disabled={busy} className="rounded-xl border border-red-200 px-4 py-2 text-red-800" onClick={() => run(async () => {
            const preview = await staffApi(path + "/impact");
            if (!await confirm({ title: "Disconnect this Zoom identity?", description: `${preview.future_class_count} future classes may be affected. ${preview.message} Provider revocation will be retried if Zoom is unavailable.`, confirmLabel: "Disconnect and acknowledge impact", destructive: true })) return;
            await staffApi(path + "?acknowledge_impact=true", { method: "DELETE" }); await reload(); notify("Connection removed; class history retained", "success");
          })}>Disconnect</button><FeatureHelp label="Disconnect Zoom">Stop using this account in Progress Rooms. Review affected classes before confirming. This does not cancel meetings already created in Zoom; those may need attention from the original account holder.</FeatureHelp></div>}
        </div>
        {requestLink && <div className="block text-sm"><label htmlFor={`zoom-request-${member}`}>Expires in 15 minutes. The intended teacher must sign into Progress Rooms.</label>
          <input id={`zoom-request-${member}`} readOnly value={requestLink} className="my-2 w-full rounded-lg border p-2" onFocus={event => event.target.select()} />
          <button disabled={busy} type="button" onClick={() => run(async () => { await navigator.clipboard.writeText(requestLink); notify("Authorization link copied", "success"); })} className="rounded-lg border px-3 py-2">Copy connection link</button><FeatureHelp label="Copy connection link">Copy the link, then paste it into a message to this teacher. Only the intended teacher can use it after signing in to Progress Rooms.</FeatureHelp>
        </div>}
      </div>
    </Modal>}
  </>;
}
