import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function forward(request: NextRequest, { params: pendingParams }: { params: Promise<{ path: string[] }> }) {
  const params = await pendingParams;
  const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const url = `${base.replace(/\/$/, "")}/admin/communication/${params.path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of ["authorization", "content-type"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.text(),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ detail: "The communication API is unavailable. Check that the API server is running." }, { status: 502 });
  }
}

export { forward as GET, forward as PATCH, forward as POST };
