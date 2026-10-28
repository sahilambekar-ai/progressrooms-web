import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

/** The public page is complete server-rendered HTML; it never hydrates a React app. */
export async function GET(request: NextRequest, { params: pendingParams }: { params: Promise<{ orgSlug: string }> }) {
  const params = await pendingParams;
  const api = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  try {
    const response = await fetch(`${api}/public/organizations/${encodeURIComponent(params.orgSlug)}/website-html`, { cache:'no-store' });
    if (response.status === 409) return Response.redirect(new URL(`/${encodeURIComponent(params.orgSlug)}/classes`, request.url), 307);
    if (!response.ok) return new Response(response.status === 404 ? 'Studio not found.' : 'This website is temporarily unavailable. Please try again shortly.', { status:response.status === 404 ? 404 : 503, headers:{'Content-Type':'text/plain; charset=utf-8'} });
    const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
    const browserApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const html = (await response.text()).replaceAll(`/${params.orgSlug}/classes`, `/${params.orgSlug}/explore`)
      .replace(/href="https?:\/\/[^"/]+(\/[^"/]+\/explore)"/g, 'href="$1"')
      .replace('</nav>', `<a id="studio-account" class="studio-account" style="display:inline-flex;align-items:center;justify-content:center;min-height:44px;font-weight:600" data-api="${escape(browserApi)}" href="/login?next=${encodeURIComponent('/' + params.orgSlug)}">Log in</a></nav>`)
      .replace('</body>', '<script src="/studio-account.js" defer></script></body>');
    return new Response(html, { headers:{
      'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store',
      'Content-Security-Policy':`default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'self'; connect-src ${new URL(browserApi, request.url).origin}; base-uri 'none'; form-action 'none'`,
      'X-Content-Type-Options':'nosniff',
    } });
  } catch {
    return new Response('This website is temporarily unavailable. Please try again shortly.', { status:503 });
  }
}
