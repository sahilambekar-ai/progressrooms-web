"use client";

export function CatalogHistoryTabs({ history, onChange, label, panelId }: {
  history: boolean;
  onChange: (history: boolean) => void;
  label: string;
  panelId: string;
}) {
  return <div role="tablist" aria-label={`${label} views`} className="flex gap-5 border-b border-[#CEDECF]">
    {[false, true].map((value) => <button
      key={String(value)}
      type="button"
      role="tab"
      id={`${panelId}-${value ? "history" : "current"}`}
      aria-selected={history === value}
      aria-controls={panelId}
      tabIndex={history === value ? 0 : -1}
      onClick={() => onChange(value)}
      onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? false : event.key === "End" ? true : !value;
        onChange(next);
        document.getElementById(`${panelId}-${next ? "history" : "current"}`)?.focus();
      }}
      className={`border-b-2 px-1 py-3 text-sm font-semibold transition ${history === value ? "border-[#133623] text-[#133623]" : "border-transparent text-slate-500 hover:text-[#133623]"}`}
    >{value ? "History" : "Current"}</button>)}
  </div>;
}
