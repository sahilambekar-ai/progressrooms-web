"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { staffApi } from "@/lib/staff-api";

type Candidate = { confirmation_id: string; email: string; display_name: string; is_simulated: boolean };
export function ZoomAuthorizationLanding({ requestLink = false }: { requestLink?: boolean }) {
  const [completed, setCompleted] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [returnUrl, setReturnUrl] = useState("");
  const [authorizationState, setAuthorizationState] = useState("");
  useEffect(() => { const params = new URLSearchParams(window.location.search); setAuthorizationState(params.get(requestLink ? "request" : "state") || ""); setSignedIn(Boolean(localStorage.getItem("pr_access_token"))); setReturnUrl(window.location.pathname + window.location.search); setReady(true); }, [requestLink]);
  const run = async (work: () => Promise<void>) => { setBusy(true); setMessage(""); try { await work(); } catch (e) { setMessage((e as Error).message); } finally { setBusy(false); } };
  return <main className="mx-auto my-16 max-w-xl space-y-5 rounded-3xl border bg-white p-8 text-sm">
    <h1 className="font-serif text-2xl font-bold">{requestLink ? "Authorize your Zoom account" : "Confirm your Zoom identity"}</h1>
    <p>Sign into Progress Rooms with the account that started this authorization, then confirm the intended Studio or teacher Zoom identity.</p>
    {message && <p role="status" className="rounded-xl bg-amber-50 p-4">{message}</p>}
    {message && ready && signedIn && !completed && <div className="space-y-3">
      <p>Start again with a fresh link. You will be asked to authorize Zoom again.</p>
      {authorizationState && <button disabled={busy} className="rounded-xl border border-emerald-900 px-4 py-3 text-emerald-900 disabled:opacity-50" onClick={() => run(async () => {
        const result = await staffApi("/integrations/zoom/restart", { method: "POST", body: JSON.stringify({ state: authorizationState, kind: requestLink ? "REQUEST" : "OAUTH" }) });
        window.location.assign(result.authorization_url);
      })}>{busy ? "Creating fresh link…" : "Create new Zoom authorization link"}</button>}
      <p className="text-xs">If this request belongs to another environment, or you are connecting for another teacher, return to your studio and select Connect Zoom to create a fresh request there.</p>
    </div>}
    {ready && !signedIn && !completed && <a href={`/login?next=${encodeURIComponent(returnUrl)}`} className="inline-block rounded-xl bg-emerald-900 px-4 py-3 text-white">Sign into Progress Rooms</a>}
    {ready && signedIn && !completed && !candidate && <a href={`/login?next=${encodeURIComponent(returnUrl)}`} className="block text-xs underline">Use a different Progress Rooms account</a>}
    {ready && signedIn && !completed && !candidate && <button disabled={busy} className="rounded-xl bg-emerald-900 px-4 py-3 text-white" onClick={() => run(async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has("error")) { setMessage("Zoom authorization was declined. Return to your studio and start a new request."); return; }
      if (requestLink) {
        const result = await staffApi("/integrations/zoom/request", { method: "POST", body: JSON.stringify({ request: params.get("request") }) });
        window.location.assign(result.authorization_url);
      } else {
        const result = await staffApi("/integrations/zoom/callback", { method: "POST", body: JSON.stringify({ state: params.get("state"), code: params.get("code") }) });
        window.history.replaceState({}, "", window.location.pathname);
        setCandidate(result);
      }
    })}>{busy ? "Checking authorization…" : requestLink ? "Continue to Zoom authorization" : "Verify authorized account"}</button>}
    {candidate && <div className="space-y-4"><p className="font-semibold">{candidate.display_name || "Authorized Zoom account"}</p><p>{candidate.email}</p>{candidate.is_simulated && <p className="rounded-xl bg-amber-50 p-3">Development simulation. This identity is fabricated and cannot host a real Zoom meeting.</p>}
      <p>Confirm this is the account you want to use for this studio. Replacing an account requires explicit reconciliation of existing meetings.</p>
      <button disabled={busy} className="rounded-xl bg-emerald-900 px-4 py-3 text-white" onClick={() => run(async () => {
        await staffApi("/integrations/zoom/confirm", { method: "POST", body: JSON.stringify({ confirmation_id: candidate.confirmation_id }) });
        localStorage.setItem("pr_zoom_updated", String(Date.now()));
        setCandidate(null);
        setMessage("Zoom account connected. You can close this tab and return to your original studio screen.");
        setCompleted(true);
      })}>{busy ? "Activating…" : "Confirm this account"}</button>
    </div>}
    <Link href="/dashboard" className="block underline">Return to studio</Link>
  </main>;
}
