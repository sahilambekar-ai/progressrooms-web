"use client";

interface LiveStatusToggleProps {
  live: boolean;
  onChange: (live: boolean) => void;
  disabled?: boolean;
  name?: string;
}

export function LiveStatusToggle({ live, onChange, disabled, name = "Status" }: LiveStatusToggleProps) {
  const label = live ? "Live" : "Off";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={live}
      aria-label={`${name}: ${live ? "Live" : "Not live"}`}
      title={live ? "Set to not live" : "Set to live"}
      disabled={disabled}
      onClick={() => onChange(!live)}
      className="btn-compact relative inline-flex shrink-0 items-center rounded-full border text-[10px] font-bold tracking-tight transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60"
      style={{ width: 64, height: 22, minHeight: 22, backgroundColor: live ? "#15803d" : "#e5e7eb", color: live ? "#ffffff" : "#4b5563", borderColor: live ? "#15803d" : "#d1d5db" }}
    >
      <span className="absolute text-center leading-none" style={{ left: live ? 5 : 20, right: live ? 20 : 5 }}>
        {label}
      </span>
      <span
        aria-hidden="true"
        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow-sm transition-transform motion-reduce:transition-none"
        style={{ backgroundColor: "#ffffff", transform: live ? "translateX(42px)" : "translateX(0)" }}
      />
    </button>
  );
}
