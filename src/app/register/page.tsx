"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Building2, User, Lock, Mail, Phone } from "lucide-react";
import { OtpVerificationCard } from "@/components/OtpVerificationCard";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"STUDIO" | "STUDENT">("STUDIO");
  const [studioName, setStudioName] = useState("");

  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [loading, setLoading] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your name, email, and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
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
      setStep("OTP");
    } catch (err: any) {
      setError(err.message || "Failed to complete registration.");
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

  return (
    <div className="card-nature max-w-lg w-full mx-auto my-8 p-8 space-y-6">
      {step === "OTP" ? (
        <OtpVerificationCard
          email={email}
          previewOtp={previewOtp}
          onSuccess={handleOtpVerified}
          onBack={() => {
            setStep("FORM");
            setError(null);
          }}
          title="Verify Your Sanctuary Account"
          subtitle="We've dispatched a 6-digit verification code to your email. Enter it below to activate your account and access your dashboard."
          purpose="LOGIN_VERIFICATION"
        />
      ) : (
        <>
          <div className="text-center">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#0C2417] to-[#1b4332] text-white flex items-center justify-center mx-auto mb-3 text-xl shadow-md">
              🌿
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Create Sanctuary Account</h1>
            <p className="text-xs text-[#7E7970] mt-1">
              Join ProgressRooms to manage your classes, teachers, student roster, or practitioner journey.
            </p>

            {selectedPlan && (
              <div className="mt-3 p-2 rounded-xl bg-[#E8F0E9] border border-[#CEDECF] text-xs font-semibold text-[#1b4332] flex items-center justify-center gap-1.5">
                <span>✨</span>
                <span>Selected Plan: <strong>{selectedPlan.toUpperCase()}</strong></span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("STUDIO")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    role === "STUDIO"
                      ? "border-[#133623] bg-[#E8F0E9] text-[#0C2417] shadow-sm ring-1 ring-[#133623]"
                      : "border-[#CEDECF] bg-[#FAF7F2] text-slate-600 hover:bg-white"
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${role === "STUDIO" ? "text-[#133623]" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs font-bold">Studio Sanctuary</p>
                    <p className="text-[10px] text-slate-500">Academy / Studio Owner</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                    role === "STUDENT"
                      ? "border-[#133623] bg-[#E8F0E9] text-[#0C2417] shadow-sm ring-1 ring-[#133623]"
                      : "border-[#CEDECF] bg-[#FAF7F2] text-slate-600 hover:bg-white"
                  }`}
                >
                  <User className={`w-4 h-4 ${role === "STUDENT" ? "text-[#133623]" : "text-slate-400"}`} />
                  <div>
                    <p className="text-xs font-bold">Student / Yogi</p>
                    <p className="text-[10px] text-slate-500">Practitioner Member</p>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sahil Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@sanctuary.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                />
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>

              {role === "STUDIO" && (
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                    Studio Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prana Movement Sanctuary"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register & Verify with OTP"}
            </button>

            <p className="text-center text-xs text-[#618D63] pt-1">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#0C2417] hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </>
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
        <Link href="/login" className="text-xs font-semibold text-[#2D7A58] hover:underline">
          Already Registered? Sign In
        </Link>
      </div>

      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-500">Loading registration...</div>}>
        <RegisterFormContent />
      </Suspense>

      <footer className="max-w-lg w-full mx-auto py-4 text-center text-[11px] text-[#7E7970]">
        ProgressRooms Sanctuary Multi-Tenant Platform • Secure Brevo OTP & Encrypted Auth
      </footer>
    </div>
  );
}
