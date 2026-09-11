"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
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

  // Quick Test User One-Click Login (Super Admin, Studio/Instructor, Student)
  const handleQuickTestLogin = (userRole: "SUPER_ADMIN" | "INSTRUCTOR" | "STUDENT") => {
    let mockUser: any;
    let targetUrl = "/dashboard";

    if (userRole === "SUPER_ADMIN") {
      mockUser = {
        id: "usr-superadmin",
        email: "admin@test.progressrooms.local",
        full_name: "Platform Super Admin",
        is_superadmin: true,
        role: "SUPER_ADMIN",
        organization_name: "ProgressRooms Platform",
        organization_slug: "platform"
      };
      targetUrl = "/dashboard";
    } else if (userRole === "INSTRUCTOR") {
      mockUser = {
        id: "usr-instructor",
        email: "owner@yogastudio.test",
        full_name: "Lead Teacher (Studio Guide)",
        role: "INSTRUCTOR",
        organization_name: "Tranquil Flow Sanctuary",
        organization_slug: "tranquil-flow"
      };
      targetUrl = "/dashboard";
    } else {
      mockUser = {
        id: "usr-student-01",
        email: "student1@test.progressrooms.local",
        full_name: "Aarav Patel (Practitioner)",
        role: "STUDENT"
      };
      targetUrl = "/student";
    }

    localStorage.setItem("pr_access_token", "dev_test_token_" + mockUser.id);
    localStorage.setItem("pr_user", JSON.stringify(mockUser));
    router.push(targetUrl);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch(`${API_BASE}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: "LOGIN_VERIFICATION" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Unable to send verification code. Please try again.");
      }

      setPreviewOtp(data.otp_preview || null);
      if (data.otp_preview && (email.endsWith(".test") || email.endsWith(".local"))) {
        setOtp(data.otp_preview);
      } else {
        setOtp("");
      }

      if (data.requires_activation || data.is_verified === false) {
        setInfoMessage(data.message || `⚠️ Account Not Verified: Please enter the 6-digit OTP sent to ${email} to activate and verify your account.`);
      } else {
        setInfoMessage(`Verification passcode sent to ${email}. Valid for 10 minutes.`);
      }

      setStep("OTP");
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message || "Failed to dispatch verification email. Please try again.");
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
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: "LOGIN_VERIFICATION" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to resend code");
      setPreviewOtp(data.otp_preview || null);
      setInfoMessage(`New passcode dispatched to ${email}.`);
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
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim(), purpose: "LOGIN_VERIFICATION" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid or expired passcode. Please try again.");
      }

      localStorage.setItem("pr_access_token", data.access_token);
      localStorage.setItem("pr_user", JSON.stringify(data.user));

      if (data.user?.email?.startsWith("student") || data.user?.role === "STUDENT") {
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
    <div className="card-nature max-w-md w-full mx-auto my-8 p-8 space-y-6">
      <div className="text-center">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0C2417] to-[#1b4332] text-white flex items-center justify-center mx-auto mb-3 text-xl shadow-md">
          🌿
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Sign In to ProgressRooms</h1>
        <p className="text-xs text-[#7E7970] mt-1">
          Access your teacher sanctuary, admin operations, or student portal.
        </p>

        {selectedPlan && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#E8F0E9] border border-[#CEDECF] text-xs font-semibold text-[#1b4332] flex items-center justify-center gap-1.5">
            <span>🌿</span>
            <span>Signing up with <strong>{selectedPlan.toUpperCase()}</strong> plan</span>
          </div>
        )}
      </div>

      {infoMessage && (
        <div className="p-3 rounded-xl bg-[#E8F0E9] border border-[#81A882]/40 text-xs text-[#133623] flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#133623] shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === "EMAIL" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
              Work or Student Email
            </label>
            <input
              type="text"
              required
              placeholder="teacher@yogastudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send One-Time Passcode"}
          </button>

          <p className="text-center text-xs text-[#618D63] pt-2">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-bold text-[#0C2417] hover:underline">
              Register your sanctuary
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                6-Digit Passcode
              </label>
              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setError(null);
                  setInfoMessage(null);
                }}
                className="text-xs text-[#618D63] hover:underline"
              >
                Change Email
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full text-center tracking-widest text-2xl font-mono py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332]"
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

          <div className="text-center pt-1">
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResendOtp}
              className="text-xs text-[#618D63] hover:text-[#0C2417] disabled:text-slate-400 inline-flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
              {resendCooldown > 0 ? `Resend Passcode in ${resendCooldown}s` : "Resend Passcode"}
            </button>
          </div>
        </form>
      )}

      {/* Development One-Click Quick Login Section */}
      <div className="pt-5 border-t border-[#E1E9E2] space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#618D63]">
          <span>🧪</span>
          <span>One-Click Test User Login (Development)</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* 1. Super Admin Login */}
          <button
            type="button"
            onClick={() => handleQuickTestLogin("SUPER_ADMIN")}
            className="w-full p-3 rounded-xl border border-[#0C2417]/20 hover:border-[#0C2417] bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#0C2417]">Super Admin Login</p>
              <p className="text-[10px] text-slate-500">Platform Product Owner • admin@test.progressrooms.local</p>
            </div>
            <span className="text-[11px] bg-[#0C2417] text-white px-2.5 py-1 rounded-lg font-semibold">Platform Owner →</span>
          </button>

          {/* 2. Studio / Instructor Login (Acts as Teacher) */}
          <button
            type="button"
            onClick={() => handleQuickTestLogin("INSTRUCTOR")}
            className="w-full p-3 rounded-xl border border-[#CEDECF] hover:border-[#2f6a45] bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#0C2417]">Studio / Instructor Login</p>
              <p className="text-[10px] text-slate-500">Teacher & Studio Operator • owner@yogastudio.test</p>
            </div>
            <span className="text-[11px] bg-[#133623] text-white px-2.5 py-1 rounded-lg font-semibold">Teacher Login →</span>
          </button>

          {/* 3. Student Login */}
          <button
            type="button"
            onClick={() => handleQuickTestLogin("STUDENT")}
            className="w-full p-3 rounded-xl border border-slate-300 hover:border-slate-500 bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-[#0C2417]">Student Login</p>
              <p className="text-[10px] text-slate-500">Practitioner Portal • student1@test.progressrooms.local</p>
            </div>
            <span className="text-[11px] bg-slate-700 text-white px-2.5 py-1 rounded-lg font-semibold">Student Portal →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#212121] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full mx-auto pt-6 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-xs font-bold text-[#1b4332] hover:text-[#0C2417] gap-1.5 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-[#40514E] uppercase tracking-wider">Dev Test Mode Enabled</span>
        </div>
      </div>

      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-500">Loading Login Sanctuary...</div>}>
        <LoginFormContent />
      </Suspense>

      <div className="text-center text-xs text-slate-500 pb-4">
        ProgressRooms Virtual Studio OS • Development Mode Active
      </div>
    </div>
  );
}
