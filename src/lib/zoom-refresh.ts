'use client';
import { useEffect, useRef } from 'react';

export function useZoomRefresh(refresh: () => void) {
  const latest = useRef(refresh);
  latest.current = refresh;
  useEffect(() => {
    const update = () => latest.current();
    const storage = (event: StorageEvent) => { if (event.key === 'pr_zoom_updated') update(); };
    window.addEventListener('focus', update);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener('focus', update); window.removeEventListener('storage', storage); };
  }, []);
}
