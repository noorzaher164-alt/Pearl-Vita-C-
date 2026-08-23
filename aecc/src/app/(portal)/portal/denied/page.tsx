import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';
import { EmptyState, LinkButton } from '@/components/ui';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = { title: 'Permission denied' };

export default async function DeniedPage() {
  const { d } = await getT();
  return (
    <div className="mx-auto max-w-xl py-16">
      <EmptyState
        icon={<ShieldAlert />}
        title={d.auth.permissionDenied}
        body={d.auth.permissionDeniedBody}
        action={
          <LinkButton href="/portal" variant="outline">
            {d.errors.goDashboard}
          </LinkButton>
        }
      />
    </div>
  );
}
