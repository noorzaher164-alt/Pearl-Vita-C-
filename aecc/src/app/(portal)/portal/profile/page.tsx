import { redirect } from 'next/navigation';
import { requireViewer } from '@/lib/auth/current-user';

/** A member's own profile is the same detailed view as any other member profile. */
export default async function ProfileRedirect() {
  const viewer = await requireViewer('/portal/profile');
  redirect(`/portal/members/${viewer.id}`);
}
