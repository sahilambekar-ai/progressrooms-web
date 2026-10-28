"use client";
import { PasswordInput } from "@/components/PasswordInput";
import { useEffect, useState } from "react";
import { openMeetingTab } from "@/lib/meeting-window";
import { useZoomRefresh } from "@/lib/zoom-refresh";
import { staffApi } from "@/lib/staff-api";

export function InitialZoomSetup({ org, onConnected }: { org: string; onConnected: (connected: boolean, email: string) => void }) {
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [hostKey, setHostKey] = useState("");
  const [hostKeySaved, setHostKeySaved] = useState(false);
  const [savingHostKey, setSavingHostKey] = useState(false);
  const [hostKeyMessage, setHostKeyMessage] = useState("");
  const [member, setMember] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const refresh = () => {
    if (!org) return;
    void Promise.all([staffApi(`/organizations/${org}/zoom/settings`), staffApi(`/organizations/${org}/zoom/host-key`)]).then(([prefs, keyStatus]) => {
      setHostKeySaved(keyStatus.host_key_configured);
      const owner = prefs.teachers.find((teacher: any) => teacher.is_owner);
      setMember(owner?.id || "");
      const ready = ["ACTIVE", "SIMULATED"].includes(owner?.zoom_connection_status) && prefs.provider_mode === (owner?.zoom_connection?.is_simulated ? "mock" : "live");
      setConnected(ready); setVerifiedEmail(owner?.zoom_verified_email || "");
      onConnected(ready, owner?.zoom_verified_email || "");
      if (owner?.zoom_connection_status === "SIMULATED") setMessage("Development simulation: reconnect with live Zoom before hosting real classes.");
    }).catch(error => { setMessage(error.message); onConnected(false, ""); });
  };
  useEffect(refresh, [org]); // eslint-disable-line react-hooks/exhaustive-deps
  useZoomRefresh(refresh);
  return <div className="space-y-4">
    <h3 className="text-xl font-bold text-[#0C2417]">Initial Zoom account · Required</h3>
    <p className="text-sm text-slate-600">Connect your Zoom account to complete Studio setup. Sign in to Zoom and authorize Progress Rooms; your account details will be filled in automatically.</p>
    <form className="space-y-3" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage("");
      try {
        await openMeetingTab(async () => (await staffApi(`/organizations/${org}/teachers/${member}/zoom/connect`, { method: "POST" })).authorization_url);
      } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
    }}>
      {connected && <p role="status" className="text-sm font-semibold text-emerald-800">Connected: {verifiedEmail}</p>}
      {message && <p role="status" className="text-sm text-amber-800">{message}</p>}
      <button type="submit" disabled={busy || !member} className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Opening Zoom…" : connected ? "Connect a different Zoom account" : "Connect Zoom"}</button>
    </form>
    <form className="space-y-3 border-t border-[#E1E9E2] pt-4" onSubmit={async event => {
      event.preventDefault(); setSavingHostKey(true); setHostKeyMessage("");
      try {
        await staffApi(`/organizations/${org}/zoom/host-key`, { method: "PUT", body: JSON.stringify({ host_key: hostKey }) });
        setHostKeySaved(true); setHostKey(""); setHostKeyMessage("Host key saved securely.");
      } catch (error) { setHostKeyMessage((error as Error).message); }
      finally { setSavingHostKey(false); }
    }}>
      <label className="grid items-center gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <span>Host key for {verifiedEmail || "your Zoom account"} *</span>
        <PasswordInput visibilityLabel="Zoom host key" aria-label="Zoom host key" type="password" autoComplete="off" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} required disabled={!connected} value={hostKey} onChange={event => setHostKey(event.target.value.replace(/\D/g, ""))} placeholder={hostKeySaved ? "Saved · enter a new key to replace" : "6-digit host key"} className="block w-full rounded-lg border border-[#CEDECF] bg-white p-3 disabled:bg-slate-50 disabled:opacity-60" />
      </label>
      <p className="text-xs text-slate-500">{connected ? "Enter the host key from the authenticated Zoom account’s profile. It is stored encrypted and does not replace Zoom authentication." : "Connect your Zoom account above to save its host key."}</p>
      {hostKeyMessage && <p role="status" className="text-xs text-[#133623]">{hostKeyMessage}</p>}
      {hostKeySaved && <p className="text-xs font-semibold text-emerald-800">Host key configured</p>}
      <button type="submit" disabled={!connected || savingHostKey} className="rounded-xl border border-[#CEDECF] px-4 py-2 text-xs font-semibold text-[#133623] disabled:opacity-50">{savingHostKey ? "Saving…" : "Save host key"}</button>
    </form>
  </div>;
}
