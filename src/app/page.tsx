import Link from "next/link";
import { Calendar, Users, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              PR
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">ProgressRooms</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Teacher Dashboard
            </Link>
            <Link href="/student" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Student Portal
            </Link>
            <Link
              href="/sahil-yoga-studio"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            >
              Demo Studio <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" /> Multi-Tenant Operating Platform for Scheduled Instruction
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Everything your studio needs to schedule, teach, and grow.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
          Built for independent yoga masters, guitar instructors, dance studios, art academies, and multi-teacher coaching businesses.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/sahil-yoga-studio"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md transition"
          >
            Explore Sahil Yoga Studio
          </Link>
          <Link
            href="/john-guitar-academy"
            className="px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition"
          >
            Explore John Guitar Academy
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Calendar className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Intelligent Scheduling Engine</h3>
              <p className="mt-2 text-sm text-slate-600">
                Define weekly recurrence rules, generate rolling 30-day class occurrences, and detect instructor double-booking automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Public SSR Teacher Websites</h3>
              <p className="mt-2 text-sm text-slate-600">
                Server-side rendered public websites (e.g. progressrooms.com/sahil-yoga-studio) with instant LCP, SEO tags, and class discovery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Secure Razorpay Commerce</h3>
              <p className="mt-2 text-sm text-slate-600">
                Frictionless OTP login, direct student checkout via Razorpay, automated enrollment activation, and protected Zoom links.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
