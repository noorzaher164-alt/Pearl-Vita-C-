import type { Dictionary } from '@/lib/i18n';
import type { Permission, RoleKey } from '@/lib/domain/types';
import { canAny } from '@/lib/auth/rbac';

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: string;
  /** The viewer needs at least one of these to see the item. */
  permissions: Permission[];
  /** Additional restriction beyond permissions. */
  adminOnly?: boolean;
}

export interface NavGroup {
  key: string;
  label: string;
  items: NavItem[];
}

/**
 * The authenticated navigation, mirroring the guide's site map (§7).
 * Items are filtered by permission, but the server-side guard on each route is what
 * actually enforces access — hiding a link is presentation, not security.
 */
export function navigationFor(role: RoleKey, d: Dictionary): NavGroup[] {
  const groups: NavGroup[] = [
    {
      key: 'club',
      label: d.nav.groupClub,
      items: [
        { key: 'dashboard', href: '/portal', label: d.nav.dashboard, icon: 'layout-dashboard', permissions: [] },
        { key: 'members', href: '/portal/members', label: d.nav.members, icon: 'users', permissions: ['members:read'] },
        { key: 'committees', href: '/portal/committees', label: d.nav.committees, icon: 'network', permissions: ['committees:read'] },
        { key: 'events', href: '/portal/events', label: d.nav.events, icon: 'calendar-days', permissions: ['events:read'] },
        { key: 'attendance', href: '/portal/attendance', label: d.nav.attendance, icon: 'clipboard-check', permissions: ['attendance:read'] },
        { key: 'points', href: '/portal/points', label: d.nav.points, icon: 'sparkles', permissions: ['points:read', 'points:award'] },
        { key: 'leaderboard', href: '/portal/leaderboard', label: d.nav.leaderboard, icon: 'trophy', permissions: [] },
      ],
    },
    {
      key: 'activity',
      label: d.nav.groupActivity,
      items: [
        { key: 'tasks', href: '/portal/tasks', label: d.nav.tasks, icon: 'list-checks', permissions: ['tasks:read'] },
        { key: 'projects', href: '/portal/projects', label: d.nav.projects, icon: 'flask-conical', permissions: ['projects:read'] },
        { key: 'challenges', href: '/portal/challenges', label: d.nav.challenges, icon: 'brain', permissions: ['challenges:read'] },
        { key: 'ideas', href: '/portal/ideas', label: d.nav.ideas, icon: 'lightbulb', permissions: ['ideas:read'] },
        { key: 'achievements', href: '/portal/achievements', label: d.nav.achievements, icon: 'medal', permissions: ['badges:read'] },
        { key: 'announcements', href: '/portal/announcements', label: d.nav.announcements, icon: 'megaphone', permissions: ['announcements:read'] },
      ],
    },
    {
      key: 'publishing',
      label: d.nav.groupPublishing,
      items: [
        { key: 'magazine', href: '/portal/magazine', label: d.nav.magazine, icon: 'newspaper', permissions: ['magazine:read'] },
        { key: 'gallery', href: '/portal/gallery', label: d.nav.gallery, icon: 'images', permissions: ['gallery:read'] },
        { key: 'resources', href: '/portal/resources', label: d.nav.resources, icon: 'library', permissions: ['resources:read'] },
        { key: 'certificates', href: '/portal/certificates', label: d.nav.certificates, icon: 'scroll-text', permissions: ['certificates:read_own', 'certificates:read'] },
      ],
    },
    {
      key: 'admin',
      label: d.nav.groupAdmin,
      items: [
        { key: 'reports', href: '/portal/reports', label: d.nav.reports, icon: 'chart-column', permissions: ['reports:read'] },
        { key: 'users', href: '/portal/admin/users', label: d.nav.users, icon: 'user-cog', permissions: ['users:admin'] },
        { key: 'roles', href: '/portal/admin/roles', label: d.nav.roles, icon: 'shield-check', permissions: ['users:admin'] },
        { key: 'audit', href: '/portal/admin/audit', label: d.nav.audit, icon: 'history', permissions: ['audit:read'] },
        { key: 'club-settings', href: '/portal/admin/club-settings', label: d.nav.clubSettings, icon: 'sliders-horizontal', permissions: ['settings:write'] },
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.adminOnly && role !== 'admin') return false;
        if (item.permissions.length === 0) return true;
        return canAny(role, item.permissions);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

/** Longest-prefix match so nested routes highlight their parent nav item. */
export function activeNavKey(pathname: string, groups: NavGroup[]): string {
  let best = '';
  let bestLength = -1;
  for (const group of groups) {
    for (const item of group.items) {
      const isMatch = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (isMatch && item.href.length > bestLength) {
        best = item.key;
        bestLength = item.href.length;
      }
    }
  }
  return best;
}
