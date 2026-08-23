import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMember } from '@/lib/db/queries';
import type { MemberView, Permission, RoleKey } from '@/lib/domain/types';
import { can, canAny, isAdmin, isLeadership, isStaff } from './rbac';
import { SESSION_COOKIE, readSessionToken } from './session';

export interface Viewer extends MemberView {
  permissions: {
    can: (permission: Permission) => boolean;
    canAny: (permissions: Permission[]) => boolean;
  };
  isAdmin: boolean;
  isStaff: boolean;
  isLeadership: boolean;
}

function decorate(member: MemberView): Viewer {
  const role: RoleKey = member.role;
  return {
    ...member,
    permissions: {
      can: (permission) => can(role, permission),
      canAny: (permissions) => canAny(role, permissions),
    },
    isAdmin: isAdmin(role),
    isStaff: isStaff(role),
    isLeadership: isLeadership(role),
  };
}

/** Resolves the signed-in viewer, or null. Safe to call from any server component. */
export async function currentViewer(): Promise<Viewer | null> {
  const store = await cookies();
  const payload = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const member = await getMember(payload.sub);
  if (!member) return null;
  // An account deactivated after the cookie was issued loses access immediately.
  if (member.status !== 'active') return null;

  return decorate(member);
}

/** Requires a signed-in viewer; redirects to the login screen otherwise. */
export async function requireViewer(returnTo?: string): Promise<Viewer> {
  const viewer = await currentViewer();
  if (!viewer) {
    redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : '/login');
  }
  return viewer;
}

/**
 * Requires a specific capability. This is the server-side gate referenced by the
 * guide's permission principles — the interface may also hide the control, but this
 * is what actually protects the data.
 */
export async function requirePermission(
  permission: Permission | Permission[],
  returnTo?: string,
): Promise<Viewer> {
  const viewer = await requireViewer(returnTo);
  const list = Array.isArray(permission) ? permission : [permission];
  if (!viewer.permissions.canAny(list)) {
    redirect('/portal/denied');
  }
  return viewer;
}

export async function requireAdmin(returnTo?: string): Promise<Viewer> {
  const viewer = await requireViewer(returnTo);
  if (!viewer.isAdmin) redirect('/portal/denied');
  return viewer;
}
