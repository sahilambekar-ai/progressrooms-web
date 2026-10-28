const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function logout(): Promise<void> {
  const token = localStorage.getItem("pr_access_token");
  if (token) {
    const response = await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    // An expired/revoked token is already unusable. Keep credentials available
    // for a retry on outages; never claim revocation when the API failed.
    if (!response.ok && response.status !== 401) {
      throw new Error("Could not sign out on the server. Please try again.");
    }
  }
  localStorage.removeItem("pr_access_token");
  localStorage.removeItem("pr_user");
}
