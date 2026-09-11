"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Lock, Sparkles, X } from "lucide-react";
import { Modal } from "./Modal";
import { BrandLogo } from "./BrandLogo";
import { useFeedback } from "./FeedbackProvider";

interface EnrollmentModalProps {
  sessionId: string;
  sessionName: string;
  price: number;
  currency: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollmentModal({
  sessionId,
  sessionName,
  price,
  currency,
  isOpen,
  onClose,
}: EnrollmentModalProps) {
  const [step, setStep] = useState<"EMAIL" | "OTP" | "SUCCESS">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useFeedback();

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    try {
      const res = await fetch(`${apiUrl}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to request OTP");
      const data = await res.json();
      setOtp(data.otp_preview || "");
      setStep("OTP");
    } catch (err) {
      setError("We couldn’t send your verification code. Check your email and connection, then try again.");
      notify("Verification code was not sent. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    try {
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      
      // Store token
      localStorage.setItem("pr_access_token", data.access_token);
      localStorage.setItem("pr_user", JSON.stringify(data.user));

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
      notify("We couldn’t verify your code. Review it and try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Enrollment: ${sessionName}`} onClose={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        <button
          aria-label="Close enrollment"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "EMAIL" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#133623] flex items-center justify-center mx-auto mb-3">
                <BrandLogo size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Enroll in {sessionName}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your email address to log in or register. We will send a secure one-time password.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Class Total</span>
              <span className="font-extrabold text-slate-900">
                {currency === "INR" ? "₹" : "$"}
                {price.toLocaleString()}
              </span>
            </div>

            <div>
              <label htmlFor="components-EnrollmentModal-field-1" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input id="components-EnrollmentModal-field-1"
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#133623] text-sm"
              />
            </div>

            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue with Email"}
            </button>
          </form>
        )}

        {step === "OTP" && (
          <form onSubmit={handleVerifyAndEnroll} className="space-y-4">
            <div className="text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#133623] flex items-center justify-center mx-auto mb-3">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verify Code</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter the 6-digit code sent to <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" aria-label="Six-digit verification code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#133623]"
              />
            </div>

            {error && <p role="alert" className="text-xs text-red-600 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Email"}
            </button>
          </form>
        )}

        {step === "SUCCESS" && (
          <div className="text-center py-4 space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Email Verified</h3>
            <p className="text-xs text-slate-600">
              Your email has been verified. Open your Student Portal to review your enrollment for <span className="font-semibold">{sessionName}</span>. No payment has been taken by this form.
            </p>
            <a
              href="/student"
              className="inline-block w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-md hover:bg-slate-800 transition"
            >
              Go to Student Dashboard
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
}
