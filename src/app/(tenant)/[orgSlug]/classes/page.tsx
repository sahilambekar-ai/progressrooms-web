import { redirect } from 'next/navigation';
export default async function Classes({ params: pendingParams }: { params: Promise<{ orgSlug: string }> }) {
  const params = await pendingParams;
  redirect(`/${encodeURIComponent(params.orgSlug)}/explore`);
}
