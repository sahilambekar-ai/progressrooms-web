"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { staffApi } from "@/lib/staff-api";

type Access = { state: string; warning: boolean; restricted: boolean; enforcement_enabled: boolean; plan_name?: string; plan_slug?: string; paid_through?: string; trial_ends_at?: string; restriction_at?: string };
export function StudioAccessNotice({ orgId, isOwner, onBilling, onRestricted, onPlanLabel }: {
  orgId: string; isOwner: boolean; onBilling: () => void; onRestricted: (restricted: boolean) => void; onPlanLabel: (label: string) => void;
}) {
  const [access, setAccess] = useState<Access | null>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setAccess(null); setOpen(false); onRestricted(false); onPlanLabel("");
    const refresh = async () => {
      try {
        const data: Access = await staffApi(`/organizations/${orgId}/saas-billing/access`);
        if (cancelled) return;
        const status = data.state === "LEGACY" ? "Existing account" : data.state === "RESTRICTED" ? "Expired" :
          ["TRIAL", "TRIAL_ENDING"].includes(data.state) ? "Free trial" : data.state === "GRACE" ? "Trial grace" :
          data.state === "PAID_GRACE" ? "Renewal grace" : ["ACTIVE", "PAID_ENDING"].includes(data.state) ? "Paid" : "Verify account";
        onPlanLabel(`${data.plan_name || "No plan"} · ${status}`);
        setAccess(data); onRestricted(data.restricted && data.enforcement_enabled);
        if (!data.warning) { setOpen(false); return; }
        const token = localStorage.getItem("pr_access_token") || "";
        const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
        const key = `saas-warning:${orgId}:${Array.from(new Uint8Array(hash)).map(n => n.toString(16).padStart(2, "0")).join("")}`;
        if (!cancelled && !sessionStorage.getItem(key)) { setOpen(true); sessionStorage.setItem(key, "shown"); }
      } catch { /* Route authorization remains the authoritative access check. */ }
    };
    void refresh();
    const interval = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh); window.addEventListener("saas-billing-updated", refresh);
    return () => { cancelled = true; window.clearInterval(interval); window.removeEventListener("focus", refresh); window.removeEventListener("saas-billing-updated", refresh); };
  }, [orgId, onRestricted, onPlanLabel]);
  if (!access || (!access.warning && !(access.restricted && access.enforcement_enabled))) return null;
  const date = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "the expiry date";
  const text = access.restricted ? "Your studio subscription has expired. Billing and Settings remain available, and your data is saved." :
    access.state === "PAID_GRACE" ? `Your paid subscription has ended. Renew before ${date(access.restriction_at)} to keep access.` :
    access.state === "PAID_ENDING" ? `Your paid subscription ends on ${date(access.paid_through)}. Renew before ${date(access.restriction_at)} to keep access.` :
    access.state === "GRACE" ? `Your subscription trial has ended. Choose a plan before ${date(access.restriction_at)} to keep access.` :
    `Your subscription trial ends on ${date(access.trial_ends_at)}. Choose a plan before ${date(access.restriction_at)} to keep access.`;
  const action = isOwner ? <button onClick={() => { setOpen(false); onBilling(); }} className="rounded-xl bg-[#133623] px-4 py-2 text-sm font-semibold text-white">View plans</button> : <p className="text-sm font-semibold">Contact your studio owner to renew.</p>;
  return <><div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="max-w-3xl text-sm text-amber-950">{text}</p>{action}</div>
    <Modal open={open} onClose={() => setOpen(false)} title={access.state.startsWith("PAID") ? "Your studio subscription is ending" : "Your studio trial is ending"} footer={<div className="flex items-center gap-3"><button onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 text-sm">Continue for now</button>{action}</div>}><div className="space-y-3 p-6 text-sm"><p>{text}</p><p>Active-student usage is charged separately, including during the subscription trial.</p></div></Modal>
  </>;
}
