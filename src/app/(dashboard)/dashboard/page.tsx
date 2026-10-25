"use client";
import { AdminPeople } from "@/components/AdminPeople";
import { AdminHealth } from "@/components/AdminHealth";

import { rosterCsv } from "@/lib/roster-export";
import { PurchasePolicyNotice } from "@/components/PurchasePolicyNotice";
import { dashboardFonts, useDashboardTypography } from "@/components/DashboardTypographyProvider";
import { ScheduleInput } from "@/components/ScheduleInput";

import { WhatsAppNotificationHint } from "@/components/WhatsAppNotificationHint";

import { DeveloperOnly } from "@/components/DeveloperModeProvider";
import { StudentDetails } from "@/components/StudentDetails";

import dynamic from "next/dynamic";
import { PanelLoading } from "@/components/PanelLoading";
import type { CalendarSessionEvent } from "@/components/AttendanceCalendar";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { staffApi } from "@/lib/staff-api";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Users, CheckCircle2, Clock, Video, Search, ArrowRight, ChevronRight, AlertTriangle, X, ChevronLeft, Loader2, Mail, Phone, UserPlus, MapPin, Landmark, Check, Copy, RefreshCw, Smartphone, UserRound, HelpCircle, Share2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AdvancedOptions } from "@/components/AdvancedOptions";
import { Modal } from "@/components/Modal";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";
import { useFeedback } from "@/components/FeedbackProvider";
import { useCommunicationSettings } from "@/components/CommunicationSettingsProvider";
import WebsiteEditor from "@/components/website/WebsiteEditor";


const CommunicationChannelsPanel = dynamic(() => import("@/components/CommunicationChannelsPanel").then(module => module.CommunicationChannelsPanel), { loading: PanelLoading });
const StudioClasses = dynamic(() => import("@/components/StudioClasses").then(module => module.StudioClasses), { loading: PanelLoading });
const StudioMemberships = dynamic(() => import("@/components/StudioMemberships").then(module => module.StudioMemberships), { loading: PanelLoading });
const AttendanceCalendar = dynamic(() => import("@/components/AttendanceCalendar").then(module => module.AttendanceCalendar), { loading: PanelLoading });
const AdminStudios = dynamic(() => import("@/components/AdminStudios").then(module => module.AdminStudios), { loading: PanelLoading });
const StudioAccessNotice = dynamic(() => import("@/components/StudioAccessNotice").then(module => module.StudioAccessNotice));
const SaaSBilling = dynamic(() => import("@/components/SaaSBilling").then(module => module.SaaSBilling), { loading: PanelLoading });
const ProgressRoomsBilling = dynamic(() => import("@/components/ProgressRoomsBilling").then(module => module.ProgressRoomsBilling), { loading: PanelLoading });
const BillingCenter = dynamic(() => import("@/components/BillingCenter").then(module => module.BillingCenter), { loading: PanelLoading });
const StudioAnalytics = dynamic(() => import("@/components/StudioAnalytics").then(module => module.StudioAnalytics), { loading: PanelLoading });
import { studioToday } from "@/lib/meeting-window";
import { TeacherZoomControl, zoomLabel } from "@/components/TeacherZoomControl";

const InitialZoomSetup = dynamic(() => import("@/components/InitialZoomSetup").then(module => module.InitialZoomSetup), { loading: PanelLoading });

const ZoomSettings = dynamic(() => import("@/components/ZoomSettings").then(module => module.ZoomSettings), { loading: PanelLoading });

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
  | "billing-saas"
  | "billing-progressrooms"
  | "billing-downloads"
  | "settings"
  | "zoom-settings"
  | "zoom-host-key"
  // Super Admin Platform Tabs
  | "superadmin-teachers"
  | "superadmin-students"
  | "superadmin-health"
  | "superadmin-instructors"
  | "superadmin-billing"
  | "superadmin-analytics"
  | "superadmin-settings";

type SettingsSection = "profile" | "dashboard";
type DashboardTheme = "forest" | "sage" | "sand" | "midnight" | "obsidian" | "plum";

interface StudioProfile {
  timezone?: string;
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
  zoom_enforce_basic_login?: boolean;
  zoom_enforce_zoom_login?: boolean;
  zoom_group_allow_self_buy_subscriptions?: boolean;
  zoom_group_active_subscription_required?: boolean;
  zoom_group_confirm_checkin_everytime?: boolean;
  zoom_personal_allow_self_buy_subscriptions?: boolean;
  zoom_personal_active_subscription_required?: boolean;
  zoom_personal_confirm_checkin_everytime?: boolean;
  zoom_personal_no_show_penalty?: boolean;
  zoom_join_before_host?: boolean;
  zoom_cloud_recording_mode?: string;
  zoom_host_key?: string;
  account_completed?: boolean;
  completion_step?: number;
  whatsapp_number?: string;
  completion_percentage?: number;
}


interface StudioTeacher extends Partial<import("@/types").TeacherZoomState> {
  billing_country?: string | null;
  is_owner: boolean;
  can_teach: boolean;
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
    name: "Morning Music Class",
    classType: "Music",
    instructor: "Lead Instructor (Teacher)",
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
    name: "Dance Conditioning",
    classType: "Dance",
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
    name: "Language Practice",
    classType: "Languages",
    instructor: "Lead Instructor (Teacher)",
    days: ["Sun"],
    startTime: "08:30",
    endTime: "09:30",
    capacity: 30,
    price: "₹1,200",
    meetingUrl: "https://meet.progressrooms.com/sunday-breath",
    status: "ACTIVE"
  }
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
  const { font: dashboardFont, selectFont, loading: fontLoading, saving: fontSaving, error: fontError } = useDashboardTypography();
  const router = useRouter();
  const { whatsappCompletelyDisabled } = useCommunicationSettings();
  const [activeTab, setActiveTab] = useState<AdminTab>("account-completion");
  const [settingsSection, setSettingsSection] = useState<SettingsSection>("profile");
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>("forest");
  const { notify, confirm: confirmAction } = useFeedback();

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("progressrooms_dashboard_theme");
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
        "billing-saas",
        "billing-progressrooms",
        "billing-downloads",
        "settings",
        "zoom-settings",
        "zoom-host-key",
        "superadmin-instructors", "superadmin-teachers", "superadmin-students", "superadmin-health",
        "superadmin-billing",
        "superadmin-analytics",
        "superadmin-settings"
      ].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const zoomNavigationGuard = useRef<(() => Promise<boolean>) | null>(null);
  const registerZoomNavigationGuard = useCallback((guard: (() => Promise<boolean>) | null) => { zoomNavigationGuard.current = guard; }, []);
  const navigateToTab = async (tab: AdminTab) => {
    if (tab === activeTab) return;
    if (zoomNavigationGuard.current && !await zoomNavigationGuard.current()) return;
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
      localStorage.setItem("progressrooms_dashboard_theme", theme);
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

  const [studioRestricted, setStudioRestricted] = useState(false);
  const [studioPlanLabel, setStudioPlanLabel] = useState("");
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
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Step 1: Studio & Contact Info
  const [setupStudioName, setSetupStudioName] = useState("");
  const [setupPhone, setSetupPhone] = useState("");
  const [setupWhatsappNumber, setSetupWhatsappNumber] = useState("");
  const [setupSupportEmail, setSetupSupportEmail] = useState("");
  const [setupStudioTagline, setSetupStudioTagline] = useState("");
  const [setupDisciplines, setSetupDisciplines] = useState<string[]>([
    "Music",
    "Performing Arts",
    "Dance"
  ]);

  // Step 2: Teaching Location (optional) & Mode
  const [setupTeachingMode, setSetupTeachingMode] = useState<"PHYSICAL" | "ONLINE" | "HYBRID">("ONLINE");
  const [setupAddressLine1, setSetupAddressLine1] = useState("");
  const [setupAddressLine2, setSetupAddressLine2] = useState("");
  const [setupCity, setSetupCity] = useState("");
  const [setupState, setSetupState] = useState("");
  const [setupPincode, setSetupPincode] = useState("");
  const [setupCountry, setSetupCountry] = useState("India");

  // Step 3: GST (optional) & Legal Business Identity
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
  const setupSettlementCycle = "MONTHLY";

  // Step 5: Zoom Live Classroom Authentication
  const [zoomConnected, setZoomConnected] = useState(false);
  const [zoomAccountEmail, setZoomAccountEmail] = useState("");
  const [zoomAutoMeetingEnabled, setZoomAutoMeetingEnabled] = useState(true);
  useEffect(() => { if (new URLSearchParams(window.location.search).get("onboarding") === "zoom") { setActiveTab("account-completion"); setCompletionStep(5); } }, []);
  // Helper validation functions
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = (phone: string) => phone.replace(/\D/g, "").length >= 10;
  const isValidIfsc = (ifsc: string) => ifsc.trim().length === 11;

  // Exact step-by-step verification checks
  const isStep1Complete = Boolean(
    setupStudioName?.trim() &&
    isValidPhone(setupPhone) &&
    isValidEmail(setupSupportEmail)
  );

  const isStep2Complete = true; // Optional location and teaching mode.
  const isStep3Complete = true; // Optional business and tax information.

  const isStep4Complete = Boolean(
    setupBankName?.trim() &&
    setupAccountHolderName?.trim() &&
    ((setupAccountNumber?.trim() && setupAccountNumber?.trim() === setupConfirmAccountNumber?.trim() && setupAccountNumber?.trim().length >= 6) ||
      Boolean(studioProfile?.account_number_masked)) &&
    isValidIfsc(setupIfscCode)
  );

  const isStep5Complete = zoomConnected;
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
    if (!isStep4Complete) return 4;
    if (!isStep5Complete) return 5;
    return 6;
  };

  const handleOpenAccountDetails = async () => {
    if (zoomNavigationGuard.current && !await zoomNavigationGuard.current()) return;
    const stepToLoad = getFirstIncompleteStep();
    setCompletionStep(stepToLoad);
    setActiveTab("account-completion");
  };

  const validateStep = (stepNum: number): { valid: boolean; errorMsg?: string } => {
    switch (stepNum) {
      case 1:
        if (!setupStudioName.trim()) return { valid: false, errorMsg: "Please enter your Studio Name." };
        if (!setupPhone.trim() || !isValidPhone(setupPhone)) return { valid: false, errorMsg: "Please provide a valid 10+ digit Mobile Phone Number." };
        if (!setupSupportEmail.trim() || !isValidEmail(setupSupportEmail)) return { valid: false, errorMsg: "Please provide a valid Support / Business Email address." };
        return { valid: true };
      case 2:
      case 3:
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
        return zoomConnected ? { valid: true } : { valid: false, errorMsg: "Authenticate your initial Zoom account before continuing." };
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
  const teacherSortOrder = "asc";
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [isSavingTeacher, setIsSavingTeacher] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<StudioTeacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<StudioTeacher | null>(null);

  // Add / Edit Teacher form fields
  const [teacherUsername, setTeacherUsername] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherPasswordVisible, setTeacherPasswordVisible] = useState(false);
  const [teacherPasswordChanged, setTeacherPasswordChanged] = useState(false);
  const [studioPasswordPrompt, setStudioPasswordPrompt] = useState(false);
  const [studioPasswordInput, setStudioPasswordInput] = useState("");
  const [studioPasswordResolve, setStudioPasswordResolve] = useState<((value: string | null) => void) | null>(null);
  const askStudioPassword = () => new Promise<string | null>(resolve => {
    setStudioPasswordInput(""); setStudioPasswordResolve(() => resolve); setStudioPasswordPrompt(true);
  });
  const finishStudioPassword = (value: string | null) => {
    studioPasswordResolve?.(value); setStudioPasswordResolve(null); setStudioPasswordPrompt(false); setStudioPasswordInput("");
  };
  const manageTeacherPassword = async (change: boolean) => {
    if (!editingTeacher) return;
    const password = await askStudioPassword();
    if (!password) return;
    try {
    const response = await fetch(`${API_BASE_URL}/teachers/${editingTeacher.id}/password`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ studio_password: password }),
    });
    const data = await response.json();
    // Legacy accounts may create a new password after valid Studio reconfirmation.
    if (!response.ok && !((change || teacherPasswordChanged) && response.status === 409)) { showToast(data.detail || "Unable to verify Studio password"); return; }
    if (change) { setTeacherPassword(""); setTeacherPasswordChanged(true); }
    else if (!teacherPasswordChanged) setTeacherPassword(data.password);
    setTeacherPasswordVisible(!change);
    } catch { showToast("Unable to verify Studio password. Please retry."); }
  };
  const sendTeacherInvitation = async () => {
    if (!editingTeacher) return;
    const password = await askStudioPassword(); if (!password) return;
    try {
      const response = await fetch(`${API_BASE_URL}/teachers/${editingTeacher.id}/invitation`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify({ studio_password: password }),
      });
      const data = await response.json(); showToast(data.message || data.detail || "Unable to send invitation");
    } catch { showToast("Unable to send invitation. Please retry."); }
  };
  const [teacherAddress, setTeacherAddress] = useState("");
  const [teacherLocation, setTeacherLocation] = useState("");
  const [teacherBillingCountry, setTeacherBillingCountry] = useState("");
  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("pr_access_token") || ""}` });
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [teacherTitle, setTeacherTitle] = useState("Teacher");
  const [teacherBio, setTeacherBio] = useState("");
  const [teacherIsActive, setTeacherIsActive] = useState(true);

  // Batches state
  const [batches, setBatches] = useState<ClassBatch[]>(DEFAULT_BATCHES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New batch form state
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchType, setNewBatchType] = useState("Performing Arts");
  const [newBatchInstructor, setNewBatchInstructor] = useState("Lead Instructor (Teacher)");
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
  const studentSortOrder = "asc";
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentAdmissionEmail, setStudentAdmissionEmail] = useState("");
  const [studentAdmissionClassId, setStudentAdmissionClassId] = useState("");
  const [studentAdmissionClasses, setStudentAdmissionClasses] = useState<any[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Super Admin Platform States (with Live API)

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
  const [rosterFilter, setRosterFilter] = useState<"ALL" | "ATTENDED" | "ABSENT" | "EXCUSED" | "SCHEDULED">("ALL");
  const [markingEnrollmentId, setMarkingEnrollmentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => studioToday());
  const [attendanceTimezone, setAttendanceTimezone] = useState("Asia/Kolkata");
  useEffect(() => {
    const org = currentUser?.organization_id;
    if (!org) return;
    const controller = new AbortController();
    void staffApi(`/auth/context?studio_id=${org}`, { signal: controller.signal }).then(context => {
      if (context.timezone) setAttendanceTimezone(context.timezone);
    }).catch(() => {});
    return () => controller.abort();
  }, [currentUser?.organization_id]);
  useEffect(() => {
    const today = studioToday(attendanceTimezone);
    setSelectedDate(today); setAttendanceMonth(today.slice(0, 7));
  }, [attendanceTimezone]);

  const openAttendanceFor = async (type: "teacher" | "student", person?: StudioTeacher | Student) => {
    if (zoomNavigationGuard.current && !await zoomNavigationGuard.current()) return;
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

  useEffect(() => {
    const occurrence = liveAttendanceClasses.find(item => item.id === selectedLiveClassId);
    const start = Date.parse(occurrence?.start_at || "");
    if (!Number.isFinite(start)) return;
    const markStarted = () => {
      if (start > Date.now()) return;
      setLiveRoster(items => items.map(item => item.attendance_status === "SCHEDULED"
        ? { ...item, attendance_status: "ATTENDED" } : item));
    };
    if (start <= Date.now()) { markStarted(); return; }
    const timer = setTimeout(markStarted, Math.min(start - Date.now() + 10, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [liveAttendanceClasses, selectedLiveClassId]);

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
        ? { ...item, status: status === "ATTENDED" ? "PRESENT" : status === "EXCUSED" ? "EXCUSED" : "ABSENT" } : item));
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
      showToast("Teacher profile updated successfully!");
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
          username: teacherUsername.trim() || undefined,
          password: teacherPassword || undefined,
          address: teacherAddress.trim() || undefined,
          location: teacherLocation.trim() || undefined,
          billing_country: teacherBillingCountry || undefined,
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
      showToast("Teacher created. Open Edit to send the email invitation.");
      setTeacherPassword(""); setTeacherUsername(""); setTeacherPasswordChanged(false); setTeacherPasswordVisible(false);
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
    setTeacherPasswordVisible(false); setTeacherPasswordChanged(false);
    setEditingTeacher(teacher);
    setTeacherUsername(teacher.username || ""); setTeacherPassword(""); setTeacherAddress(teacher.address || ""); setTeacherLocation(teacher.location || ""); setTeacherBillingCountry(teacher.billing_country || "");
    setTeacherName(teacher.name);
    setTeacherEmail(teacher.email);
    setTeacherPhone(teacher.phone || "");
    setTeacherTitle(teacher.title);
    setTeacherBio(teacher.bio || "");
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
      if (editingTeacher.is_active && !teacherIsActive) {
        const impact = await teacherZoomImpact(editingTeacher.id, editingTeacher.studio_id);
        if (!await confirmAction({ title: "Deactivate teacher and Zoom binding?", description: `${impact.future_class_count} future Zoom classes may be affected. ${impact.message} Assigned classes will be deactivated.`, confirmLabel: "Deactivate", destructive: true })) return;
      }
      const studioPassword = await askStudioPassword();
      if (!studioPassword) return;
      const res = await fetch(`${API_BASE_URL}/teachers/${editingTeacher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          studio_password: studioPassword,
          email: teacherEmail,
          username: teacherUsername,
          ...(teacherPasswordChanged && teacherPassword ? { password: teacherPassword } : {}),
          address: teacherAddress,
          location: teacherLocation,
          billing_country: teacherBillingCountry || undefined,
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
      const savedTeacher = await res.json();
      showToast(savedTeacher.invitation_message || "Teacher profile updated successfully!");
      setIsEditTeacherOpen(false);
      setEditingTeacher(null);
      fetchStudioTeachers();
    } catch (err) {
      showToast("⚠️ Error connecting to server to update teacher");
    } finally { setIsSavingTeacher(false); }
  };

  const teacherZoomImpact = async (memberId: string, orgId?: string) => {
    const response = await fetch(`${API_BASE_URL}/organizations/${orgId || currentUser?.organization_id}/teachers/${memberId}/zoom/impact`, { headers: authHeaders() });
    if (!response.ok) throw new Error("Unable to preview Zoom class impact. Reload before changing teacher access.");
    return await response.json();
  };

  // Remove a teacher from the studio
  const handleDeleteTeacher = async (teacherId: string, name: string) => {
    let impact;
    try { impact = await teacherZoomImpact(teacherId); } catch (e) { notify((e as Error).message, "error"); return; }
    if (!await confirmAction({ title: "Remove teacher?", description: `${name}'s studio access, assigned classes and Zoom binding will be deactivated. ${impact.future_class_count} future classes may be affected. ${impact.message}`, confirmLabel: "Remove teacher and Zoom binding", destructive: true })) return;
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
    let impact;
    if (teacher.is_active) { try { impact = await teacherZoomImpact(teacher.id, teacher.studio_id); } catch (e) { notify((e as Error).message, "error"); return; } }
    const description = teacher.is_active
      ? `${teacher.name}'s access, assigned classes and Zoom binding will be deactivated. ${impact?.future_class_count || 0} future Zoom classes may be affected. ${impact?.message || ""} Attendance history is retained.`
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

  const [exportingRoster, setExportingRoster] = useState(false);
  const exportStudentRoster = async () => {
    if (exportingRoster) return;
    setExportingRoster(true);
    try {
      const params = new URLSearchParams({ page: "1", page_size: "100", sort_by: studentSortBy, sort_order: studentSortOrder });
      if (currentUser?.organization_id) params.set("studio_id", currentUser.organization_id);
      if (studentSearch) params.set("search", studentSearch);
      if (studentStatusFilter !== "ALL") params.set("status", studentStatusFilter);
      const rows: Student[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        params.set("page", String(page));
        const response = await fetch(`${API_BASE_URL}/students?${params}`, { headers: authHeaders() });
        if (!response.ok) throw new Error("Could not export roster. Please retry.");
        const data = await response.json();
        rows.push(...data.items); totalPages = data.total_pages; page += 1;
      } while (page <= totalPages);
      if (!rows.length) { showToast("No students match the current filters."); return; }
      const csv = rosterCsv([
        ["Name", "Email", "Phone", "Verification", "Class pass", "Classes attended", "Total classes", "Status"],
        ...rows.map(student => [student.name, student.email, student.phone, student.is_verified || student.verification_status === "VERIFIED" ? "Verified" : "Not verified", student.plan, student.attended, student.total, student.status]),
      ]);
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url; link.download = `student-roster-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`Exported ${rows.length} students to CSV`);
    } catch (error) { showToast(error instanceof Error ? error.message : "Could not export roster"); }
    finally { setExportingRoster(false); }
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
        if (data.support_email) setSetupSupportEmail(data.support_email);
        if (data.studio_tagline) setSetupStudioTagline(data.studio_tagline);
        if (data.disciplines) {
          setSetupDisciplines(data.disciplines.split(",").map((s: string) => s.trim()));
        }
        if (data.teaching_mode) setSetupTeachingMode(!data.account_completed && data.completion_step < 3 && !data.address_line1 ? "ONLINE" : data.teaching_mode);
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

        if (data.zoom_auto_meeting_enabled !== undefined) setZoomAutoMeetingEnabled(data.zoom_auto_meeting_enabled);

        // Store profile snapshot in localStorage for instantaneous rendering
        try {
          localStorage.setItem("pr_studio_profile", JSON.stringify(data));
        } catch (err) {}

        if (!data.account_completed && currentUser?.role !== "SUPER_ADMIN" && !new URLSearchParams(window.location.search).has("tab")) {
          setActiveTab("account-completion");
        }
      }
    } catch (e) {
      console.warn("Could not fetch studio profile from API", e);
    }
  };

  // One-click prefill sample details for testing
  const handleFillSampleDetails = () => {
    setSetupStudioName(currentUser?.organization_name || "Learning Studio");
    setSetupPhone("+91 98765 43210");
    setSetupWhatsappNumber("+91 98765 43210");
    setSetupSupportEmail(currentUser?.email || "support@example.com");
    setSetupStudioTagline("Classes, workshops and personal instruction");
    setSetupDisciplines(["Music", "Performing Arts", "Dance", "Language Learning"]);
    setSetupTeachingMode("ONLINE");
    setSetupAddressLine1("Level 3, Central Learning Centre, 108 North Main Road");
    setSetupAddressLine2("Opposite Central Park, Koregaon Park");
    setSetupCity("Pune");
    setSetupState("Maharashtra");
    setSetupPincode("411001");
    setSetupCountry("India");
    setSetupHasGst(true);
    setSetupGstNumber("27AABCU9603R1ZM");
    setSetupLegalBusinessName("Creative Learning Private Limited");
    setSetupPanNumber("AABCU9603R");
    setSetupBankName("HDFC Bank");
    setSetupAccountHolderName("Creative Learning Pvt Ltd");
    setSetupAccountNumber("50100234567890");
    setSetupConfirmAccountNumber("50100234567890");
    setSetupIfscCode("HDFC0001234");
    setSetupUpiId("learningstudio@okhdfcbank");

    showToast("🌿 Pre-filled verified studio sample details!");
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
        await res.json();
        if (nextStep) setCompletionStep(nextStep);
        showToast("🌿 Studio setup progress saved!");
        fetchStudioProfile(orgId);
      } else {
        const error = await res.json();
        notify(error.detail || "Unable to save setup progress. Please retry.", "error");
      }
    } catch (e) {
      notify("Unable to save setup progress. Check your connection and retry.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Complete Account Setup & Launch Studio
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





        account_completed: true,
        completion_step: 6,
        completion_percentage: 100
      };

      const launchResponse = await fetch(`${API_BASE_URL}/organizations/${orgId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!launchResponse.ok) { const error = await launchResponse.json(); throw new Error(error.detail || "Unable to complete setup"); }
      setIsAccountCompleted(true);
      setCompletionStep(6);
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
      notify(e instanceof Error ? e.message : "Studio setup could not be saved. Please try again.", "error");
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
        if (parsed.full_name) setTeacherProfileName(parsed.full_name);
        if (parsed.phone) setTeacherProfilePhone(parsed.phone);
        if (parsed.address) setTeacherProfileAddress(parsed.address);
        if (parsed.location) setTeacherProfileLocation(parsed.location);

        const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const requestedTab = urlParams?.get("tab") as AdminTab | null;
        const validTabs: AdminTab[] = [
          "account-completion", "studio-teachers", "students", "classes-plans",
          "subscriptions-manager", "attendance-tracker", "my-website", "queries-manager",
          "analytics", "billing-dashboard", "billing-saas", "billing-progressrooms", "billing-downloads", "settings",
          "zoom-settings", "zoom-host-key",
          "superadmin-instructors", "superadmin-teachers", "superadmin-students", "superadmin-health", "superadmin-billing", "superadmin-analytics", "superadmin-settings"
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
        setZoomConnected(Boolean(prof.zoom_connected));
      }

      const storedBatches = localStorage.getItem("pr_studio_batches");
      if (storedBatches) {
        setBatches(JSON.parse(storedBatches));
      }


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

  // Load management tables only while their tab is visible.
  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab, currentPage, pageSize, studentSearch, studentStatusFilter, studentSortBy, studentSortOrder, currentUser?.organization_id]);

  // Analytics has its own aggregate request in the deferred panel.
  useEffect(() => {
    if (activeTab === "queries-manager") {
      fetchQueries();
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
    if (zoomNavigationGuard.current && !await zoomNavigationGuard.current()) return;
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
        zoomConnected && zoomAutoMeetingEnabled ? "Zoom meetings will be provisioned when the class is opened, using its resolved host." : "30-day timetable generated."
      }`
    );
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
        method: "POST", body: JSON.stringify({ enrollment_id: event.enrollmentId, status: event.status === "PRESENT" ? "ATTENDED" : event.status === "EXCUSED" ? "EXCUSED" : "ABSENT", notes: event.remarks }),
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
    manageTeachers: isStudioOwner && !studioRestricted,
    myWebsite: isStudioOwner && !studioRestricted,
    accountDetails: isStudioOwner,
    membershipsManager: isStudioOwner && !studioRestricted,
    studioAnalytics: isStudioOwner && !studioRestricted,
    createClasses: isStudioOwner && !studioRestricted,
    studioProfileSettings: isStudioOwner,
    billingDetails: isStudioOwner,
    zoomSettings: isStudioOwner && !studioRestricted,

    // Integrated features shared by both studio and teacher:
    viewClasses: !studioRestricted,
    manageStudents: !studioRestricted,
    attendanceTracker: !studioRestricted,
    queriesManager: !studioRestricted,
    settings: true,
    dashboardTheme: true,
    teacherProfileSettings: isTeacher,
  }), [isStudioOwner, isTeacher, studioRestricted]);

  useEffect(() => {
    if (studioRestricted && !["settings", "account-completion", "billing-saas", "billing-progressrooms"].includes(activeTab)) {
      setActiveTab(isTeacher ? "settings" : "billing-saas");
    }
  }, [studioRestricted, activeTab, isTeacher]);

  // Tab protection guard: ensure teachers don't stay on studio-only tabs
  useEffect(() => {
    if (isTeacher) {
      const studioOnlyTabs: AdminTab[] = [
        "studio-teachers",
        "account-completion",
        "subscriptions-manager",
        "analytics",
        "billing-dashboard",
        "billing-saas",
        "billing-progressrooms",
        "billing-downloads",
        "my-website",
        "zoom-settings",
        "zoom-host-key",
        "superadmin-instructors", "superadmin-teachers", "superadmin-students", "superadmin-health",
        "superadmin-billing",
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
    ? "Progress Rooms HQ"
    : (currentUser?.organization_name || "Learning Studio");
  const roleSubtitle = isSuperAdmin
    ? "Platform Super Admin"
    : (isTeacher ? "Teacher Portal • Studio" : "Studio Operations");
  const userDisplayName = currentUser?.full_name || (isSuperAdmin ? "Platform Super Admin" : (isTeacher ? "Teacher" : "Studio Owner"));
  const userDisplayEmail = currentUser?.email || (isSuperAdmin ? "admin@progressrooms.com" : (isTeacher ? "teacher@example.com" : "owner@example.com"));
  const userInitials = isSuperAdmin ? "SA" : (isTeacher ? "TC" : "SO");


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
                  onChange={async (e) => {
                    const targetId = e.target.value;
                    if (zoomNavigationGuard.current && !await zoomNavigationGuard.current()) return;
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

                <button onClick={() => navigateToTab("superadmin-teachers")} className={`nav-item ${activeTab === "superadmin-teachers" ? "active" : ""}`}>Manage Teachers</button>
                <button onClick={() => navigateToTab("superadmin-students")} className={`nav-item ${activeTab === "superadmin-students" ? "active" : ""}`}>Manage Students</button>
                <button onClick={() => navigateToTab("superadmin-health")} className={`nav-item ${activeTab === "superadmin-health" ? "active" : ""}`}>Server Health</button>

                <button onClick={() => navigateToTab("superadmin-billing")} className={`nav-item ${activeTab === "superadmin-billing" ? "active" : ""}`}>
                  <span>Studio Billing & Activity</span>
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

                {isStudioOwner && <button onClick={() => navigateToTab("billing-saas")} className={`nav-item ${activeTab === "billing-saas" ? "active" : ""}`}><span>Progress Rooms Billing</span></button>}

                {features.billingDetails && (
                  <>
                    <button
                      onClick={() => navigateToTab("billing-progressrooms")}
                      className={`nav-item ${(activeTab.startsWith("billing-") && activeTab !== "billing-saas") || activeTab === "analytics" ? "active" : ""}`}
                    >
                      <span>Student Billing &amp; Usage</span>
                    </button>
                    {((activeTab.startsWith("billing-") && activeTab !== "billing-saas") || activeTab === "analytics") && (
                      <div className="settings-submenu" aria-label="Billing sections">
                        <button type="button" className={activeTab === "billing-progressrooms" ? "active" : ""} onClick={() => navigateToTab("billing-progressrooms")}>Active-student usage</button>
                        <button type="button" className={activeTab === "billing-dashboard" ? "active" : ""} onClick={() => navigateToTab("billing-dashboard")}>Billing Dashboard</button>
                        {features.studioAnalytics && <button type="button" className={activeTab === "analytics" ? "active" : ""} onClick={() => navigateToTab("analytics")}>Studio Analytics</button>}
                        <button type="button" className={activeTab === "billing-downloads" ? "active" : ""} onClick={() => navigateToTab("billing-downloads")}>Download Bills</button>
                      </div>
                    )}
                  </>
                )}

                {features.settings && (
                  <button
                    onClick={() => navigateToTab("settings")}
                    className={`nav-item ${activeTab === "settings" || activeTab.startsWith("zoom-") ? "active" : ""}`}
                  >
                    <span>Settings</span>
                  </button>
                )}
                {features.settings && (activeTab === "settings" || activeTab.startsWith("zoom-")) && (
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
                      className={activeTab === "settings" && settingsSection === "profile" ? "active" : ""}
                      onClick={() => { setSettingsSection("profile"); navigateToTab("settings"); }}
                    >
                      Profile Settings
                    </button>
                    <button
                      type="button"
                      className={activeTab === "settings" && settingsSection === "dashboard" ? "active" : ""}
                      onClick={() => { setSettingsSection("dashboard"); navigateToTab("settings"); }}
                    >
                      Dashboard Settings
                    </button>
                    {features.zoomSettings && (
                      <button type="button" className={activeTab.startsWith("zoom-") ? "active" : ""} onClick={() => navigateToTab("zoom-settings")}>
                        Zoom Settings
                      </button>
                    )}
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
              {!isSuperAdmin && studioPlanLabel && <button type="button" onClick={() => navigateToTab(isStudioOwner ? "billing-saas" : "settings")} title={studioPlanLabel} className="mt-1 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-1 text-[10px] font-semibold text-emerald-100">{studioPlanLabel}</button>}
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

      {/* Main Studio Dashboard Viewport */}
      <main id="main-content" className="dashboard-content min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 xl:p-8">
        {!isSuperAdmin && studioPlanLabel && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#CEDECF] bg-[#F4F7F4] px-5 py-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#275539]">Current plan</p><p className="mt-1 text-sm font-bold text-[#133623]">{studioPlanLabel}</p></div>{isStudioOwner && <button type="button" onClick={() => navigateToTab("billing-saas")} className="rounded-xl border border-[#275539] bg-white px-4 py-2 text-sm font-semibold text-[#133623]">View plans & billing</button>}</div>}
        {!isSuperAdmin && currentUser?.organization_id && <StudioAccessNotice orgId={currentUser.organization_id} isOwner={isStudioOwner} onBilling={() => navigateToTab("billing-saas")} onRestricted={setStudioRestricted} onPlanLabel={setStudioPlanLabel} />}
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
        {isSuperAdmin && (activeTab === "superadmin-instructors" || activeTab === "superadmin-billing") && (
          <AdminStudios key={activeTab} mode={activeTab === "superadmin-billing" ? "billing" : "directory"} onViewMore={(id) => {
            navigateToTab("superadmin-billing");
            const url = new URL(window.location.href);
            url.searchParams.set("studio", id);
            window.history.replaceState({}, "", url.toString());
          }} />
        )}

        {/* SUPER ADMIN TAB 2: PLATFORM OVERVIEW & METRICS */}
        {isSuperAdmin && (activeTab === "superadmin-analytics" || activeTab === "superadmin-health") && <AdminHealth />}
        {isSuperAdmin && (activeTab === "superadmin-teachers" || activeTab === "superadmin-students") && <AdminPeople key={activeTab} role={activeTab === "superadmin-teachers" ? "TEACHER" : "STUDENT"} />}

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
              </div>
            </div>
            <div className="max-w-2xl">
              <CommunicationChannelsPanel isEmbedded={true} />
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
                      100% Completed • Studio Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#40514E] mt-1">
                  Complete your contact details, bank payouts, and initial Zoom authentication to launch. Location and tax details are optional and can be added later.
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
                      {["Studio Contact & Phone", "Location & Mode (optional)", "GST & Tax Identity (optional)", "Bank Payout Accounts", "Zoom Video Classroom", "Review & Studio Launch"][completionStep - 1]}
                    </h2>
                  </div>
                  <span className={`stepper-chip shrink-0 ${checkStepCompleted(completionStep) ? "complete" : "active"}`}>
                    {[2, 3].includes(completionStep) ? "Optional" : checkStepCompleted(completionStep) ? "Completed" : "In Progress"}
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
                  { step: 2, label: "02 Location (optional)" },
                  { step: 3, label: "03 GST (optional)" },
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
                  {/* Top Brand / Studio Mark */}
                  <div className="flex items-center justify-between pb-5 border-b border-[#E1E9E2]">
                    <div>
                      <h2 className="font-serif font-bold text-base text-[#0C2417]">Studio Setup</h2>
                      <p className="text-[11px] text-slate-500 font-medium">Studio Onboarding</p>
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
                      { step: 2, label: "Location & Mode (optional)" },
                      { step: 3, label: "GST & Legal (optional)" },
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
                        showToast("🌿 Support: concierge@progressrooms.com • +91 800-SUPPORT");
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
                          Provide your studio name, primary phone{whatsappCompletelyDisabled ? "" : ", WhatsApp number"}, and teaching disciplines.
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
                      Studio Name *
                    </label>
                    <input id="dashboard-page-field-1"
                      type="text"
                      required
                      placeholder="e.g. Sahil Teaching Studio"
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

                <div className={`grid grid-cols-1 ${whatsappCompletelyDisabled ? "" : "sm:grid-cols-2"} gap-4`}>
                  <div className={`relative ${whatsappCompletelyDisabled ? "hidden" : ""}`}>
                    <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      WhatsApp Contact Number
                    </label>
                    <WhatsAppNotificationHint kind="contact" />
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
                    <p className="text-[10px] text-slate-500 mt-1">Your studio recipient number for Progress Rooms notices. Messages to students use each student’s own number.</p>
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
                        placeholder="support@example.com"
                        value={setupSupportEmail}
                        onChange={(e) => setSetupSupportEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                    Studio Tagline / Introduction (optional)
                  </label>
                  <textarea rows={4} maxLength={5000}
                    placeholder="e.g. Music, dance, art and academic tutoring"
                    value={setupStudioTagline}
                    onChange={(e) => setSetupStudioTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] focus:outline-none focus:ring-2 focus:ring-[#133623]"
                  />
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
                            STEP 2 / 6 · OPTIONAL
                          </span>
                          <span className={`stepper-chip ${checkStepCompleted(2) ? "complete" : "active"}`}>
                            Optional
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
                    Studio Teaching Mode (optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {[
                      {
                        mode: "HYBRID",
                        title: "🌿 Hybrid Studio",
                        desc: "Both in-person and live online classes"
                      },
                      {
                        mode: "PHYSICAL",
                        title: "🏢 Physical Studio Only",
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

                <p className="text-xs text-slate-600">Optional: keep 100% Virtual Studio selected to skip location details. Choose Hybrid or Physical to enter a venue.</p>
                {/* Location Inputs */}
                <fieldset disabled={setupTeachingMode === "ONLINE"} className="space-y-4 disabled:opacity-50">
                  <div>
                    <label className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1.5">
                      Studio Street Address / Building (optional)
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Level 3, Central Learning Centre, 108 North Main Road"
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
                        City (optional)
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
                        State (optional)
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
                        PIN / Postal Code (optional)
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
                </fieldset>

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
                  <button type="button" onClick={() => setCompletionStep(3)} className="text-xs font-semibold text-[#2D7A58]">Skip this optional step</button>
                  <button
                    type="button"
                    onClick={() => handleSaveStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <span>Continue to optional tax details</span>
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
                        STEP 3 / 6 · OPTIONAL
                      </span>
                      <span className={`stepper-chip ${checkStepCompleted(3) ? "complete" : "active"}`}>
                        Optional
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#0C2417] leading-tight mt-0.5">
                      GST & Business Identity (optional)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Optional: add business or tax information if applicable. You can skip this step and update it later.
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
                          GSTIN (15 Digits) (optional)
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
                          Legal Entity Name (optional)
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
                  <button type="button" onClick={() => setCompletionStep(4)} className="text-xs font-semibold text-[#2D7A58]">Skip this optional step</button>
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
                      Provide your bank account details for monthly payouts of student fees.
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
                      UPI ID (optional)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. learningstudio@okhdfcbank"
                        value={setupUpiId}
                        onChange={(e) => setSetupUpiId(e.target.value.toLowerCase())}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9] font-mono focus:outline-none focus:ring-2 focus:ring-[#133623]"
                      />
                    </div>
                  </div>
                </div>

                <p className="rounded-xl bg-[#F4F7F4] p-4 text-sm text-[#133623]"><strong>Monthly settlements:</strong> Payouts are processed during the final two calendar days of each month.</p>

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

            {/* Initial required Zoom authentication. Advanced options remain in Settings. */}
            {completionStep === 5 && <div className="space-y-5 rounded-3xl border border-[#CEDECF] bg-white p-6 sm:p-8">
              <InitialZoomSetup org={currentUser?.organization_id || ""} onConnected={(connected, email) => { setZoomConnected(connected); setZoomAccountEmail(email); }} />
              <p className="text-sm text-slate-600">For advanced Zoom options and multiple Zoom accounts, open Settings, choose Zoom, and visit Zoom Settings.</p>
              <div className="flex justify-between gap-3"><button type="button" className="rounded-xl border px-4 py-3" onClick={() => setCompletionStep(4)}>Back</button><button type="button" className="rounded-xl bg-emerald-900 px-4 py-3 text-white" onClick={() => void handleSaveStep(6)}>Continue to review</button></div>
            </div>}

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
                      Review, Verification Checklist & Studio Launch
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Verify all configured steps. Once confirmed, your studio is marked 100% complete and saved to your Profiler.
                    </p>
                  </div>
                </div>

                {/* Card-level Linear Progress Bar */}
                <div className="card-linear-progress my-2">
                  <div className="card-linear-progress-fill" style={{ width: "100%" }} />
                </div>

                <div className="border-b border-[#E1E9E2] pb-2">
                  <p className="text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">Studio Configuration Summary</p>
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
                    <p className={whatsappCompletelyDisabled ? "hidden" : ""}><strong>WhatsApp:</strong> {setupWhatsappNumber || setupPhone || "Not Provided"}</p>
                    <p><strong>Email:</strong> {setupSupportEmail || "Not Provided"}</p>
                    <p className="whitespace-pre-line"><strong>Introduction:</strong> {setupStudioTagline || "Not provided (optional)"}</p>

                  </div>

                  {/* Card 2: Location & Mode */}
                  <div className="p-4 rounded-2xl bg-[#F9FAF9] border border-[#CEDECF] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-[#0C2417]">
                        Step 2: Location & Mode (optional)
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
                        Step 3: GST (optional) & Tax Identity
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
                    <p><strong>Settlement:</strong> Monthly · final two calendar days of each month</p>
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
                          {zoomConnected ? "Host configured (check Zoom Settings for live/simulation status)" : "Authentication required"}
                        </span>
                      </p>
                      <p><strong>Zoom Email:</strong> {zoomAccountEmail || "No authorized Zoom account"}</p>

                    </div>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="p-4 rounded-2xl bg-[#F4F7F4] border border-[#CEDECF] space-y-2.5">
                  <h4 className="text-xs font-bold text-[#0C2417] uppercase tracking-wider">Studio Verification Checklist</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={isStep1Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep1Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep1Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        {whatsappCompletelyDisabled ? "Studio Profile & Mobile" : "Studio Profile & WhatsApp Mobile"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isStep2Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep2Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep2Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        Location & Teaching Mode (optional)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={isStep3Complete ? "text-emerald-600 font-bold" : "text-amber-600"}>
                        {isStep3Complete ? "✓" : "○"}
                      </span>
                      <span className={isStep3Complete ? "text-[#0C2417] font-medium" : "text-slate-500"}>
                        GSTIN & Business Tax ID (optional)
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
                <div className="p-6 rounded-3xl border border-[#CEDECF] bg-[#E8F0E9] text-[#0C2417] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-lg">Ready to launch your Studio dashboard</h4>
                    <p className="text-xs text-slate-700 mt-1">
                      Your account will be verified and marked as 100% complete. The sidebar will update to show completion and your studio is fully operational.
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
              <p className="text-xs font-bold text-[#0C2417]">Contact Support</p>
            </div>
            <button
              type="button"
              onClick={() => {
                showToast("🌿 Support: concierge@progressrooms.com • +91 800-SUPPORT");
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
                  Empower your studio: add certified instructors, modify titles & contact info, or manage access.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setTeacherName("");
      setTeacherUsername(""); setTeacherPassword(""); setTeacherAddress(""); setTeacherLocation(""); setTeacherBillingCountry("");
                    setTeacherEmail("");
                    setTeacherPhone("");
                    setTeacherTitle("Instructor");
                    setTeacherBio("");
                    setTeacherPassword(""); setTeacherUsername(""); setTeacherAddress(""); setTeacherLocation(""); setTeacherBillingCountry("");
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
                <p className="text-[10px] text-slate-400 mt-0.5">Teaching live classes</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Total Studio Guides</span>
                <p className="text-2xl font-bold text-[#0C2417] mt-1">{teacherTotal}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Registered in your studio team</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#CEDECF] shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Studio</span>
                <p className="text-base font-bold text-[#0C2417] mt-1 truncate">
                  {studioTeachers[0]?.studio_name || currentUser?.studio_name || "Studio"}
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
                  <table className="roster-table w-full text-left text-xs">
                    <colgroup><col style={{ width: "19.25926%" }} /><col style={{ width: "16.29630%" }} /><col style={{ width: "12.59259%" }} /><col style={{ width: "10.37037%" }} /><col style={{ width: "19.25926%" }} /><col style={{ width: "10.37037%" }} /><col style={{ width: "11.85185%" }} /></colgroup>
                    <thead className="bg-[#F4F7F4] border-b border-[#E1E9E2] text-[#1b4332] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Teacher & Contact</th>
                        <th className="px-6 py-4">Title & Specialization</th>
                        <th className="px-6 py-4">Teacher Code</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Zoom</th>
                        <th className="px-6 py-4">Joined Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E9E2]">
                      {studioTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <span className="text-3xl">🧘</span>
                              <p className="font-semibold text-slate-600">No teachers found in studio roster</p>
                              <p className="text-xs text-slate-400">Add your first instructor to start assigning classes.</p>
                              <button
                                onClick={() => {
                                  setTeacherName("");
      setTeacherUsername(""); setTeacherPassword(""); setTeacherAddress(""); setTeacherLocation(""); setTeacherBillingCountry("");
                                  setTeacherEmail("");
                                  setTeacherPhone("");
                                  setTeacherTitle("Instructor");
                                  setTeacherBio("");
                                  setTeacherPassword(""); setTeacherUsername(""); setTeacherAddress(""); setTeacherLocation(""); setTeacherBillingCountry("");
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
                          <tr key={teacher.id} tabIndex={0} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); setViewingTeacher(teacher); } }} onClick={() => setViewingTeacher(teacher)} className="hover:bg-[#F9FAF9] transition cursor-pointer">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#CEDECF] text-[#133623] flex items-center justify-center font-bold text-xs uppercase">
                                  {teacher.name ? teacher.name.charAt(0) : "T"}
                                </div>
                                <div>
                                  <p className="font-bold text-[#0C2417] text-sm">{teacher.name}{teacher.is_owner && <span className="ml-2 text-[10px] font-semibold text-emerald-700">Owner · Teacher</span>}</p>
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
                              <button type="button" disabled={!teacher.teacher_code} className="record-capsule rounded-lg bg-[#E8F0E9] px-2.5 py-1 font-mono text-xs font-black tracking-[.16em] text-[#133623]" onClick={async event => {
                                event.stopPropagation(); try { await navigator.clipboard.writeText(teacher.teacher_code!); showToast("Teacher code copied to your clipboard"); } catch { showToast("Unable to copy teacher code"); }
                              }}>{teacher.teacher_code || "Pending"}</button>
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
                            <td className="px-6 py-4"><TeacherZoomControl org={teacher.studio_id} member={teacher.id} name={teacher.name} userId={teacher.user_id} currentUserId={currentUser?.id || currentUser?.user_id} owner initialState={teacher} onChanged={() => void fetchStudioTeachers()} /></td>
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
                                  disabled={teacher.is_owner}
                                  title={teacher.is_owner ? "Owner access is managed separately from teacher access" : undefined}
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
                                {!teacher.is_owner && (
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
                    : "Manage your active students, review OTP account verification, track attendance counts, and review membership status."}
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
                  onClick={() => void exportStudentRoster()}
                  disabled={exportingRoster}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                >
                  {exportingRoster ? "Exporting…" : "Export Roster (CSV)"}
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
                  <option value="ACTIVE">Active Students</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <select value={studentSortBy} onChange={(e) => { setStudentSortBy(e.target.value as typeof studentSortBy); setCurrentPage(1); }} className="px-3 py-2 text-xs rounded-xl border border-[#CEDECF] bg-white text-slate-700 font-medium"><option value="name">Sort by name</option><option value="status">Sort by status</option><option value="joined">Sort by joined date</option></select>
              </div>
            </div>

            {/* Students Table with Live API */}
            <div className="bg-white rounded-3xl border border-[#E1E9E2] shadow-sm overflow-hidden">
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable records table">
                {studentsLoading ? (
                  <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#133623]" />
                    <span>Loading students...</span>
                  </div>
                ) : (
                  <table className="roster-table w-full text-left text-xs">
                    <colgroup><col style={{ width: "20.74074%" }} /><col style={{ width: "12.59259%" }} /><col style={{ width: "17.77778%" }} /><col style={{ width: "13.33333%" }} /><col style={{ width: "13.33333%" }} /><col style={{ width: "22.22222%" }} /></colgroup>
                    <thead className="bg-[#F4F7F4] border-b border-[#E1E9E2] text-[#1b4332] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Student Name</th>
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
                            No students found matching your filter criteria.
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
                timezone={attendanceTimezone}
                onJoinClass={async event => (await staffApi(`/organizations/${currentUser?.organization_id}/occurrences/${event.occurrenceId}/join-link`, { method: "POST" })).meeting_url}
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
              const upcomingCount = liveRoster.filter(s => s.attendance_status === "SCHEDULED" || !s.attendance_status).length;
              const totalCount = liveRoster.length;
              const markedCount = totalCount - upcomingCount;
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
                      <ScheduleInput
                        id="live-attendance-date"
                        type="date"
                        value={liveAttendanceDate}
                        onValueChange={setLiveAttendanceDate}
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
                        disabled={isMarkingLiveAttendance || attendedCount === totalCount}
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
                              ["SCHEDULED", `Upcoming (${upcomingCount})`],
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
                                      : value === "SCHEDULED"
                                      ? "bg-[#2563eb] text-white shadow-xs"
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
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {status === "ATTENDED" ? "Present" : status === "ABSENT" ? "Absent" : status === "EXCUSED" ? "Excused" : "Upcoming"}
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
              <Modal footer={<div className="flex justify-end gap-2">
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
                    </div>}
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

                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* TAB 6: ANALYTICS & REVENUE */}
        {activeTab === "analytics" && currentUser?.organization_id && (
          <StudioAnalytics organizationId={currentUser.organization_id} onOpenBilling={() => navigateToTab("billing-dashboard")} />
        )}

        {activeTab === "billing-saas" && isStudioOwner && currentUser?.organization_id && <SaaSBilling key={currentUser.organization_id} orgId={currentUser.organization_id} />}

        {activeTab === "billing-progressrooms" && isStudioOwner && currentUser?.organization_id && (
          <ProgressRoomsBilling orgId={currentUser.organization_id} />
        )}

        {activeTab === "billing-dashboard" && currentUser?.organization_id && (
          <BillingCenter orgId={currentUser.organization_id} mode="dashboard" />
        )}

        {activeTab === "billing-downloads" && currentUser?.organization_id && (
          <BillingCenter orgId={currentUser.organization_id} mode="downloads" />
        )}

        {/* TAB: ZOOM SETTINGS & HOST KEY */}
        {(activeTab === "zoom-settings" || activeTab === "zoom-host-key") && (
          <ZoomSettings
            org={currentUser?.organization_id || ""}
            orgSlug={currentUser?.organization_slug || ""}
            orgName={currentUser?.organization_name || ""}
            currentUser={currentUser}
            studioProfile={studioProfile}
            initialTab={activeTab === "zoom-host-key" ? "host-key" : "settings"}
            onNavigationGuard={registerZoomNavigationGuard}
            onTabChange={(tab) => { void navigateToTab(tab === "host-key" ? "zoom-host-key" : "zoom-settings"); }}
            onProfileUpdated={fetchStudioProfile}
          />
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
                      Update your teacher details, contact information, and studio teaching location.
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
                          <span className="font-semibold text-[#0C2417]">{currentUser?.email || "teacher@example.com"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Studio</span>
                          <span className="font-semibold text-[#0C2417]">{currentUser?.organization_name || "Learning Studio"}</span>
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
                      Studio Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center">
                      Setup In Progress ({displayPercentage}%)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#40514E] mt-0.5">
                  Official studio profile, contact details, physical/online location, legal business & GST identity, fee payout accounts, and authenticated Zoom integration.
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
                  href={`/${studioProfile?.slug || currentUser?.organization_slug || "sahil-teaching-studio"}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#133623] hover:bg-[#0C2417] text-white shadow-sm transition"
                >
                  <span>Public Studio Page</span>
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
                    ? "Verified Studio Roster & Integrations Active"
                    : !zoomConnected
                    ? `Setup In Progress (${displayPercentage}% - Zoom Disconnected)`
                    : "Account Setup Incomplete - Finish All Steps"}
                </h4>
                <p className="text-slate-600 mt-0.5">
                  {isStep6Complete && zoomConnected
                    ? "Studio profile and live video integrations are active. Classes automatically provision authenticated Zoom meeting links with waiting room security."
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
                      {setupStudioName || studioProfile?.name || currentUser?.organization_name || "Sahil Teaching Studio"}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tagline / Mission</label>
                    <p className="whitespace-pre-line text-slate-700 font-medium">
                      {setupStudioTagline || studioProfile?.studio_tagline || "Classes, workshops and personal instruction"}
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

                    <div className={`relative p-2.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] ${whatsappCompletelyDisabled ? "hidden" : ""}`}>
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          WhatsApp Contact
                        </label>

                      </div>
                      <p className="font-bold text-[#0C2417] text-xs mt-1">
                        {setupWhatsappNumber || studioProfile?.whatsapp_number || setupPhone || "+91 98765 43210"}
                      </p>
                      <WhatsAppNotificationHint kind="contact" />
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-emerald-600" /> Support Email
                      </label>
                      <p className="font-bold text-[#0C2417] text-xs mt-1 truncate" title={setupSupportEmail || studioProfile?.support_email || currentUser?.email}>
                        {setupSupportEmail || studioProfile?.support_email || currentUser?.email || "support@example.com"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Disciplines Taught</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(setupDisciplines.length > 0
                        ? setupDisciplines
                        : (studioProfile?.disciplines ? studioProfile.disciplines.split(", ") : ["Music", "Performing Arts", "Dance"])
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
                          ? "Physical In-Studio"
                          : setupTeachingMode === "ONLINE"
                          ? "100% Live Interactive Online"
                          : "Hybrid Studio (Physical & Live Online)"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F9FAF9] border border-[#E1E9E2] space-y-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address Line 1 & 2</label>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {setupAddressLine1 || studioProfile?.address_line1 || "Level 3, Central Learning Centre, 108 North Main Road"}
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
                      {setupLegalBusinessName || studioProfile?.legal_business_name || "Creative Learning Private Limited"}
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
                      {setupAccountHolderName || studioProfile?.account_holder_name || "Creative Learning Pvt Ltd"}
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
                      {setupUpiId || studioProfile?.upi_id || "learningstudio@okhdfcbank"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200">
                    <span className="text-slate-600 font-medium">Settlement Schedule:</span>
                    <span className="font-bold text-[#133623] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      Monthly · final two calendar days of each month
                    </span>
                  </div>
                </div>
              </div>

              <section className="rounded-3xl border bg-white p-6 md:col-span-2"><h3 className="font-bold">Zoom classroom accounts</h3><p className="my-3 text-sm text-slate-600">Manage teacher authorization, shared defaults and the studio fallback host in Zoom Settings.</p><button type="button" className="rounded-xl border px-4 py-2" onClick={() => navigateToTab("zoom-settings")}>Open Zoom Settings</button></section>
            </div>
              </>
              )
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-[#0C2417]">Dashboard Settings</h1>
                  <p className="text-xs text-[#40514E] mt-1">Personalize your dashboard typography and color theme. Your font is saved to your account. Color themes are saved on this device.</p>
                </div>

                <section className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E1E9E2] shadow-sm space-y-4" aria-labelledby="dashboard-font-heading">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 id="dashboard-font-heading" className="font-bold text-base text-[#0C2417]">Typography</h2>
                      <p className="text-xs text-slate-500 mt-1">Applies to all headings, navigation, tables, forms and dialogs in your dashboard. Your font choice is saved to your account and restored whenever you sign in, on any device.</p>
                    </div>
                    <span className="text-sm font-semibold">{dashboardFonts.find((option) => option.id === dashboardFont)?.name}</span>
                  </div>
                  {fontError && <p role="alert" className="text-sm text-red-700">{fontError}</p>}
                  {fontSaving && <p role="status" className="text-sm text-[#2D7A58]">Saving font to your account…</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" role="group" aria-label="Dashboard font choices">
                    {dashboardFonts.map((option) => (
                      <button key={option.id} type="button" aria-pressed={dashboardFont === option.id}
                        disabled={fontLoading || fontSaving}
                        onClick={() => selectFont(option.id)}
                        style={{ fontFamily: option.family }}
                        className={`rounded-2xl border p-4 text-left transition ${dashboardFont === option.id ? "border-[#2D7A58] bg-[#E8F0E9] ring-1 ring-[#2D7A58]" : "border-[#CEDECF] hover:border-[#81A882]"}`}>
                        <span className="flex items-center justify-between gap-2"><strong>{option.name}</strong>{dashboardFont === option.id && <Check className="h-4 w-4" />}</span>
                        <span className="mt-1 block text-xs text-[#40514E]">{option.description}</span>
                        <span className="mt-4 block text-lg">Your studio, beautifully organized.</span>
                        <span className="mt-1 block text-xs">Classes · Students · Attendance · 0123456789</span>
                      </button>
                    ))}
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
        <Modal footer={<div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label="Close create batch" onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button form="modal-src-app--dashboard--dashboard-page-tsx-2"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <span>🌿 Create Batch & Generate Timetable</span>
                </button>
              </div>}
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

            <form id="modal-src-app--dashboard--dashboard-page-tsx-2" onSubmit={handleCreateBatch} className="space-y-4">
              <PurchasePolicyNotice />
              <div>
                <label htmlFor="dashboard-page-field-19" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Batch / Class Name *
                </label>
                <input id="dashboard-page-field-19"
                  type="text"
                  required
                  placeholder="e.g. Sunset Performing Arts, Aerial Silks Beginner"
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
                    <option value="Music">Music</option>
                    <option value="Dance">Dance</option>
                    <option value="Performing Arts">Performing Arts</option>
                    <option value="Languages">Languages & Language Learning</option>
                    <option value="Pilates">Fitness</option>
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
                  <ScheduleInput id="dashboard-page-field-22"
                    type="time"
                    required
                    value={newBatchStart}
                    onValueChange={setNewBatchStart}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-23" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <ScheduleInput id="dashboard-page-field-23"
                    type="time"
                    required
                    value={newBatchEnd}
                    onValueChange={setNewBatchEnd}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#F9FAF9]"
                  />
                </div>

                <div>
                  <label htmlFor="dashboard-page-field-24" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                    Maximum Students
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

<AdvancedOptions description="Custom meeting link and Zoom connection details">
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
                          When you save this batch, a Zoom meeting will be provisioned when the class is opened, using its resolved host and saved studio defaults. You can also specify an optional custom URL below.
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
                      <span>Zoom not connected yet. Choose a studio Zoom host in Zoom Settings before provisioning an online meeting.</span>
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


</AdvancedOptions>
              <p className="text-xs text-slate-500">Zoom authorization is optional. Save the teacher profile first, then manage their Zoom account from the roster.</p>

            </form>
          </div>
        </Modal>
      )}

      {isAddStudentOpen && (
        <Modal footer={<div className="flex justify-end gap-3 border-t border-[#E1E9E2] pt-4">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button form="modal-src-app--dashboard--dashboard-page-tsx-3"
                type="submit"
                disabled={isAddingStudent || !studentAdmissionClasses.length}
                className="rounded-xl bg-[#133623] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0C2417] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingStudent ? "Adding…" : "Add Student"}
              </button>
            </div>}
          title="Add a registered student"
          subtitle="Students must register, verify their account, and provide a phone number before you can admit them to a class."
          onClose={() => setIsAddStudentOpen(false)}
          confirmDiscard
        >
          <form id="modal-src-app--dashboard--dashboard-page-tsx-3" onSubmit={handleAddStudent} className="p-6 space-y-4">
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

          </form>
        </Modal>
      )}

      {/* ADD TEACHER MODAL */}
      {isAddTeacherOpen && (
        <Modal footer={<div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  aria-label="Close add teacher" onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button form="modal-src-app--dashboard--dashboard-page-tsx-4"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center justify-center"
                  disabled={isSavingTeacher}
                >
                  <span>{isSavingTeacher ? "Sending…" : "Send Invitation"}</span>
                </button>
              </div>}
          title="Create Teacher in Studio"
          subtitle="Create an instructor directly in your Studio. A unique 8-digit teacher code will be automatically assigned."
          onClose={() => setIsAddTeacherOpen(false)}
          confirmDiscard
        >
          <div className="p-6 space-y-4">
            <form id="modal-src-app--dashboard--dashboard-page-tsx-4" onSubmit={handleCreateTeacher} className="space-y-4">
              <label className="block text-xs font-bold">Username<input value={teacherUsername} minLength={3} onChange={e => setTeacherUsername(e.target.value)} className="block border rounded-xl p-2 w-full" placeholder="Generated if blank" /></label>
              <label className="block text-xs font-bold">Password<input type="password" autoComplete="new-password" minLength={8} value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)} className="block border rounded-xl p-2 w-full" placeholder="Secure password generated if blank" /></label>
              <label className="block text-xs font-bold">Address<input value={teacherAddress} onChange={e => setTeacherAddress(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
              <label className="block text-xs font-bold">Location<input value={teacherLocation} onChange={e => setTeacherLocation(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
              <label className="block text-xs font-bold">Country of teaching operations<select value={teacherBillingCountry} onChange={e => setTeacherBillingCountry(e.target.value)} className="mt-1 block w-full rounded-xl border bg-white p-2"><option value="">Not confirmed · Support review</option><option value="IN">India</option><option value="ZZ">Outside India · Contact support</option>{teacherBillingCountry && !["IN", "ZZ"].includes(teacherBillingCountry) && <option value={teacherBillingCountry}>{teacherBillingCountry}</option>}</select></label>

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


              </div>

              <div>
                <label htmlFor="dashboard-page-field-29" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Title & Specialization *
                </label>
                <input id="dashboard-page-field-29"
                  type="text"
                  required
                  placeholder="e.g. Senior music teacher or academic tutor"
                  value={teacherTitle}
                  onChange={(e) => setTeacherTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
                />
              </div>



<AdvancedOptions description="Optional phone number and teacher biography">                <div>
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
                </div>              <div>
                <label htmlFor="dashboard-page-field-30" className="block text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
                  Bio / Teacher Notes
                </label>
                <textarea id="dashboard-page-field-30"
                  rows={3}
                  placeholder="Qualifications, teaching experience, and specializations..."
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 bg-[#F9FAF9]"
                />
              </div></AdvancedOptions>
              <p className="text-xs text-slate-500">Zoom authorization is optional. Save the teacher profile first, then manage their Zoom account from the roster.</p>

            </form>
          </div>
        </Modal>
      )}

      {viewingTeacher && (
        <Modal footer={<div className="flex justify-end gap-2 border-t border-[#E1E9E2] pt-4">
              <button onClick={() => { const teacher = viewingTeacher; setViewingTeacher(null); handleOpenEditTeacher(teacher); }} className="rounded-xl border border-[#CEDECF] px-4 py-2.5 text-xs font-bold">Edit profile</button>
              <button onClick={() => { const teacher = viewingTeacher; setViewingTeacher(null); openAttendanceFor("teacher", teacher); }} className="rounded-xl bg-[#133623] px-4 py-2.5 text-xs font-bold text-white">View attendance</button>
            </div>}
          title="Teacher Profile"
          subtitle={viewingTeacher.name}
          onClose={() => setViewingTeacher(null)}
        >
          <div className="p-6 space-y-4">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              {Object.entries({ Name: viewingTeacher.name, Username: viewingTeacher.username, "Title / specialization": viewingTeacher.title, "Teacher code": viewingTeacher.teacher_code, Address: viewingTeacher.address, Location: viewingTeacher.location, Studio: viewingTeacher.studio_name, Role: viewingTeacher.is_owner ? "Owner / Teacher" : viewingTeacher.can_teach ? "Teacher" : viewingTeacher.role, "Zoom authorization": zoomLabel(viewingTeacher), "Authorized Zoom email": viewingTeacher.zoom_verified_email, "Effective Zoom host": viewingTeacher.effective_zoom_host?.email, "Default host": viewingTeacher.is_default_zoom_host ? "Yes" : "No", "Next Zoom action": viewingTeacher.zoom_ready ? "Account holder starts the meeting" : "Connect Zoom or configure studio fallback" }).map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="break-words font-semibold text-[#0C2417]">{value || "Not provided"}</dd></div>)}

              <div><dt className="text-xs text-slate-500">Email</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.email}</dd></div>
              <div className="relative"><dt className="text-xs text-slate-500">Phone</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.phone || "Not provided"}</dd><WhatsAppNotificationHint kind="contact" /></div>
              <div><dt className="text-xs text-slate-500">Status</dt><dd className="font-semibold text-[#0C2417]">{viewingTeacher.status}</dd></div>
              <div><dt className="text-xs text-slate-500">Joined</dt><dd className="font-semibold text-[#0C2417]">{formatStudioDate(viewingTeacher.joined_at)}</dd></div>
            </dl>
            <p className="rounded-xl bg-[#F4F7F4] p-4 text-sm leading-6 text-slate-600">{viewingTeacher.bio || "No teacher bio has been added."}</p>
            <TeacherZoomControl org={viewingTeacher.studio_id} member={viewingTeacher.id} name={viewingTeacher.name} userId={viewingTeacher.user_id} currentUserId={currentUser?.id || currentUser?.user_id} owner initialState={viewingTeacher} onChanged={() => { void fetchStudioTeachers(); setViewingTeacher(null); }} />

          </div>
        </Modal>
      )}

      {viewingStudent && <StudentDetails student={viewingStudent} onClose={() => setViewingStudent(null)} onSaved={() => { void fetchStudents(); }} />}

      {studioPasswordPrompt && <Modal title="Confirm Studio password" subtitle="Enter the password used to sign in to this Studio account" onClose={() => finishStudioPassword(null)}>
        <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); finishStudioPassword(studioPasswordInput); }}>
          <input aria-label="Studio password" type="password" autoComplete="current-password" autoFocus required value={studioPasswordInput} onChange={e => setStudioPasswordInput(e.target.value)} className="border rounded-xl p-3 w-full" />
          <button type="submit" className="rounded-xl bg-emerald-900 text-white px-4 py-2">Confirm</button>
        </form>
      </Modal>}
      {/* EDIT TEACHER MODAL */}
      {isEditTeacherOpen && editingTeacher && (
        <Modal footer={<div className="pt-4 border-t border-[#E1E9E2] flex items-center justify-end gap-3">
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
                <button form="modal-src-app--dashboard--dashboard-page-tsx-6"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition flex items-center justify-center"
                  disabled={isSavingTeacher}
                >
                  <span>{isSavingTeacher ? "Saving…" : "Save Changes"}</span>
                </button>
              </div>}
          title="Edit Teacher Profile"
          subtitle="Modify details or update active teaching status."
          onClose={() => { setIsEditTeacherOpen(false); setEditingTeacher(null); }}
          confirmDiscard
        >
          <div className="p-6 space-y-4">
            <TeacherZoomControl org={editingTeacher.studio_id} member={editingTeacher.id} name={editingTeacher.name} userId={editingTeacher.user_id} currentUserId={currentUser?.id || currentUser?.user_id} owner initialState={editingTeacher} onChanged={() => void fetchStudioTeachers()} />
            <form id="modal-src-app--dashboard--dashboard-page-tsx-6" onSubmit={handleUpdateTeacher} className="space-y-4">
              <div className="grid gap-3">
                <label className="text-xs font-bold">Username<input required minLength={3} pattern="[a-zA-Z0-9_.-]+" value={teacherUsername} onChange={e => setTeacherUsername(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>

                <label className="text-xs font-bold">Address<input value={teacherAddress} onChange={e => setTeacherAddress(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>
                <label className="text-xs font-bold">Location<input value={teacherLocation} onChange={e => setTeacherLocation(e.target.value)} className="block border rounded-xl p-2 w-full text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400" /></label>
              <label className="block text-xs font-bold">Country of teaching operations<select value={teacherBillingCountry} onChange={e => setTeacherBillingCountry(e.target.value)} className="mt-1 block w-full rounded-xl border bg-white p-2"><option value="">Not confirmed · Support review</option><option value="IN">India</option><option value="ZZ">Outside India · Contact support</option>{teacherBillingCountry && !["IN", "ZZ"].includes(teacherBillingCountry) && <option value={teacherBillingCountry}>{teacherBillingCountry}</option>}</select></label>
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
                    required
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs sm:text-sm"
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
                  Bio / Teacher Notes
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
                      disabled={editingTeacher.is_owner}
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
                      disabled={editingTeacher.is_owner}
                      checked={!teacherIsActive}
                      onChange={() => setTeacherIsActive(false)}
                      className="text-[#133623] focus:ring-[#133623]"
                    />
                    <span className="text-red-700 font-bold">SUSPENDED</span>
                  </label>
                </div>
              </div>

<div className="space-y-2">
                <label className="block text-xs font-bold">Teacher password<input type={teacherPasswordVisible ? "text" : "password"} autoComplete="new-password" readOnly={!teacherPasswordChanged} required={teacherPasswordChanged} minLength={8} value={teacherPassword} placeholder="••••••••" onChange={e => setTeacherPassword(e.target.value)} className="block border rounded-xl p-2 w-full" /></label>
                <button type="button" aria-label={teacherPasswordVisible ? "Hide password" : "Show password"} onClick={() => { if (teacherPasswordVisible) { setTeacherPasswordVisible(false); if (!teacherPasswordChanged) setTeacherPassword(""); } else { void manageTeacherPassword(false); } }} className="rounded-xl border p-2">{teacherPasswordVisible ? <span className="inline-flex gap-2"><EyeOff size={16} /> Hide password</span> : <span className="inline-flex gap-2"><Eye size={16} /> Show password</span>}</button>
                <button type="button" onClick={() => void manageTeacherPassword(true)} className="rounded-xl border p-2 ml-2">Create / change password</button>
                <button type="button" onClick={() => void sendTeacherInvitation()} className="block rounded-xl border p-2">Send invitation through email only</button>
                <p className="text-xs text-slate-500">Save changes before sending. An invitation is sent once. Later saved changes automatically email the updated details.</p>
              </div>
              <p className="text-xs text-slate-500">Zoom authorization is optional. Save the teacher profile first, then manage their Zoom account from the roster.</p>

            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
