import { redirect } from 'next/navigation';

export default function WebsiteRedirect() {
  redirect('/dashboard?tab=my-website');
}
