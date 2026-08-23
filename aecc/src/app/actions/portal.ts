'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission, requireViewer } from '@/lib/auth/current-user';
import { canAwardPointsTo } from '@/lib/auth/rbac';
import { checkPasswordPolicy, generateTemporaryPassword } from '@/lib/auth/password';
import {
  assignCommittee,
  assignRole,
  awardBadge,
  awardPoints,
  cancelRegistration,
  changeOwnPassword,
  createAnnouncement,
  createAttendanceSession,
  createChallenge,
  createEvent,
  createIssue,
  createResource,
  createTask,
  createUser,
  decideRegistration,
  deleteAnnouncement,
  issueCertificate,
  publishIssue,
  registerForEvent,
  resetPassword,
  reversePoints,
  saveAttendance,
  setAccountStatus,
  setArticleFeatured,
  setIdeaStatus,
  setTaskStatus,
  submitChallengeAnswer,
  submitIdea,
  toggleIdeaVote,
  transitionArticle,
  updateMemberProfile,
  updateSetting,
} from '@/lib/db/mutations';
import { createArticleDraft } from '@/lib/db/mutations';
import type { ArticleStatus, AttendanceStatus, IdeaStatus, RoleKey, TaskStatus } from '@/lib/domain/types';

/**
 * Server actions for the portal.
 *
 * Every action re-resolves the viewer and re-checks the capability it needs. The
 * client never supplies the actor id, so a crafted request cannot act as someone else.
 */

export interface ActionResult {
  ok?: boolean;
  error?: string;
  message?: string;
}

/* ------------------------------------------------------------------ events -- */

export async function joinEventAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('events:register');
  const eventId = String(formData.get('eventId') ?? '');
  if (!eventId) return;

  await registerForEvent(viewer.id, eventId);
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath('/portal/events');
  revalidatePath('/portal');
}

export async function leaveEventAction(formData: FormData): Promise<void> {
  const viewer = await requireViewer();
  const eventId = String(formData.get('eventId') ?? '');
  if (!eventId) return;

  await cancelRegistration(viewer.id, eventId);
  revalidatePath(`/portal/events/${eventId}`);
  revalidatePath('/portal/events');
}

export async function decideRegistrationAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('events:write');
  const registrationId = String(formData.get('registrationId') ?? '');
  const decision = String(formData.get('decision') ?? '');
  if (!registrationId || (decision !== 'registered' && decision !== 'declined')) return;

  await decideRegistration(viewer.id, registrationId, decision);
  revalidatePath('/portal/events');
}

const eventSchema = z.object({
  titleEn: z.string().trim().min(3).max(160),
  titleAr: z.string().trim().max(160),
  descriptionEn: z.string().trim().min(1).max(4000),
  descriptionAr: z.string().trim().max(4000),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  locationEn: z.string().trim().max(160),
  locationAr: z.string().trim().max(160),
  committeeId: z.string().optional(),
  capacity: z.coerce.number().int().min(1).max(1000),
  registrationDeadline: z.string().optional(),
  materialsEn: z.string().trim().max(1000),
  safetyNoteEn: z.string().trim().max(1000),
  pointsReward: z.coerce.number().int().min(0).max(200),
});

export async function createEventAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('events:write');
  const parsed = eventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'validation' };

  const value = parsed.data;
  const id = await createEvent({
    actorId: viewer.id,
    titleEn: value.titleEn,
    titleAr: value.titleAr,
    descriptionEn: value.descriptionEn,
    descriptionAr: value.descriptionAr,
    startsAt: new Date(value.startsAt).toISOString(),
    endsAt: new Date(value.endsAt).toISOString(),
    locationEn: value.locationEn,
    locationAr: value.locationAr,
    committeeId: value.committeeId || null,
    capacity: value.capacity,
    registrationDeadline: value.registrationDeadline
      ? new Date(value.registrationDeadline).toISOString()
      : null,
    materialsEn: value.materialsEn,
    safetyNoteEn: value.safetyNoteEn,
    pointsReward: value.pointsReward,
  });

  revalidatePath('/portal/events');
  redirect(`/portal/events/${id}`);
}

/* -------------------------------------------------------------- attendance -- */

export async function saveAttendanceAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('attendance:write');
  const sessionId = String(formData.get('sessionId') ?? '');
  if (!sessionId) return;

  const valid: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
  const entries: { userId: string; status: AttendanceStatus }[] = [];

  for (const [key, raw] of formData.entries()) {
    if (!key.startsWith('status:')) continue;
    const status = String(raw) as AttendanceStatus;
    if (!valid.includes(status)) continue;
    entries.push({ userId: key.slice('status:'.length), status });
  }

  if (entries.length > 0) await saveAttendance(viewer.id, sessionId, entries);
  revalidatePath(`/portal/attendance/${sessionId}`);
  revalidatePath('/portal/attendance');
  revalidatePath('/portal');
}

export async function createAttendanceSessionAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await requirePermission('attendance:write');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  const heldAt = String(formData.get('heldAt') ?? '');
  if (titleEn.length < 3 || !heldAt) return { error: 'validation' };

  const id = await createAttendanceSession(viewer.id, {
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    kind: String(formData.get('kind') ?? 'meeting'),
    heldAt: new Date(heldAt).toISOString(),
    committeeId: String(formData.get('committeeId') ?? '') || null,
  });

  revalidatePath('/portal/attendance');
  redirect(`/portal/attendance/${id}`);
}

/* ------------------------------------------------------------------ points -- */

export async function awardPointsAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('points:award');
  const userId = String(formData.get('userId') ?? '');
  const points = Number(formData.get('points'));
  const reasonId = String(formData.get('reasonId') ?? '');
  const customReason = String(formData.get('customReason') ?? '').trim();

  if (!userId || !Number.isFinite(points) || points === 0) return { error: 'validation' };

  // A member can never award points to herself, whatever her role (guide §6).
  if (!canAwardPointsTo(viewer.role, viewer.id, userId)) return { error: 'self_award' };

  const { listPointReasons } = await import('@/lib/db/queries');
  const reasons = await listPointReasons();
  const reason = reasons.find((r) => r.id === reasonId);

  await awardPoints({
    actorId: viewer.id,
    userId,
    points: Math.trunc(points),
    reasonId: reason?.id ?? null,
    reasonTextEn: customReason || reason?.label_en || 'Contribution',
    reasonTextAr: customReason || reason?.label_ar || 'مساهمة',
  });

  revalidatePath('/portal/points');
  revalidatePath(`/portal/members/${userId}`);
  revalidatePath('/portal/leaderboard');
  return { ok: true };
}

export async function reversePointsAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('points:award');
  const transactionId = String(formData.get('transactionId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim() || 'Correction';
  if (!transactionId) return;

  await reversePoints(viewer.id, transactionId, reason);
  revalidatePath('/portal/points');
  revalidatePath('/portal/leaderboard');
}

/* ------------------------------------------------------------------- tasks -- */

export async function createTaskAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission(['tasks:write', 'tasks:write_own']);
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  if (titleEn.length < 3) return { error: 'validation' };

  await createTask({
    actorId: viewer.id,
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    descriptionEn: String(formData.get('descriptionEn') ?? '').trim(),
    committeeId: String(formData.get('committeeId') ?? '') || viewer.committee_id,
    projectId: String(formData.get('projectId') ?? '') || null,
    priority: (String(formData.get('priority') ?? 'medium') as 'low' | 'medium' | 'high') ?? 'medium',
    dueDate: String(formData.get('dueDate') ?? '') || null,
    assigneeIds: formData.getAll('assignees').map(String).filter(Boolean),
  });

  revalidatePath('/portal/tasks');
  return { ok: true };
}

export async function moveTaskAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission(['tasks:write', 'tasks:write_own']);
  const taskId = String(formData.get('taskId') ?? '');
  const status = String(formData.get('status') ?? '') as TaskStatus;
  const valid: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
  if (!taskId || !valid.includes(status)) return;

  await setTaskStatus(viewer.id, taskId, status);
  revalidatePath('/portal/tasks');
}

/* -------------------------------------------------------------- challenges -- */

export async function submitChallengeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await requirePermission('challenges:submit');
  const challengeId = String(formData.get('challengeId') ?? '');
  const answer = String(formData.get('answer') ?? '').trim();
  if (!challengeId || !answer) return { error: 'validation' };

  const result = await submitChallengeAnswer(viewer.id, challengeId, answer);
  revalidatePath(`/portal/challenges/${challengeId}`);
  revalidatePath('/portal');

  if (!result.accepted) return { error: 'already_answered' };
  return { ok: true, message: result.correct ? 'correct' : 'incorrect' };
}

export async function createChallengeAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await requirePermission('challenges:write');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  const questionEn = String(formData.get('questionEn') ?? '').trim();
  if (titleEn.length < 3 || questionEn.length < 5) return { error: 'validation' };

  const options = String(formData.get('optionsEn') ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const id = await createChallenge({
    actorId: viewer.id,
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    kind: String(formData.get('kind') ?? 'multiple_choice'),
    questionEn,
    questionAr: String(formData.get('questionAr') ?? '').trim(),
    optionsEn: options,
    optionsAr: String(formData.get('optionsAr') ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    correctAnswer: String(formData.get('correctAnswer') ?? '').trim(),
    explanationEn: String(formData.get('explanationEn') ?? '').trim(),
    explanationAr: String(formData.get('explanationAr') ?? '').trim(),
    points: Number(formData.get('points') ?? 10),
    opensAt: new Date(String(formData.get('opensAt'))).toISOString(),
    closesAt: new Date(String(formData.get('closesAt'))).toISOString(),
  });

  revalidatePath('/portal/challenges');
  redirect(`/portal/challenges/${id}`);
}

/* ------------------------------------------------------------------- ideas -- */

export async function submitIdeaAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('ideas:submit');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  if (title.length < 3 || description.length < 10) return { error: 'validation' };

  await submitIdea({
    userId: viewer.id,
    title,
    description,
    category: String(formData.get('category') ?? 'General'),
  });

  revalidatePath('/portal/ideas');
  return { ok: true };
}

export async function setIdeaStatusAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('ideas:moderate');
  const ideaId = String(formData.get('ideaId') ?? '');
  const status = String(formData.get('status') ?? '') as IdeaStatus;
  const feedback = String(formData.get('feedback') ?? '').trim();
  if (!ideaId) return;

  await setIdeaStatus(viewer.id, ideaId, status, feedback || undefined);
  revalidatePath('/portal/ideas');
}

export async function voteIdeaAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('ideas:read');
  const ideaId = String(formData.get('ideaId') ?? '');
  if (!ideaId) return;

  const { getSettings } = await import('@/lib/db/queries');
  const settings = await getSettings();
  if (settings.idea_voting_enabled !== 'true') return;

  await toggleIdeaVote(viewer.id, ideaId);
  revalidatePath('/portal/ideas');
}

/* ----------------------------------------------------------- announcements -- */

export async function createAnnouncementAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await requirePermission('announcements:write');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  const bodyEn = String(formData.get('bodyEn') ?? '').trim();
  if (titleEn.length < 3 || bodyEn.length < 5) return { error: 'validation' };

  await createAnnouncement({
    actorId: viewer.id,
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    bodyEn,
    bodyAr: String(formData.get('bodyAr') ?? '').trim(),
    level: (String(formData.get('level') ?? 'normal') as 'normal' | 'important' | 'urgent') ?? 'normal',
    audienceKind:
      (String(formData.get('audienceKind') ?? 'everyone') as
        | 'everyone'
        | 'committee'
        | 'leaders'
        | 'selected') ?? 'everyone',
    audienceCommitteeId: String(formData.get('audienceCommitteeId') ?? '') || null,
    pinned: formData.get('pinned') === 'on',
  });

  revalidatePath('/portal/announcements');
  revalidatePath('/portal');
  redirect('/portal/announcements');
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('announcements:write');
  const id = String(formData.get('announcementId') ?? '');
  if (!id) return;
  await deleteAnnouncement(viewer.id, id);
  revalidatePath('/portal/announcements');
}

/* ------------------------------------------------------------------ badges -- */

export async function awardBadgeAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('badges:award');
  const userId = String(formData.get('userId') ?? '');
  const badgeId = String(formData.get('badgeId') ?? '');
  if (!userId || !badgeId) return;

  await awardBadge(viewer.id, userId, badgeId, String(formData.get('note') ?? '').trim() || undefined);
  revalidatePath('/portal/achievements');
  revalidatePath(`/portal/members/${userId}`);
}

/* -------------------------------------------------------------- magazine -- */

export async function createArticleAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('magazine:write');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  const bodyEn = String(formData.get('bodyEn') ?? '').trim();
  const categoryId = String(formData.get('categoryId') ?? '');
  if (titleEn.length < 3 || bodyEn.length < 20 || !categoryId) return { error: 'validation' };

  const id = await createArticleDraft({
    authorId: viewer.id,
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    subtitleEn: String(formData.get('subtitleEn') ?? '').trim(),
    subtitleAr: String(formData.get('subtitleAr') ?? '').trim(),
    categoryId,
    bodyEn,
    bodyAr: String(formData.get('bodyAr') ?? '').trim(),
    references: String(formData.get('references') ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    submit: formData.get('submit') === 'on',
  });

  revalidatePath('/portal/magazine');
  redirect(`/portal/magazine/articles/${id}`);
}

export async function transitionArticleAction(formData: FormData): Promise<void> {
  const next = String(formData.get('next') ?? '') as ArticleStatus;
  const articleId = String(formData.get('articleId') ?? '');
  if (!articleId) return;

  // Publishing is restricted to supervisors; review transitions need `magazine:review`;
  // an author may only submit her own draft.
  const publishing: ArticleStatus[] = ['published', 'scheduled', 'unpublished'];
  const reviewing: ArticleStatus[] = ['under_review', 'approved', 'revision_requested'];

  if (publishing.includes(next)) {
    const viewer = await requirePermission('magazine:publish');
    await transitionArticle(
      viewer.id,
      articleId,
      next,
      String(formData.get('note') ?? '').trim() || undefined,
      String(formData.get('scheduledFor') ?? '') || undefined,
    );
  } else if (reviewing.includes(next)) {
    const viewer = await requirePermission('magazine:review');
    await transitionArticle(
      viewer.id,
      articleId,
      next,
      String(formData.get('note') ?? '').trim() || undefined,
    );
  } else {
    const viewer = await requirePermission('magazine:write');
    const { getArticle } = await import('@/lib/db/queries');
    const article = await getArticle(articleId);
    if (!article) return;
    const mayEdit = article.author_id === viewer.id || viewer.permissions.can('magazine:review');
    if (!mayEdit) return;
    await transitionArticle(viewer.id, articleId, next);
  }

  revalidatePath('/portal/magazine');
  revalidatePath(`/portal/magazine/articles/${articleId}`);
  revalidatePath('/magazine');
}

export async function featureArticleAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('magazine:publish');
  const articleId = String(formData.get('articleId') ?? '');
  if (!articleId) return;
  await setArticleFeatured(viewer.id, articleId, formData.get('featured') === 'true');
  revalidatePath('/portal/magazine');
  revalidatePath('/magazine');
}

export async function createIssueAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('magazine:publish');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  if (titleEn.length < 2) return { error: 'validation' };

  await createIssue({
    actorId: viewer.id,
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    editorsNoteEn: String(formData.get('editorsNoteEn') ?? '').trim(),
    editorsNoteAr: String(formData.get('editorsNoteAr') ?? '').trim(),
    articleIds: formData.getAll('articles').map(String).filter(Boolean),
  });

  revalidatePath('/portal/magazine/issues');
  revalidatePath('/magazine/issues');
  return { ok: true };
}

export async function publishIssueAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('magazine:publish');
  const issueId = String(formData.get('issueId') ?? '');
  if (!issueId) return;
  await publishIssue(viewer.id, issueId);
  revalidatePath('/portal/magazine/issues');
  revalidatePath('/magazine/issues');
}

/* ------------------------------------------------------------- resources -- */

export async function createResourceAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('resources:write');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  if (titleEn.length < 3) return { error: 'validation' };

  await createResource({
    actorId: viewer.id,
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    descriptionEn: String(formData.get('descriptionEn') ?? '').trim(),
    category: String(formData.get('category') ?? 'policies'),
    fileUrl: String(formData.get('fileUrl') ?? '').trim(),
    fileKind: String(formData.get('fileKind') ?? 'pdf'),
    visibility: String(formData.get('visibility') ?? 'all'),
  });

  revalidatePath('/portal/resources');
  return { ok: true };
}

/* ----------------------------------------------------------- certificates -- */

export async function issueCertificateAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const viewer = await requirePermission('certificates:issue');
  const userId = String(formData.get('userId') ?? '');
  const titleEn = String(formData.get('titleEn') ?? '').trim();
  if (!userId || titleEn.length < 3) return { error: 'validation' };

  await issueCertificate({
    actorId: viewer.id,
    userId,
    kind: String(formData.get('kind') ?? 'participation'),
    titleEn,
    titleAr: String(formData.get('titleAr') ?? '').trim(),
    eventId: String(formData.get('eventId') ?? '') || null,
    projectId: String(formData.get('projectId') ?? '') || null,
  });

  revalidatePath('/portal/certificates');
  return { ok: true };
}

/* ------------------------------------------------------ user administration -- */

export async function createUserAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('users:admin');
  const username = String(formData.get('username') ?? '').trim().toLowerCase();
  const fullNameEn = String(formData.get('fullNameEn') ?? '').trim();
  const password = String(formData.get('password') ?? '') || generateTemporaryPassword();

  if (username.length < 3 || fullNameEn.length < 3) return { error: 'validation' };

  const { db } = await import('@/lib/db/store');
  const database = await db();
  if (database.users.some((u) => u.username.toLowerCase() === username)) {
    return { error: 'username_taken' };
  }

  const policy = checkPasswordPolicy(password);
  if (!policy.valid) return { error: 'weak_password' };

  await createUser({
    actorId: viewer.id,
    username,
    email: String(formData.get('email') ?? '').trim() || `${username}@aleman.edu`,
    password,
    fullNameEn,
    fullNameAr: String(formData.get('fullNameAr') ?? '').trim(),
    grade: String(formData.get('grade') ?? 'Grade 10'),
    role: (String(formData.get('role') ?? 'member') as RoleKey) ?? 'member',
    committeeId: String(formData.get('committeeId') ?? '') || null,
  });

  revalidatePath('/portal/admin/users');
  revalidatePath('/portal/members');
  return { ok: true, message: password };
}

export async function updateMemberAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('members:write');
  const userId = String(formData.get('userId') ?? '');
  if (!userId) return { error: 'validation' };

  await updateMemberProfile(viewer.id, userId, {
    fullNameEn: String(formData.get('fullNameEn') ?? '').trim(),
    fullNameAr: String(formData.get('fullNameAr') ?? '').trim(),
    grade: String(formData.get('grade') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    bioEn: String(formData.get('bioEn') ?? '').trim(),
    bioAr: String(formData.get('bioAr') ?? '').trim(),
    // Only a viewer holding `members:notes` may write the supervisor notes field.
    ...(viewer.permissions.can('members:notes')
      ? { adminNotes: String(formData.get('adminNotes') ?? '').trim() || null }
      : {}),
  });

  const committeeId = formData.get('committeeId');
  if (committeeId !== null) await assignCommittee(viewer.id, userId, String(committeeId) || null);

  const role = formData.get('role');
  if (role !== null && viewer.permissions.can('roles:assign')) {
    await assignRole(viewer.id, userId, String(role) as RoleKey);
  }

  revalidatePath(`/portal/members/${userId}`);
  revalidatePath('/portal/members');
  return { ok: true };
}

export async function setAccountStatusAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('users:admin');
  const userId = String(formData.get('userId') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!userId || !['active', 'inactive', 'alumna'].includes(status)) return;

  // A supervisor cannot lock herself out of the system.
  if (userId === viewer.id) return;

  await setAccountStatus(viewer.id, userId, status as 'active' | 'inactive' | 'alumna');
  revalidatePath('/portal/admin/users');
  revalidatePath('/portal/members');
}

export async function resetPasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requirePermission('users:admin');
  const userId = String(formData.get('userId') ?? '');
  if (!userId) return { error: 'validation' };

  const temporary = generateTemporaryPassword();
  await resetPassword(viewer.id, userId, temporary);
  revalidatePath('/portal/admin/users');
  return { ok: true, message: temporary };
}

/* ---------------------------------------------------------------- settings -- */

export async function changePasswordAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const viewer = await requireViewer();
  const next = String(formData.get('newPassword') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');
  const current = String(formData.get('currentPassword') ?? '');

  if (next !== confirm) return { error: 'mismatch' };
  const policy = checkPasswordPolicy(next);
  if (!policy.valid) return { error: 'weak_password' };

  const { verifyPassword } = await import('@/lib/auth/password');
  const { db } = await import('@/lib/db/store');
  const database = await db();
  const user = database.users.find((u) => u.id === viewer.id);
  if (!user) return { error: 'validation' };

  const ok = await verifyPassword(current, user.password_hash, user.password_salt);
  if (!ok) return { error: 'wrong_current' };

  await changeOwnPassword(viewer.id, next);
  return { ok: true };
}

export async function updateSettingAction(formData: FormData): Promise<void> {
  const viewer = await requirePermission('settings:write');
  const key = String(formData.get('key') ?? '');
  const value = String(formData.get('value') ?? '');
  if (!key) return;

  await updateSetting(viewer.id, key, value);
  revalidatePath('/portal/admin/club-settings');
}
