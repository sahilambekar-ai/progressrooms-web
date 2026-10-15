import { redirect } from 'next/navigation';

export default function WebsiteBuilderPage() {
  redirect('/dashboard?tab=my-website');
}
