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
} from "lucide-react";
import { WhatsAppNotificationHint } from "@/components/WhatsAppNotificationHint";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
  onClose,
}: {
  isEmbedded?: boolean;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"toggles" | "test" | "audit" | "history">("toggles");
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Test send states
  const [testChannel, setTestChannel] = useState<"EMAIL" | "WHATSAPP_ADMIN" | "WHATSAPP_CLASSES">("EMAIL");
  const [testRecipient, setTestRecipient] = useState("admin@test.progressrooms.local");
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

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined"
      ? (localStorage.getItem("pr_access_token") || "dev_test_token_usr-superadmin")
      : "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/admin/communication/settings`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else if (res.status === 403) {
        setErrorMsg("Requires Super Admin permissions.");
      } else {
        setErrorMsg(`Failed to load channel settings (${res.status})`);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE}/admin/communication/audit-logs?limit=30`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingLogs(false);
    }
  }, [getAuthHeaders]);

  const fetchHistory = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch(`${API_BASE}/admin/communication/history?page=1&page_size=25`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryItems(data.items || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoadingLogs(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (activeTab === "audit") fetchAuditLogs();
    if (activeTab === "history") fetchHistory();
  }, [activeTab, fetchAuditLogs, fetchHistory]);

  const handleToggle = async (channel: "whatsapp" | "email", currentVal: boolean) => {
    if (!settings) return;
    setSaving(true);
    const nextVal = !currentVal;
    const payload = channel === "whatsapp"
      ? { whatsapp_enabled: nextVal, notes: `Switched via dashboard control to ${nextVal ? "ON" : "OFF"}` }
      : { email_enabled: nextVal, notes: `Switched via dashboard control to ${nextVal ? "ON" : "OFF"}` };

    try {
      const res = await fetch(`${API_BASE}/admin/communication/settings`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      } else {
        const err = await res.json();
        alert(err.detail || "Failed to update channel switch");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating channel switch");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch(`${API_BASE}/admin/communication/test`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          channel: testChannel,
          recipient: testRecipient.trim(),
          message: testNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      if (activeTab === "history") {
        fetchHistory();
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        status: "FAILED",
        details: err instanceof Error ? err.message : "Network failure during test dispatch",
      });
    } finally {
      setTestSending(false);
    }
  };

  const bothDisabled = settings ? (!settings.whatsapp_enabled && !settings.email_enabled) : false;
  const anyDisabled = settings ? (!settings.whatsapp_enabled || !settings.email_enabled) : false;

  return (
    <div className={`flex flex-col overflow-hidden bg-white ${isEmbedded ? "rounded-3xl border border-[#CEDECF] shadow-sm" : "rounded-2xl shadow-2xl border border-[#CEDECF] w-full max-w-2xl max-h-[90vh]"}`}>
      {/* Header */}
      <div className="bg-[#0C2417] text-white p-5 flex items-center justify-between border-b border-[#133623]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#133623] text-[#81A882]">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold tracking-tight">
                Platform Communication Channels
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#133623] text-[#81A882] px-2.5 py-0.5 rounded-full border border-[#81A882]/30">
                Applies to all studios
              </span>
            </div>
            <p className="text-xs text-[#CEDECF]/80 mt-0.5">
              Centralized ProgressRooms WhatsApp senders & Brevo transactional email
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            title="Refresh channel status"
            className="p-1.5 rounded-lg text-[#CEDECF] hover:text-white hover:bg-[#133623] transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          {!isEmbedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#CEDECF] hover:text-white hover:bg-[#133623] transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Double-off warning banner */}
      {bothDisabled && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-3 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">⚠️ Warning: All operational notifications are paused.</span>
            <p className="mt-0.5 text-amber-800">
              Both WhatsApp and Email channels are disabled. Scheduled 2-hour and 15-minute class reminders and billing notices are suppressed. Login OTPs and verification passcodes remain active.
            </p>
          </div>
        </div>
      )}

      {/* Single channel off warning */}
      {!bothDisabled && anyDisabled && (
        <div className="bg-amber-50/80 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>
            Notice: {!settings?.whatsapp_enabled ? "WhatsApp" : "Email"} operational notifications are currently turned off. Dispatches on that channel will be suppressed.
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
      <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="note">
          Delivery setup pending. Class and billing entries currently record planned notifications; WhatsApp tests are simulated. A recorded SENT status is not proof of provider acceptance or delivery.
        </div>
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: Channel Switches */}
        {activeTab === "toggles" && settings && (
          <div className="space-y-5">
            {/* Master Switches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Switch Card */}
              <div
                className={`relative p-4 rounded-xl border transition-all ${
                  settings.whatsapp_enabled
                    ? "border-[#81A882] bg-[#E8F0E9]/40 shadow-sm"
                    : "border-gray-200 bg-gray-50/70 opacity-90"
                }`}
              >
                <div className="flex items-center justify-between mb-2 pr-5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">WhatsApp Operational</span>
                    <WhatsAppNotificationHint kind="channels" />
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.whatsapp_enabled}
                    disabled={saving}
                    onClick={() => handleToggle("whatsapp", settings.whatsapp_enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#81A882] focus:ring-offset-2 ${
                      settings.whatsapp_enabled ? "bg-[#133623]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.whatsapp_enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Enables or suppresses operational sends through both ProgressRooms WhatsApp numbers: Admin (Billing) & Classes (Reminders).
                </p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-semibold ${
                      settings.whatsapp_enabled ? "text-amber-700" : "text-gray-600"
                    }`}
                  >
                    {settings.whatsapp_enabled ? "Enabled · delivery setup pending" : "Suppressed"}
                  </span>
                </div>
              </div>

              {/* Email Switch Card */}
              <div
                className={`relative p-4 rounded-xl border transition-all ${
                  settings.email_enabled
                    ? "border-[#81A882] bg-[#E8F0E9]/40 shadow-sm"
                    : "border-gray-200 bg-gray-50/70 opacity-90"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#133623]" />
                    <span className="font-semibold text-gray-900">Email Operational</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings.email_enabled}
                    disabled={saving}
                    onClick={() => handleToggle("email", settings.email_enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#81A882] focus:ring-offset-2 ${
                      settings.email_enabled ? "bg-[#133623]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.email_enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Enables or suppresses operational class reminders and billing emails via Brevo.
                </p>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <span className="text-gray-500">Auth Mailers</span>
                  <span className="font-medium text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Separately Active
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Health Overview */}
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
                    {settings.connection_status.email.status}
                  </div>
                </div>

                {/* WhatsApp Admin Health */}
                <div className="relative p-3 bg-[#F4F7F4] border border-[#CEDECF] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">ProgressRooms Admin WhatsApp <WhatsAppNotificationHint kind="billing" /></div>
                      <div className="text-gray-500 text-[11px]">
                        {settings.connection_status.whatsapp_admin.sender_identity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" />
                    {settings.connection_status.whatsapp_admin.status}
                  </div>
                </div>

                {/* WhatsApp Classes Health */}
                <div className="relative p-3 bg-[#F4F7F4] border border-[#CEDECF] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-gray-900">ProgressRooms Classes WhatsApp <WhatsAppNotificationHint kind="reminder" /></div>
                      <div className="text-gray-500 text-[11px]">
                        {settings.connection_status.whatsapp_classes.sender_identity}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" />
                    {settings.connection_status.whatsapp_classes.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Footer Note */}
            {settings.updated_at && (
              <div className="text-[11px] text-gray-500 flex items-center justify-between pt-2 border-t border-gray-100">
                <span>Last toggle update:</span>
                <span>
                  {new Date(settings.updated_at).toLocaleString()} by{" "}
                  {settings.updated_by_email || "Super Admin"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Send Test */}
        {activeTab === "test" && (
          <form onSubmit={handleSendTest} className="relative space-y-4">
            <div className="p-3 bg-[#F4F7F4] rounded-xl border border-[#CEDECF] text-xs text-gray-700 leading-relaxed">
              Dispatches a clearly labelled operational notification test. The test respects backend channel switches: if the target channel is turned off, the message is suppressed and recorded.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Channel</label>
              <select
                value={testChannel}
                onChange={(e) => { setTestChannel(e.target.value as "EMAIL" | "WHATSAPP_ADMIN" | "WHATSAPP_CLASSES"); setTestRecipient(""); setTestResult(null); }}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#CEDECF] bg-white focus:outline-none focus:ring-2 focus:ring-[#81A882]"
              >
                <option value="EMAIL">Brevo Transactional Email</option>
                <option value="WHATSAPP_ADMIN">ProgressRooms Admin WhatsApp Sender (Billing)</option>
                <option value="WHATSAPP_CLASSES">ProgressRooms Classes WhatsApp Sender (Reminders)</option>
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
                      <div className="text-[11px] text-gray-500 mt-0.5">{log.notes || "Switch toggled"}</div>
                    </div>
                    <div className="text-right text-[11px] text-gray-400 shrink-0">
                      <div>{log.changed_by_email || "Super Admin"}</div>
                      <div>{new Date(log.changed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
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
              <div className="text-center py-8 text-xs text-gray-500">Loading history...</div>
            ) : historyItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No operational dispatches recorded yet.</div>
            ) : (
              <div className="divide-y divide-gray-100 border border-[#CEDECF] rounded-xl overflow-hidden bg-white text-xs">
                {historyItems.map((item) => (
                  <div key={item.id} className="relative p-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{item.message_type}</span>
                        {item.channel.startsWith("WHATSAPP") && <WhatsAppNotificationHint description={`${item.channel === "WHATSAPP_ADMIN" ? "ProgressRooms Admin" : "ProgressRooms Classes"} · ${item.subject_or_title || item.message_type}. ${item.body_preview || "No message preview recorded."} Recorded status: ${item.status}. ${item.suppression_reason || item.error_details || "Delivery has not been verified with the provider."}`} />}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <div className="mr-5 text-right text-[11px] text-gray-400 shrink-0">
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
      <div className="bg-[#F4F7F4] p-3 px-5 border-t border-[#CEDECF] flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#133623]" />
          Enforced by ProgressRooms Backend API
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
      </div>
    </div>
  );
}

