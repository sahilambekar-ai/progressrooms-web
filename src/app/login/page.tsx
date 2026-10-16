"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthFlowLink } from "@/components/AuthFlowLink";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Lock, Mail } from "lucide-react";
import { OtpVerificationCard } from "@/components/OtpVerificationCard";
import { DeveloperOnly } from "@/components/DeveloperModeProvider";
import { BrandLogo } from "@/components/BrandLogo";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const requestedNext = searchParams.get("next");
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !/[\\\s]/.test(requestedNext) ? requestedNext : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"LOGIN_FORM" | "OTP_VERIFICATION" | "FORGOT_PASSWORD" | "RESET_PASSWORD">("LOGIN_FORM");
  const [loading, setLoading] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetPreviewOtp, setResetPreviewOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isTestFilled = email === "sambekar777@gmail.com" && password === "sahil777";

  const toggleTestCredentials = () => {
    if (isTestFilled) {
      setEmail("");
      setPassword("");
    } else {
      setEmail("sambekar777@gmail.com");
      setPassword("sahil777");
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Handle email + password sign in
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Invalid email or password.");
      }

      // If already verified: direct login to dashboard
      if (data.is_verified && data.access_token) {
        localStorage.setItem("pr_access_token", data.access_token);
        localStorage.setItem("pr_user", JSON.stringify(data.user));

        if (data.user?.role === "STUDENT") {
          router.push(next || "/student");
        } else {
          router.push(next || "/dashboard");
        }
        return;
      }

      // If user is not verified: load the shared OTP verification component
      if (!data.is_verified || data.requires_activation) {
        setPreviewOtp(data.otp_preview || null);
        setStep("OTP_VERIFICATION");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Called when OTP verification succeeds in the shared OtpVerificationCard component
  const handleOtpVerified = (data: { access_token: string; user: any }) => {
    localStorage.setItem("pr_access_token", data.access_token);
    localStorage.setItem("pr_user", JSON.stringify(data.user));

    if (data.user?.role === "STUDENT") {
      router.push(next || "/student");
    } else {
      router.push(next || "/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your account email address.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not process request.");
      setResetPreviewOtp(data.otp_preview || null);
      setInfoMessage(data.message || "Passcode sent to your email.");
      setStep("RESET_PASSWORD");
    } catch (err: any) {
      setError(err.message || "Could not send password reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword.trim()) {
      setError("Please enter the verification code and your new password.");
      return;
    }
    if (newPassword.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: resetCode.trim(),
          new_password: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reset password.");
      setInfoMessage("Password reset successfully! You can now log in with your new password.");
      setPassword(newPassword.trim());
      setStep("LOGIN_FORM");
    } catch (err: any) {
      setError(err.message || "Could not reset password. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTestLogin = async (userRole: "SUPER_ADMIN" | "STUDIO" | "TEACHER" | "STUDENT") => {
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await fetch(`${API_BASE}/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: userRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Development login failed.");
      localStorage.setItem("pr_access_token", data.access_token);
      localStorage.setItem("pr_user", JSON.stringify(data.user));
      router.push(next || (userRole === "STUDENT" ? "/student" : "/dashboard"));
    } catch (err: any) {
      setError(err.message || "Development login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-content" className="card-nature max-w-md w-full mx-auto my-4 sm:my-8 p-5 sm:p-8 space-y-6">
      {step === "OTP_VERIFICATION" ? (
        <OtpVerificationCard
          email={email}
          previewOtp={previewOtp}
          onSuccess={handleOtpVerified}
          onBack={() => {
            setStep("LOGIN_FORM");
            setError(null);
            setInfoMessage(null);
          }}
          title="Activate & Verify Account"
          subtitle="Your account is not verified yet. Enter the 6-digit passcode sent to your email to verify and open your dashboard."
          purpose="LOGIN_VERIFICATION"
        />
      ) : step === "FORGOT_PASSWORD" ? (
        <div className="space-y-5">
          <div className="text-center">
            <BrandLogo size={48} variant="tile-dark" />
            <h1 className="text-2xl font-serif font-bold text-[#0C2417] mt-3">Reset Your Password</h1>
            <p className="text-xs text-[#7E7970] mt-1">
              Enter your account email to receive a 6-digit verification passcode.
            </p>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="reset-email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setInfoMessage(null);
                setStep("LOGIN_FORM");
              }}
              className="w-full text-center text-xs text-[#2D7A58] hover:text-[#133623] font-semibold flex items-center justify-center gap-1.5 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </form>
        </div>
      ) : step === "RESET_PASSWORD" ? (
        <div className="space-y-5">
          <div className="text-center">
            <BrandLogo size={48} variant="tile-dark" />
            <h1 className="text-2xl font-serif font-bold text-[#0C2417] mt-3">Enter Passcode & New Password</h1>
            <p className="text-xs text-[#7E7970] mt-1">
              We sent a 6-digit passcode to <strong>{email}</strong>
            </p>
          </div>

          {resetPreviewOtp && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Development Test Passcode:</span>{" "}
              <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono font-bold text-amber-950">
                {resetPreviewOtp}
              </code>
            </div>
          )}

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="reset-code" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                6-Digit Passcode
              </label>
              <input
                type="text"
                id="reset-code"
                required
                maxLength={6}
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-center tracking-widest font-mono text-lg bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="new-password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save New Password & Sign In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setInfoMessage(null);
                setStep("FORGOT_PASSWORD");
              }}
              className="w-full text-center text-xs text-[#2D7A58] hover:text-[#133623] font-semibold flex items-center justify-center gap-1.5 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Resend code or change email</span>
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8" />
              <BrandLogo size={48} variant="tile-dark" />
              <div className="w-8 h-8">
                <DeveloperOnly>
                  <button
                    type="button"
                    onClick={toggleTestCredentials}
                    title={isTestFilled ? "Clear test credentials" : "Fill test credentials (sambekar777@gmail.com)"}
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition shadow-sm border ${
                      isTestFilled
                        ? "bg-[#133623] text-white border-[#0C2417] ring-2 ring-[#81A882]"
                        : "bg-white text-[#133623] border-[#CEDECF] hover:bg-[#E8F0E9] hover:border-[#133623]"
                    }`}
                  >
                    T
                  </button>
                </DeveloperOnly>
              </div>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Sign In to ProgressNow</h1>
            <p className="text-xs text-[#7E7970] mt-1">
              Access your studio operations, teacher schedule, or student studio portal.
            </p>

            {selectedPlan && (
              <div className="mt-4 p-2.5 rounded-xl bg-[#E8F0E9] border border-[#CEDECF] text-xs font-semibold text-[#1b4332] flex items-center justify-center gap-1.5">
                <span>🌿</span>
                <span>Signing up with <strong>{selectedPlan.toUpperCase()}</strong> plan</span>
              </div>
            )}
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

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Work or Student Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="login-email" autoComplete="email"
                  required
                  placeholder="teacher@yogastudio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setInfoMessage(null);
                    setStep("FORGOT_PASSWORD");
                  }}
                  className="text-xs text-[#2D7A58] hover:text-[#133623] font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="login-password" autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In with Email & Password"}
            </button>

            <p className="text-center text-xs text-[#618D63] pt-2">
              Don&apos;t have an account yet?{" "}
              <Link href={next ? `/register?role=STUDENT&next=${encodeURIComponent(next)}` : "/register"} className="font-bold text-[#0C2417] hover:underline">
                Create a student account
              </Link>
            </p>
          </form>

          <DeveloperOnly>
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

              {/* 2. Studio Owner Login */}
              <button
                type="button"
                onClick={() => handleQuickTestLogin("STUDIO")}
                className="w-full p-3 rounded-xl border border-[#CEDECF] hover:border-[#1b4332] bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Studio Owner Login</p>
                  <p className="text-[10px] text-slate-500">Studio Operations & Billing • owner@yogastudio.test</p>
                </div>
                <span className="text-[11px] bg-[#133623] text-white px-2.5 py-1 rounded-lg font-semibold">Studio Sanctuary →</span>
              </button>

              {/* 3. Teacher Login */}
              <button
                type="button"
                onClick={() => handleQuickTestLogin("TEACHER")}
                className="w-full p-3 rounded-xl border border-[#81A882] hover:border-[#1b4332] bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Teacher Login</p>
                  <p className="text-[10px] text-slate-500">Classes, assigned students & attendance • ananya@yogastudio.test</p>
                </div>
                <span className="text-[11px] bg-[#2D7A58] text-white px-2.5 py-1 rounded-lg font-semibold">Teacher Portal →</span>
              </button>

              {/* 4. Student Login */}
              <button
                type="button"
                onClick={() => handleQuickTestLogin("STUDENT")}
                className="w-full p-3 rounded-xl border border-slate-300 hover:border-slate-500 bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Student Login (Student 1)</p>
                  <p className="text-[10px] text-slate-500">Practitioner Portal • student1@test.progressrooms.local</p>
                </div>
                <span className="text-[11px] bg-slate-700 text-white px-2.5 py-1 rounded-lg font-semibold">Student Portal →</span>
              </button>
            </div>
          </div>
          </DeveloperOnly>
        </>
      )}
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
        <Suspense fallback={<Link href="/register">Create New Account</Link>}><AuthFlowLink destination="register">Create New Account</AuthFlowLink></Suspense>
      </div>

      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-500">Loading sanctuary sign in...</div>}>
        <LoginFormContent />
      </Suspense>

      <footer className="max-w-md w-full mx-auto py-4 text-center text-[11px] text-[#7E7970]">
        ProgressNow Sanctuary Multi-Tenant Platform • Secure Brevo OTP & Encrypted Auth
      </footer>
    </div>
  );
}
