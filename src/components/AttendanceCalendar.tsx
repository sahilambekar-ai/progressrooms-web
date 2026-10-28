'use client';
import { MeetingAction, type MeetingLink } from './MeetingAction';
import { Modal } from './Modal';
import { studioToday } from '@/lib/meeting-window';
import { CollapsedDescription } from './RichDescription';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ChevronDown, Pencil, Loader2, CalendarDays } from 'lucide-react';
import { WhatsAppNotificationHint } from '@/components/WhatsAppNotificationHint';

export type CalendarAttendanceStatus = 'PRESENT' | 'ABSENT' | 'SCHEDULED' | 'EXCUSED';
export interface CalendarSessionEvent {
  id: string;
  occurrenceId?: string;
  enrollmentId?: string;
  date: string;
  time?: string;
  startAt?: string;
  endAt?: string;
  meetingAvailable?: boolean;
  meetingUrl?: string | null;
  sessionTitle: string;
  description?: string | null;
  studentName?: string;
  studentEmail?: string;
  teacherName?: string;
  organizationId?: string;
  organizationName?: string;
  organizationSlug?: string;
  status: CalendarAttendanceStatus;
  remarks?: string;
}
interface AttendanceCalendarProps {
  events: CalendarSessionEvent[];
  onUpdateEvents?: (events: CalendarSessionEvent[]) => void;
  onSaveEvent?: (event: CalendarSessionEvent) => Promise<void>;
  onToast: (message: string) => void;
  readOnly?: boolean;
  personLabel?: string;
  view?: 'month' | 'day';
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  onMonthChange?: (month: string) => void;
  loading?: boolean;
  timezone?: string;
  onJoinClass?: (event: CalendarSessionEvent) => Promise<MeetingLink>;
  onSendInvite?: (event: CalendarSessionEvent) => Promise<string>;
  onEditClass?: (event: CalendarSessionEvent) => void;
}
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const statusLabel = (status: CalendarAttendanceStatus) => ({
  PRESENT: 'Present',
  ABSENT: 'Absent',
  EXCUSED: 'Excused',
  SCHEDULED: 'Upcoming',
})[status] || status;

const statusColor = (status: CalendarAttendanceStatus) => {
  switch (status) {
    case 'PRESENT':
      return '#15803d'; // Green
    case 'ABSENT':
      return '#dc2626'; // Red
    case 'SCHEDULED':
      return '#2563eb'; // Blue - Upcoming / Scheduled
    case 'EXCUSED':
      return '#ca8a04'; // Yellow - Excused
    default:
      return '#15803d';
  }
};

export function AttendanceCalendar({ events: sourceEvents, onUpdateEvents, onSaveEvent, onToast, readOnly = false, personLabel = 'Attendance', view = 'month', selectedDate, onSelectDate, onMonthChange, loading, onEditClass, onJoinClass, onSendInvite, timezone = 'Asia/Kolkata' }: AttendanceCalendarProps) {
  const [now, setNow] = useState(() => Date.now());
  // Update attendance and completion when a class starts or ends while the calendar stays open.
  useEffect(() => {
    const nextTransition = Math.min(...sourceEvents.flatMap(event => [event.startAt, event.endAt]).map(value => value ? Date.parse(value) : Infinity).filter(time => time > now));
    if (!Number.isFinite(nextTransition)) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(Math.max(0, nextTransition - Date.now()) + 10, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [sourceEvents, now]);
  const eventTime = (value?: string, fallback = '—') => value && Number.isFinite(Date.parse(value))
    ? new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: timezone }) : fallback;
  const events = sourceEvents.map(event => event.status === 'SCHEDULED' && event.startAt && Date.parse(event.startAt) <= now
    ? { ...event, status: 'PRESENT' as const } : event);
  const [detail, setDetail] = useState<CalendarSessionEvent | null>(null);
  const [date, setDate] = useState(selectedDate || studioToday(timezone));
  useEffect(() => { setDate(studioToday(timezone)); }, [timezone]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const chosen = selectedDate || date;
  const month = chosen.slice(0,7);
  const [pickerMonth, setPickerMonth] = useState(month);
  const dayPickerRef = useRef<HTMLDivElement>(null);
  const selectedDaySectionRef = useRef<HTMLElement>(null);
  const [year, monthNumber] = month.split('-').map(Number);

  useEffect(() => { onMonthChange?.(month); }, [month, onMonthChange]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dayPickerRef.current && !dayPickerRef.current.contains(e.target as Node)) {
        setDayPickerOpen(false);
      }
    }
    if (dayPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dayPickerOpen]);

  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(scrollTimer.current), []);
  const selectDate = (next: string) => {
    clearTimeout(scrollTimer.current);
    setDate(next);
    onSelectDate?.(next);
    scrollTimer.current = setTimeout(() => {
      selectedDaySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };
  const moveMonth = (offset: number) => selectDate(dateKey(new Date(year, monthNumber-1+offset,1)));
  const moveDay = (offset: number) => {
    const current = new Date(chosen + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    selectDate(dateKey(current));
  };

  const toggleDayPicker = () => {
    if (!dayPickerOpen) {
      setPickerMonth(chosen.slice(0, 7));
    }
    setDayPickerOpen((prev) => !prev);
  };

  const [pYear, pMonthNum] = (pickerMonth || month).split('-').map(Number);
  const pDays = new Date(pYear, pMonthNum, 0).getDate();
  const pOffset = new Date(pYear, pMonthNum - 1, 1).getDay();
  const pMonthName = new Date(pYear, pMonthNum - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const movePickerMonth = (delta: number) => {
    const next = new Date(pYear, pMonthNum - 1 + delta, 1);
    setPickerMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const chosenDateObj = new Date(chosen + 'T12:00:00');
  const dayOfWeek = chosenDateObj.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(chosenDateObj);
  monday.setDate(chosenDateObj.getDate() + diffToMonday);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayEvents = events.filter(event => event.date === chosen);
  const monthName = new Date(year,monthNumber-1,1).toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const days = new Date(year,monthNumber,0).getDate();
  const offset = new Date(year,monthNumber-1,1).getDay();

  async function quickUpdateStatus(entry: CalendarSessionEvent, newStatus: CalendarAttendanceStatus) {
    if (readOnly || updatingId || entry.status === newStatus) return;
    setUpdatingId(entry.id);
    try {
      const updated = { ...entry, status: newStatus };
      if (onSaveEvent) await onSaveEvent(updated);
      onUpdateEvents?.(events.map((item) => (item.id === updated.id ? updated : item)));
      onToast(`Attendance marked ${statusLabel(newStatus)}.`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not save attendance.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="card-nature p-3 sm:p-6 space-y-5" aria-label={`${personLabel} attendance calendar`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E9E2] pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-[#0C2417]">{view === 'month' ? monthName : 'Daily attendance'}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {view === 'month' ? 'Select a day to review all attendances below.' : 'Navigate through days or use the week strip below.'}
            {!readOnly && ' Click any attendance entry or button to edit.'}
          </p>
        </div>
        {view === 'month' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => moveMonth(-1)}
              className="h-9 w-9 rounded-xl border border-[#CEDECF] bg-white flex items-center justify-center hover:bg-[#F4F7F4] text-[#0C2417] transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => selectDate(studioToday(timezone))}
              className="rounded-xl border border-[#CEDECF] bg-white px-3.5 py-2 text-xs font-semibold hover:bg-[#F4F7F4] text-[#0C2417] transition"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => moveMonth(1)}
              className="h-9 w-9 rounded-xl border border-[#CEDECF] bg-white flex items-center justify-center hover:bg-[#F4F7F4] text-[#0C2417] transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() => moveDay(-1)}
              className="h-9 w-9 rounded-xl border border-[#CEDECF] bg-white flex items-center justify-center hover:bg-[#F4F7F4] text-[#0C2417] transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => selectDate(studioToday(timezone))}
              className="rounded-xl border border-[#CEDECF] bg-white px-3.5 py-2 text-xs font-semibold hover:bg-[#F4F7F4] text-[#0C2417] transition"
            >
              Today
            </button>
            <button
              type="button"
              aria-label="Next day"
              onClick={() => moveDay(1)}
              className="h-9 w-9 rounded-xl border border-[#CEDECF] bg-white flex items-center justify-center hover:bg-[#F4F7F4] text-[#0C2417] transition"
            >
              <ChevronRight size={16} />
            </button>
            <div className="relative" ref={dayPickerRef}>
              <button
                type="button"
                aria-label="Choose attendance date"
                aria-expanded={dayPickerOpen}
                onClick={toggleDayPicker}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-xs ${
                  dayPickerOpen
                    ? 'border-[#133623] bg-[#E8F0E9] text-[#133623] ring-2 ring-[#133623]'
                    : 'border-[#CEDECF] bg-white text-[#0C2417] hover:bg-[#F4F7F4] hover:border-[#133623]'
                }`}
              >
                <CalendarDays size={14} className="text-[#2D7A58]" />
                <span>
                  {new Date(chosen + 'T12:00:00').toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dayPickerOpen ? 'rotate-180 text-[#133623]' : ''}`} />
              </button>

              {dayPickerOpen && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl border border-[#CEDECF] bg-white p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                  role="dialog"
                  aria-label="Date picker calendar"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E1E9E2]">
                    <span className="text-xs font-bold font-serif text-[#0C2417]">
                      {pMonthName}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Previous month in picker"
                        onClick={() => movePickerMonth(-1)}
                        className="h-7 w-7 rounded-lg border border-[#CEDECF] hover:bg-[#F4F7F4] flex items-center justify-center text-slate-700 transition"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label="Next month in picker"
                        onClick={() => movePickerMonth(1)}
                        className="h-7 w-7 rounded-lg border border-[#CEDECF] hover:bg-[#F4F7F4] flex items-center justify-center text-slate-700 transition"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[10px] font-bold uppercase text-slate-400 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <div key={d} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: pOffset }, (_, i) => (
                      <div key={`p-blank-${i}`} className="h-8" />
                    ))}
                    {Array.from({ length: pDays }, (_, i) => {
                      const dayKey = `${pickerMonth}-${String(i + 1).padStart(2, '0')}`;
                      const isSel = dayKey === chosen;
                      const dayEvs = events.filter((e) => e.date === dayKey);
                      const hasEvs = dayEvs.length > 0;
                      return (
                        <button
                          key={dayKey}
                          type="button"
                          onClick={() => {
                            selectDate(dayKey);
                            setDayPickerOpen(false);
                          }}
                          className={`h-8 rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative transition ${
                            isSel
                              ? 'bg-[#133623] text-white font-bold shadow-xs'
                              : hasEvs
                              ? 'bg-[#F4F7F4] text-[#0C2417] hover:bg-[#E8F0E9] font-medium'
                              : 'text-slate-600 hover:bg-[#F4F7F4]'
                          }`}
                        >
                          <span>{i + 1}</span>
                          {hasEvs && (
                            <span
                              className={`h-1 w-1 rounded-full ${
                                isSel ? 'bg-white' : 'bg-[#2D7A58]'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#E1E9E2]">
                    <button
                      type="button"
                      onClick={() => {
                        selectDate(studioToday(timezone));
                        setDayPickerOpen(false);
                      }}
                      className="text-[11px] font-bold text-[#2D7A58] hover:text-[#133623] hover:underline"
                    >
                      Jump to Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayPickerOpen(false)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p role="status" className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="animate-spin h-4 w-4 text-[#2D7A58]" />
          Loading attendance…
        </p>
      )}

      {view === 'month' && (
        <div className="rounded-2xl border border-[#E1E9E2] overflow-hidden bg-white shadow-sm">
          <div className="calendar-grid grid grid-cols-7 bg-[#E8F0E9] text-center text-[#0C2417]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="calendar-grid grid grid-cols-7">
            {Array.from({ length: offset }, (_, i) => (
              <div key={`blank-${i}`} className="calendar-day bg-[#FAF7F2]/50 border-t border-r border-[#E1E9E2]" aria-hidden="true" />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const key = `${month}-${String(index + 1).padStart(2, '0')}`;
              const entries = events.filter((event) => event.date === key);
              const todayKey = studioToday(timezone);
              const isSelected = chosen === key;

              // Group counts for mobile view legend icons
              const presentCount = entries.filter((e) => e.status === 'PRESENT').length;
              const absentCount = entries.filter((e) => e.status === 'ABSENT').length;
              const yellowCount = entries.filter((e) => e.status === 'EXCUSED').length;
              const scheduledCount = entries.filter((e) => e.status === 'SCHEDULED').length;

              const mobileDots = [
                { key: 'present', count: presentCount, color: '#15803d', label: 'Present' },
                { key: 'absent', count: absentCount, color: '#dc2626', label: 'Absent' },
                { key: 'yellow', count: yellowCount, color: '#ca8a04', label: 'Excused' },
                { key: 'scheduled', count: scheduledCount, color: '#2563eb', label: 'Upcoming' },
              ].filter((item) => item.count > 0);

              // Desktop view: show up to 2 entries, then "+N more"
              const MAX_DESKTOP_ENTRIES = 2;
              const visibleDesktopEntries = entries.slice(0, MAX_DESKTOP_ENTRIES);
              const desktopOverflow = entries.length - MAX_DESKTOP_ENTRIES;
              const isToday = key === todayKey;
              return (
                <div
                  key={key}
                  onClick={() => selectDate(key)}
                  className={`calendar-day cursor-pointer min-w-0 min-h-[58px] sm:min-h-[110px] border-t border-r border-[#E1E9E2] p-1 sm:p-2 transition ${
                    isSelected
                      ? 'bg-[#E8F0E9] ring-2 ring-inset ring-[#2D7A58]/60'
                      : 'bg-white hover:bg-[#F9FAF9]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectDate(key);
                        }}
                        aria-pressed={isSelected}
                        aria-label={`${key}, ${entries.length} attendance entries`}
                        className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full text-[11px] sm:text-xs font-bold flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-[#2D7A58] text-white shadow-sm'
                            : 'text-slate-700 hover:bg-[#E8F0E9]'
                        }`}
                      >
                        {index + 1}
                      </button>
                      {isToday && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#15803d] hidden sm:inline-block bg-[#E8F0E9] px-1.5 py-0.5 rounded-md border border-[#2D7A58]/20">
                          Today
                        </span>
                      )}
                    </div>
                    {entries.length > 0 && (
                      <span className="hidden sm:inline-block text-[10px] font-bold text-slate-400">
                        {entries.length}
                      </span>
                    )}
                  </div>

                  {/* Mobile view: ONLY colored badges with count inside, no loose dots */}
                  <div className="flex sm:hidden flex-wrap items-center justify-center gap-1 mt-1 px-0.5">
                    {mobileDots.map((dot) => (
                      <span
                        key={dot.key}
                        className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-black text-white shadow-xs"
                        style={{ backgroundColor: dot.color }}
                        title={`${dot.count} ${dot.label}`}
                        aria-label={`${dot.count} ${dot.label}`}
                      >
                        {dot.count}
                      </span>
                    ))}
                  </div>

                  {/* Desktop view: attendance entry pills on calendar itself */}
                  <div className="calendar-events space-y-1 mt-1.5 hidden sm:block">
                    {visibleDesktopEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        aria-label={`${entry.sessionTitle}, ${entry.time || ''}, ${statusLabel(entry.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectDate(key);
                        }}
                        className="calendar-event group w-full rounded-lg border px-1.5 py-1 text-left text-[11px] flex items-center justify-between gap-1 min-w-0 transition hover:shadow-xs hover:border-[#133623]"
                        style={{
                          borderColor: `${statusColor(entry.status)}40`,
                          backgroundColor: `${statusColor(entry.status)}12`,
                          color: statusColor(entry.status),
                        }}
                      >
                        <span className="flex items-center gap-1.5 min-w-0 truncate">
                          <span
                            className="calendar-event-dot inline-block h-2 w-2 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: statusColor(entry.status) }}
                            aria-hidden="true"
                          />
                          <span className="calendar-event-label truncate font-semibold">
                            {entry.time ? `${entry.time} · ` : ''}{entry.sessionTitle}
                          </span>
                        </span>
                      </button>
                    ))}
                    {desktopOverflow > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectDate(key);
                        }}
                        className="w-full text-left text-[10px] font-bold text-[#2D7A58] hover:text-[#133623] hover:underline px-1 py-0.5 rounded transition"
                        aria-label={`+${desktopOverflow} more entries on ${key}`}
                      >
                        +{desktopOverflow} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'day' && (
        <div className="space-y-4">
          {/* Weekday strip selector */}
          <div className="rounded-2xl border border-[#E1E9E2] bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1b4332]">Interactive Week Strip</span>
              <span className="text-[11px] text-slate-500">Tap a day to jump directly</span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
              {weekDays.map((d) => {
                const dayStr = dateKey(d);
                const daySelected = chosen === dayStr;
                const dEntries = events.filter((e) => e.date === dayStr);
                const hasPresent = dEntries.some((e) => e.status === 'PRESENT');
                const hasAbsent = dEntries.some((e) => e.status === 'ABSENT');
                const hasYellow = dEntries.some((e) => e.status === 'EXCUSED');
                const hasScheduled = dEntries.some((e) => e.status === 'SCHEDULED');
                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => selectDate(dayStr)}
                    className={`p-2 rounded-xl border transition flex flex-col items-center justify-between min-h-[64px] ${
                      daySelected
                        ? 'bg-[#133623] border-[#133623] text-white shadow-md'
                        : 'bg-[#FAF7F2]/60 hover:bg-[#E8F0E9] border-[#E1E9E2] text-slate-700'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                    <span className={`text-sm font-extrabold my-0.5 ${daySelected ? 'text-white' : 'text-[#0C2417]'}`}>
                      {d.getDate()}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 h-2">
                      {hasPresent && <span className="h-1.5 w-1.5 rounded-full bg-[#15803d]" />}
                      {hasAbsent && <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" />}
                      {hasYellow && <span className="h-1.5 w-1.5 rounded-full bg-[#ca8a04]" />}
                      {hasScheduled && <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily overview statistics pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-[#15803d]/30 bg-[#15803d]/10 p-3 text-center">
              <span className="block text-lg font-extrabold text-[#15803d]">
                {dayEvents.filter((e) => e.status === 'PRESENT').length}
              </span>
              <span className="text-xs font-semibold text-[#15803d]">Present (Green)</span>
            </div>
            <div className="rounded-xl border border-[#dc2626]/30 bg-[#dc2626]/10 p-3 text-center">
              <span className="block text-lg font-extrabold text-[#dc2626]">
                {dayEvents.filter((e) => e.status === 'ABSENT').length}
              </span>
              <span className="text-xs font-semibold text-[#dc2626]">Absent (Red)</span>
            </div>
            <div className="rounded-xl border border-[#ca8a04]/30 bg-[#ca8a04]/10 p-3 text-center">
              <span className="block text-lg font-extrabold text-[#ca8a04]">
                {dayEvents.filter((e) => e.status === 'EXCUSED').length}
              </span>
              <span className="text-xs font-semibold text-[#ca8a04]">Excused (Yellow)</span>
            </div>
            <div className="rounded-xl border border-[#2563eb]/30 bg-[#2563eb]/10 p-3 text-center">
              <span className="block text-lg font-extrabold text-[#2563eb]">
                {dayEvents.filter((e) => e.status === 'SCHEDULED').length}
              </span>
              <span className="text-xs font-semibold text-[#2563eb]">Upcoming (Blue)</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-[#F4F7F4] p-3 rounded-xl border border-[#CEDECF]" aria-label="Attendance legend">
        <span className="font-bold text-[#0C2417] text-xs uppercase tracking-wider">Legend:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#15803d]" />
          <span>Present (Green)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
          <span>Absent (Red)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ca8a04]" />
          <span>Excused (Yellow)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
          <span>Upcoming (Blue)</span>
        </span>
      </div>

      {/* Selected day attendance section */}
      <section
        ref={selectedDaySectionRef}
        tabIndex={-1}
        aria-label="Selected day attendance"
        className="space-y-3 pt-2 scroll-mt-6 focus:outline-none"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E1E9E2] pt-4">
          <div>
            <h3 className="font-bold text-base font-serif text-[#0C2417]">
              {new Date(chosen + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-slate-500">
              {dayEvents.length} {dayEvents.length === 1 ? 'attendance entry' : 'attendance entries'} on this date
            </p>
          </div>
          {!readOnly && dayEvents.length > 0 && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Studio owners can mark attendance or edit classes directly below.
            </span>
          )}
        </div>

        {!loading && !dayEvents.length && (
          <div className="rounded-2xl border border-dashed border-[#CEDECF] bg-[#F4F7F4] p-6 text-center text-sm text-slate-500">
            No attendance entries for this day.
          </div>
        )}

        <div className="space-y-2.5">
          {dayEvents.map((entry) => {
            const isUpdatingThis = updatingId === entry.id;
            return (
              <article
                key={entry.id}
                className="relative grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(0,1fr)_13rem_auto] xl:gap-6 rounded-2xl border border-[#E1E9E2] bg-white px-3.5 py-3 sm:px-4 hover:border-[#CEDECF] transition shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: statusColor(entry.status) }}
                    />
                    <button type="button" onClick={() => setDetail(entry)} className="text-left font-bold text-sm text-[#0C2417] underline decoration-dotted">{entry.sessionTitle}</button>
                    {entry.status === 'SCHEDULED' && <WhatsAppNotificationHint kind="reminder" />}
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${statusColor(entry.status)}18`,
                        color: statusColor(entry.status),
                      }}
                    >
                      {statusLabel(entry.status)}
                    </span>
                    {entry.endAt && Date.parse(entry.endAt) <= now && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"><Check size={11} aria-hidden="true" />Completed</span>}
                  </div>
                  <div className="mt-2 flex flex-wrap items-start gap-x-3 gap-y-2 pl-[18px] [&>details]:mt-0 [&>details]:max-w-full [&>details]:pt-0.5">
                    {onJoinClass && entry.occurrenceId && entry.meetingAvailable !== false && <MeetingAction meetingUrl={entry.meetingUrl} onSendInvite={onSendInvite && (!entry.endAt || Date.parse(entry.endAt) > now) ? () => onSendInvite(entry) : undefined} load={() => onJoinClass(entry)} onError={onToast} />}
                    <CollapsedDescription text={entry.description} />
                  </div>
                  {entry.remarks && (
                    <p className="text-xs text-slate-600 mt-3 ml-[18px] italic bg-[#F4F7F4] p-1.5 rounded-lg inline-block">
                      Note: &ldquo;{entry.remarks}&rdquo;
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-[#E1E9E2] pt-3 text-xs text-slate-600 xl:border-t-0 xl:pt-0">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div><dt className="font-medium text-slate-500">Start time</dt><dd className="mt-1 font-semibold text-[#0C2417]">{eventTime(entry.startAt, entry.time)}</dd></div>
                    <div><dt className="font-medium text-slate-500">End time</dt><dd className="mt-1 font-semibold text-[#0C2417]">{eventTime(entry.endAt)}</dd></div>
                  </dl>
                  {entry.teacherName && <p><span className="font-medium text-slate-500">Teacher:</span> {entry.teacherName}</p>}
                  {entry.organizationName && <p><span className="font-medium text-slate-500">Studio:</span> {entry.organizationName}</p>}
                  {entry.studentName && <p><span className="font-medium text-slate-500">Student:</span> {entry.studentName}</p>}
                </div>
                {/* Direct inline actions for studio owner */}
                {!readOnly && (
                  <div className="flex items-center gap-2 shrink-0 flex-wrap xl:pt-0">
                    {entry.status === 'SCHEDULED' ? (
                      <button
                        type="button"
                        aria-label={`Edit ${entry.sessionTitle}`}
                        onClick={() => onEditClass?.(entry)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#2563eb] bg-[#2563eb]/10 px-3.5 py-1.5 text-xs font-bold text-[#1d4ed8] hover:bg-[#2563eb] hover:text-white transition shadow-xs"
                      >
                        <Pencil size={13} />
                        <span>Edit Class</span>
                      </button>
                    ) : (
                      <div className="flex items-center rounded-xl border border-[#CEDECF] bg-[#F4F7F4] p-0.5 text-xs">
                        <button
                          type="button"
                          title="Mark Present"
                          disabled={Boolean(isUpdatingThis)}
                          onClick={() => quickUpdateStatus(entry, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                            entry.status === 'PRESENT'
                              ? 'bg-[#15803d] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#15803d] hover:bg-white'
                          }`}
                        >
                          {isUpdatingThis && entry.status !== 'PRESENT' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          <span>Present</span>
                        </button>
                        <button
                          type="button"
                          title="Mark Absent"
                          disabled={Boolean(isUpdatingThis)}
                          onClick={() => quickUpdateStatus(entry, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                            entry.status === 'ABSENT'
                              ? 'bg-[#dc2626] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#dc2626] hover:bg-white'
                          }`}
                        >
                          {isUpdatingThis && entry.status !== 'ABSENT' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          <span>Absent</span>
                        </button>
                        <button
                          type="button"
                          title="Mark Excused"
                          disabled={Boolean(isUpdatingThis)}
                          onClick={() => quickUpdateStatus(entry, 'EXCUSED')}
                          className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                            entry.status === 'EXCUSED'
                              ? 'bg-[#ca8a04] text-white shadow-xs'
                              : 'text-slate-600 hover:text-[#ca8a04] hover:bg-white'
                          }`}
                        >
                          {isUpdatingThis && entry.status !== 'EXCUSED' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          <span>Excused</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
      {detail && <Modal title={detail.sessionTitle} onClose={() => setDetail(null)}>
        <div className="space-y-4 p-6 text-sm">
          <p>{detail.date} · {eventTime(detail.startAt, detail.time)} – {eventTime(detail.endAt)}</p>
          <CollapsedDescription text={detail.description} />
          {onJoinClass && detail.occurrenceId && detail.meetingAvailable !== false && <MeetingAction endAt={detail.endAt} meetingUrl={detail.meetingUrl} onSendInvite={onSendInvite && (!detail.endAt || Date.parse(detail.endAt) > now) ? () => onSendInvite(detail) : undefined} load={() => onJoinClass(detail)} onError={onToast} />}
        </div>
      </Modal>}
    </section>
  );
}
