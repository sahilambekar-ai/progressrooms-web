// Match the API's 8–128 Unicode code points; preserve spaces exactly.
export function passwordPolicyError(password: string): string | null {
  const length = Array.from(password).length;
  return length < 8 || length > 128 ? "Password must be 8–128 characters." : null;
}
