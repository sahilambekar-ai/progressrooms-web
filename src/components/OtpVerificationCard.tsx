"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export interface OtpVerificationCardProps {
  email: string;
  previewOtp?: string | null;
  onSuccess: (data: { access_token: string; user: any }) => void;
  onBack?: () => void;
  title?: string;
  subtitle?: string;
  purpose?: string;
}

export function OtpVerificationCard({
  email,
  previewOtp: initialPreviewOtp = null,
  onSuccess,
  onBack,
  title = "Verify Your Account",
  subtitle = "Enter the 6-digit verification code sent to your email to activate and verify your sanctuary account.",
  purpose = "LOGIN_VERIFICATION",
}: OtpVerificationCardProps) {
  const [otp, setOtp] = useState("");
  const [previewOtp, setPreviewOtp] = useState<string | null>(initialPreviewOtp);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(
    `Verification passcode sent to ${email}. Valid for 10 minutes.`
  );

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Pre-fill dev code for .test or .local domains
  useEffect(() => {
    if (initialPreviewOtp) {
      setPreviewOtp(initialPreviewOtp);
      if (email.endsWith(".test") || email.endsWith(".local")) {
        setOtp(initialPreviewOtp);
      }
    }
  }, [initialPreviewOtp, email]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          purpose: purpose,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to resend code.");
      }
      setPreviewOtp(data.otp_preview || null);
      if (data.otp_preview && (email.endsWith(".test") || email.endsWith(".local"))) {
        setOtp(data.otp_preview);
      }
      setInfoMessage(`A fresh passcode has been sent to ${email}.`);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || "Could not resend passcode.");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otp.trim();
    if (!cleanCode) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanCode,
          purpose: purpose,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired passcode. Please try again.");
      }

      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <BrandLogo size={48} variant="tile-dark" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#0C2417]">{title}</h2>
        <p className="text-xs text-[#7E7970] mt-1 max-w-sm mx-auto">{subtitle}</p>
      </div>

      {infoMessage && (
        <div role="status" className="p-3 rounded-xl bg-[#E8F0E9] border border-[#81A882]/40 text-xs text-[#133623] flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#133623] shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
              6-Digit Verification Code
            </label>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs text-[#618D63] hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change Email</span>
              </button>
            )}
          </div>
          <input
            type="text"
            required
            maxLength={6} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" aria-label="Six-digit verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            autoFocus
            className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-[#FAF7F2]"
          />
          {previewOtp && (
            <p className="mt-2 text-center text-xs text-[#2f6a45] bg-[#E8F0E9] py-1.5 px-2 rounded-lg font-medium">
              💡 Test Passcode: <strong className="font-mono">{previewOtp}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Open Dashboard"}
        </button>

        {/* Resend OTP Option */}
        <div className="text-center pt-1">
          <button
            type="button"
            disabled={resendCooldown > 0 || resending}
            onClick={handleResendOtp}
            className="text-xs text-[#618D63] hover:text-[#0C2417] disabled:text-slate-400 inline-flex items-center gap-1.5 transition font-medium"
          >
            <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}
