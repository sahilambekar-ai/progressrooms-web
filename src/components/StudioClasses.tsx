"use client";

import { ScheduleInput } from "@/components/ScheduleInput";

import { useEffect, useState } from "react";
import { staffApi } from "@/lib/staff-api";
import { Modal } from "@/components/Modal";
import { useFeedback } from "@/components/FeedbackProvider";
import { CatalogHistoryTabs } from "@/components/CatalogHistoryTabs";
import { LiveStatusToggle } from "@/components/LiveStatusToggle";
import { WhatsAppNotificationHint } from "@/components/WhatsAppNotificationHint";
import { Video, Calendar, Clock, Plus, RefreshCw, CheckCircle2, Pencil, Trash2, X, Users, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";

type ClassItem = {
  id: string;
  name: string;
  start_at: string;
  end_at: string;
  status: string;
  meeting_url: string | null;
  is_current: boolean;
};

interface StudioClassesProps {
  orgId?: string;
  canCreateClass?: boolean;
  isTeacher?: boolean;
  focusedClassTitle?: string | null;
  onClearFocusedClass?: () => void;
}

export function StudioClasses({
  orgId,
  canCreateClass = true,
  isTeacher = false,
  focusedClassTitle = null,
  onClearFocusedClass,
}: StudioClassesProps) {
  const [org, setOrg] = useState(orgId || "");
  const [classes, setClasses] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [classPage, setClassPage] = useState(1);
  const [classPageSize, setClassPageSize] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("ALL");
  const [dayFilter, setDayFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const allItems = showHistory ? historyItems : classes;
  const displayedItems = allItems.filter((c) => {
    if (focusedClassTitle) {
      const cName = (c.name || "").toLowerCase().trim();
      const target = focusedClassTitle.toLowerCase().trim();
      if (!cName.includes(target) && !target.includes(cName)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (c.name || "").toLowerCase().includes(q);
      const descMatch = (c.short_description || "").toLowerCase().includes(q);
      const teacherMatch = (c.instructors || []).some((i: any) =>
        (i.full_name || "").toLowerCase().includes(q)
      );
      if (!nameMatch && !descMatch && !teacherMatch) return false;
    }
    if (teacherFilter !== "ALL") {
      const hasTeacher = (c.instructors || []).some(
        (i: any) => (i.member_id === teacherFilter || i.id === teacherFilter)
      );
      if (!hasTeacher) return false;
    }
    if (dayFilter !== "ALL") {
      const dayNum = Number(dayFilter);
      const matchesDay = (c.schedule_rules || []).some((r: any) => r.day_of_week === dayNum);
      if (!matchesDay) return false;
    }
    if (statusFilter !== "ALL") {
      const isLive = c.is_active !== false;
      if (statusFilter === "ACTIVE" && !isLive) return false;
      if (statusFilter === "INACTIVE" && isLive) return false;
    }
    if (typeFilter !== "ALL") {
      if (typeFilter === "ONE_TO_ONE" && c.session_type !== "ONE_TO_ONE") return false;
      if (typeFilter === "REGULAR" && c.session_type === "ONE_TO_ONE") return false;
    }
    return true;
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const { notify, confirm } = useFeedback();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [togglingClassId, setTogglingClassId] = useState<string | null>(null);

  // Class Batch Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [days, setDays] = useState<number[]>([0]);
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [price, setPrice] = useState("0");
  const [capacity, setCapacity] = useState("20");
  // A new class stays private until the owner explicitly publishes it.
  const [isActive, setIsActive] = useState(false);

  // Public Class Information Fields
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [skillLevel, setSkillLevel] = useState("ALL_LEVELS");
  const [sessionType, setSessionType] = useState("REGULAR");
  const [prerequisites, setPrerequisites] = useState("");
  const [requiredEquipment, setRequiredEquipment] = useState("");
  const [preparationInstructions, setPreparationInstructions] = useState("");

  // 1-on-1 Class Modal & Form State
  const [isOneOnOneModalOpen, setIsOneOnOneModalOpen] = useState(false);
  const [oneOnOneTitle, setOneOnOneTitle] = useState("1-on-1 Private Session");
  const [oneOnOneTeacher, setOneOnOneTeacher] = useState("");
  const [oneOnOneStudent, setOneOnOneStudent] = useState("");
  const [oneOnOneDate, setOneOnOneDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [oneOnOneStart, setOneOnOneStart] = useState("10:00");
  const [oneOnOneEnd, setOneOnOneEnd] = useState("11:00");
  const [oneOnOnePrice, setOneOnOnePrice] = useState("0");

  // Teacher Agenda state
  const [agendaClasses, setAgendaClasses] = useState<ClassItem[]>([]);
  const [agendaDay, setAgendaDay] = useState("today");
  const [agendaZone, setAgendaZone] = useState("Asia/Kolkata");
  const [agendaLoading, setAgendaLoading] = useState(false);

  const refresh = async (id: string) => {
    try {
      const [current, history] = await Promise.all([
        staffApi(`/organizations/${id}/classes`),
        staffApi(`/organizations/${id}/classes?history=true`),
      ]);
      setClasses(current);
      setHistoryItems(history);
    } catch (e: any) {
      console.warn("Could not fetch classes", e);
    }
  };

  const refreshAgenda = async (id: string) => {
    setAgendaLoading(true);
    try {
      const data = await staffApi(`/organizations/${id}/occurrences/teacher-agenda`);
      setAgendaClasses(data.classes || []);
      setAgendaDay(data.day || "today");
      setAgendaZone(data.timezone || "Asia/Kolkata");
    } catch (error: any) {
      console.warn("Could not fetch teacher agenda", error);
    } finally {
      setAgendaLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let activeOrgId = orgId || org;
        if (!activeOrgId) {
          const context = await staffApi("/auth/context");
          activeOrgId = context.organization_id;
        }
        setOrg(activeOrgId);
        if (canCreateClass) {
          try {
            const members = await staffApi(`/organizations/${activeOrgId}/members`);
            setTeachers(members);
          } catch (e) {
            console.warn("Could not fetch members", e);
          }
          try {
            const studentData = await staffApi(`/students?page=1&page_size=100&studio_id=${activeOrgId}`);
            setStudents(studentData.items || []);
          } catch (e) {
            console.warn("Could not fetch students", e);
          }
        }
        await refresh(activeOrgId);
        if (isTeacher) {
          await refreshAgenda(activeOrgId);
        }
      } catch (error) {
        notify((error as Error).message, "error");
      }
    })();
  }, [orgId, canCreateClass, isTeacher, notify]);

  useEffect(() => {
    setClassPage(1);
  }, [showHistory]);

  const openOneOnOneModal = async () => {
    setOneOnOneTitle("1-on-1 Private Session");
    setOneOnOneTeacher(teachers[0]?.id || "");
    setOneOnOneStudent(""); // Student selection kept empty
    setOneOnOneDate(new Date().toLocaleDateString("en-CA"));
    setOneOnOneStart("10:00");
    setOneOnOneEnd("11:00");
    setOneOnOnePrice("0");
    setIsOneOnOneModalOpen(true);
    if (org && students.length === 0) {
      try {
        const studentData = await staffApi("/students?page=1&page_size=100");
        setStudents(studentData.items || []);
      } catch (e) {
        console.warn("Could not fetch students", e);
      }
    }
  };

  const resetForm = () => {
    setEditingClass(null);
    setName("");
    setTeacher(teachers[0]?.id || "");
    setStart("09:00");
    setEnd("10:00");
    setDays([0]);
    setDate(new Date().toLocaleDateString("en-CA"));
    setPrice("0");
    setCapacity("20");
    setIsActive(false);
    setShortDescription("");
    setFullDescription("");
    setSkillLevel("ALL_LEVELS");
    setSessionType("REGULAR");
    setPrerequisites("");
    setRequiredEquipment("");
    setPreparationInstructions("");
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingClass(c);
    setName(c.name || "");
    const teacherId = c.instructors?.[0]?.member_id || c.instructors?.[0]?.id || "";
    setTeacher(teacherId);
    setCapacity(String(c.capacity || 20));
    setPrice(String(c.pricing?.price ?? 0));
    setIsActive(c.is_active !== false);
    setShortDescription(c.short_description || "");
    setFullDescription(c.full_description || "");
    setSkillLevel(c.skill_level || "ALL_LEVELS");
    setSessionType(c.session_type || "REGULAR");
    setPrerequisites(c.requirements?.prerequisites || "");
    setRequiredEquipment(c.requirements?.required_equipment || "");
    setPreparationInstructions(c.requirements?.preparation_instructions || "");

    if (c.schedule_rules && c.schedule_rules.length > 0) {
      setStart(c.schedule_rules[0].start_time?.slice(0, 5) || "09:00");
      setEnd(c.schedule_rules[0].end_time?.slice(0, 5) || "10:00");
      setDays(c.schedule_rules.map((r: any) => r.day_of_week));
      setDate(c.schedule_rules[0].effective_start_date || new Date().toLocaleDateString("en-CA"));
    } else {
      setStart("09:00");
      setEnd("10:00");
      setDays([0]);
      setDate(new Date().toLocaleDateString("en-CA"));
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!canCreateClass || deletingId) return;
    const approved = await confirm({
      title: "Delete class batch?",
      description: `Delete "${name}"? It will be removed from your catalog. Existing purchases and attendance history will be kept.`,
      confirmLabel: "Delete class batch",
      destructive: true,
    });
    if (!approved) return;
    setDeletingId(id);
    try {
      await staffApi(`/organizations/${org}/classes/${id}`, { method: "DELETE" });
      await refresh(org);
      notify("Class batch deleted.", "success");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not delete class batch.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (classId: string, currentActive: boolean) => {
    setTogglingClassId(classId);
    try {
      const res = await staffApi(`/organizations/${org}/classes/${classId}/toggle-status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !currentActive }),
      });
      setClasses((prev) =>
        prev.map((item) => (item.id === classId ? { ...item, is_active: res.is_active } : item))
      );
      notify(
        res.is_active
          ? "🌿 Class is now Live and visible to students."
          : "Class is not live.",
        "success"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update class status", "error");
    } finally {
      setTogglingClassId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!days.length || end <= start) {
      notify("Choose at least one day and an end time after the start time.", "error");
      return;
    }
    setBusy(true);

    try {
      const duration_minutes =
        Number(end.slice(0, 2)) * 60 +
        Number(end.slice(3)) -
        (Number(start.slice(0, 2)) * 60 + Number(start.slice(3)));

      const requirementsPayload = {
        prerequisites: prerequisites.trim() || undefined,
        required_equipment: requiredEquipment.trim() || undefined,
        preparation_instructions: preparationInstructions.trim() || undefined,
      };

      if (editingClass) {
        // Edit existing class
        await staffApi(`/organizations/${org}/classes/${editingClass.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name,
            short_description: shortDescription.trim() || undefined,
            full_description: fullDescription.trim() || undefined,
            skill_level: skillLevel,
            session_type: sessionType,
            requirements: requirementsPayload,
            capacity: Number(capacity),
            duration_minutes: duration_minutes > 0 ? duration_minutes : 60,
            instructor_member_ids: teacher ? [teacher] : [],
            is_active: isActive,
            pricing: {
              pricing_type: "MONTHLY",
              price: Number(price),
              currency: "INR",
              validity_days: 30,
            },
            schedule_rules: days.map((day) => ({
              day_of_week: day,
              start_time: start,
              end_time: end,
              effective_start_date: date,
            })),
          }),
        });
        notify("🌿 Class batch updated successfully.", "success");
      } else {
        // Create new class
        let types = await staffApi(`/organizations/${org}/class-types`);
        const type =
          types[0] ||
          (await staffApi(`/organizations/${org}/class-types`, {
            method: "POST",
            body: JSON.stringify({ name: "General", slug: `general-${crypto.randomUUID().slice(0, 8)}` }),
          }));

        await staffApi(`/organizations/${org}/classes`, {
          method: "POST",
          body: JSON.stringify({
            name,
            slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID().slice(0, 8)}`,
            short_description: shortDescription.trim() || undefined,
            full_description: fullDescription.trim() || undefined,
            skill_level: skillLevel,
            session_type: sessionType,
            requirements: requirementsPayload,
            class_type_id: type.id,
            instructor_member_ids: teacher ? [teacher] : [],
            capacity: Number(capacity),
            duration_minutes: duration_minutes > 0 ? duration_minutes : 60,
            pricing: { pricing_type: "MONTHLY", price: Number(price), currency: "INR", validity_days: 30 },
            schedule_rules: days.map((day) => ({
              day_of_week: day,
              start_time: start,
              end_time: end,
              effective_start_date: date,
            })),
            is_active: isActive,
          }),
        });
        notify("🌿 Class batch created and scheduled successfully.", "success");
      }

      setShowHistory(false);
      setIsModalOpen(false);
      resetForm();
      await refresh(org);
    } catch (error) {
      notify((error as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const handleOneOnOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneOnOneStudent) {
      notify("Please select a student for this 1-on-1 class.", "error");
      return;
    }
    if (oneOnOneEnd <= oneOnOneStart) {
      notify("End time must be after start time.", "error");
      return;
    }
    setBusy(true);

    try {
      await staffApi(`/organizations/${org}/one-on-one-classes`, {
        method: "POST",
        body: JSON.stringify({
          title: oneOnOneTitle.trim() || "1-on-1 Private Session",
          teacher_member_id: oneOnOneTeacher,
          student_user_id: oneOnOneStudent,
          date: oneOnOneDate,
          start_time: oneOnOneStart,
          end_time: oneOnOneEnd,
          price: Number(oneOnOnePrice) || 0,
        }),
      });

      notify("🌿 1-on-1 class scheduled successfully. Attendance will be recorded automatically when completed.", "success");
      setIsOneOnOneModalOpen(false);
      await refresh(org);
      if (isTeacher) {
        await refreshAgenda(org);
      }
    } catch (err: any) {
      notify(err.message || "Failed to create 1-on-1 class", "error");
    } finally {
      setBusy(false);
    }
  };

  const time = (value: string) =>
    new Date(value).toLocaleTimeString([], { timeZone: agendaZone, hour: "2-digit", minute: "2-digit" });

  return (
    <section className="relative space-y-6">
      {/* HEADER SECTION WITH TOP-RIGHT ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0C2417]">
            {isTeacher ? "My Classes & Agenda" : "Class Batches & Schedules"}
          </h1>
          <p className="text-xs text-[#40514E] mt-0.5">
            {isTeacher
              ? "View your scheduled classes, join live sessions, and review your teaching agenda."
              : "Create recurring class batches, schedule 1-on-1 classes, assign teachers, and manage attendance."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isTeacher && !showHistory && (
            <button
              type="button"
              onClick={() => org && refreshAgenda(org)}
              disabled={agendaLoading || busy}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white border border-[#CEDECF] rounded-xl text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${agendaLoading ? "animate-spin" : ""}`} />
              <span>Refresh Agenda</span>
            </button>
          )}

          {canCreateClass && (
            <>
              <button
                type="button"
                onClick={openOneOnOneModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D7A58] hover:bg-[#1f563d] text-white font-semibold text-xs shadow-sm transition"
              >
                <Users className="h-4 w-4" />
                <span>Create 1-on-1 Class</span>
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-white font-semibold text-xs shadow-sm transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create Class Batch</span>
              </button>
            </>
          )}
        </div>
      </div>



      {/* TEACHER LIVE AGENDA CARD */}
      {isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-[#0C2417] capitalize">
              {agendaDay}’s Classes · <span className="text-xs font-normal text-slate-500">{agendaZone}</span>
            </h2>
          </div>

          {!agendaClasses.length && !agendaLoading && (
            <div className="p-6 bg-white rounded-2xl border border-[#CEDECF] text-center text-slate-500 text-sm">
              <Calendar className="mx-auto h-8 w-8 text-[#81A882] mb-2" />
              <p className="font-semibold text-[#0C2417]">No classes scheduled {agendaDay}.</p>
              <p className="text-xs text-slate-400 mt-1">Enjoy your restful studio practice.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {[...agendaClasses]
              .sort((a, b) => Number(b.is_current) - Number(a.is_current))
              .map((item) => (
                <article
                  key={item.id}
                  className={`relative p-6 bg-white rounded-2xl border transition shadow-sm ${
                    item.is_current ? "border-emerald-600 ring-2 ring-emerald-500/20" : "border-[#CEDECF]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.is_current && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-2">
                          <CheckCircle2 className="h-3 w-3" /> Live Now
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-[#0C2417]">{item.name}</h3>
                      {item.status !== "COMPLETED" && item.status !== "CANCELLED" && new Date(item.end_at) > new Date() && <WhatsAppNotificationHint kind="reminder" />}
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5 text-[#81A882]" />
                        {time(item.start_at)} – {time(item.end_at)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E1E9E2] flex items-center justify-between">
                    {item.status === "COMPLETED" || new Date(item.end_at) < new Date() ? (
                      <span className="text-xs font-semibold text-slate-400">Class completed</span>
                    ) : item.meeting_url ? (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={item.meeting_url}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#133623] hover:bg-[#0C2417] text-white text-xs font-bold rounded-xl transition shadow-sm"
                      >
                        <Video className="h-4 w-4" />
                        <span>Join Live Class</span>
                      </a>
                    ) : (
                      <button
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await staffApi(`/organizations/${org}/occurrences/${item.id}/join-link`, { method: "POST" });
                            await refreshAgenda(org);
                            notify("🌿 Meeting link created successfully!", "success");
                          } catch (err: any) {
                            notify(err.message || "Failed to create meeting link", "error");
                          } finally {
                            setBusy(false);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D7A58] hover:bg-[#133623] text-white text-xs font-bold rounded-xl transition shadow-sm"
                      >
                        <Video className="h-4 w-4" />
                        <span>Create Join Link</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </div>
      )}

      <CatalogHistoryTabs history={showHistory} onChange={setShowHistory} label="Classes" panelId="class-catalog" />
      {/* CLASSES LIST MAIN CONTENT VIEW (RENDERED BELOW HEADER) */}
      <div id="class-catalog" role="tabpanel" aria-labelledby={`class-catalog-${showHistory ? "history" : "current"}`} className="space-y-3">
        {focusedClassTitle && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#2563eb]/10 border border-[#2563eb]/30 rounded-2xl text-[#1e40af] shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm">Focused Class:</span>
              <span className="bg-white border border-[#2563eb]/30 px-3 py-1 rounded-xl text-xs font-bold text-[#1d4ed8] shadow-xs">
                {focusedClassTitle}
              </span>
              <span className="text-xs text-slate-500">
                (Filtered from attendance calendar)
              </span>
            </div>
            {onClearFocusedClass && (
              <button
                type="button"
                onClick={onClearFocusedClass}
                className="self-start sm:self-center px-3.5 py-1.5 bg-white border border-[#2563eb]/40 text-[#1d4ed8] rounded-xl text-xs font-bold hover:bg-[#2563eb] hover:text-white transition shadow-xs"
              >
                Show All Classes
              </button>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white border border-[#CEDECF] rounded-2xl p-3.5 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search classes by name, description, or teacher..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setClassPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 text-xs border border-[#CEDECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setClassPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-[#F0F4F1] text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>

            {/* Teacher Filter */}
            <select
              value={teacherFilter}
              onChange={(e) => {
                setTeacherFilter(e.target.value);
                setClassPage(1);
              }}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Teachers</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}
                </option>
              ))}
            </select>

            {/* Day Filter */}
            <select
              value={dayFilter}
              onChange={(e) => {
                setDayFilter(e.target.value);
                setClassPage(1);
              }}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Days</option>
              <option value="0">Monday</option>
              <option value="1">Tuesday</option>
              <option value="2">Wednesday</option>
              <option value="3">Thursday</option>
              <option value="4">Friday</option>
              <option value="5">Saturday</option>
              <option value="6">Sunday</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setClassPage(1);
              }}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Live / Active</option>
              <option value="INACTIVE">Draft / Inactive</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setClassPage(1);
              }}
              className="border border-[#CEDECF] px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
            >
              <option value="ALL">All Class Types</option>
              <option value="REGULAR">Group Batches</option>
              <option value="ONE_TO_ONE">1-on-1 Sessions</option>
            </select>

            {(searchQuery || teacherFilter !== "ALL" || dayFilter !== "ALL" || statusFilter !== "ALL" || typeFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTeacherFilter("ALL");
                  setDayFilter("ALL");
                  setStatusFilter("ALL");
                  setTypeFilter("ALL");
                  setClassPage(1);
                }}
                className="text-xs text-[#2D7A58] hover:text-[#133623] font-semibold underline underline-offset-2 ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#0C2417]">
            {showHistory ? "Deleted class batches" : isTeacher ? "All Studio Classes" : "Studio Batches & Sessions"}
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {displayedItems.length} {displayedItems.length === 1 ? "class batch" : "class batches"} {showHistory ? "in history" : "configured"}
          </span>
        </div>

        {!displayedItems.length && (
          <div className="p-8 bg-white rounded-3xl border border-[#CEDECF] text-center text-slate-500 text-sm space-y-2">
            <p className="font-semibold text-[#0C2417]">{showHistory ? "No deleted class batches yet." : "No classes created yet in this studio."}</p>
            <p className="text-xs text-slate-400">{showHistory ? "Deleted class batches will appear here. Classes that are not live stay in Current." : "Create a class batch to schedule your first batch."}</p>
          </div>
        )}

        {(() => {
          const totalClassPages = Math.max(1, Math.ceil(displayedItems.length / classPageSize));
          const currentClassPage = Math.min(classPage, totalClassPages);
          const paginatedClasses = displayedItems.slice(
            (currentClassPage - 1) * classPageSize,
            currentClassPage * classPageSize
          );

          return (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {paginatedClasses.map((c) => {
                  const isLive = c.is_active !== false;
                  return (
                    <article
                      key={c.id}
                      className="relative px-5 py-4 border border-[#CEDECF] rounded-2xl bg-white shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {c.session_type === "ONE_TO_ONE" ? (
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  1-on-1 Class
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-[#1b4332] bg-[#E8F0E9] px-2 py-0.5 rounded-full">
                                  Capacity: {c.capacity}
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-base text-[#0C2417] leading-tight">{c.name}</h3>
                            {!showHistory && isLive && <WhatsAppNotificationHint kind="changes" />}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {showHistory ? (
                              <span className="record-capsule rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">Deleted</span>
                            ) : (
                              <LiveStatusToggle
                              live={isLive}
                              name={c.name}
                              disabled={!canCreateClass || togglingClassId === c.id || deletingId === c.id}
                              onChange={() => void handleToggleStatus(c.id, isLive)}
                            />
                            )}
                            {c.pricing && (
                              <div className="text-right">
                                <span className="text-xs font-bold text-[#0C2417]">₹{c.pricing.price}</span>
                                <span className="text-[10px] text-slate-400 block">
                                  {c.session_type === "ONE_TO_ONE" ? "/ session" : "/ month"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Teachers:</span>{" "}
                          {c.instructors && c.instructors.length > 0
                            ? c.instructors.map((t: any) => t.full_name).join(", ")
                            : "Unassigned"}{" "}
                          · {c.duration_minutes || 60} mins
                        </p>

                        <div className="text-[11px] text-slate-500 border-t border-[#E1E9E2] pt-2 flex flex-wrap gap-1">
                          {c.session_type === "ONE_TO_ONE" ? (
                            c.occurrences && c.occurrences.length > 0 ? (
                              <div className="space-y-1">
                                <span className="inline-block bg-[#E8F0E9] border border-[#CEDECF] px-2.5 py-1 rounded-lg text-[#133623] font-semibold">
                                  Single Session · {new Date(c.occurrences[0].start_at).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })} · {new Date(c.occurrences[0].start_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(c.occurrences[0].end_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span className="text-[10px] text-slate-400 block">Auto-concludes and logs attendance when finished</span>
                              </div>
                            ) : (
                              <span className="inline-block bg-[#E8F0E9] border border-[#CEDECF] px-2 py-0.5 rounded-lg text-[#133623]">
                                Single 1-on-1 Session
                              </span>
                            )
                          ) : c.schedule_rules && c.schedule_rules.length > 0 ? (
                            c.schedule_rules.map((rule: any) => (
                              <span
                                key={rule.id || `${rule.day_of_week}-${rule.start_time}`}
                                className="inline-block bg-[#F9FAF9] border border-[#CEDECF] px-2 py-0.5 rounded-lg text-slate-600"
                              >
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][rule.day_of_week]}{" "}
                                {rule.start_time?.slice(0, 5)}–{rule.end_time?.slice(0, 5)}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic">No schedule rules configured</span>
                          )}
                        </div>
                      </div>

                      {/* CARD ACTION CONTROLS: GO LIVE / INACTIVE TOGGLE + EDIT BUTTON */}
                      <div className={`pt-3 border-t border-[#E1E9E2] items-center justify-end gap-2 ${showHistory ? "hidden" : "flex"}`}>
                        {/* Edit Button */}
                        {!showHistory && canCreateClass && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#CEDECF] text-[#0C2417] hover:bg-[#F9FAF9] shadow-sm transition"
                            >
                              <Pencil className="h-3.5 w-3.5 text-[#133623]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete ${c.name}`}
                              title="Delete class batch"
                              disabled={deletingId === c.id}
                              onClick={() => void handleDelete(c.id, c.name)}
                              className="btn-compact inline-flex items-center justify-center rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                              style={{ width: 30, height: 30, minHeight: 30, color: "#dc2626" }}
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </>
                        )}
                      </div>
                        {showHistory && c.deleted_at && <p className="text-xs text-slate-500">Deleted {new Date(c.deleted_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>}
                    </article>
                  );
                })}
              </div>

              {displayedItems.length > 0 && (
                <div className="mt-4 px-6 py-4 bg-[#FAF7F2] rounded-2xl border border-[#CEDECF] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span>
                      Showing <strong>{(currentClassPage - 1) * classPageSize + 1}</strong> to{" "}
                      <strong>{Math.min(currentClassPage * classPageSize, displayedItems.length)}</strong> of <strong>{displayedItems.length}</strong> {showHistory ? "deleted classes" : "classes"}
                    </span>

                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-slate-400">Rows:</span>
                      <select
                        value={classPageSize}
                        onChange={(e) => {
                          setClassPageSize(Number(e.target.value));
                          setClassPage(1);
                        }}
                        className="px-2 py-1 rounded-lg border border-[#CEDECF] bg-white font-medium text-[#0C2417]"
                      >
                        <option value={6}>6</option>
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setClassPage((p) => Math.max(1, p - 1))}
                      disabled={currentClassPage <= 1}
                      className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {(() => {
                        const getPages = () => {
                          if (totalClassPages <= 7) {
                            return Array.from({ length: totalClassPages }, (_, i) => i + 1);
                          }
                          if (currentClassPage <= 4) {
                            return [1, 2, 3, 4, 5, "...", totalClassPages];
                          }
                          if (currentClassPage >= totalClassPages - 3) {
                            return [1, "...", totalClassPages - 4, totalClassPages - 3, totalClassPages - 2, totalClassPages - 1, totalClassPages];
                          }
                          return [1, "...", currentClassPage - 1, currentClassPage, currentClassPage + 1, "...", totalClassPages];
                        };

                        return getPages().map((pageNum, idx) =>
                          pageNum === "..." ? (
                            <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold select-none text-xs">
                              …
                            </span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => setClassPage(Number(pageNum))}
                              className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition ${
                                currentClassPage === pageNum
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
                      onClick={() => setClassPage((p) => Math.min(totalClassPages, p + 1))}
                      disabled={currentClassPage >= totalClassPages}
                      className="px-2.5 py-1.5 rounded-lg border border-[#CEDECF] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 font-medium"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* CREATE / EDIT CLASS POP-UP MODAL */}
      {isModalOpen && (
        <Modal
          title={editingClass ? "Edit Class Batch" : "Create Class Batch"}
          subtitle={
            editingClass
              ? "Update recurring rules, pricing, capacity, and live status."
              : "Configure recurring class schedules, teacher assignments, and capacity."
          }
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          confirmDiscard
        >
          <div className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="relative space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold">Class status</p>
                <LiveStatusToggle live={isActive} onChange={setIsActive} name="Class status" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <label className="font-semibold text-slate-700">
                  Class Name *
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sunrise Vinyasa Flow"
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  Assigned Teacher *
                  <select
                    required
                    value={teacher}
                    onChange={(e) => setTeacher(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} {t.role === "STUDIO" ? "(Studio Owner)" : "(Teacher)"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="font-semibold text-slate-700">
                  Start Time *
                  <ScheduleInput
                    required
                    type="time"
                    value={start}
                    onValueChange={setStart}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  End Time *
                  <ScheduleInput
                    required
                    type="time"
                    value={end}
                    onValueChange={setEnd}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  First Session Date *
                  <ScheduleInput
                    required
                    type="date"
                    value={date}
                    onValueChange={setDate}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  Student Capacity *
                  <input
                    required
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700 sm:col-span-2">
                  Monthly Price (₹) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>
              </div>

              <fieldset className="space-y-1">
                <legend className="text-xs font-semibold text-slate-700 mb-1">Teaching Days *</legend>
                <div className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <label key={day} className="teaching-day-choice">
                      <input
                        type="checkbox"
                        checked={days.includes(i)}
                        onChange={(e) =>
                          setDays(e.target.checked ? [...days, i] : days.filter((d) => d !== i))
                        }
                        className="rounded text-[#133623] focus:ring-[#133623]"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Public Class Information & Requirements */}
              <div className="space-y-3 pt-3 border-t border-[#E1E9E2]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#133623]">
                  Public Class Information & Requirements
                </p>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <label className="font-semibold text-slate-700">
                    Skill Level
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    >
                      <option value="ALL_LEVELS">All Levels</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </label>

                  <label className="font-semibold text-slate-700">
                    Session Format
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    >
                      <option value="REGULAR">Group Batch (Regular)</option>
                      <option value="ONE_TO_ONE">1-on-1 Private Session</option>
                      <option value="WORKSHOP">Workshop / Intensive</option>
                    </select>
                  </label>
                </div>

                <label className="block text-xs font-semibold text-slate-700">
                  Short Tagline / Summary (1–2 sentences)
                  <input
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="e.g. Grounding morning practice integrating dynamic pranayama."
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="block text-xs font-semibold text-slate-700">
                  Full Class Description
                  <textarea
                    rows={3}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Provide detailed description of practices, philosophy, benefits, and schedule expectations…"
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <label className="font-semibold text-slate-700">
                    Prerequisites
                    <input
                      value={prerequisites}
                      onChange={(e) => setPrerequisites(e.target.value)}
                      placeholder="e.g. Empty stomach 2 hours prior."
                      className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    />
                  </label>

                  <label className="font-semibold text-slate-700">
                    Required Equipment
                    <input
                      value={requiredEquipment}
                      onChange={(e) => setRequiredEquipment(e.target.value)}
                      placeholder="e.g. Yoga mat, two foam blocks, strap."
                      className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    />
                  </label>
                </div>

                <label className="block text-xs font-semibold text-slate-700">
                  Preparation Instructions
                  <input
                    value={preparationInstructions}
                    onChange={(e) => setPreparationInstructions(e.target.value)}
                    placeholder="e.g. Join Zoom 5 minutes early in a quiet, well-lit room."
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>
              </div>

              {/* Inherited Studio Venue & Cancellation Policies */}
              <div className="space-y-3 pt-3 border-t border-[#E1E9E2]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#133623]">
                    Venue & Cancellation Policy
                  </p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Inherited Studio Policy
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FAF7F2] border border-[#CEDECF] rounded-xl space-y-1">
                    <span className="font-bold text-[#0C2417] block">Sanctuary Venue & Live Link</span>
                    <p className="text-slate-600 text-[11px]">
                      Inherited from studio profile: Main Sanctuary location with automated Zoom live meeting integration.
                    </p>
                  </div>
                  <div className="p-3 bg-[#FAF7F2] border border-[#CEDECF] rounded-xl space-y-1">
                    <span className="font-bold text-[#0C2417] block">Cancellation & Refund Rules</span>
                    <p className="text-slate-600 text-[11px]">
                      Inherited studio policy: Free cancellation up to 2 hours prior to start; session credit preserved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E9E2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[#133623] hover:bg-[#0C2417] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {busy ? "Saving…" : editingClass ? "Update Class Batch" : "Save Class Batch"}
                </button>
                <WhatsAppNotificationHint kind={editingClass ? "changes" : "reminder"} />
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* CREATE 1-ON-1 CLASS POP-UP MODAL */}
      {isOneOnOneModalOpen && (
        <Modal
          title="Create 1-on-1 Class"
          subtitle="Schedule a private 1-on-1 class session. This class is non-recurring and will automatically conclude and record attendance once complete."
          onClose={() => {
            setIsOneOnOneModalOpen(false);
          }}
          confirmDiscard
        >
          <div className="p-6 space-y-5">
            <form onSubmit={handleOneOnOneSubmit} className="relative space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Class Title *
                </label>
                <input
                  required
                  value={oneOnOneTitle}
                  onChange={(e) => setOneOnOneTitle(e.target.value)}
                  placeholder="e.g. 1-on-1 Private Session"
                  className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Default title provided. You can modify this or keep it as is.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <label className="font-semibold text-slate-700">
                  Assigned Teacher *
                  <select
                    required
                    value={oneOnOneTeacher}
                    onChange={(e) => setOneOnOneTeacher(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} {t.role === "STUDIO" ? "(Studio Owner)" : "(Teacher)"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="font-semibold text-slate-700">
                  Select Student *
                  <select
                    required
                    value={oneOnOneStudent}
                    onChange={(e) => setOneOnOneStudent(e.target.value)}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  >
                    <option value="">Select student…</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="font-semibold text-slate-700 sm:col-span-2">
                  Session Date *
                  <ScheduleInput
                    required
                    type="date"
                    value={oneOnOneDate}
                    onValueChange={setOneOnOneDate}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  Start Time *
                  <ScheduleInput
                    required
                    type="time"
                    value={oneOnOneStart}
                    onValueChange={setOneOnOneStart}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700">
                  End Time *
                  <ScheduleInput
                    required
                    type="time"
                    value={oneOnOneEnd}
                    onValueChange={setOneOnOneEnd}
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>

                <label className="font-semibold text-slate-700 sm:col-span-2">
                  Session Fee (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={oneOnOnePrice}
                    onChange={(e) => setOneOnOnePrice(e.target.value)}
                    placeholder="0"
                    className="mt-1 block w-full border border-[#CEDECF] p-2.5 rounded-xl text-xs sm:text-sm placeholder:text-xs placeholder:text-slate-400 font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                  />
                </label>
              </div>

              {/* Lifecycle notification info box */}
              <div className="p-3.5 bg-[#F4F7F4] border border-[#CEDECF] rounded-2xl flex items-start gap-2.5 text-xs text-[#1b4332]">
                <CheckCircle2 className="h-4 w-4 text-[#2D7A58] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[#0C2417]">No repeat schedule · Automatic attendance logging</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    This 1-on-1 class is a single session and does not repeat. Once the class is over, it will be automatically removed from active batches and recorded into the attendance tracker for both the teacher and student.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E9E2]">
                <button
                  type="button"
                  onClick={() => setIsOneOnOneModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !oneOnOneStudent}
                  className="bg-[#2D7A58] hover:bg-[#1f563d] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  {busy ? "Scheduling…" : "Create 1-on-1 Class"}
                </button>
                <WhatsAppNotificationHint kind="reminder" />
              </div>
            </form>
          </div>
        </Modal>
      )}
    </section>
  );
}
