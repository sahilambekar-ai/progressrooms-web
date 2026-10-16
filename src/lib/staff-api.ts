export const staffApi = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("pr_access_token") || ""}`, ...options.headers },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(typeof data?.detail === "string" ? data.detail : "Please check the form and try again.");
  return data;
};
