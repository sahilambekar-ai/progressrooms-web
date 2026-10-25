"use client";
import { ClassPackageSummary } from "@/components/ClassPackageSummary";
import { CollapsedDescription } from "@/components/RichDescription";
import { ClassPackageOptions } from "@/components/ClassPackageOptions";
import { useCallback, useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import { PanelLoading } from "@/components/PanelLoading";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, CalendarDays, ArrowRight, MessageSquare, Plus, Search, AlertCircle, Loader2, CheckCircle2, Copy, Share2, User, Clock, MapPin, Check, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { MeetingAction } from '@/components/MeetingAction';
import type { CalendarSessionEvent } from '@/components/AttendanceCalendar';
import { Modal } from '@/components/Modal';
import type { Purchase } from '@/components/StoreCheckout';
import { PublicWebsitePayload } from '@/types';
import { WhatsAppNotificationHint } from '@/components/WhatsAppNotificationHint';

const StudioExplore = dynamic(() => import('@/components/StudioExplore').then(module => module.StudioExplore), { loading: PanelLoading });
const AttendanceCalendar = dynamic(() => import('@/components/AttendanceCalendar').then(module => module.AttendanceCalendar), { loading: PanelLoading });
const StoreCheckout = dynamic(() => import('@/components/StoreCheckout').then(module => module.StoreCheckout), { loading: PanelLoading });

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Enrollment = {
  amount_paid?: number | null;
  currency?: string;
  id: string;
  purchase_id?: string;
  purchase_name?: string;
  session_id?: string;
  tier_id?: string | null;
  description?: string;
  session_name: string;
  organization_name: string;
  organization_slug: string;
  status: string;
  total_sessions?: number;
  sessions_attended: number;
  sessions_restored?: number;
  valid_until?: string;
};

type Class = {
  id: string;
  description?: string;
  session_name: string;
  organization_name: string;
  instructor_name: string;
  start_at: string;
  end_at: string;
  can_join: boolean;
  eligibility_reason?: string | null;
};

type Studio = { id: string; name: string; slug: string; timezone?: string };

type TeacherOfferingClass = {
  instructor_names?: string[];
  id: string;
  name: string;
  slug: string;
  full_description?: string;
  short_description?: string;
  session_type: string;
  delivery_mode: string;
  skill_level: string;
  duration_minutes: number;
  capacity: number | null;
  remaining_spots: number | null;
  pricing?: {
    packages?: import("@/types").ClassPackage[];
    pricing_type: import("@/types").Pricing["pricing_type"];
    price: number;
    currency: string;
    total_classes?: number | null;
    validity_days: number;
  } | null;
  next_session?: {
    id: string;
    start_time: string;
    end_time: string;
    timezone: string;
  } | null;
  schedule: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  }[];
};

type TeacherOfferingPass = {
  class_packages?: { session_id: string; package_id: string; total_classes: number; class_name: string }[];
  id: string;
  name: string;
  description?: string | null;
  price: number;
  offer_price?: number | null;
  currency: string;
  tier_type: string;
  total_classes?: number | null;
  validity_days: number;
};

type TeacherStudioAffiliation = {
  studio_id: string;
  studio_name: string;
  studio_slug: string;
  location?: string;
  timezone: string;
  teacher_code: string;
  classes: TeacherOfferingClass[];
  passes: TeacherOfferingPass[];
};

type TeacherPublicProfile = {
  teacher: {
    id: string;
    name: string;
    teacher_code: string;
    title: string;
    bio?: string | null;
    avatar_url?: string | null;
    is_active: boolean;
  };
  studios: TeacherStudioAffiliation[];
};

const date = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function TeacherAffiliationCard({
  affiliation,
  onSelectOffering,
}: {
  affiliation: TeacherStudioAffiliation;
  onSelectOffering: (offering: Purchase) => void;
}) {
  const [classSearch, setClassSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'ONLINE_LIVE' | 'HYBRID'>('ALL');
  const [dayFilter, setDayFilter] = useState<'ALL' | number>('ALL');
  const [visibleClassLimit, setVisibleClassLimit] = useState(6);
  const [visiblePassLimit, setVisiblePassLimit] = useState(4);

  const filteredClasses = affiliation.classes.filter((cls) => {
    if (classSearch.trim()) {
      const q = classSearch.toLowerCase().trim();
      const matchName = cls.name.toLowerCase().includes(q);
      const matchDesc = (cls.short_description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (modeFilter !== 'ALL' && cls.delivery_mode !== modeFilter) {
      return false;
    }
    if (dayFilter !== 'ALL') {
      const dayNum = Number(dayFilter);
      if (!cls.schedule.some((s) => s.day_of_week === dayNum)) return false;
    }
    return true;
  });

  const displayedClasses = filteredClasses.slice(0, visibleClassLimit);
  const displayedPasses = affiliation.passes.slice(0, visiblePassLimit);

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E1E9E2]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-2xl font-bold text-[#0C2417]">
              {affiliation.studio_name}
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#E8F0E9] text-[#133623] px-2.5 py-0.5 rounded-lg border border-[#CEDECF]">
              Code: {affiliation.teacher_code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <MapPin size={13} />
            <span>{affiliation.location || 'Studio'}</span>
            <span className="text-slate-300">·</span>
            <Clock size={13} />
            <span>Timezone: {affiliation.timezone}</span>
          </p>
        </div>

        <Link
          href={`/${affiliation.studio_slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#133623] hover:underline"
        >
          Visit studio website <ArrowRight size={13} />
        </Link>
      </div>

      {/* Studio Classes Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Scheduled Classes ({affiliation.classes.length})
            </h4>
            {affiliation.classes.length > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                · Showing {displayedClasses.length} of {filteredClasses.length}
              </span>
            )}
          </div>
          {(classSearch || modeFilter !== 'ALL' || dayFilter !== 'ALL') && (
            <button
              onClick={() => {
                setClassSearch('');
                setModeFilter('ALL');
                setDayFilter('ALL');
              }}
              className="text-xs text-[#133623] hover:underline font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Filter controls if classes exist */}
        {affiliation.classes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-[#F9FAF9] p-3 rounded-2xl border border-[#CEDECF]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter classes by name…"
                value={classSearch}
                onChange={(e) => {
                  setClassSearch(e.target.value);
                  setVisibleClassLimit(6);
                }}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#CEDECF] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#133623]"
              />
            </div>
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value as any);
                setVisibleClassLimit(6);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-[#CEDECF] rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#133623]"
            >
              <option value="ALL">All Delivery Modes</option>
              <option value="ONLINE_LIVE">Online Live</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <select
              value={dayFilter}
              onChange={(e) => {
                setDayFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                setVisibleClassLimit(6);
              }}
              className="px-3 py-1.5 text-xs bg-white border border-[#CEDECF] rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#133623]"
            >
              <option value="ALL">All Days of Week</option>
              {DAYS.map((dayName, idx) => (
                <option key={idx} value={idx}>
                  {dayName}
                </option>
              ))}
            </select>
          </div>
        )}

        {displayedClasses.length === 0 ? (
          <p className="text-xs text-slate-500 italic bg-[#F9FAF9] p-4 rounded-2xl border border-[#E1E9E2]">
            {affiliation.classes.length === 0
              ? 'No published classes currently scheduled at this studio.'
              : 'No scheduled classes match your search and filter criteria.'}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedClasses.map((cls) => {
              const spotsText = cls.capacity == null ? "No capacity limit" : `${cls.remaining_spots} of ${cls.capacity} spots left`;
              return (
                <article
                  key={cls.id}
                  className="bg-[#F9FAF9] border border-[#CEDECF] rounded-2xl p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-row-reverse items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#CEDECF] text-[#133623]">
                        {cls.delivery_mode === 'ONLINE_LIVE' ? 'Online Live' : 'Hybrid'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          (cls.remaining_spots == null || cls.remaining_spots > 2)
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {spotsText}
                      </span>
                    </div>

                    <h5 className="font-serif font-bold text-lg text-[#0C2417] leading-snug">
                      {cls.name}
                    </h5>

                    <p className="text-xs text-slate-600"><span className="font-semibold">Teachers:</span> {cls.instructor_names?.join(", ") || "Contact studio"} · {cls.duration_minutes} mins</p>
                    <ClassPackageSummary pricing={cls.pricing} />
                    <CollapsedDescription text={cls.full_description || cls.short_description}>

                    {cls.next_session && (
                      <p className="text-[11px] font-medium text-emerald-800 bg-white p-2 rounded-xl border border-[#CEDECF]">
                        Next: {new Date(cls.next_session.start_time).toLocaleString()}
                      </p>
                    )}

                    <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                      {cls.schedule.map((r, i) => (
                        <p key={i}>
                          • {DAYS[r.day_of_week]} · {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)}
                        </p>
                      ))}
                    </div>
                    </CollapsedDescription>
                  </div>

                  {cls.pricing && <ClassPackageOptions id={cls.id} name={cls.name} pricing={cls.pricing} onBuy={onSelectOffering} disabled={cls.remaining_spots === 0} />}
                </article>
              );
            })}
          </div>
        )}

        {/* Classes Pagination / Show more button */}
        {filteredClasses.length > 6 && (
          <div className="flex items-center justify-center pt-2">
            {visibleClassLimit < filteredClasses.length ? (
              <button
                type="button"
                onClick={() => setVisibleClassLimit((prev) => prev + 6)}
                className="px-5 py-2 rounded-xl border border-[#CEDECF] bg-white hover:bg-[#F9FAF9] text-[#133623] text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>Show more classes ({filteredClasses.length - visibleClassLimit} remaining)</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setVisibleClassLimit(6)}
                className="px-4 py-1.5 rounded-xl border border-[#CEDECF] bg-white text-slate-600 hover:text-[#133623] text-xs font-medium transition"
              >
                Show fewer classes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Studio Passes */}
      {affiliation.passes.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#E1E9E2]">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Studio Passes Covering This Teacher ({affiliation.passes.length})
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Showing {displayedPasses.length} of {affiliation.passes.length}
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPasses.map((pass) => (
              <article
                key={pass.id}
                className="bg-[#E8F0E9] border border-[#CEDECF] rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#CEDECF] text-[#133623]">
                    Pass / Membership
                  </span>

                  <h5 className="font-serif font-bold text-lg text-[#0C2417] leading-snug">
                    {pass.name}
                  </h5>

                  {pass.class_packages?.map(p => <p key={`${p.session_id}:${p.package_id}`} className="text-xs text-[#133623]">{p.class_name} · {p.total_classes} sessions</p>)}
                  {pass.description && (
                    <CollapsedDescription text={pass.description} />
                  )}

                  <p className="text-xs text-slate-600 font-medium">
                    {pass.total_classes
                      ? `${pass.total_classes} sessions credit`
                      : 'Unlimited sessions'}{' '}
                    · {pass.validity_days} days validity
                  </p>
                </div>

                <div className="pt-2 border-t border-[#CEDECF] flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-base text-[#0C2417]">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: pass.currency,
                      }).format(pass.offer_price ?? pass.price)}
                    </p>
                    {pass.offer_price != null && pass.offer_price < pass.price && (
                      <p className="text-[10px] text-slate-500 line-through">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: pass.currency,
                        }).format(pass.price)}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectOffering({
                        id: pass.id,
                        kind: 'pass',
                        name: pass.name,
                        price: pass.price,
                        offer_price: pass.offer_price,
                        currency: pass.currency,
                        total_classes: pass.total_classes || undefined,
                        validity_days: pass.validity_days,
                      });
                    }}
                    className="px-4 py-2 bg-[#133623] hover:bg-[#0C2417] text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Buy pass
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Passes Show More */}
          {affiliation.passes.length > 4 && (
            <div className="flex items-center justify-center pt-2">
              {visiblePassLimit < affiliation.passes.length ? (
                <button
                  type="button"
                  onClick={() => setVisiblePassLimit((prev) => prev + 4)}
                  className="px-5 py-2 rounded-xl border border-[#CEDECF] bg-white hover:bg-[#F9FAF9] text-[#133623] text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Show more passes ({affiliation.passes.length - visiblePassLimit} remaining)</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setVisiblePassLimit(4)}
                  className="px-4 py-1.5 rounded-xl border border-[#CEDECF] bg-white text-slate-600 hover:text-[#133623] text-xs font-medium transition"
                >
                  Show fewer passes
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentPortalPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'classes' | 'teacher' | 'attendance' | 'explore' | 'support'>('classes');

  // Teacher Discovery state
  const [teacherQuery, setTeacherQuery] = useState('');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState('');
  const [teacherResult, setTeacherResult] = useState<TeacherPublicProfile | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected checkout offering
  const [selectedOffering, setSelectedOffering] = useState<Purchase | null>(null);
  useEffect(() => {
    if (!teacherResult) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('buy');
    for (const studio of teacherResult.studios) {
      const cls = studio.classes.find(c => c.id === id);
      const pass = studio.passes.find(p => p.id === id);
      const pkg = cls?.pricing?.packages?.find(p => p.id === params.get('package'));
      if (params.get('kind') === 'class' && cls?.pricing && (pkg || !cls.pricing.packages?.length)) setSelectedOffering({ id: cls.id, name: cls.name, kind: 'class', price: pkg?.price ?? cls.pricing.price, offer_price: pkg?.offer_price, currency: cls.pricing.currency, total_classes: pkg?.total_classes ?? cls.pricing.total_classes ?? undefined, validity_days: pkg?.validity_days ?? cls.pricing.validity_days, package_id: pkg?.id });
      if (params.get('kind') === 'pass' && pass) setSelectedOffering({ ...pass, total_classes: pass.total_classes ?? undefined, kind: 'pass' });
    }
  }, [teacherResult]);

  // Class cancellation & reschedule
  const [cancellingId, setCancellingId] = useState('');
  const [cancellationNotice, setCancellationNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [reschedulingClass, setReschedulingClass] = useState<Class | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [selectedTargetSlotId, setSelectedTargetSlotId] = useState<string>('');
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Attendance
  const [attendanceEvents, setAttendanceEvents] = useState<CalendarSessionEvent[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceMonth, setAttendanceMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [attendanceStudio, setAttendanceStudio] = useState('ALL');

  // Joining

  // Studios & Explore
  const [studios, setStudios] = useState<Studio[]>([]);
  const [studio, setStudio] = useState('');
  const [catalog, setCatalog] = useState<PublicWebsitePayload | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [retry, setRetry] = useState(0);

  // Passes & Memberships organization
  const [passTab, setPassTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [activePassGroup, setActivePassGroup] = useState<'ALL' | 'EXPIRING' | 'RECENT' | 'UNLIMITED'>('ALL');
  const [passSearch, setPassSearch] = useState('');
  const [passStudio, setPassStudio] = useState('ALL');
  const [passPage, setPassPage] = useState(1);
  const PASSES_PER_PAGE = 6;

  // Support Tickets
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [selectedSupportTicket, setSelectedSupportTicket] = useState<any | null>(null);
  const [supportReplyMessage, setSupportReplyMessage] = useState('');
  const [isSendingSupportReply, setIsSendingSupportReply] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicketStudioId, setNewTicketStudioId] = useState('');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('GENERAL');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [isSubmittingNewTicket, setIsSubmittingNewTicket] = useState(false);

  const [now, setNow] = useState(Date.now());

  const get = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pr_access_token') : null;
      const response = await fetch(API + path, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options?.headers || {}),
        },
        cache: 'no-store',
      });
      if (response.status === 401) {
        router.replace('/login?next=%2Fstudent');
        throw new Error('Please log in to view your classes.');
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Could not load your dashboard.');
      return data;
    },
    [router]
  );

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [userRes, purchasesRes, upcomingRes, connectedRes] = await Promise.allSettled([
        get('/auth/me'),
        get('/student/enrollments'),
        get('/student/upcoming-classes'),
        get('/student/studios'),
      ]);

      if (userRes.status === 'fulfilled') setName(userRes.value?.full_name || '');
      if (purchasesRes.status === 'fulfilled') setEnrollments(purchasesRes.value || []);
      if (upcomingRes.status === 'fulfilled') setClasses(upcomingRes.value || []);
      if (connectedRes.status === 'fulfilled') {
        const connected = connectedRes.value || [];
        setStudios(connected);
        const requested = new URLSearchParams(window.location.search).get('studio');
        setStudio((current) =>
          connected.some((s: Studio) => s.slug === current)
            ? current
            : connected.find((s: Studio) => s.slug === requested)?.slug || connected[0]?.slug || ''
        );
      }

      if (userRes.status === 'rejected' && purchasesRes.status === 'rejected' && upcomingRes.status === 'rejected') {
        setError('Could not load dashboard data. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [get]);

  const lookupTeacher = useCallback(async (q: string) => {
    const queryStr = q.trim();
    if (!queryStr) return;
    setTeacherLoading(true);
    setTeacherError('');
    try {
      const res = await fetch(`${API}/teachers/public/lookup?query=${encodeURIComponent(queryStr)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Teacher not found. Check the code or name and try again.');
      }
      setTeacherResult(data);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/student?teacher=${encodeURIComponent(queryStr)}`);
      }
    } catch (err: any) {
      setTeacherResult(null);
      setTeacherError(err.message || 'Teacher not found. Check the code or name and try again.');
    } finally {
      setTeacherLoading(false);
    }
  }, []);

  const handleTeacherSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void lookupTeacher(teacherQuery);
  };

  const cancelBooking = async (occurrenceId: string, className: string, startAt: string) => {
    const startTime = new Date(startAt).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (startTime - Date.now() < twoHoursMs) {
      setCancellationNotice({
        type: 'error',
        message: `Late cancellation: "${className}" starts in less than 2 hours. According to studio policy, bookings can only be cancelled at least 2 hours prior to start time. This booking cannot be cancelled in the app. Contact your teacher or studio for help. No payment is returned.`,
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel your booking for "${className}"? Your unused session credit will remain available within your pass validity. No payment is returned.`)) {
      return;
    }

    setCancellingId(occurrenceId);
    setCancellationNotice(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pr_access_token') : null;
      const res = await fetch(`${API}/student/classes/${occurrenceId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not cancel class booking.');
      }
      setCancellationNotice({
        type: 'success',
        message: `Booking for "${className}" has been cancelled. Your unused session credit remains available within your pass validity. No payment is returned.`,
      });
      await load();
    } catch (err: any) {
      setCancellationNotice({
        type: 'error',
        message: err.message || 'Could not cancel booking.',
      });
    } finally {
      setCancellingId('');
    }
  };

  const openRescheduleModal = async (c: Class) => {
    const startTime = new Date(c.start_at).getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (startTime - Date.now() < twoHoursMs) {
      setCancellationNotice({
        type: 'error',
        message: `Rescheduling policy: "${c.session_name}" starts in less than 2 hours. According to studio policy, bookings can only be rescheduled at least 2 hours prior to scheduled class start time.`,
      });
      return;
    }
    setReschedulingClass(c);
    setRescheduleSlots([]);
    setSelectedTargetSlotId('');
    setRescheduleError('');
    setRescheduleLoading(true);
    try {
      const slots = await get(`/student/classes/${c.id}/available-reschedule-slots`);
      setRescheduleSlots(slots || []);
    } catch (err: any) {
      setRescheduleError(err.message || 'Could not load available reschedule dates.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingClass || !selectedTargetSlotId) return;
    setIsSubmittingReschedule(true);
    setRescheduleError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('pr_access_token') : null;
      const res = await fetch(`${API}/student/classes/${reschedulingClass.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_occurrence_id: selectedTargetSlotId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not reschedule class.');
      setCancellationNotice({
        type: 'success',
        message: `Class "${reschedulingClass.session_name}" successfully rescheduled! Your session credit has been transferred to the new date.`,
      });
      setReschedulingClass(null);
      await load();
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to reschedule.');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  useEffect(() => {
    setPassPage(1);
  }, [passTab, activePassGroup, passSearch, passStudio]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teacherParam = params.get('teacher') || params.get('code');
    if (teacherParam) {
      setTeacherQuery(teacherParam);
      void lookupTeacher(teacherParam);
      setTab('teacher');
    } else if (params.has('studio') || params.has('buy')) {
      setTab('explore');
    } else if (params.get('tab') === 'attendance') {
      setTab('attendance');
    } else if (params.get('tab') === 'support') {
      setTab('support');
    } else if (params.get('tab') === 'teacher') {
      setTab('teacher');
    }
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, [lookupTeacher]);

  // Attendance loading
  useEffect(() => {
    if (tab !== 'attendance') return;
    const controller = new AbortController();
    setAttendanceLoading(true);
    setAttendanceError('');
    const query = new URLSearchParams({ month: attendanceMonth });
    if (attendanceStudio !== 'ALL') query.set('studio_id', attendanceStudio);
    void get(`/student/attendance?${query.toString()}`, { signal: controller.signal })
      .then((data: CalendarSessionEvent[]) => setAttendanceEvents(data || []))
      .catch((err) => {
        if (!controller.signal.aborted) setAttendanceError(err instanceof Error ? err.message : 'Could not load attendance.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setAttendanceLoading(false);
      });
    return () => controller.abort();
  }, [tab, attendanceMonth, attendanceStudio, get]);

  // Support Tickets loading
  const fetchStudentTickets = useCallback(async () => {
    setSupportLoading(true);
    setSupportError('');
    try {
      const tickets = await get('/student/support-tickets');
      setSupportTickets(tickets || []);
    } catch (err: any) {
      setSupportError(err.message || 'Could not load support tickets.');
    } finally {
      setSupportLoading(false);
    }
  }, [get]);

  useEffect(() => {
    if (tab === 'support') {
      void fetchStudentTickets();
    }
  }, [tab, fetchStudentTickets]);

  const openStudentTicketDetail = async (ticketId: string) => {
    try {
      const t = await get(`/student/support-tickets/${ticketId}`);
      setSelectedSupportTicket(t);
    } catch (err: any) {
      setError(err.message || 'Could not open ticket thread.');
    }
  };

  const sendStudentReply = async (ticketId: string) => {
    if (!supportReplyMessage.trim()) return;
    setIsSendingSupportReply(true);
    try {
      const response = await fetch(`${API}/student/support-tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pr_access_token')}`,
        },
        body: JSON.stringify({ message: supportReplyMessage.trim() }),
      });
      if (!response.ok) throw new Error('Could not send message.');
      setSupportReplyMessage('');
      await openStudentTicketDetail(ticketId);
      await fetchStudentTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsSendingSupportReply(false);
    }
  };

  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketStudioId || !newTicketSubject.trim() || !newTicketMessage.trim()) return;
    setIsSubmittingNewTicket(true);
    try {
      const response = await fetch(`${API}/student/support-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('pr_access_token')}`,
        },
        body: JSON.stringify({
          organization_id: newTicketStudioId,
          subject: newTicketSubject.trim(),
          category: newTicketCategory,
          initial_message: newTicketMessage.trim(),
        }),
      });
      if (!response.ok) throw new Error('Failed to create ticket.');
      setIsNewTicketModalOpen(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
      await fetchStudentTickets();
    } catch (err: any) {
      setError(err.message || 'Failed to submit support question.');
    } finally {
      setIsSubmittingNewTicket(false);
    }
  };

  // Studio Explore catalog loading
  useEffect(() => {
    if (tab !== 'explore' || !studio) return;
    const controller = new AbortController();
    setCatalog(null);
    setCatalogError('');
    setCatalogLoading(true);
    void fetch(`${API}/public/organizations/${encodeURIComponent(studio)}`, { cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load this studio. Please try again.');
        return res.json();
      })
      .then((data) => setCatalog(data))
      .catch((err) => {
        if (!controller.signal.aborted) setCatalogError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, [studio, tab, retry]);

  function chooseStudio(slug: string) {
    setStudio(slug);
    window.history.replaceState(null, '', `/student?studio=${encodeURIComponent(slug)}`);
  }

  function exploreStudio(slug: string) {
    chooseStudio(slug);
    setTab('explore');
  }

  // Group enrollments by purchase pass
  const groups = Object.values(
    enrollments.reduce<Record<string, Enrollment[]>>((all, e) => {
      (all[e.purchase_id || e.id] ||= []).push(e);
      return all;
    }, {})
  );

  const filteredGroups = groups.filter((group) => {
    const e = group[0];
    const isExhausted = e.total_sessions != null && e.sessions_attended >= e.total_sessions;
    const isExpired = e.valid_until ? new Date(e.valid_until).getTime() < now : false;
    const isActive = e.status === 'ACTIVE' && !isExhausted && !isExpired;

    if (passTab === 'ACTIVE') {
      if (!isActive) return false;
      if (activePassGroup === 'EXPIRING') {
        const daysRemaining = e.valid_until ? (new Date(e.valid_until).getTime() - now) / (1000 * 86400) : 999;
        const creditsRemaining = e.total_sessions != null ? e.total_sessions - e.sessions_attended : 999;
        if (daysRemaining > 14 && creditsRemaining > 2) return false;
      } else if (activePassGroup === 'RECENT') {
        if (!e.sessions_attended || e.sessions_attended <= 0) return false;
      } else if (activePassGroup === 'UNLIMITED') {
        if (e.total_sessions != null) return false;
      }
    } else {
      if (isActive) return false;
    }

    if (passStudio !== 'ALL' && e.organization_slug !== passStudio) return false;

    if (passSearch.trim()) {
      const q = passSearch.toLowerCase().trim();
      const matchPass = (e.purchase_name || '').toLowerCase().includes(q);
      const matchOrg = (e.organization_name || '').toLowerCase().includes(q);
      const matchClasses = group.some((c) => (c.session_name || '').toLowerCase().includes(q));
      if (!matchPass && !matchOrg && !matchClasses) return false;
    }
    return true;
  });

  const totalPassPages = Math.max(1, Math.ceil(filteredGroups.length / PASSES_PER_PAGE));
  const paginatedPassGroups = filteredGroups.slice((passPage - 1) * PASSES_PER_PAGE, passPage * PASSES_PER_PAGE);

  const scheduled = classes.filter((c) => new Date(c.end_at).getTime() > now);
  const nextClass = scheduled[0];
  const isNewStudent = !loading && enrollments.length === 0 && classes.length === 0;


  return (
    <div className="min-h-screen bg-[#F4F7F4] text-[#133623]">
      <header className="border-b border-[#E1E9E2] bg-white">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <BrandLogo size={36} />
            </Link>
            <div>
              <p className="font-serif font-bold">Student Dashboard</p>
              <p className="text-sm text-slate-500">{name || 'Your space to learn'}</p>
            </div>
          </div>
          <button
            className="text-sm font-semibold hover:underline"
            onClick={() => {
              localStorage.removeItem('pr_access_token');
              localStorage.removeItem('pr_user');
              router.push('/login');
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto p-5 sm:p-10 space-y-8">
        {error && (
          <div role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button className="underline font-bold ml-3" onClick={() => void load()}>
              Try again
            </button>
          </div>
        )}

        {cancellationNotice && (
          <div
            role="alert"
            className={`p-4 rounded-2xl flex items-start justify-between gap-3 ${
              cancellationNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {cancellationNotice.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{cancellationNotice.message}</span>
            </div>
            <button
              onClick={() => setCancellationNotice(null)}
              className="text-xs font-bold underline opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* HERO SECTION */}
        {isNewStudent ? (
          /* Prominent Teacher-First Discovery Hero for New Students */
          <section
            aria-label="Find your teacher"
            className="bg-gradient-to-br from-[#0C2417] via-[#1b4332] to-[#2D7A58] text-white p-6 sm:p-10 rounded-3xl shadow-lg border border-[#2D7A58] space-y-6"
          >
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#b7e4c7]">
                <User size={14} /> Teacher Discovery
              </span>
              <h1 className="text-white font-serif text-3xl sm:text-5xl font-bold tracking-tight">
                Find your teacher
              </h1>
              <p className="text-[#e8f5e9] text-sm sm:text-base max-w-2xl leading-relaxed">
                Connect directly with your teacher using their 8-digit teacher code or full name. Discover their published classes and studio passes across all studio locations.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setTab('teacher');
                void lookupTeacher(teacherQuery);
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter 8-digit code (e.g. 11000001) or teacher name…"
                  value={teacherQuery}
                  onChange={(e) => setTeacherQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#81A882] shadow-sm font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={teacherLoading || !teacherQuery.trim()}
                className="px-6 py-3 bg-[#b7e4c7] hover:bg-white text-[#0C2417] rounded-2xl font-bold text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {teacherLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Searching…</span>
                  </>
                ) : (
                  <>
                    <span>Find Teacher</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#b7e4c7]">
              <span>Sample Teacher:</span>
              <button
                type="button"
                onClick={() => {
                  setTeacherQuery('11000001');
                  setTab('teacher');
                  void lookupTeacher('11000001');
                }}
                className="underline font-bold text-white hover:text-[#b7e4c7]"
              >
                11000001 (Ananya Sen)
              </button>
              <span className="text-white/40">·</span>
            </div>
          </section>
        ) : (
          /* Next Class Hero for Returning Students */
          <section
            aria-label="Your next class"
            className="relative bg-gradient-to-br from-[#0C2417] to-[#1b4332] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#2D7A58]"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-[#b7e4c7]">
              <Video size={16} />
              {nextClass && new Date(nextClass.start_at).getTime() <= now ? 'Live now' : 'Your next class'}
            </span>
            {nextClass && <WhatsAppNotificationHint kind="reminder" />}
            <h1 className="text-white font-serif text-3xl sm:text-4xl mt-4">
              {loading ? 'Finding your next class…' : nextClass?.session_name || 'Welcome to your learning space'}
            </h1>
            {nextClass ? (
              <>
                <p className="text-[#e8f5e9] mt-3">
                  {date(nextClass.start_at)} · {nextClass.organization_name}
                </p>
                <p className="text-[#b7e4c7] mt-1 text-sm">With {nextClass.instructor_name}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <MeetingAction endAt={nextClass.end_at} load={async () => (await get(`/student/classes/${nextClass.id}/meeting-url`)).meeting_url} onError={setError} />
                  <button
                    onClick={() => void openRescheduleModal(nextClass)}
                    className="text-xs font-semibold text-[#b7e4c7] hover:text-white hover:underline transition px-3 py-2"
                  >
                    Reschedule
                  </button>
                  <span className="text-white/40">·</span>
                  <button
                    onClick={() => void cancelBooking(nextClass.id, nextClass.session_name, nextClass.start_at)}
                    disabled={cancellingId === nextClass.id}
                    className="text-xs font-semibold text-rose-300 hover:text-rose-100 hover:underline transition px-3 py-2"
                  >
                    {cancellingId === nextClass.id ? 'Cancelling…' : 'Cancel booking'}
                  </button>
                </div>
              </>
            ) : (
              !loading && (
                <>
                  <p className="text-[#e8f5e9] mt-3">
                    No classes are scheduled in the next 30 days. Your assigned classes and passes are below.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setTab('teacher')}
                      className="inline-flex items-center gap-2 bg-white text-[#0C2417] rounded-xl px-6 py-3 font-bold shadow-md"
                    >
                      Find your teacher <ArrowRight size={18} />
                    </button>
                  </div>
                </>
              )
            )}
          </section>
        )}

        {/* Dashboard Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Student dashboard sections"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 border-b border-[#CEDECF]"
        >
          {([
            ['classes', 'My classes & passes'],
            ['teacher', 'Find your teacher'],
            ['attendance', 'Attendance tracker'],
            ['support', 'Studio Support'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              id={`${value}-tab`}
              role="tab"
              aria-selected={tab === value}
              aria-controls={`${value}-panel`}
              onClick={() => {
                setTab(value);
                if (value === 'classes') window.history.replaceState(null, '', '/student');
                else window.history.replaceState(null, '', `/student?tab=${value}`);
              }}
              className={`pb-4 text-xs sm:text-sm font-bold border-b-2 transition ${
                tab === value
                  ? 'border-[#133623] text-[#0C2417]'
                  : 'border-transparent text-slate-500 hover:text-[#133623]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: CLASSES & PASSES */}
        {loading ? (
          <p role="status" className="p-8 text-center text-slate-500">
            Loading your dashboard…
          </p>
        ) : tab === 'classes' ? (
          <div id="classes-panel" role="tabpanel" aria-labelledby="classes-tab" className="space-y-8">
            <section aria-label="Upcoming classes">
              <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
                <CalendarDays size={22} />
                Upcoming classes
              </h2>
              <div className="bg-white rounded-3xl border border-[#CEDECF] divide-y divide-[#E1E9E2] shadow-xs">
                {scheduled.map((c) => (
                  <article key={c.id} className="relative p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-[#0C2417]">{c.session_name}</h3><CollapsedDescription text={c.description} />
                      <WhatsAppNotificationHint kind="reminder" />
                      <p className="text-sm text-slate-500 mt-1">
                        {c.organization_name} · Teacher: {c.instructor_name}
                      </p>
                      <p className="text-sm mt-2 text-[#0C2417] font-medium">{date(c.start_at)}</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <MeetingAction endAt={c.end_at} load={async () => (await get(`/student/classes/${c.id}/meeting-url`)).meeting_url} onError={setError} />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => void openRescheduleModal(c)}
                          className="text-xs font-semibold text-[#133623] hover:underline transition"
                        >
                          Reschedule
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          disabled={cancellingId === c.id}
                          onClick={() => void cancelBooking(c.id, c.session_name, c.start_at)}
                          className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline transition"
                        >
                          {cancellingId === c.id ? 'Cancelling…' : 'Cancel booking'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {!scheduled.length && (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <p className="font-semibold text-[#0C2417]">No upcoming classes scheduled.</p>
                    <p className="text-xs">
                      When your studio schedules your next sessions, they will appear here with live join buttons.
                    </p>
                    <button
                      onClick={() => setTab('teacher')}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#133623] underline"
                    >
                      Find your teacher to discover available classes <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Passes Organization Section: Active vs History */}
            <section aria-label="My memberships and passes" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-serif text-2xl">My passes & memberships</h2>

                {/* Active vs History Tabs */}
                <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-2xl border border-[#CEDECF] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setPassTab('ACTIVE');
                      setActivePassGroup('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      passTab === 'ACTIVE'
                        ? 'bg-[#133623] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0C2417] hover:bg-white'
                    }`}
                  >
                    Active Passes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassTab('HISTORY')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      passTab === 'HISTORY'
                        ? 'bg-[#133623] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#0C2417] hover:bg-white'
                    }`}
                  >
                    Past & Expired
                  </button>
                </div>
              </div>

              {/* Active Pass Grouping Sub-pills: Expiring Soon, Recently Used, Unlimited */}
              {passTab === 'ACTIVE' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Quick Filter:</span>
                  {(
                    [
                      ['ALL', 'All Active'],
                      ['EXPIRING', 'Expiring Soon'],
                      ['RECENT', 'Recently Used'],
                      ['UNLIMITED', 'Unlimited Passes'],
                    ] as const
                  ).map(([groupKey, label]) => (
                    <button
                      key={groupKey}
                      type="button"
                      onClick={() => setActivePassGroup(groupKey)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                        activePassGroup === groupKey
                          ? 'bg-[#133623] text-white border-[#133623]'
                          : 'bg-white text-slate-700 border-[#CEDECF] hover:bg-[#F9FAF9]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Pass Filters: Search & Studio */}
              <div className="bg-white p-4 rounded-2xl border border-[#CEDECF] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by pass, class, or studio name…"
                    value={passSearch}
                    onChange={(e) => setPassSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#CEDECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white text-slate-900"
                  />
                </div>

                {studios.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Studio:</span>
                    <select
                      value={passStudio}
                      onChange={(e) => setPassStudio(e.target.value)}
                      className="border border-[#CEDECF] px-3 py-2 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
                    >
                      <option value="ALL">All Studios</option>
                      {studios.map((s) => (
                        <option key={s.id} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {paginatedPassGroups.map((group) => {
                  const e = group[0];
                  const isExhausted = e.total_sessions != null && e.sessions_attended >= e.total_sessions;
                  const isExpired = e.valid_until ? new Date(e.valid_until).getTime() < now : false;

                  return (
                    <article
                      key={e.purchase_id || e.id}
                      className="bg-white rounded-3xl p-6 border border-[#CEDECF] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F0E9] text-[#133623] border border-[#CEDECF]">
                          {e.organization_name}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            e.status === 'ACTIVE' && !isExhausted && !isExpired
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isExhausted ? 'Exhausted' : isExpired ? 'Expired' : e.status}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl text-[#0C2417]">{e.purchase_name || e.session_name}</h3><CollapsedDescription text={e.description} />

                      {group.some((c) => c.amount_paid != null) && (
                        <p className="text-sm font-semibold text-slate-700">
                          Paid{' '}
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: e.currency || 'INR' }).format(
                            group.reduce((sum, c) => sum + (c.amount_paid ?? 0), 0)
                          )}
                        </p>
                      )}

                      <p className="text-sm font-medium">
                        {e.total_sessions != null
                          ? `${Math.max(0, e.total_sessions - e.sessions_attended)} of ${e.total_sessions} sessions remaining`
                          : 'No session limit'}
                      </p>

                      {e.sessions_restored != null && e.sessions_restored > 0 && (
                        <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>{e.sessions_restored} session{e.sessions_restored > 1 ? 's' : ''} restored from cancellation</span>
                        </p>
                      )}

                      <p className="text-xs text-slate-500">
                        {e.valid_until ? `Valid until ${new Date(e.valid_until).toLocaleDateString()}` : 'No expiry date'}
                      </p>

                      <div className="border-t border-[#E1E9E2] pt-2">
                        <p className="text-xs font-semibold text-slate-700 mb-1">Included Classes:</p>
                        <ul className="text-xs space-y-1 text-slate-600">
                          {group.map((c) => (
                            <li key={c.id}>• {c.session_name}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E1E9E2]">


                        <button
                          type="button"
                          onClick={() => {
                            if (!e.tier_id) { exploreStudio(e.organization_slug); return; }
                            setSelectedOffering({
                              id: e.tier_id || e.session_id || e.id,
                              kind: e.tier_id ? 'pass' : 'class',
                              name: e.purchase_name || e.session_name,
                              price: e.amount_paid || 0,
                              currency: e.currency || 'INR',
                              total_classes: e.total_sessions || undefined,
                              validity_days: 30,
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#133623] hover:bg-[#0C2417] text-white rounded-xl text-xs font-bold transition shadow-xs"
                        >
                          <RefreshCw size={12} />
                          <span>Renew Pass</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
                {!filteredGroups.length && (
                  <p className="bg-white rounded-2xl p-6 border border-[#CEDECF] text-slate-500 text-sm md:col-span-2">
                    {passTab === 'ACTIVE'
                      ? 'No active passes found matching your filters.'
                      : 'No past or expired passes found.'}
                  </p>
                )}

                {/* Passes Pagination Controls */}
                {totalPassPages > 1 && (
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#CEDECF] text-xs font-medium md:col-span-2">
                    <button
                      type="button"
                      disabled={passPage <= 1}
                      onClick={() => setPassPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-xl border border-[#CEDECF] hover:bg-[#F9FAF9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous</span>
                    </button>
                    <span className="text-slate-600">
                      Page {passPage} of {totalPassPages} · {filteredGroups.length} total pass{filteredGroups.length === 1 ? '' : 'es'}
                    </span>
                    <button
                      type="button"
                      disabled={passPage >= totalPassPages}
                      onClick={() => setPassPage((p) => Math.min(totalPassPages, p + 1))}
                      className="px-3 py-1.5 rounded-xl border border-[#CEDECF] hover:bg-[#F9FAF9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                    >
                      <span>Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : tab === 'teacher' ? (
          /* TAB 2: TEACHER-FIRST DISCOVERY */
          <section id="teacher-panel" role="tabpanel" aria-labelledby="teacher-tab" className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#CEDECF] shadow-sm space-y-4">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#0C2417]">Find your teacher</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Enter your teacher’s unique 8-digit teacher code, teacher name, or search below to explore their public classes and passes across all connected studios.
                </p>
              </div>

              <form onSubmit={handleTeacherSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by 8-digit teacher code (e.g. 11000001) or teacher name…"
                    value={teacherQuery}
                    onChange={(e) => setTeacherQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CEDECF] text-xs sm:text-sm bg-[#F9FAF9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#133623]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={teacherLoading || !teacherQuery.trim()}
                  className="px-6 py-2.5 bg-[#133623] hover:bg-[#0C2417] text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {teacherLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching…</span>
                    </>
                  ) : (
                    <span>Search</span>
                  )}
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Quick lookup test codes:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTeacherQuery('11000001');
                    void lookupTeacher('11000001');
                  }}
                  className="underline font-bold text-[#133623]"
                >
                  11000001 (Ananya Sen)
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setTeacherQuery('Ananya Sen');
                    void lookupTeacher('Ananya Sen');
                  }}
                  className="underline font-bold text-[#133623]"
                >
                  By name: &quot;Ananya Sen&quot;
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setTeacherQuery('99999999');
                    void lookupTeacher('99999999');
                  }}
                  className="underline text-slate-500 hover:text-red-700"
                >
                  Invalid Code test
                </button>
                <span className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setTeacherQuery('10000004');
                    void lookupTeacher('10000004');
                  }}
                  className="underline text-slate-500 hover:text-amber-700"
                >
                  Inactive Teacher test
                </button>
              </div>
            </div>

            {teacherError && (
              <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs sm:text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span>{teacherError}</span>
              </div>
            )}

            {teacherResult && (
              <div className="space-y-6">
                {/* Teacher Public Identity Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#CEDECF] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#E8F0E9] text-[#133623] flex items-center justify-center font-bold text-2xl uppercase border border-[#CEDECF]">
                      {teacherResult.teacher.avatar_url ? (
                        <img
                          src={teacherResult.teacher.avatar_url}
                          alt={teacherResult.teacher.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : (
                        teacherResult.teacher.name.charAt(0)
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-serif text-2xl font-bold text-[#0C2417]">
                          {teacherResult.teacher.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Teacher
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {teacherResult.teacher.title || 'Teacher & Practitioner'}
                      </p>
                      {teacherResult.teacher.bio && (
                        <p className="text-xs text-slate-600 max-w-xl line-clamp-2 pt-1">
                          {teacherResult.teacher.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teacher Code and Share Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    {teacherResult.teacher.teacher_code && (
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(teacherResult.teacher.teacher_code);
                            setCopiedCode(true);
                            setTimeout(() => setCopiedCode(false), 2000);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#CEDECF] bg-[#FAF7F2] hover:bg-[#E8F0E9] text-xs font-bold text-[#133623] transition"
                        title="Copy 8-digit teacher code"
                      >
                        {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#133623]" />}
                        <span>{copiedCode ? 'Code Copied!' : `Code: ${teacherResult.teacher.teacher_code}`}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard) {
                          const code = teacherResult.teacher.teacher_code;
                          const url = `${window.location.origin}/student?teacher=${encodeURIComponent(code || teacherResult.teacher.name)}`;
                          navigator.clipboard.writeText(url);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#133623] hover:bg-[#0C2417] text-xs font-bold text-white transition shadow-xs"
                      title="Share public profile link"
                    >
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4 text-white" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
                    </button>
                  </div>
                </div>

                {/* Offerings Grouped by Studio */}
                <div className="space-y-8">
                  <div className="border-b border-[#CEDECF] pb-2">
                    <h3 className="font-serif text-xl font-bold text-[#0C2417]">
                      Published Offerings by Studio
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Showing only offerings taught by {teacherResult.teacher.name}, organized by studio.
                    </p>
                  </div>

                  {teacherResult.studios.map((affiliation) => (
                    <TeacherAffiliationCard
                      key={affiliation.studio_id}
                      affiliation={affiliation}
                      onSelectOffering={offering => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('teacher', teacherResult.teacher.teacher_code);
                        url.searchParams.set('buy', offering.id);
                        url.searchParams.set('kind', offering.kind);
                        if (offering.package_id) url.searchParams.set('package', offering.package_id); else url.searchParams.delete('package');
                        window.history.replaceState(null, '', url.pathname + url.search);
                        setSelectedOffering(offering);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : tab === 'attendance' ? (
          /* TAB 3: ATTENDANCE TRACKER */
          <div id="attendance-panel" role="tabpanel" aria-labelledby="attendance-tab" className="space-y-6">
            {studios.length > 1 && (
              <div className="flex items-center justify-end gap-2 bg-white p-3 rounded-2xl border border-[#CEDECF] shadow-xs text-xs">
                <span className="text-slate-500 font-medium">Filter by Studio:</span>
                <select
                  value={attendanceStudio}
                  onChange={(e) => setAttendanceStudio(e.target.value)}
                  className="border border-[#CEDECF] px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#133623]"
                >
                  <option value="ALL">All Connected Studios</option>
                  {studios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {attendanceError && (
              <div role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl">
                {attendanceError}
              </div>
            )}

            <AttendanceCalendar
              events={attendanceEvents}
              readOnly
              personLabel={name || 'Student'}
              timezone={studios.find(studio => studio.id === attendanceStudio)?.timezone || studios[0]?.timezone}
              onJoinClass={async event => (await get(`/student/classes/${event.occurrenceId}/meeting-url`)).meeting_url}
              onToast={setError}
              loading={attendanceLoading}
              onMonthChange={(m) => setAttendanceMonth(m)}
            />
          </div>
        ) : tab === 'explore' ? (
          /* TAB 4: EXPLORE STUDIOS */
          <section id="explore-panel" role="tabpanel" aria-labelledby="explore-tab" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl">Find your next class</h2>
                <p className="text-slate-500 mt-2">Choose a studio to browse its classes and passes.</p>
              </div>
              {studios.length > 0 && (
                <div className="w-full sm:w-72">
                  <label htmlFor="explore-studio" className="block text-sm font-semibold mb-2">
                    Studio
                  </label>
                  <select
                    id="explore-studio"
                    value={studio}
                    onChange={(e) => chooseStudio(e.target.value)}
                    className="w-full rounded-xl border border-[#CEDECF] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#133623]"
                  >
                    {studios.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {!studios.length ? (
              <p className="rounded-2xl border border-[#CEDECF] bg-white p-6">
                You aren’t connected to a studio yet. Visit a studio’s website to explore its classes, or ask your teacher for their studio link.
              </p>
            ) : catalogLoading ? (
              <p role="status">Loading studio classes and passes…</p>
            ) : catalogError ? (
              <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
                {catalogError}{' '}
                <button className="underline ml-2" onClick={() => setRetry((n) => n + 1)}>
                  Try again
                </button>
              </p>
            ) : (
              catalog &&
              catalog.organization.slug === studio && (
                <>
                  <Link className="inline-flex text-sm underline" href={`/${catalog.organization.slug}`}>
                    Visit {catalog.organization.name} website
                  </Link>
                  <StudioExplore key={catalog.organization.slug} data={catalog} embedded />
                </>
              )
            )}
          </section>
        ) : (
          /* TAB 5: STUDIO SUPPORT & QUERIES */
          <section id="support-panel" role="tabpanel" aria-labelledby="support-tab" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl font-bold">Studio Support & Questions</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Send queries directly to your studio owners and teachers, and view reply history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (studios.length > 0) setNewTicketStudioId(studios[0].id);
                  setIsNewTicketModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#133623] hover:bg-[#0C2417] text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                <Plus size={16} />
                <span>Ask a Question</span>
              </button>
            </div>

            {supportError && (
              <div role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl">
                {supportError}
              </div>
            )}

            {supportLoading ? (
              <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-3xl border border-[#CEDECF]">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#2D7A58] mb-2" />
                <p>Loading your support tickets…</p>
              </div>
            ) : supportTickets.length === 0 ? (
              <div className="p-10 bg-white rounded-3xl border border-[#CEDECF] text-center text-slate-500 text-sm space-y-2">
                <MessageSquare className="h-8 w-8 text-[#81A882] mx-auto mb-1" />
                <p className="font-semibold text-[#0C2417]">No support questions yet.</p>
                <p className="text-xs text-slate-400">
                  Have a question about class scheduling, membership passes, or live sessions? Click &ldquo;Ask a Question&rdquo; to contact your studio.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {supportTickets.map((t) => (
                  <article
                    key={t.id}
                    className="p-6 bg-white rounded-3xl border border-[#CEDECF] shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F0E9] text-[#133623] border border-[#CEDECF]">
                          {t.organization_name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {t.status === 'IN_PROGRESS' ? 'In Progress' : t.status}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-xl text-[#0C2417]">{t.subject}</h3>

                      {t.latest_message && (
                        <p className="text-xs text-[#263328] bg-[#F4F7F4] p-3 rounded-xl border border-[#E1E9E2]">
                          <span className="font-semibold text-slate-700">{t.latest_message_sender || 'Sender'}: </span>
                          {t.latest_message}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400">
                        Updated {new Date(t.updated_at).toLocaleString()} · {t.message_count}{' '}
                        {t.message_count === 1 ? 'message' : 'messages'}
                      </p>
                    </div>

                    <button
                      onClick={() => void openStudentTicketDetail(t.id)}
                      className="px-4 py-2 bg-[#133623] text-white rounded-xl text-xs font-bold hover:bg-[#0C2417] transition shrink-0"
                    >
                      View Conversation
                    </button>
                  </article>
                ))}
              </div>
            )}

            {/* Conversation Thread Modal */}
            {selectedSupportTicket && (
              <Modal footer={<div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSupportTicket(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        disabled={isSendingSupportReply || !supportReplyMessage.trim()}
                        onClick={() => void sendStudentReply(selectedSupportTicket.id)}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#133623] hover:bg-[#0C2417] text-white transition disabled:opacity-50"
                      >
                        {isSendingSupportReply ? 'Sending…' : 'Send Message'}
                      </button>
                    </div>}
                title={`Question: ${selectedSupportTicket.subject}`}
                onClose={() => setSelectedSupportTicket(null)}
              >
                <div className="p-6 max-w-2xl w-full space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E1E9E2]">
                    <span className="text-xs text-slate-500">Studio: {selectedSupportTicket.organization_name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedSupportTicket.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {selectedSupportTicket.status}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#CEDECF]">
                    {selectedSupportTicket.messages &&
                      selectedSupportTicket.messages.map((m: any) => {
                        const isMe = m.sender_role === 'STUDENT';
                        return (
                          <div
                            key={m.id}
                            className={`p-3 rounded-2xl text-xs space-y-1 max-w-[85%] ${
                              isMe
                                ? 'ml-auto bg-[#133623] text-white'
                                : 'mr-auto bg-white text-slate-800 border border-[#CEDECF]'
                            }`}
                          >
                            <div
                              className={`flex items-center justify-between gap-2 text-[10px] ${
                                isMe ? 'text-emerald-200' : 'text-slate-500'
                              }`}
                            >
                              <span className="font-bold">{isMe ? 'You' : m.sender_name}</span>
                              <span>
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{m.message}</p>
                          </div>
                        );
                      })}
                  </div>

                  <div className="space-y-2 pt-2">
                    <label htmlFor="student-reply" className="block text-xs font-bold text-slate-700">
                      Reply to Studio:
                    </label>
                    <textarea
                      id="student-reply"
                      rows={3}
                      value={supportReplyMessage}
                      onChange={(e) => setSupportReplyMessage(e.target.value)}
                      placeholder="Type your message…"
                      className="w-full p-3 rounded-xl border border-[#CEDECF] text-xs focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white text-slate-900"
                    />

                  </div>
                </div>
              </Modal>
            )}

            {/* New Support Ticket Modal */}
            {isNewTicketModalOpen && (
              <Modal footer={<div className="flex justify-end gap-2 pt-2 border-t border-[#E1E9E2]">
                    <button
                      type="button"
                      onClick={() => setIsNewTicketModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button form="modal-src-app--student--student-page-tsx-2"
                      type="submit"
                      disabled={isSubmittingNewTicket || !newTicketSubject.trim() || !newTicketMessage.trim()}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-[#133623] hover:bg-[#0C2417] text-white transition disabled:opacity-50"
                    >
                      {isSubmittingNewTicket ? 'Submitting…' : 'Submit Question'}
                    </button>
                  </div>} title="Ask your studio a question" onClose={() => setIsNewTicketModalOpen(false)}>
                <form id="modal-src-app--student--student-page-tsx-2" onSubmit={handleCreateNewTicket} className="p-6 max-w-lg w-full space-y-4">
                  <div>
                    <label htmlFor="ticket-studio" className="block text-xs font-bold text-slate-700 mb-1">
                      Select Studio *
                    </label>
                    <select
                      id="ticket-studio"
                      required
                      value={newTicketStudioId}
                      onChange={(e) => setNewTicketStudioId(e.target.value)}
                      className="w-full p-2.5 border border-[#CEDECF] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    >
                      {studios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ticket-subject" className="block text-xs font-bold text-slate-700 mb-1">
                      Subject *
                    </label>
                    <input
                      id="ticket-subject"
                      required
                      placeholder="e.g. Question about my monthly pass"
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      className="w-full p-2.5 border border-[#CEDECF] rounded-xl text-xs placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="ticket-category" className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      id="ticket-category"
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      className="w-full p-2.5 border border-[#CEDECF] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    >
                      <option value="GENERAL">General Inquiry</option>
                      <option value="MEMBERSHIP">Pass & Membership</option>
                      <option value="CLASS_ACCESS">Live Class & Video Link</option>
                      <option value="ATTENDANCE">Attendance Record</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ticket-msg" className="block text-xs font-bold text-slate-700 mb-1">
                      Your Question or Message *
                    </label>
                    <textarea
                      id="ticket-msg"
                      required
                      rows={4}
                      placeholder="Describe what you need help with…"
                      value={newTicketMessage}
                      onChange={(e) => setNewTicketMessage(e.target.value)}
                      className="w-full p-2.5 border border-[#CEDECF] rounded-xl text-xs placeholder:text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#133623] bg-white"
                    />
                  </div>


                </form>
              </Modal>
            )}
          </section>
        )}
      </main>

      {/* Reschedule Modal */}
      {reschedulingClass && (
        <Modal footer={<div className="flex justify-end gap-2 pt-3 border-t border-[#E1E9E2]">
              <button
                type="button"
                onClick={() => setReschedulingClass(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              {rescheduleSlots.length > 0 && (
                <button
                  type="button"
                  disabled={!selectedTargetSlotId || isSubmittingReschedule}
                  onClick={() => void handleConfirmReschedule()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#133623] hover:bg-[#0C2417] text-white transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingReschedule && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Reschedule</span>
                </button>
              )}
            </div>}
          title={`Reschedule "${reschedulingClass.session_name}"`}
          onClose={() => {
            setReschedulingClass(null);
            setRescheduleSlots([]);
            setSelectedTargetSlotId('');
            setRescheduleError('');
          }}
        >
          <div className="p-6 space-y-4 text-xs">
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#CEDECF] space-y-1">
              <p className="font-semibold text-slate-800">Original Scheduled Slot:</p>
              <p className="text-slate-600">
                {date(reschedulingClass.start_at)} · {reschedulingClass.organization_name}
              </p>
              <p className="text-[11px] text-slate-500">
                Studio Policy: Free rescheduling is allowed up to 2 hours before scheduled class start time. Your session credit will be transferred to your new date.
              </p>
            </div>

            {rescheduleLoading ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#133623]" />
                <span>Searching for available alternative class dates…</span>
              </div>
            ) : rescheduleError ? (
              <div role="alert" className="p-3 bg-red-50 text-red-800 rounded-xl">
                {rescheduleError}
              </div>
            ) : rescheduleSlots.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-[#F9FAF9] rounded-2xl border border-[#E1E9E2] space-y-2">
                <p className="font-semibold text-slate-800">No alternative dates scheduled</p>
                <p className="text-[11px]">
                  There are currently no other scheduled upcoming sessions for this offering in the next 30 days.
                </p>
                <p className="text-[11px] text-slate-400">
                  You can still cancel this booking at least 2 hours prior to keep your session credit on your pass.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-bold text-slate-800">Select your preferred new slot:</p>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {rescheduleSlots.map((slot) => {
                    const isSelected = selectedTargetSlotId === slot.id;
                    return (
                      <label
                        key={slot.id}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'border-[#133623] bg-[#E8F0E9] ring-1 ring-[#133623]'
                            : 'border-[#CEDECF] bg-white hover:bg-[#F9FAF9]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="reschedule_target_slot"
                            value={slot.id}
                            checked={isSelected}
                            onChange={() => setSelectedTargetSlotId(slot.id)}
                            className="text-[#133623] focus:ring-[#133623]"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{date(slot.start_at)}</p>
                            <p className="text-[11px] text-slate-500">Instructor: {slot.instructor_name}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Selected
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}


          </div>
        </Modal>
      )}

      {/* Global Checkout Modal */}
      {selectedOffering && (
        <StoreCheckout
          offering={selectedOffering}
          onClose={() => {
            setSelectedOffering(null);
            const url = new URL(window.location.href);
            ['buy', 'kind', 'package'].forEach(key => url.searchParams.delete(key));
            window.history.replaceState(null, '', url.pathname + url.search);
            void load();
          }}
        />
      )}
    </div>
  );
}
