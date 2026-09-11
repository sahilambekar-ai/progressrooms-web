'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, X, Plus } from 'lucide-react';
import { Modal } from './Modal';

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
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

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
    } else {
      nextEvents = [...events, updated];
    }

    try {
      onUpdateEvents(nextEvents);
    } catch (err) {
      onToast('Error saving attendance. Your changes are still here; please try again.');
      return;
    }
    onToast(`Attendance ${exists ? 'updated' : 'saved'}: ${updated.studentName} marked ${updated.status}`);
    setIsModalOpen(false);
  };

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const visibleDay = Math.min(selectedDay, totalDaysInMonth);

  return (
    <div className="card-nature p-3 sm:p-6 space-y-4 sm:space-y-6">
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
              Select a day for details. Tap an entry to update attendance.
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
              setSelectedDay(now.getDate());
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
        <div className="calendar-grid grid grid-cols-7 bg-[#E8F0E9]/60 border-b border-[#E1E9E2] text-center">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2.5 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid Cells */}
        <div className="calendar-grid grid grid-cols-7 divide-x divide-y divide-[#E1E9E2]">
          {/* Empty offset padding cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} aria-hidden="true" className="calendar-day bg-[#FAF7F2]/40 p-2 text-slate-300" />
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
                className={`calendar-day min-w-0 p-2 hover:bg-[#FAF7F2] transition flex flex-col group relative ${
                  isToday ? 'bg-[#E8F0E9]/30' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <button type="button" onClick={() => setSelectedDay(dayNum)}
                    aria-label={`${monthNames[currentMonth]} ${dayNum}, ${dayEvents.length} attendance entries`}
                    aria-pressed={visibleDay === dayNum} aria-current={isToday ? 'date' : undefined}
                    className={`inline-flex items-center justify-center h-6 w-6 text-xs font-bold rounded-full ${
                      isToday
                        ? 'bg-[#133623] text-white shadow-sm'
                        : visibleDay === dayNum ? 'bg-[#CEDECF] text-[#0C2417]' : 'text-slate-700 group-hover:text-[#0C2417]'
                    }`}
                  >
                    {dayNum}
                  </button>
                  <button type="button" aria-label={`Log attendance for ${monthNames[currentMonth]} ${dayNum}`} onClick={() => handleOpenAddModal(dayNum)} className="calendar-add-label text-[10px] text-[#2D7A58] font-bold transition">
                    + Log
                  </button>
                </div>

                {/* Day events badges */}
                <div className="calendar-events">
                  {dayEvents.map((evt) => {
                    const isPresent = evt.status === 'PRESENT';
                    const isAbsent = evt.status === 'ABSENT';

                    return (
                      <button type="button"
                        key={evt.id}
                        aria-label={`${evt.sessionTitle}, ${evt.studentName || 'Yogi'}, ${evt.time || ''}, ${evt.status}. Edit attendance`}
                        onClick={(e) => handleOpenEditModal(evt, e)}
                        className={`calendar-event p-1 rounded-md text-[10px] font-semibold border truncate cursor-pointer transition ${
                          isPresent
                            ? 'bg-[#E8F0E9] text-[#1b4332] border-[#CEDECF]'
                            : isAbsent
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                        title={`${evt.sessionTitle} • ${evt.studentName || 'Yogi'} (${evt.status})`}
                      >
                        <span className="calendar-event-dot" aria-hidden="true" />
                        <span className="calendar-event-label"><span className="font-bold">{evt.time || '07:00'}</span> {evt.studentName ? evt.studentName.split(' ')[0] : 'Class'}: <span className="font-bold">{evt.status}</span></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section aria-label="Selected day attendance" className="rounded-2xl border border-[#CEDECF] bg-[#F4F7F4] p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-lg">{monthNames[currentMonth]} {visibleDay}, {currentYear}</h3>
          <button type="button" onClick={() => handleOpenAddModal(visibleDay)} className="btn-forest inline-flex items-center gap-2 px-3 py-2 text-xs"><Plus size={16} /> Log attendance</button>
        </div>
        <div className="mt-3 space-y-2" aria-live="polite">
          {getEventsForDay(visibleDay).length === 0 && <p className="text-sm text-slate-600">No attendance entries for this day.</p>}
          {getEventsForDay(visibleDay).map((event) => <button key={event.id} type="button" onClick={() => handleOpenEditModal(event)} className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E1E9E2] bg-white p-3 text-left text-sm">
            <span><strong className="block">{event.sessionTitle}</strong><span className="text-xs text-slate-600">{event.time} · {event.studentName || 'Class'}</span></span>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${event.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-800' : event.status === 'ABSENT' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>{event.status}</span>
          </button>)}
        </div>
      </section>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
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
        <Modal title="Attendance entry" onClose={() => setIsModalOpen(false)} confirmDiscard>
          <div className="bg-white rounded-3xl border border-[#CEDECF] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E9E2]">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
                <h3 className="font-serif font-bold text-lg text-[#0C2417]">
                  {events.some((event) => event.id === editingEvent?.id) ? 'Edit Attendance Entry' : 'Log Attendance Entry'}
                </h3>
              </div>
              <button
                aria-label="Close attendance entry"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label htmlFor="components-AttendanceCalendar-field-1" className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                  Practitioner Name
                </label>
                <select id="components-AttendanceCalendar-field-1"
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
                  <label htmlFor="components-AttendanceCalendar-field-2" className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                    Date
                  </label>
                  <input id="components-AttendanceCalendar-field-2"
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CEDECF] text-xs bg-[#FAF7F2]"
                  />
                </div>

                <div>
                  <label htmlFor="components-AttendanceCalendar-field-3" className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                    Time
                  </label>
                  <input id="components-AttendanceCalendar-field-3"
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
                <label htmlFor="components-AttendanceCalendar-field-4" className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                  Session Batch
                </label>
                <select id="components-AttendanceCalendar-field-4"
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
                    aria-pressed={editStatus === 'PRESENT'}
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
                    aria-pressed={editStatus === 'ABSENT'}
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
                    aria-pressed={editStatus === 'CANCELLED'}
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
                <label htmlFor="components-AttendanceCalendar-field-5" className="block text-xs font-bold text-[#1b4332] uppercase mb-1">
                  Teacher Notes / Remarks
                </label>
                <input id="components-AttendanceCalendar-field-5"
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
        </Modal>
      )}
    </div>
  );
};
