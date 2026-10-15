'use client';
import { useEffect, useRef, useState } from 'react';

/** The same server-rendered HTML is used in the gallery, preview and public site. */
export default function WebsiteFrame({ src, html, title, mobile = false, thumbnail = false }: {
  src?: string; html?: string; title: string; mobile?: boolean; thumbnail?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const viewport = mobile ? 390 : 1200;
  useEffect(() => {
    const observer = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const scale = width ? Math.min(width / viewport, 1) : 0;
  const height = thumbnail ? 980 : 1000;
  return <div ref={container} style={{ maxWidth: mobile ? 390 : undefined, margin: '0 auto', width: '100%', height: Math.max(1, height * scale), overflow: 'hidden', background:'#eeeee8' }}>
    <iframe title={title} src={src} srcDoc={html} sandbox="allow-scripts" tabIndex={thumbnail ? -1 : undefined} aria-hidden={thumbnail || undefined} loading={thumbnail ? 'lazy' : 'eager'} style={{ border:0, width:viewport, height, transform:`scale(${scale})`, transformOrigin:'top left', pointerEvents:thumbnail ? 'none' : 'auto' }}/>
  </div>;
}
