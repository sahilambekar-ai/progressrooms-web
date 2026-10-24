"use client";
import { useEffect, useState } from "react";
import { staffApi } from "@/lib/staff-api";

export function InitialZoomSetup({ org, onConnected }: { org: string; onConnected: (connected: boolean, email: string) => void }) {
  const [hostId, setHostId] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [hostKey, setHostKey] = useState("");
  const [hostKeySaved, setHostKeySaved] = useState(false);
  const [savingHostKey, setSavingHostKey] = useState(false);
  const [hostKeyMessage, setHostKeyMessage] = useState("");
  const [member, setMember] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!org) return;
    void Promise.all([staffApi(`/organizations/${org}/zoom/settings`), staffApi(`/organizations/${org}/zoom/host-key`)]).then(([prefs, keyStatus]) => {
      setHostKeySaved(keyStatus.host_key_configured);
      const owner = prefs.teachers.find((teacher: any) => teacher.is_owner);
      setMember(owner?.id || "");
      const ready = ["ACTIVE", "SIMULATED"].includes(owner?.zoom_connection_status) && prefs.provider_mode === (owner?.zoom_connection?.is_simulated ? "mock" : "live");
      setConnected(ready); setHostId(owner?.zoom_connection?.zoom_host_id || ""); setVerifiedEmail(owner?.zoom_verified_email || "");
      onConnected(ready, owner?.zoom_verified_email || "");
      if (owner?.zoom_connection_status === "SIMULATED") setMessage("Development simulation: reconnect with live Zoom before hosting real classes.");
    }).catch(error => { setMessage(error.message); onConnected(false, ""); });
  }, [org]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="space-y-4">
    <h3 className="text-xl font-bold text-[#0C2417]">Initial Zoom account · Required</h3>
    <p className="text-sm text-slate-600">Enter your Zoom Host ID, then authorize the matching Zoom account to connect Progress Rooms and complete Studio setup.</p>
    <form className="space-y-3" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage("");
      try {
        const response = await staffApi(`/organizations/${org}/teachers/${member}/zoom/connect?zoom_host_id=${encodeURIComponent(hostId.trim())}`, { method: "POST" });
        sessionStorage.setItem("pr_zoom_onboarding", org);
        window.location.assign(response.authorization_url);
      } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
    }}>
      <label className="block text-xs font-semibold text-[#133623]">Zoom Host ID<input required type="text" maxLength={255} pattern="[A-Za-z0-9_-]+" value={hostId} onChange={event => setHostId(event.target.value)} className="mt-2 block w-full rounded-xl border border-[#CEDECF] p-3 text-sm" /></label>
      {connected && <p role="status" className="text-sm font-semibold text-emerald-800">Authenticated: {verifiedEmail}</p>}
      {message && <p role="status" className="text-sm text-amber-800">{message}</p>}
      <button type="submit" disabled={busy || !member} className="rounded-xl bg-emerald-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Opening Zoom…" : connected ? "Authenticate a different account" : "Authenticate Zoom account"}</button>
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
        <input aria-label="Zoom host key" type="password" autoComplete="off" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} required disabled={!connected} value={hostKey} onChange={event => setHostKey(event.target.value.replace(/\D/g, ""))} placeholder={hostKeySaved ? "Saved · enter a new key to replace" : "6-digit host key"} className="block w-full rounded-lg border border-[#CEDECF] bg-white p-3 disabled:bg-slate-50 disabled:opacity-60" />
      </label>
      <p className="text-xs text-slate-500">{connected ? "Enter the host key from the authenticated Zoom account’s profile. It is stored encrypted and does not replace Zoom authentication." : "Authenticate your Zoom account above to save its host key."}</p>
      {hostKeyMessage && <p role="status" className="text-xs text-[#133623]">{hostKeyMessage}</p>}
      {hostKeySaved && <p className="text-xs font-semibold text-emerald-800">Host key configured</p>}
      <button type="submit" disabled={!connected || savingHostKey} className="rounded-xl border border-[#CEDECF] px-4 py-2 text-xs font-semibold text-[#133623] disabled:opacity-50">{savingHostKey ? "Saving…" : "Save host key"}</button>
    </form>
  </div>;
}
