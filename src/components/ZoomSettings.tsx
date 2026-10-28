"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Modal } from "./Modal";
import { useZoomRefresh } from "@/lib/zoom-refresh";
import { staffApi } from "@/lib/staff-api";
import { useFeedback } from "./FeedbackProvider";
import { TeacherZoomControl } from "./TeacherZoomControl";
import { FeatureHelp } from "./FeatureHelp";
import type { TeacherZoomState } from "@/types";

type Teacher = TeacherZoomState & { id: string; user_id: string; name: string; is_owner: boolean; is_active: boolean };
type Preferences = Record<string, unknown> & { version: number; default_host_member_id: string | null; fallback_enabled: boolean; teachers: Teacher[]; provider_mode: string };
const meetingFields = { auto_meeting_enabled: "Create Zoom meeting links automatically", waiting_room: "Waiting room", host_video: "Host video", join_before_host: "Allow joining before the host", enforce_zoom_login: "Require students to sign in to Zoom" };
const accessFields = { enforce_basic_login: "Require Progress Rooms sign-in", group_allow_self_buy_subscriptions: "Group: allow subscription purchases", group_active_subscription_required: "Group: require an active subscription", group_confirm_checkin_everytime: "Group: confirm check-in", personal_allow_self_buy_subscriptions: "Personal: allow subscription purchases", personal_active_subscription_required: "Personal: require an active subscription", personal_confirm_checkin_everytime: "Personal: confirm check-in", personal_no_show_penalty: "Personal: apply no-show rules" };

const editablePreferences = (prefs: Preferences) => Object.fromEntries([
  "default_host_member_id", "fallback_enabled", ...Object.keys(meetingFields).map(key => "zoom_" + key), ...Object.keys(accessFields).map(key => "zoom_" + key),
].map(key => [key, prefs[key]]));

const fieldHelp: Record<string, string> = {
  auto_meeting_enabled: "When on, Progress Rooms can create a Zoom meeting link when a class needs one. A connected teacher or studio backup account is required. Turning this off stops automatic creation of new links.",
  waiting_room: "Students wait outside the Zoom meeting until the host admits them. Turn this on if you want the teacher to let each student in.",
  host_video: "Ask Zoom to start with the host’s camera on. The host can still change their camera during the class; Zoom account rules may override this choice.",
  join_before_host: "Let students enter before the host arrives, when Zoom permits it. This does not make a student the host, and a waiting room or account policy may still prevent early entry.",
  enforce_zoom_login: "Students must sign in to a Zoom account before entering. This is separate from signing in to Progress Rooms and may make joining harder for students without a Zoom account.",
  enforce_basic_login: "Require students to sign in to Progress Rooms before using the class access page.",
  group_allow_self_buy_subscriptions: "Allow students to buy an eligible subscription themselves when they need access to a group class.",
  group_active_subscription_required: "Only students with an active eligible subscription can access a group class.",
  group_confirm_checkin_everytime: "Ask students to confirm their attendance each time they access a group class.",
  personal_allow_self_buy_subscriptions: "Allow students to buy an eligible subscription themselves when they need access to a one-to-one class.",
  personal_active_subscription_required: "Require an active eligible subscription to access a one-to-one class.",
  personal_confirm_checkin_everytime: "Ask students to confirm their attendance each time they access a one-to-one class.",
  personal_no_show_penalty: "Use the studio’s existing no-show rules when a student misses a one-to-one class. This switch does not set a new penalty amount.",
};

export function ZoomSettings({ org, currentUser, onProfileUpdated, initialTab = "settings", onTabChange, onNavigationGuard }: { org: string; orgSlug?: string; orgName?: string; currentUser?: any; studioProfile?: any; initialTab?: "settings" | "host-key"; onTabChange?: (tab: "settings" | "host-key") => void; onProfileUpdated?: () => void; onNavigationGuard?: (guard: (() => Promise<boolean>) | null) => void }) {
  const [tab, setTab] = useState<"settings" | "host-key">(initialTab);
  const tabId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => setTab(initialTab), [initialTab]);
  const selectTab = (value: "settings" | "host-key") => { if (value === tab) return; if (onTabChange) onTabChange(value); else void requestLeave().then(allowed => { if (allowed) setTab(value); }); };
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [savedPrefs, setSavedPrefs] = useState<Preferences | null>(null);
  const dirty = Boolean(prefs && savedPrefs && JSON.stringify(editablePreferences(prefs)) !== JSON.stringify(editablePreferences(savedPrefs)));
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const leaveResolver = useRef<((allowed: boolean) => void) | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  const requestLeave = () => {
    if (!dirtyRef.current) return Promise.resolve(true);
    if (leaveResolver.current) return Promise.resolve(false);
    return new Promise<boolean>(resolve => { leaveResolver.current = resolve; setSaveError(""); setLeaveOpen(true); });
  };
  const finishLeave = (allowed: boolean) => {
    const resolve = leaveResolver.current;
    leaveResolver.current = null; setLeaveOpen(false); resolve?.(allowed);
  };
  useEffect(() => {
    onNavigationGuard?.(requestLeave);
    return () => { onNavigationGuard?.(null); leaveResolver.current?.(false); };
  }, [onNavigationGuard]); // requestLeave reads current dirty state through its ref.
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const followLink = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank" || link.hasAttribute("download") || link.href === window.location.href) return;
      event.preventDefault(); event.stopPropagation();
      void requestLeave().then(allowed => { if (allowed) { dirtyRef.current = false; window.removeEventListener("beforeunload", beforeUnload); window.location.assign(link.href); } });
    };
    const currentUrl = window.location.href;
    const backOrForward = (event: PopStateEvent) => {
      const destination = window.location.href;
      if (destination === currentUrl) return;
      event.stopImmediatePropagation();
      window.history.pushState(null, "", currentUrl);
      void requestLeave().then(allowed => { if (allowed) { dirtyRef.current = false; window.removeEventListener("beforeunload", beforeUnload); window.location.assign(destination); } });
    };
    window.addEventListener("popstate", backOrForward, true);
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", followLink, true);
    return () => { window.removeEventListener("popstate", backOrForward, true); window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", followLink, true); };
  }, [dirty]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [replacement, setReplacement] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const { notify, confirm } = useFeedback();
  const path = `/organizations/${org}/zoom`;
  useZoomRefresh(() => { void load(); onProfileUpdated?.(); });
  const load = async () => { try { const data = await staffApi(path + "/settings"); setSavedPrefs(data); setPrefs(current => dirtyRef.current && current ? { ...data, ...Object.fromEntries(Object.entries(editablePreferences(current)).filter(([key, value]) => value !== savedPrefs?.[key])) } : data); setMeetings(await staffApi(path + "/meetings")); setError(""); } catch (e) { setError((e as Error).message); } };
  useEffect(() => { if (org) void load(); }, [org]); // eslint-disable-line react-hooks/exhaustive-deps
  const run = async (work: () => Promise<void>) => { setBusy(true); try { await work(); } catch (e) { notify((e as Error).message, "error"); } finally { setBusy(false); } };
  const saveChanges = async () => {
    if (!prefs || busy) return false;
    setBusy(true); setSaveError("");
    try {
      if (savedPrefs && (prefs.default_host_member_id !== savedPrefs.default_host_member_id || prefs.fallback_enabled !== savedPrefs.fallback_enabled)) {
        const impact = savedPrefs.default_host_member_id ? await staffApi(`/organizations/${org}/teachers/${savedPrefs.default_host_member_id}/zoom/impact`) : null;
        if (!await confirm({ title: "Save Zoom host changes?", description: `${impact?.future_class_count || 0} future classes currently use or may use the studio host. Existing meetings keep their saved host and settings.`, confirmLabel: "Save changes" })) return false;
      }
      const body: Record<string, unknown> = { version: prefs.version, default_host_member_id: prefs.default_host_member_id, fallback_enabled: prefs.fallback_enabled, acknowledge_impact: true };
      [...Object.keys(meetingFields), ...Object.keys(accessFields)].forEach(key => { body[key] = prefs["zoom_" + key]; });
      const saved = await staffApi(path + "/settings", { method: "PUT", body: JSON.stringify(body) });
      dirtyRef.current = false; setSavedPrefs(saved); setPrefs(saved); setResults(null);
      onProfileUpdated?.(); notify("Zoom settings saved", "success");
      return true;
    } catch (e) { setSaveError((e as Error).message); notify((e as Error).message, "error"); return false; }
    finally { setBusy(false); }
  };
  if (!prefs) return <div role="status" className="rounded-2xl bg-white p-6">{error || "Loading Zoom settings…"}<button onClick={() => void load()} className="ml-4 underline">Reload</button></div>;
  const fields = (entries: Record<string, string>) => Object.entries(entries).map(([key, label]) => <div key={key} className="flex items-center gap-1"><label className="flex min-h-9 min-w-0 cursor-pointer items-center gap-2 text-sm"><input className="h-4 w-4 shrink-0 accent-emerald-800" type="checkbox" disabled={busy} checked={Boolean(prefs["zoom_" + key])} onChange={event => { setPrefs({ ...prefs, ["zoom_" + key]: event.target.checked }); setResults(null); }} />{label}</label><FeatureHelp label={label}>{fieldHelp[key]}</FeatureHelp></div>);
  return <div className="max-w-5xl space-y-5">
    <div><h1 className="font-serif text-2xl font-bold">Zoom Settings</h1><p className="mt-2 text-sm text-slate-600">Choose class rules in General settings. Connect teachers and choose a backup host in Zoom accounts. Select any “i” information icon for help.</p></div>
    <p role="status" className={`rounded-xl p-4 text-sm ${prefs.provider_mode === "live" ? "bg-emerald-50" : "bg-amber-50 text-amber-900"}`}>{prefs.provider_mode === "mock" ? "Development simulation: no real Zoom calls. All simulated teachers must reconnect when live Zoom is configured." : prefs.provider_mode === "live" ? "Live Zoom authorization is configured. Account and license policies still apply." : "Zoom is awaiting platform configuration. Authenticate the initial Zoom account before completing Studio setup."}</p>
    <div role="tablist" aria-label="Zoom settings sections" className="flex gap-2 rounded-xl bg-slate-100 p-1">
      {(["settings", "host-key"] as const).map((value, index) => <button key={value} ref={element => { tabRefs.current[index] = element; }} type="button" role="tab" id={`${tabId}-${value}`} aria-controls={`${tabId}-${value}-panel`} aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} onClick={() => selectTab(value)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
        selectTab(next === 0 ? "settings" : "host-key"); tabRefs.current[next]?.focus();
      }} className={`flex-1 rounded-lg px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${tab === value ? "bg-white text-emerald-900 shadow-sm" : "text-slate-600 hover:bg-white/60"}`}>{value === "settings" ? "General settings" : "Zoom accounts"}</button>)}
    </div>
    {dirty && <div className="fixed bottom-5 right-5 z-40 rounded-2xl border border-emerald-200 bg-white p-2 shadow-xl sm:bottom-6 sm:right-6"><button type="button" disabled={busy} onClick={() => void saveChanges()} className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button></div>}
    <Modal open={leaveOpen} onClose={() => { if (!busy) finishLeave(false); }} title="Save your Zoom changes?" footer={<div className="flex flex-wrap justify-end gap-3">
      <button type="button" disabled={busy} className="rounded-xl border px-4 py-2 text-sm" onClick={() => finishLeave(false)}>Stay here</button>
      <button type="button" disabled={busy} className="rounded-xl border px-4 py-2 text-sm text-red-700" onClick={() => { if (savedPrefs) setPrefs(savedPrefs); dirtyRef.current = false; setResults(null); finishLeave(true); }}>Discard changes</button>
      <button type="button" disabled={busy} className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={() => void saveChanges().then(saved => { if (saved) finishLeave(true); })}>{busy ? "Saving…" : "Save and continue"}</button>
    </div>}><div className="space-y-3 p-6 text-sm text-slate-600"><p>You have unsaved Zoom settings. Save them before leaving this view, or discard your changes.</p>{saveError && <p role="alert" className="text-red-700">{saveError}</p>}</div></Modal>
    <div id={`${tabId}-settings-panel`} role="tabpanel" aria-labelledby={`${tabId}-settings`} hidden={tab !== "settings"} className="space-y-5">
    <section className="rounded-2xl border bg-white p-6"><div className="mb-3 flex items-center gap-2"><h2 className="font-bold">Default meeting settings</h2><FeatureHelp label="Default meeting settings">These choices apply when Progress Rooms creates a new Zoom meeting. To change meetings that already have a link, save first and use Update existing future meetings below.</FeatureHelp></div>{fields(meetingFields)}<p className="mt-3 text-xs text-slate-500">Recording access is outside this release. Existing recording preferences are retained, and new meetings do not request automatic recording. Zoom account policies can restrict requested settings; class join results report restrictions.</p></section>
    <section className="rounded-2xl border bg-white p-6"><div className="mb-3 flex items-center gap-2"><h2 className="font-bold">Student access rules</h2><FeatureHelp label="Student access rules">These rules control class access in Progress Rooms. Group rules apply to group classes; Personal rules apply to one-to-one classes. Zoom sign-in is a separate setting above.</FeatureHelp></div>{fields(accessFields)}</section>
    <section className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-2"><h2 className="font-bold">Update existing future meetings</h2><FeatureHelp label="Update existing future meetings">Save your settings first. Preview shows which existing meetings can be changed. Apply updates sends the saved meeting settings to Zoom. It keeps their current hosts and join links.</FeatureHelp></div><p className="my-3 text-sm">Preview affected meetings, then apply current settings. Failed updates can be retried. Hosts and join links stay unchanged.</p>
      <button disabled={busy} className="rounded-lg border px-4 py-2 text-sm" onClick={() => run(async () => { setResults(await staffApi(path + "/apply-future-settings", { method: "POST", body: JSON.stringify({ version: prefs.version, apply: false }) })); })}>Preview affected meetings</button><FeatureHelp label="Preview affected meetings">See which upcoming meetings would receive your saved settings. Preview does not change any meeting.</FeatureHelp>
      {results && <><p className="my-3 text-sm">{results.count} meeting(s)</p><ul className="space-y-2 text-xs">{results.results.map((r: any) => <li key={r.id}>{meetings.find(meeting => meeting.id === r.id)?.class_name || "Upcoming meeting"}: {r.status.toLowerCase().replaceAll("_", " ")} {r.message || r.host_email || ""}{r.restricted_settings?.length ? ` · Restricted by Zoom: ${r.restricted_settings.join(", ")}` : ""}</li>)}</ul><button disabled={busy || results.count === 0} className="mt-3 rounded-lg border px-4 py-2 text-sm" onClick={() => run(async () => { if (!await confirm({ title: "Apply settings to future meetings?", description: `${results.count} meeting(s) will be updated using their original host authorization.`, confirmLabel: "Apply updates" })) return; setResults(await staffApi(path + "/apply-future-settings", { method: "POST", body: JSON.stringify({ version: prefs.version, apply: true }) })); })}>Apply / retry updates</button><FeatureHelp label="Apply or retry updates">Apply the saved defaults to the meetings in this preview. If Zoom could not update a meeting, try again after fixing its connection or account restrictions.</FeatureHelp></>}
    </section>
    </div>
    <div id={`${tabId}-host-key-panel`} role="tabpanel" aria-labelledby={`${tabId}-host-key`} hidden={tab !== "host-key"} className="space-y-5">
    <section className="rounded-2xl border bg-white p-6"><div className="mb-3 flex items-center gap-2"><h2 className="font-bold">Teacher Zoom accounts</h2><FeatureHelp label="Teacher Zoom accounts">Open a teacher’s connection to manage their Zoom account. Teachers connect their own accounts. Owners can create a link to send to a teacher so that the teacher can give permission.</FeatureHelp></div><div className="divide-y">{prefs.teachers.map(t => <div key={t.id} className="flex flex-col justify-between gap-2 py-4 sm:flex-row"><div><p className="font-semibold">{t.name}{t.is_owner ? " · Owner / Teacher" : ""}{t.is_default_zoom_host ? " · Default host" : ""}{!t.is_active ? " · Inactive" : ""}</p><p className="text-xs text-slate-500">Account used for classes: {t.effective_zoom_host?.email || "No account available yet"}</p></div>{t.is_active && <TeacherZoomControl org={org} member={t.id} name={t.name} userId={t.user_id} currentUserId={currentUser?.id || currentUser?.user_id} owner initialState={t} onChanged={() => { void load(); onProfileUpdated?.(); }} />}</div>)}</div></section>
    <section className="rounded-2xl border bg-white p-6"><div className="mb-3 flex items-center gap-2"><h2 className="font-bold">Studio host and backup</h2><FeatureHelp label="Studio host and backup">A host is the Zoom account used to create and start a class. Choose a connected teacher as the studio host. The backup option lets other teachers use that account when their own account is not connected.</FeatureHelp></div>
      <label className="block text-sm font-medium">Studio default host<select disabled={busy} value={prefs.default_host_member_id || ""} onChange={event => setPrefs({ ...prefs, default_host_member_id: event.target.value || null })} className="mt-2 block w-full rounded-lg border p-3 font-normal"><option value="">Choose a connected account (no studio backup selected)</option>{prefs.teachers.filter(t => t.is_active && ["ACTIVE", "SIMULATED"].includes(t.zoom_connection_status)).map(t => <option key={t.id} value={t.id}>{t.name} · {t.zoom_verified_email}{t.zoom_connection?.is_simulated ? " (simulation)" : ""}</option>)}</select></label><FeatureHelp label="Studio default host">Choose the connected account to use for studio-hosted classes. Without a default, teachers need their own connected accounts. Changing this choice does not move meetings that already have a Zoom link.</FeatureHelp>
      <div className="mt-3 flex items-center gap-2"><label className="flex flex-1 items-center gap-3 text-sm"><input type="checkbox" disabled={busy} checked={prefs.fallback_enabled} onChange={event => setPrefs({ ...prefs, fallback_enabled: event.target.checked })} />Use the studio host as a backup for unconnected teachers</label><FeatureHelp label="Use the studio host as a backup">When switched on, a teacher without a connected Zoom account can use the studio host. The studio account holder still needs to start the meeting. When switched off, the teacher must connect their own account.</FeatureHelp></div>
      <p className="mt-3 text-xs text-slate-600">The selected account holder must start the meeting. When you change host choices, use the floating Save changes button at the bottom right. Default-host changes do not move existing Zoom meetings. One simultaneous meeting per resolved host is allowed.</p>
    </section>
    <section className="rounded-2xl border bg-white p-6"><div className="mb-3 flex items-center gap-2"><h2 className="font-bold">Existing class hosts</h2><FeatureHelp label="Existing class hosts">Each existing Zoom meeting keeps its original host. Use this section if that host can no longer run the class. A replacement changes the class link; the old account holder must cancel the old meeting in Zoom.</FeatureHelp></div><p className="mb-4 text-sm text-slate-600">If an account was disconnected or replaced, review its upcoming classes here. Replacing a meeting changes its join link; the old account holder must cancel the previous Zoom meeting separately.</p>
      {!meetings.length && <p className="text-sm text-slate-500">No upcoming classes have a saved Zoom meeting yet.</p>}
      <div className="divide-y">{meetings.map(meeting => <div key={meeting.id} className="space-y-3 py-4 text-sm"><p className="font-semibold">{meeting.class_name} · {new Date(meeting.start_at).toLocaleString()}</p><p>{meeting.host_email || "Legacy host"} · {meeting.status.toLowerCase().replaceAll("_", " ")}</p>
        {["CREATING", "UNCERTAIN"].includes(meeting.status) ? <><button disabled={busy} className="rounded-lg border px-3 py-2" onClick={() => run(async () => { await staffApi(`/organizations/${org}/occurrences/${meeting.id}/zoom/reconcile`, { method: "POST", body: "{}" }); await load(); notify("Saved provider meeting recovered", "success"); })}>Check meeting in Zoom</button><FeatureHelp label="Check meeting in Zoom">If Zoom did not confirm whether a meeting was created, this checks again and recovers its details. It helps avoid creating the same meeting twice.</FeatureHelp></> : <div className="flex flex-wrap gap-2"><select aria-label={`Replacement host for ${meeting.class_name}`} className="min-w-0 max-w-full rounded-lg border p-2" value={replacement[meeting.id] || ""} onChange={event => setReplacement({ ...replacement, [meeting.id]: event.target.value })}><option value="">Choose a replacement host</option>{prefs.teachers.filter(t => t.is_active && ["ACTIVE", "SIMULATED"].includes(t.zoom_connection_status)).map(t => <option key={t.id} value={t.id}>{t.name} · {t.zoom_verified_email}</option>)}</select><button disabled={busy || !replacement[meeting.id]} className="rounded-lg border px-3 py-2" onClick={() => run(async () => {
          const endpoint = `/organizations/${org}/occurrences/${meeting.id}/zoom/reconcile`;
          const preview = await staffApi(endpoint, { method: "POST", body: "{}" });
          if (!await confirm({ title: "Replace this meeting host?", description: preview.warning, confirmLabel: "Replace host and change link", destructive: true })) return;
          await staffApi(endpoint, { method: "POST", body: JSON.stringify({ replacement_member_id: replacement[meeting.id], confirm_links_change: true }) }); await load(); notify("Host saved. The replacement meeting will be provisioned when the class is opened.", "success");
        })}>Review host replacement</button><FeatureHelp label="Review host replacement">Choose a connected account, then review the warning before confirming. This changes the join link. The replacement meeting is created when the class is opened; the old host must cancel the old meeting separately.</FeatureHelp></div>}
      </div>)}</div>
    </section>
<section className="rounded-2xl border bg-white p-6"><div className="flex items-center gap-2"><h2 className="font-bold">Unfinished disconnections</h2><FeatureHelp label="Unfinished disconnections">If Zoom was unavailable when you disconnected an account, retry removing the app’s access here. Some accounts may still need the teacher to remove Progress Rooms from Zoom Marketplace.</FeatureHelp></div><p className="mt-2 text-sm text-slate-600">Use this only if an account disconnection could not finish with Zoom.</p>      <button disabled={busy} className="mt-4 block text-sm underline" onClick={() => run(async () => { const response = await staffApi(path + "/retry-revocations", { method: "POST" }); notify(`${response.pending} provider revocation(s) pending. ${response.manual_marketplace_removal_required || 0} require manual removal in Zoom Marketplace.`, "info"); })}>Retry unfinished disconnections</button></section>
    </div>
  </div>;
}
