'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, X, Plus } from 'lucide-react';

export type CalendarAttendanceStatus = 'PRESENT' | 'ABSENT' | 'CANCELLED';

export interface CalendarSessionEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  sessionTitle: string;
  studentName?: string;
  studentEmail?: string;
  status: CalendarAttendanceStatus;
  remarks?: string;
}

interface AttendanceCalendarProps {
  events: CalendarSessionEvent[];
  onUpdateEvents: (updatedEvents: CalendarSessionEvent[]) => void;
  onToast: (msg: string) => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  events,
  onUpdateEvents,
  onToast,
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed (8 = September)

  // Edit / Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarSessionEvent | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editSessionTitle, setEditSessionTitle] = useState('');
  const [editSessionTime, setEditSessionTime] = useState('07:00 AM');
  const [editStudentName, setEditStudentName] = useState('Aarav Patel');
  const [editStatus, setEditStatus] = useState<CalendarAttendanceStatus>('PRESENT');
  const [editRemarks, setEditRemarks] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const formatDateString = (day: number) => {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const getEventsForDay = (day: number) => {
    const dateStr = formatDateString(day);
    return events.filter((e) => e.date === dateStr);
  };

  const handleOpenAddModal = (day: number) => {
    const dateStr = formatDateString(day);
    setEditingEvent({
      id: `att-cal-${Date.now()}`,
      date: dateStr,
      time: '07:00 AM',
      sessionTitle: 'Morning Hatha Flow',
      studentName: 'Aarav Patel',
      status: 'PRESENT',
      remarks: 'Verified by Instructor',
    });
    setEditDate(dateStr);
    setEditSessionTitle('Morning Hatha Flow');
    setEditSessionTime('07:00 AM');
    setEditStudentName('Aarav Patel');
    setEditStatus('PRESENT');
    setEditRemarks('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: CalendarSessionEvent, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEvent(evt);
    setEditDate(evt.date);
    setEditSessionTitle(evt.sessionTitle);
    setEditSessionTime(evt.time || '07:00 AM');
    setEditStudentName(evt.studentName || 'Aarav Patel');
    setEditStatus(evt.status);
    setEditRemarks(evt.remarks || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const updated: CalendarSessionEvent = {
      ...editingEvent,
      date: editDate,
      time: editSessionTime,
      sessionTitle: editSessionTitle,
      studentName: editStudentName,
      status: editStatus,
      remarks: editRemarks,
    };

    const exists = events.some((evt) => evt.id === updated.id);
    let nextEvents: CalendarSessionEvent[];
    if (exists) {
      nextEvents = events.map((evt) => (evt.id === updated.id ? updated : evt));
      onToast(`🌿 Attendance updated: ${updated.studentName} marked ${updated.status}`);
    } else {
      nextEvents = [...events, updated];
      onToast(`🌿 New Attendance entry logged for ${updated.studentName} (${updated.status})`);
    }

    onUpdateEvents(nextEvents);
    try {
      localStorage.setItem('pr_calendar_events', JSON.stringify(nextEvents));
    } catch (err) {}
    setIsModalOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="card-nature p-6 space-y-6">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E1E9E2]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#E8F0E9] text-[#1b4332] flex items-center justify-center font-bold text-lg shadow-sm">
            🗓️
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#0C2417] leading-tight">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <span className="text-xs text-[#7E7970]">
              Click on any day to log or update student attendance.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="h-9 w-9 rounded-xl border border-[#CEDECF] bg-white hover:bg-[#FAF7F2] text-slate-700 flex items-center justify-center shadow-sm transition"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCurrentMonth(now.getMonth());
              setCurrentYear(now.getFullYear());
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E8F0E9] hover:bg-[#CEDECF] text-[#0C2417] transition"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="h-9 w-9 rounded-xl border border-[#CEDECF] bg-white hover:bg-[#FAF7F2] text-slate-700 flex items-center justify-center shadow-sm transition"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Table */}
      <div className="border border-[#E1E9E2] rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 bg-[#E8F0E9]/60 border-b border-[#E1E9E2] text-center">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2.5 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#E1E9E2]">
          {/* Empty offset padding cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[105px] bg-[#FAF7F2]/40 p-2 text-slate-300" />
          ))}

          {/* Actual day cells */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDateString(dayNum);
            const isToday = dateStr === todayStr;
            const dayEvents = getEventsForDay(dayNum);

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => handleOpenAddModal(dayNum)}
                className={`min-h-[105px] p-2 hover:bg-[#FAF7F2] transition flex flex-col justify-between cursor-pointer group relative ${
                  isToday ? 'bg-[#E8F0E9]/30' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-full ${
                      isToday
                        ? 'bg-[#133623] text-white shadow-sm'
                        : 'text-slate-700 group-hover:text-[#0C2417]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#2D7A58] font-bold transition">
                    + Log
                  </span>
                </div>

                {/* Day events badges */}
                <div className="space-y-1 overflow-y-auto max-h-[68px]">
                  {dayEvents.map((evt) => {
                    const isPresent = evt.status === 'PRESENT';
                    const isAbsent = evt.status === 'ABSENT';

                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => handleOpenEditModal(evt, e)}
                        className={`p-1 rounded-md text-[10px] font-semibold border truncate cursor-pointer transition hover:scale-[1.02] ${
                          isPresent
                            ? 'bg-[#E8F0E9] text-[#1b4332] border-[#CEDECF]'
                            : isAbsent
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                        title={`${evt.sessionTitle} • ${evt.studentName || 'Yogi'} (${evt.status})`}
                      >
                        <span className="font-bold">{evt.time || '07:00'}</span> {evt.studentName ? evt.studentName.split(' ')[0] : 'Class'}:{' '}
                        <span className="font-bold">{evt.status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#2D7A58]" />
            <span>Present / Attended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Cancelled</span>
          </div>
        </div>
        <p className="text-[11px] text-[#7E7970]">
          Total {events.length} sessions logged in calendar history.
        </p>
      </div>

      {/* ATTENDANCE ENTRY / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#CEDECF] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E9E2]">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h3 className="font-serif font-bold text-lg text-[#0C2417]">
                  {editingEvent ? 'Edit Attendance Entry' : 'Log Attendance Entry'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                  Practitioner Name
                </label>
                <select
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white"
                >
                  <option value="Aarav Patel">Aarav Patel (aarav@progressrooms.com)</option>
                  <option value="Pooja Sharma">Pooja Sharma (pooja@progressrooms.com)</option>
                  <option value="Rohan Verma">Rohan Verma (rohan@progressrooms.com)</option>
                  <option value="Meera Nair">Meera Nair (meera@progressrooms.com)</option>
                  <option value="Vikram Iyer">Vikram Iyer (vikram@progressrooms.com)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    value={editSessionTime}
                    onChange={(e) => setEditSessionTime(e.target.value)}
                    placeholder="07:00 AM"
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                  Session Batch
                </label>
                <select
                  value={editSessionTitle}
                  onChange={(e) => setEditSessionTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-white"
                >
                  <option value="Morning Hatha Flow">Morning Hatha Flow (07:00 AM)</option>
                  <option value="Aerial Yoga Conditioning">Aerial Yoga Conditioning (06:00 PM)</option>
                  <option value="Sunset Vinyasa Flow">Sunset Vinyasa Flow (05:30 PM)</option>
                  <option value="Meditation & Pranayama">Meditation & Pranayama (08:30 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase mb-1.5">
                  Attendance Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('PRESENT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editStatus === 'PRESENT'
                        ? 'bg-[#133623] text-white border-[#133623] shadow-sm'
                        : 'bg-white border-[#CEDECF] text-slate-700 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    ✓ Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('ABSENT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editStatus === 'ABSENT'
                        ? 'bg-red-700 text-white border-red-700 shadow-sm'
                        : 'bg-white border-[#CEDECF] text-slate-700 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    ✕ Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('CANCELLED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      editStatus === 'CANCELLED'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white border-[#CEDECF] text-slate-700 hover:bg-[#FAF7F2]'
                    }`}
                  >
                    ⊘ Cancelled
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                  Teacher Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Completed Surya Namaskar B, good alignment"
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#FAF7F2]"
                />
              </div>

              <div className="pt-3 border-t border-[#E1E9E2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#133623] to-[#1b4332] hover:from-[#0C2417] hover:to-[#133623] text-white font-bold text-xs shadow-md transition"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
