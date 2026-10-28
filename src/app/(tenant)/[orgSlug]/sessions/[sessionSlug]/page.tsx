import { permanentRedirect } from "next/navigation";
export default async function LegacyClassLink({ params: pendingParams }: { params: Promise<{ orgSlug: string; sessionSlug: string }> }) {
  const params = await pendingParams;
  permanentRedirect(`/${params.orgSlug}/classes/${params.sessionSlug}`);
}
