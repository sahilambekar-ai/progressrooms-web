"use client";

import { useEffect } from "react";
import { DEFAULT_FONT_ID, themeService } from "@/services/themeService";

export function FontInitializer() {
  useEffect(() => { themeService.applyFont(DEFAULT_FONT_ID); }, []);
  return null;
}
