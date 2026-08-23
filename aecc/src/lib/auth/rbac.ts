import type { Permission, Role, RoleKey } from '@/lib/domain/types';

/**
 * The AECC permission matrix (guide §6).
 *
 * These grants are the single source of truth and are evaluated on the server for
 * every protected page and action. Hiding a control in the interface is a courtesy,
 * never the access control itself.
 */

const MEMBER_PERMISSIONS: Permission[] = [
  'members:read',
  'committees:read',
  'events:read',
  'events:register',
  'attendance:read',
  'points:read_own',
  'tasks:read',
  'projects:read',
  'challenges:read',
  'challenges:submit',
  'ideas:read',
  'ideas:submit',
  'announcements:read',
  'magazine:read',
  'magazine:write',
  'gallery:read',
  'resources:read',
  'badges:read',
  'certificates:read_own',
];

const COMMITTEE_LEADER_PERMISSIONS: Permission[] = [
  ...MEMBER_PERMISSIONS,
  'committees:write_own',
  'tasks:write_own',
  'attendance:write',
  'points:read',
];

const VICE_PRESIDENT_PERMISSIONS: Permission[] = [
  ...COMMITTEE_LEADER_PERMISSIONS,
  'members:write',
  'committees:write',
  'events:write',
  'tasks:write',
  'projects:write',
  'challenges:write',
  'ideas:moderate',
  'announcements:write',
  'gallery:write',
  'resources:write',
  'points:award',
  'certificates:read',
  'reports:read',
];

const PRESIDENT_PERMISSIONS: Permission[] = [
  ...VICE_PRESIDENT_PERMISSIONS,
  'magazine:review',
  'badges:award',
];

/** Supervisors are administrators — every capability, with auditing enforced. */
const ADMIN_PERMISSIONS: Permission[] = [
  ...PRESIDENT_PERMISSIONS,
  'members:notes',
  'users:admin',
  'roles:assign',
  'magazine:publish',
  'certificates:issue',
  'audit:read',
  'settings:write',
];

function unique(list: Permission[]): Permission[] {
  return Array.from(new Set(list));
}

export const ROLES: Record<RoleKey, Role> = {
  admin: {
    key: 'admin',
    name_en: 'Supervisor (Admin)',
    name_ar: 'مشرفة النادي (مسؤولة النظام)',
    rank: 100,
    permissions: unique(ADMIN_PERMISSIONS),
  },
  president: {
    key: 'president',
    name_en: 'Club President',
    name_ar: 'رئيسة النادي',
    rank: 80,
    permissions: unique(PRESIDENT_PERMISSIONS),
  },
  vice_president: {
    key: 'vice_president',
    name_en: 'Vice President',
    name_ar: 'نائبة الرئيسة',
    rank: 70,
    permissions: unique(VICE_PRESIDENT_PERMISSIONS),
  },
  committee_leader: {
    key: 'committee_leader',
    name_en: 'Committee Leader',
    name_ar: 'قائدة لجنة',
    rank: 50,
    permissions: unique(COMMITTEE_LEADER_PERMISSIONS),
  },
  member: {
    key: 'member',
    name_en: 'Member',
    name_ar: 'عضوة',
    rank: 10,
    permissions: unique(MEMBER_PERMISSIONS),
  },
};

export const ROLE_ORDER: RoleKey[] = [
  'admin',
  'president',
  'vice_president',
  'committee_leader',
  'member',
];

/** All permissions in a stable order — used by the roles matrix screen. */
export const ALL_PERMISSIONS: Permission[] = unique(ADMIN_PERMISSIONS).sort();

export function permissionsFor(role: RoleKey): Permission[] {
  return ROLES[role]?.permissions ?? ROLES.member.permissions;
}

export function can(role: RoleKey, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}

export function canAny(role: RoleKey, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

export function canAll(role: RoleKey, permissions: Permission[]): boolean {
  return permissions.every((permission) => can(role, permission));
}

/** Supervisors and elected officers see club-wide administrative surfaces. */
export function isAdmin(role: RoleKey): boolean {
  return role === 'admin';
}

export function isStaff(role: RoleKey): boolean {
  return role === 'admin' || role === 'president' || role === 'vice_president';
}

export function isLeadership(role: RoleKey): boolean {
  return isStaff(role) || role === 'committee_leader';
}

/**
 * A member may never award points to herself, regardless of her role. Awarding is
 * checked here rather than in the interface so the rule holds for every caller.
 */
export function canAwardPointsTo(actorRole: RoleKey, actorId: string, targetId: string): boolean {
  if (!can(actorRole, 'points:award')) return false;
  if (actorId === targetId) return false;
  return true;
}

/** Role changes are restricted to supervisors (guide §6). */
export function canChangeRole(actorRole: RoleKey): boolean {
  return can(actorRole, 'roles:assign');
}
