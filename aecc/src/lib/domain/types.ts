/**
 * AECC domain model.
 *
 * These interfaces mirror the SQL tables in `supabase/migrations` one-for-one, so
 * the local sample-data adapter and the Supabase adapter return identical shapes.
 * Bilingual content uses paired `_en` / `_ar` columns, read through `pick()`.
 */

export type ID = string;
export type ISODate = string;

/* -------------------------------------------------------------------------- */
/* Roles & permissions                                                        */
/* -------------------------------------------------------------------------- */

export type RoleKey = 'admin' | 'president' | 'vice_president' | 'committee_leader' | 'member';

export type Permission =
  // members & accounts
  | 'members:read'
  | 'members:write'
  | 'members:notes'
  | 'users:admin'
  | 'roles:assign'
  // club operations
  | 'committees:read'
  | 'committees:write'
  | 'committees:write_own'
  | 'events:read'
  | 'events:write'
  | 'events:register'
  | 'attendance:read'
  | 'attendance:write'
  | 'points:read'
  | 'points:award'
  | 'points:read_own'
  // collaboration
  | 'tasks:read'
  | 'tasks:write'
  | 'tasks:write_own'
  | 'projects:read'
  | 'projects:write'
  | 'challenges:read'
  | 'challenges:write'
  | 'challenges:submit'
  | 'ideas:read'
  | 'ideas:submit'
  | 'ideas:moderate'
  | 'announcements:read'
  | 'announcements:write'
  // publishing
  | 'magazine:read'
  | 'magazine:write'
  | 'magazine:review'
  | 'magazine:publish'
  // library & recognition
  | 'gallery:read'
  | 'gallery:write'
  | 'resources:read'
  | 'resources:write'
  | 'badges:read'
  | 'badges:award'
  | 'certificates:read_own'
  | 'certificates:read'
  | 'certificates:issue'
  // oversight
  | 'reports:read'
  | 'audit:read'
  | 'settings:write';

export interface Role {
  key: RoleKey;
  name_en: string;
  name_ar: string;
  rank: number;
  permissions: Permission[];
}

/* -------------------------------------------------------------------------- */
/* Accounts                                                                   */
/* -------------------------------------------------------------------------- */

export type AccountStatus = 'active' | 'inactive' | 'alumna' | 'pending';

export interface User {
  id: ID;
  username: string;
  email: string;
  /** scrypt digest — a plaintext password never exists in the data layer. */
  password_hash: string;
  password_salt: string;
  status: AccountStatus;
  must_change_password: boolean;
  last_login_at: ISODate | null;
  created_at: ISODate;
}

export interface Profile {
  user_id: ID;
  full_name_en: string;
  full_name_ar: string;
  grade: string;
  avatar_url: string | null;
  bio_en: string;
  bio_ar: string;
  joined_at: ISODate;
  phone: string | null;
  guardian_contact: string | null;
  /** Supervisor-only. Never serialised to a member-facing response. */
  admin_notes: string | null;
}

export interface UserRole {
  user_id: ID;
  role_key: RoleKey;
  granted_by: ID | null;
  granted_at: ISODate;
}

/** A user joined with her profile and role — the shape pages actually consume. */
export interface MemberView {
  id: ID;
  username: string;
  email: string;
  status: AccountStatus;
  role: RoleKey;
  full_name_en: string;
  full_name_ar: string;
  grade: string;
  avatar_url: string | null;
  bio_en: string;
  bio_ar: string;
  joined_at: ISODate;
  phone: string | null;
  guardian_contact: string | null;
  committee_id: ID | null;
  points: number;
  attendance_rate: number;
  badge_count: number;
  last_login_at: ISODate | null;
}

/* -------------------------------------------------------------------------- */
/* Committees                                                                 */
/* -------------------------------------------------------------------------- */

export type CommitteeSlug =
  | 'experiments'
  | 'research-innovation'
  | 'media'
  | 'events'
  | 'sustainability'
  | 'education';

export interface Committee {
  id: ID;
  slug: CommitteeSlug;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  leader_id: ID | null;
  accent: 'plum' | 'rose' | 'gold' | 'mauve' | 'berry' | 'soft';
  created_at: ISODate;
  archived: boolean;
}

export interface CommitteeMember {
  committee_id: ID;
  user_id: ID;
  role_in_committee: 'leader' | 'member';
  joined_at: ISODate;
}

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export type EventStatus = 'upcoming' | 'registration_open' | 'full' | 'completed' | 'cancelled';

export interface ClubEvent {
  id: ID;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  starts_at: ISODate;
  ends_at: ISODate;
  location_en: string;
  location_ar: string;
  organizer_id: ID;
  committee_id: ID | null;
  capacity: number;
  registration_deadline: ISODate | null;
  materials_en: string;
  materials_ar: string;
  safety_note_en: string;
  safety_note_ar: string;
  points_reward: number;
  status: EventStatus;
  cover_image: string | null;
  created_at: ISODate;
}

export type RegistrationStatus = 'registered' | 'pending' | 'waitlisted' | 'declined' | 'cancelled';

export interface EventRegistration {
  id: ID;
  event_id: ID;
  user_id: ID;
  status: RegistrationStatus;
  registered_at: ISODate;
  decided_by: ID | null;
  decided_at: ISODate | null;
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                 */
/* -------------------------------------------------------------------------- */

export type SessionKind = 'meeting' | 'workshop' | 'event' | 'competition' | 'committee';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
  id: ID;
  title_en: string;
  title_ar: string;
  kind: SessionKind;
  held_at: ISODate;
  committee_id: ID | null;
  event_id: ID | null;
  created_by: ID;
  created_at: ISODate;
}

export interface AttendanceRecord {
  id: ID;
  session_id: ID;
  user_id: ID;
  status: AttendanceStatus;
  note: string | null;
  recorded_by: ID;
  recorded_at: ISODate;
}

/* -------------------------------------------------------------------------- */
/* Points                                                                     */
/* -------------------------------------------------------------------------- */

export interface PointReason {
  id: ID;
  code: string;
  label_en: string;
  label_ar: string;
  default_points: number;
  active: boolean;
}

export interface PointTransaction {
  id: ID;
  user_id: ID;
  points: number;
  reason_id: ID | null;
  reason_text_en: string;
  reason_text_ar: string;
  event_id: ID | null;
  project_id: ID | null;
  awarded_by: ID;
  created_at: ISODate;
  /** Set when this row compensates an earlier award (append-only ledger). */
  reversal_of: ID | null;
}

/* -------------------------------------------------------------------------- */
/* Badges                                                                     */
/* -------------------------------------------------------------------------- */

export type BadgeTier = 'foundation' | 'distinction' | 'honour';

export interface Badge {
  id: ID;
  code: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  tier: BadgeTier;
}

export interface UserBadge {
  id: ID;
  user_id: ID;
  badge_id: ID;
  awarded_by: ID;
  awarded_at: ISODate;
  note: string | null;
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                      */
/* -------------------------------------------------------------------------- */

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: ID;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  committee_id: ID | null;
  project_id: ID | null;
  event_id: ID | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: ISODate | null;
  created_by: ID;
  created_at: ISODate;
  completed_at: ISODate | null;
}

export interface TaskAssignee {
  task_id: ID;
  user_id: ID;
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'on_hold';

export interface Project {
  id: ID;
  slug: string;
  title_en: string;
  title_ar: string;
  objective_en: string;
  objective_ar: string;
  description_en: string;
  description_ar: string;
  supervisor_id: ID | null;
  leader_id: ID;
  committee_id: ID | null;
  starts_on: ISODate;
  deadline: ISODate;
  progress: number;
  status: ProjectStatus;
  results_en: string;
  results_ar: string;
  cover_image: string | null;
  is_public: boolean;
}

export interface ProjectMember {
  project_id: ID;
  user_id: ID;
  role_in_project: string;
}

export interface ProjectMilestone {
  id: ID;
  project_id: ID;
  title_en: string;
  title_ar: string;
  due_date: ISODate;
  done: boolean;
}

export interface ProjectFile {
  id: ID;
  project_id: ID;
  name: string;
  url: string;
  kind: 'pdf' | 'doc' | 'sheet' | 'slides' | 'image' | 'other';
  uploaded_by: ID;
  uploaded_at: ISODate;
}

/* -------------------------------------------------------------------------- */
/* Challenges                                                                 */
/* -------------------------------------------------------------------------- */

export type ChallengeKind = 'multiple_choice' | 'short_answer' | 'image' | 'mystery';
export type ChallengeStatus = 'scheduled' | 'open' | 'closed';

export interface Challenge {
  id: ID;
  title_en: string;
  title_ar: string;
  kind: ChallengeKind;
  question_en: string;
  question_ar: string;
  image_url: string | null;
  options_en: string[];
  options_ar: string[];
  correct_answer: string;
  explanation_en: string;
  explanation_ar: string;
  points: number;
  opens_at: ISODate;
  closes_at: ISODate;
  status: ChallengeStatus;
  created_by: ID;
}

export interface ChallengeSubmission {
  id: ID;
  challenge_id: ID;
  user_id: ID;
  answer: string;
  is_correct: boolean;
  submitted_at: ISODate;
  points_awarded: number;
}

/* -------------------------------------------------------------------------- */
/* Ideas                                                                      */
/* -------------------------------------------------------------------------- */

export type IdeaStatus =
  | 'new'
  | 'under_review'
  | 'approved'
  | 'selected'
  | 'planned'
  | 'implemented'
  | 'not_selected';

export interface Idea {
  id: ID;
  user_id: ID;
  title: string;
  description: string;
  category: string;
  attachment_url: string | null;
  status: IdeaStatus;
  admin_feedback: string | null;
  created_at: ISODate;
  decided_by: ID | null;
  decided_at: ISODate | null;
}

export interface IdeaVote {
  idea_id: ID;
  user_id: ID;
  created_at: ISODate;
}

/* -------------------------------------------------------------------------- */
/* Announcements                                                              */
/* -------------------------------------------------------------------------- */

export type AnnouncementLevel = 'normal' | 'important' | 'urgent';
export type AudienceKind = 'everyone' | 'committee' | 'leaders' | 'selected';

export interface Announcement {
  id: ID;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  level: AnnouncementLevel;
  audience_kind: AudienceKind;
  audience_committee_id: ID | null;
  audience_user_ids: ID[];
  published_at: ISODate;
  expires_at: ISODate | null;
  created_by: ID;
  pinned: boolean;
}

/* -------------------------------------------------------------------------- */
/* Resources                                                                  */
/* -------------------------------------------------------------------------- */

export type ResourceCategory =
  | 'safety'
  | 'experiments'
  | 'research'
  | 'competitions'
  | 'policies'
  | 'presentations';
export type ResourceVisibility = 'all' | 'leaders' | 'admin';

export interface Resource {
  id: ID;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: ResourceCategory;
  file_url: string;
  file_kind: 'pdf' | 'doc' | 'slides' | 'sheet' | 'other';
  size_kb: number;
  visibility: ResourceVisibility;
  uploaded_by: ID;
  uploaded_at: ISODate;
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export interface GalleryAlbum {
  id: ID;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  event_id: ID | null;
  cover_image: string | null;
  created_at: ISODate;
  is_public: boolean;
}

export interface GalleryImage {
  id: ID;
  album_id: ID;
  url: string;
  caption_en: string;
  caption_ar: string;
  sort_order: number;
}

/* -------------------------------------------------------------------------- */
/* Certificates                                                               */
/* -------------------------------------------------------------------------- */

export type CertificateKind =
  | 'participation'
  | 'outstanding'
  | 'ambassador'
  | 'competition'
  | 'research';

export interface Certificate {
  id: ID;
  user_id: ID;
  kind: CertificateKind;
  title_en: string;
  title_ar: string;
  event_id: ID | null;
  project_id: ID | null;
  issued_on: ISODate;
  serial: string;
  issued_by: ID;
  template_key: string;
  /** Populated once the PDF renderer is enabled. */
  pdf_url: string | null;
}

/* -------------------------------------------------------------------------- */
/* Electronic magazine                                                        */
/* -------------------------------------------------------------------------- */

export interface MagazineCategory {
  id: ID;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  accent: 'plum' | 'rose' | 'gold' | 'mauve' | 'berry' | 'soft';
}

export interface MagazineAuthor {
  user_id: ID;
  pen_name_en: string;
  pen_name_ar: string;
  bio_en: string;
  bio_ar: string;
  is_student: boolean;
  grade: string | null;
}

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'unpublished';

/** A rich block used by the editorial renderer. */
export type ArticleBlock =
  | { type: 'paragraph'; text_en: string; text_ar: string }
  | { type: 'heading'; text_en: string; text_ar: string }
  | { type: 'quote'; text_en: string; text_ar: string; attribution_en?: string; attribution_ar?: string }
  | { type: 'callout'; title_en: string; title_ar: string; text_en: string; text_ar: string }
  | { type: 'list'; items_en: string[]; items_ar: string[] }
  | { type: 'image'; url: string; caption_en: string; caption_ar: string };

export interface MagazineArticle {
  id: ID;
  slug: string;
  title_en: string;
  title_ar: string;
  subtitle_en: string;
  subtitle_ar: string;
  category_id: ID;
  author_id: ID;
  cover_image: string | null;
  blocks: ArticleBlock[];
  reading_minutes: number;
  status: ArticleStatus;
  submitted_at: ISODate | null;
  reviewed_by: ID | null;
  review_notes: string | null;
  scheduled_for: ISODate | null;
  published_at: ISODate | null;
  featured: boolean;
  views: number;
  references: string[];
  created_at: ISODate;
  updated_at: ISODate;
}

export interface MagazineSubmissionEvent {
  id: ID;
  article_id: ID;
  action: ArticleStatus | 'created' | 'edited';
  note: string | null;
  actor_id: ID;
  created_at: ISODate;
}

export interface MagazineIssue {
  id: ID;
  number: number;
  title_en: string;
  title_ar: string;
  cover_image: string | null;
  editors_note_en: string;
  editors_note_ar: string;
  published_on: ISODate | null;
  status: 'draft' | 'published';
  pdf_url: string | null;
}

export interface MagazineIssueArticle {
  issue_id: ID;
  article_id: ID;
  sort_order: number;
}

/* -------------------------------------------------------------------------- */
/* Oversight                                                                  */
/* -------------------------------------------------------------------------- */

export interface AuditLog {
  id: ID;
  actor_id: ID;
  action: string;
  entity: string;
  entity_id: ID | null;
  summary_en: string;
  summary_ar: string;
  reason: string | null;
  created_at: ISODate;
}

export interface ClubSetting {
  key: string;
  value: string;
}

/* -------------------------------------------------------------------------- */
/* The complete database shape                                                */
/* -------------------------------------------------------------------------- */

export interface Database {
  users: User[];
  profiles: Profile[];
  roles: Role[];
  user_roles: UserRole[];
  committees: Committee[];
  committee_members: CommitteeMember[];
  events: ClubEvent[];
  event_registrations: EventRegistration[];
  attendance_sessions: AttendanceSession[];
  attendance_records: AttendanceRecord[];
  point_reasons: PointReason[];
  point_transactions: PointTransaction[];
  badges: Badge[];
  user_badges: UserBadge[];
  tasks: Task[];
  task_assignees: TaskAssignee[];
  projects: Project[];
  project_members: ProjectMember[];
  project_milestones: ProjectMilestone[];
  project_files: ProjectFile[];
  challenges: Challenge[];
  challenge_submissions: ChallengeSubmission[];
  ideas: Idea[];
  idea_votes: IdeaVote[];
  announcements: Announcement[];
  resources: Resource[];
  gallery_albums: GalleryAlbum[];
  gallery_images: GalleryImage[];
  certificates: Certificate[];
  magazine_categories: MagazineCategory[];
  magazine_authors: MagazineAuthor[];
  magazine_articles: MagazineArticle[];
  magazine_submissions: MagazineSubmissionEvent[];
  magazine_issues: MagazineIssue[];
  magazine_issue_articles: MagazineIssueArticle[];
  audit_logs: AuditLog[];
  club_settings: ClubSetting[];
}
