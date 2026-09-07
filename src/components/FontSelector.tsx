'use client';

import React, { useState, useEffect, useRef } from 'react';
import { themeService, PROFESSIONAL_FONTS, DashboardFont } from '@/services/themeService';
import { Type, Check, ChevronDown } from 'lucide-react';

interface FontSelectorProps {
  variant?: 'compact' | 'full';
}

export const FontSelector: React.FC<FontSelectorProps> = ({ variant = 'compact' }) => {
  const [activeFont, setActiveFont] = useState<DashboardFont>(() => themeService.getActiveFont());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    themeService.initFont();
    setActiveFont(themeService.getActiveFont());

    const handleFontChange = (e: any) => {
      setActiveFont(e.detail);
    };

    window.addEventListener('progressrooms_font_changed', handleFontChange);
    return () => window.removeEventListener('progressrooms_font_changed', handleFontChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFont = (fontId: string) => {
    const chosen = themeService.applyFont(fontId);
    setActiveFont(chosen);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/90 border border-[#CEDECF] text-[#0C2417] hover:border-[#81A882] hover:bg-white shadow-sm transition"
        title="Switch Typography Font"
      >
        <Type className="h-3.5 w-3.5 text-[#2D7A58]" />
        <span className="hidden sm:inline font-medium">Font:</span>
        <span className="font-bold truncate max-w-[140px]">{activeFont.name.split('+')[0].trim()}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#CEDECF] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-[#F0F4F0] mb-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-[#81A882]">Select Studio Typography</p>
            <p className="text-[10px] text-slate-500">Live preview applies across entire website & dashboard.</p>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto">
            {PROFESSIONAL_FONTS.map((font) => {
              const isSelected = font.id === activeFont.id;
              return (
                <button
                  key={font.id}
                  onClick={() => handleSelectFont(font.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#E8F0E9] text-[#0C2417] font-bold border border-[#CEDECF]'
                      : 'hover:bg-[#FAF7F2] text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-xs leading-snug">{font.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{font.category} • {font.description.slice(0, 38)}...</p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#2D7A58] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
