// FastAPI may return either a message or a list of field validation failures.
export function apiErrorMessage(data: unknown, fallback: string): string {
  const detail = data && typeof data === "object" && "detail" in data ? data.detail : undefined;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((issue: unknown) => {
      if (!issue || typeof issue !== "object" || !("msg" in issue) || typeof issue.msg !== "string") return [];
      const location = "loc" in issue && Array.isArray(issue.loc) ? issue.loc.filter(x => x !== "body").join(".") : "";
      return [location ? `${location}: ${issue.msg}` : issue.msg];
    });
    if (messages.length) return messages.join("; ");
  }
  return fallback;
}
