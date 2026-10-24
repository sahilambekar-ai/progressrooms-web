const pending = new Map<string, Promise<any>>();

export function canManageCommunications() {
  try {
    return !!localStorage.getItem("pr_access_token") &&
      ["SUPER_ADMIN", "STUDIO"].includes(JSON.parse(localStorage.getItem("pr_user") || "null")?.role);
  } catch { return false; }
}

export async function communicationRequest(path: string, options: RequestInit = {}) {
  if (!canManageCommunications()) throw new Error("Sign in with a studio test account or superadmin account to use communication controls.");
  const token = localStorage.getItem("pr_access_token")!;
  const key = `${token}:${path}`;
  const read = !options.method || options.method === "GET";
  if (read && pending.has(key)) return pending.get(key);
  const request = (async () => {
    const response = await fetch(`/api/communication${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) throw new Error("Your session has expired. Sign in again to manage communications.");
      if (response.status === 403) throw new Error("Studio testing requires local development access. Shared environments require a superadmin account.");
      throw new Error(typeof data.detail === "string" ? data.detail : "Communication request failed. Please try again.");
    }
    return data;
  })();
  if (read) pending.set(key, request);
  try { return await request; }
  finally { if (read) pending.delete(key); }
}
