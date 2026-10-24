"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  ShieldCheck,
  Mail,
  Clock,
  RefreshCw,
  Sliders,
  Eye,
  EyeOff,
  Power,
} from "lucide-react";
import { WhatsAppNotificationHint, WhatsAppIcon } from "@/components/WhatsAppNotificationHint";
import { useCommunicationSettings } from "@/components/CommunicationSettingsProvider";

import { communicationRequest } from "@/lib/communication-api";


export interface ChannelHealth {
  configured: boolean;
  status: string;
  details: string;
  sender_identity: string;
}

export interface ConnectionStatus {
  email: ChannelHealth;
  whatsapp_admin: ChannelHealth;
  whatsapp_classes: ChannelHealth;
}

export interface CommunicationSettings {
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  both_channels_disabled: boolean;
  updated_at: string | null;
  updated_by_user_id: string | null;
  updated_by_email: string | null;
  scope: string;
  connection_status: ConnectionStatus;
}

export interface AuditLogItem {
  id: string;
  channel: string;
  previous_state: boolean;
  new_state: boolean;
  changed_by_email: string | null;
  changed_at: string;
  notes: string | null;
}

export interface HistoryItem {
  id: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  recipient_name: string | null;
  channel: string;
  message_type: string;
  status: string;
  suppression_reason: string | null;
  subject_or_title: string | null;
  body_preview: string | null;
  created_at: string;
  error_details: string | null;
}

export function CommunicationChannelsPanel({
  isEmbedded = false,
  inModal = false,
  onClose,
}: {
  isEmbedded?: boolean;
  inModal?: boolean;
  onClose?: () => void;
}) {
  const {
    whatsappServiceEnabled,
    whatsappCompletelyDisabled,
    emailServiceEnabled,
    toggleWhatsAppService,
    toggleWhatsAppCompletely,
    toggleEmailService,
  } = useCommunicationSettings();

  const [activeTab, setActiveTab] = useState<"toggles" | "test" | "audit" | "history">("toggles");
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Test send states
  const [testChannel, setTestChannel] = useState<"EMAIL" | "WHATSAPP_ADMIN" | "WHATSAPP_CLASSES">("EMAIL");
  const [testRecipient, setTestRecipient] = useState("");
  useEffect(() => {
    try { setTestRecipient(JSON.parse(localStorage.getItem("pr_user") || "null")?.email || ""); } catch { /* Session is unavailable. */ }
  }, []);
  const [testNote, setTestNote] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: string;
    message_id?: string;
    suppression_reason?: string;
    details?: string;
  } | null>(null);

  // Audit logs & history
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await communicationRequest("/settings");
      setSettings(data);
      toggleWhatsAppService(data.whatsapp_enabled);
      toggleEmailService(data.email_enabled);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Could not load communication settings.");
    } finally { setLoading(false); }
  }, [toggleWhatsAppService, toggleEmailService]);

  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    setErrorMsg(null);
    try { setAuditLogs(await communicationRequest("/audit-logs?limit=30")); }
    catch (error) { setErrorMsg(error instanceof Error ? error.message : "Could not load switch history."); }
    finally { setLoadingLogs(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingLogs(true);
    setErrorMsg(null);
    try {
      const data = await communicationRequest("/history?page=1&page_size=25");
      setHistoryItems(data.items || []);
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : "Could not load dispatches."); }
    finally { setLoadingLogs(false); }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (activeTab === "audit") fetchAuditLogs();
    if (activeTab === "history") fetchHistory();
  }, [activeTab, fetchAuditLogs, fetchHistory]);

  const handleToggle = async (channel: "whatsapp" | "email" | "whatsapp_feature", currentVal: boolean) => {
    if (saving) return;
    if (channel === "whatsapp_feature") {
      toggleWhatsAppCompletely(currentVal);
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const data = await communicationRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify(channel === "whatsapp" ? { whatsapp_enabled: !currentVal } : { email_enabled: !currentVal }),
      });
      setSettings(data);
      toggleWhatsAppService(data.whatsapp_enabled);
      toggleEmailService(data.email_enabled);
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : "Could not update channel."); }
    finally { setSaving(false); }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim() || testSending) return;
    setTestSending(true);
    setTestResult(null);
    setErrorMsg(null);
    try {
      setTestResult(await communicationRequest("/test", {
        method: "POST",
        body: JSON.stringify({ channel: testChannel, recipient: testRecipient.trim(), message: testNote.trim() || undefined }),
      }));
    } catch (error) { setErrorMsg(error instanceof Error ? error.message : "Could not send test notification."); }
    finally { setTestSending(false); }
  };

  const bothDisabled = !whatsappServiceEnabled && !emailServiceEnabled;
  const anyDisabled = !whatsappServiceEnabled || !emailServiceEnabled;

  return (
    <div
      className={`flex flex-col overflow-hidden bg-white ${
        inModal ? "" : isEmbedded
          ? "rounded-3xl border border-[#CEDECF] shadow-sm"
          : "rounded-2xl shadow-2xl border border-[#CEDECF] w-full max-w-2xl max-h-[90vh]"
      }`}
    >
      {/* Header */}
      {!inModal && <div className="bg-[#0C2417] text-white p-5 flex items-center justify-between border-b border-[#133623]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#1b4332] text-[#A3C9A8]">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold tracking-tight text-white !text-white">
                Platform Communication Channels
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#1b4332] text-[#A3C9A8] px-2.5 py-0.5 rounded-full border border-[#81A882]/40">
                Applies to all studios
              </span>
            </div>
            <p className="text-xs text-[#CEDECF] mt-0.5">
              Centralized Progress Rooms WhatsApp senders & Brevo transactional email
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            title="Refresh channel status"
            aria-label="Refresh channel status"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-[#133623] transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {!isEmbedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-[#133623] transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>}

      {/* Double-off warning banner */}
      {bothDisabled && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-3 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">⚠️ Warning: All operational delivery services are paused.</span>
            <p className="mt-0.5 text-amber-800">
              Both WhatsApp and Email delivery services are switched off to save cost. Scheduled class reminders and billing notices are suppressed. Login OTPs and verification passcodes remain active.
            </p>
          </div>
        </div>
      )}

      {/* Single channel off warning */}
      {!bothDisabled && anyDisabled && (
        <div className="bg-amber-50/80 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>
            Notice: {!whatsappServiceEnabled ? "WhatsApp" : "Email"} operational service is currently switched off to save cost. Dispatches on that channel will be suppressed.
          </span>
        </div>
      )}

      {/* WhatsApp completely disabled warning */}
      {whatsappCompletelyDisabled && (
        <div className="bg-purple-50 border-b border-purple-200 px-5 py-2.5 flex items-center gap-2.5 text-purple-900 text-xs">
          <EyeOff className="h-3.5 w-3.5 text-purple-700 shrink-0" />
          <span>
            Notice: Entire WhatsApp feature is currently turned off and hidden throughout the application (student, studio, teacher, and registration screens).
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-[#CEDECF] px-5 bg-[#F4F7F4]/60 text-xs font-medium text-[#40514E]">
        <button
          type="button"
          onClick={() => setActiveTab("toggles")}
          className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === "toggles"
              ? "border-[#0C2417] text-[#0C2417] font-bold"
              : "border-transparent hover:text-[#0C2417]"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" />
          Channel Switches
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("test")}
          className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === "test"
              ? "border-[#0C2417] text-[#0C2417] font-bold"
              : "border-transparent hover:text-[#0C2417]"
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          Send Test
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === "audit"
              ? "border-[#0C2417] text-[#0C2417] font-bold"
              : "border-transparent hover:text-[#0C2417]"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Switch History
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition ${
            activeTab === "history"
              ? "border-[#0C2417] text-[#0C2417] font-bold"
              : "border-transparent hover:text-[#0C2417]"
          }`}
        >
          <History className="h-3.5 w-3.5" />
          Dispatches
        </button>
      </div>

      {/* Panel Body Content */}
      <div className={`p-5 space-y-5 text-sm ${inModal ? "" : "overflow-y-auto flex-1"}`}>
        {activeTab === "history" && (
          <p className="text-xs text-[#40514E]" role="note">Dispatches show notification attempts; planned or simulated entries do not confirm delivery.</p>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: Channel Switches */}
        {activeTab === "toggles" && (
          <div className="space-y-5">
            {/* Master Switches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. WhatsApp Service Switch Card */}
              <div
                className={`relative p-4 rounded-xl border transition-all ${
                  whatsappServiceEnabled
                    ? "border-[#81A882] bg-[#E8F0E9]/40 shadow-sm"
                    : "border-amber-300 bg-amber-50/70"
                }`}
              >
                <div className="flex items-center justify-between mb-2 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <WhatsAppIcon className="h-4 w-4" />
                      <Power className={`h-2.5 w-2.5 absolute -bottom-1 -right-1 rounded-full p-0.5 ${
                        whatsappServiceEnabled ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                      }`} />
                    </div>
                    <span className="font-semibold text-gray-900">WhatsApp Service</span>
                    <WhatsAppNotificationHint kind="channels" />
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={whatsappServiceEnabled}
                    aria-label="Toggle WhatsApp Service"
                    disabled={saving}
                    onClick={() => handleToggle("whatsapp", whatsappServiceEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#81A882] focus:ring-offset-2 ${
                      whatsappServiceEnabled ? "bg-[#133623]" : "bg-amber-500"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        whatsappServiceEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn off WhatsApp delivery service to save cost while keeping all WhatsApp features intact on the app.
                </p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <span className="text-gray-500">Service Status</span>
                  <span
                    className={`font-semibold ${
                      whatsappServiceEnabled ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {whatsappServiceEnabled ? "Enabled · Active" : "Paused · Cost Saved"}
                  </span>
                </div>
              </div>

              {/* 2. Email Service Switch Card */}
              <div
                className={`relative p-4 rounded-xl border transition-all ${
                  emailServiceEnabled
                    ? "border-[#81A882] bg-[#E8F0E9]/40 shadow-sm"
                    : "border-amber-300 bg-amber-50/70"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#133623]" />
                    <span className="font-semibold text-gray-900">Email Service</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailServiceEnabled}
                    aria-label="Toggle Email Service"
                    disabled={saving}
                    onClick={() => handleToggle("email", emailServiceEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#81A882] focus:ring-offset-2 ${
                      emailServiceEnabled ? "bg-[#133623]" : "bg-amber-500"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        emailServiceEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn off transactional email service to save cost. Scheduled class reminders and billing emails are suppressed.
                </p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <span className="text-gray-500">Service Status</span>
                  <span
                    className={`font-semibold ${
                      emailServiceEnabled ? "text-emerald-700" : "text-amber-700"
                    }`}
                  >
                    {emailServiceEnabled ? "Enabled · Active" : "Paused · Cost Saved"}
                  </span>
                </div>
              </div>

              {/* 3. WhatsApp Feature (Whole Feature) Switch Card */}
              <div
                className={`relative p-4 rounded-xl border transition-all md:col-span-2 ${
                  !whatsappCompletelyDisabled
                    ? "border-[#81A882] bg-[#E8F0E9]/40 shadow-sm"
                    : "border-purple-300 bg-purple-50/70"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {!whatsappCompletelyDisabled ? (
                      <Eye className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-purple-700" />
                    )}
                    <span className="font-semibold text-gray-900">
                      WhatsApp Feature (Whole Feature Across App)
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!whatsappCompletelyDisabled}
                    aria-label="Toggle WhatsApp Feature Completely"
                    disabled={saving}
                    onClick={() => handleToggle("whatsapp_feature", !whatsappCompletelyDisabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                      !whatsappCompletelyDisabled ? "bg-[#133623]" : "bg-purple-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        !whatsappCompletelyDisabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Turn off WhatsApp completely: disables and hides (without removing) all WhatsApp tooltips, tips asking for a WhatsApp number, and input boxes across registration, account details, students, studios, and teachers everywhere.
                </p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <span className="text-gray-500">Feature Visibility</span>
                  <span
                    className={`font-semibold ${
                      !whatsappCompletelyDisabled ? "text-emerald-700" : "text-purple-700"
                    }`}
                  >
                    {!whatsappCompletelyDisabled ? "Visible Throughout App" : "Completely Hidden Everywhere"}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Health Overview */}
            {settings && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#133623] mb-2.5">
                  Delivery Channel Health
                </h3>
                <div className="space-y-2">
                  {/* Brevo Email Health */}
                  <div className="relative p-3 bg-[#F4F7F4] border border-[#CEDECF] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white border border-[#CEDECF] flex items-center justify-center text-[#133623]">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Brevo Transactional Email</div>
                        <div className="text-gray-500 text-[11px]">
                          {settings.connection_status.email.sender_identity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />
                      {emailServiceEnabled ? settings.connection_status.email.status : "PAUSED"}
                    </div>
                  </div>

                  {/* WhatsApp Admin Health */}
                  <div className="relative p-3 bg-[#F4F7F4] border border-[#CEDECF] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          Progress Rooms Admin WhatsApp <WhatsAppNotificationHint kind="billing" />
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {settings.connection_status.whatsapp_admin.sender_identity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />
                      {whatsappCompletelyDisabled
                        ? "DISABLED"
                        : whatsappServiceEnabled
                        ? settings.connection_status.whatsapp_admin.status
                        : "PAUSED"}
                    </div>
                  </div>

                  {/* WhatsApp Classes Health */}
                  <div className="relative p-3 bg-[#F4F7F4] border border-[#CEDECF] rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          Progress Rooms Classes WhatsApp <WhatsAppNotificationHint kind="reminder" />
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {settings.connection_status.whatsapp_classes.sender_identity}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />
                      {whatsappCompletelyDisabled
                        ? "DISABLED"
                        : whatsappServiceEnabled
                        ? settings.connection_status.whatsapp_classes.status
                        : "PAUSED"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Send Test */}
        {activeTab === "test" && (
          <form onSubmit={handleSendTest} className="relative space-y-4">
            <div className="p-3 bg-[#F4F7F4] rounded-xl border border-[#CEDECF] text-xs text-gray-700 leading-relaxed">
              Dispatches a clearly labelled operational notification test. The test respects channel switches: if the target channel is turned off, the message is suppressed and recorded.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Channel</label>
              <select
                value={testChannel}
                onChange={(e) => {
                  setTestChannel(e.target.value as "EMAIL" | "WHATSAPP_ADMIN" | "WHATSAPP_CLASSES");
                  setTestRecipient(e.target.value === "EMAIL" ? "admin@test.progressrooms.local" : "+91 98765 00000");
                  setTestResult(null);
                }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CEDECF] bg-white focus:outline-none focus:ring-2 focus:ring-[#81A882]"
              >
                <option value="EMAIL">Brevo Transactional Email</option>
                <option value="WHATSAPP_ADMIN">Progress Rooms Admin WhatsApp Sender (Billing)</option>
                <option value="WHATSAPP_CLASSES">Progress Rooms Classes WhatsApp Sender (Reminders)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {testChannel === "EMAIL" ? "Authorized Recipient Email" : "Authorized Recipient WhatsApp Number"}
              </label>
              <input
                type={testChannel === "EMAIL" ? "email" : "text"}
                required
                placeholder={testChannel === "EMAIL" ? "admin@test.progressrooms.local" : "+91 98765 00000"}
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CEDECF] bg-white focus:outline-none focus:ring-2 focus:ring-[#81A882]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Test Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Pre-flight verification before batch schedule"
                value={testNote}
                onChange={(e) => setTestNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CEDECF] bg-white focus:outline-none focus:ring-2 focus:ring-[#81A882]"
              />
            </div>

            <button
              type="submit"
              disabled={testSending}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0C2417] text-white font-medium text-xs hover:bg-[#133623] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Send className={`h-3.5 w-3.5 ${testSending ? "animate-pulse" : ""}`} />
              {testSending ? "Dispatching Test..." : "Dispatch Test Notification"}
            </button>

            {/* Test Dispatch Result Feedback */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-150 ${
                  testResult.status === "SENT"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : testResult.status === "SUPPRESSED"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testResult.status === "SENT" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                  <span>
                    Status: {testResult.status} {testResult.suppression_reason ? `(${testResult.suppression_reason})` : ""}
                  </span>
                </div>
                {testResult.details && <p className="text-[11px] opacity-90">{testResult.details}</p>}
                {testResult.message_id && (
                  <p className="text-[10px] font-mono opacity-75">ID: {testResult.message_id}</p>
                )}
              </div>
            )}
            {testChannel !== "EMAIL" && <WhatsAppNotificationHint kind="test" />}
          </form>
        )}

        {/* TAB 3: Audit Trail */}
        {activeTab === "audit" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Channel Switch Toggle Log</span>
              <button
                type="button"
                onClick={fetchAuditLogs}
                className="text-[#133623] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {loadingLogs ? (
              <div className="text-center py-8 text-xs text-gray-500">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No toggle switch changes recorded yet.</div>
            ) : (
              <div className="divide-y divide-gray-100 border border-[#CEDECF] rounded-xl overflow-hidden bg-white text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        <span>{log.channel}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.new_state ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {log.previous_state ? "ON" : "OFF"} → {log.new_state ? "ON" : "OFF"}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        By: {log.changed_by_email || "Super Admin"}
                      </div>
                      {log.notes && (
                        <div className="text-[11px] text-gray-600 italic mt-0.5">&ldquo;{log.notes}&rdquo;</div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-gray-400 shrink-0">
                      {new Date(log.changed_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: History / Dispatches */}
        {activeTab === "history" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Recent Operational Dispatches</span>
              <button
                type="button"
                onClick={fetchHistory}
                className="text-[#133623] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            {loadingLogs ? (
              <div className="text-center py-8 text-xs text-gray-500">Loading recent dispatches...</div>
            ) : historyItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No operational dispatches recorded yet.</div>
            ) : (
              <div className="divide-y divide-gray-100 border border-[#CEDECF] rounded-xl overflow-hidden bg-white text-xs">
                {historyItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">
                          {item.subject_or_title || item.message_type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "SUPPRESSED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-1">
                        Channel: {item.channel} • To: {item.recipient_email || item.recipient_phone || "Contact"}
                      </div>
                      {item.suppression_reason && (
                        <div className="text-[11px] text-amber-700 font-medium mt-0.5">
                          Reason: {item.suppression_reason}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-gray-400 shrink-0">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!inModal && <div className="bg-[#F4F7F4] p-3 px-5 border-t border-[#CEDECF] flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#133623]" />
          Platform Communication Channel Policy
        </span>
        {!isEmbedded && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="py-1 px-3 rounded-lg border border-[#CEDECF] bg-white text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        )}
      </div>}
    </div>
  );
}
