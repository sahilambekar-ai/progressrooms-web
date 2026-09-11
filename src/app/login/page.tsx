"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Lock, Mail } from "lucide-react";
import { OtpVerificationCard } from "@/components/OtpVerificationCard";
import { BrandLogo } from "@/components/BrandLogo";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"LOGIN_FORM" | "OTP_VERIFICATION">("LOGIN_FORM");
  const [loading, setLoading] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
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

        if (data.user?.role === "STUDENT" || data.user?.email?.startsWith("student")) {
          router.push("/student");
        } else {
          router.push("/dashboard");
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

    if (data.user?.role === "STUDENT" || data.user?.email?.startsWith("student")) {
      router.push("/student");
    } else {
      router.push("/dashboard");
    }
  };

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
        organization_name: "ProgressNow Platform",
        organization_slug: "platform"
      };
      targetUrl = "/dashboard";
    } else if (userRole === "INSTRUCTOR") {
      mockUser = {
        id: "usr-instructor",
        email: "owner@yogastudio.test",
        full_name: "Lead Teacher (Studio Guide)",
        role: "INSTRUCTOR",
        organization_name: "Sahil Yoga Studio",
        organization_slug: "sahil-yoga-studio"
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
      ) : (
        <>
          <div className="text-center">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8" />
              <BrandLogo size={48} variant="tile-dark" />
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
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Sign In to ProgressNow</h1>
            <p className="text-xs text-[#7E7970] mt-1">
              Access your studio operations, teacher schedule, or student sanctuary portal.
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
              <label htmlFor="login-password" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Password
              </label>
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
              <Link href="/register" className="font-bold text-[#0C2417] hover:underline">
                Register your sanctuary
              </Link>
            </p>
          </form>

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
                onClick={() => handleQuickTestLogin("INSTRUCTOR")}
                className="w-full p-3 rounded-xl border border-[#CEDECF] hover:border-[#1b4332] bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Studio Owner Login (Sahil Sharma)</p>
                  <p className="text-[10px] text-slate-500">Studio Operations & Billing • owner@yogastudio.test</p>
                </div>
                <span className="text-[11px] bg-[#133623] text-white px-2.5 py-1 rounded-lg font-semibold">Studio Sanctuary →</span>
              </button>

              {/* 3. Student Login */}
              <button
                type="button"
                onClick={() => handleQuickTestLogin("STUDENT")}
                className="w-full p-3 rounded-xl border border-slate-300 hover:border-slate-500 bg-[#F4F7F4] hover:bg-[#E8F0E9] text-left transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Student Login (Aarav Patel)</p>
                  <p className="text-[10px] text-slate-500">Practitioner Portal • student1@test.progressrooms.local</p>
                </div>
                <span className="text-[11px] bg-slate-700 text-white px-2.5 py-1 rounded-lg font-semibold">Student Portal →</span>
              </button>
            </div>
          </div>
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
        <Link href="/register" className="text-xs font-semibold text-[#2D7A58] hover:underline">
          Create New Account
        </Link>
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
