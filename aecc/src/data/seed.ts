import { hashPassword } from '@/lib/auth/password';
import { ROLES } from '@/lib/auth/rbac';
import type {
  Announcement,
  AttendanceRecord,
  AttendanceSession,
  AuditLog,
  Badge,
  Certificate,
  Challenge,
  ChallengeSubmission,
  ClubEvent,
  Committee,
  CommitteeMember,
  CommitteeSlug,
  Database,
  EventRegistration,
  GalleryAlbum,
  GalleryImage,
  Idea,
  IdeaVote,
  MagazineAchievement,
  MagazineArticle,
  MagazineAuthor,
  MagazineCompetition,
  MagazineIssue,
  MagazineIssueArticle,
  MagazineSubmissionEvent,
  MagazineTopStudent,
  MagazineValueOfMonth,
  PointReason,
  PointTransaction,
  Profile,
  Project,
  ProjectFile,
  ProjectMember,
  ProjectMilestone,
  Resource,
  Task,
  TaskAssignee,
  User,
  UserBadge,
  UserRole,
} from '@/lib/domain/types';
import { SEED_PEOPLE } from './people';

/* -------------------------------------------------------------------------- */
/* Static club structure                                                      */
/* -------------------------------------------------------------------------- */

const COMMITTEE_DEFS: {
  slug: CommitteeSlug;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  accent: Committee['accent'];
}[] = [
  {
    slug: 'experiments-innovation',
    name_en: 'Experiments & Innovation Committee',
    name_ar: 'لجنة التجارب والابتكار',
    description_en:
      'Designs and conducts scientific experiments, develops innovative chemistry projects, and maintains laboratory safety standards.',
    description_ar:
      'تصمّم التجارب العلمية وتنفّذها، وتطوّر مشاريع كيميائية مبتكرة، وتحافظ على معايير السلامة المخبرية.',
    accent: 'plum',
  },
  {
    slug: 'media-design',
    name_en: 'Media & Design Committee',
    name_ar: 'لجنة الإعلام والتصميم',
    description_en:
      "Manages the club's visual identity, social media presence, photography, and the art direction of publications.",
    description_ar:
      'تدير الهوية البصرية للنادي وحضوره على وسائل التواصل الاجتماعي والتصوير والإخراج الفني للمنشورات.',
    accent: 'rose',
  },
  {
    slug: 'content-education',
    name_en: 'Content & Education Committee',
    name_ar: 'لجنة المحتوى والتعليم',
    description_en:
      'Produces educational content, revision materials, teaching aids, and peer tutoring programmes for students.',
    description_ar:
      'تُنتج المحتوى التعليمي ومواد المراجعة والوسائل التعليمية وبرامج الدعم الدراسي للطالبات.',
    accent: 'mauve',
  },
  {
    slug: 'chemistry-community',
    name_en: 'Chemistry, Community & Environment Committee',
    name_ar: 'لجنة الكيمياء والمجتمع والبيئة',
    description_en:
      'Connects chemistry to everyday life, runs community outreach campaigns, and applies green chemistry principles to environmental projects.',
    description_ar:
      'تربط الكيمياء بالحياة اليومية، وتدير حملات التواصل المجتمعي، وتطبّق مبادئ الكيمياء الخضراء في المشاريع البيئية.',
    accent: 'soft',
  },
  {
    slug: 'competitions-events',
    name_en: 'Competitions & Events Committee',
    name_ar: 'لجنة المسابقات والفعاليات',
    description_en:
      'Plans and organises club events, workshops, exhibitions, and prepares members for chemistry competitions at all levels.',
    description_ar:
      'تخطّط وتنظّم فعاليات النادي وورش العمل والمعارض، وتُعدّ العضوات لمسابقات الكيمياء على جميع المستويات.',
    accent: 'gold',
  },
  {
    slug: 'research-projects',
    name_en: 'Research & Projects Committee',
    name_ar: 'لجنة البحث والمشروعات',
    description_en:
      "Leads the club's research investigations, from literature review through to data analysis, results, and presentation.",
    description_ar:
      'تقود الأبحاث والدراسات في النادي، من مراجعة الأدبيات حتى تحليل البيانات والنتائج والعرض.',
    accent: 'berry',
  },
];

const BADGE_DEFS: Omit<Badge, 'id'>[] = [
  {
    code: 'lab-explorer',
    name_en: 'Lab Explorer',
    name_ar: 'مستكشفة المختبر',
    description_en: 'Completed her first five supervised laboratory sessions.',
    description_ar: 'أكملت أول خمس جلسات مختبرية بإشراف.',
    icon: 'flask-conical',
    tier: 'foundation',
  },
  {
    code: 'young-researcher',
    name_en: 'Young Researcher',
    name_ar: 'باحثة ناشئة',
    description_en: 'Contributed to a club research project from question to result.',
    description_ar: 'شاركت في مشروع بحثي للنادي من السؤال حتى النتيجة.',
    icon: 'microscope',
    tier: 'distinction',
  },
  {
    code: 'chemistry-champion',
    name_en: 'Chemistry Champion',
    name_ar: 'بطلة الكيمياء',
    description_en: 'Placed in an inter-school chemistry competition.',
    description_ar: 'حصلت على مركز في مسابقة كيمياء بين المدارس.',
    icon: 'award',
    tier: 'honour',
  },
  {
    code: 'green-chemist',
    name_en: 'Green Chemist',
    name_ar: 'كيميائية خضراء',
    description_en: 'Led a measurable reduction in laboratory waste.',
    description_ar: 'قادت خفضًا قابلًا للقياس في نفايات المختبر.',
    icon: 'leaf',
    tier: 'distinction',
  },
  {
    code: 'active-member',
    name_en: 'Active Member',
    name_ar: 'عضوة نشطة',
    description_en: 'Maintained attendance above ninety per cent for a full term.',
    description_ar: 'حافظت على حضور يتجاوز تسعين بالمئة لفصل كامل.',
    icon: 'calendar-check',
    tier: 'foundation',
  },
  {
    code: 'club-leader',
    name_en: 'Club Leader',
    name_ar: 'قائدة في النادي',
    description_en: 'Served as a committee leader or club officer.',
    description_ar: 'تولّت قيادة لجنة أو منصبًا في مجلس النادي.',
    icon: 'crown',
    tier: 'honour',
  },
  {
    code: 'event-organizer',
    name_en: 'Event Organizer',
    name_ar: 'منظِّمة فعاليات',
    description_en: 'Took a lead role in organising a club event.',
    description_ar: 'تولّت دورًا قياديًا في تنظيم إحدى فعاليات النادي.',
    icon: 'calendar-range',
    tier: 'distinction',
  },
  {
    code: 'innovation-award',
    name_en: 'Innovation Award',
    name_ar: 'جائزة الابتكار',
    description_en: 'Proposed an idea that the club adopted and implemented.',
    description_ar: 'قدّمت فكرة تبنّاها النادي ونفّذها.',
    icon: 'lightbulb',
    tier: 'honour',
  },
  {
    code: 'science-writer',
    name_en: 'AECC Science Writer',
    name_ar: 'كاتبة علمية في النادي',
    description_en: 'Published an article in the AECC Electronic Magazine.',
    description_ar: 'نشرت مقالًا في المجلة الإلكترونية للنادي.',
    icon: 'pen-line',
    tier: 'distinction',
  },
];

const POINT_REASON_DEFS: Omit<PointReason, 'id'>[] = [
  { code: 'attend-meeting', label_en: 'Attend a club meeting', label_ar: 'حضور لقاء النادي', default_points: 5, active: true },
  { code: 'experiment', label_en: 'Participate in an experiment', label_ar: 'المشاركة في تجربة', default_points: 10, active: true },
  { code: 'idea', label_en: 'Submit a useful idea', label_ar: 'تقديم فكرة مفيدة', default_points: 10, active: true },
  { code: 'content', label_en: 'Design educational content', label_ar: 'إعداد محتوى تعليمي', default_points: 15, active: true },
  { code: 'organise', label_en: 'Help organise an event', label_ar: 'المساعدة في تنظيم فعالية', default_points: 20, active: true },
  { code: 'compete', label_en: 'Participate in a competition', label_ar: 'المشاركة في مسابقة', default_points: 30, active: true },
  { code: 'win', label_en: 'Win a competition', label_ar: 'الفوز في مسابقة', default_points: 50, active: true },
  { code: 'article', label_en: 'Publish a magazine article', label_ar: 'نشر مقال في المجلة', default_points: 25, active: true },
  { code: 'challenge', label_en: 'Correct challenge answer', label_ar: 'إجابة صحيحة في تحدٍّ', default_points: 10, active: true },
];

/* -------------------------------------------------------------------------- */
/* Seed builder                                                               */
/* -------------------------------------------------------------------------- */

export async function createSeedDatabase(): Promise<Database> {
  /* ---------------------------------------------------------------- users -- */
  const users: User[] = [];
  const profiles: Profile[] = [];
  const user_roles: UserRole[] = [];

  for (const person of SEED_PEOPLE) {
    const { hash, salt } = await hashPassword(person.password);
    users.push({
      id: person.id,
      username: person.username,
      email: person.email,
      password_hash: hash,
      password_salt: salt,
      status: person.status,
      must_change_password: false,
      last_login_at: null,
      created_at: `${person.joined}T08:00:00.000Z`,
    });
    profiles.push({
      user_id: person.id,
      full_name_en: person.name_en,
      full_name_ar: person.name_ar,
      grade: person.grade,
      avatar_url: `/media/avatars/${person.id}.svg`,
      bio_en: person.bio_en,
      bio_ar: person.bio_ar,
      joined_at: person.joined,
      phone: null,
      guardian_contact: null,
      admin_notes: null,
    });
    user_roles.push({
      user_id: person.id,
      role_key: person.role,
      granted_by: null,
      granted_at: `${person.joined}T08:05:00.000Z`,
    });
  }

  /* ----------------------------------------------------------- committees -- */
  const committees: Committee[] = COMMITTEE_DEFS.map((def, index) => ({
    id: `c-${String(index + 1).padStart(3, '0')}`,
    slug: def.slug,
    name_en: def.name_en,
    name_ar: def.name_ar,
    description_en: def.description_en,
    description_ar: def.description_ar,
    leader_id: null,
    accent: def.accent,
    created_at: '2024-09-01T08:00:00.000Z',
    archived: false,
  }));

  const committee_members: CommitteeMember[] = [];

  /* --- Empty collections (real data entered through the admin interface) --- */
  const events: ClubEvent[] = [];
  const event_registrations: EventRegistration[] = [];
  const attendance_sessions: AttendanceSession[] = [];
  const attendance_records: AttendanceRecord[] = [];

  const point_reasons: PointReason[] = POINT_REASON_DEFS.map((def, index) => ({
    id: `pr-${String(index + 1).padStart(3, '0')}`,
    ...def,
  }));
  const point_transactions: PointTransaction[] = [];

  const badges: Badge[] = BADGE_DEFS.map((def, index) => ({
    id: `b-${String(index + 1).padStart(3, '0')}`,
    ...def,
  }));
  const user_badges: UserBadge[] = [];

  const tasks: Task[] = [];
  const task_assignees: TaskAssignee[] = [];

  const projects: Project[] = [];
  const project_members: ProjectMember[] = [];
  const project_milestones: ProjectMilestone[] = [];
  const project_files: ProjectFile[] = [];

  const challenges: Challenge[] = [];
  const challenge_submissions: ChallengeSubmission[] = [];

  const ideas: Idea[] = [];
  const idea_votes: IdeaVote[] = [];

  const announcements: Announcement[] = [];
  const resources: Resource[] = [];
  const gallery_albums: GalleryAlbum[] = [];
  const gallery_images: GalleryImage[] = [];
  const certificates: Certificate[] = [];

  const magazine_categories = [
    { id: 'mc-001', slug: 'chemistry-around-us', name_en: 'Chemistry Around Us', name_ar: 'الكيمياء من حولنا', description_en: 'How chemistry shapes everyday life.', description_ar: 'كيف تشكّل الكيمياء حياتنا اليومية.', accent: 'plum' as const },
    { id: 'mc-002', slug: 'experiments', name_en: 'Experiments', name_ar: 'التجارب', description_en: 'Practical experiments and laboratory work.', description_ar: 'التجارب العملية والعمل المخبري.', accent: 'rose' as const },
    { id: 'mc-003', slug: 'research', name_en: 'Research', name_ar: 'البحث', description_en: 'Student research and investigations.', description_ar: 'أبحاث الطالبات ودراساتهن.', accent: 'berry' as const },
    { id: 'mc-004', slug: 'sustainability', name_en: 'Sustainability', name_ar: 'الاستدامة', description_en: 'Green chemistry and environmental topics.', description_ar: 'الكيمياء الخضراء والموضوعات البيئية.', accent: 'soft' as const },
  ];

  const magazine_authors: MagazineAuthor[] = [];
  const magazine_articles: MagazineArticle[] = [];
  const magazine_submissions: MagazineSubmissionEvent[] = [];
  const magazine_issues: MagazineIssue[] = [];
  const magazine_issue_articles: MagazineIssueArticle[] = [];
  const magazine_competitions: MagazineCompetition[] = [];
  const magazine_top_students: MagazineTopStudent[] = [];
  const magazine_achievements: MagazineAchievement[] = [];
  const magazine_value_of_month: MagazineValueOfMonth[] = [];

  const audit_logs: AuditLog[] = [];

  const club_settings = [
    { key: 'club_name_en', value: 'Pearl Vita C' },
    { key: 'club_name_ar', value: 'بيرل فيتا سي' },
    { key: 'school_name_en', value: 'Al Eman Secondary School' },
    { key: 'school_name_ar', value: 'مدرسة الإيمان الثانوية' },
    { key: 'academic_year', value: '2026–2027' },
    { key: 'term_start', value: '2026-09-01' },
    { key: 'term_end', value: '2027-06-30' },
    { key: 'idea_voting_enabled', value: 'true' },
    { key: 'event_registration_requires_approval', value: 'false' },
    { key: 'default_locale', value: 'en' },
  ];

  return {
    users,
    profiles,
    roles: Object.values(ROLES),
    user_roles,
    committees,
    committee_members,
    events,
    event_registrations,
    attendance_sessions,
    attendance_records,
    point_reasons,
    point_transactions,
    badges,
    user_badges,
    tasks,
    task_assignees,
    projects,
    project_members,
    project_milestones,
    project_files,
    challenges,
    challenge_submissions,
    ideas,
    idea_votes,
    announcements,
    resources,
    gallery_albums,
    gallery_images,
    certificates,
    magazine_categories,
    magazine_authors,
    magazine_articles,
    magazine_submissions,
    magazine_issues,
    magazine_issue_articles,
    magazine_competitions,
    magazine_top_students,
    magazine_achievements,
    magazine_value_of_month,
    audit_logs,
    club_settings,
  };
}
