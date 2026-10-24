"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Highlighter, ChevronDown } from "lucide-react";

/** Only formatting tags are retained; attributes, links and executable content are discarded. */
export function cleanDescription(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const allowed = new Set(["P", "DIV", "BR", "STRONG", "B", "EM", "I", "U", "MARK", "UL", "OL", "LI", "BLOCKQUOTE"]);
  const visit = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG", "MATH"].includes(child.tagName)) { child.remove(); continue; }
      visit(child);
      if (!allowed.has(child.tagName)) child.replaceWith(...Array.from(child.childNodes));
      else for (const attribute of Array.from(child.attributes)) child.removeAttribute(attribute.name);
    }
  };
  visit(doc.body); return doc.body.textContent?.trim() ? doc.body.innerHTML : "";
}

export function RichTextEditor({ value, onChange, label = "Description" }: { value: string; onChange: (value: string) => void; label?: string }) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => { if (editor.current && document.activeElement !== editor.current) editor.current.innerHTML = cleanDescription(value); }, [value]);
  const format = (command: string, argument?: string) => {
    editor.current?.focus(); document.execCommand("styleWithCSS", false, "false"); document.execCommand(command, false, argument);
    if (editor.current) onChange(cleanDescription(editor.current.innerHTML));
  };
  return <div className="space-y-2"><p className="text-xs font-semibold">{label}</p>
    <div className="overflow-hidden rounded-xl border border-[#CEDECF] bg-white focus-within:border-[#2D7A58] focus-within:ring-2 focus-within:ring-[#2D7A58]/10">
    <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap items-center gap-1 border-b border-[#E1E9E2] bg-[#F9FAF9] px-2 py-1.5">
      {([{ title: "Bold", command: "bold", Icon: Bold }, { title: "Italic", command: "italic", Icon: Italic }, { title: "Underline", command: "underline", Icon: Underline }, { title: "Bullets", command: "insertUnorderedList", Icon: List }, { title: "Numbered list", command: "insertOrderedList", Icon: ListOrdered }]).map(({ title, command, Icon }) => <button key={command} type="button" aria-label={title} title={title} onMouseDown={e => e.preventDefault()} onClick={() => format(command)} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-[#E8F0E9] hover:text-[#133623] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7A58]"><Icon size={16} aria-hidden="true" /></button>)}
      <button type="button" aria-label="Highlight" title="Highlight" onMouseDown={e => e.preventDefault()} onClick={() => { document.execCommand("styleWithCSS", false, "false"); format("hiliteColor", "#fff2a8"); if (editor.current) { editor.current.querySelectorAll("font,span").forEach(node => { const mark = document.createElement("mark"); mark.append(...Array.from(node.childNodes)); node.replaceWith(mark); }); onChange(cleanDescription(editor.current.innerHTML)); } }} className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition hover:bg-[#E8F0E9] hover:text-[#133623] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7A58]"><Highlighter size={16} aria-hidden="true" /></button>
    </div>
    <div ref={editor} role="textbox" aria-label={label} aria-multiline="true" contentEditable suppressContentEditableWarning onDrop={event => event.preventDefault()} onInput={() => { if (editor.current) onChange(cleanDescription(editor.current.innerHTML)); }} onPaste={event => { event.preventDefault(); document.execCommand("insertText", false, event.clipboardData.getData("text/plain")); if (editor.current) onChange(cleanDescription(editor.current.innerHTML)); }} className="rich-description min-h-32 bg-white p-3 text-sm font-normal text-slate-800 focus:outline-none" />
    </div>
    <p className="text-xs text-slate-500">Press Enter for a new paragraph. Select text to format it. Students can expand this description.</p>
  </div>;
}

export function CollapsedDescription({ text, label = "Show more details", children }: { text?: string | null; label?: string; children?: ReactNode }) {
  const [html, setHtml] = useState("");
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setHtml(text ? cleanDescription(text) : ""); }, [text]);
  if (!text?.trim() && !children) return null;
  return <details onToggle={event => setExpanded(event.currentTarget.open)} className="group/description mt-3 text-sm" onClick={event => event.stopPropagation()}><summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-sm text-xs font-bold text-[#2D7A58] hover:text-[#133623] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7A58] [&::-webkit-details-marker]:hidden"><span>{expanded ? "Hide details" : label}</span><ChevronDown size={14} aria-hidden="true" className="shrink-0 transition-transform group-open/description:rotate-180" /></summary>{text?.trim() && (html ? <div className="rich-description mt-3 whitespace-pre-wrap font-normal text-slate-700" dangerouslySetInnerHTML={{ __html: html }} /> : <p className="mt-3 whitespace-pre-wrap">{text}</p>)}{children && <div className="mt-3 space-y-3 text-xs text-slate-600">{children}</div>}</details>;
}
