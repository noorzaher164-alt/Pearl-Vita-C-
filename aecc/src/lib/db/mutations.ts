import 'server-only';

import { hashPassword } from '@/lib/auth/password';
import type {
  AnnouncementLevel,
  ArticleStatus,
  AttendanceStatus,
  AudienceKind,
  ChallengeStatus,
  ID,
  IdeaStatus,
  RoleKey,
  TaskPriority,
  TaskStatus,
} from '@/lib/domain/types';
import { nextId, write } from './store';

/* -------------------------------------------------------------------------- */
/* Audit                                                                      */
/* -------------------------------------------------------------------------- */

interface AuditInput {
  actorId: ID;
  action: string;
  entity: string;
  entityId: ID | null;
  summaryEn: string;
  summaryAr: string;
  reason?: string | null;
}

/**
 * Every sensitive action records actor, timestamp, target, action and optional
 * reason (guide §6). Called from inside the same `write` transaction as the change
 * it describes so the two cannot drift apart.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  await write((database) => {
    database.audit_logs.push({
      id: nextId(database.audit_logs, 'al'),
      actor_id: input.actorId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId,
      summary_en: input.summaryEn,
      summary_ar: input.summaryAr,
      reason: input.reason ?? null,
      created_at: new Date().toISOString(),
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Accounts                                                                   */
/* -------------------------------------------------------------------------- */

export async function touchLastLogin(userId: ID): Promise<void> {
  await write((database) => {
    const user = database.users.find((u) => u.id === userId);
    if (user) user.last_login_at = new Date().toISOString();
  });
}

export interface CreateUserInput {
  actorId: ID;
  username: string;
  email: string;
  password: string;
  fullNameEn: string;
  fullNameAr: string;
  grade: string;
  role: RoleKey;
  committeeId: ID | null;
}

export async function createUser(input: CreateUserInput): Promise<ID> {
  const { hash, salt } = await hashPassword(input.password);
  const today = new Date().toISOString();

  const userId = await write((database) => {
    const id = nextId(database.users, 'u');
    database.users.push({
      id,
      username: input.username,
      email: input.email,
      password_hash: hash,
      password_salt: salt,
      status: 'active',
      must_change_password: true,
      last_login_at: null,
      created_at: today,
    });
    database.profiles.push({
      user_id: id,
      full_name_en: input.fullNameEn,
      full_name_ar: input.fullNameAr || input.fullNameEn,
      grade: input.grade,
      avatar_url: null,
      bio_en: '',
      bio_ar: '',
      joined_at: today.slice(0, 10),
      phone: null,
      guardian_contact: null,
      admin_notes: null,
    });
    database.user_roles.push({
      user_id: id,
      role_key: input.role,
      granted_by: input.actorId,
      granted_at: today,
    });
    if (input.committeeId) {
      database.committee_members.push({
        committee_id: input.committeeId,
        user_id: id,
        role_in_committee: input.role === 'committee_leader' ? 'leader' : 'member',
        joined_at: today.slice(0, 10),
      });
    }
    return id;
  });

  await recordAudit({
    actorId: input.actorId,
    action: 'user.create',
    entity: 'users',
    entityId: userId,
    summaryEn: `Created an account for ${input.fullNameEn}`,
    summaryAr: `إنشاء حساب لـ ${input.fullNameAr || input.fullNameEn}`,
  });

  return userId;
}

export async function updateMemberProfile(
  actorId: ID,
  userId: ID,
  patch: {
    fullNameEn?: string;
    fullNameAr?: string;
    grade?: string;
    bioEn?: string;
    bioAr?: string;
    phone?: string | null;
    guardianContact?: string | null;
    adminNotes?: string | null;
    email?: string;
  },
): Promise<void> {
  await write((database) => {
    const profile = database.profiles.find((p) => p.user_id === userId);
    const user = database.users.find((u) => u.id === userId);
    if (!profile || !user) return;
    if (patch.fullNameEn !== undefined) profile.full_name_en = patch.fullNameEn;
    if (patch.fullNameAr !== undefined) profile.full_name_ar = patch.fullNameAr;
    if (patch.grade !== undefined) profile.grade = patch.grade;
    if (patch.bioEn !== undefined) profile.bio_en = patch.bioEn;
    if (patch.bioAr !== undefined) profile.bio_ar = patch.bioAr;
    if (patch.phone !== undefined) profile.phone = patch.phone;
    if (patch.guardianContact !== undefined) profile.guardian_contact = patch.guardianContact;
    if (patch.adminNotes !== undefined) profile.admin_notes = patch.adminNotes;
    if (patch.email !== undefined) user.email = patch.email;
  });

  await recordAudit({
    actorId,
    action: 'member.update',
    entity: 'profiles',
    entityId: userId,
    summaryEn: 'Updated member details',
    summaryAr: 'تحديث بيانات العضوة',
  });
}

export async function setAccountStatus(
  actorId: ID,
  userId: ID,
  status: 'active' | 'inactive' | 'alumna',
  reason?: string,
): Promise<void> {
  await write((database) => {
    const user = database.users.find((u) => u.id === userId);
    if (user) user.status = status;
  });
  await recordAudit({
    actorId,
    action: status === 'active' ? 'user.activate' : 'user.deactivate',
    entity: 'users',
    entityId: userId,
    summaryEn: `Set account status to ${status}`,
    summaryAr: `تعيين حالة الحساب إلى ${status}`,
    reason,
  });
}

export async function assignRole(actorId: ID, userId: ID, role: RoleKey, reason?: string): Promise<void> {
  await write((database) => {
    const existing = database.user_roles.find((r) => r.user_id === userId);
    if (existing) {
      existing.role_key = role;
      existing.granted_by = actorId;
      existing.granted_at = new Date().toISOString();
    } else {
      database.user_roles.push({
        user_id: userId,
        role_key: role,
        granted_by: actorId,
        granted_at: new Date().toISOString(),
      });
    }
  });
  await recordAudit({
    actorId,
    action: 'role.assign',
    entity: 'user_roles',
    entityId: userId,
    summaryEn: `Assigned the ${role.replace('_', ' ')} role`,
    summaryAr: `إسناد الدور: ${role}`,
    reason,
  });
}

export async function assignCommittee(actorId: ID, userId: ID, committeeId: ID | null): Promise<void> {
  await write((database) => {
    const index = database.committee_members.findIndex((cm) => cm.user_id === userId);
    if (index >= 0) database.committee_members.splice(index, 1);
    if (committeeId) {
      const role = database.user_roles.find((r) => r.user_id === userId)?.role_key ?? 'member';
      database.committee_members.push({
        committee_id: committeeId,
        user_id: userId,
        role_in_committee: role === 'committee_leader' ? 'leader' : 'member',
        joined_at: new Date().toISOString().slice(0, 10),
      });
    }
  });
  await recordAudit({
    actorId,
    action: 'committee.assign',
    entity: 'committee_members',
    entityId: userId,
    summaryEn: committeeId ? 'Assigned member to a committee' : 'Removed member from her committee',
    summaryAr: committeeId ? 'إسناد العضوة إلى لجنة' : 'إزالة العضوة من لجنتها',
  });
}

export async function resetPassword(actorId: ID, userId: ID, temporary: string): Promise<void> {
  const { hash, salt } = await hashPassword(temporary);
  await write((database) => {
    const user = database.users.find((u) => u.id === userId);
    if (!user) return;
    user.password_hash = hash;
    user.password_salt = salt;
    user.must_change_password = true;
  });
  await recordAudit({
    actorId,
    action: 'user.reset_password',
    entity: 'users',
    entityId: userId,
    summaryEn: 'Issued a temporary password',
    summaryAr: 'إصدار كلمة مرور مؤقتة',
  });
}

export async function changeOwnPassword(userId: ID, newPassword: string): Promise<void> {
  const { hash, salt } = await hashPassword(newPassword);
  await write((database) => {
    const user = database.users.find((u) => u.id === userId);
    if (!user) return;
    user.password_hash = hash;
    user.password_salt = salt;
    user.must_change_password = false;
  });
  await recordAudit({
    actorId: userId,
    action: 'user.change_password',
    entity: 'users',
    entityId: userId,
    summaryEn: 'Changed her own password',
    summaryAr: 'تغيير كلمة المرور الخاصة بها',
  });
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export async function registerForEvent(userId: ID, eventId: ID): Promise<'registered' | 'pending' | 'full'> {
  return write((database) => {
    const event = database.events.find((e) => e.id === eventId);
    if (!event) return 'full';

    const existing = database.event_registrations.find(
      (r) => r.event_id === eventId && r.user_id === userId,
    );
    if (existing && existing.status !== 'cancelled') {
      return existing.status === 'registered' ? 'registered' : 'pending';
    }

    const confirmed = database.event_registrations.filter(
      (r) => r.event_id === eventId && r.status === 'registered',
    ).length;
    if (confirmed >= event.capacity) return 'full';

    const requiresApproval =
      database.club_settings.find((s) => s.key === 'event_registration_requires_approval')?.value === 'true';
    const status = requiresApproval ? ('pending' as const) : ('registered' as const);

    if (existing) {
      existing.status = status;
      existing.registered_at = new Date().toISOString();
    } else {
      database.event_registrations.push({
        id: nextId(database.event_registrations, 'er', 4),
        event_id: eventId,
        user_id: userId,
        status,
        registered_at: new Date().toISOString(),
        decided_by: null,
        decided_at: null,
      });
    }
    return status;
  });
}

export async function cancelRegistration(userId: ID, eventId: ID): Promise<void> {
  await write((database) => {
    const registration = database.event_registrations.find(
      (r) => r.event_id === eventId && r.user_id === userId,
    );
    if (registration) registration.status = 'cancelled';
  });
}

export async function decideRegistration(
  actorId: ID,
  registrationId: ID,
  decision: 'registered' | 'declined',
): Promise<void> {
  await write((database) => {
    const registration = database.event_registrations.find((r) => r.id === registrationId);
    if (!registration) return;
    registration.status = decision;
    registration.decided_by = actorId;
    registration.decided_at = new Date().toISOString();
  });
  await recordAudit({
    actorId,
    action: 'event.registration_decision',
    entity: 'event_registrations',
    entityId: registrationId,
    summaryEn: `Registration ${decision}`,
    summaryAr: decision === 'registered' ? 'اعتماد التسجيل' : 'رفض التسجيل',
  });
}

export interface CreateEventInput {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  startsAt: string;
  endsAt: string;
  locationEn: string;
  locationAr: string;
  committeeId: ID | null;
  capacity: number;
  registrationDeadline: string | null;
  materialsEn: string;
  safetyNoteEn: string;
  pointsReward: number;
}

export async function createEvent(input: CreateEventInput): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.events, 'e');
    database.events.push({
      id: newId,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      description_en: input.descriptionEn,
      description_ar: input.descriptionAr || input.descriptionEn,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      location_en: input.locationEn,
      location_ar: input.locationAr || input.locationEn,
      organizer_id: input.actorId,
      committee_id: input.committeeId,
      capacity: input.capacity,
      registration_deadline: input.registrationDeadline,
      materials_en: input.materialsEn,
      materials_ar: input.materialsEn,
      safety_note_en: input.safetyNoteEn,
      safety_note_ar: input.safetyNoteEn,
      points_reward: input.pointsReward,
      status: 'registration_open',
      cover_image: null,
      created_at: new Date().toISOString(),
    });
    return newId;
  });

  await recordAudit({
    actorId: input.actorId,
    action: 'event.create',
    entity: 'events',
    entityId: id,
    summaryEn: `Created the event “${input.titleEn}”`,
    summaryAr: `إنشاء فعالية «${input.titleAr || input.titleEn}»`,
  });
  return id;
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                 */
/* -------------------------------------------------------------------------- */

export async function saveAttendance(
  actorId: ID,
  sessionId: ID,
  entries: { userId: ID; status: AttendanceStatus }[],
): Promise<void> {
  await write((database) => {
    for (const entry of entries) {
      const existing = database.attendance_records.find(
        (r) => r.session_id === sessionId && r.user_id === entry.userId,
      );
      if (existing) {
        existing.status = entry.status;
        existing.recorded_by = actorId;
        existing.recorded_at = new Date().toISOString();
      } else {
        database.attendance_records.push({
          id: nextId(database.attendance_records, 'ar', 4),
          session_id: sessionId,
          user_id: entry.userId,
          status: entry.status,
          note: null,
          recorded_by: actorId,
          recorded_at: new Date().toISOString(),
        });
      }
    }
  });

  await recordAudit({
    actorId,
    action: 'attendance.save',
    entity: 'attendance_records',
    entityId: sessionId,
    summaryEn: `Recorded attendance for ${entries.length} members`,
    summaryAr: `رصد الحضور لـ ${entries.length} عضوة`,
  });
}

export async function createAttendanceSession(
  actorId: ID,
  input: { titleEn: string; titleAr: string; kind: string; heldAt: string; committeeId: ID | null },
): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.attendance_sessions, 'as');
    database.attendance_sessions.push({
      id: newId,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      kind: input.kind as never,
      held_at: input.heldAt,
      committee_id: input.committeeId,
      event_id: null,
      created_by: actorId,
      created_at: new Date().toISOString(),
    });
    return newId;
  });
  await recordAudit({
    actorId,
    action: 'attendance.create_session',
    entity: 'attendance_sessions',
    entityId: id,
    summaryEn: `Created the attendance session “${input.titleEn}”`,
    summaryAr: `إنشاء جلسة حضور «${input.titleAr || input.titleEn}»`,
  });
  return id;
}

/* -------------------------------------------------------------------------- */
/* Points — append only                                                       */
/* -------------------------------------------------------------------------- */

export async function awardPoints(input: {
  actorId: ID;
  userId: ID;
  points: number;
  reasonId: ID | null;
  reasonTextEn: string;
  reasonTextAr: string;
  eventId?: ID | null;
  projectId?: ID | null;
}): Promise<void> {
  const id = await write((database) => {
    const newId = nextId(database.point_transactions, 'pt', 4);
    database.point_transactions.push({
      id: newId,
      user_id: input.userId,
      points: input.points,
      reason_id: input.reasonId,
      reason_text_en: input.reasonTextEn,
      reason_text_ar: input.reasonTextAr || input.reasonTextEn,
      event_id: input.eventId ?? null,
      project_id: input.projectId ?? null,
      awarded_by: input.actorId,
      created_at: new Date().toISOString(),
      reversal_of: null,
    });
    return newId;
  });

  await recordAudit({
    actorId: input.actorId,
    action: 'points.award',
    entity: 'point_transactions',
    entityId: id,
    summaryEn: `Awarded ${input.points} points — ${input.reasonTextEn}`,
    summaryAr: `منح ${input.points} نقطة — ${input.reasonTextAr || input.reasonTextEn}`,
  });
}

/** Corrections never delete: they add a compensating transaction. */
export async function reversePoints(actorId: ID, transactionId: ID, reason: string): Promise<void> {
  const created = await write((database) => {
    const original = database.point_transactions.find((t) => t.id === transactionId);
    if (!original || original.reversal_of) return null;
    const alreadyReversed = database.point_transactions.some((t) => t.reversal_of === transactionId);
    if (alreadyReversed) return null;

    const newId = nextId(database.point_transactions, 'pt', 4);
    database.point_transactions.push({
      id: newId,
      user_id: original.user_id,
      points: -original.points,
      reason_id: original.reason_id,
      reason_text_en: `Correction — ${original.reason_text_en}`,
      reason_text_ar: `تصحيح — ${original.reason_text_ar}`,
      event_id: original.event_id,
      project_id: original.project_id,
      awarded_by: actorId,
      created_at: new Date().toISOString(),
      reversal_of: transactionId,
    });
    return newId;
  });

  if (created) {
    await recordAudit({
      actorId,
      action: 'points.reverse',
      entity: 'point_transactions',
      entityId: created,
      summaryEn: 'Recorded a compensating point transaction',
      summaryAr: 'تسجيل حركة نقاط معاكسة للتصحيح',
      reason,
    });
  }
}

export async function createPointReason(
  actorId: ID,
  input: { code: string; labelEn: string; labelAr: string; defaultPoints: number },
): Promise<void> {
  await write((database) => {
    database.point_reasons.push({
      id: nextId(database.point_reasons, 'pr'),
      code: input.code,
      label_en: input.labelEn,
      label_ar: input.labelAr || input.labelEn,
      default_points: input.defaultPoints,
      active: true,
    });
  });
  await recordAudit({
    actorId,
    action: 'points.create_reason',
    entity: 'point_reasons',
    entityId: null,
    summaryEn: `Added the point reason “${input.labelEn}”`,
    summaryAr: `إضافة سبب نقاط «${input.labelAr || input.labelEn}»`,
  });
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                     */
/* -------------------------------------------------------------------------- */

export async function awardBadge(actorId: ID, userId: ID, badgeId: ID, note?: string): Promise<void> {
  const granted = await write((database) => {
    const already = database.user_badges.some((ub) => ub.user_id === userId && ub.badge_id === badgeId);
    if (already) return false;
    database.user_badges.push({
      id: nextId(database.user_badges, 'ub', 4),
      user_id: userId,
      badge_id: badgeId,
      awarded_by: actorId,
      awarded_at: new Date().toISOString(),
      note: note ?? null,
    });
    return true;
  });
  if (granted) {
    await recordAudit({
      actorId,
      action: 'badge.award',
      entity: 'user_badges',
      entityId: userId,
      summaryEn: 'Awarded a badge',
      summaryAr: 'منح وسام',
      reason: note,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

export async function createTask(input: {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  committeeId: ID | null;
  projectId: ID | null;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeIds: ID[];
}): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.tasks, 't');
    database.tasks.push({
      id: newId,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      description_en: input.descriptionEn,
      description_ar: input.descriptionEn,
      committee_id: input.committeeId,
      project_id: input.projectId,
      event_id: null,
      status: 'todo',
      priority: input.priority,
      due_date: input.dueDate,
      created_by: input.actorId,
      created_at: new Date().toISOString(),
    });
    for (const userId of input.assigneeIds) {
      database.task_assignees.push({ task_id: newId, user_id: userId });
    }
    return newId;
  });
  return id;
}

export async function setTaskStatus(actorId: ID, taskId: ID, status: TaskStatus): Promise<void> {
  await write((database) => {
    const task = database.tasks.find((t) => t.id === taskId);
    if (task) task.status = status;
  });
}

/* -------------------------------------------------------------------------- */
/* Challenges                                                                 */
/* -------------------------------------------------------------------------- */

export async function submitChallengeAnswer(
  userId: ID,
  challengeId: ID,
  answer: string,
): Promise<{ accepted: boolean; correct: boolean }> {
  const result = await write((database) => {
    const challenge = database.challenges.find((c) => c.id === challengeId);
    if (!challenge) return { accepted: false, correct: false, points: 0 };

    const now = Date.now();
    if (now < new Date(challenge.opens_at).getTime() || now > new Date(challenge.closes_at).getTime()) {
      return { accepted: false, correct: false, points: 0 };
    }
    if (database.challenge_submissions.some((s) => s.challenge_id === challengeId && s.user_id === userId)) {
      return { accepted: false, correct: false, points: 0 };
    }

    const correct = answer.trim().toLowerCase() === challenge.correct_answer.trim().toLowerCase();
    database.challenge_submissions.push({
      id: nextId(database.challenge_submissions, 'cs', 4),
      challenge_id: challengeId,
      user_id: userId,
      answer,
      is_correct: correct,
      submitted_at: new Date().toISOString(),
      points_awarded: correct ? challenge.points : 0,
    });

    if (correct) {
      database.point_transactions.push({
        id: nextId(database.point_transactions, 'pt', 4),
        user_id: userId,
        points: challenge.points,
        reason_id: database.point_reasons.find((r) => r.code === 'challenge')?.id ?? null,
        reason_text_en: 'Correct challenge answer',
        reason_text_ar: 'إجابة صحيحة في تحدٍّ',
        event_id: null,
        project_id: null,
        awarded_by: challenge.created_by,
        created_at: new Date().toISOString(),
        reversal_of: null,
      });
    }

    return { accepted: true, correct, points: correct ? challenge.points : 0 };
  });

  return { accepted: result.accepted, correct: result.correct };
}

export async function createChallenge(input: {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  kind: string;
  questionEn: string;
  questionAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctAnswer: string;
  explanationEn: string;
  explanationAr: string;
  points: number;
  opensAt: string;
  closesAt: string;
}): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.challenges, 'ch');
    const status: ChallengeStatus =
      Date.now() < new Date(input.opensAt).getTime() ? 'scheduled' : 'open';
    database.challenges.push({
      id: newId,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      kind: input.kind as never,
      question_en: input.questionEn,
      question_ar: input.questionAr || input.questionEn,
      image_url: null,
      options_en: input.optionsEn,
      options_ar: input.optionsAr.length ? input.optionsAr : input.optionsEn,
      correct_answer: input.correctAnswer,
      explanation_en: input.explanationEn,
      explanation_ar: input.explanationAr || input.explanationEn,
      points: input.points,
      opens_at: input.opensAt,
      closes_at: input.closesAt,
      status,
      created_by: input.actorId,
    });
    return newId;
  });
  await recordAudit({
    actorId: input.actorId,
    action: 'challenge.create',
    entity: 'challenges',
    entityId: id,
    summaryEn: `Created the challenge “${input.titleEn}”`,
    summaryAr: `إنشاء تحدٍّ «${input.titleAr || input.titleEn}»`,
  });
  return id;
}

/* -------------------------------------------------------------------------- */
/* Ideas                                                                      */
/* -------------------------------------------------------------------------- */

export async function submitIdea(input: {
  userId: ID;
  title: string;
  description: string;
  category: string;
}): Promise<ID> {
  return write((database) => {
    const id = nextId(database.ideas, 'i');
    database.ideas.push({
      id,
      user_id: input.userId,
      title: input.title,
      description: input.description,
      category: input.category,
      attachment_url: null,
      status: 'new',
      admin_feedback: null,
      created_at: new Date().toISOString(),
      decided_by: null,
      decided_at: null,
    });
    return id;
  });
}

export async function setIdeaStatus(
  actorId: ID,
  ideaId: ID,
  status: IdeaStatus,
  feedback?: string,
): Promise<void> {
  await write((database) => {
    const idea = database.ideas.find((i) => i.id === ideaId);
    if (!idea) return;
    idea.status = status;
    idea.decided_by = actorId;
    idea.decided_at = new Date().toISOString();
    if (feedback !== undefined) idea.admin_feedback = feedback;
  });
  await recordAudit({
    actorId,
    action: 'idea.decide',
    entity: 'ideas',
    entityId: ideaId,
    summaryEn: `Set idea status to ${status.replace('_', ' ')}`,
    summaryAr: `تعيين حالة الفكرة إلى ${status}`,
    reason: feedback,
  });
}

export async function toggleIdeaVote(userId: ID, ideaId: ID): Promise<void> {
  await write((database) => {
    const index = database.idea_votes.findIndex((v) => v.idea_id === ideaId && v.user_id === userId);
    if (index >= 0) database.idea_votes.splice(index, 1);
    else database.idea_votes.push({ idea_id: ideaId, user_id: userId, created_at: new Date().toISOString() });
  });
}

/* -------------------------------------------------------------------------- */
/* Announcements                                                              */
/* -------------------------------------------------------------------------- */

export async function createAnnouncement(input: {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  level: AnnouncementLevel;
  audienceKind: AudienceKind;
  audienceCommitteeId: ID | null;
  pinned: boolean;
}): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.announcements, 'an');
    database.announcements.push({
      id: newId,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      body_en: input.bodyEn,
      body_ar: input.bodyAr || input.bodyEn,
      level: input.level,
      audience_kind: input.audienceKind,
      audience_committee_id: input.audienceCommitteeId,
      audience_user_ids: [],
      published_at: new Date().toISOString(),
      expires_at: null,
      created_by: input.actorId,
      pinned: input.pinned,
    });
    return newId;
  });
  await recordAudit({
    actorId: input.actorId,
    action: 'announcement.publish',
    entity: 'announcements',
    entityId: id,
    summaryEn: `Published the announcement “${input.titleEn}”`,
    summaryAr: `نشر إعلان «${input.titleAr || input.titleEn}»`,
  });
  return id;
}

export async function deleteAnnouncement(actorId: ID, announcementId: ID): Promise<void> {
  await write((database) => {
    const index = database.announcements.findIndex((a) => a.id === announcementId);
    if (index >= 0) database.announcements.splice(index, 1);
  });
  await recordAudit({
    actorId,
    action: 'announcement.delete',
    entity: 'announcements',
    entityId: announcementId,
    summaryEn: 'Removed an announcement',
    summaryAr: 'حذف إعلان',
  });
}

/* -------------------------------------------------------------------------- */
/* Magazine editorial workflow                                                */
/* -------------------------------------------------------------------------- */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 72);
}

export async function createArticleDraft(input: {
  authorId: ID;
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  categoryId: ID;
  bodyEn: string;
  bodyAr: string;
  references: string[];
  submit: boolean;
}): Promise<ID> {
  const { parseArticleBody } = await import('@/lib/domain/article-body');
  const blocks = parseArticleBody(input.bodyEn, input.bodyAr);
  const words = input.bodyEn.split(/\s+/).filter(Boolean).length;

  const id = await write((database) => {
    const newId = nextId(database.magazine_articles, 'ma');
    const now = new Date().toISOString();
    database.magazine_articles.push({
      id: newId,
      slug: `${slugify(input.titleEn)}-${newId.split('-')[1]}`,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      subtitle_en: input.subtitleEn,
      subtitle_ar: input.subtitleAr || input.subtitleEn,
      category_id: input.categoryId,
      author_id: input.authorId,
      cover_image: null,
      blocks,
      reading_minutes: Math.max(1, Math.round(words / 200)),
      status: input.submit ? 'submitted' : 'draft',
      submitted_at: input.submit ? now : null,
      reviewed_by: null,
      review_notes: null,
      scheduled_for: null,
      published_at: null,
      featured: false,
      views: 0,
      references: input.references,
      created_at: now,
      updated_at: now,
    });
    database.magazine_submissions.push({
      id: nextId(database.magazine_submissions, 'ms', 4),
      article_id: newId,
      action: 'created',
      note: null,
      actor_id: input.authorId,
      created_at: now,
    });
    if (input.submit) {
      database.magazine_submissions.push({
        id: nextId(database.magazine_submissions, 'ms', 4),
        article_id: newId,
        action: 'submitted',
        note: null,
        actor_id: input.authorId,
        created_at: now,
      });
    }
    return newId;
  });
  return id;
}

export async function transitionArticle(
  actorId: ID,
  articleId: ID,
  next: ArticleStatus,
  note?: string,
  scheduledFor?: string,
): Promise<void> {
  await write((database) => {
    const article = database.magazine_articles.find((a) => a.id === articleId);
    if (!article) return;
    const now = new Date().toISOString();

    article.status = next;
    article.updated_at = now;
    if (next === 'submitted') article.submitted_at = now;
    if (next === 'under_review' || next === 'approved' || next === 'revision_requested') {
      article.reviewed_by = actorId;
    }
    if (note !== undefined) article.review_notes = note || null;
    if (next === 'scheduled') article.scheduled_for = scheduledFor ?? null;
    if (next === 'published') {
      article.published_at = article.published_at ?? now;
      article.scheduled_for = null;
    }
    if (next === 'unpublished') article.published_at = null;

    database.magazine_submissions.push({
      id: nextId(database.magazine_submissions, 'ms', 4),
      article_id: articleId,
      action: next,
      note: note ?? null,
      actor_id: actorId,
      created_at: now,
    });
  });

  await recordAudit({
    actorId,
    action: `magazine.${next}`,
    entity: 'magazine_articles',
    entityId: articleId,
    summaryEn: `Article status set to ${next.replace('_', ' ')}`,
    summaryAr: `تعيين حالة المقال إلى ${next}`,
    reason: note,
  });
}

export async function setArticleFeatured(actorId: ID, articleId: ID, featured: boolean): Promise<void> {
  await write((database) => {
    if (featured) {
      for (const a of database.magazine_articles) a.featured = false;
    }
    const article = database.magazine_articles.find((a) => a.id === articleId);
    if (article) article.featured = featured;
  });
  await recordAudit({
    actorId,
    action: 'magazine.feature',
    entity: 'magazine_articles',
    entityId: articleId,
    summaryEn: featured ? 'Set article as the featured story' : 'Removed article from the cover',
    summaryAr: featured ? 'تعيين المقال مقالًا للغلاف' : 'إزالة المقال من الغلاف',
  });
}

export async function incrementArticleViews(articleId: ID): Promise<void> {
  await write((database) => {
    const article = database.magazine_articles.find((a) => a.id === articleId);
    if (article) article.views += 1;
  });
}

export async function createIssue(input: {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  editorsNoteEn: string;
  editorsNoteAr: string;
  articleIds: ID[];
}): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.magazine_issues, 'mi');
    const number = Math.max(0, ...database.magazine_issues.map((i) => i.number)) + 1;
    database.magazine_issues.push({
      id: newId,
      number,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      cover_image: null,
      editors_note_en: input.editorsNoteEn,
      editors_note_ar: input.editorsNoteAr || input.editorsNoteEn,
      published_on: null,
      status: 'draft',
      pdf_url: null,
    });
    input.articleIds.forEach((articleId, index) => {
      database.magazine_issue_articles.push({ issue_id: newId, article_id: articleId, sort_order: index });
    });
    return newId;
  });
  await recordAudit({
    actorId: input.actorId,
    action: 'magazine.create_issue',
    entity: 'magazine_issues',
    entityId: id,
    summaryEn: `Created a new magazine issue`,
    summaryAr: 'إنشاء عدد جديد من المجلة',
  });
  return id;
}

export async function publishIssue(actorId: ID, issueId: ID): Promise<void> {
  await write((database) => {
    const issue = database.magazine_issues.find((i) => i.id === issueId);
    if (!issue) return;
    issue.status = 'published';
    issue.published_on = new Date().toISOString().slice(0, 10);
  });
  await recordAudit({
    actorId,
    action: 'magazine.publish_issue',
    entity: 'magazine_issues',
    entityId: issueId,
    summaryEn: 'Published a magazine issue',
    summaryAr: 'نشر عدد من المجلة',
  });
}

/* -------------------------------------------------------------------------- */
/* Gallery & resources                                                        */
/* -------------------------------------------------------------------------- */

export async function createAlbum(input: {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  isPublic: boolean;
}): Promise<ID> {
  return write((database) => {
    const id = nextId(database.gallery_albums, 'ga');
    database.gallery_albums.push({
      id,
      slug: `${slugify(input.titleEn)}-${id.split('-')[1]}`,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      description_en: input.descriptionEn,
      description_ar: input.descriptionEn,
      event_id: null,
      cover_image: null,
      created_at: new Date().toISOString(),
      is_public: input.isPublic,
    });
    return id;
  });
}

export async function createResource(input: {
  actorId: ID;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  category: string;
  fileUrl: string;
  fileKind: string;
  visibility: string;
}): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.resources, 'r');
    database.resources.push({
      id: newId,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      description_en: input.descriptionEn,
      description_ar: input.descriptionEn,
      category: input.category as never,
      file_url: input.fileUrl || '#',
      file_kind: input.fileKind as never,
      size_kb: 0,
      visibility: input.visibility as never,
      uploaded_by: input.actorId,
      uploaded_at: new Date().toISOString(),
    });
    return newId;
  });
  await recordAudit({
    actorId: input.actorId,
    action: 'resource.create',
    entity: 'resources',
    entityId: id,
    summaryEn: `Added the resource “${input.titleEn}”`,
    summaryAr: `إضافة مصدر «${input.titleAr || input.titleEn}»`,
  });
  return id;
}

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

export async function issueCertificate(input: {
  actorId: ID;
  userId: ID;
  kind: string;
  titleEn: string;
  titleAr: string;
  eventId: ID | null;
  projectId: ID | null;
}): Promise<ID> {
  const id = await write((database) => {
    const newId = nextId(database.certificates, 'cert', 3);
    const year = new Date().getFullYear();
    const sequence = String(database.certificates.length + 1).padStart(4, '0');
    database.certificates.push({
      id: newId,
      user_id: input.userId,
      kind: input.kind as never,
      title_en: input.titleEn,
      title_ar: input.titleAr || input.titleEn,
      event_id: input.eventId,
      project_id: input.projectId,
      issued_on: new Date().toISOString().slice(0, 10),
      serial: `AECC-${year}-${sequence}`,
      issued_by: input.actorId,
      template_key: input.kind,
      pdf_url: null,
    });
    return newId;
  });
  await recordAudit({
    actorId: input.actorId,
    action: 'certificate.issue',
    entity: 'certificates',
    entityId: id,
    summaryEn: `Issued the certificate “${input.titleEn}”`,
    summaryAr: `إصدار شهادة «${input.titleAr || input.titleEn}»`,
  });
  return id;
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export async function updateSetting(actorId: ID, key: string, value: string): Promise<void> {
  await write((database) => {
    const setting = database.club_settings.find((s) => s.key === key);
    if (setting) setting.value = value;
    else database.club_settings.push({ key, value });
  });
  await recordAudit({
    actorId,
    action: 'settings.update',
    entity: 'club_settings',
    entityId: null,
    summaryEn: `Updated the setting “${key}”`,
    summaryAr: `تحديث الإعداد «${key}»`,
  });
}
