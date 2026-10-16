"use client";

import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  type: "date" | "time";
  value: string;
  onValueChange: (value: string) => void;
};

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date();

/** Shared date/time field. The complete field opens a keyboard-accessible picker. */
export function ScheduleInput({ type, value, onValueChange, className = "", min, max, disabled, ...props }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => parseDate(value));
  const [draftTime, setDraftTime] = useState(value || "09:00");
  const [position, setPosition] = useState({ left: 0, top: 0, width: 304 });

  function show() {
    if (disabled || !input.current) return;
    const rect = input.current.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const height = type === "date" ? 370 : 220;
    setPosition({
      left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
      top: Math.max(12, rect.bottom + height > window.innerHeight ? rect.top - height - 8 : rect.bottom + 8),
      width,
    });
    setMonth(parseDate(value));
    setDraftTime(value || "09:00");
    setOpen(true);
  }

  function close() {
    panel.current?.hidePopover?.();
    setOpen(false);
    input.current?.focus();
  }

  useEffect(() => {
    if (!open || !panel.current) return;
    const element = panel.current;
    element.showPopover?.();
    element.querySelector<HTMLElement>("[data-selected='true']")?.focus({ preventScroll: true });
    const toggle = (event: Event) => { if ((event as Event & { newState: string }).newState === "closed") setOpen(false); };
    const dismiss = () => { element.hidePopover?.(); setOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      dismiss();
      input.current?.focus({ preventScroll: true });
    };
    element.addEventListener("toggle", toggle);
    window.addEventListener("resize", dismiss);
    window.addEventListener("keydown", onKey, true);
    return () => {
      element.removeEventListener("toggle", toggle);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const selected = value ? dateKey(parseDate(value)) : "";
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const hours = Number(draftTime.split(":")[0]) || 0;
  const minutes = draftTime.split(":")[1] || "00";
  const setTime = (hour: number, minute: string) => setDraftTime(`${String(hour).padStart(2, "0")}:${minute}`);
  const allowedDate = (key: string) => (!min || key >= String(min)) && (!max || key <= String(max));
  const allowedTime = (!min || draftTime >= String(min)) && (!max || draftTime <= String(max));

  return <>
    <span className="schedule-input-wrap relative block">
      <input {...props} ref={input} type={type} value={value} min={min} max={max} disabled={disabled}
        onChange={event => onValueChange(event.target.value)}
        onPointerDown={event => { event.preventDefault(); input.current?.focus({ preventScroll: true }); }}
        onClick={event => { event.preventDefault(); show(); }}
        onKeyDown={event => {
          if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); show(); }
          props.onKeyDown?.(event);
        }}
        role="combobox" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
        className={`schedule-input ${className}`} />
      {type === "date" ? <CalendarDays aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#397451]" /> : <Clock3 aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#397451]" />}
    </span>
    {open && createPortal(<div ref={panel} id={id} popover="auto" role="dialog" aria-label={type === "date" ? "Choose date" : "Choose time"}
      className="schedule-picker" style={{ left: position.left, top: position.top, width: position.width }}
      onClick={event => event.stopPropagation()}
      onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); } }}>
      {type === "date" ? <>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" className="picker-nav" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
          <span className="text-sm font-bold text-[#133623]" aria-live="polite">{month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
          <button type="button" className="picker-nav" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(day => <span key={day} className="py-1 font-medium text-slate-500">{day}</span>)}
          {Array.from({ length: offset }, (_, i) => <span key={`empty-${i}`} />)}
          {Array.from({ length: days }, (_, i) => {
            const day = new Date(month.getFullYear(), month.getMonth(), i + 1);
            const key = dateKey(day);
            return <button type="button" key={key} data-selected={key === selected} aria-pressed={key === selected} aria-label={day.toLocaleDateString("en-IN", { dateStyle: "full" })}
              disabled={!allowedDate(key)} className={`picker-day ${key === selected ? "is-selected" : ""} ${key === dateKey(new Date()) ? "is-today" : ""}`}
              onKeyDown={event => {
                const delta = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[event.key];
                if (!delta) return;
                event.preventDefault();
                const target = new Date(month.getFullYear(), month.getMonth(), i + 1 + delta);
                if (target.getMonth() !== month.getMonth()) return;
                const targetKey = dateKey(target);
                panel.current?.querySelector<HTMLButtonElement>(`[data-date="${targetKey}"]`)?.focus();
              }} data-date={key}
              onClick={() => { onValueChange(key); close(); }}>{i + 1}</button>;
          })}
        </div>
        <div className="mt-3 flex justify-between border-t border-[#E1E9E2] pt-3 text-xs">
          <button type="button" disabled={!allowedDate(dateKey(new Date()))} className="picker-link" onClick={() => { onValueChange(dateKey(new Date())); close(); }}>Today</button>
          <button type="button" className="picker-link" onClick={close}>Done</button>
        </div>
      </> : <>
        <p className="mb-4 flex items-center gap-2 text-sm font-bold text-[#133623]"><Clock3 size={16} />Choose time</p>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs font-medium text-slate-500">Hour<select aria-label="Hour" value={hours % 12 || 12} onChange={event => setTime(Number(event.target.value) % 12 + (hours >= 12 ? 12 : 0), minutes)}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, "0")}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-500">Minute<select aria-label="Minute" value={minutes} onChange={event => setTime(hours, event.target.value)}>{Array.from({ length: 60 }, (_, i) => <option key={i} value={String(i).padStart(2, "0")}>{String(i).padStart(2, "0")}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-500">Period<select aria-label="AM or PM" value={hours >= 12 ? "PM" : "AM"} onChange={event => setTime(hours % 12 + (event.target.value === "PM" ? 12 : 0), minutes)}><option>AM</option><option>PM</option></select></label>
        </div>
        <div className="mt-5 flex items-center justify-between"><button type="button" className="picker-link" onClick={close}>Cancel</button><button type="button" disabled={!allowedTime} className="picker-apply" onClick={() => { onValueChange(draftTime); close(); }}>Set time</button></div>
      </>}
    </div>, input.current?.closest("dialog") || document.body)}
  </>;
}
