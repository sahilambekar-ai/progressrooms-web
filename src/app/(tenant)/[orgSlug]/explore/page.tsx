import { notFound } from 'next/navigation';
import { fetchPublicOrganization } from '@/lib/api';
import { StudioExplore } from '@/components/StudioExplore';
export default async function Explore({ params }: { params: { orgSlug: string } }) {
  const data = await fetchPublicOrganization(params.orgSlug);
  if (!data) notFound();
  return <StudioExplore data={data} />;
}
