"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, CheckCircle2, AlertCircle, Building2, User } from "lucide-react";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"STUDIO" | "STUDENT">("STUDIO");
  const [studioName, setStudioName] = useState("");

  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

  // Countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in your name and email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          role: role,
          studio_name: role === "STUDIO" ? (studioName.trim() || `${fullName.trim()} Sanctuary`) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed. Please check details.");
      }

      setPreviewOtp(data.otp_preview || null);
      if (data.otp_preview && (email.endsWith(".test") || email.endsWith(".local"))) {
        setOtp(data.otp_preview);
      } else {
        setOtp("");
      }

      setInfoMessage(
        `Registration successful! Please log in with the OTP sent to ${email} to activate and verify your account.`
      );
      setStep("OTP");
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || "Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  };

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
          purpose: "EMAIL_VERIFICATION",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to resend code");
      setPreviewOtp(data.otp_preview || null);
      setInfoMessage(`New activation passcode dispatched to ${email}.`);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || "Could not resend passcode.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
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
          otp: otp.trim(),
          purpose: "EMAIL_VERIFICATION",
          full_name: fullName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired passcode. Please try again.");
      }

      localStorage.setItem("pr_access_token", data.access_token);
      localStorage.setItem("pr_user", JSON.stringify(data.user));

      if (data.user?.email?.startsWith("student") || role === "STUDENT") {
        router.push("/student");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-nature max-w-lg w-full mx-auto my-8 p-8 space-y-6">
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0C2417] to-[#1b4332] text-white flex items-center justify-center mx-auto mb-3 text-xl shadow-md">
          🌿
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#0C2417]">
          {step === "FORM" ? "Register Your Sanctuary" : "Activate & Verify Account"}
        </h1>
        <p className="text-xs text-[#7E7970] mt-1">
          {step === "FORM"
            ? "Create your independent studio account or student membership."
            : "Enter the one-time passcode sent to your email to log in."}
        </p>

        {selectedPlan && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#E8F0E9] border border-[#CEDECF] text-xs font-semibold text-[#1b4332] flex items-center justify-center gap-1.5">
            <span>🌿</span>
            <span>Selected Plan: <strong>{selectedPlan.toUpperCase()}</strong></span>
          </div>
        )}
      </div>

      {infoMessage && (
        <div className="p-3.5 rounded-xl bg-[#E8F0E9] border border-[#81A882]/40 text-xs text-[#133623] flex items-start gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-[#133623] shrink-0 mt-0.5" />
          <span className="leading-relaxed">{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === "FORM" ? (
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("STUDIO")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  role === "STUDIO"
                    ? "border-[#133623] bg-[#E8F0E9] text-[#0C2417] font-bold shadow-sm"
                    : "border-[#CEDECF] bg-white text-[#40514E] hover:bg-[#FAF7F2]"
                }`}
              >
                <Building2 className={`h-4 w-4 ${role === "STUDIO" ? "text-[#133623]" : "text-slate-400"}`} />
                <div>
                  <p className="text-xs font-bold">Studio Sanctuary</p>
                  <p className="text-[10px] text-slate-500">Teacher & Studio Guide</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  role === "STUDENT"
                    ? "border-[#133623] bg-[#E8F0E9] text-[#0C2417] font-bold shadow-sm"
                    : "border-[#CEDECF] bg-white text-[#40514E] hover:bg-[#FAF7F2]"
                }`}
              >
                <User className={`h-4 w-4 ${role === "STUDENT" ? "text-[#133623]" : "text-slate-400"}`} />
                <div>
                  <p className="text-xs font-bold">Student / Yogi</p>
                  <p className="text-[10px] text-slate-500">Practitioner Member</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sahil Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="sahil@yogastudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
            />
          </div>

          {role === "STUDIO" && (
            <div>
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Studio Sanctuary Name
              </label>
              <input
                type="text"
                placeholder="e.g. Prana Flow Movement Sanctuary"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register & Send Activation Code"}
          </button>

          <p className="text-center text-xs text-[#618D63] pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#0C2417] hover:underline">
              Log in here
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep("FORM");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-[#618D63] hover:underline"
              >
                Change Details
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest text-2xl font-mono py-3.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] bg-white shadow-inner"
            />
            {previewOtp && (
              <p className="mt-2.5 text-center text-xs text-[#2f6a45] bg-[#E8F0E9] py-1.5 px-3 rounded-lg font-medium">
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

          <div className="text-center pt-1">
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResendOtp}
              className="text-xs text-[#618D63] hover:text-[#0C2417] disabled:text-slate-400 inline-flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Passcode"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#212121] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-lg w-full mx-auto pt-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-[#1b4332] hover:text-[#0C2417] gap-1.5 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <Link href="/login" className="text-xs font-bold text-[#1b4332] hover:underline">
          Have an account? Login →
        </Link>
      </div>

      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-500">Loading Register Sanctuary...</div>}>
        <RegisterFormContent />
      </Suspense>

      <div className="text-center text-xs text-slate-500 pb-4">
        ProgressRooms Virtual Studio OS • Sanctuary Registration
      </div>
    </div>
  );
}
