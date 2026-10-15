"use client";

import { DeveloperOnly } from "@/components/DeveloperModeProvider";
import { StudentDetails } from "@/components/StudentDetails";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { StudioClasses } from "@/components/StudioClasses";
import { StudioMemberships } from "@/components/StudioMemberships";
import { staffApi } from "@/lib/staff-api";
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
  AlertCircle,
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
  MonitorCog,
  HelpCircle,
  Share2
} from "lucide-react";
import { AttendanceCalendar, CalendarSessionEvent } from "@/components/AttendanceCalendar";
import { BrandLogo } from "@/components/BrandLogo";
import { Modal } from "@/components/Modal";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { useFeedback } from "@/components/FeedbackProvider";
import WebsiteEditor from "@/components/website/WebsiteEditor";
import { BillingCenter } from "@/components/BillingCenter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type AdminTab =
  // Studio Operations
  | "account-completion"
  | "studio-teachers"
  | "students"
  | "classes-plans"
  | "subscriptions-manager"
  | "attendance-tracker"
  | "my-website"
  | "queries-manager"
  | "analytics"
  | "billing-dashboard"
  | "billing-downloads"
  | "settings"
  // Super Admin Platform Tabs
  | "superadmin-instructors"
  | "superadmin-analytics"
  | "superadmin-settings";

type SettingsSection = "profile" | "dashboard";
type DashboardTheme = "forest" | "sage" | "sand" | "midnight" | "obsidian" | "plum";

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
  username?: string;
  address?: string;
  location?: string;
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
  teacher_code?: string;
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
  status: "ACTIVE" | "EXPIRING_SOON" | "INACTIVE" | "SUSPENDED";
  is_verified?: boolean;
  verification_status?: "VERIFIED" | "NOT VERIFIED";
  account_status?: string;
}

const formatStudioDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

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



export default function DashboardAccess() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    staffApi("/auth/me").then(async user => {
      if (user.role === "STUDENT") { router.replace("/student"); return; }
      const previous = JSON.parse(localStorage.getItem("pr_user") || "{}");
      const activeStudioId = localStorage.getItem("pr_active_studio_id") || previous.organization_id;
      const context = await staffApi(`/auth/context${activeStudioId ? `?studio_id=${encodeURIComponent(activeStudioId)}` : ""}`);
      const activeOrg = context.organizations?.find((o: any) => o.id === activeStudioId) || context.organizations?.[0];
      const mergedUser = {
        ...previous,
        ...user,
        ...context,
        organization_id: activeOrg?.id || context.organization_id,
        organization_name: activeOrg?.name || context.organization_name,
        organization_slug: activeOrg?.slug || context.organization_slug,
        teacher_code: activeOrg?.teacher_code || context.teacher_code,
      };
      localStorage.setItem("pr_user", JSON.stringify(mergedUser));
      if (activeOrg?.id) localStorage.setItem("pr_active_studio_id", activeOrg.id);
      setAllowed(true);
    }).catch(() => router.replace("/login"));
  }, [router]);
  return allowed ? <AdminDashboardPage /> : <p className="p-8">Loading your workspace…</p>;
}

function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("account-completion");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("profile");
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>("forest");
  const { notify, confirm: confirmAction } = useFeedback();

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("progressnow_dashboard_theme");
      if (["forest", "sage", "sand", "midnight", "obsidian", "plum"].includes(savedTheme || "")) setDashboardTheme(savedTheme as DashboardTheme);
    } catch { /* Use the default theme when storage is unavailable. */ }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AdminTab | null;
      if (tabParam && [
        "account-completion",
        "studio-teachers",
        "students",
        "classes-plans",
        "subscriptions-manager",
        "attendance-tracker",
        "my-website",
        "queries-manager",
        "analytics",
        "billing-dashboard",
        "billing-downloads",
        "settings",
        "superadmin-instructors",
        "superadmin-analytics",
        "superadmin-settings"
      ].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const navigateToTab = (tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

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
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("pr_user") : null;
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isTeacher = currentUser?.role === "TEACHER" || currentUser?.role === "INSTRUCTOR";
  const isStudioOwner = !isSuperAdmin && !isTeacher;

  // Teacher Profile form states (for Settings when role is TEACHER)
  const [teacherProfileName, setTeacherProfileName] = useState("");
  const [teacherProfilePhone, setTeacherProfilePhone] = useState("");
  const [teacherProfileAddress, setTeacherProfileAddress] = useState("");
  const [teacherProfileLocation, setTeacherProfileLocation] = useState("");
  const [isSavingTeacherProfile, setIsSavingTeacherProfile] = useState(false);



  // Live Class Attendance state (for Attendance Tracker live occurrence marking)
  const [liveAttendanceDate, setLiveAttendanceDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [liveAttendanceClasses, setLiveAttendanceClasses] = useState<any[]>([]);
  const [selectedLiveClassId, setSelectedLiveClassId] = useState("");
  const [liveRoster, setLiveRoster] = useState<any[]>([]);
  const [isLiveRosterLoading, setIsLiveRosterLoading] = useState(false);
  const [isMarkingLiveAttendance, setIsMarkingLiveAttendance] = useState(false);

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
  const [testZoomMeeting, setTestZoomMeeting] = useState<{
    join_url: string;
    passcode: string;
    meeting_id: string;
    provider?: string;
    is_simulated?: boolean;
    start_url?: string;
  } | null>(null);
  const [isGeneratingTestMeeting, setIsGeneratingTestMeeting] = useState(false);
  const [zoomTestError, setZoomTestError] = useState<string | null>(null);

  // Helper validation functions
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = (phone: string) => phone.replace(/\D/g, "").length >= 10;
  const isValidPin = (pin: string) => pin.replace(/\D/g, "").length >= 5;
  const isValidPan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan.trim());
  const isValidGstin = (gst: string) => gst.trim().length === 15;
  const isValidIfsc = (ifsc: string) => ifsc.trim().length === 11;

  // Exact step-by-step verification checks
  const isStep1Complete = Boolean(
    setupStudioName?.trim() &&
    isValidPhone(setupPhone) &&
    isValidEmail(setupSupportEmail) &&
    setupDisciplines?.length > 0
  );

  const isStep2Complete = Boolean(
    setupTeachingMode &&
    setupAddressLine1?.trim() &&
    setupCity?.trim() &&
    setupState?.trim() &&
    isValidPin(setupPincode)
  );

  const isStep3Complete = setupHasGst
    ? Boolean(isValidGstin(setupGstNumber) && setupLegalBusinessName?.trim())
    : Boolean(setupPanNumber?.trim() && isValidPan(setupPanNumber));

  const isStep4Complete = Boolean(
    setupBankName?.trim() &&
    setupAccountHolderName?.trim() &&
    ((setupAccountNumber?.trim() && setupAccountNumber?.trim() === setupConfirmAccountNumber?.trim() && setupAccountNumber?.trim().length >= 6) ||
      Boolean(studioProfile?.account_number_masked)) &&
    isValidIfsc(setupIfscCode)
  );

  const isStep5Complete = Boolean(zoomConnected);
  const isStep6Complete = Boolean(
    isStep1Complete &&
    isStep2Complete &&
    isStep3Complete &&
    isStep4Complete &&
    isStep5Complete &&
    isAccountCompleted
  );

  const checkStepCompleted = (stepNum: number): boolean => {
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

  const getFirstIncompleteStep = (): number => {
    if (!isStep1Complete) return 1;
    if (!isStep2Complete) return 2;
    if (!isStep3Complete) return 3;
    if (!isStep4Complete) return 4;
    if (!isStep5Complete) return 5;
    return 6;
  };

  const handleOpenAccountDetails = () => {
    const stepToLoad = getFirstIncompleteStep();
    setCompletionStep(stepToLoad);
    setActiveTab("account-completion");
  };

  const validateStep = (stepNum: number): { valid: boolean; errorMsg?: string } => {
    switch (stepNum) {
      case 1:
        if (!setupStudioName.trim()) return { valid: false, errorMsg: "Please enter your Studio / Sanctuary Name." };
        if (!setupPhone.trim() || !isValidPhone(setupPhone)) return { valid: false, errorMsg: "Please provide a valid 10+ digit Mobile Phone Number." };
        if (!setupSupportEmail.trim() || !isValidEmail(setupSupportEmail)) return { valid: false, errorMsg: "Please provide a valid Support / Business Email address." };
        if (!setupDisciplines.length) return { valid: false, errorMsg: "Please select at least one teaching discipline." };
        return { valid: true };
      case 2:
        if (!setupAddressLine1.trim()) return { valid: false, errorMsg: "Please provide your Studio Street Address / Location." };
        if (!setupCity.trim()) return { valid: false, errorMsg: "Please enter the City." };
        if (!setupState.trim()) return { valid: false, errorMsg: "Please enter the State." };
        if (!setupPincode.trim() || !isValidPin(setupPincode)) return { valid: false, errorMsg: "Please provide a valid 5-6 digit PIN / Postal Code." };
        return { valid: true };
      case 3:
        if (setupHasGst) {
          if (!setupGstNumber.trim() || !isValidGstin(setupGstNumber)) return { valid: false, errorMsg: "Please enter a valid 15-character GSTIN (e.g. 27AABCU9603R1ZM)." };
          if (!setupLegalBusinessName.trim()) return { valid: false, errorMsg: "Please enter your Legal Entity Name as per GST certificate." };
        } else {
          if (!setupPanNumber.trim() || !isValidPan(setupPanNumber)) return { valid: false, errorMsg: "Please provide a valid 10-character PAN number (e.g. AABCU9603R)." };
        }
        return { valid: true };
      case 4:
        if (!setupAccountHolderName.trim()) return { valid: false, errorMsg: "Please enter the Bank Account Holder Name." };
        if (!setupBankName.trim()) return { valid: false, errorMsg: "Please enter the Bank Name." };
        if (!studioProfile?.account_number_masked && !setupAccountNumber.trim()) {
          return { valid: false, errorMsg: "Please enter your Bank Account Number." };
        }
        if (setupAccountNumber.trim() && setupAccountNumber.trim() !== setupConfirmAccountNumber.trim()) {
          return { valid: false, errorMsg: "Bank Account Number and Confirm Account Number must match." };
        }
        if (!setupIfscCode.trim() || !isValidIfsc(setupIfscCode)) return { valid: false, errorMsg: "Please provide a valid 11-character Bank IFSC Code." };
        return { valid: true };
      case 5:
        if (!zoomConnected) return { valid: false, errorMsg: "Please authenticate and connect your Zoom account to enable live class streaming." };
        return { valid: true };
      default:
        return { valid: true };
    }
  };

  const completedStepsCount = [
    isStep1Complete,
    isStep2Complete,
    isStep3Complete,
    isStep4Complete,
    isStep5Complete
  ].filter(Boolean).length;

  const calculatedPercentage = isStep6Complete
    ? 100
    : Math.round((completedStepsCount / 5) * 100);

  const displayPercentage = isStep6Complete ? 100 : calculatedPercentage;


  // Studio Teachers Management State
  const [studioTeachers, setStudioTeachers] = useState<StudioTeacher[]>([]);
  const [studioTeachersLoading, setStudioTeachersLoading] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherPageSize, setTeacherPageSize] = useState(10);
  const [teacherTotal, setTeacherTotal] = useState(0);
  const [teacherActiveTotal, setTeacherActiveTotal] = useState(0);
  const [teacherTotalPages, setTeacherTotalPages] = useState(1);
  const [teacherSortBy, setTeacherSortBy] = useState<"name" | "code" | "joined" | "status">("name");
  const [teacherSortOrder, setTeacherSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<StudioTeacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<StudioTeacher | null>(null);

  // Add / Edit Teacher form fields
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherAddress, setTeacherAddress] = useState("");
  const [teacherLocation, setTeacherLocation] = useState("");
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("pr_access_token") || ""}` });
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
  const [students, setStudents] = useState<Student[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [studentSortBy, setStudentSortBy] = useState<"name" | "status" | "joined">("name");
  const [studentSortOrder, setStudentSortOrder] = useState<"asc" | "desc">("asc");
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentAdmissionEmail, setStudentAdmissionEmail] = useState("");
  const [studentAdmissionClassId, setStudentAdmissionClassId] = useState("");
  const [studentAdmissionClasses, setStudentAdmissionClasses] = useState<any[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

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
  const [attendanceType, setAttendanceType] = useState<"teacher" | "student">(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("pr_user") : null;
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === "TEACHER" || u.role === "INSTRUCTOR") return "student";
      }
    } catch {}
    return "teacher";
  });
  const [attendancePeriod, setAttendancePeriod] = useState<"month" | "day">("month");
  const [attendancePersonSearch, setAttendancePersonSearch] = useState("");
  const [attendanceTeachers, setAttendanceTeachers] = useState<StudioTeacher[]>([]);
  const [attendanceStudents, setAttendanceStudents] = useState<Student[]>([]);
  const [selectedAttendanceTeacher, setSelectedAttendanceTeacher] = useState<StudioTeacher | null>(null);
  const [selectedAttendanceStudent, setSelectedAttendanceStudent] = useState<Student | null>(null);
  const [attendancePeopleLoading, setAttendancePeopleLoading] = useState(false);
  const [attendanceSuggestionsOpen, setAttendanceSuggestionsOpen] = useState(false);
  const attendanceSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (attendanceSearchContainerRef.current && !attendanceSearchContainerRef.current.contains(e.target as Node)) {
        setAttendanceSuggestionsOpen(false);
      }
    }
    if (attendanceSuggestionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [attendanceSuggestionsOpen]);

  const [attendanceMonth, setAttendanceMonth] = useState(() => new Date().toLocaleDateString("en-CA").slice(0, 7));
  const [attendanceCalendarLoading, setAttendanceCalendarLoading] = useState(false);
  const [attendanceCalendarError, setAttendanceCalendarError] = useState("");
  const [attendanceEvents, setAttendanceEvents] = useState<CalendarSessionEvent[]>([]);
  const [focusedClassTitle, setFocusedClassTitle] = useState<string | null>(null);
  const [rosterSearch, setRosterSearch] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"ALL" | "ATTENDED" | "ABSENT" | "EXCUSED" | "UNMARKED">("ALL");
  const [markingEnrollmentId, setMarkingEnrollmentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedBatchId, setSelectedBatchId] = useState("batch-1");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, "ATTENDED" | "ABSENT">>({
    "student-1": "ATTENDED",
    "student-2": "ATTENDED",
    "student-3": "ABSENT",
    "student-4": "ATTENDED",
    "student-5": "ATTENDED",
  });

  const openAttendanceFor = (type: "teacher" | "student", person?: StudioTeacher | Student) => {
    const isTeacherUser = currentUser?.role === "TEACHER" || currentUser?.role === "INSTRUCTOR";
    const targetType = isTeacherUser ? "student" : type;
    setAttendanceType(targetType);
    setAttendancePeriod("month");
    setAttendanceSuggestionsOpen(false);
    setActiveTab("attendance-tracker");

    if (person) {
      setAttendancePersonSearch(person.name);
      if (targetType === "teacher") {
        setSelectedAttendanceTeacher(person as StudioTeacher);
      } else {
        setSelectedAttendanceStudent(person as Student);
      }
    } else {
      if (targetType === "teacher") {
        const teacher = selectedAttendanceTeacher || (attendanceTeachers.length > 0 ? attendanceTeachers[0] : null);
        if (teacher) {
          setSelectedAttendanceTeacher(teacher);
          setAttendancePersonSearch(teacher.name);
        } else {
          setAttendancePersonSearch("");
        }
      } else {
        const student = selectedAttendanceStudent || (attendanceStudents.length > 0 ? attendanceStudents[0] : null);
        if (student) {
          setSelectedAttendanceStudent(student);
          setAttendancePersonSearch(student.name);
        } else {
          setAttendancePersonSearch("");
        }
      }
    }
  };

  // Fetch live occurrence classes for attendance tracking
  useEffect(() => {
    if (activeTab !== "attendance-tracker") return;
    const orgId = currentUser?.organization_id;
    if (!orgId) return;
    const start = new Date(`${liveAttendanceDate}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() - 1);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 3);

    staffApi(
      `/organizations/${orgId}/occurrences?start_date=${encodeURIComponent(start.toISOString())}&end_date=${encodeURIComponent(end.toISOString())}`
    )
      .then((data: any[]) => {
        const matching = (data || [])
          .filter(
            (item: any) =>
              new Date(item.start_at).toLocaleDateString("en-CA") === liveAttendanceDate
          )
          .map((item: any) => ({
            ...item,
            name: item.session_name || item.name || "Scheduled Class",
          }));
        setLiveAttendanceClasses(matching);
        if (matching.length && !selectedLiveClassId) {
          loadLiveRoster(matching[0].id);
        }
      })
      .catch((err) => console.warn("Failed to fetch live classes", err));
  }, [activeTab, liveAttendanceDate, currentUser?.organization_id]);

  const loadLiveRoster = async (classId: string) => {
    setSelectedLiveClassId(classId);
    setRosterSearch("");
    setLiveRoster([]);
    if (!classId) return;
    const orgId = currentUser?.organization_id;
    if (!orgId) return;
    setIsLiveRosterLoading(true);
    try {
      const rosterData = await staffApi(`/organizations/${orgId}/occurrences/${classId}/attendance`);
      setLiveRoster(rosterData || []);
    } catch (e: any) {
      console.warn("Failed to load roster", e);
    } finally {
      setIsLiveRosterLoading(false);
    }
  };

  const handleMarkLiveAttendance = async (enrollmentId: string, status: string) => {
    const orgId = currentUser?.organization_id;
    if (!orgId || !selectedLiveClassId) return;
    setMarkingEnrollmentId(enrollmentId);
    try {
      await staffApi(`/organizations/${orgId}/occurrences/${selectedLiveClassId}/attendance`, {
        method: "POST",
        body: JSON.stringify({ enrollment_id: enrollmentId, status }),
      });
      showToast("🌿 Attendance marked successfully!");
      setLiveRoster(prev => prev.map(s => s.enrollment_id === enrollmentId ? { ...s, attendance_status: status } : s));
      setAttendanceEvents(items => items.map(item => item.occurrenceId === selectedLiveClassId && item.enrollmentId === enrollmentId
        ? { ...item, status: status === "ATTENDED" ? "PRESENT" : status === "EXCUSED" ? "CANCELLED" : "ABSENT" } : item));
    } catch (e: any) {
      showToast(`⚠️ ${e.message || "Failed to mark attendance"}`);
    } finally {
      setMarkingEnrollmentId(null);
    }
  };

  const markAllLivePresent = async () => {
    const orgId = currentUser?.organization_id;
    if (!orgId || !selectedLiveClassId) return;
    const toMark = liveRoster.filter((s: any) => s.attendance_status !== "ATTENDED");
    if (!toMark.length) {
      showToast("All students are already marked Present!");
      return;
    }
    setIsMarkingLiveAttendance(true);
    let successCount = 0;
    try {
      for (const student of toMark) {
        await staffApi(`/organizations/${orgId}/occurrences/${selectedLiveClassId}/attendance`, {
          method: "POST",
          body: JSON.stringify({ enrollment_id: student.enrollment_id, status: "ATTENDED" }),
        });
        successCount++;
      }
      showToast(`🌿 Marked ${successCount} student${successCount > 1 ? "s" : ""} Present!`);
      await loadLiveRoster(selectedLiveClassId);
    } catch (e: any) {
      showToast(`⚠️ ${e.message || "Failed to mark all attendance"}`);
      await loadLiveRoster(selectedLiveClassId);
    } finally {
      setIsMarkingLiveAttendance(false);
    }
  };

  // Sync teacher profile fields when currentUser is available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.full_name) setTeacherProfileName(currentUser.full_name);
      if (currentUser.phone) setTeacherProfilePhone(currentUser.phone);
      if (currentUser.address) setTeacherProfileAddress(currentUser.address);
      if (currentUser.location) setTeacherProfileLocation(currentUser.location);
    }
  }, [currentUser]);

  const handleSaveTeacherProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTeacherProfile(true);
    try {
      const updated = await staffApi("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: teacherProfileName,
          phone: teacherProfilePhone,
          address: teacherProfileAddress,
          location: teacherProfileLocation,
        }),
      });
      const stored = JSON.parse(localStorage.getItem("pr_user") || "{}");
      const merged = { ...stored, ...updated };
      localStorage.setItem("pr_user", JSON.stringify(merged));
      setCurrentUser(merged);
      showToast("🌿 Teacher profile updated successfully!");
    } catch (err: any) {
      showToast(`⚠️ ${err.message || "Failed to update profile"}`);
    } finally {
      setIsSavingTeacherProfile(false);
    }
  };

  // Support Queries state & actions
  const [queries, setQueries] = useState<any[]>([]);
  const [queriesLoading, setQueriesLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplyMessage, setTicketReplyMessage] = useState("");
  const [isSendingTicketReply, setIsSendingTicketReply] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("ALL");

  const fetchQueries = async () => {
    const orgId = currentUser?.organization_id;
    if (!orgId) return;
    setQueriesLoading(true);
    try {
      const url = `/organizations/${orgId}/support-tickets${ticketStatusFilter !== "ALL" ? `?status_filter=${ticketStatusFilter}` : ""}`;
      const res = await staffApi(url);
      setQueries(res || []);
    } catch (e) {
      console.warn("Could not load support tickets", e);
    } finally {
      setQueriesLoading(false);
    }
  };

  // Reconciled Studio Analytics State
  const [studioAnalytics, setStudioAnalytics] = useState<{
    active_enrolled_students: number;
    active_recurring_batches: number;
    total_support_queries: number;
    projected_subscription_value: number;
    collected_revenue: number;
    billed_revenue: number;
    currency: string;
    explanation: string;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchStudioAnalytics = async () => {
    const orgId = currentUser?.organization_id;
    if (!orgId) return;
    setAnalyticsLoading(true);
    try {
      const res = await staffApi(`/organizations/${orgId}/analytics`);
      setStudioAnalytics(res);
    } catch (e) {
      console.warn("Could not load studio analytics", e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openTicketDetail = async (ticketId: string) => {
    const orgId = currentUser?.organization_id;
    if (!orgId) return;
    try {
      const res = await staffApi(`/organizations/${orgId}/support-tickets/${ticketId}`);
      setSelectedTicket(res);
    } catch (e: any) {
      showToast(e.message || "Could not open ticket thread");
    }
  };

  const sendTicketReply = async (ticketId: string) => {
    const orgId = currentUser?.organization_id;
    if (!orgId || !ticketReplyMessage.trim()) return;
    setIsSendingTicketReply(true);
    try {
      await staffApi(`/organizations/${orgId}/support-tickets/${ticketId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: ticketReplyMessage.trim() }),
      });
      setTicketReplyMessage("");
      showToast("Reply sent to student");
      await openTicketDetail(ticketId);
      await fetchQueries();
    } catch (e: any) {
      showToast(e.message || "Failed to send reply");
    } finally {
      setIsSendingTicketReply(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, nextStatus: string) => {
    const orgId = currentUser?.organization_id;
    if (!orgId) return;
    try {
      await staffApi(`/organizations/${orgId}/support-tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`Ticket status updated to ${nextStatus.toLowerCase()}`);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: nextStatus });
      }
      await fetchQueries();
    } catch (e: any) {
      showToast(e.message || "Failed to update ticket status");
    }
  };

  // Fetch Studio Teachers from Backend
  const fetchStudioTeachers = async () => {
    setStudioTeachersLoading(true);
    try {
      const params = new URLSearchParams({ page: String(teacherPage), page_size: String(teacherPageSize), sort_by: teacherSortBy, sort_order: teacherSortOrder });
      if (teacherSearch) params.set("search", teacherSearch);
      const url = `${API_BASE_URL}/teachers?${params}`;
      const res = await fetch(url, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setStudioTeachers(data.teachers || []);
        setTeacherTotal(data.total || 0);
        setTeacherActiveTotal(data.active_total || 0);
        setTeacherTotalPages(data.total_pages || 1);
      }
    } catch (e) {
      console.warn("Backend API not reachable for studio teachers", e);
    } finally {
      setStudioTeachersLoading(false);
    }
  };

  // Invite a Teacher to the studio
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingTeacher) return;
    setIsSavingTeacher(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          name: teacherName.trim(),
          email: teacherEmail.trim().toLowerCase(),
          phone: teacherPhone.trim() || undefined,
          title: teacherTitle.trim() || "Teacher",
          bio: teacherBio.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(`⚠️ ${err.detail || "Failed to invite teacher"}`);
        return;
      }
      showToast("🌿 Teacher invited to studio roster successfully!");
      setIsAddTeacherOpen(false);
      setTeacherName("");
      setTeacherEmail("");
      setTeacherPhone("");
      setTeacherTitle("Teacher");
      setTeacherBio("");
      fetchStudioTeachers();
    } catch (err: any) {
      showToast(`⚠️ ${err.message || "Failed to invite teacher"}`);
    } finally {
      setIsSavingTeacher(false);
    }
  };

  // Open Edit Teacher Modal with existing data
  const handleOpenEditTeacher = (teacher: StudioTeacher) => {
    setEditingTeacher(teacher);
    setTeacherUsername(teacher.username || ""); setTeacherPassword(""); setTeacherAddress(teacher.address || ""); setTeacherLocation(teacher.location || "");
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
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          username: teacherUsername,
          ...(teacherPassword ? { password: teacherPassword } : {}),
          address: teacherAddress,
          location: teacherLocation,
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
        headers: authHeaders(),
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

  const handleTeacherActivation = async (teacher: StudioTeacher) => {
    const action = teacher.is_active ? "Deactivate" : "Activate";
    const description = teacher.is_active
      ? `${teacher.name}'s access and every class assigned to them will be deactivated. Attendance history is retained.`
      : `${teacher.name} will regain teacher access. Their previously deactivated classes remain inactive until you activate them individually.`;
    if (!await confirmAction({ title: `${action} teacher?`, description, confirmLabel: `${action} teacher`, destructive: teacher.is_active })) return;
    try {
      const res = await fetch(`${API_BASE_URL}/teachers/${teacher.id}`, { method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ is_active: !teacher.is_active }) });
      if (!res.ok) throw new Error((await res.json()).detail || "Could not update teacher");
      const updated = await res.json();
      showToast(teacher.is_active ? `🌿 Teacher and ${updated.deactivated_class_count || 0} assigned classes deactivated.` : "🌿 Teacher activated. Review their classes before reopening them.");
      fetchStudioTeachers();
    } catch (err: any) { showToast(`⚠️ ${err.message || "Could not update teacher"}`); }
  };

  // Fetch Students from FastAPI Backend
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const orgParam = currentUser?.organization_id ? `&studio_id=${encodeURIComponent(currentUser.organization_id)}` : "";
      const url = `${API_BASE_URL}/students?page=${currentPage}&page_size=${pageSize}&sort_by=${studentSortBy}&sort_order=${studentSortOrder}${
        studentSearch ? `&search=${encodeURIComponent(studentSearch)}` : ""
      }${studentStatusFilter !== "ALL" ? `&status=${studentStatusFilter}` : ""}${orgParam}`;
      const res = await fetch(url, { headers: authHeaders() });
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

  const openAddStudent = async () => {
    setStudentAdmissionEmail("");
    setStudentAdmissionClassId("");
    setIsAddStudentOpen(true);
    try {
      const currentOrgId = currentUser?.organization_id || "65e82b8f-1494-4658-90d1-f450e21b20a5";
      const classes = await staffApi(`/organizations/${currentOrgId}/classes`);
      setStudentAdmissionClasses(classes.filter((item: any) => item.is_active !== false));
    } catch {
      showToast("Could not load available classes. Please try again.");
    }
  };

  const handleAddStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsAddingStudent(true);
    try {
      await staffApi("/students", {
        method: "POST",
        body: JSON.stringify({ email: studentAdmissionEmail.trim(), class_id: studentAdmissionClassId }),
      });
      setIsAddStudentOpen(false);
      showToast("Student added to the class.");
      fetchStudents();
    } catch (error: any) {
      showToast(`⚠️ ${error.message || "Could not add student"}`);
    } finally {
      setIsAddingStudent(false);
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
  const fetchStudioProfile = async (orgId?: string, overrideRole?: string) => {
    try {
      const activeRole = overrideRole || currentUser?.role;
      if (activeRole === "TEACHER" || activeRole === "INSTRUCTOR") return;
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
    // Validate current step before advancing
    const currentValidation = validateStep(completionStep);
    if (!currentValidation.valid) {
      notify(currentValidation.errorMsg || "Please fill in all required fields.", "error");
      return;
    }

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
    setZoomTestError(null);
    if (!zoomConnected) {
      setTestZoomMeeting(null);
      const errMsg = "Zoom is not connected. You must connect your Zoom account or complete authentication before generating test meetings.";
      setZoomTestError(errMsg);
      notify(errMsg, "error");
      setIsGeneratingTestMeeting(false);
      return;
    }
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
        setZoomTestError(null);
        if (data.is_simulated) {
          showToast("🧪 Generated simulated test room (Dev Simulation)");
        } else {
          showToast("🎥 Zoom live meeting generated successfully!");
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setTestZoomMeeting(null);
        const errMsg = errData.detail || "Zoom is not connected. You must authenticate and connect Zoom before generating test meetings.";
        setZoomTestError(errMsg);
        notify(errMsg, "error");
      }
    } catch (e: any) {
      setTestZoomMeeting(null);
      const errMsg = e?.message || "Failed to generate Zoom meeting. Connect Zoom integration first.";
      setZoomTestError(errMsg);
      notify(errMsg, "error");
    } finally {
      setIsGeneratingTestMeeting(false);
    }
  };

  // Complete Account Setup & Launch Sanctuary
  const handleCompleteOnboarding = async () => {
    // Validate all 5 steps before completing launch
    for (let s = 1; s <= 5; s++) {
      const val = validateStep(s);
      if (!val.valid) {
        notify(`Cannot launch yet: Step ${s} is incomplete - ${val.errorMsg}`, "error");
        setCompletionStep(s);
        return;
      }
    }

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
        if (parsed.full_name) setTeacherProfileName(parsed.full_name);
        if (parsed.phone) setTeacherProfilePhone(parsed.phone);
        if (parsed.address) setTeacherProfileAddress(parsed.address);
        if (parsed.location) setTeacherProfileLocation(parsed.location);

        const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const requestedTab = urlParams?.get("tab") as AdminTab | null;
        const validTabs: AdminTab[] = [
          "account-completion", "studio-teachers", "students", "classes-plans",
          "subscriptions-manager", "attendance-tracker", "my-website", "queries-manager",
          "analytics", "billing-dashboard", "billing-downloads", "settings",
          "superadmin-instructors", "superadmin-analytics", "superadmin-settings"
        ];

        if (requestedTab && validTabs.includes(requestedTab)) {
          setActiveTab(requestedTab);
          if (parsed.role === "TEACHER" || parsed.role === "INSTRUCTOR") {
            setAttendanceType("student");
          }
        } else if (parsed.role === "SUPER_ADMIN") {
          setActiveTab("superadmin-instructors");
        } else if (parsed.role === "TEACHER" || parsed.role === "INSTRUCTOR") {
          setActiveTab("classes-plans");
          setAttendanceType("student");
        } else if (!parsed.account_completed) {
          setActiveTab("account-completion");
        } else {
          setActiveTab("studio-teachers");
        }
        if (parsed.organization_id && parsed.role !== "TEACHER" && parsed.role !== "INSTRUCTOR") {
          fetchStudioProfile(parsed.organization_id, parsed.role);
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

      // Initialize students and support queries count for analytics overview
      fetchStudents();
      fetchQueries();
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);


  // Trigger Studio Teachers query when studio browses studio-teachers tab
  useEffect(() => {
    if (activeTab === "studio-teachers" && !isTeacher) {
      fetchStudioTeachers();
    }
  }, [activeTab, teacherSearch, teacherPage, teacherPageSize, teacherSortBy, teacherSortOrder, isTeacher]);

  // Trigger Students API query when browsing students or analytics tab
  useEffect(() => {
    if (activeTab === "students" || activeTab === "analytics") {
      fetchStudents();
    }
  }, [activeTab, currentPage, pageSize, studentSearch, studentStatusFilter, studentSortBy, studentSortOrder, currentUser?.organization_id]);

  // Trigger Support Queries API when browsing queries or analytics tab
  useEffect(() => {
    if (activeTab === "queries-manager" || activeTab === "analytics") {
      fetchQueries();
    }
    if (activeTab === "analytics" && !isTeacher) {
      fetchStudioAnalytics();
    }
  }, [activeTab, ticketStatusFilter, currentUser?.organization_id, isTeacher]);

  // Attendance person lookup is intentionally isolated from the management tables.
  // Waiting 300ms keeps typing responsive and avoids issuing a request per keystroke.
  useEffect(() => {
    if (activeTab !== "attendance-tracker") return;
    if (isTeacher && attendanceType === "teacher") {
      setAttendanceType("student");
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAttendancePeopleLoading(true);
      try {
        if (attendanceType === "teacher") {
          if (isTeacher) return;
          const isFiltering = attendanceSuggestionsOpen && attendancePersonSearch.trim().length > 0;
          const searchParam = isFiltering ? `?search=${encodeURIComponent(attendancePersonSearch.trim())}` : "";
          const response = await fetch(`${API_BASE_URL}/teachers${searchParam}`, { signal: controller.signal, headers: authHeaders() });
          const teachersList = response.ok ? ((await response.json()).teachers || []) : studioTeachers;
          setAttendanceTeachers(teachersList);
          if (!isFiltering && teachersList.length > 0) {
            setSelectedAttendanceTeacher((prev) => {
              if (prev && teachersList.some((t: StudioTeacher) => t.id === prev.id)) return prev;
              return teachersList[0];
            });
          }
        } else {
          const isFiltering = attendanceSuggestionsOpen && attendancePersonSearch.trim().length > 0;
          const searchParam = isFiltering ? `&search=${encodeURIComponent(attendancePersonSearch.trim())}` : "";
          const studioParam = currentUser?.organization_id ? `&studio_id=${currentUser.organization_id}` : "";
          const response = await fetch(`${API_BASE_URL}/students?page=1&page_size=50${searchParam}${studioParam}`, { signal: controller.signal, headers: authHeaders() });
          const studentsList = response.ok ? ((await response.json()).items || []) : students;
          setAttendanceStudents(studentsList);
          if (!isFiltering && studentsList.length > 0) {
            setSelectedAttendanceStudent((prev) => {
              if (prev && studentsList.some((s: Student) => s.id === prev.id)) return prev;
              return studentsList[0];
            });
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          if (attendanceType === "teacher") {
            setAttendanceTeachers(studioTeachers);
            if (studioTeachers.length > 0) {
              setSelectedAttendanceTeacher((prev) => prev || studioTeachers[0]);
            }
          } else {
            setAttendanceStudents(students);
            if (students.length > 0) {
              setSelectedAttendanceStudent((prev) => prev || students[0]);
            }
          }
        }
      } finally {
        if (!controller.signal.aborted) setAttendancePeopleLoading(false);
      }
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeTab, attendanceType, attendancePersonSearch, attendanceSuggestionsOpen, isTeacher, currentUser?.organization_id]);

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

    const finalMeetingUrl = newBatchUrl?.trim() || "";

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

  const selectedAttendancePerson = attendanceType === "teacher" ? selectedAttendanceTeacher : selectedAttendanceStudent;
  const displayPersonSearch = attendanceSuggestionsOpen
    ? attendancePersonSearch
    : (selectedAttendancePerson ? selectedAttendancePerson.name : attendancePersonSearch);
  const attendanceOptions = (attendanceType === "teacher" ? attendanceTeachers : attendanceStudents).filter((person) => {
    const query = attendancePersonSearch.trim().toLowerCase();
    if (!query) return true;
    if (selectedAttendancePerson && query === selectedAttendancePerson.name.toLowerCase()) return true;
    return person.name.toLowerCase().includes(query) || person.email.toLowerCase().includes(query);
  });
  useEffect(() => {
    const personId = attendanceType === "teacher" ? selectedAttendanceTeacher?.id : selectedAttendanceStudent?.id;
    const orgId = currentUser?.organization_id;
    if (activeTab !== "attendance-tracker" || !personId || !orgId) { setAttendanceEvents([]); return; }
    const controller = new AbortController();
    setAttendanceEvents([]); setAttendanceCalendarError(""); setAttendanceCalendarLoading(true);
    staffApi(`/organizations/${orgId}/attendance/${attendanceType === "teacher" ? "teachers" : "students"}/${personId}?month=${attendanceMonth}`, { signal: controller.signal })
      .then(setAttendanceEvents)
      .catch(error => { if (!controller.signal.aborted) setAttendanceCalendarError(error.message || "Could not load attendance."); })
      .finally(() => { if (!controller.signal.aborted) setAttendanceCalendarLoading(false); });
    return () => controller.abort();
  }, [activeTab, attendanceType, selectedAttendanceTeacher?.id, selectedAttendanceStudent?.id, currentUser?.organization_id, attendanceMonth]);

  const saveCalendarAttendance = async (event: CalendarSessionEvent) => {
    const orgId = currentUser?.organization_id;
    if (!orgId || !selectedAttendancePerson || !event.occurrenceId) throw new Error("Select a studio and attendance entry first.");
    if (attendanceType === "teacher") {
      if (isTeacher) throw new Error("Only studio owners can edit teacher attendance.");
      await staffApi(`/organizations/${orgId}/attendance/teachers/${selectedAttendancePerson.id}/occurrences/${event.occurrenceId}`, {
        method: "PUT", body: JSON.stringify({ status: event.status, notes: event.remarks }),
      });
    } else {
      await staffApi(`/organizations/${orgId}/occurrences/${event.occurrenceId}/attendance`, {
        method: "POST", body: JSON.stringify({ enrollment_id: event.enrollmentId, status: event.status === "PRESENT" ? "ATTENDED" : event.status === "CANCELLED" ? "EXCUSED" : "ABSENT", notes: event.remarks }),
      });
    }
    setAttendanceEvents(items => items.map(item => item.id === event.id ? event : item));
  };
  const filteredLiveRoster = useMemo(() => {
    return liveRoster.filter((student: any) => {
      const matchesSearch = `${student.student_name || ""} ${student.student_email || ""}`.toLowerCase().includes(rosterSearch.trim().toLowerCase());
      const matchesFilter = rosterFilter === "ALL" || student.attendance_status === rosterFilter;
      return matchesSearch && matchesFilter;
    });
  }, [liveRoster, rosterSearch, rosterFilter]);


  // Feature boolean flags: disable features not accessible to teachers
  const features = useMemo(() => ({
    // Studio-only features disabled for teachers by boolean:
    manageTeachers: isStudioOwner,
    myWebsite: isStudioOwner,
    accountDetails: isStudioOwner,
    membershipsManager: isStudioOwner,
    studioAnalytics: isStudioOwner,
    createClasses: isStudioOwner,
    studioProfileSettings: isStudioOwner,
    billingDetails: isStudioOwner,

    // Integrated features shared by both studio and teacher:
    viewClasses: true,
    manageStudents: true,
    attendanceTracker: true,
    queriesManager: true,
    settings: true,
    dashboardTheme: true,
    teacherProfileSettings: isTeacher,
  }), [isStudioOwner, isTeacher]);

  // Tab protection guard: ensure teachers don't stay on studio-only tabs
  useEffect(() => {
    if (isTeacher) {
      const studioOnlyTabs: AdminTab[] = [
        "studio-teachers",
        "account-completion",
        "subscriptions-manager",
        "analytics",
        "billing-dashboard",
        "billing-downloads",
        "my-website",
        "superadmin-instructors",
        "superadmin-analytics",
        "superadmin-settings",
      ];
      if (studioOnlyTabs.includes(activeTab)) {
        setActiveTab("classes-plans");
      }
      if (attendanceType !== "student") {
        setAttendanceType("student");
      }
    }
  }, [isTeacher, activeTab, attendanceType]);

  const orgTitle = isSuperAdmin
    ? "ProgressNow HQ"
    : (currentUser?.organization_name || "Tranquil Flow Sanctuary");
  const roleSubtitle = isSuperAdmin
    ? "Platform Super Admin"
    : (isTeacher ? "Teacher Portal • Sanctuary Studio" : "Studio Operations");
  const userDisplayName = currentUser?.full_name || (isSuperAdmin ? "Platform Super Admin" : (isTeacher ? "Sanctuary Guide" : "Studio Owner"));
  const userDisplayEmail = currentUser?.email || (isSuperAdmin ? "admin@progressrooms.com" : (isTeacher ? "teacher@yogastudio.com" : "owner@yogastudio.com"));
  const userInitials = isSuperAdmin ? "SA" : (isTeacher ? "TC" : "SO");

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];

  return (
    <div className="dashboard-shell bg-[#FAF7F2] text-[#212121] font-sans" data-dashboard-theme={dashboardTheme}>

      {/* Nature Dark Emerald Sidebar */}
      <ResponsiveSidebar><aside
        className="w-72 flex-shrink-0 flex flex-col justify-between p-5 text-white shadow-2xl z-20 nature-sidebar"
      >
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="pb-4 border-b border-white/10 flex flex-col gap-2">
            <div className="flex items-center space-x-3">
              <BrandLogo size={40} variant="tile-dark" />
              <div className="flex-1 min-w-0">
                <h2 className="font-serif font-bold text-base text-[#F4F7F4] leading-tight truncate">
                  {orgTitle}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] block mt-0.5">
                  {roleSubtitle}
                </span>
              </div>
            </div>

            {/* Studio Switcher for Multi-Studio Teachers & Owners */}
            {currentUser?.organizations && currentUser.organizations.length > 1 && (
              <div className="mt-1">
                <label htmlFor="studio-switcher-select" className="sr-only">Switch Studio</label>
                <select
                  id="studio-switcher-select"
                  value={currentUser.organization_id}
                  onChange={(e) => {
                    const targetId = e.target.value;
                    const targetOrg = currentUser.organizations.find((o: any) => o.id === targetId);
                    if (targetOrg) {
                      const updatedUser = {
                        ...currentUser,
                        organization_id: targetOrg.id,
                        organization_name: targetOrg.name,
                        organization_slug: targetOrg.slug,
                        teacher_code: targetOrg.teacher_code || currentUser.teacher_code,
                      };
                      localStorage.setItem("pr_user", JSON.stringify(updatedUser));
                      localStorage.setItem("pr_active_studio_id", targetOrg.id);
                      setCurrentUser(updatedUser);
                      window.location.reload();
                    }
                  }}
                  className="w-full text-xs bg-black/40 hover:bg-black/60 text-[#e8f5e9] rounded-xl px-2.5 py-1.5 border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#81A882]"
                >
                  {currentUser.organizations.map((orgItem: any) => (
                    <option key={orgItem.id} value={orgItem.id} className="text-slate-900 bg-white">
                      {orgItem.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
            {isSuperAdmin ? (
              <>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] px-3 mb-2">
                  Platform Administration
                </p>

                <button
                  onClick={() => navigateToTab("superadmin-instructors")}
                  className={`nav-item ${activeTab === "superadmin-instructors" ? "active" : ""}`}
                >
                  <span>Manage Studios</span>
                </button>

                <button
                  onClick={() => navigateToTab("superadmin-analytics")}
                  className={`nav-item ${activeTab === "superadmin-analytics" ? "active" : ""}`}
                >
                  <span>Platform Overview</span>
                </button>

                <button
                  onClick={() => navigateToTab("superadmin-settings")}
                  className={`nav-item ${activeTab === "superadmin-settings" ? "active" : ""}`}
                >
                  <span>Platform Settings</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#81A882] px-3 mb-2">
                  {isTeacher ? "Teacher Operations Menu" : "Studio Operations Menu"}
                </p>

                {features.manageTeachers && (
                  <button
                    onClick={() => navigateToTab("studio-teachers")}
                    className={`nav-item ${activeTab === "studio-teachers" ? "active" : ""}`}
                  >
                    <span>Manage Teachers</span>
                  </button>
                )}

                {features.manageStudents && (
                  <button
                    onClick={() => navigateToTab("students")}
                    className={`nav-item ${activeTab === "students" ? "active" : ""}`}
                  >
                    <span>{isTeacher ? "My Students" : "Manage Students"}</span>
                  </button>
                )}

                {features.viewClasses && (
                  <button
                    onClick={() => navigateToTab("classes-plans")}
                    className={`nav-item ${activeTab === "classes-plans" ? "active" : ""}`}
                  >
                    <span>{isTeacher ? "My Classes & Agenda" : "Class Batches & Schedules"}</span>
                  </button>
                )}

                {features.membershipsManager && (
                  <button
                    onClick={() => navigateToTab("subscriptions-manager")}
                    className={`nav-item ${activeTab === "subscriptions-manager" ? "active" : ""}`}
                  >
                    <span>Memberships & Passes</span>
                  </button>
                )}

                {features.attendanceTracker && (
                  <button
                    onClick={() => openAttendanceFor(isTeacher ? "student" : "teacher")}
                    className={`nav-item ${activeTab === "attendance-tracker" ? "active" : ""}`}
                  >
                    <span>{isTeacher ? "Student Attendance" : "Attendance Tracker"}</span>
                  </button>
                )}

                {features.myWebsite && (
                  <button
                    onClick={() => navigateToTab("my-website")}
                    className={`nav-item ${activeTab === "my-website" ? "active" : ""}`}
                  >
                    <span>My Website</span>
                  </button>
                )}

                {features.queriesManager && (
                  <button
                    onClick={() => navigateToTab("queries-manager")}
                    className={`nav-item ${activeTab === "queries-manager" ? "active" : ""}`}
                  >
                    <span>Student Support Queries</span>
                  </button>
                )}

                {features.studioAnalytics && (
                  <button
                    onClick={() => navigateToTab("analytics")}
                    className={`nav-item ${activeTab === "analytics" ? "active" : ""}`}
                  >
                    <span>Studio Analytics</span>
                  </button>
                )}

                {features.billingDetails && (
                  <>
                    <button
                      onClick={() => navigateToTab("billing-dashboard")}
                      className={`nav-item ${activeTab.startsWith("billing-") ? "active" : ""}`}
                    >
                      <span>Billing Details</span>
                    </button>
                    {activeTab.startsWith("billing-") && (
                      <div className="settings-submenu" aria-label="Billing sections">
                        <button type="button" className={activeTab === "billing-dashboard" ? "active" : ""} onClick={() => navigateToTab("billing-dashboard")}>Billing Dashboard</button>
                        <button type="button" className={activeTab === "billing-downloads" ? "active" : ""} onClick={() => navigateToTab("billing-downloads")}>Download Bills</button>
                      </div>
                    )}
                  </>
                )}

                {features.settings && (
                  <button
                    onClick={() => navigateToTab("settings")}
                    className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                  >
                    <span>Settings</span>
                  </button>
                )}
                {features.settings && activeTab === "settings" && (
                  <div className="settings-submenu" aria-label="Settings sections">
                    {features.accountDetails && (
                      <button
                        type="button"
                        onClick={handleOpenAccountDetails}
                      >
                        Account Details
                      </button>
                    )}
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

                {/* Account Details - Studio Only */}
                {features.accountDetails && (
                  <button
                    onClick={handleOpenAccountDetails}
                    className={`nav-item relative ${activeTab === "account-completion" ? "active" : ""}`}
                  >
                    <div className="flex-1 text-left flex items-center justify-between gap-1">
                      <span className="truncate">Account Details</span>
                      {!isStep6Complete ? (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 shrink-0">
                          {displayPercentage}%
                        </span>
                      ) : (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          Complete
                        </span>
                      )}
                    </div>
                  </button>
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
              {isTeacher && currentUser?.teacher_code && <p className="mt-0.5 text-[10px] font-bold tracking-[.18em] text-white">CODE {currentUser.teacher_code}</p>}
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
        {isTeacher && currentUser?.teacher_code && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#CEDECF] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#2D7A58]">Teacher Public Identity</p>
              <p className="mt-1 text-sm text-[#40514E]">
                Share your code or profile link with students to find your classes and passes across all affiliated studios.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-xl bg-[#133623] px-4 py-2 font-mono text-lg font-black tracking-[.2em] text-white">
                {currentUser.teacher_code}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(currentUser.teacher_code || "");
                    showToast("Teacher code copied to clipboard!");
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#CEDECF] text-xs font-bold text-[#133623] hover:bg-[#F4F7F4] transition shadow-xs"
                title="Copy teacher code"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Code</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && navigator.clipboard) {
                    const link = `${window.location.origin}/student?teacher=${currentUser.teacher_code}`;
                    navigator.clipboard.writeText(link);
                    showToast("Teacher profile link copied to clipboard!");
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#133623] text-white text-xs font-bold hover:bg-[#0C2417] transition shadow-sm"
                title="Share public teacher discovery profile"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Profile</span>
              </button>
            </div>
          </div>
        )}
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
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                >
                  <span>Refresh Platform DB</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Registered Studios</span>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{adminMetrics?.total_organizations ?? 6}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Live tenant organizations</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Total Teachers / Instructors</span>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{adminMetrics?.total_instructors ?? 10}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Across all studio academies</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Total Enrolled Yogis</span>
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
                                className={`record-capsule px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
          <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
            {/* Header with Title & One-Click Sample Pre-fill */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Account Details</h1>
                  {!isStep6Complete ? (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Step {completionStep} of 6 • {displayPercentage}% Completed
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      100% Completed • Sanctuary Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#40514E] mt-1">
                  Complete all 6 essential studio setup steps: mobile & WhatsApp, location & teaching mode, GST registration, bank payouts, Zoom live video, and final launch.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <DeveloperOnly><button
                  type="button"
                  onClick={handleFillSampleDetails}
                  className="px-3.5 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                >
                  <span>Pre-Fill Sample Details</span>
                </button></DeveloperOnly>
              </div>
            </div>

            {/* MOBILE TOP PROGRESS BANNER (Visible on mobile/tablet < lg) */}
            <div className="block lg:hidden space-y-3">
              {/* Mobile Step Header Card */}
              <div className="bg-white p-4 rounded-2xl border border-[#CEDECF] shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Step {completionStep} of 6</p>
                    <h2 className="text-xs font-bold text-[#0C2417] truncate">
                      {["Studio Contact & Phone", "Location & Mode", "GST & Tax Identity", "Bank Payout Accounts", "Zoom Video Classroom", "Review & Sanctuary Launch"][completionStep - 1]}
                    </h2>
                  </div>
                  <span className={`stepper-chip shrink-0 ${checkStepCompleted(completionStep) ? "complete" : "active"}`}>
                    {checkStepCompleted(completionStep) ? "Completed" : "In Progress"}
                  </span>
                </div>

                {/* Mobile Card-level Linear Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Overall Progress</span>
                    <span className="text-[#2D7A58]">{displayPercentage}%</span>
                  </div>
                  <div className="card-linear-progress">
                    <div className="card-linear-progress-fill" style={{ width: `${displayPercentage}%` }} />
                  </div>
                </div>
              </div>

              {/* Swipeable / Scrollable Quick Step Pills Rail */}
              <div className="overflow-x-auto pb-1 -mx-1 px-1 flex items-center gap-2">
                {[
                  { step: 1, label: "01 Contact" },
                  { step: 2, label: "02 Location" },
                  { step: 3, label: "03 GST" },
                  { step: 4, label: "04 Bank" },
                  { step: 5, label: "05 Zoom" },
                  { step: 6, label: "06 Launch" }
                ].map((s) => {
                  const isActive = completionStep === s.step;
                  const isDone = checkStepCompleted(s.step);
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setCompletionStep(s.step)}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? "bg-[#0C2417] text-white shadow-sm ring-2 ring-[#2D7A58]"
                          : isDone
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-white text-slate-600 border border-[#CEDECF] hover:bg-slate-50"
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MAIN DESKTOP 2-COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: VERTICAL STEPPER CARD (Matching reference image left card) */}
              <div className="hidden lg:block lg:col-span-4 xl:col-span-4 space-y-4 sticky top-6">
                <div className="bg-white rounded-3xl border border-[#CEDECF] p-6 shadow-sm">
                  {/* Top Brand / Sanctuary Mark */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#E1E9E2]">
                    <div>
                      <h2 className="font-serif font-bold text-base text-[#0C2417]">Studio Setup</h2>
                      <p className="text-[11px] text-slate-500 font-medium">Sanctuary Onboarding</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAccountCompleted
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {displayPercentage}% Done
                    </span>
                  </div>

                  {/* Vertical Timeline Items (6 Steps) */}
                  <div className="py-4 space-y-0.5" aria-label="Step navigation timeline">
                    {[
                      { step: 1, label: "Studio Contact" },
                      { step: 2, label: "Location & Mode" },
                      { step: 3, label: "GST & Legal" },
                      { step: 4, label: "Bank & Payouts" },
                      { step: 5, label: "Zoom Live Video" },
                      { step: 6, label: "Review & Launch" }
                    ].map((s, idx, arr) => {
                      const isActive = completionStep === s.step;
                      const isDone = checkStepCompleted(s.step);
                      const isLast = idx === arr.length - 1;
                      const nodeState = isDone && !isActive ? "complete" : isActive ? "active" : "incomplete";
                      const lineState = isDone ? "complete" : "incomplete";

                      return (
                        <button
                          key={s.step}
                          type="button"
                          onClick={() => setCompletionStep(s.step)}
                          className={`w-full text-left stepper-v-item rounded-2xl p-2.5 transition ${
                            isActive ? "bg-[#F4F8F4]" : "hover:bg-[#FAFCFA]"
                          }`}
                        >
                          <div className="stepper-v-rail">
                            <div className={`stepper-v-node ${nodeState} text-[11px] font-mono font-bold flex items-center justify-center`}>
                              {s.step}
                            </div>
                            {!isLast && <div className={`stepper-v-line ${lineState}`} />}
                          </div>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                              isActive ? "text-[#2D7A58]" : "text-slate-400"
                            }`}>
                              Step 0{s.step}
                            </p>
                            <p className={`text-xs font-bold truncate ${isActive ? "text-[#0C2417]" : "text-slate-700"}`}>
                              {s.label}
                            </p>
                            <div className="mt-1">
                              {isDone && !isActive ? (
                                <span className="stepper-chip complete">
                                  Completed
                                </span>
                              ) : isActive ? (
                                <span className="stepper-chip active">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D7A58] animate-ping" /> In Progress
                                </span>
                              ) : (
                                <span className="stepper-chip incomplete">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Incomplete
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Assistance Box (Matching reference image) */}
                  <div className="stepper-help-box mt-2 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-500 font-medium">Having troubles?</p>
                      <p className="text-xs font-bold text-[#0C2417]">Contact Concierge</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast("🌿 Sanctuary Concierge: concierge@progressrooms.com • +91 800-SANCTUARY");
                      }}
                      className="text-[11px] font-bold text-[#2D7A58] hover:underline shrink-0"
                    >
                      Get Help →
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: FORM CARDS */}
              <div className="lg:col-span-8 xl:col-span-8 space-y-6">

                {/* STEP 1: STUDIO & MOBILE CONTACT */}
                {completionStep === 1 && (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                    {/* Reference Card Header */}
                    <div className="flex items-start gap-3.5 pb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                            STEP 1 / 6
                          </span>
                          <span className={`stepper-chip ${checkStepCompleted(1) ? "complete" : "active"}`}>
                            {checkStepCompleted(1) ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                          Studio Contact & Primary Identity
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Provide your studio name, primary phone, WhatsApp number, and teaching disciplines.
                        </p>
                      </div>
                    </div>

                    {/* Card-level Linear Progress Bar */}
                    <div className="card-linear-progress my-2">
                      <div className="card-linear-progress-fill" style={{ width: "17%" }} />
                    </div>

                    <div className="border-b border-[#E1E9E2] pb-2">
                      <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Studio Identity & Contact</p>
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
                    {/* Reference Card Header */}
                    <div className="flex items-start gap-3.5 pb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                            STEP 2 / 6
                          </span>
                          <span className={`stepper-chip ${checkStepCompleted(2) ? "complete" : "active"}`}>
                            {checkStepCompleted(2) ? "Completed" : "In Progress"}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                          Teaching Location & Delivery Mode
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Specify your physical shala address, teaching space, or 100% online setup.
                        </p>
                      </div>
                    </div>

                    {/* Card-level Linear Progress Bar */}
                    <div className="card-linear-progress my-2">
                      <div className="card-linear-progress-fill" style={{ width: "33%" }} />
                    </div>

                    <div className="border-b border-[#E1E9E2] pb-2">
                      <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Teaching Space & Address</p>
                    </div>

                {/* Teaching Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-2">
                    Studio Teaching Mode *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {[
                      {
                        mode: "HYBRID",
                        title: "🌿 Hybrid Sanctuary",
                        desc: "Both in-person Shala and live Zoom interactive classes"
                      },
                      {
                        mode: "PHYSICAL",
                        title: "🏢 Physical Shala Only",
                        desc: "Traditional brick-and-mortar studio classes"
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
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: GST & Legal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: GST & LEGAL BUSINESS IDENTITY */}
            {completionStep === 3 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                {/* Reference Card Header */}
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                        STEP 3 / 6
                      </span>
                      <span className={`stepper-chip ${checkStepCompleted(3) ? "complete" : "active"}`}>
                        {checkStepCompleted(3) ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                      GST Registration & Legal Business Identity
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Specify your business entity name, Goods & Services Tax (GSTIN), and PAN details for compliance.
                    </p>
                  </div>
                </div>

                {/* Card-level Linear Progress Bar */}
                <div className="card-linear-progress my-2">
                  <div className="card-linear-progress-fill" style={{ width: "50%" }} />
                </div>

                <div className="border-b border-[#E1E9E2] pb-2">
                  <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Taxation & Entity Details</p>
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
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Save & Continue: Bank Payouts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: BANK & PAYOUT DETAILS */}
            {completionStep === 4 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
                {/* Reference Card Header */}
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                        STEP 4 / 6
                      </span>
                      <span className={`stepper-chip ${checkStepCompleted(4) ? "complete" : "active"}`}>
                        {checkStepCompleted(4) ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                      Bank Account & Settlement Payouts
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Provide verified bank payout specifications to receive student membership fees (&quot;The Thanks Perspective&quot;).
                    </p>
                  </div>
                </div>

                {/* Card-level Linear Progress Bar */}
                <div className="card-linear-progress my-2">
                  <div className="card-linear-progress-fill" style={{ width: "67%" }} />
                </div>

                <div className="border-b border-[#E1E9E2] pb-2">
                  <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Settlement Account Details</p>
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
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
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
                {/* Reference Card Header */}
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                        STEP 5 / 6
                      </span>
                      <span className={`stepper-chip ${checkStepCompleted(5) ? "complete" : "active"}`}>
                        {checkStepCompleted(5) ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                      Zoom Live Classroom Video Authentication
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      When authenticated, newly created class batches will automatically generate live Zoom meeting rooms.
                    </p>
                  </div>
                </div>

                {/* Card-level Linear Progress Bar */}
                <div className="card-linear-progress my-2">
                  <div className="card-linear-progress-fill" style={{ width: "83%" }} />
                </div>

                <div className="border-b border-[#E1E9E2] pb-2">
                  <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Virtual Classroom Integration</p>
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

                <DeveloperOnly>
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

                  {zoomTestError && (
                    <div role="alert" className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="font-semibold">{zoomTestError}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Zoom live rooms cannot be provisioned until authentication is connected. Please connect and authenticate your Zoom account first.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("account-completion");
                          setCompletionStep(5);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-[11px] transition shadow-xs"
                      >
                        <span>Connect Zoom / Go to Authentication →</span>
                      </button>
                    </div>
                  )}

                  {testZoomMeeting && (
                    <div className={`p-3 rounded-xl text-xs space-y-1.5 ${
                      testZoomMeeting.is_simulated
                        ? "bg-amber-50 border border-amber-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}>
                      <p className={`font-bold flex items-center gap-1.5 ${
                        testZoomMeeting.is_simulated ? "text-amber-900" : "text-blue-900"
                      }`}>
                        <span>🎥</span>
                        <span>
                          {testZoomMeeting.is_simulated ? "[SIMULATION] Dev Test Room: " : "Meeting Provisioned: "}
                          ID {testZoomMeeting.meeting_id} (Passcode: {testZoomMeeting.passcode})
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={testZoomMeeting.join_url}
                          className={`w-full px-2 py-1 rounded-lg border font-mono text-[11px] bg-white ${
                            testZoomMeeting.is_simulated ? "border-amber-300" : "border-blue-300"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(testZoomMeeting.join_url);
                            showToast("Copied Zoom meeting URL!");
                          }}
                          className={`px-2.5 py-1 rounded-lg text-white font-bold text-[11px] ${
                            testZoomMeeting.is_simulated ? "bg-amber-700 hover:bg-amber-800" : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                </DeveloperOnly>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#E1E9E2] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(4)}
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Step</span>
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
                {/* Reference Card Header */}
                <div className="flex items-start gap-3.5 pb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                        STEP 6 / 6
                      </span>
                      <span className={`stepper-chip ${isAccountCompleted ? "complete" : "active"}`}>
                        {isAccountCompleted ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                      Review, Verification Checklist & Sanctuary Launch
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Verify all configured steps. Once confirmed, your sanctuary is marked 100% complete and saved to your Profiler.
                    </p>
                  </div>
                </div>

                {/* Card-level Linear Progress Bar */}
                <div className="card-linear-progress my-2">
                  <div className="card-linear-progress-fill" style={{ width: "100%" }} />
                </div>

                <div className="border-b border-[#E1E9E2] pb-2">
                  <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Sanctuary Configuration Summary</p>
                </div>

                {/* 5 Cards Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Card 1: Studio & Contact */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417]">
                        Step 1: Studio Identity & Phone
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
                      <span className="font-bold text-[#0C2417]">
                        Step 2: Location & Mode
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
                      <span className="font-bold text-[#0C2417]">
                        Step 3: GST & Tax Identity
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
                      <span className="font-bold text-[#0C2417]">
                        Step 4: Bank Payout Accounts
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
                      <span className="font-bold text-[#0C2417]">
                        Step 5: Zoom Video Integration
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

                <div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => setCompletionStep(5)}
                    className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous: Zoom Setup</span>
                  </button>
                  <span className="font-bold text-[#2D7A58]">Step 6 of 6 • 100% Ready</span>
                </div>
              </div>
            )}
          </div>
          {/* Close Right Column */}
        </div>
        {/* Close Desktop 2-Column Grid */}

        {/* MOBILE ASSISTANCE CARD (Visible only on mobile/tablet < lg) */}
        <div className="block lg:hidden bg-white p-4 rounded-2xl border border-[#CEDECF] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#CEDECF] flex items-center justify-center shrink-0 text-[#2D7A58]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-500 font-medium">Having troubles?</p>
              <p className="text-xs font-bold text-[#0C2417]">Contact Sanctuary Concierge</p>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast("🌿 Sanctuary Concierge: concierge@progressrooms.com • +91 800-SANCTUARY");
              }}
              className="text-xs font-bold text-[#2D7A58] hover:underline"
            >
              Get Help →
            </button>
          </div>
        </div>
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
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                >
                  <span>Sync DB</span>
                </button>
                <button
                  onClick={() => {
                    setTeacherName("");
      setTeacherUsername(""); setTeacherPassword(""); setTeacherAddress(""); setTeacherLocation("");
                    setTeacherEmail("");
                    setTeacherPhone("");
                    setTeacherTitle("Sanctuary Instructor");
                    setTeacherBio("Certified somatic instructor and sanctuary guide.");
                    setIsAddTeacherOpen(true);
                  }}
                  className="btn-primary py-2 px-4 text-xs font-semibold shadow-sm"
                >
                  <span>Add New Teacher</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar for Studio Teachers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Active Teachers</span>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">
                  {teacherActiveTotal}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Conducting live yoga classes</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Total Studio Guides</span>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{teacherTotal}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Registered in your sanctuary team</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Studio Sanctuary</span>
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
                  onChange={(e) => { setTeacherSearch(e.target.value); setTeacherPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                />
              </div>
              <select value={teacherSortBy} onChange={(e) => { setTeacherSortBy(e.target.value as typeof teacherSortBy); setTeacherPage(1); }} className="rounded-xl border border-[#CEDECF] bg-white px-3 py-2 text-xs font-medium"><option value="name">Sort by name</option><option value="code">Sort by teacher code</option><option value="joined">Sort by joined date</option><option value="status">Sort by status</option></select>
              <button onClick={() => { setTeacherSortOrder(value => value === "asc" ? "desc" : "asc"); setTeacherPage(1); }} className="rounded-xl border border-[#CEDECF] bg-white px-3 py-2 text-xs font-bold">{teacherSortOrder === "asc" ? "Ascending" : "Descending"}</button>
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
                        <th className="px-6 py-4">Teacher Code</th>
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
      setTeacherUsername(""); setTeacherPassword(""); setTeacherAddress(""); setTeacherLocation("");
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
                          <tr key={teacher.id} onClick={() => setViewingTeacher(teacher)} className="hover:bg-[#F9FAF9] transition cursor-pointer">
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
                              <span className="record-capsule rounded-lg bg-[#E8F0E9] px-2.5 py-1 font-mono text-xs font-black tracking-[.16em] text-[#133623]">
                                {teacher.teacher_code || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`record-capsule px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  teacher.is_active
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {teacher.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {formatStudioDate(teacher.joined_at)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <button
                                  onClick={(event) => { event.stopPropagation(); handleOpenEditTeacher(teacher); }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#CEDECF] hover:bg-[#E8F0E9] text-[#0C2417] transition"
                                >
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={(event) => { event.stopPropagation(); handleTeacherActivation(teacher); }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${teacher.is_active ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"}`}
                                >
                                  {teacher.is_active ? "Deactivate" : "Activate"}
                                </button>
                                <button
                                  onClick={(event) => { event.stopPropagation(); openAttendanceFor("teacher", teacher); }}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E8F0E9] hover:bg-[#CEDECF] text-[#0C2417] transition"
                                >
                                  View attendance
                                </button>
                                {teacher.role !== "OWNER" && (
                                  <button
                                    onClick={(event) => { event.stopPropagation(); handleDeleteTeacher(teacher.id, teacher.name); }}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition"
                                  >
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
              <div className="flex flex-col gap-3 border-t border-[#E1E9E2] bg-[#FAF7F2] px-6 py-4 text-xs sm:flex-row sm:items-center sm:justify-between"><span>Showing {teacherTotal ? (teacherPage - 1) * teacherPageSize + 1 : 0}–{Math.min(teacherPage * teacherPageSize, teacherTotal)} of {teacherTotal} teachers</span><div className="flex items-center gap-2"><select value={teacherPageSize} onChange={(e) => { setTeacherPageSize(Number(e.target.value)); setTeacherPage(1); }} className="rounded-lg border border-[#CEDECF] bg-white px-2 py-1"><option value="5">5 rows</option><option value="10">10 rows</option><option value="20">20 rows</option></select><button disabled={teacherPage <= 1} onClick={() => setTeacherPage(value => value - 1)} className="rounded-lg border border-[#CEDECF] bg-white px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page {teacherPage} of {teacherTotalPages}</span><button disabled={teacherPage >= teacherTotalPages} onClick={() => setTeacherPage(value => value + 1)} className="rounded-lg border border-[#CEDECF] bg-white px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
            </div>
          </div>
        )}

        {/* STUDIO TAB 2: STUDENTS & DIRECTORY (LIVE API CONNECTED) */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">
                  {isTeacher ? "My Students" : "Enrolled Student Directory"}
                </h1>
                <p className="text-xs text-[#40514E] mt-0.5">
                  {isTeacher
                    ? "Manage your studio's students, review attendance records, and student practice notes."
                    : "Manage your active yogis, review OTP account verification, track attendance counts, and review membership status."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isTeacher && (
                  <button
                    type="button"
                    onClick={openAddStudent}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#133623] text-white rounded-xl hover:bg-[#0C2417] shadow-sm transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create Student
                  </button>
                )}
                <button
                  onClick={() => {
                    fetchStudents();
                    showToast("Refreshed student roster from database");
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                >
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
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <select value={studentSortBy} onChange={(e) => { setStudentSortBy(e.target.value as typeof studentSortBy); setCurrentPage(1); }} className="px-3 py-2 text-xs rounded-xl border border-[#CEDECF] bg-white text-slate-700 font-medium"><option value="name">Sort by name</option><option value="status">Sort by status</option><option value="joined">Sort by joined date</option></select>
                <button onClick={() => { setStudentSortOrder(value => value === "asc" ? "desc" : "asc"); setCurrentPage(1); }} className="rounded-xl border border-[#CEDECF] bg-white px-3 py-2 text-xs font-bold">{studentSortOrder === "asc" ? "Ascending" : "Descending"}</button>
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
                          <tr key={s.id} onClick={() => { setViewingStudent(s); }} className="hover:bg-[#F9FAF9] transition cursor-pointer">
                            <td className="px-6 py-4">
                              <p className="font-bold text-[#0C2417] text-sm">{s.name}</p>
                              <p className="text-[11px] text-slate-500">{s.email}</p>
                              <p className="text-[10px] text-slate-400">{s.phone || "Phone missing"}</p>
                            </td>
                            <td className="px-6 py-4">
                              {s.verification_status === "VERIFIED" || s.is_verified ? (
                                <span className="record-capsule inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>VERIFIED</span>
                                </span>
                              ) : (
                                <span className="record-capsule inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>NOT VERIFIED</span>
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-800">{s.plan}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="record-capsule font-bold text-[#1b4332] bg-[#E8F0E9] px-2.5 py-1 rounded-full text-xs">
                                {s.attended} / {s.total} Classes
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`record-capsule px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                s.status === "SUSPENDED" ? "bg-red-50 text-red-700" : s.verification_status !== "VERIFIED" && !s.is_verified ? "bg-amber-50 text-amber-700" : s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {s.status === "SUSPENDED" ? "SUSPENDED" : (s.verification_status === "VERIFIED" || s.is_verified) ? s.status : "PENDING VERIFICATION"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={(event) => { event.stopPropagation(); setViewingStudent(s); }} className="mr-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#133623] hover:bg-[#E8F0E9]">Edit details</button>
                              <button
                                onClick={(event) => { event.stopPropagation(); openAttendanceFor("student", s); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E8F0E9] hover:bg-[#cedecf] text-[#0C2417] transition"
                              >
                                View attendance
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
                    <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong>{totalItems}</strong> students
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
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const getPages = () => {
                        if (totalPages <= 7) {
                          return Array.from({ length: totalPages }, (_, i) => i + 1);
                        }
                        if (currentPage <= 4) {
                          return [1, 2, 3, 4, 5, "...", totalPages];
                        }
                        if (currentPage >= totalPages - 3) {
                          return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                        }
                        return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
                      };

                      return getPages().map((pageNum, idx) =>
                        pageNum === "..." ? (
                          <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold select-none text-xs">
                            …
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(Number(pageNum))}
                            className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition ${
                              currentPage === pageNum
                                ? "bg-[#133623] text-white shadow-sm"
                                : "bg-white border border-[#CEDECF] text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      );
                    })()}
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
          <StudioClasses
            orgId={currentUser?.organization_id}
            canCreateClass={features.createClasses}
            isTeacher={isTeacher}
            focusedClassTitle={focusedClassTitle}
            onClearFocusedClass={() => setFocusedClassTitle(null)}
          />
        )}

        {activeTab === "subscriptions-manager" && (
          <StudioMemberships orgId={currentUser?.organization_id} canManageMemberships={features.membershipsManager} />
        )}

        {/* TAB 4: ATTENDANCE TRACKER (FEAT-06) */}
        {activeTab === "attendance-tracker" && (
          <div className="space-y-6">
            <div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">
                  {isTeacher ? "Student Attendance" : "Attendance Tracker"}
                </h1>
                <p className="text-xs text-[#40514E] mt-0.5">
                  {isTeacher
                    ? "Select a student to review their attendance by month or day."
                    : "Select one teacher or student to review their attendance by month or day."}
                </p>
              </div>
            </div>

            {!isTeacher && (
              <div className="border-b border-[#CEDECF] flex gap-7" role="tablist" aria-label="Attendance type">
                {(["teacher", "student"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    role="tab"
                    aria-selected={attendanceType === type}
                    onClick={() => openAttendanceFor(type)}
                    className={`border-b-2 px-1 pb-3 text-sm font-bold capitalize transition ${attendanceType === type ? "border-[#133623] text-[#133623]" : "border-transparent text-slate-500 hover:text-[#133623]"}`}
                  >
                    {type} attendance
                  </button>
                ))}
              </div>
            )}

            {/* Search and View Controls in ONE single row */}
            <div className="rounded-2xl border border-[#E1E9E2] bg-white p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search input with prominent clear option */}
                <div className="relative flex-1 min-w-0 max-w-xl" ref={attendanceSearchContainerRef}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="attendance-person-search" className="block text-xs font-bold uppercase tracking-wider text-[#1b4332]">
                      Find a {attendanceType}
                    </label>
                    {selectedAttendancePerson && (
                      <span className="text-[11px] font-semibold text-[#2D7A58] flex items-center gap-1">
                        <Check className="h-3 w-3" /> Selected: {selectedAttendancePerson.name}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="attendance-person-search"
                      value={displayPersonSearch}
                      onFocus={() => {
                        setAttendancePersonSearch(selectedAttendancePerson?.name || "");
                        setAttendanceSuggestionsOpen(true);
                      }}
                      onChange={(event) => {
                        setAttendancePersonSearch(event.target.value);
                        setAttendanceSuggestionsOpen(true);
                      }}
                      placeholder={`Search ${attendanceType} by name or email…`}
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={attendanceSuggestionsOpen}
                      aria-controls="attendance-person-options"
                      className="w-full rounded-xl border border-[#CEDECF] py-2.5 pl-10 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-[#81A882]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {attendancePeopleLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-[#2D7A58]" />
                      )}
                      {(displayPersonSearch || selectedAttendancePerson) && (
                        <button
                          type="button"
                          aria-label={`Clear ${attendanceType} search`}
                          onClick={() => {
                            setAttendancePersonSearch("");
                            if (attendanceType === "teacher") setSelectedAttendanceTeacher(null);
                            else setSelectedAttendanceStudent(null);
                            setAttendanceSuggestionsOpen(false);
                            setAttendanceEvents([]);
                          }}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-[#E8F0E9] transition"
                          title={`Clear ${attendanceType} search`}
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {attendanceSuggestionsOpen && (
                    <div
                      id="attendance-person-options"
                      role="listbox"
                      className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#CEDECF] bg-white p-1 shadow-xl"
                    >
                      {attendanceOptions.length === 0 && !attendancePeopleLoading ? (
                        <p className="px-3 py-4 text-xs text-slate-500">No {attendanceType}s found.</p>
                      ) : (
                        attendanceOptions.map((person) => (
                          <button
                            key={person.id}
                            type="button"
                            role="option"
                            aria-selected={selectedAttendancePerson?.id === person.id}
                            onClick={() => {
                              setAttendancePersonSearch(person.name);
                              setAttendanceSuggestionsOpen(false);
                              if (attendanceType === "teacher") setSelectedAttendanceTeacher(person as StudioTeacher);
                              else setSelectedAttendanceStudent(person as Student);
                            }}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-[#F4F7F4] transition"
                          >
                            <span>
                              <strong className="block text-sm text-[#0C2417]">{person.name}</strong>
                              <span className="text-[11px] text-slate-500">{person.email}</span>
                            </span>
                            {selectedAttendancePerson?.id === person.id && (
                              <Check className="h-4 w-4 text-[#2D7A58]" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Month or Day selection option on the SAME row */}
                <div className="flex items-center gap-2 sm:self-end pb-0.5 shrink-0">
                  <span className="text-xs font-bold text-slate-500 hidden md:inline">View:</span>
                  <div className="flex rounded-xl border border-[#CEDECF] bg-[#F4F7F4] p-1" aria-label="Attendance period">
                    {(["month", "day"] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setAttendancePeriod(period)}
                        aria-pressed={attendancePeriod === period}
                        className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${
                          attendancePeriod === period
                            ? "bg-[#133623] text-white shadow-sm"
                            : "text-[#275539] hover:text-[#133623]"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!selectedAttendancePerson && (
              <div className="rounded-3xl border border-dashed border-[#B8CBB9] bg-[#F4F7F4] px-6 py-14 text-center">
                <UserRound className="mx-auto h-9 w-9 text-[#81A882]" />
                <h2 className="mt-3 font-serif text-xl font-bold text-[#0C2417]">Select a {attendanceType}</h2>
                <p className="mt-1 text-xs text-slate-500">Their attendance calendar will appear here.</p>
              </div>
            )}

            {attendanceCalendarError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{attendanceCalendarError}</p>}
            {selectedAttendancePerson && (
              <AttendanceCalendar
                key={`${attendanceType}-${selectedAttendancePerson.id}`}
                events={attendanceEvents}
                onUpdateEvents={setAttendanceEvents}
                onSaveEvent={saveCalendarAttendance}
                onToast={showToast}
                readOnly={attendanceType === "teacher" && isTeacher}
                personLabel={selectedAttendancePerson.name}
                view={attendancePeriod}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onMonthChange={setAttendanceMonth}
                loading={attendanceCalendarLoading}
                onEditClass={(entry) => {
                  setFocusedClassTitle(entry.sessionTitle);
                  setActiveTab("classes-plans");
                }}
              />
            )}

            {attendanceType === "student" && (() => {
              const attendedCount = liveRoster.filter(s => s.attendance_status === "ATTENDED").length;
              const absentCount = liveRoster.filter(s => s.attendance_status === "ABSENT").length;
              const excusedCount = liveRoster.filter(s => s.attendance_status === "EXCUSED").length;
              const unmarkedCount = liveRoster.filter(s => s.attendance_status === "UNMARKED" || !s.attendance_status).length;
              const totalCount = liveRoster.length;
              const markedCount = totalCount - unmarkedCount;
              const percentMarked = totalCount > 0 ? Math.round((markedCount / totalCount) * 100) : 0;
              const selectedClass = liveAttendanceClasses.find(c => c.id === selectedLiveClassId);

              return (
                <div className="rounded-3xl border border-[#CEDECF] bg-white p-5 sm:p-6 shadow-sm space-y-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E9E2] pb-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#0C2417]">Class attendance roster</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Select a class session to review enrolled students and quickly mark attendance.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor="live-attendance-date" className="text-xs font-bold text-slate-700">Date:</label>
                      <input
                        id="live-attendance-date"
                        type="date"
                        value={liveAttendanceDate}
                        onChange={(e) => setLiveAttendanceDate(e.target.value)}
                        className="border border-[#CEDECF] rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                  </div>

                  {/* Class selector toolbar & bulk action */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1">
                      <select
                        aria-label="Class Occurrence"
                        value={selectedLiveClassId}
                        onChange={(e) => loadLiveRoster(e.target.value)}
                        className="w-full sm:w-80 border border-[#CEDECF] rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#133623] bg-white"
                      >
                        <option value="">Select a scheduled class…</option>
                        {liveAttendanceClasses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({new Date(c.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => selectedLiveClassId && loadLiveRoster(selectedLiveClassId)}
                        disabled={!selectedLiveClassId || isLiveRosterLoading}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#E8F0E9] hover:bg-[#CEDECF] text-[#0C2417] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLiveRosterLoading ? "animate-spin" : ""}`} />
                        <span>Reload Roster</span>
                      </button>
                    </div>

                    {/* Bulk mark all present */}
                    {selectedLiveClassId && liveRoster.length > 0 && (
                      <button
                        type="button"
                        onClick={markAllLivePresent}
                        disabled={isMarkingLiveAttendance || unmarkedCount === 0}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#133623] text-white hover:bg-[#1b4332] transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {isMarkingLiveAttendance ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Mark All Present</span>
                      </button>
                    )}
                  </div>

                  {/* Class status banner with progress */}
                  {selectedClass && liveRoster.length > 0 && (
                    <div className="rounded-2xl bg-[#F4F7F4] p-4 border border-[#CEDECF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#2D7A58]" />
                          <h4 className="font-bold text-sm text-[#0C2417]">{selectedClass.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(selectedClass.start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {totalCount} enrolled {totalCount === 1 ? "student" : "students"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-[#E1E9E2] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#15803d] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentMarked}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#0C2417] whitespace-nowrap">
                          {markedCount}/{totalCount} marked ({percentMarked}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Filter chips & Search bar */}
                  {selectedLiveClassId && liveRoster.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Status filter tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {(
                            [
                              ["ALL", `All (${totalCount})`],
                              ["ATTENDED", `Present (${attendedCount})`],
                              ["ABSENT", `Absent (${absentCount})`],
                              ["EXCUSED", `Excused (${excusedCount})`],
                              ["UNMARKED", `Unmarked (${unmarkedCount})`],
                            ] as const
                          ).map(([value, label]) => {
                            const active = rosterFilter === value;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setRosterFilter(value)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                                  active
                                    ? value === "ATTENDED"
                                      ? "bg-[#15803d] text-white shadow-xs"
                                      : value === "ABSENT"
                                      ? "bg-[#dc2626] text-white shadow-xs"
                                      : value === "EXCUSED"
                                      ? "bg-[#ca8a04] text-white shadow-xs"
                                      : "bg-[#133623] text-white shadow-xs"
                                    : "bg-[#F4F7F4] border border-[#CEDECF] text-slate-700 hover:bg-[#E8F0E9]"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Search in roster with clear option */}
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          <input
                            id="attendance-roster-search"
                            value={rosterSearch}
                            onChange={(e) => setRosterSearch(e.target.value)}
                            placeholder="Find student in roster…"
                            className="w-full rounded-xl border border-[#CEDECF] py-2 pl-9 pr-8 text-xs focus:ring-2 focus:ring-[#133623] focus:outline-none"
                          />
                          {rosterSearch && (
                            <button
                              type="button"
                              aria-label="Clear roster search"
                              onClick={() => setRosterSearch("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 transition"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading indicator */}
                  {isLiveRosterLoading && (
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-8 bg-[#F4F7F4] rounded-2xl">
                      <Loader2 className="h-4 w-4 animate-spin text-[#133623]" />
                      <span>Loading enrolled roster from database…</span>
                    </div>
                  )}

                  {/* Empty state: No class selected */}
                  {!selectedLiveClassId && (
                    <div className="rounded-2xl border border-dashed border-[#CEDECF] p-8 text-center bg-[#F4F7F4]">
                      <Users className="mx-auto h-8 w-8 text-[#81A882]" />
                      <h4 className="mt-2 text-sm font-bold text-[#0C2417]">No scheduled class selected</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose a class session above to view its enrolled students and mark attendance.
                      </p>
                    </div>
                  )}

                  {/* Empty state: No students enrolled */}
                  {selectedLiveClassId && !isLiveRosterLoading && liveRoster.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#CEDECF] p-8 text-center bg-[#F4F7F4]">
                      <Users className="mx-auto h-8 w-8 text-slate-400" />
                      <h4 className="mt-2 text-sm font-bold text-[#0C2417]">No students enrolled</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        There are no students currently enrolled in this class occurrence.
                      </p>
                    </div>
                  )}

                  {/* Empty state: Filter / search with zero matches */}
                  {selectedLiveClassId && !isLiveRosterLoading && liveRoster.length > 0 && filteredLiveRoster.length === 0 && (
                    <div className="rounded-2xl bg-[#F4F7F4] p-6 text-center text-xs text-slate-500 space-y-2 border border-[#CEDECF]">
                      <p>No students match your filter or search criteria.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setRosterSearch("");
                          setRosterFilter("ALL");
                        }}
                        className="text-xs font-bold text-[#2D7A58] underline hover:text-[#133623]"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}

                  {/* Student list */}
                  {filteredLiveRoster.length > 0 && (
                    <div className="divide-y divide-[#E1E9E2] border border-[#CEDECF] rounded-2xl overflow-hidden shadow-xs bg-white">
                      {filteredLiveRoster.map((student: any) => {
                        const isUpdating = markingEnrollmentId === student.enrollment_id;
                        const status = student.attendance_status;
                        const initials = (student.student_name || "ST")
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <div
                            key={student.enrollment_id}
                            className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FAF9] transition"
                          >
                            {/* Student avatar & details */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-full bg-[#E8F0E9] text-[#133623] font-bold text-xs flex items-center justify-center shrink-0 border border-[#CEDECF]">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-sm text-[#0C2417] truncate">{student.student_name}</p>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      status === "ATTENDED"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : status === "ABSENT"
                                        ? "bg-red-100 text-red-800"
                                        : status === "EXCUSED"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {status === "ATTENDED" ? "Present" : status === "ABSENT" ? "Absent" : status === "EXCUSED" ? "Excused" : "Not marked"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate">{student.student_email}</p>
                                {student.total_sessions && (
                                  <p className="text-[10px] text-slate-400">
                                    Sessions: {student.sessions_attended ?? 0} / {student.total_sessions} completed
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Quick Action Pill Buttons */}
                            <div className="flex items-center gap-2 sm:self-center shrink-0">
                              <div className="flex items-center rounded-xl border border-[#CEDECF] bg-[#F4F7F4] p-0.5 text-xs">
                                <button
                                  type="button"
                                  title="Mark Present"
                                  disabled={isUpdating}
                                  onClick={() => handleMarkLiveAttendance(student.enrollment_id, "ATTENDED")}
                                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                                    status === "ATTENDED"
                                      ? "bg-[#15803d] text-white shadow-xs"
                                      : "text-slate-600 hover:text-[#15803d] hover:bg-white"
                                  }`}
                                >
                                  {isUpdating && status !== "ATTENDED" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                  <span>Present</span>
                                </button>
                                <button
                                  type="button"
                                  title="Mark Absent"
                                  disabled={isUpdating}
                                  onClick={() => handleMarkLiveAttendance(student.enrollment_id, "ABSENT")}
                                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                                    status === "ABSENT"
                                      ? "bg-[#dc2626] text-white shadow-xs"
                                      : "text-slate-600 hover:text-[#dc2626] hover:bg-white"
                                  }`}
                                >
                                  {isUpdating && status !== "ABSENT" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                  <span>Absent</span>
                                </button>
                                <button
                                  type="button"
                                  title="Mark Excused"
                                  disabled={isUpdating}
                                  onClick={() => handleMarkLiveAttendance(student.enrollment_id, "EXCUSED")}
                                  className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                                    status === "EXCUSED"
                                      ? "bg-[#ca8a04] text-white shadow-xs"
                                      : "text-slate-600 hover:text-[#ca8a04] hover:bg-white"
                                  }`}
                                >
                                  {isUpdating && status !== "EXCUSED" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                  <span>Excused</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}



          </div>
        )}

        {/* TAB: MY WEBSITE */}
        {activeTab === "my-website" && (
          <WebsiteEditor embedded={true} />
        )}

        {/* TAB 5: STUDENT QUERIES */}
        {activeTab === "queries-manager" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Student Support & Queries</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Manage support questions and messages from students submitted through the student portal.</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-2xl border border-[#CEDECF] text-xs font-semibold">
                {[
                  ["ALL", "All"],
                  ["OPEN", "Open"],
                  ["IN_PROGRESS", "In Progress"],
                  ["RESOLVED", "Resolved"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTicketStatusFilter(key)}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      ticketStatusFilter === key
                        ? "bg-[#133623] text-white shadow-xs"
                        : "text-slate-600 hover:text-[#0C2417] hover:bg-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {queriesLoading ? (
              <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-[#CEDECF]">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2D7A58] mb-2" />
                <p>Loading support tickets…</p>
              </div>
            ) : queries.length === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-[#CEDECF] text-center text-slate-500 text-sm space-y-1">
                <p className="font-semibold text-[#0C2417]">No support tickets found.</p>
                <p className="text-xs text-slate-400">Questions submitted by students will appear here in your support queue.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {queries.map((q) => (
                  <div key={q.id} className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#0C2417]">{q.student_name}</span>
                        <span className="text-xs text-slate-500">({q.student_email})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0E9] text-[#133623] border border-[#CEDECF]">
                          {q.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === "RESOLVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : q.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {q.status === "IN_PROGRESS" ? "In Progress" : q.status}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#0C2417]">{q.subject}</h3>

                      {q.latest_message && (
                        <p className="text-xs text-[#263328] bg-[#F4F7F4] p-3 rounded-xl border border-[#E1E9E2]">
                          <span className="font-semibold text-slate-700">{q.latest_message_sender || "Student"}: </span>
                          {q.latest_message}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>Updated: {new Date(q.updated_at).toLocaleString()}</span>
                        <span>·</span>
                        <span>{q.message_count} {q.message_count === 1 ? "message" : "messages"}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <button
                        onClick={() => void openTicketDetail(q.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#133623] hover:bg-[#0C2417] text-white transition shadow-xs"
                      >
                        View Thread & Reply
                      </button>

                      {q.status !== "RESOLVED" ? (
                        <button
                          onClick={() => void updateTicketStatus(q.id, "RESOLVED")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#CEDECF] text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <button
                          onClick={() => void updateTicketStatus(q.id, "OPEN")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#CEDECF] text-slate-600 hover:text-[#133623] hover:border-[#133623] transition"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Conversation Thread Modal */}
            {selectedTicket && (
              <Modal
                title={`Ticket: ${selectedTicket.subject}`}
                onClose={() => setSelectedTicket(null)}
              >
                <div className="p-6 max-w-2xl w-full space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E1E9E2] flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-slate-500">From {selectedTicket.student_name} ({selectedTicket.student_email})</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedTicket.status === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : selectedTicket.status === "IN_PROGRESS"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        Status: {selectedTicket.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTicket.status !== "RESOLVED" ? (
                        <button
                          onClick={() => void updateTicketStatus(selectedTicket.id, "RESOLVED")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                        >
                          Mark as Resolved
                        </button>
                      ) : (
                        <button
                          onClick={() => void updateTicketStatus(selectedTicket.id, "OPEN")}
                          className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
                        >
                          Reopen Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#CEDECF]">
                    {selectedTicket.messages && selectedTicket.messages.map((m: any) => {
                      const isStaff = m.sender_role === "STUDIO" || m.sender_role === "TEACHER";
                      return (
                        <div
                          key={m.id}
                          className={`p-3 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                            isStaff
                              ? "ml-auto bg-[#133623] text-white"
                              : "mr-auto bg-white text-slate-800 border border-[#CEDECF]"
                          }`}
                        >
                          <div className={`flex items-center justify-between gap-2 text-[10px] ${isStaff ? "text-emerald-200" : "text-slate-500"}`}>
                            <span className="font-bold">{m.sender_name} ({m.sender_role})</span>
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.message}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Composer */}
                  <div className="space-y-2 pt-2">
                    <label htmlFor="ticket-reply" className="block text-xs font-bold text-slate-700">
                      Reply to Student:
                    </label>
                    <textarea
                      id="ticket-reply"
                      rows={3}
                      value={ticketReplyMessage}
                      onChange={(e) => setTicketReplyMessage(e.target.value)}
                      placeholder="Type your response to the student…"
                      className="w-full p-3 rounded-xl border border-[#CEDECF] text-xs focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white text-slate-900"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        disabled={isSendingTicketReply || !ticketReplyMessage.trim()}
                        onClick={() => void sendTicketReply(selectedTicket.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#133623] hover:bg-[#0C2417] text-white transition disabled:opacity-50"
                      >
                        {isSendingTicketReply ? "Sending…" : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* TAB 6: ANALYTICS & REVENUE */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Studio Analytics & Reconciled Aggregates</h1>
                <p className="text-xs text-[#40514E] mt-0.5">Aggregated metrics derived from active database records and verified enrollments.</p>
              </div>
              <button
                type="button"
                onClick={fetchStudioAnalytics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#CEDECF] text-xs font-bold text-[#133623] hover:bg-[#FAF7F2] transition shadow-xs self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
                <span>Refresh Metrics</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-medium">Active Enrolled Students</span>
                <h3 className="text-3xl font-black text-[#0C2417]">
                  {studioAnalytics ? studioAnalytics.active_enrolled_students : (students.filter(s => s.status === 'ACTIVE').length || 0)}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Distinct students with confirmed active class enrollments</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-medium">Active Recurring Batches</span>
                <h3 className="text-3xl font-black text-[#0C2417]">
                  {studioAnalytics ? studioAnalytics.active_recurring_batches : batches.length}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Weekly configured active class schedules</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-medium">Total Support Queries</span>
                <h3 className="text-3xl font-black text-[#0C2417]">
                  {studioAnalytics ? studioAnalytics.total_support_queries : queries.length}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Student conversations in ticket queue</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-medium">Projected Subscription Value</span>
                <h3 className="text-3xl font-black text-[#0C2417]">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: studioAnalytics?.currency || 'INR', maximumFractionDigits: 0 }).format(
                    studioAnalytics?.projected_subscription_value ?? batches.reduce((sum, b) => sum + (Number(b.price?.replace(/[^0-9.-]+/g, '')) || 0), 0)
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Sum of active batch subscription fees & passes</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-medium">Collected Gateway Revenue</span>
                <h3 className="text-3xl font-black text-emerald-800">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: studioAnalytics?.currency || 'INR', maximumFractionDigits: 0 }).format(
                    studioAnalytics?.collected_revenue ?? 0
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Total captured payment transactions from payment gateways</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-2">
                <span className="text-xs text-slate-500 font-medium">Scheduled Billed Revenue</span>
                <h3 className="text-3xl font-black text-[#0C2417]">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: studioAnalytics?.currency || 'INR', maximumFractionDigits: 0 }).format(
                    studioAnalytics?.billed_revenue ?? 0
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Total subscription billing commitment from enrollments</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#CEDECF] text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📊</span>
                <span className="font-bold text-[#0C2417] text-sm">Revenue Accounting & Gateway Reconciliation</span>
              </div>
              <p className="leading-relaxed">
                <strong>Billed Revenue vs Collected Revenue:</strong> Billed revenue represents the total contracted subscription value calculated from enrolled student memberships. Collected revenue represents actual net funds captured via Razorpay/payment gateways. Scheduled billing reports currently exclude real-time gateway settlements until reconciled.
              </p>
              <div className="pt-2 border-t border-[#E1E9E2] flex items-center justify-between">
                <span>Need itemized ledger rows or CSV accounting reports?</span>
                <button
                  type="button"
                  onClick={() => navigateToTab("billing-dashboard")}
                  className="font-bold text-[#133623] underline hover:text-[#0C2417]"
                >
                  Open Billing Center & Export CSV →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing-dashboard" && currentUser?.organization_id && (
          <BillingCenter orgId={currentUser.organization_id} mode="dashboard" />
        )}

        {activeTab === "billing-downloads" && currentUser?.organization_id && (
          <BillingCenter orgId={currentUser.organization_id} mode="downloads" />
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
                Profile Settings
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={settingsSection === "dashboard"}
                onClick={() => setSettingsSection("dashboard")}
                className={settingsSection === "dashboard" ? "active" : ""}
              >
                Dashboard Settings
              </button>
            </div>

            {settingsSection === "profile" ? (
              isTeacher ? (
                /* TEACHER PROFILE SETTINGS */
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Teacher Profile Settings</h1>
                    <p className="text-xs text-[#40514E] mt-0.5">
                      Update your teacher details, contact information, and sanctuary teaching location.
                    </p>
                  </div>

                  <form onSubmit={handleSaveTeacherProfile} className="bg-white p-6 rounded-3xl border border-[#CEDECF] shadow-sm space-y-4 max-w-2xl">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                        <input
                          required
                          value={teacherProfileName}
                          onChange={(e) => setTeacherProfileName(e.target.value)}
                          className="w-full border border-[#CEDECF] rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#133623] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone</label>
                        <input
                          value={teacherProfilePhone}
                          onChange={(e) => setTeacherProfilePhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full border border-[#CEDECF] rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#133623] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                        <input
                          value={teacherProfileAddress}
                          onChange={(e) => setTeacherProfileAddress(e.target.value)}
                          placeholder="Studio Road or Residential Address"
                          className="w-full border border-[#CEDECF] rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#133623] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">City / Region</label>
                        <input
                          value={teacherProfileLocation}
                          onChange={(e) => setTeacherProfileLocation(e.target.value)}
                          placeholder="e.g. Pune, Mumbai, Bengaluru"
                          className="w-full border border-[#CEDECF] rounded-xl p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#133623] focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 grid grid-cols-2 gap-3 text-xs bg-[#F4F7F4] p-3 rounded-2xl border border-[#E1E9E2]">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Registered Email</span>
                          <span className="font-semibold text-[#0C2417]">{currentUser?.email || "teacher@yogastudio.com"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctuary Studio</span>
                          <span className="font-semibold text-[#0C2417]">{currentUser?.organization_name || "Tranquil Flow Sanctuary"}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingTeacherProfile}
                      className="px-5 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-xs shadow-md transition"
                    >
                      {isSavingTeacherProfile ? "Saving…" : "Save Profile"}
                    </button>
                  </form>
                </div>
              ) : (
              <>
            {/* Header with Title & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Profile Settings</h1>
                  {isStep6Complete && zoomConnected ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-[#133623] border border-emerald-300 inline-flex items-center">
                      Sanctuary Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center">
                      Setup In Progress ({displayPercentage}%)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#40514E] mt-0.5">
                  Official sanctuary profile, contact details, physical/online location, legal business & GST identity, fee payout accounts, and authenticated Zoom integration.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleOpenAccountDetails}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F4F7F4] text-[#133623] border border-[#CEDECF] shadow-sm transition"
                >
                  <span>Edit in Account Details</span>
                </button>
                <Link
                  href={`/${studioProfile?.slug || currentUser?.organization_slug || "sahil-yoga-studio"}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#133623] hover:bg-[#0C2417] text-white shadow-sm transition"
                >
                  <span>Public Sanctuary Page</span>
                </Link>
              </div>
            </div>

            {/* Account Status Banner */}
            <div className={`p-4 rounded-3xl border flex items-start gap-3.5 ${
              isStep6Complete && zoomConnected
                ? "bg-[#F4F7F4] border-[#CEDECF] text-[#0C2417]"
                : "bg-amber-50/80 border-amber-200 text-amber-900"
            }`}>
              <div className="flex-1 text-xs">
                <h4 className="font-bold">
                  {isStep6Complete && zoomConnected
                    ? "Verified Sanctuary Roster & Integrations Active"
                    : !zoomConnected
                    ? `Setup In Progress (${displayPercentage}% - Zoom Disconnected)`
                    : "Account Setup Incomplete - Finish All Steps"}
                </h4>
                <p className="text-slate-600 mt-0.5">
                  {isStep6Complete && zoomConnected
                    ? "Sanctuary profile and live video integrations are active. Classes automatically provision authenticated Zoom meeting links with waiting room security."
                    : !zoomConnected
                    ? "Studio profile and payment details are saved, but Zoom live video integration is disconnected. Connect Zoom OAuth in Step 5 before scheduled online classes can automatically provision live rooms."
                    : "Your studio account needs a few more details to be fully operational. Click 'Complete Setup' to finish configuring your phone, teaching location, GST/PAN, payout bank details, and Zoom live classroom."}
                </p>
              </div>
              {(!isStep6Complete || !zoomConnected) && (
                <button
                  onClick={handleOpenAccountDetails}
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
                  <div>
                    <h3 className="font-bold text-sm text-[#0C2417]">Studio Profile & Mobile Phone</h3>
                    <p className="text-[11px] text-slate-500">Contact and public identity</p>
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
                  <div>
                    <h3 className="font-bold text-sm text-[#0C2417]">Studio Location & Teaching Mode</h3>
                    <p className="text-[11px] text-slate-500">Physical address & delivery formats</p>
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
                          ? "Physical In-Studio Sanctuary"
                          : setupTeachingMode === "ONLINE"
                          ? "100% Live Interactive Online"
                          : "Hybrid Sanctuary (Physical & Live Online)"}
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
                      <span className="text-emerald-700 font-medium">Location verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: GST & LEGAL BUSINESS PROFILER */}
              <div className="bg-white p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F0]">
                  <div>
                    <h3 className="font-bold text-sm text-[#0C2417]">GST Number & Legal Business</h3>
                    <p className="text-[11px] text-slate-500">Tax compliance & invoicing details</p>
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
                  <div>
                    <h3 className="font-bold text-sm text-[#0C2417]">Bank Payouts & Settlement Account</h3>
                    <p className="text-[11px] text-slate-500">Where student membership earnings are sent</p>
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
                  <div>
                    <h3 className="font-bold text-sm text-[#0C2417]">Zoom Live Video Integration</h3>
                    <p className="text-[11px] text-slate-500">Automated meeting room generation for live batches</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {zoomConnected ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 inline-flex items-center">
                        Authenticated & Connected
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center">
                        Not Connected
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
                    <DeveloperOnly><button
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
                    </button></DeveloperOnly>

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

                <DeveloperOnly>
                {/* Test meeting error or preview banner */}
                {zoomTestError && (
                  <div role="alert" className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-semibold">{zoomTestError}</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Live Zoom meetings require an authenticated Zoom account. Please enter your Zoom credentials or complete OAuth authentication above.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const emailInput = document.getElementById("zoom-email-input") || document.querySelector("input[type=email]");
                        if (emailInput) (emailInput as HTMLElement).focus();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-bold text-[11px] transition shadow-xs"
                    >
                      <span>Fill Zoom Credentials & Connect Above ↑</span>
                    </button>
                  </div>
                )}

                {testZoomMeeting && (
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                    testZoomMeeting.is_simulated
                      ? "bg-amber-50 border-amber-200 text-amber-950"
                      : "bg-blue-50 border-blue-200 text-blue-950"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold flex items-center gap-1.5 ${
                        testZoomMeeting.is_simulated ? "text-amber-900" : "text-blue-900"
                      }`}>
                        <CheckCircle2 className={`h-4 w-4 ${testZoomMeeting.is_simulated ? "text-amber-600" : "text-blue-600"}`} />
                        {testZoomMeeting.is_simulated
                          ? "[SIMULATION] Development Simulation Test Room (Dev Mode)"
                          : "Live Zoom Room Provisioned Successfully!"}
                      </span>
                      <a
                        href={testZoomMeeting.join_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`font-bold hover:underline flex items-center gap-1 ${
                          testZoomMeeting.is_simulated ? "text-amber-800" : "text-blue-700"
                        }`}
                      >
                        <span>Open Meeting</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className={`flex flex-wrap gap-4 text-[11px] font-mono ${
                      testZoomMeeting.is_simulated ? "text-amber-800" : "text-blue-800"
                    }`}>
                      <span>Room ID: {testZoomMeeting.meeting_id}</span>
                      <span>Passcode: {testZoomMeeting.passcode}</span>
                      <span className="truncate max-w-xs">URL: {testZoomMeeting.join_url}</span>
                    </div>
                  </div>
                )}
                </DeveloperOnly>
              </div>
            </div>
              </>
              )
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Dashboard Settings</h1>
                  <p className="text-xs text-[#40514E] mt-1">Personalize your workspace color theme. Changes are saved on this device.</p>
                </div>

                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4" aria-labelledby="dashboard-font-heading">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 id="dashboard-font-heading" className="font-bold text-base text-[#0C2417]">Typography</h2>
                      <p className="text-xs text-slate-500 mt-1">Lora is used consistently for all dashboard headings, navigation, cards, and controls.</p>
                    </div>
                    <span className="text-sm font-semibold">Lora</span>
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
                      { id: "sand", name: "Warm Sand", colors: ["#43362B", "#A26B47", "#FBF5EC"] },
                      { id: "midnight", name: "Midnight Pine", colors: ["#071A16", "#1F6B55", "#101A18"] },
                      { id: "obsidian", name: "Obsidian", colors: ["#090B0D", "#48545C", "#15191D"] },
                      { id: "plum", name: "Dark Plum", colors: ["#21131F", "#7B4B70", "#1C151C"] }
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
                  <div>
                    <h2 className="font-bold text-base text-[#0C2417]">Public website theme & branding</h2>
                    <p className="text-xs text-slate-500 mt-1">Change the website template, headline and primary brand color.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("my-website");
                      if (typeof window !== "undefined") {
                        window.history.replaceState(null, "", "/dashboard?tab=my-website");
                      }
                    }}
                    className="btn-forest px-4 py-2.5 text-xs text-center shrink-0"
                  >
                    Customize Website
                  </button>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE CLASS BATCH MODAL (FEAT-05) */}
      {isCreateModalOpen && (
        <Modal
          title="Create New Class Batch"
          subtitle="Configure recurring schedule rules and automated meeting room."
          onClose={() => setIsCreateModalOpen(false)}
          confirmDiscard
        >
          <div className="p-6 space-y-5">
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
                  Batch / Class Name *
                </label>
                <input id="dashboard-page-field-19"
                  type="text"
                  required
                  placeholder="e.g. Sunset Vinyasa Flow, Aerial Silks Beginner"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] focus:outline-none focus:ring-2 focus:ring-[#133623] text-xs placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                          When you save this batch, an authenticated Zoom meeting room with waiting room protection will be automatically generated upon scheduling. You can also specify an optional custom URL below.
                        </p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="Optional custom meeting URL (leave empty for auto-provisioned Zoom room)"
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

      {isAddStudentOpen && (
        <Modal
          title="Add a registered student"
          subtitle="Students must register, verify their account, and provide a phone number before you can admit them to a class."
          onClose={() => setIsAddStudentOpen(false)}
          confirmDiscard
        >
          <form onSubmit={handleAddStudent} className="p-6 space-y-4">
            <label className="block text-xs font-bold text-[#1b4332]">
              Student email *
              <input
                type="email"
                required
                value={studentAdmissionEmail}
                onChange={(event) => setStudentAdmissionEmail(event.target.value)}
                placeholder="student@example.com"
                className="mt-1.5 w-full rounded-xl border border-[#CEDECF] bg-[#F9FAF9] px-3 py-2.5 text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623]"
              />
            </label>
            <label className="block text-xs font-bold text-[#1b4332]">
              Class *
              <select
                required
                value={studentAdmissionClassId}
                onChange={(event) => setStudentAdmissionClassId(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#CEDECF] bg-white px-3 py-2.5 text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623]"
              >
                <option value="">Select an active class</option>
                {studentAdmissionClasses.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-3 border-t border-[#E1E9E2] pt-4">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingStudent || !studentAdmissionClasses.length}
                className="rounded-xl bg-[#133623] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0C2417] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingStudent ? "Adding…" : "Add Student"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ADD TEACHER MODAL */}
      {isAddTeacherOpen && (
        <Modal
          title="Invite Teacher to Studio"
          subtitle="Invite an instructor to join your teaching roster. A unique 8-digit teacher code will be automatically assigned."
          onClose={() => setIsAddTeacherOpen(false)}
          confirmDiscard
        >
          <div className="p-6 space-y-4">
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
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-28" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <input id="dashboard-page-field-28"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center justify-center"
                  disabled={isSavingTeacher}
                >
                  <span>{isSavingTeacher ? "Sending…" : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {viewingTeacher && (
        <Modal
          title="Teacher Profile"
          subtitle={viewingTeacher.name}
          onClose={() => setViewingTeacher(null)}
        >
          <div className="p-6 space-y-4">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Email</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.email}</dd></div>
              <div><dt className="text-xs text-slate-500">Phone</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.phone || "Not provided"}</dd></div>
              <div><dt className="text-xs text-slate-500">Status</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.status}</dd></div>
              <div><dt className="text-xs text-slate-500">Joined</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.joined_at}</dd></div>
            </dl>
            <p className="rounded-xl bg-[#F4F7F4] p-4 text-sm leading-6 text-slate-600">{viewingTeacher.bio || "No teacher bio has been added."}</p>
            <div className="flex justify-end gap-2 border-t border-[#E1E9E2] pt-4">
              <button onClick={() => { const teacher = viewingTeacher; setViewingTeacher(null); handleOpenEditTeacher(teacher); }} className="rounded-xl border border-[#CEDECF] px-4 py-2.5 text-xs font-bold">Edit profile</button>
              <button onClick={() => { const teacher = viewingTeacher; setViewingTeacher(null); openAttendanceFor("teacher", teacher); }} className="rounded-xl bg-[#133623] px-4 py-2.5 text-xs font-bold text-white">View attendance</button>
            </div>
          </div>
        </Modal>
      )}

      {viewingStudent && <StudentDetails student={viewingStudent} onClose={() => setViewingStudent(null)} onSaved={() => { void fetchStudents(); }} />}

      {/* EDIT TEACHER MODAL */}
      {isEditTeacherOpen && editingTeacher && (
        <Modal
          title="Edit Teacher Profile"
          subtitle="Modify details or update active teaching status."
          onClose={() => { setIsEditTeacherOpen(false); setEditingTeacher(null); }}
          confirmDiscard
        >
          <div className="p-6 space-y-4">
            <form onSubmit={handleUpdateTeacher} className="space-y-4">
              <div className="grid gap-3">
                <label className="text-xs font-bold">Username<input required minLength={3} pattern="[a-zA-Z0-9_.-]+" value={teacherUsername} onChange={e => setTeacherUsername(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>
                <label className="text-xs font-bold">New password (leave blank to keep current)<input type="password" autoComplete="new-password"  minLength={8} value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>
                <label className="text-xs font-bold">Address<input required value={teacherAddress} onChange={e => setTeacherAddress(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>
                <label className="text-xs font-bold">Location<input required value={teacherLocation} onChange={e => setTeacherLocation(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>
              </div>

              <div>
                <label htmlFor="dashboard-page-field-31" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input id="dashboard-page-field-31"
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
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
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
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
                    <span className="text-emerald-700 font-bold">ACTIVE (Can teach classes)</span>
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center justify-center"
                  disabled={isSavingTeacher}
                >
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
