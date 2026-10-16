"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthFlowLink } from "@/components/AuthFlowLink";
import { ArrowLeft, Loader2, AlertCircle, Building2, User, Lock, Mail, Phone } from "lucide-react";
import { OtpVerificationCard } from "@/components/OtpVerificationCard";
import { PrivacyConsent } from "@/components/PrivacyPolicy";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy/policy";
import { DeveloperOnly } from "@/components/DeveloperModeProvider";
import { BrandLogo } from "@/components/BrandLogo";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");
  const requestedNext = searchParams.get("next");
  const next = requestedNext && requestedNext.startsWith("/") && !requestedNext.startsWith("//") && !/[\\\s]/.test(requestedNext) ? requestedNext : null;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [role, setRole] = useState<"STUDIO" | "STUDENT">(searchParams.get("role") === "STUDENT" ? "STUDENT" : "STUDIO");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [studioName, setStudioName] = useState("");

  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  const [loading, setLoading] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRegister = Boolean(
    fullName.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.trim() && password.length >= 8 && password.length <= 128 &&
    password === confirmPassword && phone.trim() && location.trim() &&
    (role !== "STUDIO" || studioName.trim()) && privacyAccepted
  );

  const isTestFilled = email === "sambekar777@gmail.com" && fullName === "App Test Name 01";

  const toggleTestCredentials = () => {
    setPrivacyAccepted(false);
    if (isTestFilled) {
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhone("");
      setLocation("");
      setStudioName("");
    } else {
      setRole("STUDIO");
      setFullName("App Test Name 01");
      setEmail("sambekar777@gmail.com");
      setPassword("sahil777");
      setConfirmPassword("sahil777");
      setPhone("7769953731");
      setLocation("Rishikesh");
      setStudioName("Rishi Yogi Studio");
    }
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      setError("Please read and accept the Privacy Policy to register.");
      return;
    }
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in your name, email, and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (!canRegister || loading) {
      setError("Complete all fields and accept the Privacy Policy before registering.");
      return;
    }

    const validContact = (value: string) => /^\+?[0-9 ()-]+$/.test(value.trim()) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;
    if (!validContact(phone) || (whatsappNumber.trim() && !validContact(whatsappNumber))) {
      setError("Enter a valid phone number with 7–15 digits. WhatsApp is optional but must be valid if provided.");
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
          password: password,
          phone: phone.trim() || null,
          whatsapp_number: whatsappNumber.trim() || null,
          role: role,
          privacy_accepted: privacyAccepted,
          privacy_policy_version: PRIVACY_POLICY_VERSION,
          location: location.trim() || null,
          studio_name: role === "STUDIO" ? (studioName.trim() || `${fullName.trim()} Sanctuary`) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.detail === "string" ? data.detail : Array.isArray(data.detail) ? data.detail.map((item: { msg: string }) => item.msg).join("; ") : "Registration failed. Please check details.");
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

    if (data.user?.role === "STUDENT") {
      router.push(next || "/student");
    } else {
      router.push(next || "/dashboard");
    }
  };

  return (
    <div id="main-content" className="card-nature max-w-lg w-full mx-auto my-4 sm:my-8 p-5 sm:p-8 space-y-6">
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
            <h1 className="text-2xl font-serif font-bold text-[#0C2417]">{role === "STUDENT" ? "Student Registration" : "Studio Registration"}</h1>
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
            <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
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
                  onClick={() => { setRole("STUDIO"); setPrivacyAccepted(false); }}
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
                  onClick={() => { setRole("STUDENT"); setPrivacyAccepted(false); }}
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
              <label htmlFor="register-page-field-1" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input id="register-page-field-1"
                type="text"
                required
                placeholder="e.g. Sahil Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="register-email" autoComplete="email"
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
                <label htmlFor="register-password" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="register-password" autoComplete="new-password"
                    required
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-confirm-password" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="register-confirm-password" autoComplete="new-password"
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
                <label htmlFor="register-phone" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="register-phone" autoComplete="tel" required maxLength={50}
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              </div>

              {role === "STUDENT" && <div>
                <label htmlFor="register-whatsapp" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">WhatsApp number (optional)</label>
                <input id="register-whatsapp" type="tel" maxLength={50} value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]" />
              </div>}

              {role === "STUDIO" && (
                <div>
                  <label htmlFor="register-page-field-2" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                    Studio Name *
                  </label>
                  <input id="register-page-field-2" required
                    type="text"
                    placeholder="e.g. Prana Movement Sanctuary"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#1b4332] text-sm bg-[#FAF7F2]"
                  />
                </div>
              )}
            </div>

            <label className="block text-xs font-bold">Location *
              <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="City, state, country" className="block w-full border rounded-xl p-3 mt-2" />
            </label>
            <PrivacyConsent audience={role} accepted={privacyAccepted} onChange={setPrivacyAccepted} />
            <button
              type="submit"
              disabled={loading || !canRegister}
              className="disabled:opacity-50 disabled:cursor-not-allowed w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register & Verify with OTP"}
            </button>

            <p className="text-center text-xs text-[#618D63] pt-1">
              Already have an account?{" "}
              <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-bold text-[#0C2417] hover:underline">
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
        <Suspense fallback={<Link href="/login">Already Registered? Sign In</Link>}><AuthFlowLink destination="login">Already Registered? Sign In</AuthFlowLink></Suspense>
      </div>

      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-500">Loading registration...</div>}>
        <RegisterFormContent />
      </Suspense>

      <footer className="max-w-lg w-full mx-auto py-4 text-center text-[11px] text-[#7E7970]">
        ProgressRooms · <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
      </footer>
    </div>
  );
}
