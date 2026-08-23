import type { PillTone } from '@/components/ui';
import type { Dictionary } from '@/lib/i18n';
import type {
  AnnouncementLevel,
  ArticleStatus,
  AttendanceStatus,
  ChallengeStatus,
  EventStatus,
  IdeaStatus,
  ProjectStatus,
  RoleKey,
  SessionKind,
  TaskPriority,
  TaskStatus,
} from './types';

/**
 * Single source of truth for how every status is worded and coloured.
 *
 * Colour never carries meaning on its own — each status renders as a labelled pill,
 * which is the non-colour status cue the accessibility section calls for.
 */

export interface StatusDescriptor {
  label: string;
  tone: PillTone;
}

export function eventStatus(status: EventStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'registration_open':
      return { label: d.events.statusRegistrationOpen, tone: 'success' };
    case 'full':
      return { label: d.events.statusFull, tone: 'warning' };
    case 'completed':
      return { label: d.events.statusCompleted, tone: 'neutral' };
    case 'cancelled':
      return { label: d.events.statusCancelled, tone: 'danger' };
    default:
      return { label: d.events.statusUpcoming, tone: 'plum' };
  }
}

export function attendanceStatus(status: AttendanceStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'present':
      return { label: d.attendance.present, tone: 'success' };
    case 'late':
      return { label: d.attendance.late, tone: 'warning' };
    case 'excused':
      return { label: d.attendance.excused, tone: 'mauve' };
    default:
      return { label: d.attendance.absent, tone: 'danger' };
  }
}

export function sessionKind(kind: SessionKind | string, d: Dictionary): string {
  switch (kind) {
    case 'workshop':
      return d.attendance.kindWorkshop;
    case 'event':
      return d.attendance.kindEvent;
    case 'competition':
      return d.attendance.kindCompetition;
    case 'committee':
      return d.attendance.kindCommittee;
    default:
      return d.attendance.kindMeeting;
  }
}

export function taskStatus(status: TaskStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'in_progress':
      return { label: d.tasks.inProgress, tone: 'rose' };
    case 'review':
      return { label: d.tasks.review, tone: 'mauve' };
    case 'done':
      return { label: d.tasks.done, tone: 'success' };
    default:
      return { label: d.tasks.todo, tone: 'neutral' };
  }
}

export function taskPriority(priority: TaskPriority, d: Dictionary): StatusDescriptor {
  switch (priority) {
    case 'high':
      return { label: d.tasks.priorityHigh, tone: 'danger' };
    case 'medium':
      return { label: d.tasks.priorityMedium, tone: 'warning' };
    default:
      return { label: d.tasks.priorityLow, tone: 'neutral' };
  }
}

export function projectStatus(status: ProjectStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'active':
      return { label: d.projects.statusActive, tone: 'plum' };
    case 'review':
      return { label: d.projects.statusReview, tone: 'mauve' };
    case 'completed':
      return { label: d.projects.statusCompleted, tone: 'success' };
    case 'on_hold':
      return { label: d.projects.statusOnHold, tone: 'warning' };
    default:
      return { label: d.projects.statusPlanning, tone: 'neutral' };
  }
}

export function challengeStatus(status: ChallengeStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'open':
      return { label: d.challenges.statusOpen, tone: 'success' };
    case 'scheduled':
      return { label: d.challenges.statusScheduled, tone: 'mauve' };
    default:
      return { label: d.challenges.statusClosed, tone: 'neutral' };
  }
}

export function challengeKind(kind: string, d: Dictionary): string {
  switch (kind) {
    case 'short_answer':
      return d.challenges.typeShortAnswer;
    case 'image':
      return d.challenges.typeImage;
    case 'mystery':
      return d.challenges.typeMystery;
    default:
      return d.challenges.typeMultipleChoice;
  }
}

export function ideaStatus(status: IdeaStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'under_review':
      return { label: d.ideas.statusUnderReview, tone: 'mauve' };
    case 'approved':
      return { label: d.ideas.statusApproved, tone: 'rose' };
    case 'selected':
      return { label: d.ideas.statusSelected, tone: 'plum' };
    case 'planned':
      return { label: d.ideas.statusPlanned, tone: 'berry' };
    case 'implemented':
      return { label: d.ideas.statusImplemented, tone: 'success' };
    case 'not_selected':
      return { label: d.ideas.statusNotSelected, tone: 'neutral' };
    default:
      return { label: d.ideas.statusNew, tone: 'gold' };
  }
}

export function announcementLevel(level: AnnouncementLevel, d: Dictionary): StatusDescriptor {
  switch (level) {
    case 'urgent':
      return { label: d.announcements.levelUrgent, tone: 'danger' };
    case 'important':
      return { label: d.announcements.levelImportant, tone: 'warning' };
    default:
      return { label: d.announcements.levelNormal, tone: 'neutral' };
  }
}

export function articleStatus(status: ArticleStatus, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'submitted':
      return { label: d.magazine.submitted, tone: 'gold' };
    case 'under_review':
      return { label: d.magazine.underReview, tone: 'mauve' };
    case 'revision_requested':
      return { label: d.magazine.revisionRequested, tone: 'warning' };
    case 'approved':
      return { label: d.magazine.approved, tone: 'rose' };
    case 'scheduled':
      return { label: d.magazine.scheduled, tone: 'berry' };
    case 'published':
      return { label: d.magazine.published, tone: 'success' };
    case 'unpublished':
      return { label: d.magazine.unpublished, tone: 'danger' };
    default:
      return { label: d.magazine.statusDraft, tone: 'neutral' };
  }
}

export function roleLabel(role: RoleKey, d: Dictionary): string {
  switch (role) {
    case 'admin':
      return d.roles.admin;
    case 'president':
      return d.roles.president;
    case 'vice_president':
      return d.roles.vice_president;
    case 'committee_leader':
      return d.roles.committee_leader;
    default:
      return d.roles.member;
  }
}

export function roleTone(role: RoleKey): PillTone {
  switch (role) {
    case 'admin':
      return 'plum';
    case 'president':
      return 'gold';
    case 'vice_president':
      return 'berry';
    case 'committee_leader':
      return 'rose';
    default:
      return 'neutral';
  }
}

export function memberStatus(status: string, d: Dictionary): StatusDescriptor {
  switch (status) {
    case 'active':
      return { label: d.members.statusActive, tone: 'success' };
    case 'inactive':
      return { label: d.members.statusInactive, tone: 'neutral' };
    case 'alumna':
      return { label: d.members.statusAlumna, tone: 'mauve' };
    default:
      return { label: d.members.statusPending, tone: 'warning' };
  }
}

export function resourceCategory(category: string, d: Dictionary): string {
  switch (category) {
    case 'safety':
      return d.resources.catSafety;
    case 'experiments':
      return d.resources.catExperiments;
    case 'research':
      return d.resources.catResearch;
    case 'competitions':
      return d.resources.catCompetitions;
    case 'policies':
      return d.resources.catPolicies;
    default:
      return d.resources.catPresentations;
  }
}

export function certificateKind(kind: string, d: Dictionary): string {
  switch (kind) {
    case 'outstanding':
      return d.certificates.kindOutstanding;
    case 'ambassador':
      return d.certificates.kindAmbassador;
    case 'competition':
      return d.certificates.kindCompetition;
    case 'research':
      return d.certificates.kindResearch;
    default:
      return d.certificates.kindParticipation;
  }
}

export function badgeTier(tier: string, d: Dictionary): StatusDescriptor {
  switch (tier) {
    case 'honour':
      return { label: d.achievements.tierGold, tone: 'gold' };
    case 'distinction':
      return { label: d.achievements.tierSilver, tone: 'rose' };
    default:
      return { label: d.achievements.tierBronze, tone: 'neutral' };
  }
}

/** Committee accent → pill tone, keeping committee colour consistent app-wide. */
export function accentTone(accent: string): PillTone {
  switch (accent) {
    case 'plum':
      return 'plum';
    case 'rose':
      return 'rose';
    case 'gold':
      return 'gold';
    case 'mauve':
      return 'mauve';
    case 'berry':
      return 'berry';
    default:
      return 'soft';
  }
}
