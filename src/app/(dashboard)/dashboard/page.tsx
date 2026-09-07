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
  ChevronRight,
  AlertTriangle,
  X,
  ChevronLeft
} from "lucide-react";
import { AttendanceCalendar, CalendarSessionEvent } from "@/components/AttendanceCalendar";

type AdminTab =
  | "students"
  | "classes-plans"
  | "subscriptions-manager"
  | "attendance-tracker"
  | "queries-manager"
  | "analytics"
  | "settings";

interface ClassBatch {
  id: string;
  name: string;
  classType: string;
  instructor: string;
  days: string[];
  startTime: string;
  endTime: string;
  capacity: number;
  price: string;
  meetingUrl: string;
  status: "ACTIVE" | "PAUSED";
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  attended: number;
  total: number;
  status: "ACTIVE" | "EXPIRING_SOON";
}

const DEFAULT_BATCHES: ClassBatch[] = [
  {
    id: "batch-1",
    name: "Morning Hatha Flow",
    classType: "Hatha Yoga",
    instructor: "Lead Instructor (Yoga Guide)",
    days: ["Mon", "Wed", "Fri"],
    startTime: "07:00",
    endTime: "08:00",
    capacity: 25,
    price: "₹2,500",
    meetingUrl: "https://meet.progressrooms.com/morning-hatha",
    status: "ACTIVE"
  },
  {
    id: "batch-2",
    name: "Aerial Yoga Conditioning",
    classType: "Aerial Yoga",
    instructor: "Ananya Sen (Aerial Specialist)",
    days: ["Tue", "Thu"],
    startTime: "18:00",
    endTime: "19:00",
    capacity: 12,
    price: "₹3,500",
    meetingUrl: "https://meet.progressrooms.com/ananya-aerial",
    status: "ACTIVE"
  },
  {
    id: "batch-3",
    name: "Meditation & Breathwork",
    classType: "Meditation",
    instructor: "Lead Instructor (Yoga Guide)",
    days: ["Sun"],
    startTime: "08:30",
    endTime: "09:30",
    capacity: 30,
    price: "₹1,200",
    meetingUrl: "https://meet.progressrooms.com/sunday-breath",
    status: "ACTIVE"
  }
];

const INITIAL_STUDENTS: Student[] = [
  { id: "student-1", name: "Aarav Patel", email: "aarav.patel@gmail.com", phone: "+91 98765 43210", plan: "Morning Hatha Flow (Monthly)", attended: 8, total: 12, status: "ACTIVE" },
  { id: "student-2", name: "Pooja Sharma", email: "pooja.sharma@outlook.com", phone: "+91 98765 43211", plan: "Aerial Yoga Conditioning", attended: 4, total: 8, status: "ACTIVE" },
  { id: "student-3", name: "Rohan Verma", email: "rohan.verma@yahoo.com", phone: "+91 98765 43212", plan: "Morning Hatha Flow (Monthly)", attended: 11, total: 12, status: "EXPIRING_SOON" },
  { id: "student-4", name: "Meera Nair", email: "meera.nair@gmail.com", phone: "+91 98765 43213", plan: "Aerial Yoga Conditioning", attended: 6, total: 8, status: "ACTIVE" },
  { id: "student-5", name: "Vikram Iyer", email: "vikram.iyer@gmail.com", phone: "+91 98765 43214", plan: "Meditation & Breathwork", attended: 3, total: 4, status: "ACTIVE" },
  { id: "student-6", name: "Ananya Desai", email: "ananya.desai@gmail.com", phone: "+91 98765 43215", plan: "Morning Hatha Flow (Monthly)", attended: 10, total: 12, status: "ACTIVE" },
  { id: "student-7", name: "Kabir Mehta", email: "kabir.mehta@hotmail.com", phone: "+91 98765 43216", plan: "Aerial Yoga Conditioning", attended: 7, total: 8, status: "EXPIRING_SOON" },
  { id: "student-8", name: "Isha Kapoor", email: "isha.kapoor@gmail.com", phone: "+91 98765 43217", plan: "Meditation & Breathwork", attended: 4, total: 4, status: "EXPIRING_SOON" },
  { id: "student-9", name: "Siddharth Rao", email: "siddharth.rao@gmail.com", phone: "+91 98765 43218", plan: "Morning Hatha Flow (Monthly)", attended: 5, total: 12, status: "ACTIVE" },
  { id: "student-10", name: "Tara Sundaram", email: "tara.sundaram@gmail.com", phone: "+91 98765 43219", plan: "Aerial Yoga Conditioning", attended: 2, total: 8, status: "ACTIVE" },
  { id: "student-11", name: "Aditya Joshi", email: "aditya.joshi@gmail.com", phone: "+91 98765 43220", plan: "Morning Hatha Flow (Monthly)", attended: 9, total: 12, status: "ACTIVE" },
  { id: "student-12", name: "Kavya Menon", email: "kavya.menon@outlook.com", phone: "+91 98765 43221", plan: "Aerial Yoga Conditioning", attended: 5, total: 8, status: "ACTIVE" },
  { id: "student-13", name: "Nikhil Chawla", email: "nikhil.chawla@gmail.com", phone: "+91 98765 43222", plan: "Meditation & Breathwork", attended: 2, total: 4, status: "ACTIVE" },
  { id: "student-14", name: "Divya Nambiar", email: "divya.nambiar@gmail.com", phone: "+91 98765 43223", plan: "Morning Hatha Flow (Monthly)", attended: 12, total: 12, status: "EXPIRING_SOON" },
  { id: "student-15", name: "Arjun Reddy", email: "arjun.reddy@gmail.com", phone: "+91 98765 43224", plan: "Aerial Yoga Conditioning", attended: 3, total: 8, status: "ACTIVE" },
  { id: "student-16", name: "Sneha Mukherjee", email: "sneha.mukherjee@gmail.com", phone: "+91 98765 43225", plan: "Morning Hatha Flow (Monthly)", attended: 7, total: 12, status: "ACTIVE" },
  { id: "student-17", name: "Rishi Saxena", email: "rishi.saxena@gmail.com", phone: "+91 98765 43226", plan: "Meditation & Breathwork", attended: 1, total: 4, status: "ACTIVE" },
  { id: "student-18", name: "Prerna Roy", email: "prerna.roy@gmail.com", phone: "+91 98765 43227", plan: "Aerial Yoga Conditioning", attended: 6, total: 8, status: "ACTIVE" },
  { id: "student-19", name: "Manish Agarwal", email: "manish.agarwal@gmail.com", phone: "+91 98765 43228", plan: "Morning Hatha Flow (Monthly)", attended: 11, total: 12, status: "EXPIRING_SOON" },
  { id: "student-20", name: "Zoya Khan", email: "zoya.khan@gmail.com", phone: "+91 98765 43229", plan: "Aerial Yoga Conditioning", attended: 4, total: 8, status: "ACTIVE" }
];

const DEFAULT_CALENDAR_EVENTS: CalendarSessionEvent[] = [
  { id: "evt-1", date: "2026-09-02", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Aarav Patel", studentEmail: "aarav.patel@gmail.com", status: "PRESENT", remarks: "Great alignment on warrior poses" },
  { id: "evt-2", date: "2026-09-02", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Rohan Verma", studentEmail: "rohan.verma@yahoo.com", status: "PRESENT" },
  { id: "evt-3", date: "2026-09-03", time: "06:00 PM", sessionTitle: "Aerial Conditioning", studentName: "Pooja Sharma", studentEmail: "pooja.sharma@outlook.com", status: "PRESENT", remarks: "Mastered inverted butterfly" },
  { id: "evt-4", date: "2026-09-03", time: "06:00 PM", sessionTitle: "Aerial Conditioning", studentName: "Meera Nair", studentEmail: "meera.nair@gmail.com", status: "PRESENT" },
  { id: "evt-5", date: "2026-09-04", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Aarav Patel", studentEmail: "aarav.patel@gmail.com", status: "PRESENT" },
  { id: "evt-6", date: "2026-09-05", time: "08:30 AM", sessionTitle: "Meditation & Pranayama", studentName: "Vikram Iyer", studentEmail: "vikram.iyer@gmail.com", status: "PRESENT" },
  { id: "evt-7", date: "2026-09-07", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Rohan Verma", studentEmail: "rohan.verma@yahoo.com", status: "ABSENT", remarks: "Informed traveling for work" },
  { id: "evt-8", date: "2026-09-07", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Ananya Desai", studentEmail: "ananya.desai@gmail.com", status: "PRESENT" },
  { id: "evt-9", date: "2026-09-08", time: "06:00 PM", sessionTitle: "Aerial Conditioning", studentName: "Kabir Mehta", studentEmail: "kabir.mehta@hotmail.com", status: "PRESENT" },
  { id: "evt-10", date: "2026-09-09", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Siddharth Rao", studentEmail: "siddharth.rao@gmail.com", status: "PRESENT" },
  { id: "evt-11", date: "2026-09-11", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Aarav Patel", studentEmail: "aarav.patel@gmail.com", status: "PRESENT" },
  { id: "evt-12", date: "2026-09-15", time: "06:00 PM", sessionTitle: "Aerial Conditioning", studentName: "Pooja Sharma", studentEmail: "pooja.sharma@outlook.com", status: "PRESENT" },
  { id: "evt-13", date: "2026-09-18", time: "07:00 AM", sessionTitle: "Morning Hatha Flow", studentName: "Aditya Joshi", studentEmail: "aditya.joshi@gmail.com", status: "PRESENT" },
  { id: "evt-14", date: "2026-09-22", time: "06:00 PM", sessionTitle: "Aerial Conditioning", studentName: "Kavya Menon", studentEmail: "kavya.menon@outlook.com", status: "PRESENT" }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("students");
  const [toast, setToast] = useState<string | null>(null);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Batches state
  const [batches, setBatches] = useState<ClassBatch[]>(DEFAULT_BATCHES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New batch form state
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchType, setNewBatchType] = useState("Vinyasa Flow");
  const [newBatchInstructor, setNewBatchInstructor] = useState("Lead Instructor (Yoga Guide)");
  const [newBatchDays, setNewBatchDays] = useState<string[]>(["Tue", "Thu"]);
  const [newBatchStart, setNewBatchStart] = useState("17:00");
  const [newBatchEnd, setNewBatchEnd] = useState("18:00");
  const [newBatchCap, setNewBatchCap] = useState(15);
  const [newBatchPrice, setNewBatchPrice] = useState("2,800");
  const [newBatchUrl, setNewBatchUrl] = useState("https://meet.progressrooms.com/sunset-flow");

  // Conflict warning
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Filter & Pagination states for Students
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("ALL");
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Attendance states (Calendar vs Checklist)
  const [attendanceView, setAttendanceView] = useState<"calendar" | "checklist">("calendar");
  const [calendarEvents, setCalendarEvents] = useState<CalendarSessionEvent[]>(DEFAULT_CALENDAR_EVENTS);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBatchId, setSelectedBatchId] = useState("batch-1");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "ATTENDED" | "ABSENT">>({
    "student-1": "ATTENDED",
    "student-2": "ATTENDED",
    "student-3": "ABSENT",
    "student-4": "ATTENDED",
    "student-5": "ATTENDED",
  });

  // Query state
  const [queries, setQueries] = useState([
    { id: "q-1", student: "Aarav Patel", email: "aarav.patel@gmail.com", question: "Can I reschedule my Wednesday 7 AM Hatha session to Friday?", status: "RESOLVED", date: "Today" },
    { id: "q-2", student: "Pooja Sharma", email: "pooja.sharma@outlook.com", question: "What suspension hammock do you recommend for home aerial yoga practice?", status: "UNANSWERED", date: "Yesterday" }
  ]);

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pr_user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      const storedBatches = localStorage.getItem("pr_studio_batches");
      if (storedBatches) {
        setBatches(JSON.parse(storedBatches));
      }
      const storedAttendance = localStorage.getItem("pr_attendance_records");
      if (storedAttendance) {
        setAttendanceRecords(JSON.parse(storedAttendance));
      }
      const storedStudents = localStorage.getItem("pr_students_list");
      if (storedStudents) {
        setStudents(JSON.parse(storedStudents));
      }
      const storedCalendarEvents = localStorage.getItem("pr_calendar_events");
      if (storedCalendarEvents) {
        setCalendarEvents(JSON.parse(storedCalendarEvents));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Check double-booking conflicts whenever instructor, days, or time range changes
  useEffect(() => {
    const conflict = batches.find((b) => {
      if (b.instructor !== newBatchInstructor) return false;
      const commonDays = b.days.filter((d) => newBatchDays.includes(d));
      if (commonDays.length === 0) return false;
      // Overlap check
      const startOverlap = newBatchStart < b.endTime && newBatchEnd > b.startTime;
      return startOverlap;
    });

    if (conflict) {
      setConflictWarning(
        `⚠️ Scheduling Warning: Instructor ${newBatchInstructor.split(" ")[0]} already teaches "${conflict.name}" on ${conflict.days.join("/")} between ${conflict.startTime} and ${conflict.endTime}.`
      );
    } else {
      setConflictWarning(null);
    }
  }, [newBatchInstructor, newBatchDays, newBatchStart, newBatchEnd, batches]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.removeItem("pr_access_token");
    localStorage.removeItem("pr_user");
    router.push("/login");
  };

  const toggleDaySelection = (day: string) => {
    if (newBatchDays.includes(day)) {
      if (newBatchDays.length > 1) {
        setNewBatchDays(newBatchDays.filter((d) => d !== day));
      }
    } else {
      setNewBatchDays([...newBatchDays, day]);
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim()) {
      showToast("Please enter a batch name");
      return;
    }

    const newEntry: ClassBatch = {
      id: "batch-" + Date.now(),
      name: newBatchName.trim(),
      classType: newBatchType,
      instructor: newBatchInstructor,
      days: newBatchDays,
      startTime: newBatchStart,
      endTime: newBatchEnd,
      capacity: Number(newBatchCap),
      price: `₹${newBatchPrice}`,
      meetingUrl: newBatchUrl || "https://meet.progressrooms.com/" + newBatchName.toLowerCase().replace(/\s+/g, "-"),
      status: "ACTIVE"
    };

    const updated = [newEntry, ...batches];
    setBatches(updated);
    try {
      localStorage.setItem("pr_studio_batches", JSON.stringify(updated));
    } catch (err) {}

    // Reset form & close modal
    setNewBatchName("");
    setIsCreateModalOpen(false);
    showToast(`🌿 New Batch "${newEntry.name}" created! 30-day timetable generated.`);
  };

  const toggleAttendance = (studentId: string) => {
    const current = attendanceRecords[studentId] || "ABSENT";
    const next: "ATTENDED" | "ABSENT" = current === "ATTENDED" ? "ABSENT" : "ATTENDED";
    const updated: Record<string, "ATTENDED" | "ABSENT"> = { ...attendanceRecords, [studentId]: next };
    setAttendanceRecords(updated);

    // Update student attended count reactively
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        const diff = next === "ATTENDED" ? 1 : -1;
        return { ...s, attended: Math.max(0, s.attended + diff) };
      }
      return s;
    });
    setStudents(updatedStudents);

    try {
      localStorage.setItem("pr_attendance_records", JSON.stringify(updated));
      localStorage.setItem("pr_students_list", JSON.stringify(updatedStudents));
    } catch (err) {}

    showToast(`Attendance updated: ${next}`);
  };

  const handleMarkAll = (status: "ATTENDED" | "ABSENT") => {
    const updated: Record<string, "ATTENDED" | "ABSENT"> = { ...attendanceRecords };
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);

    const updatedStudents = students.map((s) => ({
      ...s,
      attended: status === "ATTENDED" ? Math.min(s.total, s.attended + 1) : s.attended
    }));
    setStudents(updatedStudents);

    try {
      localStorage.setItem("pr_attendance_records", JSON.stringify(updated));
      localStorage.setItem("pr_students_list", JSON.stringify(updatedStudents));
    } catch (err) {}

    showToast(`All students marked as ${status}`);
  };

  const resolveQuery = (id: string) => {
    setQueries(queries.map(q => q.id === id ? { ...q, status: "RESOLVED" } : q));
    showToast("Query marked as resolved");
  };

  const handleUpdateCalendarEvents = (updated: CalendarSessionEvent[]) => {
    setCalendarEvents(updated);
    try {
      localStorage.setItem("pr_calendar_events", JSON.stringify(updated));
    } catch (e) {}
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isInstructor = currentUser?.role === "INSTRUCTOR";
  const orgTitle = isSuperAdmin
    ? "ProgressRooms HQ"
    : (isInstructor ? "Tranquil Flow Sanctuary" : (currentUser?.organization_name || "Tranquil Flow Sanctuary"));
  const roleSubtitle = isSuperAdmin
    ? "Platform Super Admin"
    : (isInstructor ? "Instructor View • My Batches" : "Studio Operations");
  const userDisplayName = currentUser?.full_name || (isSuperAdmin ? "Platform Super Admin" : (isInstructor ? "Lead Instructor" : "Studio Owner"));
  const userDisplayEmail = currentUser?.email || (isSuperAdmin ? "admin@progressrooms.com" : (isInstructor ? "instructor@yogastudio.com" : "owner@yogastudio.com"));
  const userInitials = isSuperAdmin ? "SA" : (isInstructor ? "IN" : "SO");

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.phone.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus = studentStatusFilter === "ALL" || s.status === studentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#FAF7F2] text-[#212121] font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0C2417] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#2D7A58] flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <span>🌿</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Nature Dark Emerald Sidebar */}
      <aside
        style={{
          background: "linear-gradient(180deg, #0C2417 0%, #133623 50%, #0D291A 100%)",
        }}
        className="w-72 flex-shrink-0 flex flex-col justify-between p-5 text-white shadow-2xl z-20 nature-sidebar"
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
                  {orgTitle}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] block mt-0.5">
                  {roleSubtitle}
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
              className={`nav-item ${activeTab === "students" ? "active" : ""}`}
            >
              <span className="nav-icon">👥</span>
              <span>Students & Directory</span>
            </button>

            <button
              onClick={() => setActiveTab("classes-plans")}
              className={`nav-item ${activeTab === "classes-plans" ? "active" : ""}`}
            >
              <span className="nav-icon">✨</span>
              <span>Class Batches & Schedules</span>
            </button>

            <button
              onClick={() => setActiveTab("subscriptions-manager")}
              className={`nav-item ${activeTab === "subscriptions-manager" ? "active" : ""}`}
            >
              <span className="nav-icon">💳</span>
              <span>Memberships & Passes</span>
            </button>

            <button
              onClick={() => setActiveTab("attendance-tracker")}
              className={`nav-item ${activeTab === "attendance-tracker" ? "active" : ""}`}
            >
              <span className="nav-icon">🗓️</span>
              <span>Attendance Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab("queries-manager")}
              className={`nav-item ${activeTab === "queries-manager" ? "active" : ""}`}
            >
              <span className="nav-icon">💬</span>
              <span>Student Support Queries</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
            >
              <span className="nav-icon">📊</span>
              <span>Analytics & Revenue</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
            >
              <span className="nav-icon">⚙️</span>
              <span>Settings & Website</span>
            </button>
          </nav>
        </div>

        {/* Bottom Pinned User & Sign Out */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-3 px-1">
            <div className="h-8 w-8 rounded-full bg-[#81A882] text-[#0C2417] font-bold text-xs flex items-center justify-center">
              {userInitials}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{userDisplayName}</p>
              <p className="text-[10px] text-[#81A882] truncate">{userDisplayEmail}</p>
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

      {/* Main Sanctuary Dashboard Viewport */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* TAB 1: STUDENTS & DIRECTORY */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Enrolled Student Directory</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Manage your active yogis, track attendance counts, and review membership status.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => showToast("Exporting Student Roster CSV...")}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                >
                  Export Roster (CSV)
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1E9E2] shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name, email, or phone..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={studentStatusFilter}
                  onChange={(e) => {
                    setStudentStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
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
                    {paginatedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                          No practitioners found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((s) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls Bar */}
              <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E1E9E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> yogis
                  </span>

                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-slate-400">Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 rounded-lg border border-[#CEDECF] bg-white font-medium text-[#0C2417]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs transition ${
                          safeCurrentPage === pageNum
                            ? "bg-[#133623] text-white shadow-sm"
                            : "bg-white border border-[#CEDECF] text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CLASS BATCHES & SCHEDULES (FEAT-05) */}
        {activeTab === "classes-plans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Class Batches & Recurrence Rules</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Configure your weekly scheduled classes and automated Zoom meeting links.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="h-4 w-4" /> Create Class Batch
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {batches.map((batch) => (
                <div key={batch.id} className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4 hover:border-[#81A882] transition">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-[#E8F0E9] text-[#1b4332]">
                      {batch.classType}
                    </span>
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                      Rolling 30d Active
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0C2417]">{batch.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Capacity: {batch.capacity} yogis max</p>
                  </div>

                  <div className="p-3.5 bg-[#F4F7F4] rounded-2xl border border-[#E1E9E2] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weekly Schedule:</span>
                      <span className="font-bold text-[#0C2417]">{batch.days.join(", ")} @ {batch.startTime} - {batch.endTime} IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Instructor:</span>
                      <span className="font-bold text-[#0C2417]">{batch.instructor}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Live Video Room:</span>
                      <span className="font-mono text-emerald-700 font-semibold truncate max-w-[200px]">{batch.meetingUrl}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F0F4F0]">
                    <span className="text-xs font-bold text-slate-800">{batch.price} / Month</span>
                    <button
                      onClick={() => showToast(`Editing settings for ${batch.name}`)}
                      className="text-xs font-bold text-[#1b4332] hover:underline"
                    >
                      Edit Batch Settings →
                    </button>
                  </div>
                </div>
              ))}
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

        {/* TAB 4: ATTENDANCE TRACKER (FEAT-06) */}
        {activeTab === "attendance-tracker" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Attendance Tracker</h1>
                <p className="text-xs text-[#40514E] mt-0.5">
                  Track student attendance via interactive monthly calendar or daily batch checklists.
                </p>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-1.5 p-1 bg-[#E8F0E9] rounded-2xl border border-[#CEDECF]">
                <button
                  type="button"
                  onClick={() => setAttendanceView("calendar")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    attendanceView === "calendar"
                      ? "bg-[#133623] text-white shadow-sm"
                      : "text-[#275539] hover:bg-white/60"
                  }`}
                >
                  <span>🗓️</span>
                  <span>Monthly Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendanceView("checklist")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    attendanceView === "checklist"
                      ? "bg-[#133623] text-white shadow-sm"
                      : "text-[#275539] hover:bg-white/60"
                  }`}
                >
                  <span>📋</span>
                  <span>Daily Checklist</span>
                </button>
              </div>
            </div>

            {/* VIEW 1: MONTHLY INTERACTIVE CALENDAR */}
            {attendanceView === "calendar" && (
              <AttendanceCalendar
                events={calendarEvents}
                onUpdateEvents={handleUpdateCalendarEvents}
                onToast={showToast}
              />
            )}

            {/* VIEW 2: DAILY CHECKLIST */}
            {attendanceView === "checklist" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#CEDECF]">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs border border-[#CEDECF] bg-white font-semibold text-[#0C2417]"
                    />
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs border border-[#CEDECF] bg-white font-semibold text-[#0C2417]"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.days.join("/")} @ {b.startTime})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAll("ATTENDED")}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#133623] text-white hover:bg-[#0C2417] transition"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll("ABSENT")}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#CEDECF] text-slate-700 hover:bg-slate-50 transition"
                    >
                      Clear Roster
                    </button>
                  </div>
                </div>

                {/* Selected Session Info Banner */}
                <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center font-bold">
                      🗓️
                    </div>
                    <div>
                      <span className="font-bold text-[#0C2417] text-sm">{selectedBatch?.name}</span>
                      <span className="text-slate-500 ml-2">({selectedBatch?.instructor} • {selectedBatch?.startTime} - {selectedBatch?.endTime} IST)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600">Date:</span>
                    <span className="font-mono bg-[#F4F7F4] px-2 py-0.5 rounded text-[#0C2417] font-bold">{selectedDate}</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm divide-y divide-[#E1E9E2]">
                  {students.slice(0, 10).map((s) => {
                    const isAttended = attendanceRecords[s.id] === "ATTENDED";
                    return (
                      <div key={s.id} className="p-5 flex items-center justify-between hover:bg-[#F9FAF9] transition">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleAttendance(s.id)}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                              isAttended ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {isAttended ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                          </button>
                          <div>
                            <h4 className="font-bold text-sm text-[#0C2417]">{s.name}</h4>
                            <p className="text-[11px] text-slate-500">{s.plan} • {s.attended}/{s.total} Sessions Logged</p>
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
                            Change Status
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STUDENT QUERIES */}
        {activeTab === "queries-manager" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Student Support & Queries</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Manage questions from students submitted through the public website or student sanctuary portal.</p>
            </div>

            <div className="space-y-4">
              {queries.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0C2417]">{q.student}</span>
                      <span className="text-xs text-slate-500">({q.email})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#263328] bg-[#F4F7F4] p-3 rounded-xl border border-[#E1E9E2]">{q.question}</p>
                    <span className="text-[10px] text-slate-400">Received {q.date}</span>
                  </div>

                  {q.status === "UNANSWERED" && (
                    <button
                      onClick={() => resolveQuery(q.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#133623] hover:bg-[#0C2417] text-white transition"
                    >
                      Mark Resolved
                    </button>
                  )}
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
              <p className="text-xs text-[#40514E] mt-0.5">Real-time attendance rates, monthly recurring revenue, and student retention metrics.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500">Monthly Revenue (MRR)</span>
                <h3 className="text-3xl font-black text-[#0C2417]">₹62,000</h3>
                <p className="text-[11px] text-emerald-600 font-semibold">↑ +18% from last month</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500">Active Students</span>
                <h3 className="text-3xl font-black text-[#0C2417]">{students.length}</h3>
                <p className="text-[11px] text-emerald-600 font-semibold">100% active retention</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500">Overall Attendance Rate</span>
                <h3 className="text-3xl font-black text-[#0C2417]">91.4%</h3>
                <p className="text-[11px] text-emerald-600 font-semibold">↑ Higher than industry avg (78%)</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500">Active Recurring Batches</span>
                <h3 className="text-3xl font-black text-[#0C2417]">{batches.length}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Weekly scheduled sessions</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS & WEBSITE */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Settings & Website Preview</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Customize studio branding, domain names, and public SSR teacher landing page.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[#E1E9E2]">
                <div>
                  <h4 className="font-bold text-sm text-[#0C2417]">Public Studio Page</h4>
                  <p className="text-xs text-slate-500">Your live SSR website powered by Next.js App Router</p>
                </div>
                <Link
                  href="/sahil-yoga-studio"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#133623] hover:bg-[#0C2417] text-white shadow-sm transition"
                >
                  <span>Open Public Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Studio Name</label>
                  <input
                    type="text"
                    defaultValue="Sahil Yoga Studio"
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Timezone</label>
                  <input
                    type="text"
                    defaultValue="Asia/Kolkata (IST)"
                    disabled
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F4F7F4] text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE CLASS BATCH MODAL (FEAT-05) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CEDECF] shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E9E2]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Create New Class Batch</h3>
                  <p className="text-xs text-slate-500">Configure recurring schedule rules and automated meeting room.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conflict Warning Banner */}
            {conflictWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Double-Booking Warning</strong>
                  <span>{conflictWarning}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Batch / Session Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Vinyasa Flow, Aerial Silks Beginner"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Class Type
                  </label>
                  <select
                    value={newBatchType}
                    onChange={(e) => setNewBatchType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white"
                  >
                    <option value="Hatha Yoga">Hatha Yoga</option>
                    <option value="Aerial Yoga">Aerial Yoga</option>
                    <option value="Vinyasa Flow">Vinyasa Flow</option>
                    <option value="Meditation">Meditation & Pranayama</option>
                    <option value="Pilates">Pilates Conditioning</option>
                    <option value="Workshop">Weekend Intensive Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Assigned Instructor
                  </label>
                  <select
                    value={newBatchInstructor}
                    onChange={(e) => setNewBatchInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white"
                  >
                    <option value="Sahil Sharma (Lead Guru)">Sahil Sharma (Lead Guru)</option>
                    <option value="Ananya Sen (Aerial Specialist)">Ananya Sen (Aerial Specialist)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                  Weekly Recurrence Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => {
                    const isSelected = newBatchDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDaySelection(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? "bg-[#133623] text-white shadow-sm"
                            : "bg-[#F4F7F4] text-slate-700 hover:bg-[#E8F0E9] border border-[#CEDECF]"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newBatchStart}
                    onChange={(e) => setNewBatchStart(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newBatchEnd}
                    onChange={(e) => setNewBatchEnd(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Max Yogis
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newBatchCap}
                    onChange={(e) => setNewBatchCap(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Monthly ₹
                  </label>
                  <input
                    type="text"
                    value={newBatchPrice}
                    onChange={(e) => setNewBatchPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Automated Video / Zoom Meeting URL
                </label>
                <input
                  type="url"
                  placeholder="https://meet.progressrooms.com/your-batch"
                  value={newBatchUrl}
                  onChange={(e) => setNewBatchUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>🌿 Create Batch & Generate Timetable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
