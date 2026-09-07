"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  BarChart3,
  Settings,
  Globe,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

type AdminTab =
  | "students"
  | "classes-plans"
  | "subscriptions-manager"
  | "attendance-tracker"
  | "queries-manager"
  | "analytics"
  | "settings";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("students");
  const [toast, setToast] = useState<string | null>(null);

  // Filter states
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("ALL");

  // Attendance state
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState("sess-1");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "ATTENDED" | "ABSENT">>({
    "student-1": "ATTENDED",
    "student-2": "ATTENDED",
    "student-3": "ABSENT",
    "student-4": "ATTENDED",
    "student-5": "ATTENDED",
  });

  // Query state
  const [queries, setQueries] = useState([
    { id: "q-1", student: "Aarav Patel", email: "student1@test.progressrooms.local", question: "Can I reschedule my Wednesday 7 AM Hatha session to Friday?", status: "RESOLVED", date: "Today" },
    { id: "q-2", student: "Pooja Sharma", email: "student2@test.progressrooms.local", question: "What suspension hammock do you recommend for home aerial yoga practice?", status: "UNANSWERED", date: "Yesterday" }
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("pr_access_token");
    localStorage.removeItem("pr_user");
    router.push("/login");
  };

  const toggleAttendance = (studentId: string) => {
    const current = attendanceRecords[studentId] || "ABSENT";
    const next = current === "ATTENDED" ? "ABSENT" : "ATTENDED";
    setAttendanceRecords(prev => ({ ...prev, [studentId]: next }));
    showToast(`Attendance updated: ${next}`);
  };

  // Sample seed data
  const studentsList = [
    { id: "student-1", name: "Aarav Patel", email: "student1@test.progressrooms.local", phone: "+91 98765 43210", plan: "Morning Hatha Flow (Monthly)", attended: 8, total: 12, status: "ACTIVE" },
    { id: "student-2", name: "Pooja Sharma", email: "student2@test.progressrooms.local", phone: "+91 98765 43211", plan: "Aerial Yoga Conditioning", attended: 4, total: 8, status: "ACTIVE" },
    { id: "student-3", name: "Rohan Verma", email: "student3@test.progressrooms.local", phone: "+91 98765 43212", plan: "Morning Hatha Flow (Monthly)", attended: 11, total: 12, status: "EXPIRING_SOON" },
    { id: "student-4", name: "Meera Nair", email: "student4@test.progressrooms.local", phone: "+91 98765 43213", plan: "Aerial Yoga Conditioning", attended: 6, total: 8, status: "ACTIVE" },
    { id: "student-5", name: "Vikram Iyer", email: "student5@test.progressrooms.local", phone: "+91 98765 43214", plan: "Meditation & Breathwork", attended: 3, total: 4, status: "ACTIVE" },
  ];

  const filteredStudents = studentsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.email.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus = studentStatusFilter === "ALL" || s.status === studentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#F4F7F4] text-[#1A2E22] font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0C2417] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#2D7A58] flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <span>🌿</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Nature Dark Emerald Sidebar (Inspired by aerial yoga client panel) */}
      <aside
        style={{
          background: "linear-gradient(180deg, #0C2417 0%, #133623 50%, #0D291A 100%)",
        }}
        className="w-72 flex-shrink-0 flex flex-col justify-between p-5 text-white shadow-2xl z-20"
      >
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="pb-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-[#1b4332] flex items-center justify-center text-xl shadow-inner">
                🌿
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-[#F4F7F4] leading-tight">
                  Sahil Yoga Studio
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] block mt-0.5">
                  Admin Operations
                </span>
              </div>
            </div>

            <Link
              href="/sahil-yoga-studio"
              target="_blank"
              title="Return to Public Website"
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border border-[#81A882]/30 flex items-center justify-center text-xs transition"
            >
              🌿
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] px-3 mb-2">
              Admin Operations Menu
            </p>

            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "students"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">👥</span>
              <span>Students & Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab("classes-plans")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "classes-plans"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">✨</span>
              <span>Class Batches & Schedules</span>
            </button>

            <button
              onClick={() => setActiveTab("subscriptions-manager")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "subscriptions-manager"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">💳</span>
              <span>Memberships & Passes</span>
            </button>

            <button
              onClick={() => setActiveTab("attendance-tracker")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "attendance-tracker"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">🗓️</span>
              <span>Attendance Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab("queries-manager")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "queries-manager"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">💬</span>
              <span>Student Support Queries</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "analytics"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">📊</span>
              <span>Analytics & Revenue</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "settings"
                  ? "bg-white/15 text-white border border-[#81A882]/40 shadow-sm"
                  : "text-[#cedecf] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">⚙️</span>
              <span>Settings & Website</span>
            </button>
          </nav>
        </div>

        {/* Bottom Pinned User & Sign Out */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 rounded-full bg-[#81A882] text-[#0C2417] font-bold text-xs flex items-center justify-center">
              SS
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">Sahil Sharma</p>
              <p className="text-[10px] text-[#81A882] truncate">owner@yogastudio.test</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-red-200 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 transition"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace (Scrollable) */}
      <main className="flex-1 h-screen overflow-y-auto p-8 space-y-8">
        {/* TAB 1: STUDENTS DIRECTORY */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Students & Attendance Directory</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Manage enrolled practitioners, check-in histories, and active memberships.</p>
              </div>
              <button
                onClick={() => showToast("Add Student Dialog Opened")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Add Student
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1E9E2] shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name, email, or phone..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-[#CEDECF] bg-white text-slate-700"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4F7F4] border-b border-[#E1E9E2] text-[#1b4332] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-4">Practitioner Name</th>
                      <th className="px-6 py-4">Active Class Pass</th>
                      <th className="px-6 py-4 text-center">Classes Attended</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E9E2]">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F9FAF9] transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#0C2417] text-sm">{s.name}</p>
                          <p className="text-[11px] text-slate-500">{s.email}</p>
                          <p className="text-[10px] text-slate-400">{s.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800">{s.plan}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-[#1b4332] bg-[#E8F0E9] px-2.5 py-1 rounded-full text-xs">
                            {s.attended} / {s.total} Sessions
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleAttendance(s.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E8F0E9] hover:bg-[#cedecf] text-[#0C2417] transition"
                          >
                            Mark Today
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS BATCHES & SCHEDULES */}
        {activeTab === "classes-plans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Class Batches & Recurrence Rules</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Configure your weekly scheduled classes and automated Zoom meeting links.</p>
              </div>
              <button
                onClick={() => showToast("New Class Batch Modal Opened")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Create Class Batch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-[#E8F0E9] text-[#1b4332]">
                    Group • Hatha Yoga
                  </span>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                    Rolling 30d Active
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0C2417]">Morning Hatha Flow</h3>
                <p className="text-xs text-slate-600">Daily alignment, Surya Namaskar, and breathwork. 60 Mins.</p>

                <div className="p-3 bg-[#F4F7F4] rounded-2xl border border-[#E1E9E2] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weekly Schedule:</span>
                    <span className="font-bold text-[#0C2417]">Mon, Wed, Fri @ 07:00 AM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Instructor:</span>
                    <span className="font-bold text-[#0C2417]">Sahil Sharma (Lead Guru)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Video Room:</span>
                    <span className="font-mono text-indigo-600 truncate max-w-[200px]">https://meet.progressrooms.com/sahil-flow</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-800">₹2,500 / Month</span>
                  <button
                    onClick={() => showToast("Edit Schedule Opened")}
                    className="text-xs font-bold text-[#1b4332] hover:underline"
                  >
                    Edit Batch Settings →
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-[#E8F0E9] text-[#1b4332]">
                    Group • Aerial Yoga
                  </span>
                  <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                    Rolling 30d Active
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#0C2417]">Aerial Yoga Conditioning</h3>
                <p className="text-xs text-slate-600">Suspended silks conditioning, core power, and decompression. 60 Mins.</p>

                <div className="p-3 bg-[#F4F7F4] rounded-2xl border border-[#E1E9E2] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weekly Schedule:</span>
                    <span className="font-bold text-[#0C2417]">Tue, Thu @ 06:00 PM IST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Instructor:</span>
                    <span className="font-bold text-[#0C2417]">Ananya Sen (Aerial Specialist)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Video Room:</span>
                    <span className="font-mono text-indigo-600 truncate max-w-[200px]">https://meet.progressrooms.com/ananya-aerial</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-bold text-slate-800">₹3,500 / Month</span>
                  <button
                    onClick={() => showToast("Edit Schedule Opened")}
                    className="text-xs font-bold text-[#1b4332] hover:underline"
                  >
                    Edit Batch Settings →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEMBERSHIPS & PASSES */}
        {activeTab === "subscriptions-manager" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Memberships & Class Passes</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Prepaid plans, credit packages, and rolling monthly access configurations.</p>
              </div>
              <button
                onClick={() => showToast("New Membership Pass Created")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Create Membership Tier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#E8F0E9] text-[#1b4332]">
                  Monthly Pass
                </span>
                <h3 className="text-lg font-bold text-[#0C2417]">Morning Hatha Unlimited</h3>
                <p className="text-3xl font-black text-[#0C2417]">₹2,500 <span className="text-xs font-normal text-slate-500">/ 30 Days</span></p>
                <p className="text-xs text-slate-600">Access to all Mon/Wed/Fri 7 AM live sessions with Zoom unlocks.</p>
                <div className="text-[11px] text-slate-500 border-t pt-3">
                  <span className="font-bold text-[#1b4332]">14</span> active practitioners on this pass
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#E8F0E9] text-[#1b4332]">
                  10-Class Package
                </span>
                <h3 className="text-lg font-bold text-[#0C2417]">Aerial Silks 10-Class Pack</h3>
                <p className="text-3xl font-black text-[#0C2417]">₹4,500 <span className="text-xs font-normal text-slate-500">/ 60 Days</span></p>
                <p className="text-xs text-slate-600">10 credits valid for any Aerial conditioning session. Automatic credit decrement.</p>
                <div className="text-[11px] text-slate-500 border-t pt-3">
                  <span className="font-bold text-[#1b4332]">6</span> active practitioners on this pass
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-[#E8F0E9] text-[#1b4332]">
                  Single Session
                </span>
                <h3 className="text-lg font-bold text-[#0C2417]">Drop-in Class Pass</h3>
                <p className="text-3xl font-black text-[#0C2417]">₹400 <span className="text-xs font-normal text-slate-500">/ Drop-in</span></p>
                <p className="text-xs text-slate-600">Single attendance access for weekend workshops or trial classes.</p>
                <div className="text-[11px] text-slate-500 border-t pt-3">
                  <span className="font-bold text-[#1b4332]">2</span> active practitioners on this pass
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ATTENDANCE TRACKER */}
        {activeTab === "attendance-tracker" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Daily Attendance Tracker</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Select a scheduled occurrence and mark attendance with one click.</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedClassForAttendance}
                  onChange={(e) => setSelectedClassForAttendance(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs border border-[#CEDECF] bg-white font-semibold text-[#0C2417]"
                >
                  <option value="sess-1">Morning Hatha Flow (Today, 07:00 AM)</option>
                  <option value="sess-2">Aerial Yoga Conditioning (Yesterday, 06:00 PM)</option>
                </select>
                <button
                  onClick={() => showToast("All unmarked students set to Attended")}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#133623] text-white hover:bg-[#0C2417] transition"
                >
                  Mark All Present
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm divide-y divide-[#E1E9E2]">
              {studentsList.map((s) => {
                const isAttended = attendanceRecords[s.id] === "ATTENDED";
                return (
                  <div key={s.id} className="p-5 flex items-center justify-between hover:bg-[#F9FAF9] transition">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleAttendance(s.id)}
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isAttended ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isAttended ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </button>
                      <div>
                        <h4 className="font-bold text-sm text-[#0C2417]">{s.name}</h4>
                        <p className="text-[11px] text-slate-500">{s.plan}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAttended ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                      }`}>
                        {isAttended ? "ATTENDED" : "ABSENT"}
                      </span>
                      <button
                        onClick={() => toggleAttendance(s.id)}
                        className="text-xs text-[#1b4332] font-semibold hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: STUDENT QUERIES */}
        {activeTab === "queries-manager" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Student Support & Queries</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Answer practitioner questions, rescheduling requests, and general inquiries.</p>
            </div>

            <div className="space-y-4">
              {queries.map((q) => (
                <div key={q.id} className="p-6 rounded-3xl bg-white border border-[#E1E9E2] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0C2417]">{q.student}</h4>
                      <p className="text-[11px] text-slate-500">{q.email} • {q.date}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      q.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-[#F4F7F4] p-3 rounded-2xl border border-[#CEDECF]">
                    "{q.question}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => showToast(`Reply sent to ${q.student}`)}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#133623] text-white hover:bg-[#0C2417] transition"
                    >
                      Reply via Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ANALYTICS & REVENUE */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Analytics & Revenue</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Overview of monthly revenue, attendance rates, and retention.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              <div className="p-5 rounded-3xl bg-white border border-[#E1E9E2] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#81A882]">Total Revenue</span>
                <p className="text-2xl font-black text-[#0C2417] mt-1">₹45,000</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">+18% vs last month</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E1E9E2] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#81A882]">Active Practitioners</span>
                <p className="text-2xl font-black text-[#0C2417] mt-1">20</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">100% capacity filled</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E1E9E2] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#81A882]">Attendance Rate</span>
                <p className="text-2xl font-black text-[#0C2417] mt-1">92.4%</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">Excellent commitment</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E1E9E2] shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#81A882]">Platform Subscription</span>
                <p className="text-2xl font-black text-[#0C2417] mt-1">Starter</p>
                <p className="text-[10px] text-[#2f6a45] font-semibold mt-1">30-day trial active</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS & WEBSITE */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Settings & Website Preview</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Manage your public SSR website link, studio branding, and timezone.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#0C2417]">Public Website Link</h3>
              <div className="flex items-center justify-between p-4 bg-[#F4F7F4] rounded-2xl border border-[#CEDECF]">
                <div>
                  <p className="text-xs font-mono font-bold text-[#0C2417]">https://progressrooms.com/sahil-yoga-studio</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Live Server-Side Rendered landing page.</p>
                </div>
                <Link
                  href="/sahil-yoga-studio"
                  target="_blank"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#133623] text-white hover:bg-[#0C2417] transition flex items-center gap-1.5"
                >
                  <span>Open Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[#0C2417]">Theme & Sanctuary Appearance</h3>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-[#0C2417] border border-[#2D7A58]" />
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Nature Forest & Sage Palette (Active)</p>
                  <p className="text-[10px] text-slate-500">Serene sanctuary aesthetic configured across all student and admin views.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
