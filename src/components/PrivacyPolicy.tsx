"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { privacySections, PRIVACY_POLICY_VERSION, type PrivacyAudience } from "@/lib/privacy/policy";

export function PrivacyPolicyContent({ audience, includeBoth = false }: { audience: PrivacyAudience; includeBoth?: boolean }) {
  const sections = privacySections(audience);
  if (includeBoth) sections.splice(1, 0, privacySections(audience === "STUDIO" ? "STUDENT" : "STUDIO")[0]);
  return <div className="space-y-5 text-sm leading-7 text-[#34473a]">
    <p className="text-xs text-[#637466]">Last updated: {PRIVACY_POLICY_VERSION} · {audience === "STUDIO" ? "Studios and their teachers" : "Students"}</p>
    {sections.map(section => <section key={section.title}>
      <h3 className="font-bold text-[#133623]">{section.title}</h3>
      <p className="mt-1">{section.text}</p>
    </section>)}
  </div>;
}

export function PrivacyConsent({ audience, accepted, onChange }: {
  audience: PrivacyAudience; accepted: boolean; onChange: (value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="flex items-start gap-3 rounded-xl border border-[#CEDECF] bg-[#F4F7F4] p-4 text-sm leading-6">
      <input id="registration-privacy-consent" type="checkbox" required checked={accepted}
        onChange={e => onChange(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#133623]" />
      <div>
        <label htmlFor="registration-privacy-consent">I have read the Privacy Policy and consent to the account and service use of my information described in it.{audience === "STUDIO" && " I am authorized to act for this studio and accept its responsibilities for teacher and student information."}</label>{" "}
        <a href={`/privacy?role=${audience}`} aria-haspopup="dialog"
          onClick={e => { e.preventDefault(); setOpen(true); }}
          className="font-semibold text-[#133623] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          Click here to read more
        </a>
      </div>
    </div>
    {open && <Modal title="Progress Rooms Privacy Policy" onClose={() => setOpen(false)}>
      <div className="px-5 py-5"><PrivacyPolicyContent audience={audience} /></div>
    </Modal>}
  </>;
}
