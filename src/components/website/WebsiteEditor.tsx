"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, Check, ExternalLink, Globe, LayoutTemplate, Monitor, Smartphone, Eye, Save, Plus, Trash2, ImagePlus, Download, Layers, Type, Upload, RefreshCw } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import WebsiteFrame from '@/components/website/WebsiteFrame';
import { API, imageUrl, MAX_IMAGES, MAX_CARDS, MAX_SECTIONS, WebsiteContent, WebsiteImage, WebsiteSection, WebsiteTemplate, WebsiteRelease } from '@/components/website/templates';

type Org = { id: string; name: string; slug: string };
type Step = 'templates' | 'edit' | 'preview';
type EditorTab = 'content' | 'images' | 'sections';
const inputStyle = 'w-full rounded-lg border border-[#dce1d6] bg-white p-3 text-sm text-[#263c30] focus:outline-none focus:ring-2 focus:ring-[#7c977c]';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[#dce1d6] bg-white px-4 py-2.5 text-xs font-medium disabled:opacity-40 hover:bg-[#f7f8f3]';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#234c39] px-5 py-3 text-xs font-semibold text-white hover:bg-[#173727] disabled:opacity-40';

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('pr_access_token');
  if (!token) throw new Error('Please sign in to manage your website.');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...(options.body instanceof FormData ? {} : { 'Content-Type':'application/json' }), ...options.headers },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const detail = Array.isArray(data.detail) ? data.detail.map((item: { msg: string }) => item.msg).join('. ') : data.detail;
    throw new Error(typeof detail === 'string' ? detail : 'The request could not be completed. Please try again.');
  }
  return res;
}

function Field({ label, value, onChange, multiline = false, max = 255, help }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; max?: number; help?: string;
}) {
  return <label className="block space-y-2"><span className="text-xs font-semibold">{label}</span>
    {multiline ? <textarea className={inputStyle} rows={4} value={value} maxLength={max} onChange={e => onChange(e.target.value)}/> : <input className={inputStyle} value={value} maxLength={max} onChange={e => onChange(e.target.value)}/>}
    {help && <span className="block text-[11px] leading-5 text-[#7d897f]">{help}</span>}
  </label>;
}

export default function WebsiteEditor({ initialTemplates = [], embedded = true }: { initialTemplates?: WebsiteTemplate[]; embedded?: boolean }) {
  const [org, setOrg] = useState<Org>();
  const [studios, setStudios] = useState<Org[]>([]);
  const [templates, setTemplates] = useState<WebsiteTemplate[]>(initialTemplates);
  const [content, setContent] = useState<WebsiteContent>(initialTemplates[0]?.content);
  const [step, setStep] = useState<Step>('templates');
  const [editorTab, setEditorTab] = useState<EditorTab>('content');
  const [mobile, setMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [published, setPublished] = useState(false);
  const [websiteState, setWebsiteState] = useState<'Draft' | 'Published with unpublished changes' | 'Published'>('Draft');
  const [release, setRelease] = useState<WebsiteRelease>();
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const blobs = useRef<string[]>([]);
  const initialCatalog = useRef(initialTemplates);
  const selected = templates.find(t => t.code === content?.template_code);
  const previewStale = Boolean(previewHtml && JSON.stringify(content) !== previewContent);

  async function loadStudio(studio: Org) {
    const data = await (await request(`/organizations/${studio.id}/website`)).json();
    setOrg(data.organization); setContent(data.content); setPublished(Boolean(data.is_published));
    setWebsiteState(data.website_state || (data.is_published ? 'Published' : 'Draft'));
    setRelease(data.release || undefined);
    setDirty(false); setPreviewHtml(''); setPreviewContent(''); setMessage('');
  }
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [catalog, workspace]: [WebsiteTemplate[], Org[]] = await Promise.all([
          initialCatalog.current?.length ? Promise.resolve(initialCatalog.current) : (async () => {
            const response = await fetch(`${API}/public/website-templates`);
            if (!response.ok) throw new Error('The template library could not be loaded.');
            return response.json();
          })(),
          request('/website-workspace').then(response => response.json()),
        ]);
        if (!active) return;
        setTemplates(catalog); setStudios(workspace);
        const user = JSON.parse(localStorage.getItem('pr_user') || '{}');
        const studio = workspace.find(s => s.id === user.organization_id) || workspace.find(s => s.slug === user.organization_slug) || workspace[0];
        if (!studio) throw new Error('Sign in with an active studio or teacher account to manage its website.');
        await loadStudio(studio);
      } catch (e) { if (active) setError((e as Error).message); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const leave = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);
  useEffect(() => () => { blobs.current.forEach(url => URL.revokeObjectURL(url)); }, []);

  function change(patch: Partial<WebsiteContent>) {
    setContent(c => c ? { ...c, ...patch } : c);
    setDirty(true);
    if (websiteState === 'Published') {
      setWebsiteState('Published with unpublished changes');
    }
    setMessage('');
    setError('');
  }
  function updateSection(index: number, patch: Partial<WebsiteSection>) {
    if (!content) return;
    change({ sections:content.sections.map((section, i) => i === index ? { ...section, ...patch } : section) });
  }
  function changeImages(images: WebsiteImage[]) {
    if (!content) return;
    const ids = new Set(images.map(image => image.id));
    change({ images, hero_image_url:images[0]?.url || '', sections:content.sections.map(section => ({ ...section, cards:section.cards.map(card => ({ ...card, image_id:card.image_id && ids.has(card.image_id) ? card.image_id : null })) })) });
  }
  function validate() {
    if (!content?.headline?.trim()) { setError('Add a headline before continuing.'); setStep('edit'); setEditorTab('content'); return false; }
    if (content.sections.some(section => !section.title?.trim() || section.cards.some(card => !card.title?.trim()))) { setError('Each section and card needs a title.'); setStep('edit'); setEditorTab('sections'); return false; }
    return true;
  }
  async function save(publish = false) {
    if (!org || !content || !validate()) return;
    setBusy(true); setError(''); setMessage('');
    try {
      await request(`/organizations/${org.id}/website`, { method:'PUT', body:JSON.stringify(content) }); setDirty(false);
      if (publish) {
        const data = await (await request(`/organizations/${org.id}/website/publish`, { method:'POST' })).json();
        setPublished(true);
        setRelease(data.release);
        setWebsiteState('Published');
      } else {
        if (published) {
          setWebsiteState('Published with unpublished changes');
        } else {
          setWebsiteState('Draft');
        }
      }
      setMessage(publish ? 'Your website is live. A standalone version is saved and ready to download.' : 'Draft saved. Your live website has not changed.');
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function preview(openTab = true, sample?: WebsiteTemplate) {
    if (!org || !content || (!sample && !validate())) return;
    const popup = openTab ? window.open('about:blank', '_blank') : null;
    if (popup) popup.opener = null;
    setBusy(true); setError('');
    try {
      const payload = sample ? sample.content : content;
      const data = await (await request(`/organizations/${org.id}/website/preview`, { method:'POST', body:JSON.stringify(payload) })).json();
      if (!sample) { setPreviewHtml(data.html); setPreviewContent(JSON.stringify(payload)); setStep('preview'); }
      const url = URL.createObjectURL(new Blob([data.html], { type:'text/html' })); blobs.current.push(url);
      if (popup) popup.location.replace(url);
      else if (openTab) setMessage('Your browser blocked the new tab. The preview is shown below; allow pop-ups to open it separately.');
    } catch (e) { popup?.close(); setError((e as Error).message); } finally { setBusy(false); }
  }
  async function download() {
    if (!org || !release) return;
    setBusy(true); setError('');
    try {
      const response = await request(`/organizations/${org.id}/website/download/${release.version}`);
      const url = URL.createObjectURL(await response.blob()); blobs.current.push(url);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${org.slug}-website.html`; anchor.click();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function upload(files: FileList | null) {
    if (!files || !org || !content) return;
    const remaining = MAX_IMAGES - content.images.length;
    if (files.length > remaining) { setError(`You can add ${remaining} more image${remaining === 1 ? '' : 's'}. A website can use up to five images.`); return; }
    if (Array.from(files).some(file => file.size > 5 * 1024 * 1024)) { setError('Each image must be smaller than 5 MB.'); return; }
    setBusy(true); setError('');
    const added: WebsiteImage[] = [];
    let uploadError = "";
    try {
      for (const file of Array.from(files)) {
        const body = new FormData(); body.append('file', file);
        const result = await (await request(`/organizations/${org.id}/website/image`, { method:'POST', body })).json();
        added.push({ id:crypto.randomUUID(), url:result.url, alt:file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') });
      }
    } catch (e) { uploadError = (e as Error).message; }
    finally { if (added.length) changeImages([...content.images, ...added]); if (uploadError) setError(uploadError); setBusy(false); }
  }
  const samplePhotos = [
    {name:'Movement', file:'movement'}, {name:'Stillness',file:'stillness'}, {name:'Sound',file:'sound'},
    {name:'Learning',file:'learning'}, {name:'Community',file:'community'},
  ];

  const editorContent = (
    <div className="w-full">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="mb-2 text-[9px] uppercase tracking-[.22em] text-[#889286]">Studio workspace / My website</p>
          <h1 className="font-serif text-3xl font-bold text-[#0C2417]">A website that feels like you.</h1>
          <p className="mt-2 text-sm text-[#7a857b]">Choose a look. Tell your story. Make it yours.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {websiteState !== 'Draft' && release && org && <a href={`/${org.slug}`} target="_blank" rel="noreferrer" className={secondary}><ExternalLink size={14}/>View live</a>}
          <button disabled={!content || busy} onClick={() => save()} className={secondary}><Save size={14}/>Save draft</button>
          <button disabled={!content || busy} onClick={() => save(true)} className={primary}>{busy ? 'Working…' : 'Publish website'}</button>
        </div>
      </div>
      {studios.length > 1 && <label className="mb-5 block text-xs">Studio<select value={org?.id} disabled={busy || dirty} onChange={async e => { const studio = studios.find(s => s.id === e.target.value); if (studio) { setLoading(true); try { await loadStudio(studio); } catch (error) { setError((error as Error).message); } finally { setLoading(false); } } }} className={`${inputStyle} mt-2 max-w-sm`}>{studios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>{dirty && <span className="ml-3">Save your draft before switching studios.</span>}</label>}
      <div className="mb-7 flex flex-wrap items-center gap-3 rounded-xl border border-[#e1e5dc] bg-white px-4 py-3 text-xs">
        <span className={`h-2.5 w-2.5 rounded-full ${
          websiteState === 'Published'
            ? 'bg-emerald-600'
            : websiteState === 'Published with unpublished changes'
            ? 'bg-amber-500'
            : 'bg-slate-400'
        }`}/>
        <span className="font-bold text-[#0C2417]">{websiteState}</span>
        <span className="text-[#90998f]">{org ? `/${org.slug}` : 'Your studio address'}</span>
        <span className="ml-auto text-[#879283]">
          {dirty
            ? 'Unsaved changes'
            : websiteState === 'Draft'
            ? 'Drafts stay private until you publish'
            : websiteState === 'Published with unpublished changes'
            ? 'You have unpublished changes'
            : 'All changes are published'}
        </span>
      </div>
      {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</p>}
      {loading && <p role="status" className="mb-5 text-sm text-[#40514E]">Loading your studio details…</p>}
      {!loading && !org && <a href="/login" className="underline text-sm text-[#133623]">Sign in to your studio account</a>}
      {content && <fieldset disabled={busy || loading || !org} className="min-w-0">
        <div className="mb-7 flex flex-wrap gap-7 border-b border-[#dce1d6]">
          {([{id:'templates',label:'01  Choose a template',icon:LayoutTemplate},{id:'edit',label:'02  Add your details',icon:Type},{id:'preview',label:'03  Preview & launch',icon:Eye}] as const).map(item => <button key={item.id} onClick={() => item.id === 'preview' ? preview() : setStep(item.id)} className={`flex items-center gap-2 border-b-2 pb-4 text-xs ${step === item.id ? 'border-[#234c39] font-semibold text-[#234c39]' : 'border-transparent text-[#899284]'}`}><item.icon size={15}/>{item.label}</button>)}
        </div>
        {step === 'templates' && <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-2xl font-bold text-[#0C2417]">Six designs. Six different first impressions.</h2><p className="mt-2 text-xs text-[#86907f]">Every template works with your images, sections, and classes.</p></div><span className="rounded-full border border-[#dce1d6] px-3 py-1.5 text-[10px] text-[#7b877b]">Made for every screen</span></div>
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {templates.map(template => <article key={template.code} className={`overflow-hidden rounded-xl border-2 bg-white transition hover:shadow-lg ${content.template_code === template.code ? 'border-[#315a40] shadow-sm' : 'border-[#e7e9e0]'}`}>
              <div className="relative overflow-hidden border-b border-[#e6e8df]" aria-hidden="true"><WebsiteFrame title={`${template.name} design`} src={`${API}/public/website-templates/${template.code}/preview`} thumbnail/><span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] uppercase tracking-wider text-[#5c6c5e]">{template.name}</span></div>
              <div className="p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-xl font-bold text-[#0C2417]">{template.name}</h3><div className="flex gap-1.5" aria-hidden>{[template.background,template.ink,template.accent].map(color => <span key={color} className="h-3 w-3 rounded-full border border-black/10" style={{background:color}}/>)}</div></div><p className="mt-2 min-h-10 text-xs leading-5 text-[#879181]">{template.description}</p><div className="mt-4 flex items-center justify-between gap-2"><a href={`${API}/public/website-templates/${template.code}/preview`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-[#74816f]"><Eye size={14}/>Preview design</a><button aria-pressed={content.template_code === template.code} onClick={() => change({template_code:template.code, primary_color:template.ink, accent_color:template.accent})} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${content.template_code === template.code ? 'bg-[#e9f0e4] font-semibold text-[#315a40]' : 'bg-[#f5f5ef] text-[#6b796a]'}`}>{content.template_code === template.code ? <><Check size={13}/>Selected</> : <>Use template</>}</button></div></div>
            </article>)}
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-[#85907f]">Up to 5 images · Flexible sections · Up to 9 cards per section</p><button onClick={() => setStep('edit')} className={primary}>Customize {selected?.name}</button></div>
        </>}
        {step === 'edit' && <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-2xl font-bold text-[#0C2417]">Your story, beautifully arranged.</h2><p className="mt-1 text-xs text-[#839080]">{selected?.name} · Change your design anytime. Your content stays with you.</p></div><button onClick={() => preview()} className={primary}><Eye size={14}/>Preview in new tab</button></div>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(350px,1fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-xl border border-[#e0e4d9] bg-white">
              <div className="flex border-b border-[#e0e4d9] bg-[#fafbf7]">{([{id:'content',label:'Your story',icon:Type},{id:'images',label:`Images (${content.images.length}/5)`,icon:ImagePlus},{id:'sections',label:`Sections (${content.sections.length})`,icon:Layers}] as const).map(item => <button key={item.id} onClick={() => setEditorTab(item.id)} className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-4 text-xs ${editorTab === item.id ? 'border-[#234c39] text-[#234c39] font-semibold' : 'border-transparent text-[#929b8b]'}`}><item.icon size={14}/>{item.label}</button>)}</div>
              <div className="space-y-5 p-5">
                {editorTab === 'content' && <>
                  <div className="rounded-lg bg-[#f3f6ee] p-3 text-xs leading-6 text-[#70806d]">Your studio name is <strong>{org?.name || 'Your studio'}</strong>. You can update it from your account profile.</div>
                  <Field label="Small introduction above your headline" value={content.eyebrow} max={100} onChange={eyebrow => change({eyebrow})}/>
                  <Field label="Main headline" value={content.headline} onChange={headline => change({headline})} help="Keep it short and memorable. Two to eight words works beautifully."/>
                  <Field label="Short introduction" value={content.subheadline} max={500} multiline onChange={subheadline => change({subheadline})}/>
                  <div className="border-t border-[#e6e9e0] pt-4"><h3 className="mb-4 font-serif text-lg font-bold text-[#0C2417]">Your story</h3><div className="space-y-4"><Field label="Story heading" value={content.about_title} max={180} onChange={about_title => change({about_title})}/><Field label="Tell visitors about your studio" value={content.about_text} max={5000} multiline onChange={about_text => change({about_text})}/></div></div>
                  <div className="border-t border-[#e6e9e0] pt-4"><h3 className="mb-4 font-serif text-lg font-bold text-[#0C2417]">The final invitation</h3><div className="space-y-4"><Field label="Closing headline" value={content.cta_title} max={180} onChange={cta_title => change({cta_title})}/><Field label="Closing message" value={content.cta_text} max={500} multiline onChange={cta_text => change({cta_text})}/></div></div>
                </>}
                {editorTab === 'images' && <>
                  <div><h3 className="font-serif text-xl font-bold text-[#0C2417]">A glimpse of your world.</h3><p className="mt-2 text-xs leading-6 text-[#879181]">Your first image is the cover. Reuse any of your five images in cards. Images travel with your exported website.</p></div>
                  {content.images.map((image, index) => <div key={image.id} className="rounded-xl border border-[#e1e5da] p-3"><div className="flex gap-3"><img src={imageUrl(image.url)} alt={image.alt} className="h-24 w-24 rounded-lg object-cover"/><div className="flex-1"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">Image {index+1}{index === 0 ? ' · Cover' : ''}</span><button aria-label={`Remove image ${index+1}`} onClick={() => changeImages(content.images.filter((_, i) => i !== index))} className="p-1 text-[#948e85]"><Trash2 size={14}/></button></div><label className="text-[10px] text-[#85907e]">Image description<input aria-label={`Image ${index+1} description`} value={image.alt} maxLength={200} onChange={e => changeImages(content.images.map((item,i) => i === index ? {...item, alt:e.target.value} : item))} className={`${inputStyle} mt-1 !p-2 !text-xs`}/></label>{index > 0 && <button onClick={() => changeImages([image,...content.images.filter(item => item.id !== image.id)])} className="mt-2 text-[10px] underline">Use as cover</button>}</div></div></div>)}
                  {content.images.length < MAX_IMAGES ? <label className="block cursor-pointer rounded-xl border-2 border-dashed border-[#cdd8c5] bg-[#f8faf4] p-5 text-center"><Upload size={22} className="mx-auto mb-2 text-[#84967a]"/><span className="block text-xs font-semibold">Add your photos</span><span className="mt-1 block text-[10px] text-[#95a08b]">PNG, JPEG or WebP · Up to 5 MB each</span><input aria-label="Upload website images" type="file" multiple accept="image/png,image/jpeg,image/webp" className="mt-3 w-full text-xs" onChange={e => { upload(e.target.files); e.target.value = ''; }}/></label> : <p className="rounded-lg bg-[#f2f5ec] p-3 text-xs text-[#75816d]">All five image slots are in use. Remove an image to add another.</p>}
                  <div><p className="mb-3 text-xs text-[#84907b]">Or start with a sample photograph</p><div className="grid grid-cols-5 gap-2">{samplePhotos.map(photo => <button key={photo.file} title={`Add ${photo.name} sample`} aria-label={`Add ${photo.name} sample`} disabled={content.images.length >= MAX_IMAGES} onClick={() => changeImages([...content.images,{id:crypto.randomUUID(),url:`/api/v1/public/website-assets/${photo.file}.jpg`,alt:photo.name}])} className="overflow-hidden rounded-lg disabled:opacity-35"><img src={`${API}/public/website-assets/${photo.file}.jpg`} alt={photo.name} className="h-16 w-full object-cover"/></button>)}</div></div>
                </>}
                {editorTab === 'sections' && <>
                  <div><h3 className="font-serif text-xl font-bold text-[#0C2417]">Build the rest of your story.</h3><p className="mt-2 text-xs leading-6 text-[#83907d]">Add sections for your offerings, teachers, approach, or anything you want to share. Each section holds up to nine cards, arranged in three, two, or one column to fit the screen.</p></div>
                  {content.sections.map((section, index) => <details key={section.id} open className="rounded-xl border border-[#dfe5d6] bg-[#fafbf7] p-4">
                    <summary className="cursor-pointer text-sm font-semibold">{index+1}. {section.title || 'Untitled section'} <span className="font-normal text-[#8c9883]">· {section.cards.length}/9 cards</span></summary>
                    <div className="mt-4 space-y-4"><div className="flex justify-end gap-2"><button aria-label={`Move section ${index+1} up`} disabled={index === 0} className="p-1 disabled:opacity-25" onClick={() => { const sections = [...content.sections]; [sections[index-1],sections[index]] = [sections[index],sections[index-1]]; change({sections}); }}><ArrowUp size={14}/></button><button aria-label={`Move section ${index+1} down`} disabled={index === content.sections.length-1} className="p-1 disabled:opacity-25" onClick={() => { const sections = [...content.sections]; [sections[index+1],sections[index]] = [sections[index],sections[index+1]]; change({sections}); }}><ArrowDown size={14}/></button><button aria-label={`Remove section ${index+1}`} className="p-1 text-[#a07b70]" onClick={() => change({sections:content.sections.filter((_,i) => i !== index)})}><Trash2 size={14}/></button></div>
                      <Field label={`Section ${index+1} title`} value={section.title} max={160} onChange={title => updateSection(index,{title})}/><Field label={`Section ${index+1} introduction`} value={section.description} max={1200} multiline onChange={description => updateSection(index,{description})}/>
                      {section.cards.map((card, cardIndex) => <div key={cardIndex} className="space-y-3 rounded-lg border border-[#e1e6d9] bg-white p-3"><div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#89957c]">Card {cardIndex+1}<button aria-label={`Remove card ${cardIndex+1} from section ${index+1}`} onClick={() => updateSection(index,{cards:section.cards.filter((_,i) => i !== cardIndex)})}><Trash2 size={13}/></button></div><Field label={`Section ${index+1} card ${cardIndex+1} title`} value={card.title} max={120} onChange={title => updateSection(index,{cards:section.cards.map((item,i) => i === cardIndex ? {...item,title} : item)})}/><Field label={`Section ${index+1} card ${cardIndex+1} description`} value={card.text} max={1000} multiline onChange={text => updateSection(index,{cards:section.cards.map((item,i) => i === cardIndex ? {...item,text} : item)})}/><label className="block text-xs font-semibold">Card image<select value={card.image_id || ''} className={`${inputStyle} mt-2`} onChange={e => updateSection(index,{cards:section.cards.map((item,i) => i === cardIndex ? {...item,image_id:e.target.value || null} : item)})}><option value="">No image</option>{content.images.map((image,i) => <option key={image.id} value={image.id}>Image {i+1} · {image.alt || 'Studio photo'}</option>)}</select></label></div>)}
                      <button disabled={section.cards.length >= MAX_CARDS} onClick={() => updateSection(index,{cards:[...section.cards,{title:'New card',text:'',image_id:null}]})} className={`${secondary} w-full`}><Plus size={14}/>{section.cards.length >= MAX_CARDS ? 'Nine-card limit reached' : 'Add card'}</button>
                    </div>
                  </details>)}
                  <button disabled={content.sections.length >= MAX_SECTIONS} onClick={() => change({sections:[...content.sections,{id:crypto.randomUUID(),title:'New section',description:'',cards:[]}]})} className={`${primary} w-full`}><Plus size={14}/>{content.sections.length >= MAX_SECTIONS ? 'Section limit reached' : 'Add section'}</button><p className="text-[10px] text-[#8c9787]">{content.sections.length}/{MAX_SECTIONS} sections · All on one page</p>
                </>}
              </div>
            </div>
            <div className="space-y-4 xl:sticky xl:top-5"><div className="overflow-hidden rounded-xl border border-[#e0e4d9] bg-[#e8ece2]"><div className="flex items-center justify-between p-3"><span className="text-[9px] uppercase tracking-wider text-[#839079]">{previewHtml ? (previewStale ? 'Preview has older changes' : 'Your latest preview') : `${selected?.name} · Design reference`}</span><div className="flex gap-1"><button aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setMobile(false)} className={`rounded p-1.5 ${!mobile ? 'bg-white' : ''}`}><Monitor size={15}/></button><button aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setMobile(true)} className={`rounded p-1.5 ${mobile ? 'bg-white' : ''}`}><Smartphone size={15}/></button></div></div><WebsiteFrame title="Website design preview" html={previewHtml || undefined} src={previewHtml ? undefined : `${API}/public/website-templates/${content.template_code}/preview`} mobile={mobile}/></div><button className={`${secondary} w-full`} onClick={() => preview(false)}><RefreshCw size={13}/>Update preview with my details</button><div className="rounded-xl border border-[#dce4d3] bg-[#eff4e8] p-4 text-xs leading-6 text-[#6c7f60]"><strong className="text-[#3d5b32]">Your classes are already connected.</strong><br/>Every Explore classes button opens /{org?.slug}/classes.</div></div>
          </div>
        </>}
        {step === 'preview' && <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-serif text-2xl font-bold text-[#0C2417]">Ready for your first impression.</h2><p className="mt-2 text-xs text-[#83907d]">Your preview opens in a new tab. Changes stay private until you publish.</p></div><div className="flex gap-2"><button className={secondary} onClick={() => setStep('edit')}><ArrowLeft size={14}/>Keep editing</button><button className={primary} onClick={() => preview()}><ExternalLink size={14}/>Open fresh preview</button></div></div>
          {previewStale && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Your content has changed since this preview. Open a fresh preview to see the latest version.</p>}
          <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-white p-5"><p className="text-[10px] uppercase tracking-wider text-[#8b9783]">Your design</p><p className="mt-2 font-serif text-xl font-bold text-[#0C2417]">{selected?.name}</p></div><div className="rounded-xl border bg-white p-5"><p className="text-[10px] uppercase tracking-wider text-[#8b9783]">Your page</p><p className="mt-2 font-serif text-xl font-bold text-[#0C2417]">{content.images.length} images · {content.sections.length} sections</p></div><div className="rounded-xl border bg-white p-5"><p className="text-[10px] uppercase tracking-wider text-[#8b9783]">Take it with you</p><button disabled={!release || websiteState === 'Draft'} onClick={download} className="mt-2 flex items-center gap-2 text-sm font-semibold disabled:text-[#a3ab9c] text-[#234c39]"><Download size={15}/>Download published HTML</button><p className="mt-2 text-[10px] text-[#8b9783]">{release && websiteState !== 'Draft' ? 'Opens on its own, with all images included.' : 'Publish your website first to generate and download the standalone artifact.'}</p></div></div>
          <div className="overflow-hidden rounded-xl border bg-[#e8ece2]"><div className="flex items-center justify-between p-3"><span className="text-[10px] uppercase tracking-wider text-[#839079]">Private preview</span><div className="flex gap-2"><button aria-label="Desktop preview" aria-pressed={!mobile} onClick={() => setMobile(false)} className={`rounded p-2 ${!mobile ? 'bg-white' : ''}`}><Monitor size={16}/></button><button aria-label="Mobile preview" aria-pressed={mobile} onClick={() => setMobile(true)} className={`rounded p-2 ${mobile ? 'bg-white' : ''}`}><Smartphone size={16}/></button></div></div><WebsiteFrame title="Your complete website preview" html={previewHtml || undefined} src={previewHtml ? undefined : `${API}/public/website-templates/${content.template_code}/preview`} mobile={mobile}/></div>
          {release && <p className="mt-4 text-xs text-[#8b9783]">Last published {new Date(release.created_at).toLocaleString()} · Version {release.version.slice(0,8)}</p>}
        </>}
      </fieldset>}
    </div>
  );

  if (embedded) {
    return <div className="space-y-6">{editorContent}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-[#243c30] lg:flex">
      <aside className="shrink-0 bg-[#142c22] p-6 text-white lg:w-60 lg:min-h-screen">
        <BrandLogo size={35} variant="white" textColor="text-white" showText/>
        <a href="/dashboard" className="mt-10 mb-7 flex items-center gap-2 text-xs text-white/60"><ArrowLeft size={15}/>Back to dashboard</a>
        <p className="mb-4 text-[9px] uppercase tracking-[.24em] text-[#a0b7a0]">Your studio, online</p>
        <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-sm"><Globe size={17}/>My Website</div>
        <div className="mt-8 border-t border-white/10 pt-6 text-xs leading-6 text-white/50">One page. Endless possibilities.<br/>A home for your story.</div>
      </aside>
      <main id="main-content" className="min-w-0 flex-1 p-5 sm:p-8 lg:p-9">
        {editorContent}
      </main>
    </div>
  );
}
