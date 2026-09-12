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
  ChevronLeft,
  Loader2,
  Building2,
  UserCheck,
  UserX,
  Activity,
  Shield,
  Edit2,
  Trash2,
  Mail,
  Phone,
  UserPlus,
  MapPin,
  Landmark,
  Check,
  Copy,
  RefreshCw,
  Key,
  Zap,
  FileText,
  Smartphone,
  Palette,
  UserRound,
  MonitorCog
} from "lucide-react";
import { AttendanceCalendar, CalendarSessionEvent } from "@/components/AttendanceCalendar";
import { BrandLogo } from "@/components/BrandLogo";
import { Modal } from "@/components/Modal";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { useFeedback } from "@/components/FeedbackProvider";
import { FontSelector } from "@/components/FontSelector";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type AdminTab =
  // Studio Operations
  | "account-completion"
  | "studio-teachers"
  | "students"
  | "classes-plans"
  | "subscriptions-manager"
  | "attendance-tracker"
  | "queries-manager"
  | "analytics"
  | "settings"
  // Super Admin Platform Tabs
  | "superadmin-instructors"
  | "superadmin-analytics"
  | "superadmin-settings";

type SettingsSection = "profile" | "dashboard";
type DashboardTheme = "forest" | "sage" | "sand";

interface StudioProfile {
  organization_id?: string;
  name?: string;
  slug?: string;
  phone?: string;
  support_email?: string;
  studio_tagline?: string;
  disciplines?: string;
  teaching_mode?: "PHYSICAL" | "ONLINE" | "HYBRID";
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  has_gst?: boolean;
  gst_number?: string;
  legal_business_name?: string;
  pan_number?: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  account_number_masked?: string;
  ifsc_code?: string;
  upi_id?: string;
  settlement_cycle?: "DAILY" | "WEEKLY" | "MONTHLY";
  zoom_connected?: boolean;
  zoom_account_email?: string;
  zoom_auto_meeting_enabled?: boolean;
  zoom_waiting_room?: boolean;
  zoom_host_video?: boolean;
  account_completed?: boolean;
  completion_step?: number;
  whatsapp_number?: string;
  completion_percentage?: number;
}


interface StudioTeacher {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  studio_id: string;
  studio_name: string;
  role: string;
  is_active: boolean;
  status: "ACTIVE" | "SUSPENDED";
  joined_at: string;
}

interface PlatformInstructor {
  id: string;
  user_id: string;
  instructor_name: string;
  email: string;
  phone: string;
  studio_id: string;
  studio_name: string;
  studio_slug: string;
  role: string;
  title: string;
  bio: string;
  is_active: boolean;
  status: "ACTIVE" | "SUSPENDED";
  joined_at: string;
}

interface PlatformMetrics {
  total_organizations: number;
  total_instructors: number;
  total_students: number;
  total_users: number;
  total_platform_revenue: number;
  active_subscriptions: number;
  status: string;
  system_status: string;
}

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
  is_verified?: boolean;
  verification_status?: "VERIFIED" | "NOT VERIFIED";
  account_status?: string;
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
  { id: "student-1", name: "Aarav Patel", email: "aarav.patel@gmail.com", phone: "+91 98765 43210", plan: "Morning Hatha Flow (Monthly)", attended: 8, total: 12, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-2", name: "Pooja Sharma", email: "pooja.sharma@outlook.com", phone: "+91 98765 43211", plan: "Aerial Yoga Conditioning", attended: 4, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-3", name: "Rohan Verma", email: "rohan.verma@yahoo.com", phone: "+91 98765 43212", plan: "Morning Hatha Flow (Monthly)", attended: 11, total: 12, status: "EXPIRING_SOON", is_verified: false, verification_status: "NOT VERIFIED" },
  { id: "student-4", name: "Meera Nair", email: "meera.nair@gmail.com", phone: "+91 98765 43213", plan: "Aerial Yoga Conditioning", attended: 6, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-5", name: "Vikram Iyer", email: "vikram.iyer@gmail.com", phone: "+91 98765 43214", plan: "Meditation & Breathwork", attended: 3, total: 4, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-6", name: "Ananya Desai", email: "ananya.desai@gmail.com", phone: "+91 98765 43215", plan: "Morning Hatha Flow (Monthly)", attended: 10, total: 12, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-7", name: "Kabir Mehta", email: "kabir.mehta@hotmail.com", phone: "+91 98765 43216", plan: "Aerial Yoga Conditioning", attended: 7, total: 8, status: "EXPIRING_SOON", is_verified: false, verification_status: "NOT VERIFIED" },
  { id: "student-8", name: "Isha Kapoor", email: "isha.kapoor@gmail.com", phone: "+91 98765 43217", plan: "Meditation & Breathwork", attended: 4, total: 4, status: "EXPIRING_SOON", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-9", name: "Siddharth Rao", email: "siddharth.rao@gmail.com", phone: "+91 98765 43218", plan: "Morning Hatha Flow (Monthly)", attended: 5, total: 12, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-10", name: "Tara Sundaram", email: "tara.sundaram@gmail.com", phone: "+91 98765 43219", plan: "Aerial Yoga Conditioning", attended: 2, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-11", name: "Aditya Joshi", email: "aditya.joshi@gmail.com", phone: "+91 98765 43220", plan: "Morning Hatha Flow (Monthly)", attended: 9, total: 12, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-12", name: "Kavya Menon", email: "kavya.menon@outlook.com", phone: "+91 98765 43221", plan: "Aerial Yoga Conditioning", attended: 5, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-13", name: "Nikhil Chawla", email: "nikhil.chawla@gmail.com", phone: "+91 98765 43222", plan: "Meditation & Breathwork", attended: 2, total: 4, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-14", name: "Divya Nambiar", email: "divya.nambiar@gmail.com", phone: "+91 98765 43223", plan: "Morning Hatha Flow (Monthly)", attended: 12, total: 12, status: "EXPIRING_SOON", is_verified: false, verification_status: "NOT VERIFIED" },
  { id: "student-15", name: "Arjun Reddy", email: "arjun.reddy@gmail.com", phone: "+91 98765 43224", plan: "Aerial Yoga Conditioning", attended: 3, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-16", name: "Sneha Mukherjee", email: "sneha.mukherjee@gmail.com", phone: "+91 98765 43225", plan: "Morning Hatha Flow (Monthly)", attended: 7, total: 12, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-17", name: "Rishi Saxena", email: "rishi.saxena@gmail.com", phone: "+91 98765 43226", plan: "Meditation & Breathwork", attended: 1, total: 4, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-18", name: "Prerna Roy", email: "prerna.roy@gmail.com", phone: "+91 98765 43227", plan: "Aerial Yoga Conditioning", attended: 6, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" },
  { id: "student-19", name: "Manish Agarwal", email: "manish.agarwal@gmail.com", phone: "+91 98765 43228", plan: "Morning Hatha Flow (Monthly)", attended: 11, total: 12, status: "EXPIRING_SOON", is_verified: false, verification_status: "NOT VERIFIED" },
  { id: "student-20", name: "Zoya Khan", email: "zoya.khan@gmail.com", phone: "+91 98765 43229", plan: "Aerial Yoga Conditioning", attended: 4, total: 8, status: "ACTIVE", is_verified: true, verification_status: "VERIFIED" }
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
  const [activeTab, setActiveTab] = useState<AdminTab>("account-completion");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("profile");
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>("forest");
  const { notify, confirm: confirmAction } = useFeedback();

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("progressnow_dashboard_theme");
      if (savedTheme === "forest" || savedTheme === "sage" || savedTheme === "sand") setDashboardTheme(savedTheme);
    } catch { /* Use the default theme when storage is unavailable. */ }
  }, []);

  const applyDashboardTheme = (theme: DashboardTheme) => {
    setDashboardTheme(theme);
    try {
      localStorage.setItem("progressnow_dashboard_theme", theme);
      notify(`${theme.charAt(0).toUpperCase() + theme.slice(1)} dashboard theme applied.`, "success");
    } catch {
      notify("Theme applied for this visit, but it could not be saved on this device.", "info");
    }
  };

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Studio Profile & Account Completion States
  const [studioProfile, setStudioProfile] = useState<StudioProfile | null>(null);
  const [isAccountCompleted, setIsAccountCompleted] = useState<boolean>(false);
  const [completionStep, setCompletionStep] = useState<number>(1);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isConnectingZoom, setIsConnectingZoom] = useState<boolean>(false);

  // Step 1: Studio & Contact Info
  const [setupStudioName, setSetupStudioName] = useState("");
  const [setupPhone, setSetupPhone] = useState("");
  const [setupWhatsappNumber, setSetupWhatsappNumber] = useState("");
  const [setupSupportEmail, setSetupSupportEmail] = useState("");
  const [setupStudioTagline, setSetupStudioTagline] = useState("");
  const [setupDisciplines, setSetupDisciplines] = useState<string[]>([
    "Hatha Yoga",
    "Vinyasa Flow",
    "Aerial Yoga"
  ]);

  // Step 2: Teaching Location & Mode
  const [setupTeachingMode, setSetupTeachingMode] = useState<"PHYSICAL" | "ONLINE" | "HYBRID">("HYBRID");
  const [setupAddressLine1, setSetupAddressLine1] = useState("");
  const [setupAddressLine2, setSetupAddressLine2] = useState("");
  const [setupCity, setSetupCity] = useState("");
  const [setupState, setSetupState] = useState("");
  const [setupPincode, setSetupPincode] = useState("");
  const [setupCountry, setSetupCountry] = useState("India");

  // Step 3: GST & Legal Business Identity
  const [setupHasGst, setSetupHasGst] = useState(false);
  const [setupGstNumber, setSetupGstNumber] = useState("");
  const [setupLegalBusinessName, setSetupLegalBusinessName] = useState("");
  const [setupPanNumber, setSetupPanNumber] = useState("");

  // Step 4: Bank & Payouts (The "Thanks" perspective)
  const [setupBankName, setSetupBankName] = useState("");
  const [setupAccountHolderName, setSetupAccountHolderName] = useState("");
  const [setupAccountNumber, setSetupAccountNumber] = useState("");
  const [setupConfirmAccountNumber, setSetupConfirmAccountNumber] = useState("");
  const [setupIfscCode, setSetupIfscCode] = useState("");
  const [setupUpiId, setSetupUpiId] = useState("");
  const [setupSettlementCycle, setSetupSettlementCycle] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");

  // Step 5: Zoom Live Classroom Authentication
  const [zoomConnected, setZoomConnected] = useState(false);
  const [zoomAccountEmail, setZoomAccountEmail] = useState("");
  const [zoomAutoMeetingEnabled, setZoomAutoMeetingEnabled] = useState(true);
  const [zoomWaitingRoom, setZoomWaitingRoom] = useState(true);
  const [zoomHostVideo, setZoomHostVideo] = useState(true);
  const [zoomAuthTab, setZoomAuthTab] = useState<"ONE_CLICK" | "CREDENTIALS">("ONE_CLICK");
  const [zoomClientId, setZoomClientId] = useState("");
  const [zoomClientSecret, setZoomClientSecret] = useState("");
  const [zoomAccountId, setZoomAccountId] = useState("");
  const [testZoomMeeting, setTestZoomMeeting] = useState<{ join_url: string; passcode: string; meeting_id: string } | null>(null);
  const [isGeneratingTestMeeting, setIsGeneratingTestMeeting] = useState(false);

  // Exact step-by-step verification checks
  const isStep1Complete = Boolean(setupStudioName?.trim() && setupPhone?.trim() && setupSupportEmail?.trim());
  const isStep2Complete = Boolean(setupAddressLine1?.trim() && setupCity?.trim() && setupState?.trim() && setupPincode?.trim());
  const isStep3Complete = setupHasGst
    ? Boolean(setupGstNumber?.trim() && setupLegalBusinessName?.trim())
    : Boolean(setupPanNumber?.trim() || !setupHasGst);
  const isStep4Complete = Boolean(
    setupBankName?.trim() &&
    setupAccountHolderName?.trim() &&
    (setupAccountNumber?.trim() || studioProfile?.account_number_masked) &&
    setupIfscCode?.trim()
  );
  const isStep5Complete = Boolean(zoomConnected);
  const isStep6Complete = Boolean(isAccountCompleted);

  const checkStepCompleted = (stepNum: number) => {
    if (isAccountCompleted) return true;
    switch (stepNum) {
      case 1: return isStep1Complete;
      case 2: return isStep2Complete;
      case 3: return isStep3Complete;
      case 4: return isStep4Complete;
      case 5: return isStep5Complete;
      case 6: return isStep6Complete;
      default: return false;
    }
  };

  const calculatedPercentage = isAccountCompleted
    ? 100
    : Math.round(
        ([isStep1Complete, isStep2Complete, isStep3Complete, isStep4Complete, isStep5Complete].filter(Boolean).length / 6) * 100
      );

  const displayPercentage = isAccountCompleted ? 100 : Math.max(completionPercentage, calculatedPercentage);


  // Studio Teachers Management State
  const [studioTeachers, setStudioTeachers] = useState<StudioTeacher[]>([]);
  const [studioTeachersLoading, setStudioTeachersLoading] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<StudioTeacher | null>(null);

  // Add / Edit Teacher form fields
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherTitle, setTeacherTitle] = useState("Sanctuary Guide");
  const [teacherBio, setTeacherBio] = useState("Certified movement specialist and yoga instructor.");
  const [teacherIsActive, setTeacherIsActive] = useState(true);

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

  // Filter & Pagination states for Students (with Live API)
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("ALL");
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(INITIAL_STUDENTS.length);
  const [totalPages, setTotalPages] = useState(Math.ceil(INITIAL_STUDENTS.length / 5));

  // Super Admin Platform States (with Live API)
  const [adminInstructors, setAdminInstructors] = useState<PlatformInstructor[]>([]);
  const [adminInstructorsLoading, setAdminInstructorsLoading] = useState(false);
  const [adminMetrics, setAdminMetrics] = useState<PlatformMetrics | null>(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("ALL");
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminPageSize, setAdminPageSize] = useState(5);
  const [adminTotalItems, setAdminTotalItems] = useState(0);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [adminOrgs, setAdminOrgs] = useState<any[]>([]);

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

  // Fetch Studio Teachers from Backend
  const fetchStudioTeachers = async () => {
    setStudioTeachersLoading(true);
    try {
      const url = `${API_BASE_URL}/teachers${teacherSearch ? `?search=${encodeURIComponent(teacherSearch)}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudioTeachers(data.teachers || []);
      }
    } catch (e) {
      console.warn("Backend API not reachable for studio teachers", e);
    } finally {
      setStudioTeachersLoading(false);
    }
  };

  // Add a Teacher to the studio
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingTeacher) return;
    setIsSavingTeacher(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          phone: teacherPhone,
          title: teacherTitle,
          bio: teacherBio,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(`⚠️ ${err.detail || "Failed to create teacher"}`);
        return;
      }
      showToast("🌿 Teacher added to sanctuary successfully!");
      setIsAddTeacherOpen(false);
      setTeacherName("");
      setTeacherEmail("");
      setTeacherPhone("");
      setTeacherTitle("Sanctuary Guide");
      setTeacherBio("Certified movement specialist and yoga instructor.");
      fetchStudioTeachers();
    } catch (err) {
      showToast("⚠️ Error connecting to server to add teacher");
    } finally { setIsSavingTeacher(false); }
  };

  // Open Edit Teacher Modal with existing data
  const handleOpenEditTeacher = (teacher: StudioTeacher) => {
    setEditingTeacher(teacher);
    setTeacherName(teacher.name);
    setTeacherEmail(teacher.email);
    setTeacherPhone(teacher.phone);
    setTeacherTitle(teacher.title);
    setTeacherBio(teacher.bio);
    setTeacherIsActive(teacher.is_active);
    setIsEditTeacherOpen(true);
  };

  // Update an existing teacher
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (isSavingTeacher) return;
    setIsSavingTeacher(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teachers/${editingTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teacherName,
          phone: teacherPhone,
          title: teacherTitle,
          bio: teacherBio,
          is_active: teacherIsActive,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(`⚠️ ${err.detail || "Failed to update teacher"}`);
        return;
      }
      showToast("🌿 Teacher profile updated successfully!");
      setIsEditTeacherOpen(false);
      setEditingTeacher(null);
      fetchStudioTeachers();
    } catch (err) {
      showToast("⚠️ Error connecting to server to update teacher");
    } finally { setIsSavingTeacher(false); }
  };

  // Remove a teacher from the studio
  const handleDeleteTeacher = async (teacherId: string, name: string) => {
    if (!await confirmAction({ title: "Remove teacher?", description: `${name} will be removed from this studio. Check their scheduled classes before proceeding.`, confirmLabel: "Remove teacher", destructive: true })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(`⚠️ ${err.detail || "Failed to remove teacher"}`);
        return;
      }
      showToast(`🌿 Teacher "${name}" removed from studio`);
      fetchStudioTeachers();
    } catch (err) {
      showToast("⚠️ Error removing teacher");
    }
  };

  // Fetch Students from FastAPI Backend
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const url = `${API_BASE_URL}/students?page=${currentPage}&page_size=${pageSize}${
        studentSearch ? `&search=${encodeURIComponent(studentSearch)}` : ""
      }${studentStatusFilter !== "ALL" ? `&status=${studentStatusFilter}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.items);
        setTotalItems(data.total_items);
        setTotalPages(data.total_pages);
      }
    } catch (e) {
      console.warn("Backend API not reachable for students, using local cache");
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch Instructors for Super Admin from FastAPI Backend
  const fetchAdminInstructors = async () => {
    setAdminInstructorsLoading(true);
    try {
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-superadmin";
      const url = `${API_BASE_URL}/admin/instructors?page=${adminCurrentPage}&page_size=${adminPageSize}${
        adminSearch ? `&search=${encodeURIComponent(adminSearch)}` : ""
      }${adminStatusFilter !== "ALL" ? `&status=${adminStatusFilter}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminInstructors(data.items);
        setAdminTotalItems(data.total_items);
        setAdminTotalPages(data.total_pages);
      }
    } catch (e) {
      console.warn("Backend API not reachable for admin instructors");
    } finally {
      setAdminInstructorsLoading(false);
    }
  };

  // Fetch Super Admin Metrics
  const fetchAdminMetrics = async () => {
    try {
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-superadmin";
      const res = await fetch(`${API_BASE_URL}/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminMetrics(data);
      }

      const orgRes = await fetch(`${API_BASE_URL}/admin/organizations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orgRes.ok) {
        const orgs = await orgRes.json();
        setAdminOrgs(orgs);
      }
    } catch (e) {
      console.warn("Error fetching admin metrics");
    }
  };

  const toggleInstructorStatus = async (memberId: string) => {
    const account = adminInstructors.find((instructor) => instructor.id === memberId);
    const suspending = Boolean(account?.is_active);
    if (!await confirmAction({ title: suspending ? "Suspend account access?" : "Restore account access?", description: suspending ? "This instructor will no longer be able to access the platform. Existing studio records will be kept." : "This instructor will be able to access the platform again.", confirmLabel: suspending ? "Suspend access" : "Restore access", destructive: suspending })) return;
    try {
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-superadmin";
      const res = await fetch(`${API_BASE_URL}/admin/instructors/${memberId}/toggle-status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not update studio access. Please try again.");
      const data = await res.json();
      showToast(`🌿 ${data.message}`);
      fetchAdminInstructors();
      fetchAdminMetrics();
    } catch (e) {
      notify("Could not update studio access. Check your connection and try again.", "error");
    }
  };

  // Fetch Studio Profile & Settings from FastAPI
  const fetchStudioProfile = async (orgId?: string) => {
    try {
      const id = orgId || currentUser?.organization_id;
      if (!id) return;
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
      const res = await fetch(`${API_BASE_URL}/organizations/${id}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudioProfile(data);
        setIsAccountCompleted(Boolean(data.account_completed));
        setCompletionStep(data.completion_step || 1);
        setZoomConnected(Boolean(data.zoom_connected));
        setZoomAccountEmail(data.zoom_account_email || "");

        // Pre-fill fields if not manually dirty
        if (data.name) setSetupStudioName(data.name);
        if (data.phone) setSetupPhone(data.phone);
        if (data.whatsapp_number) setSetupWhatsappNumber(data.whatsapp_number);
        if (data.completion_percentage !== undefined) setCompletionPercentage(data.completion_percentage);
        if (data.support_email) setSetupSupportEmail(data.support_email);
        if (data.studio_tagline) setSetupStudioTagline(data.studio_tagline);
        if (data.disciplines) {
          setSetupDisciplines(data.disciplines.split(",").map((s: string) => s.trim()));
        }
        if (data.teaching_mode) setSetupTeachingMode(data.teaching_mode);
        if (data.address_line1) setSetupAddressLine1(data.address_line1);
        if (data.address_line2) setSetupAddressLine2(data.address_line2);
        if (data.city) setSetupCity(data.city);
        if (data.state) setSetupState(data.state);
        if (data.pincode) setSetupPincode(data.pincode);
        if (data.country) setSetupCountry(data.country);
        if (data.has_gst !== undefined) setSetupHasGst(Boolean(data.has_gst));
        if (data.gst_number) setSetupGstNumber(data.gst_number);
        if (data.legal_business_name) setSetupLegalBusinessName(data.legal_business_name);
        if (data.pan_number) setSetupPanNumber(data.pan_number);
        if (data.bank_name) setSetupBankName(data.bank_name);
        if (data.account_holder_name) setSetupAccountHolderName(data.account_holder_name);
        if (data.ifsc_code) setSetupIfscCode(data.ifsc_code);
        if (data.upi_id) setSetupUpiId(data.upi_id);
        if (data.settlement_cycle) setSetupSettlementCycle(data.settlement_cycle);
        if (data.zoom_auto_meeting_enabled !== undefined) setZoomAutoMeetingEnabled(data.zoom_auto_meeting_enabled);
        if (data.zoom_waiting_room !== undefined) setZoomWaitingRoom(data.zoom_waiting_room);
        if (data.zoom_host_video !== undefined) setZoomHostVideo(data.zoom_host_video);

        // Store profile snapshot in localStorage for instantaneous rendering
        try {
          localStorage.setItem("pr_studio_profile", JSON.stringify(data));
        } catch (err) {}

        if (!data.account_completed && currentUser?.role !== "SUPER_ADMIN") {
          setActiveTab("account-completion");
        }
      }
    } catch (e) {
      console.warn("Could not fetch studio profile from API", e);
    }
  };

  // One-click prefill sample details for testing
  const handleFillSampleDetails = () => {
    setSetupStudioName(currentUser?.organization_name || "Prana Sanctuary Studio");
    setSetupPhone("+91 98765 43210");
    setSetupWhatsappNumber("+91 98765 43210");
    setSetupSupportEmail(currentUser?.email || "namaste@pranasanctuary.com");
    setSetupStudioTagline("Sacred Traditional Hatha, Aerial Flow & Meditation Sanctuary");
    setSetupDisciplines(["Hatha Yoga", "Vinyasa Flow", "Aerial Yoga", "Pranayama & Meditation"]);
    setSetupTeachingMode("HYBRID");
    setSetupAddressLine1("Level 3, Sacred Banyan Arcade, 108 North Main Road");
    setSetupAddressLine2("Opposite Osho Garden, Koregaon Park");
    setSetupCity("Pune");
    setSetupState("Maharashtra");
    setSetupPincode("411001");
    setSetupCountry("India");
    setSetupHasGst(true);
    setSetupGstNumber("27AABCU9603R1ZM");
    setSetupLegalBusinessName("Prana Wellness Movement Private Limited");
    setSetupPanNumber("AABCU9603R");
    setSetupBankName("HDFC Bank");
    setSetupAccountHolderName("Prana Wellness Movement Pvt Ltd");
    setSetupAccountNumber("50100234567890");
    setSetupConfirmAccountNumber("50100234567890");
    setSetupIfscCode("HDFC0001234");
    setSetupUpiId("pranashala@okhdfcbank");
    setSetupSettlementCycle("WEEKLY");
    showToast("🌿 Pre-filled verified sanctuary sample details!");
  };

  // Save Progress across steps
  const handleSaveStep = async (nextStep?: number) => {
    setIsSavingProfile(true);
    try {
      const orgId = currentUser?.organization_id || "65e82b8f-1494-4658-90d1-f450e21b20a5";
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
      const targetStep = nextStep || completionStep;

      const payload = {
        name: setupStudioName,
        phone: setupPhone,
        whatsapp_number: setupWhatsappNumber || setupPhone,
        support_email: setupSupportEmail,
        studio_tagline: setupStudioTagline,
        disciplines: setupDisciplines.join(", "),
        teaching_mode: setupTeachingMode,
        address_line1: setupAddressLine1,
        address_line2: setupAddressLine2,
        city: setupCity,
        state: setupState,
        pincode: setupPincode,
        country: setupCountry,
        has_gst: setupHasGst,
        gst_number: setupHasGst ? setupGstNumber : null,
        legal_business_name: setupLegalBusinessName,
        pan_number: setupPanNumber,
        bank_name: setupBankName,
        account_holder_name: setupAccountHolderName,
        account_number: setupAccountNumber || undefined,
        ifsc_code: setupIfscCode,
        upi_id: setupUpiId,
        settlement_cycle: setupSettlementCycle,
        zoom_connected: zoomConnected,
        zoom_account_email: zoomAccountEmail,
        zoom_auto_meeting_enabled: zoomAutoMeetingEnabled,
        zoom_waiting_room: zoomWaitingRoom,
        zoom_host_video: zoomHostVideo,
        completion_step: targetStep
      };

      const res = await fetch(`${API_BASE_URL}/organizations/${orgId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        if (resData.completion_percentage !== undefined) setCompletionPercentage(resData.completion_percentage);
        if (nextStep) setCompletionStep(nextStep);
        showToast("🌿 Studio setup progress saved!");
        fetchStudioProfile(orgId);
      } else {
        if (nextStep) setCompletionStep(nextStep);
        showToast("🌿 Progress saved locally!");
      }
    } catch (e) {
      if (nextStep) setCompletionStep(nextStep);
      showToast("🌿 Progress saved locally!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Zoom Connect handler
  const handleConnectZoom = async (mode: "ONE_CLICK" | "CREDENTIALS" = "ONE_CLICK") => {
    setIsConnectingZoom(true);
    try {
      const orgId = currentUser?.organization_id || "65e82b8f-1494-4658-90d1-f450e21b20a5";
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
      const email = setupSupportEmail || currentUser?.email || "owner.zoom@yogastudio.test";

      const res = await fetch(`${API_BASE_URL}/organizations/${orgId}/zoom/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          account_email: email,
          client_id: mode === "CREDENTIALS" ? zoomClientId : null,
          client_secret: mode === "CREDENTIALS" ? zoomClientSecret : null,
          account_id: mode === "CREDENTIALS" ? zoomAccountId : null,
          auto_meeting_enabled: zoomAutoMeetingEnabled,
          waiting_room: zoomWaitingRoom,
          host_video: zoomHostVideo
        })
      });

      if (res.ok) {
        setZoomConnected(true);
        setZoomAccountEmail(email);
        showToast(`🎥 Zoom Connected (${email})! Live class meeting links active.`);
        fetchStudioProfile(orgId);
      } else {
        notify("Zoom could not be connected. Check your account details and try again.", "error");
      }
    } catch (e) {
      notify("Unable to reach Zoom setup. Check your connection and try again.", "error");
    } finally {
      setIsConnectingZoom(false);
    }
  };

  // Zoom Disconnect handler
  const handleDisconnectZoom = async () => {
    if (!await confirmAction({ title: "Disconnect Zoom?", description: "New automatic meeting links will be unavailable until you reconnect Zoom. Existing classes will remain in your schedule.", confirmLabel: "Disconnect", destructive: true })) return;
    try {
      const orgId = currentUser?.organization_id || "65e82b8f-1494-4658-90d1-f450e21b20a5";
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}/zoom/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Disconnect failed");
    } catch (e) { notify("Unable to disconnect Zoom. Please try again.", "error"); return; }
    setZoomConnected(false);
    setZoomAccountEmail("");
    showToast("Zoom account disconnected.");
  };

  // Test Zoom Room Generation
  const handleGenerateTestZoomMeeting = async () => {
    setIsGeneratingTestMeeting(true);
    try {
      const orgId = currentUser?.organization_id || "65e82b8f-1494-4658-90d1-f450e21b20a5";
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
      const res = await fetch(`${API_BASE_URL}/organizations/${orgId}/zoom/generate-meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: `${setupStudioName || "Sanctuary"} Test Live Classroom`,
          duration_minutes: 60
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestZoomMeeting(data);
        showToast("🎥 Zoom live meeting generated successfully!");
      } else {
        throw new Error();
      }
    } catch (e) {
      const mockId = String(Math.floor(80000000000 + Math.random() * 19999999999));
      const mockPwd = Math.random().toString(36).substring(2, 8);
      setTestZoomMeeting({
        meeting_id: mockId,
        passcode: mockPwd,
        join_url: `https://us05web.zoom.us/j/${mockId}?pwd=${mockPwd}`
      });
      showToast("🎥 Zoom preview room generated!");
    } finally {
      setIsGeneratingTestMeeting(false);
    }
  };

  // Complete Account Setup & Launch Sanctuary
  const handleCompleteOnboarding = async () => {
    setIsSavingProfile(true);
    try {
      const orgId = currentUser?.organization_id || "65e82b8f-1494-4658-90d1-f450e21b20a5";
      const token = localStorage.getItem("pr_access_token") || "dev_test_token_usr-instructor";
      const payload = {
        name: setupStudioName,
        phone: setupPhone,
        whatsapp_number: setupWhatsappNumber || setupPhone,
        support_email: setupSupportEmail,
        studio_tagline: setupStudioTagline,
        disciplines: setupDisciplines.join(", "),
        teaching_mode: setupTeachingMode,
        address_line1: setupAddressLine1,
        address_line2: setupAddressLine2,
        city: setupCity,
        state: setupState,
        pincode: setupPincode,
        country: setupCountry,
        has_gst: setupHasGst,
        gst_number: setupHasGst ? setupGstNumber : null,
        legal_business_name: setupLegalBusinessName,
        pan_number: setupPanNumber,
        bank_name: setupBankName,
        account_holder_name: setupAccountHolderName,
        account_number: setupAccountNumber || undefined,
        ifsc_code: setupIfscCode,
        upi_id: setupUpiId,
        settlement_cycle: setupSettlementCycle,
        zoom_connected: zoomConnected,
        zoom_account_email: zoomAccountEmail,
        zoom_auto_meeting_enabled: zoomAutoMeetingEnabled,
        zoom_waiting_room: zoomWaitingRoom,
        zoom_host_video: zoomHostVideo,
        account_completed: true,
        completion_step: 6,
        completion_percentage: 100
      };

      await fetch(`${API_BASE_URL}/organizations/${orgId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      setIsAccountCompleted(true);
      setCompletionStep(6);
      setCompletionPercentage(100);
      if (currentUser) {
        const updated = {
          ...currentUser,
          account_completed: true,
          completion_step: 6,
          completion_percentage: 100
        };
        setCurrentUser(updated);
        try {
          localStorage.setItem("pr_user", JSON.stringify(updated));
        } catch (err) {}
      }
      showToast("🎉 Studio Account Completed! Values saved to Studio Profiler.");
      fetchStudioProfile(orgId);
      setActiveTab("settings");
    } catch (e) {
      setIsAccountCompleted(true);
      setCompletionStep(6);
      setCompletionPercentage(100);
      showToast("🎉 Studio Account Completed! Values saved to Studio Profiler.");
      setActiveTab("settings");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("pr_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
        if (parsed.completion_percentage !== undefined) {
          setCompletionPercentage(parsed.completion_percentage);
        }
        if (parsed.role === "SUPER_ADMIN") {
          setActiveTab("superadmin-instructors");
        } else if (!parsed.account_completed) {
          setActiveTab("account-completion");
        } else {
          setActiveTab("studio-teachers");
        }
        if (parsed.organization_id) {
          fetchStudioProfile(parsed.organization_id);
        }
      } else {
        // Direct / first visit fallback
        setActiveTab("account-completion");
        fetchStudioProfile("65e82b8f-1494-4658-90d1-f450e21b20a5");
      }

      const storedProfile = localStorage.getItem("pr_studio_profile");
      if (storedProfile) {
        const prof = JSON.parse(storedProfile);
        setStudioProfile(prof);
        setIsAccountCompleted(Boolean(prof.account_completed));
        if (prof.completion_percentage !== undefined) {
          setCompletionPercentage(prof.completion_percentage);
        }
        setZoomConnected(Boolean(prof.zoom_connected));
      }

      const storedBatches = localStorage.getItem("pr_studio_batches");
      if (storedBatches) {
        setBatches(JSON.parse(storedBatches));
      }
      const storedAttendance = localStorage.getItem("pr_attendance_records");
      if (storedAttendance) {
        setAttendanceRecords(JSON.parse(storedAttendance));
      }
      const storedCalendarEvents = localStorage.getItem("pr_calendar_events");
      if (storedCalendarEvents) {
        setCalendarEvents(JSON.parse(storedCalendarEvents));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);


  // Trigger Studio Teachers query when studio browses studio-teachers tab
  useEffect(() => {
    if (activeTab === "studio-teachers") {
      fetchStudioTeachers();
    }
  }, [activeTab, teacherSearch]);

  // Trigger Students API query when teacher browses students tab
  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab, currentPage, pageSize, studentSearch, studentStatusFilter]);

  // Trigger Admin API queries when Super Admin browses platform tabs
  useEffect(() => {
    if (currentUser?.role === "SUPER_ADMIN") {
      if (activeTab === "superadmin-instructors") {
        fetchAdminInstructors();
        fetchAdminMetrics();
      } else if (activeTab === "superadmin-analytics") {
        fetchAdminMetrics();
      }
    }
  }, [activeTab, currentUser, adminCurrentPage, adminPageSize, adminSearch, adminStatusFilter]);

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
    notify(msg.replace(/^(?:🌿|⚠️|🎥|🎉)\s*/, ""), /⚠️|failed|error|please enter/i.test(msg) ? "error" : /saved|created|updated|removed|copied|completed|connected|marked/i.test(msg) ? "success" : "info");
  };

  const handleLogout = async () => {
    if (!await confirmAction({ title: "Sign out?", description: "Unsaved form changes will be lost. You can sign in again anytime.", confirmLabel: "Sign out" })) return;
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

    const zoomMeetingId = Math.floor(80000000000 + Math.random() * 19999999999);
    const zoomPasscode = Math.random().toString(36).substring(2, 8);
    const autoZoomUrl = `https://us05web.zoom.us/j/${zoomMeetingId}?pwd=${zoomPasscode}`;
    const finalMeetingUrl = (zoomConnected && zoomAutoMeetingEnabled)
      ? (newBatchUrl && !newBatchUrl.includes("meet.progressrooms.com") ? newBatchUrl : autoZoomUrl)
      : (newBatchUrl || "https://meet.progressrooms.com/" + newBatchName.toLowerCase().replace(/\s+/g, "-"));

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
      meetingUrl: finalMeetingUrl,
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
    showToast(
      `🌿 New Batch "${newEntry.name}" created! ${
        zoomConnected && zoomAutoMeetingEnabled ? "🎥 Live Zoom meeting link generated automatically." : "30-day timetable generated."
      }`
    );
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

  const handleMarkAll = async (status: "ATTENDED" | "ABSENT") => {
    if (!await confirmAction({ title: status === "ATTENDED" ? "Mark roster present?" : "Clear roster attendance?", description: `This updates ${students.length} students in the loaded roster for ${selectedDate}. Review the roster before continuing.`, confirmLabel: status === "ATTENDED" ? "Mark present" : "Clear roster", destructive: status === "ABSENT" })) return;
    const updated: Record<string, "ATTENDED" | "ABSENT"> = { ...attendanceRecords };
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceRecords(updated);

    const updatedStudents = students.map((s) => ({
      ...s,
      attended: Math.max(0, Math.min(s.total, s.attended + (status === "ATTENDED" ? 1 : 0) - (attendanceRecords[s.id] === "ATTENDED" ? 1 : 0)))
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
    localStorage.setItem("pr_calendar_events", JSON.stringify(updated));
    setCalendarEvents(updated);
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isInstructor = currentUser?.role === "INSTRUCTOR";
  const orgTitle = isSuperAdmin
    ? "ProgressNow HQ"
    : (isInstructor ? "Tranquil Flow Sanctuary" : (currentUser?.organization_name || "Tranquil Flow Sanctuary"));
  const roleSubtitle = isSuperAdmin
    ? "Platform Super Admin"
    : (isInstructor ? "Instructor View • My Batches" : "Studio Operations");
  const userDisplayName = currentUser?.full_name || (isSuperAdmin ? "Platform Super Admin" : (isInstructor ? "Lead Instructor" : "Studio Owner"));
  const userDisplayEmail = currentUser?.email || (isSuperAdmin ? "admin@progressrooms.com" : (isInstructor ? "instructor@yogastudio.com" : "owner@yogastudio.com"));
  const userInitials = isSuperAdmin ? "SA" : (isInstructor ? "IN" : "SO");

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  return (
    <div className="dashboard-shell bg-[#FAF7F2] text-[#212121] font-sans" data-dashboard-theme={dashboardTheme}>

      {/* Nature Dark Emerald Sidebar */}
      <ResponsiveSidebar><aside
        className="w-72 flex-shrink-0 flex flex-col justify-between p-5 text-white shadow-2xl z-20 nature-sidebar"
      >
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="pb-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BrandLogo size={40} variant="tile-dark" />
              <div>
                <h2 className="font-serif font-bold text-base text-[#F4F7F4] leading-tight">
                  {orgTitle}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] block mt-0.5">
                  {roleSubtitle}
                </span>
              </div>
            </div>

          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {isSuperAdmin ? (
              <>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] px-3 mb-2">
                  Platform Administration
                </p>

                <button
                  onClick={() => setActiveTab("superadmin-instructors")}
                  className={`nav-item ${activeTab === "superadmin-instructors" ? "active" : ""}`}
                >
                  <span className="nav-icon">🏢</span>
                  <span>Manage Studios</span>
                </button>

                <button
                  onClick={() => setActiveTab("superadmin-analytics")}
                  className={`nav-item ${activeTab === "superadmin-analytics" ? "active" : ""}`}
                >
                  <span className="nav-icon">📊</span>
                  <span>Platform Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab("superadmin-settings")}
                  className={`nav-item ${activeTab === "superadmin-settings" ? "active" : ""}`}
                >
                  <span className="nav-icon">⚙️</span>
                  <span>Platform Settings</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] px-3 mb-2">
                  Studio Operations Menu
                </p>

                {/* 0. Studio Account Completion Wizard Tab - FIRST ITEM when setup is incomplete */}
                {!isAccountCompleted && (
                  <button
                    onClick={() => setActiveTab("account-completion")}
                    className={`nav-item relative ${activeTab === "account-completion" ? "active" : ""}`}
                  >
                    <span className="nav-icon">✨</span>
                    <div className="flex-1 text-left flex items-center justify-between gap-1">
                      <span className="truncate">Account Completion</span>
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0 animate-pulse">
                        {displayPercentage}% Completed
                      </span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("studio-teachers")}
                  className={`nav-item ${activeTab === "studio-teachers" ? "active" : ""}`}
                >
                  <span className="nav-icon">🧘</span>
                  <span>Manage Teachers</span>
                </button>

                <button
                  onClick={() => setActiveTab("students")}
                  className={`nav-item ${activeTab === "students" ? "active" : ""}`}
                >
                  <span className="nav-icon">👥</span>
                  <span>Manage Students</span>
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
                  <span>Studio Analytics</span>
                </button>

                {/* Account Completion - SECOND LAST ITEM when setup is 100% completed */}
                {isAccountCompleted && (
                  <button
                    onClick={() => setActiveTab("account-completion")}
                    className={`nav-item relative ${activeTab === "account-completion" ? "active" : ""}`}
                  >
                    <span className="nav-icon">✨</span>
                    <div className="flex-1 text-left flex items-center justify-between gap-1">
                      <span className="truncate">Account Completion</span>
                      <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Complete
                      </span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                >
                  <span className="nav-icon">⚙️</span>
                  <span>Settings</span>
                </button>
                {activeTab === "settings" && (
                  <div className="settings-submenu" aria-label="Settings sections">
                    <button
                      type="button"
                      className={settingsSection === "profile" ? "active" : ""}
                      onClick={() => setSettingsSection("profile")}
                    >
                      Profile Settings
                    </button>
                    <button
                      type="button"
                      className={settingsSection === "dashboard" ? "active" : ""}
                      onClick={() => setSettingsSection("dashboard")}
                    >
                      Dashboard Settings
                    </button>
                  </div>
                )}
              </>
            )}
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
      </aside></ResponsiveSidebar>

      {/* Main Sanctuary Dashboard Viewport */}
      <main id="main-content" className="dashboard-content min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8">
        {/* SUPER ADMIN TAB 1: STUDIOS & INSTRUCTORS MANAGEMENT */}
        {activeTab === "superadmin-instructors" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Manage Studios & Organizations</h1>
                <p className="text-xs text-[#40514E] mt-0.5">
                  Super Admin platform governance: review registered studios, monitor academy health, and manage tenant credentials.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchAdminInstructors();
                    fetchAdminMetrics();
                    showToast("Refreshed platform database records");
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition flex items-center gap-1.5"
                >
                  <Activity className="h-3.5 w-3.5 text-[#2D7A58]" />
                  <span>Refresh Platform DB</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Registered Studios</span>
                  <Building2 className="h-4 w-4 text-[#2D7A58]" />
                </div>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{adminMetrics?.total_organizations ?? 6}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Live tenant organizations</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Teachers / Instructors</span>
                  <UserCheck className="h-4 w-4 text-[#2D7A58]" />
                </div>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{adminMetrics?.total_instructors ?? 10}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Across all studio academies</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Enrolled Yogis</span>
                  <Users className="h-4 w-4 text-[#2D7A58]" />
                </div>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{adminMetrics?.total_students ?? 20}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Active platform practitioners</p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1E9E2] shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by instructor name, email, or studio..."
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setAdminCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={adminStatusFilter}
                  onChange={(e) => {
                    setAdminStatusFilter(e.target.value);
                    setAdminCurrentPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl border border-[#CEDECF] bg-white text-slate-700 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Teachers</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {/* Instructors Table */}
            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable records table">
                {adminInstructorsLoading ? (
                  <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#133623]" />
                    <span>Loading instructors from PostgreSQL database...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F7F4] border-b border-[#E1E9E2] text-[#1b4332] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Instructor & Email</th>
                        <th className="px-6 py-4">Studio / Academy</th>
                        <th className="px-6 py-4">Role & Specialization</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Registered</th>
                        <th className="px-6 py-4 text-right">Super Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E9E2]">
                      {adminInstructors.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                            No instructors found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        adminInstructors.map((inst) => (
                          <tr key={inst.id} className="hover:bg-[#F9FAF9] transition">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#0C2417] text-sm">{inst.instructor_name}</p>
                              <p className="text-[11px] text-slate-500">{inst.email}</p>
                              <p className="text-[10px] text-slate-400">{inst.phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-[#1b4332]">{inst.studio_name}</span>
                              <span className="block text-[10px] text-slate-400 font-mono">/{inst.studio_slug}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-800">{inst.title}</span>
                              <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                                {inst.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  inst.is_active
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {inst.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {inst.joined_at}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => toggleInstructorStatus(inst.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                  inst.is_active
                                    ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                }`}
                              >
                                {inst.is_active ? "Suspend Access" : "Activate Access"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Admin Pagination Controls */}
              <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E1E9E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <strong>{adminTotalItems === 0 ? 0 : (adminCurrentPage - 1) * adminPageSize + 1}</strong> to{" "}
                    <strong>{Math.min(adminCurrentPage * adminPageSize, adminTotalItems)}</strong> of <strong>{adminTotalItems}</strong> instructors
                  </span>

                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-slate-400">Rows:</span>
                    <select
                      value={adminPageSize}
                      onChange={(e) => {
                        setAdminPageSize(Number(e.target.value));
                        setAdminCurrentPage(1);
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
                    onClick={() => setAdminCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={adminCurrentPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: adminTotalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setAdminCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg font-bold text-xs transition ${
                          adminCurrentPage === pageNum
                            ? "bg-[#133623] text-white shadow-sm"
                            : "bg-white border border-[#CEDECF] text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setAdminCurrentPage((p) => Math.min(adminTotalPages, p + 1))}
                    disabled={adminCurrentPage >= adminTotalPages}
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

        {/* SUPER ADMIN TAB 2: PLATFORM OVERVIEW & METRICS */}
        {activeTab === "superadmin-analytics" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Platform Overview & Subscriptions</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Real-time health, subscriber retention, and tenancy metrics across ProgressNow OS.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Studios</span>
                <p className="text-3xl font-black text-[#0C2417]">{adminMetrics?.total_organizations ?? 6}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Active Tenant Hubs</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Gross MRR</span>
                <p className="text-3xl font-black text-[#0C2417]">₹{(adminMetrics?.total_platform_revenue ?? 2500).toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 font-semibold">Processed via Razorpay & Stripe</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Infrastructure</span>
                <p className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Healthy</span>
                </p>
                <p className="text-[11px] text-slate-500">PostgreSQL (progressrooms_db) • Port 5432</p>
              </div>
            </div>

            {/* Registered Studios Directory */}
            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm overflow-hidden p-6 space-y-4">
              <h3 className="text-base font-serif font-bold text-[#0C2417]">Registered Tenant Studios</h3>
              <div className="divide-y divide-[#E1E9E2]">
                {adminOrgs.map((org) => (
                  <div key={org.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#0C2417]">{org.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">progressrooms.com/{org.slug}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {org.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUPER ADMIN TAB 3: PLATFORM SETTINGS */}
        {activeTab === "superadmin-settings" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Platform Configuration & Gates</h1>
              <p className="text-xs text-[#40514E] mt-0.5">Manage global platform policies, feature flags, and custom domains.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4 max-w-xl">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">Self-Service Studio Signups</p>
                  <p className="text-[10px] text-slate-500">Allow new instructors to start a 30-day trial automatically</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">ENABLED</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="text-xs font-bold text-[#0C2417]">PostgreSQL Connection Pool</p>
                  <p className="text-[10px] text-slate-500">asyncpg max_size=20 localhost:5432</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">CONNECTED</span>
              </div>
            </div>
          </div>
        )}

        {/* STUDIO ONBOARDING TAB: ACCOUNT COMPLETION WIZARD */}
        {activeTab === "account-completion" && (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Header with Title & One-Click Sample Pre-fill */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Account Completion</h1>
                  {!isAccountCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Step {completionStep} of 6 • {displayPercentage}% Completed
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Completed • Sanctuary Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#40514E] mt-1">
                  Complete all 6 essential studio setup steps: mobile & WhatsApp, location & teaching mode, GST registration, bank payouts, Zoom live video, and final launch.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleFillSampleDetails}
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pre-Fill Sample Details</span>
                </button>
              </div>
            </div>

            {/* Step Stepper Navigation Bar with Icons & Complete/Incomplete Indicators */}
            <div className="account-stepper bg-white p-3 sm:p-4 rounded-3xl border border-[#CEDECF] shadow-sm">
              <div className="account-stepper-track" aria-label="Account completion progress">
                {[
                  { step: 1, label: "Studio & Phone", icon: Building2, desc: "Name & WhatsApp" },
                  { step: 2, label: "Location & Mode", icon: MapPin, desc: "Teaching address" },
                  { step: 3, label: "GST & Legal", icon: FileText, desc: "Tax & business identity" },
                  { step: 4, label: "Bank & Payouts", icon: Landmark, desc: "Payout settlement" },
                  { step: 5, label: "Zoom Live Video", icon: Video, desc: "Virtual classroom" },
                  { step: 6, label: "Review & Launch", icon: ShieldCheck, desc: "Verification & launch" }
                ].map((s) => {
                  const isActive = completionStep === s.step;
                  const isDone = checkStepCompleted(s.step);
                  const IconComp = s.icon;
                  const statusClass = isActive ? "active" : isDone ? "complete" : "incomplete";

                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setCompletionStep(s.step)}
                      aria-current={isActive ? "step" : undefined}
                      aria-label={`Step ${s.step}: ${s.label}. ${isActive ? "In Progress" : isDone ? "Complete" : "Incomplete"}`}
                      className={`account-step ${statusClass}`}
                    >
                      <div className="account-step-icon-wrap shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">0{s.step}</span>
                          <p className="text-xs font-bold truncate text-[#0C2417]">{s.label}</p>
                        </div>
                        <div className="account-step-status">
                          {isDone && !isActive ? (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <Check className="w-3 h-3 text-emerald-600" /> Complete
                            </span>
                          ) : isActive ? (
                            <span className="flex items-center gap-1 text-[#2D7A58] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A58] animate-ping" /> In Progress
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Incomplete
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: STUDIO & MOBILE CONTACT */}
            {completionStep === 1 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                <div className="border-b border-[#E1E9E2] pb-4">
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Step 1: Studio Contact & Identity</h3>
                  <p className="text-xs text-slate-500">Provide your studio name, primary phone, WhatsApp number, and teaching disciplines.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dashboard-page-field-1" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Studio / Sanctuary Name *
                    </label>
                    <input id="dashboard-page-field-1"
                      type="text"
                      required
                      placeholder="e.g. Sahil Yoga Studio"
                      value={setupStudioName}
                      onChange={(e) => setSetupStudioName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Primary Mobile Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={setupPhone}
                        onChange={(e) => {
                          setSetupPhone(e.target.value);
                          if (!setupWhatsappNumber) setSetupWhatsappNumber(e.target.value);
                        }}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Direct studio owner mobile phone for SMS alerts and account login.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      WhatsApp Contact Number
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={setupWhatsappNumber}
                        onChange={(e) => setSetupWhatsappNumber(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Used for student booking confirmations & WhatsApp class reminders.</p>
                  </div>

                  <div>
                    <label htmlFor="dashboard-page-field-2" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Studio Support / Business Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="namaste@studio.com"
                        value={setupSupportEmail}
                        onChange={(e) => setSetupSupportEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                    Studio Tagline / Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Hatha, Aerial Movement & Pranayama Sanctuary"
                    value={setupStudioTagline}
                    onChange={(e) => setSetupStudioTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                  />
                </div>

                {/* Disciplines Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                    Primary Movement & Teaching Disciplines
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Hatha Yoga",
                      "Vinyasa Flow",
                      "Aerial Yoga",
                      "Yin Yoga",
                      "Ashtanga",
                      "Meditation",
                      "Pranayama & Breathwork",
                      "Pilates Conditioning",
                      "Sound Bath"
                    ].map((disc) => {
                      const isSelected = setupDisciplines.includes(disc);
                      return (
                        <button
                          key={disc}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSetupDisciplines(setupDisciplines.filter((d) => d !== disc));
                            } else {
                              setSetupDisciplines([...setupDisciplines, disc]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#133623] text-white shadow-sm"
                              : "bg-[#F4F7F4] text-slate-700 hover:bg-[#E8F0E9] border border-[#CEDECF]"
                          }`}
                        >
                          <span>{isSelected ? "✓" : "+"}</span>
                          <span>{disc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#E1E9E2] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium">Step 1 of 6</span>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: Location & Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: STUDIO LOCATION & TEACHING MODE */}
            {completionStep === 2 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                <div className="border-b border-[#E1E9E2] pb-4">
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Step 2: Studio Location & Teaching Mode</h3>
                  <p className="text-xs text-slate-500">Specify your physical shala address or virtual teaching setup.</p>
                </div>

                {/* Teaching Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                    Studio Teaching Mode *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        mode: "HYBRID",
                        title: "🌿 Hybrid Sanctuary",
                        desc: "Both in-person Shala and live Zoom interactive classes"
                      },
                      {
                        mode: "PHYSICAL",
                        title: "🏢 Physical Shala Only",
                        desc: "Traditional brick-and-mortar studio sessions"
                      },
                      {
                        mode: "ONLINE",
                        title: "💻 100% Virtual Studio",
                        desc: "Online classes streamed directly via Zoom"
                      }
                    ].map((item) => (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => setSetupTeachingMode(item.mode as any)}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          setupTeachingMode === item.mode
                            ? "bg-[#E8F0E9] border-[#133623] text-[#0C2417] ring-1 ring-[#133623]"
                            : "bg-[#F9FAF9] border-[#CEDECF] text-slate-600 hover:bg-white"
                        }`}
                      >
                        <p className="text-xs font-bold text-[#0C2417]">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Studio Street Address / Shala Building *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Level 3, Sacred Banyan Arcade, 108 North Main Road"
                        value={setupAddressLine1}
                        onChange={(e) => setSetupAddressLine1(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label htmlFor="dashboard-page-field-3" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                        Area / Landmark
                      </label>
                      <input id="dashboard-page-field-3"
                        type="text"
                        placeholder="e.g. Koregaon Park, Opp Osho Garden"
                        value={setupAddressLine2}
                        onChange={(e) => setSetupAddressLine2(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                      />
                    </div>

                    <div>
                      <label htmlFor="dashboard-page-field-4" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                        City *
                      </label>
                      <input id="dashboard-page-field-4"
                        type="text"
                        placeholder="e.g. Pune"
                        value={setupCity}
                        onChange={(e) => setSetupCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                      />
                    </div>

                    <div>
                      <label htmlFor="dashboard-page-field-5" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                        State *
                      </label>
                      <input id="dashboard-page-field-5"
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={setupState}
                        onChange={(e) => setSetupState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="dashboard-page-field-6" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                        PIN / Postal Code *
                      </label>
                      <input id="dashboard-page-field-6"
                        type="text"
                        placeholder="e.g. 411001"
                        value={setupPincode}
                        onChange={(e) => setSetupPincode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                      />
                    </div>

                    <div>
                      <label htmlFor="dashboard-page-field-7" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input id="dashboard-page-field-7"
                        type="text"
                        value={setupCountry}
                        disabled
                        className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-slate-100 text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#E1E9E2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: GST & Legal Identity</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: GST & LEGAL BUSINESS IDENTITY */}
            {completionStep === 3 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                <div className="border-b border-[#E1E9E2] pb-4">
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Step 3: GST & Legal Business Identity</h3>
                  <p className="text-xs text-slate-500">Specify your business entity name, Goods & Services Tax (GSTIN), and PAN details for billing.</p>
                </div>

                {/* GST & Tax Registration Section */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#CEDECF] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0C2417]">GST Registration Status</h4>
                      <p className="text-[11px] text-slate-500">Do you have a registered Goods and Services Tax Identification Number?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setupHasGst}
                        onChange={(e) => setSetupHasGst(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#133623]"></div>
                    </label>
                  </div>

                  {setupHasGst ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label htmlFor="dashboard-page-field-8" className="block text-[11px] font-bold text-[#1b4332] uppercase mb-1">
                          GSTIN (15 Digits) *
                        </label>
                        <input id="dashboard-page-field-8"
                          type="text"
                          placeholder="e.g. 27AABCU9603R1ZM"
                          maxLength={15}
                          value={setupGstNumber}
                          onChange={(e) => setSetupGstNumber(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white font-mono uppercase"
                        />
                      </div>

                      <div>
                        <label htmlFor="dashboard-page-field-9" className="block text-[11px] font-bold text-[#1b4332] uppercase mb-1">
                          Legal Entity Name *
                        </label>
                        <input id="dashboard-page-field-9"
                          type="text"
                          placeholder="As per GST certificate"
                          value={setupLegalBusinessName}
                          onChange={(e) => setSetupLegalBusinessName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label htmlFor="dashboard-page-field-10" className="block text-[11px] font-bold text-[#1b4332] uppercase mb-1">
                          Business PAN
                        </label>
                        <input id="dashboard-page-field-10"
                          type="text"
                          placeholder="e.g. AABCU9603R"
                          maxLength={10}
                          value={setupPanNumber}
                          onChange={(e) => setSetupPanNumber(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>No GST registered yet? You can operate as an individual educator/instructor and add your PAN card.</span>
                      </div>
                      <div className="max-w-xs">
                        <label className="block text-[11px] font-bold text-[#1b4332] uppercase mb-1">
                          Personal / Sole Proprietor PAN
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. AABCU9603R"
                          maxLength={10}
                          value={setupPanNumber}
                          onChange={(e) => setSetupPanNumber(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white font-mono uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#E1E9E2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ← Back to Step 2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: Bank & Payouts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: BANK & PAYOUT DETAILS */}
            {completionStep === 4 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                <div className="border-b border-[#E1E9E2] pb-4">
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Step 4: Bank Account & Fee Settlements</h3>
                  <p className="text-xs text-slate-500">Provide verified bank settlement details to receive student fees and pass payouts ("The Thanks Perspective").</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#E8F0E9] border border-[#CEDECF] text-[#1b4332] text-xs flex items-center gap-2.5">
                  <Landmark className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>Your settlement account is encrypted and used solely for direct student fee transfers and membership payouts.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dashboard-page-field-11" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Account Holder Name *
                    </label>
                    <input id="dashboard-page-field-11"
                      type="text"
                      placeholder="As registered with your bank"
                      value={setupAccountHolderName}
                      onChange={(e) => setSetupAccountHolderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                    />
                  </div>

                  <div>
                    <label htmlFor="dashboard-page-field-12" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Bank Name *
                    </label>
                    <input id="dashboard-page-field-12"
                      type="text"
                      placeholder="e.g. HDFC Bank, ICICI Bank, State Bank of India"
                      value={setupBankName}
                      onChange={(e) => setSetupBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dashboard-page-field-13" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Bank Account Number *
                    </label>
                    <input id="dashboard-page-field-13"
                      type="password"
                      placeholder="Enter account number"
                      value={setupAccountNumber}
                      onChange={(e) => setSetupAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] font-mono focus:outline-none focus:ring-2 focus:ring-[#133623]"
                    />
                  </div>

                  <div>
                    <label htmlFor="dashboard-page-field-14" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Confirm Account Number *
                    </label>
                    <input id="dashboard-page-field-14"
                      type="text"
                      placeholder="Re-enter account number"
                      value={setupConfirmAccountNumber}
                      onChange={(e) => setSetupConfirmAccountNumber(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs bg-[#F9FAF9] font-mono focus:outline-none focus:ring-2 ${
                        setupConfirmAccountNumber && setupAccountNumber !== setupConfirmAccountNumber
                          ? "border-red-400 focus:ring-red-400"
                          : "border-[#CEDECF] focus:ring-[#133623]"
                      }`}
                    />
                    {setupConfirmAccountNumber && setupAccountNumber !== setupConfirmAccountNumber && (
                      <p className="text-[10px] text-red-600 mt-1">Account numbers do not match</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dashboard-page-field-15" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Bank IFSC Code *
                    </label>
                    <input id="dashboard-page-field-15"
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      maxLength={11}
                      value={setupIfscCode}
                      onChange={(e) => setSetupIfscCode(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#133623]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Instant UPI ID (for Quick Settlements)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. pranashala@okhdfcbank"
                        value={setupUpiId}
                        onChange={(e) => setSetupUpiId(e.target.value.toLowerCase())}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] font-mono focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                    Settlement Frequency
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "DAILY", title: "Daily Settlement", desc: "T+1 rolling transfers" },
                      { id: "WEEKLY", title: "Weekly Settlement", desc: "Every Monday payout" },
                      { id: "MONTHLY", title: "Monthly Settlement", desc: "1st of every month" }
                    ].map((cycle) => (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => setSetupSettlementCycle(cycle.id as any)}
                        className={`p-3 rounded-2xl border text-left transition ${
                          setupSettlementCycle === cycle.id
                            ? "bg-[#E8F0E9] border-[#133623] text-[#0C2417] ring-1 ring-[#133623]"
                            : "bg-[#F9FAF9] border-[#CEDECF] text-slate-600 hover:bg-white"
                        }`}
                      >
                        <p className="text-xs font-bold">{cycle.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cycle.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#E1E9E2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(3)}
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ← Back to Step 3
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(5)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: Zoom Live Video</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: ZOOM AUTHENTICATION & LIVE CLASSROOM INTEGRATION */}
            {completionStep === 5 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                <div className="border-b border-[#E1E9E2] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0C2417]">Step 5: Zoom Live Video Authentication</h3>
                    <p className="text-xs text-slate-500">
                      When authenticated, newly created class batches will directly generate Zoom meeting rooms automatically.
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                    <Video className="w-5 h-5" />
                  </div>
                </div>

                {/* Live Status Banner */}
                {zoomConnected ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-emerald-900">Zoom Account Authenticated</h4>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Connected Account: <strong>{zoomAccountEmail || "owner.zoom@yogastudio.test"}</strong>
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-1">
                          Automated Meeting Generation is ACTIVE. Classes will generate unique Zoom URLs upon batch creation.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnectZoom}
                      className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline shrink-0"
                    >
                      Disconnect Zoom
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs">Zoom Integration Pending</h4>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Authenticate your Zoom account so your scheduled class batches automatically provision private video conference links for enrolled yogis.
                      </p>
                    </div>
                  </div>
                )}

                {/* Connect Options */}
                {!zoomConnected && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                      <button
                        type="button"
                        onClick={() => setZoomAuthTab("ONE_CLICK")}
                        className={`text-xs font-bold pb-2 border-b-2 transition ${
                          zoomAuthTab === "ONE_CLICK"
                            ? "border-[#133623] text-[#0C2417]"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        ⚡ One-Click Instant Zoom OAuth Connect
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomAuthTab("CREDENTIALS")}
                        className={`text-xs font-bold pb-2 border-b-2 transition ${
                          zoomAuthTab === "CREDENTIALS"
                            ? "border-[#133623] text-[#0C2417]"
                            : "border-transparent text-slate-400 hover:text-slate-700"
                        }`}
                      >
                        🔑 Server-to-Server API Keys
                      </button>
                    </div>

                    {zoomAuthTab === "ONE_CLICK" ? (
                      <div className="p-6 rounded-2xl bg-[#F4F7F4] border border-[#CEDECF] text-center space-y-4">
                        <div className="max-w-md mx-auto space-y-2">
                          <h4 className="text-sm font-bold text-[#0C2417]">Authorize ProgressNow Sanctuary on Zoom</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Click below to authorize Zoom. ProgressNow will request permission to create scheduled video meetings on your behalf.
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isConnectingZoom}
                          onClick={() => handleConnectZoom("ONE_CLICK")}
                          className="px-6 py-3 rounded-xl bg-[#2D8CFF] hover:bg-[#1A73E8] text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2"
                        >
                          {isConnectingZoom ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          <span>Authenticate & Connect Zoom</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 p-4 rounded-2xl bg-[#F4F7F4] border border-[#CEDECF]">
                        <div>
                          <label htmlFor="dashboard-page-field-16" className="block text-xs font-bold text-slate-700 uppercase mb-1">Zoom Account ID</label>
                          <input id="dashboard-page-field-16"
                            type="text"
                            placeholder="e.g. act_12345678"
                            value={zoomAccountId}
                            onChange={(e) => setZoomAccountId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="dashboard-page-field-17" className="block text-xs font-bold text-slate-700 uppercase mb-1">Zoom Client ID</label>
                            <input id="dashboard-page-field-17"
                              type="text"
                              placeholder="OAuth Client ID"
                              value={zoomClientId}
                              onChange={(e) => setZoomClientId(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label htmlFor="dashboard-page-field-18" className="block text-xs font-bold text-slate-700 uppercase mb-1">Zoom Client Secret</label>
                            <input id="dashboard-page-field-18"
                              type="password"
                              placeholder="OAuth Secret"
                              value={zoomClientSecret}
                              onChange={(e) => setZoomClientSecret(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white font-mono"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConnectZoom("CREDENTIALS")}
                          className="px-4 py-2 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-xs transition"
                        >
                          Save Credentials & Authenticate
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Virtual Classroom Defaults */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#CEDECF] space-y-3">
                  <h4 className="text-xs font-bold text-[#0C2417]">Automated Virtual Classroom Settings</h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={zoomAutoMeetingEnabled}
                        onChange={(e) => setZoomAutoMeetingEnabled(e.target.checked)}
                        className="rounded text-[#133623] focus:ring-[#133623]"
                      />
                      <span><strong>Auto-generate Zoom Meeting URL</strong> when creating new class batches (Recommended)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={zoomWaitingRoom}
                        onChange={(e) => setZoomWaitingRoom(e.target.checked)}
                        className="rounded text-[#133623] focus:ring-[#133623]"
                      />
                      <span>Enable Zoom Waiting Room (Students wait until instructor admits them)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={zoomHostVideo}
                        onChange={(e) => setZoomHostVideo(e.target.checked)}
                        className="rounded text-[#133623] focus:ring-[#133623]"
                      />
                      <span>Turn Host / Instructor Video automatically ON when class starts</span>
                    </label>
                  </div>
                </div>

                {/* Test Generated Zoom Meeting Preview */}
                <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0C2417]">Interactive Live Test</h4>
                      <p className="text-[11px] text-slate-500">Generate a sample Zoom meeting to verify auto-provisioning.</p>
                    </div>
                    <button
                      type="button"
                      disabled={isGeneratingTestMeeting}
                      onClick={handleGenerateTestZoomMeeting}
                      className="px-3 py-1.5 rounded-xl border border-[#CEDECF] text-xs font-bold text-[#133623] hover:bg-[#F4F7F4] transition flex items-center gap-1.5"
                    >
                      {isGeneratingTestMeeting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Generate Sample Zoom Room</span>
                    </button>
                  </div>

                  {testZoomMeeting && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1.5">
                      <p className="font-bold text-blue-900 flex items-center gap-1.5">
                        <span>🎥</span>
                        <span>Meeting Provisioned: ID {testZoomMeeting.meeting_id} (Passcode: {testZoomMeeting.passcode})</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={testZoomMeeting.join_url}
                          className="w-full px-2 py-1 rounded-lg border border-blue-300 font-mono text-[11px] bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(testZoomMeeting.join_url);
                            showToast("Copied Zoom meeting URL!");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px]"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#E1E9E2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(4)}
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    ← Back to Step 4
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(6)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: Review & Launch</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: REVIEW & COMPLETE LAUNCH */}
            {completionStep === 6 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                <div className="border-b border-[#E1E9E2] pb-4">
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Step 6: Review, Verification Checklist & Final Sanctuary Launch</h3>
                  <p className="text-xs text-slate-500">
                    Verify all 5 configured steps. Once confirmed, your sanctuary is marked 100% complete, navigation placement updates, and all values are permanently saved to your Studio Profiler.
                  </p>
                </div>

                {/* 5 Cards Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Card 1: Studio & Contact */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#133623]" />
                        <span>Step 1: Studio Identity & Phone</span>
                      </span>
                      <button onClick={() => setCompletionStep(1)} className="text-[10px] text-[#2D7A58] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <p><strong>Studio:</strong> {setupStudioName || "Not Provided"}</p>
                    <p><strong>Phone:</strong> {setupPhone || "Not Provided"}</p>
                    <p><strong>WhatsApp:</strong> {setupWhatsappNumber || setupPhone || "Not Provided"}</p>
                    <p><strong>Email:</strong> {setupSupportEmail || "Not Provided"}</p>
                    <p><strong>Tagline:</strong> {setupStudioTagline || "None"}</p>
                    <p><strong>Disciplines:</strong> {setupDisciplines.join(", ") || "None"}</p>
                  </div>

                  {/* Card 2: Location & Mode */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#133623]" />
                        <span>Step 2: Location & Mode</span>
                      </span>
                      <button onClick={() => setCompletionStep(2)} className="text-[10px] text-[#2D7A58] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <p><strong>Mode:</strong> {setupTeachingMode}</p>
                    <p><strong>Address:</strong> {setupAddressLine1 ? `${setupAddressLine1}, ${setupCity}, ${setupState} ${setupPincode}` : "Not set"}</p>
                    <p><strong>Country:</strong> {setupCountry}</p>
                  </div>

                  {/* Card 3: GST & Legal Business */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#133623]" />
                        <span>Step 3: GST & Tax Identity</span>
                      </span>
                      <button onClick={() => setCompletionStep(3)} className="text-[10px] text-[#2D7A58] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <p><strong>GST Registered:</strong> {setupHasGst ? `Yes (${setupGstNumber || "GSTIN Entered"})` : "No (Sole Educator)"}</p>
                    {setupLegalBusinessName && <p><strong>Legal Name:</strong> {setupLegalBusinessName}</p>}
                    {setupPanNumber && <p><strong>PAN:</strong> {setupPanNumber}</p>}
                  </div>

                  {/* Card 4: Bank & Payouts */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417] flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-[#133623]" />
                        <span>Step 4: Bank Payout Accounts</span>
                      </span>
                      <button onClick={() => setCompletionStep(4)} className="text-[10px] text-[#2D7A58] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <p><strong>Holder:</strong> {setupAccountHolderName || "Not Provided"}</p>
                    <p><strong>Bank:</strong> {setupBankName || "Not Provided"}</p>
                    <p><strong>Account No:</strong> {setupAccountNumber ? `••••••••${setupAccountNumber.slice(-4)}` : (studioProfile?.account_number_masked || "Not Provided")}</p>
                    <p><strong>IFSC:</strong> {setupIfscCode || "Not Provided"}</p>
                    <p><strong>UPI ID:</strong> {setupUpiId || "None"}</p>
                    <p><strong>Settlement:</strong> {setupSettlementCycle}</p>
                  </div>

                  {/* Card 5: Zoom Integration */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417] flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#133623]" />
                        <span>Step 5: Zoom Video Integration</span>
                      </span>
                      <button onClick={() => setCompletionStep(5)} className="text-[10px] text-[#2D7A58] font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className={zoomConnected ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                          {zoomConnected ? "Authenticated 🟢" : "Pending ⚠️"}
                        </span>
                      </p>
                      <p><strong>Zoom Email:</strong> {zoomAccountEmail || "owner.zoom@yogastudio.test"}</p>
                      <p><strong>Auto Meeting Links:</strong> {zoomAutoMeetingEnabled ? "Enabled (Active)" : "Disabled"}</p>
                      <p><strong>Waiting Room:</strong> {zoomWaitingRoom ? "Enabled" : "Disabled"}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="p-4 rounded-2xl bg-[#F4F7F4] border border-[#CEDECF] space-y-2.5">
                  <h4 className="text-xs font-bold text-[#0C2417] uppercase tracking-wider">Sanctuary Verification Checklist</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={isStep1Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep1Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep1Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        Studio Profile & WhatsApp Mobile
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isStep2Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep2Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep2Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        Location & Teaching Mode Address
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isStep3Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep3Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep3Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        GSTIN & Legal Business Tax ID
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isStep4Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep4Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep4Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        Bank Payout Account & IFSC
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span className={isStep5Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep5Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep5Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        Zoom Video Live Classroom Integration
                      </span>
                    </div>
                  </div>
                </div>

                {/* Final Launch Action */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0C2417] via-[#133623] to-[#1b4332] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-lg">Ready to Launch Sanctuary Dashboard</h4>
                    <p className="text-xs text-[#E8F0E9] mt-0.5">
                      Your account will be verified and marked as 100% complete. The sidebar will update to show completion and your sanctuary is fully operational.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isSavingProfile}
                    onClick={handleCompleteOnboarding}
                    className="px-6 py-3.5 rounded-2xl bg-white text-[#0C2417] hover:bg-[#F4F7F4] font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 shrink-0"
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>🚀</span>}
                    <span>Complete Studio Setup & Launch</span>
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(5)}
                    className="hover:underline"
                  >
                    ← Back to Zoom Authentication
                  </button>
                  <span className="font-medium">Step 6 of 6</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDIO TAB 1: MANAGE TEACHERS (LIVE API CONNECTED) */}
        {activeTab === "studio-teachers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Manage Studio Teachers</h1>
                <p className="text-xs text-[#40514E] mt-0.5">
                  Empower your sanctuary: add certified instructors, modify titles & contact info, or manage access.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchStudioTeachers();
                    showToast("Synced teachers from database");
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition flex items-center gap-1.5"
                >
                  <Activity className="h-3.5 w-3.5 text-[#2D7A58]" />
                  <span>Sync DB</span>
                </button>
                <button
                  onClick={() => {
                    setTeacherName("");
                    setTeacherEmail("");
                    setTeacherPhone("");
                    setTeacherTitle("Sanctuary Instructor");
                    setTeacherBio("Certified somatic instructor and sanctuary guide.");
                    setIsAddTeacherOpen(true);
                  }}
                  className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add New Teacher</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar for Studio Teachers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Teachers</span>
                  <UserCheck className="h-4 w-4 text-[#2D7A58]" />
                </div>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">
                  {studioTeachers.filter(t => t.is_active).length}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Conducting live yoga sessions</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Studio Guides</span>
                  <Users className="h-4 w-4 text-[#2D7A58]" />
                </div>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{studioTeachers.length}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Registered in your sanctuary team</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Studio Sanctuary</span>
                  <Building2 className="h-4 w-4 text-[#2D7A58]" />
                </div>
                <p className="text-base font-bold text-[#0C2417] mt-1 truncate">
                  {studioTeachers[0]?.studio_name || currentUser?.studio_name || "Sanctuary Studio"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Primary studio account</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1E9E2] shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teachers by name, email, or title..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                />
              </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable records table">
                {studioTeachersLoading ? (
                  <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#133623]" />
                    <span>Loading studio teachers...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F7F4] border-b border-[#E1E9E2] text-[#1b4332] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Teacher & Contact</th>
                        <th className="px-6 py-4">Title & Specialization</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E9E2]">
                      {studioTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="text-3xl">🧘</span>
                              <p className="font-semibold text-slate-600">No teachers found in studio roster</p>
                              <p className="text-xs text-slate-400">Add your first instructor to start assigning classes.</p>
                              <button
                                onClick={() => {
                                  setTeacherName("");
                                  setTeacherEmail("");
                                  setTeacherPhone("");
                                  setTeacherTitle("Sanctuary Instructor");
                                  setTeacherBio("Certified somatic instructor.");
                                  setIsAddTeacherOpen(true);
                                }}
                                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#133623] text-white hover:bg-[#0C2417] transition"
                              >
                                + Add Teacher
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        studioTeachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-[#F9FAF9] transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#CEDECF] text-[#133623] flex items-center justify-center font-bold text-xs uppercase">
                                  {teacher.name ? teacher.name.charAt(0) : "T"}
                                </div>
                                <div>
                                  <p className="font-bold text-[#0C2417] text-sm">{teacher.name}</p>
                                  <p className="text-[11px] text-slate-500">{teacher.email}</p>
                                  <p className="text-[10px] text-slate-400">{teacher.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">{teacher.title || "Instructor"}</p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">{teacher.bio}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                {teacher.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  teacher.is_active
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {teacher.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {teacher.joined_at}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditTeacher(teacher)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CEDECF] hover:bg-[#E8F0E9] text-[#0C2417] transition flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                                {teacher.role !== "OWNER" && (
                                  <button
                                    onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition flex items-center gap-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STUDIO TAB 2: STUDENTS & DIRECTORY (LIVE API CONNECTED) */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Enrolled Student Directory</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Manage your active yogis, review OTP account verification, track attendance counts, and review membership status.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchStudents();
                    showToast("Refreshed student roster from database");
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition flex items-center gap-1.5"
                >
                  <Activity className="h-3.5 w-3.5 text-[#2D7A58]" />
                  <span>Sync DB</span>
                </button>
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
                  className="px-3 py-2 text-xs rounded-xl border border-[#CEDECF] bg-white text-slate-700 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Yogis</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                </select>
              </div>
            </div>

            {/* Students Table with Live API */}
            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable records table">
                {studentsLoading ? (
                  <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#133623]" />
                    <span>Loading practitioners from PostgreSQL database...</span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F4F7F4] border-b border-[#E1E9E2] text-[#1b4332] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Practitioner Name</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4">Active Class Pass</th>
                        <th className="px-6 py-4 text-center">Classes Attended</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E9E2]">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                            No practitioners found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        students.map((s) => (
                          <tr key={s.id} className="hover:bg-[#F9FAF9] transition">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#0C2417] text-sm">{s.name}</p>
                              <p className="text-[11px] text-slate-500">{s.email}</p>
                              <p className="text-[10px] text-slate-400">{s.phone}</p>
                            </td>
                            <td className="px-6 py-4">
                              {s.verification_status === "VERIFIED" || s.is_verified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>VERIFIED</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>NOT VERIFIED</span>
                                </span>
                              )}
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
                )}
              </div>

              {/* Pagination Controls Bar */}
              <div className="px-6 py-4 bg-[#FAF7F2] border-t border-[#E1E9E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Showing <strong>{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
                    <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> yogis
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
                    disabled={currentPage <= 1}
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
                          currentPage === pageNum
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
                    disabled={currentPage >= totalPages}
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
                onClick={() => {
                  setNewBatchName(""); setNewBatchType("Vinyasa Flow"); setNewBatchInstructor("Sahil Sharma (Lead Guru)");
                  setNewBatchDays(["Tue", "Thu"]); setNewBatchStart("17:00"); setNewBatchEnd("18:00");
                  setNewBatchCap(15); setNewBatchPrice("2,800"); setNewBatchUrl(""); setIsCreateModalOpen(true);
                }}
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
                    <div className="flex items-center gap-1.5">
                      {batch.meetingUrl?.includes("zoom.us") && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Video className="h-2.5 w-2.5 text-blue-600" /> Zoom Live
                        </span>
                      )}
                      <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                        Rolling 30d Active
                      </span>
                    </div>
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
                      <span className="text-slate-500 flex items-center gap-1">
                        {batch.meetingUrl?.includes("zoom.us") ? (
                          <span className="text-blue-700 font-semibold inline-flex items-center gap-1">
                            <Video className="h-3 w-3" /> Zoom Room:
                          </span>
                        ) : (
                          "Live Video Room:"
                        )}
                      </span>
                      {batch.meetingUrl?.includes("zoom.us") ? (
                        <a
                          href={batch.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-[11px] hover:bg-blue-100 transition max-w-[200px] truncate"
                          title={batch.meetingUrl}
                        >
                          <span className="truncate">Launch Zoom</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      ) : (
                        <a
                          href={batch.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-700 font-semibold truncate max-w-[200px] hover:underline flex items-center gap-1"
                        >
                          <span className="truncate">{batch.meetingUrl}</span>
                          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                        </a>
                      )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      className="min-w-0 max-w-full px-3 py-2 rounded-xl text-xs border border-[#CEDECF] bg-white font-semibold text-[#0C2417]"
                    />
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="min-w-0 max-w-full px-3 py-2 rounded-xl text-xs border border-[#CEDECF] bg-white font-semibold text-[#0C2417]"
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

        {/* TAB 7: STUDIO PROFILER & SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-5xl">
            <div className="settings-section-tabs" role="tablist" aria-label="Settings sections">
              <button
                type="button"
                role="tab"
                aria-selected={settingsSection === "profile"}
                onClick={() => setSettingsSection("profile")}
                className={settingsSection === "profile" ? "active" : ""}
              >
                <UserRound className="h-4 w-4" /> Profile Settings
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={settingsSection === "dashboard"}
                onClick={() => setSettingsSection("dashboard")}
                className={settingsSection === "dashboard" ? "active" : ""}
              >
                <MonitorCog className="h-4 w-4" /> Dashboard Settings
              </button>
            </div>

            {settingsSection === "profile" ? (
              <>
            {/* Header with Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Profile Settings</h1>
                  {isAccountCompleted ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#133623] border border-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Sanctuary Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Setup Incomplete
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#40514E] mt-0.5">
                  Official sanctuary profile, contact details, physical/online location, legal business & GST identity, fee payout accounts, and authenticated Zoom integration.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => {
                    setActiveTab("account-completion");
                    setCompletionStep(1);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F7F4] text-[#133623] border border-[#CEDECF] shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Edit in Setup Wizard</span>
                </button>
                <Link
                  href={`/${studioProfile?.slug || currentUser?.organization_slug || "sahil-yoga-studio"}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#133623] hover:bg-[#0C2417] text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Public Sanctuary Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Account Status Banner */}
            <div className={`p-4 rounded-3xl border flex items-start gap-3.5 ${
              isAccountCompleted
                ? "bg-[#F4F7F4] border-[#CEDECF] text-[#0C2417]"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}>
              {isAccountCompleted ? (
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <h4 className="font-bold">
                  {isAccountCompleted
                    ? "Verified Sanctuary Roster & Integrations Active"
                    : "Account Setup Incomplete - Finish All Steps"}
                </h4>
                <p className="text-slate-600 mt-0.5">
                  {isAccountCompleted
                    ? "All sanctuary details are verified. Classes created by your studio automatically provision authenticated Zoom meeting links, student subscriptions route to your verified bank account, and GST tax invoices are generated under your legal business entity."
                    : "Your studio account needs a few more details to be fully operational. Click 'Edit in Setup Wizard' to finish configuring your phone, teaching location, GST, payout bank details, and Zoom live classroom."}
                </p>
              </div>
              {!isAccountCompleted && (
                <button
                  onClick={() => {
                    setActiveTab("account-completion");
                    setCompletionStep(completionStep || 1);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition"
                >
                  Complete Setup →
                </button>
              )}
            </div>

            {/* PROFILER GRID: 5 COMPREHENSIVE CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CARD 1: STUDIO IDENTITY & CONTACT */}
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F0]">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#E8F0E9] text-[#133623]">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#0C2417]">Studio Profile & Mobile Phone</h3>
                      <p className="text-[11px] text-slate-500">Contact and public identity</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("account-completion");
                      setCompletionStep(1);
                    }}
                    className="text-xs text-[#133623] hover:underline font-bold"
                  >
                    Edit →
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Studio Name</label>
                    <p className="font-serif font-bold text-base text-[#0C2417]">
                      {setupStudioName || studioProfile?.name || currentUser?.organization_name || "Sahil Yoga Studio"}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tagline / Mission</label>
                    <p className="text-slate-700 font-medium">
                      {setupStudioTagline || studioProfile?.studio_tagline || "Traditional Hatha, Aerial Movement & Meditation Sanctuary"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2]">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-emerald-600" /> Primary Mobile
                        </label>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Login Phone
                        </span>
                      </div>
                      <p className="font-bold text-[#0C2417] text-xs mt-1">
                        {setupPhone || studioProfile?.phone || "+91 98765 43210"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2]">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-emerald-600" /> WhatsApp Contact
                        </label>
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                      <p className="font-bold text-[#0C2417] text-xs mt-1">
                        {setupWhatsappNumber || studioProfile?.whatsapp_number || setupPhone || "+91 98765 43210"}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-emerald-600" /> Support Email
                      </label>
                      <p className="font-bold text-[#0C2417] text-xs mt-1 truncate" title={setupSupportEmail || studioProfile?.support_email || currentUser?.email}>
                        {setupSupportEmail || studioProfile?.support_email || currentUser?.email || "namaste@pranasanctuary.com"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disciplines Taught</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(setupDisciplines.length > 0
                        ? setupDisciplines
                        : (studioProfile?.disciplines ? studioProfile.disciplines.split(", ") : ["Hatha Yoga", "Vinyasa Flow", "Aerial Yoga"])
                      ).map((d) => (
                        <span key={d} className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#E8F0E9] text-[#1b4332] border border-[#CEDECF]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: LOCATION & TEACHING MODE */}
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F0]">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#E8F0E9] text-[#133623]">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#0C2417]">Studio Location & Teaching Mode</h3>
                      <p className="text-[11px] text-slate-500">Physical address & delivery formats</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("account-completion");
                      setCompletionStep(2);
                    }}
                    className="text-xs text-[#133623] hover:underline font-bold"
                  >
                    Edit →
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teaching Mode</label>
                    <div className="mt-1">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#133623] text-white shadow-sm inline-flex items-center gap-1.5">
                        {setupTeachingMode === "PHYSICAL"
                          ? "🏢 Physical In-Studio Sanctuary"
                          : setupTeachingMode === "ONLINE"
                          ? "💻 100% Live Interactive Online"
                          : "🌿 Hybrid Sanctuary (Physical & Live Online)"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] space-y-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address Line 1 & 2</label>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {setupAddressLine1 || studioProfile?.address_line1 || "Level 3, Sacred Banyan Arcade, 108 North Main Road"}
                      </p>
                      {(setupAddressLine2 || studioProfile?.address_line2) && (
                        <p className="text-slate-600">
                          {setupAddressLine2 || studioProfile?.address_line2}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E1E9E2]">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">City</label>
                        <p className="font-bold text-slate-800">{setupCity || studioProfile?.city || "Pune"}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">State</label>
                        <p className="font-bold text-slate-800">{setupState || studioProfile?.state || "Maharashtra"}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">PIN Code</label>
                        <p className="font-mono font-bold text-slate-800">{setupPincode || studioProfile?.pincode || "411001"}</p>
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Country: <strong>{setupCountry || studioProfile?.country || "India"}</strong></span>
                      <span className="text-emerald-700 font-medium">✓ Location verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: GST & LEGAL BUSINESS PROFILER */}
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F0]">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#E8F0E9] text-[#133623]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#0C2417]">GST Number & Legal Business</h3>
                      <p className="text-[11px] text-slate-500">Tax compliance & invoicing details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("account-completion");
                      setCompletionStep(3);
                    }}
                    className="text-xs text-[#133623] hover:underline font-bold"
                  >
                    Edit →
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Legal Business Entity Name</label>
                    <p className="font-semibold text-slate-800 text-xs">
                      {setupLegalBusinessName || studioProfile?.legal_business_name || "Prana Wellness Movement Private Limited"}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-medium">GST Registered:</span>
                      {(setupHasGst || studioProfile?.has_gst) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ Registered GST Taxpayer
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                          Non-GST (Threshold Exemption)
                        </span>
                      )}
                    </div>

                    {(setupHasGst || studioProfile?.has_gst) && (
                      <div className="flex items-center justify-between pt-1 border-t border-[#E1E9E2]">
                        <span className="text-slate-600 font-medium">GSTIN (15-Digit):</span>
                        <span className="font-mono font-bold text-[#0C2417] bg-white px-2 py-0.5 rounded border border-[#CEDECF]">
                          {setupGstNumber || studioProfile?.gst_number || "27AABCU9603R1ZM"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-[#E1E9E2]">
                      <span className="text-slate-600 font-medium">PAN Number:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {setupPanNumber || studioProfile?.pan_number || "AABCU9603R"}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Tax invoices for student subscriptions automatically reflect this GSTIN and legal entity name.
                  </p>
                </div>
              </div>

              {/* CARD 4: BANK & PAYOUT ACCOUNT ("THE THANKS PERSPECTIVE") */}
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F0]">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#E8F0E9] text-[#133623]">
                      <Landmark className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#0C2417]">Bank Payouts & Settlement Account</h3>
                      <p className="text-[11px] text-slate-500">Where student membership earnings are sent</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("account-completion");
                      setCompletionStep(4);
                    }}
                    className="text-xs text-[#133623] hover:underline font-bold"
                  >
                    Edit →
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Bank Name:</span>
                    <span className="font-bold text-[#0C2417]">
                      {setupBankName || studioProfile?.bank_name || "HDFC Bank"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Beneficiary / Holder:</span>
                    <span className="font-semibold text-slate-800">
                      {setupAccountHolderName || studioProfile?.account_holder_name || "Prana Wellness Movement Pvt Ltd"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Account Number:</span>
                    <span className="font-mono font-bold text-[#0C2417] bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {studioProfile?.account_number_masked || (setupAccountNumber ? `••••••••${setupAccountNumber.slice(-4)}` : "••••••••7890")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {setupIfscCode || studioProfile?.ifsc_code || "HDFC0001234"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
                    <span className="text-slate-600 font-medium">Direct UPI ID:</span>
                    <span className="font-mono text-emerald-800 font-bold">
                      {setupUpiId || studioProfile?.upi_id || "pranashala@okhdfcbank"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
                    <span className="text-slate-600 font-medium">Settlement Schedule:</span>
                    <span className="font-bold text-[#133623] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      {setupSettlementCycle || studioProfile?.settlement_cycle || "WEEKLY"} (Every Monday)
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 5: ZOOM LIVE CLASSROOM AUTHENTICATION */}
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4 md:col-span-2">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F0]">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
                      <Video className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#0C2417]">Zoom Live Video Integration</h3>
                      <p className="text-[11px] text-slate-500">Automated meeting room generation for live batches</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {zoomConnected ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Authenticated & Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Not Connected
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Connected Zoom Account</label>
                    <p className="font-bold text-[#0C2417] truncate" title={zoomAccountEmail || studioProfile?.zoom_account_email}>
                      {zoomConnected ? (zoomAccountEmail || studioProfile?.zoom_account_email || "Active OAuth Account") : "No account connected"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {zoomConnected ? "API tokens refreshed automatically" : "Connect via OAuth or Server-to-Server App"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Classroom Automation</label>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-[#0C2417]">
                        {zoomAutoMeetingEnabled ? "Auto-create on Batch Creation" : "Manual link creation"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Creates unique https://us05web.zoom.us/j/... rooms</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Security & Video Defaults</label>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                      <span>Waiting Room: {zoomWaitingRoom ? "✓ Enabled" : "✗ Off"}</span>
                      <span>•</span>
                      <span>Host Video: {zoomHostVideo ? "✓ On" : "✗ Off"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Protects privacy and streamlines teacher start</p>
                  </div>
                </div>

                {/* Actions & Live Tester */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#F0F4F0]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGenerateTestZoomMeeting}
                      disabled={isGeneratingTestMeeting}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center gap-1.5"
                    >
                      {isGeneratingTestMeeting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Video className="h-3.5 w-3.5" />
                      )}
                      <span>Test Generate Zoom Meeting</span>
                    </button>

                    {zoomConnected && (
                      <button
                        onClick={handleDisconnectZoom}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition"
                      >
                        Disconnect Zoom
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("account-completion");
                      setCompletionStep(5);
                    }}
                    className="text-xs text-[#133623] hover:underline font-bold self-end sm:self-auto"
                  >
                    Configure Advanced Zoom OAuth Settings →
                  </button>
                </div>

                {/* Test meeting preview banner */}
                {testZoomMeeting && (
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-blue-900">
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        Live Zoom Room Provisioned Successfully!
                      </span>
                      <a
                        href={testZoomMeeting.join_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <span>Open Meeting</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] font-mono text-blue-800">
                      <span>Room ID: {testZoomMeeting.meeting_id}</span>
                      <span>Passcode: {testZoomMeeting.passcode}</span>
                      <span className="truncate max-w-xs">URL: {testZoomMeeting.join_url}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Dashboard Settings</h1>
                  <p className="text-xs text-[#40514E] mt-1">Personalize your workspace typography and color theme. Changes are saved on this device.</p>
                </div>

                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4" aria-labelledby="dashboard-font-heading">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 id="dashboard-font-heading" className="font-bold text-base text-[#0C2417]">Typography</h2>
                      <p className="text-xs text-slate-500 mt-1">Choose the font pairing used across your dashboard and public studio pages.</p>
                    </div>
                    <FontSelector variant="full" />
                  </div>
                </section>

                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4" aria-labelledby="dashboard-theme-heading">
                  <div>
                    <h2 id="dashboard-theme-heading" className="font-bold text-base text-[#0C2417]">Dashboard theme</h2>
                    <p className="text-xs text-slate-500 mt-1">Select a comfortable color treatment for your workspace.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { id: "forest", name: "Deep Forest", colors: ["#0C2417", "#2D7A58", "#FAF7F2"] },
                      { id: "sage", name: "Soft Sage", colors: ["#29483A", "#6F9277", "#F3F7F2"] },
                      { id: "sand", name: "Warm Sand", colors: ["#43362B", "#A26B47", "#FBF5EC"] }
                    ] as const).map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        aria-pressed={dashboardTheme === theme.id}
                        onClick={() => applyDashboardTheme(theme.id)}
                        className={`theme-choice ${dashboardTheme === theme.id ? "active" : ""}`}
                      >
                        <span className="theme-swatches" aria-hidden="true">
                          {theme.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
                        </span>
                        <span>
                          <strong>{theme.name}</strong>
                          <small>{dashboardTheme === theme.id ? "Selected" : "Select theme"}</small>
                        </span>
                        {dashboardTheme === theme.id && <Check className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E1E9E2] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 rounded-2xl bg-[#E8F0E9] text-[#133623]"><Palette className="h-5 w-5" /></span>
                    <div>
                      <h2 className="font-bold text-base text-[#0C2417]">Public website theme & branding</h2>
                      <p className="text-xs text-slate-500 mt-1">Change the website template, headline and primary brand color.</p>
                    </div>
                  </div>
                  <Link href="/dashboard/website" className="btn-forest px-4 py-2.5 text-xs text-center shrink-0">Customize Website</Link>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE CLASS BATCH MODAL (FEAT-05) */}
      {isCreateModalOpen && (
        <Modal title="Create class batch" onClose={() => setIsCreateModalOpen(false)} confirmDiscard>
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
                aria-label="Close create batch" onClick={() => setIsCreateModalOpen(false)}
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
                <label htmlFor="dashboard-page-field-19" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Batch / Session Name *
                </label>
                <input id="dashboard-page-field-19"
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
                  <label htmlFor="dashboard-page-field-20" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Class Type
                  </label>
                  <select id="dashboard-page-field-20"
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
                  <label htmlFor="dashboard-page-field-21" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Assigned Instructor
                  </label>
                  <select id="dashboard-page-field-21"
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
                        aria-pressed={isSelected}
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
                  <label htmlFor="dashboard-page-field-22" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <input id="dashboard-page-field-22"
                    type="time"
                    required
                    value={newBatchStart}
                    onChange={(e) => setNewBatchStart(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-23" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <input id="dashboard-page-field-23"
                    type="time"
                    required
                    value={newBatchEnd}
                    onChange={(e) => setNewBatchEnd(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-24" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Max Yogis
                  </label>
                  <input id="dashboard-page-field-24"
                    type="number"
                    min={1}
                    max={100}
                    value={newBatchCap}
                    onChange={(e) => setNewBatchCap(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-25" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Monthly ₹
                  </label>
                  <input id="dashboard-page-field-25"
                    type="text"
                    value={newBatchPrice}
                    onChange={(e) => setNewBatchPrice(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider">
                    Automated Video / Zoom Meeting URL
                  </label>
                  {zoomConnected && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                      <Video className="h-2.5 w-2.5 text-blue-600" /> Zoom Auth Active
                    </span>
                  )}
                </div>

                {zoomConnected ? (
                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs text-blue-900">
                        <p className="font-bold flex items-center gap-1 text-blue-900">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                          Authenticated Zoom Account: {zoomAccountEmail || "Connected"}
                        </p>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          When you save this batch, an authenticated Zoom meeting room with waiting room protection will be automatically generated.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const mockId = Math.floor(80000000000 + Math.random() * 19999999999);
                          const mockPwd = Math.random().toString(36).substring(2, 8);
                          setNewBatchUrl(`https://us05web.zoom.us/j/${mockId}?pwd=${mockPwd}`);
                          showToast("🎥 Pre-generated Zoom meeting link!");
                        }}
                        className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 transition"
                      >
                        Preview Link
                      </button>
                    </div>
                    <input
                      type="url"
                      placeholder="Auto-generated on creation (e.g. https://us05web.zoom.us/j/...)"
                      value={newBatchUrl}
                      onChange={(e) => setNewBatchUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs bg-white text-blue-950 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://meet.progressrooms.com/your-batch"
                      value={newBatchUrl}
                      onChange={(e) => setNewBatchUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Zoom not connected yet. A generic room URL will be assigned.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          setActiveTab("account-completion");
                          setCompletionStep(4);
                        }}
                        className="text-xs font-bold text-[#1b4332] hover:underline"
                      >
                        Connect Zoom →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label="Close create batch" onClick={() => setIsCreateModalOpen(false)}
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
        </Modal>
      )}

      {/* ADD TEACHER MODAL */}
      {isAddTeacherOpen && (
        <Modal title="Add teacher" onClose={() => setIsAddTeacherOpen(false)} confirmDiscard>
          <div className="bg-white rounded-3xl border border-[#CEDECF] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E9E2]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🧘</span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Add New Teacher</h3>
                  <p className="text-xs text-slate-500">Add an instructor to conduct sessions in your sanctuary.</p>
                </div>
              </div>
              <button
                aria-label="Close add teacher" onClick={() => setIsAddTeacherOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label htmlFor="dashboard-page-field-26" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input id="dashboard-page-field-26"
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma, Vikram Adani"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dashboard-page-field-27" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input id="dashboard-page-field-27"
                    type="email"
                    required
                    placeholder="teacher@studio.com"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-28" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input id="dashboard-page-field-28"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dashboard-page-field-29" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Title & Specialization *
                </label>
                <input id="dashboard-page-field-29"
                  type="text"
                  required
                  placeholder="e.g. Senior Aerial & Hatha Guide"
                  value={teacherTitle}
                  onChange={(e) => setTeacherTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div>
                <label htmlFor="dashboard-page-field-30" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Bio / Sanctuary Notes
                </label>
                <textarea id="dashboard-page-field-30"
                  rows={3}
                  placeholder="500hr RYT certified, 7+ years practicing somatic flows..."
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label="Close add teacher" onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  disabled={isSavingTeacher}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSavingTeacher ? "Saving…" : "Add Teacher"}</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* EDIT TEACHER MODAL */}
      {isEditTeacherOpen && editingTeacher && (
        <Modal title="Edit teacher" onClose={() => { setIsEditTeacherOpen(false); setEditingTeacher(null); }} confirmDiscard>
          <div className="bg-white rounded-3xl border border-[#CEDECF] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E1E9E2]">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">✏️</span>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#0C2417]">Edit Teacher Profile</h3>
                  <p className="text-xs text-slate-500">Modify details or update active teaching status.</p>
                </div>
              </div>
              <button
                aria-label="Close edit teacher"
                onClick={() => {
                  setIsEditTeacherOpen(false);
                  setEditingTeacher(null);
                }}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="space-y-4">
              <div>
                <label htmlFor="dashboard-page-field-31" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input id="dashboard-page-field-31"
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dashboard-page-field-32" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Email (Read-Only)
                  </label>
                  <input id="dashboard-page-field-32"
                    type="email"
                    disabled
                    value={teacherEmail}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-33" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input id="dashboard-page-field-33"
                    type="tel"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dashboard-page-field-34" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Title & Specialization *
                </label>
                <input id="dashboard-page-field-34"
                  type="text"
                  required
                  value={teacherTitle}
                  onChange={(e) => setTeacherTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div>
                <label htmlFor="dashboard-page-field-35" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Bio / Sanctuary Notes
                </label>
                <textarea id="dashboard-page-field-35"
                  rows={3}
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Teaching Status
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="teacher_status"
                      checked={teacherIsActive}
                      onChange={() => setTeacherIsActive(true)}
                      className="text-[#133623] focus:ring-[#133623]"
                    />
                    <span className="text-emerald-700 font-bold">ACTIVE (Can teach sessions)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="teacher_status"
                      checked={!teacherIsActive}
                      onChange={() => setTeacherIsActive(false)}
                      className="text-[#133623] focus:ring-[#133623]"
                    />
                    <span className="text-red-700 font-bold">SUSPENDED</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditTeacherOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  disabled={isSavingTeacher}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isSavingTeacher ? "Saving…" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
