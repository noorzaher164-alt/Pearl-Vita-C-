import type { AccountStatus, CommitteeSlug, RoleKey } from '@/lib/domain/types';

/**
 * Staff accounts for the platform.
 * Student members will be added through the admin interface.
 */

export interface SeedPerson {
  id: string;
  username: string;
  email: string;
  password: string;
  role: RoleKey;
  committee: CommitteeSlug | null;
  name_en: string;
  name_ar: string;
  grade: string;
  status: AccountStatus;
  joined: string;
  bio_en: string;
  bio_ar: string;
  seedPoints: number;
}

export const SEED_PEOPLE: SeedPerson[] = [
  {
    id: 'u-031',
    username: 'nourhan.zaher',
    email: 'noorzaher164@gmail.com',
    password: 'Admin2027',
    role: 'admin',
    committee: null,
    name_en: 'Nourhan Zaher',
    name_ar: 'نورهان زاهر',
    grade: 'Chemistry Department',
    status: 'active',
    joined: '2024-09-01',
    bio_en: 'Club coordinator and platform manager.',
    bio_ar: 'منسقة النادي ومديرة المنصة.',
    seedPoints: 0,
  },
];

export const PREVIEW_ACCOUNTS = [
  { username: 'nourhan.zaher', password: 'Admin2027', roleKey: 'admin' as RoleKey },
];
