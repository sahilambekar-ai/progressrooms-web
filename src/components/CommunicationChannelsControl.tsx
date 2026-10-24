"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { canManageCommunications, communicationRequest } from "@/lib/communication-api";
import { Radio, Mail, EyeOff, Power } from "lucide-react";
import { WhatsAppIcon } from "./WhatsAppNotificationHint";
import { useCommunicationSettings } from "./CommunicationSettingsProvider";
import { Modal } from "./Modal";
import { PanelLoading } from "./PanelLoading";

const CommunicationChannelsPanel = dynamic(
  () => import("./CommunicationChannelsPanel").then((module) => module.CommunicationChannelsPanel),
  { loading: PanelLoading }
);

export function CommunicationChannelsControl() {
  const {
    whatsappServiceEnabled,
    whatsappCompletelyDisabled,
    emailServiceEnabled,
    toggleWhatsAppService,
    toggleWhatsAppCompletely,
    toggleEmailService,
  } = useCommunicationSettings();

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => {
      const allowed = canManageCommunications();
      setAuthorized(allowed);
      if (!allowed) setIsPanelOpen(false);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, [pathname]);

  useEffect(() => {
    if (!authorized) return;
    let active = true;
    communicationRequest("/settings").then((data) => {
      if (!active) return;
      toggleWhatsAppService(data.whatsapp_enabled);
      toggleEmailService(data.email_enabled);
    }).catch((error) => {
      if (active) setError(error instanceof Error ? error.message : "Could not load channels.");
    });
    return () => { active = false; };
  }, [authorized, toggleWhatsAppService, toggleEmailService]);

  const saveChannel = async (channel: "whatsapp" | "email") => {
    if (saving) return;
    if (!authorized) { setIsPanelOpen(true); return; }
    setSaving(true);
    setError(null);
    try {
      const data = await communicationRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify(channel === "whatsapp" ? { whatsapp_enabled: !whatsappServiceEnabled } : { email_enabled: !emailServiceEnabled }),
      });
      toggleWhatsAppService(data.whatsapp_enabled);
      toggleEmailService(data.email_enabled);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not update channel."); }
    finally { setSaving(false); }
  };


  return (
    <>
      {/* Floating Buttons Cluster on Bottom-Left (beside Developer Mode) */}
      <div
        data-developer-mode
        className="flex items-center gap-2"
        role="group"
        aria-label="Communication channel and feature quick toggles"
      >
        {/* 1. Platform Communication Channels Modal Trigger */}
        <button
          type="button"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          aria-label="Platform Communication Channels Overview"
          title="Platform Communication Channels Overview (Applies to all studios)"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#CEDECF] bg-white text-[#133623] shadow-md hover:bg-[#E8F0E9] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81A882] focus-visible:ring-offset-2 relative"
        >
          <Radio className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* 2. WhatsApp Service Toggle Button */}
        <button
          type="button"
          disabled={saving}
          onClick={() => saveChannel("whatsapp")}
          aria-label={
            whatsappServiceEnabled
              ? "WhatsApp Service is ON. Click to turn off service to save cost."
              : "WhatsApp Service is OFF (Cost saved). Click to turn on service."
          }
          aria-pressed={whatsappServiceEnabled}
          title={
            whatsappServiceEnabled
              ? "WhatsApp Service: ON (Active) — Click to turn off service to save cost (features stay intact)"
              : "WhatsApp Service: OFF (Cost Saved) — Dispatches suppressed; features intact on app. Click to switch on"
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81A882] focus-visible:ring-offset-2 relative ${
            whatsappServiceEnabled
              ? "border-[#CEDECF] bg-white text-emerald-700 hover:bg-[#E8F0E9]"
              : "border-amber-500 bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <WhatsAppIcon className="h-4 w-4" />
            <Power className={`h-2.5 w-2.5 absolute -bottom-1 -right-1 rounded-full p-0.5 ${
              whatsappServiceEnabled ? "bg-emerald-600 text-white" : "bg-white text-amber-700"
            }`} />
          </div>

          {/* Status Indicator Dot */}
          <span
            className={`absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
              whatsappServiceEnabled ? "bg-emerald-500" : "bg-amber-200"
            }`}
            aria-hidden="true"
          />
        </button>

        {/* 3. Email Service Toggle Button */}
        <button
          type="button"
          disabled={saving}
          onClick={() => saveChannel("email")}
          aria-label={
            emailServiceEnabled
              ? "Email Service is ON. Click to turn off service to save cost."
              : "Email Service is OFF (Cost saved). Click to turn on service."
          }
          aria-pressed={emailServiceEnabled}
          title={
            emailServiceEnabled
              ? "Email Service: ON (Active) — Click to turn off service to save cost"
              : "Email Service: OFF (Cost Saved) — Dispatches suppressed. Click to switch on"
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#81A882] focus-visible:ring-offset-2 relative ${
            emailServiceEnabled
              ? "border-[#CEDECF] bg-white text-[#133623] hover:bg-[#E8F0E9]"
              : "border-amber-500 bg-amber-500 text-white hover:bg-amber-600"
          }`}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />

          {/* Status Indicator Dot */}
          <span
            className={`absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
              emailServiceEnabled ? "bg-emerald-500" : "bg-amber-200"
            }`}
            aria-hidden="true"
          />
        </button>

        {/* 4. WhatsApp Feature (Whole Feature) Toggle Button */}
        <button
          type="button"
          onClick={() => authorized ? toggleWhatsAppCompletely() : setIsPanelOpen(true)}
          aria-label={
            whatsappCompletelyDisabled
              ? "WhatsApp Feature is completely OFF. Click to restore WhatsApp throughout the app."
              : "WhatsApp Feature is ON. Click to turn off WhatsApp completely."
          }
          aria-pressed={!whatsappCompletelyDisabled}
          title={
            whatsappCompletelyDisabled
              ? "WhatsApp Feature (Whole): OFF (Completely Hidden) — All tooltips, tips & input boxes hidden everywhere. Click to restore"
              : "WhatsApp Feature (Whole): ON — Click to turn off completely (hides all WhatsApp tooltips, tips & input boxes)"
          }
          className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 relative ${
            whatsappCompletelyDisabled
              ? "border-purple-700 bg-purple-700 text-white hover:bg-purple-800"
              : "border-[#CEDECF] bg-white text-emerald-800 hover:bg-[#E8F0E9]"
          }`}
        >
          {whatsappCompletelyDisabled ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
          )}

          {/* Status Indicator Dot */}
          <span
            className={`absolute top-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
              whatsappCompletelyDisabled ? "bg-purple-300" : "bg-emerald-500"
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {error && <div data-developer-mode role="alert" className="fixed bottom-16 left-16 z-[70] max-w-sm rounded-xl border border-red-200 bg-white p-3 text-xs text-red-700">{error}</div>}
      {/* Interactive Modal Drawer */}
      {isPanelOpen && createPortal(<Modal title="Platform Communication Channels" subtitle="Applies to all studios" maxWidth="max-w-2xl" onClose={() => setIsPanelOpen(false)}>
        <div data-developer-mode><CommunicationChannelsPanel isEmbedded inModal onClose={() => setIsPanelOpen(false)} /></div>
      </Modal>, document.body)}

    </>
  );
}
