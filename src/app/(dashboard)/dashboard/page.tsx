import Link from "next/link";
import { Calendar, Users, DollarSign, Layout, Plus, CheckCircle, Video, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              PR
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 leading-tight">Sahil Yoga Studio</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                Starter (30d Trial)
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700"
            >
              <Calendar className="h-4 w-4" /> Calendar & Occurrences
            </Link>
            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" /> Sessions & Classes
            </Link>
            <Link
              href="/dashboard/attendance"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Users className="h-4 w-4" /> Attendance Roster
            </Link>
            <Link
              href="/dashboard/website"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Layout className="h-4 w-4" /> Public Website
            </Link>
          </nav>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs">
          <p className="font-bold text-indigo-900">Trial Active</p>
          <p className="text-indigo-600 mt-1">28 days remaining. Upgrade to Core or Studio for custom domains.</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Studio Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, Sahil. Here is your scheduled timetable today.</p>
          </div>
          <Link
            href="/sahil-yoga-studio"
            target="_blank"
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm transition"
          >
            View Live Website ↗
          </Link>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Sessions</span>
            <p className="text-2xl font-black text-slate-900 mt-1">3</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Enrolled Students</span>
            <p className="text-2xl font-black text-slate-900 mt-1">20</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Classes This Week</span>
            <p className="text-2xl font-black text-slate-900 mt-1">12</p>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Revenue</span>
            <p className="text-2xl font-black text-slate-900 mt-1">₹45,000</p>
          </div>
        </div>

        {/* Rolling Class Occurrences Feed */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <h2 className="text-base font-bold text-slate-900">Upcoming Generated Occurrences</h2>
            <span className="text-xs text-slate-500 font-mono">Timezone: Asia/Kolkata</span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  07:00
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Morning Hatha Flow</h3>
                  <p className="text-xs text-slate-500">Tomorrow • Instructor: Sahil Sharma • 20 Enrolled</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Scheduled
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  18:00
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Aerial Yoga Conditioning</h3>
                  <p className="text-xs text-slate-500">In 2 Days • Instructor: Ananya Sen • 12 Enrolled</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                Scheduled
              </span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs">
                  07:00
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 line-through">Morning Hatha Flow</h3>
                  <p className="text-xs text-slate-400">Cancelled • Teacher attending symposium</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
                Cancelled
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
