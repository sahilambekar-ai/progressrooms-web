import Link from "next/link";
import { Sparkles, ArrowRight, Check, Lock, ChevronRight, X as XIcon } from "lucide-react";
import { DeveloperOnly } from "@/components/DeveloperModeProvider";
import { BrandLogo } from "@/components/BrandLogo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#212121] flex flex-col font-sans">
      {/* Nature Navigation Bar */}
      <header className="bg-white/90 backdrop-blur border-b border-[#E1E9E2] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="group">
            <BrandLogo size={36} variant="tile-dark" showText subtitle="Virtual Studio OS" />
          </Link>

          <nav className="hidden xl:flex items-center space-x-5 text-base font-semibold text-[#40514E]">
            <a href="#features" className="hover:text-[#0C2417] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#0C2417] transition">How it Works</a>
            <a href="#pricing" className="hover:text-[#0C2417] transition">Pricing Plans</a>
            <Link href="/sahil-yoga-studio" className="hover:text-[#0C2417] transition flex items-center gap-1.5">
              <span>Demo Studio</span>
              <span className="text-[11px] bg-[#E8F0E9] text-[#275539] px-2 py-0.5 rounded-full font-bold">Live</span>
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">

            <Link
              href="/login"
              className="text-sm font-semibold text-[#1b4332] hover:text-[#0C2417] px-2 sm:px-3.5 py-2 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] shadow-sm transition-all"
            >
              Register
            </Link>
          </div>
        </div>
        <nav aria-label="Explore ProgressNow" className="xl:hidden flex gap-5 overflow-x-auto whitespace-nowrap border-t border-[#E1E9E2] px-4 py-2 text-xs font-semibold text-[#40514E]">
          <a className="py-2" href="#features">Features</a>
          <a className="py-2" href="#how-it-works">How it works</a>
          <a className="py-2" href="#pricing">Pricing</a>
          <Link className="py-2" href="/sahil-yoga-studio">Demo studio</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="main-content" className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#ABC5AD]/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F0E9] border border-[#CEDECF] text-[#1b4332] text-xs font-semibold mb-6">
          <span>🌿</span>
          <span>All-in-One Platform for Yoga, Aerial, Dance & Fitness Teachers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-[#0C2417] tracking-tight leading-[1.15]">
          Your Virtual Studio. <br className="hidden sm:inline" />
          <span className="italic text-[#275539]">Less Admin, More Teaching.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[#40514E] max-w-3xl mx-auto leading-relaxed">
          The operating system for independent instructors and multi-teacher academies.
          Automate class schedules, student attendance, protected Zoom links, and recurring payments in one tranquil sanctuary.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register?plan=starter"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Start 30-Day Free Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sahil-yoga-studio"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-[#CEDECF] hover:border-[#81A882] text-[#1b4332] font-semibold text-base shadow-sm hover:bg-[#F9FAF9] transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Demo Studio</span>
            <ChevronRight className="h-4 w-4 text-[#81A882]" />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[#618D63] font-medium">
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-[#2f6a45]" /> No Credit Card Required
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-[#2f6a45]" /> 2-Minute Setup
          </span>
          <DeveloperOnly><span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-[#2f6a45]" /> Test Mode Preloaded
          </span></DeveloperOnly>
        </div>
      </section>

      {/* Virtual Studio Features (Practicenow.us reference) */}
      <section id="features" className="py-20 bg-white border-t border-[#E1E9E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[#81A882]">
              Complete Virtual Studio Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0C2417] mt-2">
              Everything Needed to Run Scheduled Batches
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Move away from chaotic WhatsApp groups, manual spreadsheets, and shared Zoom passwords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-nature p-7">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center text-xl mb-5 shadow-sm">
                🌐
              </div>
              <h3 className="text-xl font-bold text-[#0C2417]">Branded Studio Website</h3>
              <p className="mt-2 text-sm text-[#7E7970] leading-relaxed">
                Receive your own public SSR website (e.g. <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-[#CEDECF]">progressrooms.com/your-studio</code>) with bio, schedule timetables, and instant enrollment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-nature p-7">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center text-xl mb-5 shadow-sm">
                🎥
              </div>
              <h3 className="text-xl font-bold text-[#0C2417]">Live Zoom & Meet Integration</h3>
              <p className="mt-2 text-sm text-[#7E7970] leading-relaxed">
                Automated video link delivery. Meeting links automatically unlock for enrolled students 15 minutes before class starts. Zero manual link sharing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-nature p-7">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center text-xl mb-5 shadow-sm">
                🗓️
              </div>
              <h3 className="text-xl font-bold text-[#0C2417]">Smart Scheduling Engine</h3>
              <p className="mt-2 text-sm text-[#7E7970] leading-relaxed">
                Define weekly recurrence rules once. The system generates rolling 30-day class occurrences, detects instructor double-bookings, and handles rescheduling.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-nature p-7">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center text-xl mb-5 shadow-sm">
                📋
              </div>
              <h3 className="text-xl font-bold text-[#0C2417]">Attendance & Credit Deductions</h3>
              <p className="mt-2 text-sm text-[#7E7970] leading-relaxed">
                One-click attendance marking for instructors. Package class credits automatically decrement, with complete historical attendance logs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-nature p-7">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center text-xl mb-5 shadow-sm">
                💳
              </div>
              <h3 className="text-xl font-bold text-[#0C2417]">Memberships & Renewals</h3>
              <p className="mt-2 text-sm text-[#7E7970] leading-relaxed">
                Supports monthly rolling access, class packages, and workshop passes. Automatic renewal notifications ensure students never lapse.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-nature p-7">
              <div className="h-12 w-12 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center text-xl mb-5 shadow-sm">
                🧘
              </div>
              <h3 className="text-xl font-bold text-[#0C2417]">Student Self-Service Portal</h3>
              <p className="mt-2 text-sm text-[#7E7970] leading-relaxed">
                Enrolled students get a dedicated portal to view upcoming timetables, join classes with 1-click, review payment receipts, and submit queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Old Way vs ProgressNow Sanctuary */}
      <section id="how-it-works" className="py-20 bg-[#F4F7F4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-[#81A882]">The Comparison</span>
            <h2 className="text-3xl font-serif font-bold text-[#0C2417] mt-1">
              Why Instructors Choose ProgressNow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-red-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <span>❌</span>
                <span>The Frustrating Old Way</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Posting Zoom meeting IDs manually into WhatsApp 10 minutes before every single class.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Tracking student class count and payment expiry in messy, outdated Excel spreadsheets.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Awkwardly chasing students via direct message for monthly membership renewals.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  Unregistered attendees sharing Zoom passwords with friends.
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-white border-2 border-[#81A882] shadow-md space-y-4">
              <div className="flex items-center gap-2 text-[#1b4332] font-bold text-base">
                <span>🌿</span>
                <span>The ProgressNow Sanctuary Way</span>
              </div>
              <ul className="space-y-3 text-sm text-[#275539]">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2f6a45] shrink-0 mt-0.5" />
                  Meeting links unlock automatically on student dashboards 15 minutes before class.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2f6a45] shrink-0 mt-0.5" />
                  Automated attendance tracker automatically records check-ins and package deductions.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2f6a45] shrink-0 mt-0.5" />
                  Automated expiry notifications and online renewals without awkward conversations.
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-[#2f6a45] shrink-0 mt-0.5" />
                  Only verified, active enrolled students can unlock classroom access.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section (4 Plans per requirements) */}
      <section id="pricing" className="py-24 bg-white border-t border-[#E1E9E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[#81A882]">
              Simple & Honest Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#0C2417] mt-2">
              Choose the Plan That Fits Your Studio
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Try Starter risk-free for 30 days. Upgrade anytime as your student base grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Plan 1: Starter */}
            <div className="card-nature p-7 flex flex-col justify-between relative">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8F0E9] text-[#1b4332]">
                  Free Trial
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#0C2417] mt-3">Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Full access to experience the platform.</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0C2417]">₹0</span>
                  <span className="text-xs font-semibold text-slate-500">/ 30 Days</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-[#275539] border-t border-[#CEDECF] pt-5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>1 Teacher / Instructor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Up to 3 Active Class Classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>50 Enrolled Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Default Public Website</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Live Video / Zoom Links</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register?plan=starter"
                className="mt-8 w-full py-3 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-sm text-center shadow-sm transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Plan 2: Core */}
            <div className="card-nature p-7 flex flex-col justify-between relative">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#CEDECF] text-[#1b4332]">
                  Basic Paid
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#0C2417] mt-3">Core</h3>
                <p className="text-xs text-slate-500 mt-1">For independent solo teachers & coaches.</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0C2417]">₹1,499</span>
                  <span className="text-xs font-semibold text-slate-500">/ Month</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-[#275539] border-t border-[#CEDECF] pt-5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>1 Teacher / Instructor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Up to 10 Active Class Classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>250 Enrolled Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Default Public Website</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Automated Email Reminders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Standard Analytics & Reports</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register?plan=core"
                className="mt-8 w-full py-3 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-sm text-center shadow-sm transition"
              >
                Buy Now
              </Link>
            </div>

            {/* Plan 3: Studio (Most Popular) */}
            <div className="p-7 rounded-3xl bg-white border-2 border-[#133623] shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#133623] text-white shadow-md">
                ★ Most Popular Studio
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8F0E9] text-[#1b4332]">
                  Advanced Studio
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#0C2417] mt-3">Studio</h3>
                <p className="text-xs text-slate-500 mt-1">For multi-teacher studios & academies.</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#0C2417]">₹3,999</span>
                  <span className="text-xs font-semibold text-slate-500">/ Month</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-[#275539] border-t border-[#E1E9E2] pt-5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span className="font-bold">Up to 10 Instructors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span className="font-bold">Unlimited Classes & Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>3 Advanced Website Templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Custom Domain Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Instructor Double-Booking Shield</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2f6a45] shrink-0" />
                    <span>Priority Support & Roster Export</span>
                  </div>
                </div>
              </div>

              <Link
                href="/register?plan=studio"
                className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#275539] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-sm text-center shadow-md hover:shadow-lg transition"
              >
                Buy Now
              </Link>
            </div>

            {/* Plan 4: Progress AI (Disabled) */}
            <div className="p-7 rounded-3xl bg-[#F9FAF9] border border-slate-200 opacity-80 flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-300 text-slate-700">
                Coming Soon
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                  AI Intelligence
                </span>
                <h3 className="text-2xl font-serif font-bold text-slate-600 mt-3">Progress AI</h3>
                <p className="text-xs text-slate-400 mt-1">Autonomous AI studio copilot.</p>

                <div className="mt-5 flex items-baseline gap-1 text-slate-400">
                  <span className="text-2xl font-bold">Coming Soon</span>
                </div>

                <div className="mt-6 space-y-2.5 text-xs text-slate-500 border-t border-slate-200 pt-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>AI Website Content Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>AI Class Description Writer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Predictive Student Attendance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Automated Marketing Assistant</span>
                  </div>
                </div>
              </div>

              <button
                disabled
                className="mt-8 w-full py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-sm text-center cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Coming Soon (Waitlist)</span>
              </button>
            </div>
          </div>

          {/* In-Depth Feature Comparison Matrix Table */}
          <div className="mt-16 bg-white rounded-3xl border border-[#CEDECF] shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8 bg-[#F4F7F4] border-b border-[#CEDECF]">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0C2417]">
                Compare Plan Features In-Depth
              </h3>
              <p className="text-sm text-[#40514E] mt-1">
                Everything you need to know about what is included across each ProgressNow plan.
              </p>
            </div>

            <div className="comparison-scroll overflow-x-auto" tabIndex={0} role="region" aria-label="Compare plans; scroll horizontally to see every plan">
              <table className="min-w-[640px] w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#E1E9E2] bg-[#FAF7F2] text-[#0C2417]">
                    <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-xs">Platform Feature</th>
                    <th className="p-4 sm:p-5 font-bold text-center w-36">Starter (Trial)</th>
                    <th className="p-4 sm:p-5 font-bold text-center w-36">Core (₹1,499)</th>
                    <th className="p-4 sm:p-5 font-bold text-center w-40 bg-[#E8F0E9] text-[#133623]">Studio (₹3,999)</th>
                    <th className="p-4 sm:p-5 font-bold text-center w-36 text-slate-500">Progress AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9E2]">
                  {/* Category 1: Scheduling & Classes */}
                  <tr className="bg-[#F4F7F4]">
                    <td colSpan={5} className="py-2.5 px-4 sm:px-5 font-bold text-xs uppercase tracking-wider text-[#133623]">
                      📅 Class Scheduling & Recurrence
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Teacher / Instructor Logins</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">1 Instructor</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">1 Instructor</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-[#133623] bg-[#F9FAF9]">Up to 10 Instructors</td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Active Class Batches / Timetables</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">Up to 3 Batches</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">Up to 10 Batches</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-[#133623] bg-[#F9FAF9]">Unlimited Batches</td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">Unlimited Batches</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Max Enrolled Students Directory</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">50 Yogis</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">250 Yogis</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-[#133623] bg-[#F9FAF9]">Unlimited Yogis</td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">Unlimited Yogis</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Automated Zoom & Google Meet Links</td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Instructor Double-Booking Shield Engine</td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>

                  {/* Category 2: Studio Website & Branding */}
                  <tr className="bg-[#F4F7F4]">
                    <td colSpan={5} className="py-2.5 px-4 sm:px-5 font-bold text-xs uppercase tracking-wider text-[#133623]">
                      🌐 Studio Website & Branding
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Hosted Public Studio Website</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">Subdomain</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">Subdomain</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-[#133623] bg-[#F9FAF9]">Custom Domain Ready</td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">Custom Domain Ready</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Website Design Templates</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">Default Minimal</td>
                    <td className="p-4 sm:p-5 text-center text-slate-700">Standard Nature</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-[#133623] bg-[#F9FAF9]">3 Advanced Sanctuary Themes</td>
                    <td className="p-4 sm:p-5 text-center text-slate-400">AI Generative Themes</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Live Typography Font Pairings (6 Fonts)</td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Student Online Booking & Queries</td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>

                  {/* Category 3: Passes & Attendance */}
                  <tr className="bg-[#F4F7F4]">
                    <td colSpan={5} className="py-2.5 px-4 sm:px-5 font-bold text-xs uppercase tracking-wider text-[#133623]">
                      🗓️ Attendance & Student Passes
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Daily Checklist Attendance View</td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Interactive Monthly Attendance Calendar</td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Automatic Pass Deduction on Present</td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Export Student Roster to CSV</td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center text-slate-400"><Check className="h-4 w-4 text-slate-400 mx-auto" /></td>
                  </tr>

                  {/* Category 4: AI Copilot */}
                  <tr className="bg-[#F4F7F4]">
                    <td colSpan={5} className="py-2.5 px-4 sm:px-5 font-bold text-xs uppercase tracking-wider text-[#133623]">
                      ✨ Progress AI Intelligence (Coming Soon)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">AI Studio Copy & Bio Writer</td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-[#212121]">Predictive Student Drop-off Alerts</td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center bg-[#F9FAF9]"><XIcon className="h-4 w-4 text-slate-300 mx-auto" /></td>
                    <td className="p-4 sm:p-5 text-center"><Check className="h-4 w-4 text-emerald-600 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Nature Footer */}
      <footer className="bg-[#0C2417] text-white py-14 border-t border-[#133623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1 sm:gap-3">
            <BrandLogo size={36} variant="tile-dark" />
            <div>
              <p className="font-serif font-bold text-base text-[#F4F7F4]">ProgressNow</p>
              <p className="text-[11px] text-[#81A882]">The Sanctuary Operating System for Instructors</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#81A882]">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/dashboard" className="hover:text-white transition">Admin Portal</Link>
            <Link href="/student" className="hover:text-white transition">Student Portal</Link>
            <Link href="/sahil-yoga-studio" className="hover:text-white transition">Demo Studio</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ProgressNow. All rights reserved. Built with love for instructors worldwide.
        </div>
      </footer>
    </div>
  );
}
