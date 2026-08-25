import 'server-only';

import type {
  Announcement,
  ArticleStatus,
  AttendanceRecord,
  Badge,
  Certificate,
  Challenge,
  ClubEvent,
  Committee,
  Database,
  GalleryAlbum,
  ID,
  Idea,
  MagazineArticle,
  MagazineCategory,
  MagazineIssue,
  MemberView,
  PointTransaction,
  Project,
  Resource,
  RoleKey,
  Task,
} from '@/lib/domain/types';
import { db } from './store';

/* -------------------------------------------------------------------------- */
/* Members                                                                    */
/* -------------------------------------------------------------------------- */

function attendanceRateFor(database: Database, userId: ID): number {
  const records = database.attendance_records.filter((r) => r.user_id === userId);
  if (records.length === 0) return 0;
  const credited = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  return Math.round((credited / records.length) * 100);
}

function pointsFor(database: Database, userId: ID): number {
  return database.point_transactions
    .filter((t) => t.user_id === userId)
    .reduce((sum, t) => sum + t.points, 0);
}

function toMemberView(database: Database, userId: ID): MemberView | null {
  const user = database.users.find((u) => u.id === userId);
  const profile = database.profiles.find((p) => p.user_id === userId);
  if (!user || !profile) return null;
  const role = (database.user_roles.find((r) => r.user_id === userId)?.role_key ?? 'member') as RoleKey;
  const membership = database.committee_members.find((cm) => cm.user_id === userId);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    role,
    full_name_en: profile.full_name_en,
    full_name_ar: profile.full_name_ar,
    grade: profile.grade,
    avatar_url: profile.avatar_url,
    bio_en: profile.bio_en,
    bio_ar: profile.bio_ar,
    joined_at: profile.joined_at,
    phone: profile.phone,
    guardian_contact: profile.guardian_contact,
    committee_id: membership?.committee_id ?? null,
    points: pointsFor(database, userId),
    attendance_rate: attendanceRateFor(database, userId),
    badge_count: database.user_badges.filter((ub) => ub.user_id === userId).length,
    last_login_at: user.last_login_at,
  };
}

export async function getMember(userId: ID): Promise<MemberView | null> {
  const database = await db();
  return toMemberView(database, userId);
}

export async function getMemberByUsername(username: string): Promise<MemberView | null> {
  const database = await db();
  const user = database.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  return user ? toMemberView(database, user.id) : null;
}

export interface MemberFilters {
  search?: string;
  grade?: string;
  committeeId?: string;
  role?: RoleKey;
  status?: string;
  /** Exclude supervisors from the student directory. */
  studentsOnly?: boolean;
}

export async function listMembers(filters: MemberFilters = {}): Promise<MemberView[]> {
  const database = await db();
  let rows = database.users
    .map((u) => toMemberView(database, u.id))
    .filter((m): m is MemberView => m !== null);

  if (filters.studentsOnly) rows = rows.filter((m) => m.role !== 'admin');
  if (filters.grade) rows = rows.filter((m) => m.grade === filters.grade);
  if (filters.committeeId) rows = rows.filter((m) => m.committee_id === filters.committeeId);
  if (filters.role) rows = rows.filter((m) => m.role === filters.role);
  if (filters.status) rows = rows.filter((m) => m.status === filters.status);
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    rows = rows.filter(
      (m) =>
        m.full_name_en.toLowerCase().includes(q) ||
        m.full_name_ar.includes(filters.search as string) ||
        m.username.toLowerCase().includes(q),
    );
  }

  return rows.sort((a, b) => a.full_name_en.localeCompare(b.full_name_en));
}

export async function listGrades(): Promise<string[]> {
  const database = await db();
  return Array.from(new Set(database.profiles.map((p) => p.grade)))
    .filter((g) => g.startsWith('Grade'))
    .sort();
}

export async function getAdminNotes(userId: ID): Promise<string | null> {
  const database = await db();
  return database.profiles.find((p) => p.user_id === userId)?.admin_notes ?? null;
}

/* -------------------------------------------------------------------------- */
/* Committees                                                                 */
/* -------------------------------------------------------------------------- */

export interface CommitteeView extends Committee {
  leader: MemberView | null;
  members: MemberView[];
  member_count: number;
  active_project: Project | null;
  open_tasks: number;
  progress: number;
}

async function buildCommitteeView(database: Database, committee: Committee): Promise<CommitteeView> {
  const memberIds = database.committee_members
    .filter((cm) => cm.committee_id === committee.id)
    .map((cm) => cm.user_id);
  const members = memberIds
    .map((id) => toMemberView(database, id))
    .filter((m): m is MemberView => m !== null);
  const projects = database.projects.filter((p) => p.committee_id === committee.id);
  const activeProject =
    projects.find((p) => p.status === 'active') ?? projects.find((p) => p.status === 'review') ?? projects[0] ?? null;
  const tasks = database.tasks.filter((t) => t.committee_id === committee.id);
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return {
    ...committee,
    leader: committee.leader_id ? toMemberView(database, committee.leader_id) : null,
    members: members.sort((a, b) => (a.role === 'committee_leader' ? -1 : b.role === 'committee_leader' ? 1 : 0)),
    member_count: members.length,
    active_project: activeProject,
    open_tasks: tasks.filter((t) => t.status !== 'done').length,
    progress: tasks.length === 0 ? (activeProject?.progress ?? 0) : Math.round((doneTasks / tasks.length) * 100),
  };
}

export async function listCommittees(): Promise<CommitteeView[]> {
  const database = await db();
  return Promise.all(
    database.committees.filter((c) => !c.archived).map((c) => buildCommitteeView(database, c)),
  );
}

export async function getCommitteeBySlug(slug: string): Promise<CommitteeView | null> {
  const database = await db();
  const committee = database.committees.find((c) => c.slug === slug);
  return committee ? buildCommitteeView(database, committee) : null;
}

export async function getCommittee(id: ID): Promise<Committee | null> {
  const database = await db();
  return database.committees.find((c) => c.id === id) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export interface EventView extends ClubEvent {
  organizer: MemberView | null;
  committee: Committee | null;
  registered_count: number;
  pending_count: number;
  spots_left: number;
  attendees: MemberView[];
  viewer_registration: 'registered' | 'pending' | 'none';
}

function buildEventView(database: Database, event: ClubEvent, viewerId?: ID): EventView {
  const registrations = database.event_registrations.filter((r) => r.event_id === event.id);
  const confirmed = registrations.filter((r) => r.status === 'registered');
  const pending = registrations.filter((r) => r.status === 'pending');
  const viewerReg = viewerId ? registrations.find((r) => r.user_id === viewerId) : undefined;

  return {
    ...event,
    organizer: toMemberView(database, event.organizer_id),
    committee: database.committees.find((c) => c.id === event.committee_id) ?? null,
    registered_count: confirmed.length,
    pending_count: pending.length,
    spots_left: Math.max(0, event.capacity - confirmed.length),
    attendees: confirmed
      .map((r) => toMemberView(database, r.user_id))
      .filter((m): m is MemberView => m !== null),
    viewer_registration:
      viewerReg?.status === 'registered' ? 'registered' : viewerReg?.status === 'pending' ? 'pending' : 'none',
  };
}

export async function listEvents(viewerId?: ID): Promise<EventView[]> {
  const database = await db();
  return database.events
    .map((e) => buildEventView(database, e, viewerId))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

export async function getEvent(id: ID, viewerId?: ID): Promise<EventView | null> {
  const database = await db();
  const event = database.events.find((e) => e.id === id);
  return event ? buildEventView(database, event, viewerId) : null;
}

export async function listUpcomingEvents(viewerId?: ID, limit = 4): Promise<EventView[]> {
  const all = await listEvents(viewerId);
  const now = Date.now();
  return all
    .filter((e) => new Date(e.starts_at).getTime() >= now && e.status !== 'cancelled')
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                 */
/* -------------------------------------------------------------------------- */

export interface AttendanceSessionView {
  id: ID;
  title_en: string;
  title_ar: string;
  kind: string;
  held_at: string;
  committee: Committee | null;
  event: ClubEvent | null;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

export async function listAttendanceSessions(): Promise<AttendanceSessionView[]> {
  const database = await db();
  return database.attendance_sessions
    .map((session) => {
      const records = database.attendance_records.filter((r) => r.session_id === session.id);
      const count = (status: string) => records.filter((r) => r.status === status).length;
      const present = count('present');
      const late = count('late');
      return {
        id: session.id,
        title_en: session.title_en,
        title_ar: session.title_ar,
        kind: session.kind,
        held_at: session.held_at,
        committee: database.committees.find((c) => c.id === session.committee_id) ?? null,
        event: database.events.find((e) => e.id === session.event_id) ?? null,
        present,
        absent: count('absent'),
        late,
        excused: count('excused'),
        total: records.length,
        rate: records.length === 0 ? 0 : Math.round(((present + late) / records.length) * 100),
      };
    })
    .sort((a, b) => new Date(b.held_at).getTime() - new Date(a.held_at).getTime());
}

export interface AttendanceRow {
  member: MemberView;
  record: AttendanceRecord | null;
}

export async function getAttendanceSession(
  sessionId: ID,
): Promise<{ session: AttendanceSessionView; rows: AttendanceRow[] } | null> {
  const database = await db();
  const raw = database.attendance_sessions.find((s) => s.id === sessionId);
  if (!raw) return null;
  const sessions = await listAttendanceSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const cohortIds = raw.committee_id
    ? database.committee_members.filter((cm) => cm.committee_id === raw.committee_id).map((cm) => cm.user_id)
    : database.users
        .filter((u) => u.status === 'active')
        .filter((u) => (database.user_roles.find((r) => r.user_id === u.id)?.role_key ?? 'member') !== 'admin')
        .map((u) => u.id);

  const recorded = database.attendance_records.filter((r) => r.session_id === sessionId);
  const ids = Array.from(new Set([...cohortIds, ...recorded.map((r) => r.user_id)]));

  const rows: AttendanceRow[] = ids
    .map((id) => {
      const member = toMemberView(database, id);
      if (!member) return null;
      return { member, record: recorded.find((r) => r.user_id === id) ?? null };
    })
    .filter((row): row is AttendanceRow => row !== null)
    .sort((a, b) => a.member.full_name_en.localeCompare(b.member.full_name_en));

  return { session, rows };
}

export async function getMemberAttendance(userId: ID) {
  const database = await db();
  return database.attendance_records
    .filter((r) => r.user_id === userId)
    .map((record) => ({
      record,
      session: database.attendance_sessions.find((s) => s.id === record.session_id) ?? null,
    }))
    .filter((row) => row.session !== null)
    .sort(
      (a, b) => new Date(b.session!.held_at).getTime() - new Date(a.session!.held_at).getTime(),
    );
}

export async function overallAttendanceRate(): Promise<number> {
  const database = await db();
  const records = database.attendance_records;
  if (records.length === 0) return 0;
  const credited = records.filter((r) => r.status === 'present' || r.status === 'late').length;
  return Math.round((credited / records.length) * 100);
}

export async function attendanceByCommittee(): Promise<{ committee: Committee; rate: number }[]> {
  const database = await db();
  return database.committees.map((committee) => {
    const memberIds = database.committee_members
      .filter((cm) => cm.committee_id === committee.id)
      .map((cm) => cm.user_id);
    const records = database.attendance_records.filter((r) => memberIds.includes(r.user_id));
    const credited = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    return {
      committee,
      rate: records.length === 0 ? 0 : Math.round((credited / records.length) * 100),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* Points & leaderboard                                                       */
/* -------------------------------------------------------------------------- */

export interface PointRow extends PointTransaction {
  member: MemberView | null;
  awarded_by_member: MemberView | null;
}

export async function listPointTransactions(userId?: ID, limit?: number): Promise<PointRow[]> {
  const database = await db();
  let rows = database.point_transactions;
  if (userId) rows = rows.filter((t) => t.user_id === userId);
  const mapped = rows
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((t) => ({
      ...t,
      member: toMemberView(database, t.user_id),
      awarded_by_member: toMemberView(database, t.awarded_by),
    }));
  return limit ? mapped.slice(0, limit) : mapped;
}

export async function listPointReasons() {
  const database = await db();
  return database.point_reasons.filter((r) => r.active);
}

export async function totalClubPoints(): Promise<number> {
  const database = await db();
  return database.point_transactions.reduce((sum, t) => sum + t.points, 0);
}

export type LeaderboardPeriod = 'month' | 'semester' | 'all';

export interface LeaderboardEntry {
  rank: number;
  member: MemberView;
  committee: Committee | null;
  points: number;
  topBadge: Badge | null;
}

export async function getLeaderboard(
  period: LeaderboardPeriod = 'all',
  limit?: number,
): Promise<LeaderboardEntry[]> {
  const database = await db();
  const now = Date.now();
  const cutoff =
    period === 'month' ? now - 30 * 86_400_000 : period === 'semester' ? now - 120 * 86_400_000 : 0;

  const totals = new Map<ID, number>();
  for (const t of database.point_transactions) {
    if (new Date(t.created_at).getTime() < cutoff) continue;
    totals.set(t.user_id, (totals.get(t.user_id) ?? 0) + t.points);
  }

  const entries = Array.from(totals.entries())
    .map(([userId, points]) => {
      const member = toMemberView(database, userId);
      if (!member || member.role === 'admin') return null;
      const badgeIds = database.user_badges.filter((ub) => ub.user_id === userId).map((ub) => ub.badge_id);
      const tierRank = { honour: 3, distinction: 2, foundation: 1 } as const;
      const topBadge =
        database.badges
          .filter((b) => badgeIds.includes(b.id))
          .sort((a, b) => tierRank[b.tier] - tierRank[a.tier])[0] ?? null;
      return {
        member,
        committee: database.committees.find((c) => c.id === member.committee_id) ?? null,
        points,
        topBadge,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => b.points - a.points || a.member.full_name_en.localeCompare(b.member.full_name_en))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return limit ? entries.slice(0, limit) : entries;
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                     */
/* -------------------------------------------------------------------------- */

export interface BadgeView extends Badge {
  awarded_count: number;
  holders: MemberView[];
}

export async function listBadges(): Promise<BadgeView[]> {
  const database = await db();
  return database.badges.map((badge) => {
    const holders = database.user_badges
      .filter((ub) => ub.badge_id === badge.id)
      .map((ub) => toMemberView(database, ub.user_id))
      .filter((m): m is MemberView => m !== null);
    return { ...badge, awarded_count: holders.length, holders };
  });
}

export async function listBadgeAwards(limit?: number) {
  const database = await db();
  const rows = database.user_badges
    .slice()
    .sort((a, b) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime())
    .map((ub) => ({
      award: ub,
      badge: database.badges.find((b) => b.id === ub.badge_id) ?? null,
      member: toMemberView(database, ub.user_id),
      awardedBy: toMemberView(database, ub.awarded_by),
    }));
  return limit ? rows.slice(0, limit) : rows;
}

export async function getMemberBadges(userId: ID) {
  const database = await db();
  return database.user_badges
    .filter((ub) => ub.user_id === userId)
    .map((ub) => ({ award: ub, badge: database.badges.find((b) => b.id === ub.badge_id) ?? null }))
    .filter((row) => row.badge !== null);
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

export interface TaskView extends Task {
  assignees: MemberView[];
  committee: Committee | null;
  project: Project | null;
  event: ClubEvent | null;
}

export async function listTasks(filter: { userId?: ID; committeeId?: ID; projectId?: ID } = {}): Promise<TaskView[]> {
  const database = await db();
  let rows = database.tasks;
  if (filter.committeeId) rows = rows.filter((t) => t.committee_id === filter.committeeId);
  if (filter.projectId) rows = rows.filter((t) => t.project_id === filter.projectId);
  if (filter.userId) {
    const mine = new Set(
      database.task_assignees.filter((a) => a.user_id === filter.userId).map((a) => a.task_id),
    );
    rows = rows.filter((t) => mine.has(t.id));
  }

  return rows.map((task) => ({
    ...task,
    assignees: database.task_assignees
      .filter((a) => a.task_id === task.id)
      .map((a) => toMemberView(database, a.user_id))
      .filter((m): m is MemberView => m !== null),
    committee: database.committees.find((c) => c.id === task.committee_id) ?? null,
    project: database.projects.find((p) => p.id === task.project_id) ?? null,
    event: database.events.find((e) => e.id === task.event_id) ?? null,
  }));
}

export async function listStaffTasks(createdBy: ID): Promise<TaskView[]> {
  const database = await db();
  const rows = database.tasks.filter((t) => t.created_by === createdBy);
  return rows.map((task) => ({
    ...task,
    assignees: database.task_assignees
      .filter((a) => a.task_id === task.id)
      .map((a) => toMemberView(database, a.user_id))
      .filter((m): m is MemberView => m !== null),
    committee: database.committees.find((c) => c.id === task.committee_id) ?? null,
    project: database.projects.find((p) => p.id === task.project_id) ?? null,
    event: database.events.find((e) => e.id === task.event_id) ?? null,
  }));
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export interface ProjectView extends Project {
  leader: MemberView | null;
  supervisor: MemberView | null;
  committee: Committee | null;
  team: { member: MemberView; role_in_project: string }[];
  milestones: { id: ID; title_en: string; title_ar: string; due_date: string; done: boolean }[];
  files: Database['project_files'];
  tasks: TaskView[];
}

async function buildProjectView(database: Database, project: Project): Promise<ProjectView> {
  const tasks = await listTasks({ projectId: project.id });
  return {
    ...project,
    leader: toMemberView(database, project.leader_id),
    supervisor: project.supervisor_id ? toMemberView(database, project.supervisor_id) : null,
    committee: database.committees.find((c) => c.id === project.committee_id) ?? null,
    team: database.project_members
      .filter((pm) => pm.project_id === project.id)
      .map((pm) => ({ member: toMemberView(database, pm.user_id), role_in_project: pm.role_in_project }))
      .filter((row): row is { member: MemberView; role_in_project: string } => row.member !== null),
    milestones: database.project_milestones
      .filter((m) => m.project_id === project.id)
      .sort((a, b) => a.due_date.localeCompare(b.due_date)),
    files: database.project_files.filter((f) => f.project_id === project.id),
    tasks,
  };
}

export async function listProjects(onlyPublic = false): Promise<ProjectView[]> {
  const database = await db();
  const rows = onlyPublic ? database.projects.filter((p) => p.is_public) : database.projects;
  return Promise.all(rows.map((p) => buildProjectView(database, p)));
}

export async function getProject(idOrSlug: string): Promise<ProjectView | null> {
  const database = await db();
  const project = database.projects.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return project ? buildProjectView(database, project) : null;
}

export async function getMemberProjects(userId: ID): Promise<Project[]> {
  const database = await db();
  const ids = database.project_members.filter((pm) => pm.user_id === userId).map((pm) => pm.project_id);
  return database.projects.filter((p) => ids.includes(p.id));
}

/* -------------------------------------------------------------------------- */
/* Challenges                                                                 */
/* -------------------------------------------------------------------------- */

export interface ChallengeView extends Challenge {
  participants: number;
  correct: number;
  viewer_submission: { answer: string; is_correct: boolean } | null;
  live_status: 'scheduled' | 'open' | 'closed';
}

function liveStatus(challenge: Challenge): 'scheduled' | 'open' | 'closed' {
  const now = Date.now();
  if (now < new Date(challenge.opens_at).getTime()) return 'scheduled';
  if (now > new Date(challenge.closes_at).getTime()) return 'closed';
  return 'open';
}

export async function listChallenges(viewerId?: ID): Promise<ChallengeView[]> {
  const database = await db();
  return database.challenges
    .map((challenge) => {
      const subs = database.challenge_submissions.filter((s) => s.challenge_id === challenge.id);
      const mine = viewerId ? subs.find((s) => s.user_id === viewerId) : undefined;
      return {
        ...challenge,
        participants: subs.length,
        correct: subs.filter((s) => s.is_correct).length,
        viewer_submission: mine ? { answer: mine.answer, is_correct: mine.is_correct } : null,
        live_status: liveStatus(challenge),
      };
    })
    .sort((a, b) => new Date(b.opens_at).getTime() - new Date(a.opens_at).getTime());
}

export async function getChallenge(id: ID, viewerId?: ID): Promise<ChallengeView | null> {
  const all = await listChallenges(viewerId);
  return all.find((c) => c.id === id) ?? null;
}

export async function getOpenChallenge(viewerId?: ID): Promise<ChallengeView | null> {
  const all = await listChallenges(viewerId);
  return all.find((c) => c.live_status === 'open') ?? null;
}

/* -------------------------------------------------------------------------- */
/* Ideas                                                                      */
/* -------------------------------------------------------------------------- */

export interface IdeaView extends Idea {
  author: MemberView | null;
  votes: number;
  viewer_voted: boolean;
}

export async function listIdeas(viewerId?: ID): Promise<IdeaView[]> {
  const database = await db();
  return database.ideas
    .map((idea) => {
      const votes = database.idea_votes.filter((v) => v.idea_id === idea.id);
      return {
        ...idea,
        author: toMemberView(database, idea.user_id),
        votes: votes.length,
        viewer_voted: viewerId ? votes.some((v) => v.user_id === viewerId) : false,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/* -------------------------------------------------------------------------- */
/* Announcements                                                              */
/* -------------------------------------------------------------------------- */

export interface AnnouncementView extends Announcement {
  author: MemberView | null;
  committee: Committee | null;
}

/** Returns only the announcements the viewer is actually addressed by. */
export async function listAnnouncements(viewer?: {
  id: ID;
  role: RoleKey;
  committeeId: ID | null;
}): Promise<AnnouncementView[]> {
  const database = await db();
  const now = Date.now();

  return database.announcements
    .filter((a) => {
      if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
      if (!viewer) return a.audience_kind === 'everyone';
      switch (a.audience_kind) {
        case 'everyone':
          return true;
        case 'committee':
          return a.audience_committee_id === viewer.committeeId || viewer.role === 'admin';
        case 'leaders':
          return ['admin', 'president', 'vice_president', 'committee_leader'].includes(viewer.role);
        case 'selected':
          return a.audience_user_ids.includes(viewer.id) || viewer.role === 'admin';
        default:
          return false;
      }
    })
    .map((a) => ({
      ...a,
      author: toMemberView(database, a.created_by),
      committee: database.committees.find((c) => c.id === a.audience_committee_id) ?? null,
    }))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
}

/* -------------------------------------------------------------------------- */
/* Resources, gallery, certificates                                           */
/* -------------------------------------------------------------------------- */

export async function listResources(role: RoleKey): Promise<Resource[]> {
  const database = await db();
  const leadership = ['admin', 'president', 'vice_president', 'committee_leader'];
  return database.resources.filter((r) => {
    if (r.visibility === 'all') return true;
    if (r.visibility === 'leaders') return leadership.includes(role);
    return role === 'admin';
  });
}

export interface AlbumView extends GalleryAlbum {
  images: Database['gallery_images'];
}

export async function listAlbums(onlyPublic = false): Promise<AlbumView[]> {
  const database = await db();
  return database.gallery_albums
    .filter((a) => (onlyPublic ? a.is_public : true))
    .map((album) => ({
      ...album,
      images: database.gallery_images
        .filter((i) => i.album_id === album.id)
        .sort((a, b) => a.sort_order - b.sort_order),
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAlbum(slug: string, onlyPublic = false): Promise<AlbumView | null> {
  const albums = await listAlbums(onlyPublic);
  return albums.find((a) => a.slug === slug) ?? null;
}

export interface CertificateView extends Certificate {
  member: MemberView | null;
  issuer: MemberView | null;
}

export async function listCertificates(userId?: ID): Promise<CertificateView[]> {
  const database = await db();
  return database.certificates
    .filter((c) => (userId ? c.user_id === userId : true))
    .map((c) => ({
      ...c,
      member: toMemberView(database, c.user_id),
      issuer: toMemberView(database, c.issued_by),
    }))
    .sort((a, b) => b.issued_on.localeCompare(a.issued_on));
}

/* -------------------------------------------------------------------------- */
/* Magazine                                                                   */
/* -------------------------------------------------------------------------- */

export interface ArticleView extends MagazineArticle {
  category: MagazineCategory | null;
  author: MemberView | null;
  author_profile: Database['magazine_authors'][number] | null;
}

function buildArticleView(database: Database, article: MagazineArticle): ArticleView {
  return {
    ...article,
    category: database.magazine_categories.find((c) => c.id === article.category_id) ?? null,
    author: toMemberView(database, article.author_id),
    author_profile: database.magazine_authors.find((a) => a.user_id === article.author_id) ?? null,
  };
}

export async function listArticles(
  filter: { status?: ArticleStatus | ArticleStatus[]; categorySlug?: string; authorId?: ID } = {},
): Promise<ArticleView[]> {
  const database = await db();
  let rows = database.magazine_articles;

  if (filter.status) {
    const wanted = Array.isArray(filter.status) ? filter.status : [filter.status];
    rows = rows.filter((a) => wanted.includes(a.status));
  }
  if (filter.categorySlug) {
    const category = database.magazine_categories.find((c) => c.slug === filter.categorySlug);
    rows = category ? rows.filter((a) => a.category_id === category.id) : [];
  }
  if (filter.authorId) rows = rows.filter((a) => a.author_id === filter.authorId);

  return rows
    .map((a) => buildArticleView(database, a))
    .sort((a, b) => {
      const aTime = new Date(a.published_at ?? a.updated_at).getTime();
      const bTime = new Date(b.published_at ?? b.updated_at).getTime();
      return bTime - aTime;
    });
}

export async function getArticleBySlug(slug: string): Promise<ArticleView | null> {
  const database = await db();
  const article = database.magazine_articles.find((a) => a.slug === slug);
  return article ? buildArticleView(database, article) : null;
}

export async function getArticle(id: ID): Promise<ArticleView | null> {
  const database = await db();
  const article = database.magazine_articles.find((a) => a.id === id);
  return article ? buildArticleView(database, article) : null;
}

export async function getFeaturedArticle(): Promise<ArticleView | null> {
  const published = await listArticles({ status: 'published' });
  return published.find((a) => a.featured) ?? published[0] ?? null;
}

export async function listCategories(): Promise<(MagazineCategory & { count: number })[]> {
  const database = await db();
  return database.magazine_categories.map((c) => ({
    ...c,
    count: database.magazine_articles.filter((a) => a.category_id === c.id && a.status === 'published')
      .length,
  }));
}

export interface IssueView extends MagazineIssue {
  articles: ArticleView[];
}

export async function listIssues(onlyPublished = false): Promise<IssueView[]> {
  const database = await db();
  return database.magazine_issues
    .filter((i) => (onlyPublished ? i.status === 'published' : true))
    .map((issue) => ({
      ...issue,
      articles: database.magazine_issue_articles
        .filter((ia) => ia.issue_id === issue.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ia) => database.magazine_articles.find((a) => a.id === ia.article_id))
        .filter((a): a is MagazineArticle => a !== undefined)
        .map((a) => buildArticleView(database, a)),
    }))
    .sort((a, b) => b.number - a.number);
}

export async function getIssue(number: number): Promise<IssueView | null> {
  const issues = await listIssues();
  return issues.find((i) => i.number === number) ?? null;
}

export async function getAuthorProfile(userId: ID) {
  const database = await db();
  const profile = database.magazine_authors.find((a) => a.user_id === userId);
  if (!profile) return null;
  const member = toMemberView(database, userId);
  const articles = await listArticles({ authorId: userId, status: 'published' });
  const badges = await getMemberBadges(userId);
  return { profile, member, articles, badges };
}

export async function listSubmissionHistory(articleId: ID) {
  const database = await db();
  return database.magazine_submissions
    .filter((s) => s.article_id === articleId)
    .map((s) => ({ ...s, actor: toMemberView(database, s.actor_id) }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

/* -------------------------------------------------------------------------- */
/* Audit, settings & activity feed                                            */
/* -------------------------------------------------------------------------- */

export async function listAuditLogs(limit = 50) {
  const database = await db();
  return database.audit_logs
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((log) => ({ ...log, actor: toMemberView(database, log.actor_id) }));
}

export async function getSettings(): Promise<Record<string, string>> {
  const database = await db();
  return Object.fromEntries(database.club_settings.map((s) => [s.key, s.value]));
}

export interface ActivityItem {
  id: string;
  kind: 'points' | 'member' | 'event' | 'badge' | 'article' | 'idea';
  at: string;
  text_en: string;
  text_ar: string;
  href?: string;
}

/** The dashboard's recent-activity feed, assembled from real records. */
export async function recentActivity(limit = 8): Promise<ActivityItem[]> {
  const database = await db();
  const nameOf = (id: ID, locale: 'en' | 'ar') =>
    database.profiles.find((p) => p.user_id === id)?.[locale === 'en' ? 'full_name_en' : 'full_name_ar'] ?? '';

  const items: ActivityItem[] = [];

  for (const t of database.point_transactions.slice(-40)) {
    if (t.points <= 0) continue;
    items.push({
      id: `act-pt-${t.id}`,
      kind: 'points',
      at: t.created_at,
      text_en: `${nameOf(t.user_id, 'en')} earned ${t.points} points — ${t.reason_text_en.toLowerCase()}`,
      text_ar: `حصلت ${nameOf(t.user_id, 'ar')} على ${t.points} نقطة — ${t.reason_text_ar}`,
      href: `/portal/members/${t.user_id}`,
    });
  }

  for (const ub of database.user_badges.slice(-12)) {
    const badge = database.badges.find((b) => b.id === ub.badge_id);
    if (!badge) continue;
    items.push({
      id: `act-ub-${ub.id}`,
      kind: 'badge',
      at: ub.awarded_at,
      text_en: `${nameOf(ub.user_id, 'en')} earned the ${badge.name_en} badge`,
      text_ar: `حصلت ${nameOf(ub.user_id, 'ar')} على وسام ${badge.name_ar}`,
      href: `/portal/members/${ub.user_id}`,
    });
  }

  for (const cm of database.committee_members.slice(-10)) {
    const committee = database.committees.find((c) => c.id === cm.committee_id);
    if (!committee) continue;
    items.push({
      id: `act-cm-${cm.user_id}-${cm.committee_id}`,
      kind: 'member',
      at: `${cm.joined_at}T09:00:00.000Z`,
      text_en: `${nameOf(cm.user_id, 'en')} joined the ${committee.name_en}`,
      text_ar: `انضمت ${nameOf(cm.user_id, 'ar')} إلى ${committee.name_ar}`,
      href: `/portal/committees/${committee.slug}`,
    });
  }

  for (const event of database.events) {
    if (event.status !== 'registration_open') continue;
    items.push({
      id: `act-ev-${event.id}`,
      kind: 'event',
      at: event.created_at,
      text_en: `Registration opened for ${event.title_en}`,
      text_ar: `فُتح التسجيل في ${event.title_ar}`,
      href: `/portal/events/${event.id}`,
    });
  }

  for (const article of database.magazine_articles) {
    if (article.status !== 'published' || !article.published_at) continue;
    items.push({
      id: `act-ma-${article.id}`,
      kind: 'article',
      at: article.published_at,
      text_en: `“${article.title_en}” was published in the magazine`,
      text_ar: `نُشر مقال «${article.title_ar}» في المجلة`,
      href: `/magazine/article/${article.slug}`,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Dashboard & reports aggregates                                             */
/* -------------------------------------------------------------------------- */

export async function getClubStats() {
  const database = await db();
  const students = database.users.filter(
    (u) => (database.user_roles.find((r) => r.user_id === u.id)?.role_key ?? 'member') !== 'admin',
  );
  const now = Date.now();

  return {
    totalMembers: students.length,
    activeMembers: students.filter((u) => u.status === 'active').length,
    upcomingEvents: database.events.filter(
      (e) => new Date(e.starts_at).getTime() >= now && e.status !== 'cancelled',
    ).length,
    currentProjects: database.projects.filter((p) => p.status === 'active' || p.status === 'review')
      .length,
    attendanceRate: await overallAttendanceRate(),
    clubPoints: database.point_transactions.reduce((sum, t) => sum + t.points, 0),
    publishedArticles: database.magazine_articles.filter((a) => a.status === 'published').length,
    totalEventsThisYear: database.events.length,
  };
}

export async function getReportData() {
  const database = await db();

  const pointsByCommittee = database.committees.map((committee) => {
    const memberIds = database.committee_members
      .filter((cm) => cm.committee_id === committee.id)
      .map((cm) => cm.user_id);
    return {
      committee,
      points: database.point_transactions
        .filter((t) => memberIds.includes(t.user_id))
        .reduce((sum, t) => sum + t.points, 0),
      members: memberIds.length,
    };
  });

  const attendanceTrend = (await listAttendanceSessions())
    .slice()
    .reverse()
    .map((s) => ({ label: s.held_at.slice(0, 10), rate: s.rate }));

  const eventParticipation = database.events.map((event) => ({
    event,
    registered: database.event_registrations.filter(
      (r) => r.event_id === event.id && r.status === 'registered',
    ).length,
  }));

  const challengeParticipation = database.challenges.map((challenge) => {
    const subs = database.challenge_submissions.filter((s) => s.challenge_id === challenge.id);
    return {
      challenge,
      participants: subs.length,
      correct: subs.filter((s) => s.is_correct).length,
    };
  });

  const articleStatusCounts = (
    ['draft', 'submitted', 'under_review', 'approved', 'scheduled', 'published'] as ArticleStatus[]
  ).map((status) => ({
    status,
    count: database.magazine_articles.filter((a) => a.status === status).length,
  }));

  const pointsDistribution = [
    { band: '0–49', min: 0, max: 49 },
    { band: '50–99', min: 50, max: 99 },
    { band: '100–149', min: 100, max: 149 },
    { band: '150+', min: 150, max: Number.MAX_SAFE_INTEGER },
  ].map((band) => {
    const count = database.users.filter((u) => {
      const role = database.user_roles.find((r) => r.user_id === u.id)?.role_key ?? 'member';
      if (role === 'admin') return false;
      const total = pointsFor(database, u.id);
      return total >= band.min && total <= band.max;
    }).length;
    return { band: band.band, count };
  });

  return {
    pointsByCommittee,
    attendanceTrend,
    eventParticipation,
    challengeParticipation,
    articleStatusCounts,
    pointsDistribution,
    projectProgress: database.projects.map((p) => ({ project: p, progress: p.progress })),
  };
}
