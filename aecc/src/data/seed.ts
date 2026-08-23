import { hashPassword } from '@/lib/auth/password';
import { ROLES } from '@/lib/auth/rbac';
import type {
  Announcement,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
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
  MagazineArticle,
  MagazineAuthor,
  MagazineIssue,
  MagazineIssueArticle,
  MagazineSubmissionEvent,
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
import { SEED_ARTICLES, SEED_CATEGORIES, SEED_ISSUES } from './magazine-content';
import { SEED_PEOPLE } from './people';

/* -------------------------------------------------------------------------- */
/* Deterministic helpers                                                      */
/* -------------------------------------------------------------------------- */

function makeRandom(seed = 20262027) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const DAY = 86_400_000;

function isoDay(offsetDays: number, base = Date.now()): string {
  return new Date(base + offsetDays * DAY).toISOString().slice(0, 10);
}

function isoAt(offsetDays: number, hour: number, minute = 0, base = Date.now()): string {
  const d = new Date(base + offsetDays * DAY);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function pickFrom<T>(list: T[], rand: () => number): T {
  return list[Math.floor(rand() * list.length)];
}

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
    slug: 'experiments',
    name_en: 'Experiments Team',
    name_ar: 'فريق التجارب',
    description_en:
      'Designs, runs and documents the club’s practical laboratory work, and keeps the safety protocol current.',
    description_ar:
      'يصمّم العمل المختبري العملي للنادي وينفّذه ويوثّقه، ويحافظ على تحديث بروتوكول السلامة.',
    accent: 'plum',
  },
  {
    slug: 'research-innovation',
    name_en: 'Research & Innovation Team',
    name_ar: 'فريق البحث والابتكار',
    description_en:
      'Runs the club’s longer investigations, from literature review through to results and presentation.',
    description_ar: 'ينفّذ دراسات النادي الأطول، من مراجعة الأدبيات حتى النتائج والعرض.',
    accent: 'berry',
  },
  {
    slug: 'media',
    name_en: 'Media Team',
    name_ar: 'الفريق الإعلامي',
    description_en:
      'Photographs, designs and publishes — including the art direction of the electronic magazine.',
    description_ar: 'يصوّر ويصمّم وينشر، ويشمل ذلك الإخراج الفني للمجلة الإلكترونية.',
    accent: 'rose',
  },
  {
    slug: 'events',
    name_en: 'Events Team',
    name_ar: 'فريق الفعاليات',
    description_en:
      'Plans and delivers the club calendar: meetings, workshops, exhibitions and competitions.',
    description_ar: 'يخطّط تقويم النادي وينفّذه: اللقاءات وورش العمل والمعارض والمسابقات.',
    accent: 'gold',
  },
  {
    slug: 'sustainability',
    name_en: 'Sustainability Team',
    name_ar: 'فريق الاستدامة',
    description_en:
      'Applies green chemistry principles to the club’s own practice and to school-wide campaigns.',
    description_ar: 'يطبّق مبادئ الكيمياء الخضراء على ممارسات النادي وعلى حملات المدرسة.',
    accent: 'soft',
  },
  {
    slug: 'education',
    name_en: 'Education Team',
    name_ar: 'الفريق التعليمي',
    description_en:
      'Produces teaching aids, revision material and peer tutoring for younger students.',
    description_ar: 'يُعدّ الوسائل التعليمية ومواد المراجعة والدعم الدراسي للطالبات الأصغر.',
    accent: 'mauve',
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
  const rand = makeRandom();

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
      last_login_at: person.status === 'active' ? isoAt(-Math.floor(rand() * 6) - 1, 7, 40) : null,
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
      admin_notes:
        person.id === 'u-030'
          ? 'On approved academic leave for the autumn term; membership resumes in January.'
          : null,
    });
    user_roles.push({
      user_id: person.id,
      role_key: person.role,
      granted_by: person.role === 'admin' ? null : 'u-001',
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
    leader_id: SEED_PEOPLE.find((p) => p.committee === def.slug && p.role === 'committee_leader')?.id ?? null,
    accent: def.accent,
    created_at: '2024-09-01T08:00:00.000Z',
    archived: false,
  }));

  const committeeIdBySlug = new Map(committees.map((c) => [c.slug, c.id]));

  const committee_members: CommitteeMember[] = SEED_PEOPLE.filter((p) => p.committee).map((p) => ({
    committee_id: committeeIdBySlug.get(p.committee as CommitteeSlug) as string,
    user_id: p.id,
    role_in_committee: p.role === 'committee_leader' ? ('leader' as const) : ('member' as const),
    joined_at: p.joined,
  }));

  const memberIds = SEED_PEOPLE.filter((p) => p.role !== 'admin').map((p) => p.id);
  const activeMemberIds = SEED_PEOPLE.filter((p) => p.role !== 'admin' && p.status === 'active').map(
    (p) => p.id,
  );

  /* --------------------------------------------------------------- events -- */
  const events: ClubEvent[] = [
    {
      id: 'e-001',
      title_en: 'Microscale Titration Workshop',
      title_ar: 'ورشة المعايرة المصغّرة',
      description_en:
        'A hands-on session on running acid–base titrations at 2 mL scale: technique, endpoint identification, and how to record uncertainty honestly.',
      description_ar:
        'جلسة عملية على إجراء معايرات حمض–قاعدة بحجم ٢ مل: الأسلوب، وتحديد نقطة النهاية، وكيفية تسجيل عدم اليقين بصدق.',
      starts_at: isoAt(6, 10, 30),
      ends_at: isoAt(6, 12, 0),
      location_en: 'Chemistry Laboratory 2',
      location_ar: 'مختبر الكيمياء ٢',
      organizer_id: 'u-005',
      committee_id: committeeIdBySlug.get('experiments') ?? null,
      capacity: 18,
      registration_deadline: isoAt(4, 20, 0),
      materials_en: 'Laboratory coat, safety goggles, bound notebook.',
      materials_ar: 'معطف المختبر، نظارات السلامة، دفتر مجلّد.',
      safety_note_en:
        'Goggles must be worn from entry to exit. Long hair tied back. No open footwear.',
      safety_note_ar:
        'يجب ارتداء النظارات من الدخول حتى الخروج، وربط الشعر الطويل، ومنع الأحذية المكشوفة.',
      points_reward: 10,
      status: 'registration_open',
      cover_image: '/media/events/event-titration.svg',
      created_at: isoAt(-14, 9),
    },
    {
      id: 'e-002',
      title_en: 'Green Chemistry Campaign Launch',
      title_ar: 'إطلاق حملة الكيمياء الخضراء',
      description_en:
        'The Sustainability Team presents this year’s waste reduction targets and opens volunteer registration for the school-wide audit.',
      description_ar:
        'يعرض فريق الاستدامة أهداف خفض النفايات لهذا العام ويفتح تسجيل المتطوعات لجرد المدرسة.',
      starts_at: isoAt(13, 11, 0),
      ends_at: isoAt(13, 12, 30),
      location_en: 'Main Hall',
      location_ar: 'القاعة الرئيسية',
      organizer_id: 'u-009',
      committee_id: committeeIdBySlug.get('sustainability') ?? null,
      capacity: 60,
      registration_deadline: isoAt(11, 20, 0),
      materials_en: 'None required.',
      materials_ar: 'لا يلزم شيء.',
      safety_note_en: 'No laboratory work in this session.',
      safety_note_ar: 'لا يتضمن هذا اللقاء عملًا مختبريًا.',
      points_reward: 5,
      status: 'registration_open',
      cover_image: '/media/events/event-green-week.svg',
      created_at: isoAt(-10, 9),
    },
    {
      id: 'e-003',
      title_en: 'Regional Chemistry Olympiad — Qualifier',
      title_ar: 'أولمبياد الكيمياء على مستوى المنطقة — التصفيات',
      description_en:
        'Selected members represent Al Eman Secondary School in the regional qualifying round. Travel and supervision arranged by the club supervisors.',
      description_ar:
        'تمثّل عضوات مختارات مدرسة الإيمان الثانوية في الدور التأهيلي على مستوى المنطقة، والتنقل والإشراف بترتيب من مشرفات النادي.',
      starts_at: isoAt(27, 8, 0),
      ends_at: isoAt(27, 15, 0),
      location_en: 'Regional Education Centre',
      location_ar: 'مركز التعليم بالمنطقة',
      organizer_id: 'u-001',
      committee_id: committeeIdBySlug.get('research-innovation') ?? null,
      capacity: 8,
      registration_deadline: isoAt(18, 20, 0),
      materials_en: 'Approved scientific calculator, school identification card.',
      materials_ar: 'آلة حاسبة علمية معتمدة، بطاقة الهوية المدرسية.',
      safety_note_en: 'Members travel together with a supervisor at all times.',
      safety_note_ar: 'تنتقل العضوات معًا برفقة مشرفة في جميع الأوقات.',
      points_reward: 30,
      status: 'full',
      cover_image: '/media/events/event-competition.svg',
      created_at: isoAt(-21, 9),
    },
    {
      id: 'e-004',
      title_en: 'Open Laboratory Evening',
      title_ar: 'أمسية المختبر المفتوح',
      description_en:
        'Families and teachers are invited to the laboratory for eight short demonstrations run entirely by club members.',
      description_ar:
        'دعوة لأولياء الأمور والمعلمات إلى المختبر لحضور ثماني تجارب توضيحية قصيرة تُقدّمها عضوات النادي بالكامل.',
      starts_at: isoAt(38, 17, 0),
      ends_at: isoAt(38, 19, 0),
      location_en: 'Chemistry Laboratories 1 and 2',
      location_ar: 'مختبرا الكيمياء ١ و٢',
      organizer_id: 'u-008',
      committee_id: committeeIdBySlug.get('events') ?? null,
      capacity: 40,
      registration_deadline: isoAt(33, 20, 0),
      materials_en: 'Presenters bring their prepared demonstration sheet.',
      materials_ar: 'تُحضر المقدِّمات ورقة التجربة المُعدّة مسبقًا.',
      safety_note_en:
        'Visitors remain behind the demonstration line. Only members handle reagents.',
      safety_note_ar: 'يبقى الزوار خلف خط العرض، ولا تتعامل مع الكواشف سوى العضوات.',
      points_reward: 20,
      status: 'upcoming',
      cover_image: '/media/events/event-open-lab.svg',
      created_at: isoAt(-6, 9),
    },
    {
      id: 'e-005',
      title_en: 'Science Exhibition 2026',
      title_ar: 'معرض العلوم ٢٠٢٦',
      description_en:
        'The club’s annual exhibition. Fourteen stands, four research posters and the launch of Issue 02 of the magazine.',
      description_ar:
        'المعرض السنوي للنادي: أربعة عشر ركنًا، وأربعة ملصقات بحثية، وإطلاق العدد الثاني من المجلة.',
      starts_at: isoAt(-32, 9, 0),
      ends_at: isoAt(-32, 14, 0),
      location_en: 'School Courtyard',
      location_ar: 'فناء المدرسة',
      organizer_id: 'u-004',
      committee_id: committeeIdBySlug.get('events') ?? null,
      capacity: 120,
      registration_deadline: isoAt(-38, 20, 0),
      materials_en: 'Stand materials distributed in advance.',
      materials_ar: 'تُوزَّع مواد الأركان مسبقًا.',
      safety_note_en: 'All outdoor demonstrations pre-approved by the chemistry department.',
      safety_note_ar: 'جميع التجارب الخارجية معتمدة مسبقًا من قسم الكيمياء.',
      points_reward: 20,
      status: 'completed',
      cover_image: '/media/events/event-exhibition.svg',
      created_at: isoAt(-70, 9),
    },
    {
      id: 'e-006',
      title_en: 'Committee Leaders’ Planning Meeting',
      title_ar: 'اجتماع تخطيط قائدات اللجان',
      description_en: 'Term planning for the six committees: targets, calendar and shared resources.',
      description_ar: 'تخطيط الفصل للجان الست: الأهداف والتقويم والموارد المشتركة.',
      starts_at: isoAt(-4, 13, 0),
      ends_at: isoAt(-4, 14, 30),
      location_en: 'Meeting Room A',
      location_ar: 'قاعة الاجتماعات أ',
      organizer_id: 'u-003',
      committee_id: null,
      capacity: 10,
      registration_deadline: null,
      materials_en: 'Committee term report.',
      materials_ar: 'تقرير اللجنة الفصلي.',
      safety_note_en: '',
      safety_note_ar: '',
      points_reward: 5,
      status: 'completed',
      cover_image: null,
      created_at: isoAt(-20, 9),
    },
  ];

  /* -------------------------------------------------------- registrations -- */
  const event_registrations: EventRegistration[] = [];
  let regSeq = 1;
  const registerMany = (eventId: string, ids: string[], status: EventRegistration['status']) => {
    for (const userId of ids) {
      event_registrations.push({
        id: `er-${String(regSeq++).padStart(4, '0')}`,
        event_id: eventId,
        user_id: userId,
        status,
        registered_at: isoAt(-Math.floor(rand() * 8) - 1, 12),
        decided_by: status === 'registered' ? 'u-001' : null,
        decided_at: status === 'registered' ? isoAt(-1, 12) : null,
      });
    }
  };

  registerMany('e-001', activeMemberIds.slice(0, 14), 'registered');
  registerMany('e-001', activeMemberIds.slice(14, 17), 'pending');
  registerMany('e-002', activeMemberIds.slice(2, 20), 'registered');
  registerMany('e-003', ['u-003', 'u-006', 'u-015', 'u-016', 'u-017', 'u-005', 'u-013', 'u-027'], 'registered');
  registerMany('e-004', activeMemberIds.slice(0, 11), 'registered');
  registerMany('e-005', activeMemberIds, 'registered');
  registerMany('e-006', ['u-003', 'u-004', 'u-005', 'u-006', 'u-007', 'u-008', 'u-009', 'u-010'], 'registered');

  /* ----------------------------------------------------------- attendance -- */
  const attendance_sessions: AttendanceSession[] = [];
  const attendance_records: AttendanceRecord[] = [];
  let sessionSeq = 1;
  let recordSeq = 1;

  const sessionPlan: {
    offset: number;
    kind: AttendanceSession['kind'];
    title_en: string;
    title_ar: string;
    committee?: CommitteeSlug;
    eventId?: string;
    cohort: string[];
  }[] = [
    { offset: -60, kind: 'meeting', title_en: 'Opening club meeting', title_ar: 'لقاء افتتاح النادي', cohort: activeMemberIds },
    { offset: -53, kind: 'workshop', title_en: 'Laboratory safety refresher', title_ar: 'تجديد إرشادات سلامة المختبر', cohort: activeMemberIds },
    { offset: -46, kind: 'meeting', title_en: 'Weekly club meeting', title_ar: 'اللقاء الأسبوعي للنادي', cohort: activeMemberIds },
    { offset: -39, kind: 'committee', title_en: 'Experiments Team session', title_ar: 'جلسة فريق التجارب', committee: 'experiments', cohort: [] },
    { offset: -32, kind: 'event', title_en: 'Science Exhibition 2026', title_ar: 'معرض العلوم ٢٠٢٦', eventId: 'e-005', cohort: activeMemberIds },
    { offset: -25, kind: 'meeting', title_en: 'Weekly club meeting', title_ar: 'اللقاء الأسبوعي للنادي', cohort: activeMemberIds },
    { offset: -18, kind: 'committee', title_en: 'Research & Innovation session', title_ar: 'جلسة البحث والابتكار', committee: 'research-innovation', cohort: [] },
    { offset: -11, kind: 'workshop', title_en: 'Scientific writing workshop', title_ar: 'ورشة الكتابة العلمية', cohort: activeMemberIds },
    { offset: -4, kind: 'meeting', title_en: 'Committee leaders’ planning', title_ar: 'تخطيط قائدات اللجان', eventId: 'e-006', cohort: ['u-003', 'u-004', 'u-005', 'u-006', 'u-007', 'u-008', 'u-009', 'u-010'] },
  ];

  for (const plan of sessionPlan) {
    const sessionId = `as-${String(sessionSeq++).padStart(3, '0')}`;
    const committeeId = plan.committee ? (committeeIdBySlug.get(plan.committee) ?? null) : null;
    attendance_sessions.push({
      id: sessionId,
      title_en: plan.title_en,
      title_ar: plan.title_ar,
      kind: plan.kind,
      held_at: isoAt(plan.offset, 11),
      committee_id: committeeId,
      event_id: plan.eventId ?? null,
      created_by: 'u-001',
      created_at: isoAt(plan.offset - 2, 9),
    });

    const cohort =
      plan.cohort.length > 0
        ? plan.cohort
        : committee_members.filter((cm) => cm.committee_id === committeeId).map((cm) => cm.user_id);

    for (const userId of cohort) {
      const roll = rand();
      let status: AttendanceStatus = 'present';
      if (roll > 0.93) status = 'absent';
      else if (roll > 0.87) status = 'late';
      else if (roll > 0.84) status = 'excused';
      attendance_records.push({
        id: `ar-${String(recordSeq++).padStart(4, '0')}`,
        session_id: sessionId,
        user_id: userId,
        status,
        note: status === 'excused' ? 'Approved absence' : null,
        recorded_by: 'u-001',
        recorded_at: isoAt(plan.offset, 12),
      });
    }
  }

  /* --------------------------------------------------------------- points -- */
  const point_reasons: PointReason[] = POINT_REASON_DEFS.map((def, index) => ({
    id: `pr-${String(index + 1).padStart(3, '0')}`,
    ...def,
  }));
  const reasonByCode = new Map(point_reasons.map((r) => [r.code, r]));

  const point_transactions: PointTransaction[] = [];
  let txSeq = 1;
  const award = (
    userId: string,
    reasonCode: string,
    offsetDays: number,
    overrides: Partial<PointTransaction> = {},
  ) => {
    const reason = reasonByCode.get(reasonCode);
    if (!reason) return;
    point_transactions.push({
      id: `pt-${String(txSeq++).padStart(4, '0')}`,
      user_id: userId,
      points: overrides.points ?? reason.default_points,
      reason_id: reason.id,
      reason_text_en: reason.label_en,
      reason_text_ar: reason.label_ar,
      event_id: overrides.event_id ?? null,
      project_id: overrides.project_id ?? null,
      awarded_by: overrides.awarded_by ?? 'u-001',
      created_at: isoAt(offsetDays, 13),
      reversal_of: overrides.reversal_of ?? null,
    });
  };

  // Attendance awards mirror the recorded sessions.
  for (const record of attendance_records) {
    if (record.status !== 'present' && record.status !== 'late') continue;
    const session = attendance_sessions.find((s) => s.id === record.session_id);
    if (!session) continue;
    const offset = Math.round((new Date(session.held_at).getTime() - Date.now()) / DAY);
    award(record.user_id, 'attend-meeting', offset, { points: record.status === 'late' ? 3 : 5 });
  }

  // Baseline contribution awards, distributed to match each member's seeded standing.
  for (const person of SEED_PEOPLE) {
    if (person.role === 'admin') continue;
    let remaining = person.seedPoints;
    const codes = ['experiment', 'content', 'organise', 'idea', 'article', 'compete'];
    let guard = 0;
    while (remaining > 8 && guard < 12) {
      guard += 1;
      const code = pickFrom(codes, rand);
      const reason = reasonByCode.get(code);
      if (!reason || reason.default_points > remaining) continue;
      award(person.id, code, -Math.floor(rand() * 55) - 2);
      remaining -= reason.default_points;
    }
  }

  // Competition results from the exhibition season.
  award('u-003', 'win', -30, { event_id: 'e-005', points: 50 });
  award('u-009', 'compete', -30, { event_id: 'e-005' });
  award('u-006', 'compete', -30, { event_id: 'e-005' });

  // A correction, demonstrating the append-only ledger.
  const original = point_transactions.find((t) => t.user_id === 'u-022');
  if (original) {
    point_transactions.push({
      id: `pt-${String(txSeq++).padStart(4, '0')}`,
      user_id: 'u-022',
      points: -original.points,
      reason_id: original.reason_id,
      reason_text_en: 'Correction — award recorded against the wrong member',
      reason_text_ar: 'تصحيح — سُجّل المنح لعضوة خاطئة',
      event_id: null,
      project_id: null,
      awarded_by: 'u-001',
      created_at: isoAt(-2, 14),
      reversal_of: original.id,
    });
  }

  /* --------------------------------------------------------------- badges -- */
  const badges: Badge[] = BADGE_DEFS.map((def, index) => ({
    id: `b-${String(index + 1).padStart(3, '0')}`,
    ...def,
  }));
  const badgeByCode = new Map(badges.map((b) => [b.code, b]));

  const user_badges: UserBadge[] = [];
  let ubSeq = 1;
  const grant = (userId: string, code: string, offset: number, note?: string) => {
    const badge = badgeByCode.get(code);
    if (!badge) return;
    user_badges.push({
      id: `ub-${String(ubSeq++).padStart(4, '0')}`,
      user_id: userId,
      badge_id: badge.id,
      awarded_by: 'u-001',
      awarded_at: isoAt(offset, 14),
      note: note ?? null,
    });
  };

  grant('u-003', 'club-leader', -300);
  grant('u-003', 'chemistry-champion', -30, 'First place, regional qualifier');
  grant('u-003', 'young-researcher', -120);
  grant('u-004', 'club-leader', -300);
  grant('u-004', 'event-organizer', -32);
  for (const leaderId of ['u-005', 'u-006', 'u-007', 'u-008', 'u-009', 'u-010']) {
    grant(leaderId, 'club-leader', -280);
    grant(leaderId, 'active-member', -60);
  }
  grant('u-009', 'green-chemist', -45);
  grant('u-024', 'green-chemist', -40);
  grant('u-015', 'young-researcher', -90);
  grant('u-016', 'young-researcher', -90);
  grant('u-028', 'innovation-award', -55);
  for (const id of ['u-011', 'u-012', 'u-013', 'u-014', 'u-021', 'u-025']) grant(id, 'lab-explorer', -35);
  for (const id of ['u-013', 'u-018', 'u-020', 'u-023', 'u-027']) grant(id, 'active-member', -50);
  grant('u-008', 'event-organizer', -32);
  grant('u-023', 'event-organizer', -32);
  // Science Writer badge for every published author.
  for (const id of new Set(SEED_ARTICLES.filter((a) => a.status === 'published').map((a) => a.authorId))) {
    grant(id, 'science-writer', -25);
  }

  /* -------------------------------------------------------------- projects -- */
  const projects: Project[] = [
    {
      id: 'p-001',
      slug: 'green-chemistry-project',
      title_en: 'Green Chemistry Project',
      title_ar: 'مشروع الكيمياء الخضراء',
      objective_en:
        'Redesign the school’s standard chemistry practicals to cut measurable waste by at least a third without reducing learning value.',
      objective_ar:
        'إعادة تصميم التجارب الكيميائية المعتادة في المدرسة لخفض النفايات المقاسة بمقدار الثلث على الأقل دون تقليل القيمة التعليمية.',
      description_en:
        'The Sustainability Team audits each practical for reagent volume, hazard class and disposal route, then proposes a microscale or substituted alternative. Every redesign is tested twice before adoption.',
      description_ar:
        'يراجع فريق الاستدامة كل تجربة من حيث حجم الكواشف وصنف الخطورة وطريقة التخلص، ثم يقترح بديلًا مصغّرًا أو مستبدَلًا. وتُختبر كل إعادة تصميم مرتين قبل اعتمادها.',
      supervisor_id: 'u-001',
      leader_id: 'u-009',
      committee_id: committeeIdBySlug.get('sustainability') ?? null,
      starts_on: isoDay(-120),
      deadline: isoDay(45),
      progress: 72,
      status: 'active',
      results_en:
        'Three practicals redesigned. Measured waste down 2.4 kg over one term; reagent spend down 31%.',
      results_ar:
        'أُعيد تصميم ثلاث تجارب، وانخفضت النفايات المقاسة ٢٫٤ كجم في فصل واحد، وانخفض الإنفاق على الكواشف ٣١٪.',
      cover_image: '/media/projects/project-green.svg',
      is_public: true,
    },
    {
      id: 'p-002',
      slug: 'water-treatment-research',
      title_en: 'Water Treatment Research',
      title_ar: 'بحث معالجة المياه',
      objective_en:
        'Determine which locally available filter medium removes turbidity from greywater most effectively per unit cost.',
      objective_ar:
        'تحديد أي وسط ترشيح متوفر محليًا أكثر فاعلية في إزالة العكارة من المياه الرمادية مقابل التكلفة.',
      description_en:
        'A six-month comparative study across four filter media, with controlled sample handling, replicate runs and cost-per-litre analysis.',
      description_ar:
        'دراسة مقارنة على مدى ستة أشهر لأربعة أوساط ترشيح، بمناولة عيّنات مضبوطة وجولات مكررة وتحليل للتكلفة لكل لتر.',
      supervisor_id: 'u-001',
      leader_id: 'u-003',
      committee_id: committeeIdBySlug.get('research-innovation') ?? null,
      starts_on: isoDay(-180),
      deadline: isoDay(20),
      progress: 88,
      status: 'review',
      results_en:
        'Activated charcoal performs best overall; crushed date-palm fibre is the most promising low-cost medium but varies significantly between batches.',
      results_ar:
        'الفحم المنشّط الأفضل إجمالًا، وليف النخيل المطحون أكثر الأوساط منخفضة التكلفة وعدًا لكن تباينه بين الدفعات كبير.',
      cover_image: '/media/projects/project-water.svg',
      is_public: true,
    },
    {
      id: 'p-003',
      slug: 'chemistry-week',
      title_en: 'Chemistry Week',
      title_ar: 'أسبوع الكيمياء',
      objective_en:
        'Deliver a five-day programme of demonstrations and talks that reaches every year group in the school.',
      objective_ar: 'تنفيذ برنامج من خمسة أيام من التجارب والمحاضرات يصل إلى كل صفوف المدرسة.',
      description_en:
        'Planning, scheduling, safety approval, volunteer rota and documentation for the club’s largest annual programme.',
      description_ar:
        'التخطيط والجدولة واعتماد السلامة وجدول المتطوعات والتوثيق لأكبر برامج النادي السنوية.',
      supervisor_id: 'u-002',
      leader_id: 'u-008',
      committee_id: committeeIdBySlug.get('events') ?? null,
      starts_on: isoDay(-90),
      deadline: isoDay(-30),
      progress: 100,
      status: 'completed',
      results_en: 'Eleven demonstrations delivered across five days to more than four hundred visitors.',
      results_ar: 'قُدّمت إحدى عشرة تجربة على مدى خمسة أيام لأكثر من أربعمئة زائرة.',
      cover_image: '/media/projects/project-week.svg',
      is_public: true,
    },
    {
      id: 'p-004',
      slug: 'sustainability-campaign',
      title_en: 'Sustainability Campaign',
      title_ar: 'حملة الاستدامة',
      objective_en:
        'Run a school-wide recycling and consumption audit and publish the findings with the school council.',
      objective_ar: 'تنفيذ جرد لإعادة التدوير والاستهلاك على مستوى المدرسة ونشر النتائج مع مجلس الطالبات.',
      description_en:
        'Data collection across twelve locations, monthly weighing, and a public report at the end of term.',
      description_ar: 'جمع بيانات من اثني عشر موقعًا، ووزن شهري، وتقرير عام في نهاية الفصل.',
      supervisor_id: 'u-002',
      leader_id: 'u-024',
      committee_id: committeeIdBySlug.get('sustainability') ?? null,
      starts_on: isoDay(-40),
      deadline: isoDay(70),
      progress: 34,
      status: 'active',
      results_en: '',
      results_ar: '',
      cover_image: '/media/projects/project-sustainability.svg',
      is_public: false,
    },
  ];

  const project_members: ProjectMember[] = [
    { project_id: 'p-001', user_id: 'u-009', role_in_project: 'Project leader' },
    { project_id: 'p-001', user_id: 'u-024', role_in_project: 'Waste audit' },
    { project_id: 'p-001', user_id: 'u-025', role_in_project: 'Data recording' },
    { project_id: 'p-001', user_id: 'u-026', role_in_project: 'School liaison' },
    { project_id: 'p-001', user_id: 'u-005', role_in_project: 'Laboratory advisor' },
    { project_id: 'p-002', user_id: 'u-003', role_in_project: 'Project leader' },
    { project_id: 'p-002', user_id: 'u-015', role_in_project: 'Data analysis' },
    { project_id: 'p-002', user_id: 'u-016', role_in_project: 'Literature review' },
    { project_id: 'p-002', user_id: 'u-017', role_in_project: 'Instrumentation' },
    { project_id: 'p-002', user_id: 'u-006', role_in_project: 'Method design' },
    { project_id: 'p-003', user_id: 'u-008', role_in_project: 'Project leader' },
    { project_id: 'p-003', user_id: 'u-004', role_in_project: 'Programme oversight' },
    { project_id: 'p-003', user_id: 'u-021', role_in_project: 'Logistics' },
    { project_id: 'p-003', user_id: 'u-023', role_in_project: 'Guest relations' },
    { project_id: 'p-003', user_id: 'u-018', role_in_project: 'Documentation' },
    { project_id: 'p-004', user_id: 'u-024', role_in_project: 'Project leader' },
    { project_id: 'p-004', user_id: 'u-026', role_in_project: 'Council liaison' },
    { project_id: 'p-004', user_id: 'u-025', role_in_project: 'Data collection' },
  ];

  const project_milestones: ProjectMilestone[] = [
    { id: 'pm-001', project_id: 'p-001', title_en: 'Audit all current practicals', title_ar: 'جرد جميع التجارب الحالية', due_date: isoDay(-95), done: true },
    { id: 'pm-002', project_id: 'p-001', title_en: 'Redesign titration to microscale', title_ar: 'إعادة تصميم المعايرة إلى مقياس مصغّر', due_date: isoDay(-60), done: true },
    { id: 'pm-003', project_id: 'p-001', title_en: 'Redesign copper displacement', title_ar: 'إعادة تصميم إحلال النحاس', due_date: isoDay(-25), done: true },
    { id: 'pm-004', project_id: 'p-001', title_en: 'Redesign ester synthesis', title_ar: 'إعادة تصميم تحضير الإستر', due_date: isoDay(15), done: false },
    { id: 'pm-005', project_id: 'p-001', title_en: 'Publish waste reduction report', title_ar: 'نشر تقرير خفض النفايات', due_date: isoDay(42), done: false },
    { id: 'pm-006', project_id: 'p-002', title_en: 'Literature review complete', title_ar: 'إتمام مراجعة الأدبيات', due_date: isoDay(-150), done: true },
    { id: 'pm-007', project_id: 'p-002', title_en: 'Standardise sample handling', title_ar: 'توحيد مناولة العيّنات', due_date: isoDay(-110), done: true },
    { id: 'pm-008', project_id: 'p-002', title_en: 'Complete four media trials', title_ar: 'إتمام تجارب الأوساط الأربعة', due_date: isoDay(-30), done: true },
    { id: 'pm-009', project_id: 'p-002', title_en: 'Cost analysis', title_ar: 'تحليل التكلفة', due_date: isoDay(-8), done: true },
    { id: 'pm-010', project_id: 'p-002', title_en: 'Final report and poster', title_ar: 'التقرير النهائي والملصق', due_date: isoDay(18), done: false },
    { id: 'pm-011', project_id: 'p-003', title_en: 'Programme approved', title_ar: 'اعتماد البرنامج', due_date: isoDay(-80), done: true },
    { id: 'pm-012', project_id: 'p-003', title_en: 'Demonstrations rehearsed', title_ar: 'تدريب على التجارب', due_date: isoDay(-45), done: true },
    { id: 'pm-013', project_id: 'p-003', title_en: 'Week delivered', title_ar: 'تنفيذ الأسبوع', due_date: isoDay(-32), done: true },
    { id: 'pm-014', project_id: 'p-004', title_en: 'Select audit locations', title_ar: 'اختيار مواقع الجرد', due_date: isoDay(-30), done: true },
    { id: 'pm-015', project_id: 'p-004', title_en: 'First monthly weigh-in', title_ar: 'أول قياس شهري', due_date: isoDay(-5), done: true },
    { id: 'pm-016', project_id: 'p-004', title_en: 'Mid-term data review', title_ar: 'مراجعة بيانات منتصف الفصل', due_date: isoDay(30), done: false },
    { id: 'pm-017', project_id: 'p-004', title_en: 'Publish findings', title_ar: 'نشر النتائج', due_date: isoDay(68), done: false },
  ];

  const project_files: ProjectFile[] = [
    { id: 'pf-001', project_id: 'p-001', name: 'Waste audit template.xlsx', url: '#', kind: 'sheet', uploaded_by: 'u-009', uploaded_at: isoAt(-100, 10) },
    { id: 'pf-002', project_id: 'p-001', name: 'Microscale titration method.pdf', url: '#', kind: 'pdf', uploaded_by: 'u-005', uploaded_at: isoAt(-62, 10) },
    { id: 'pf-003', project_id: 'p-002', name: 'Turbidity raw data.xlsx', url: '#', kind: 'sheet', uploaded_by: 'u-015', uploaded_at: isoAt(-35, 10) },
    { id: 'pf-004', project_id: 'p-002', name: 'Literature summary.docx', url: '#', kind: 'doc', uploaded_by: 'u-016', uploaded_at: isoAt(-148, 10) },
    { id: 'pf-005', project_id: 'p-002', name: 'Draft research poster.pdf', url: '#', kind: 'pdf', uploaded_by: 'u-003', uploaded_at: isoAt(-6, 10) },
    { id: 'pf-006', project_id: 'p-003', name: 'Chemistry Week schedule.pdf', url: '#', kind: 'pdf', uploaded_by: 'u-008', uploaded_at: isoAt(-70, 10) },
  ];

  /* ----------------------------------------------------------------- tasks -- */
  const tasks: Task[] = [
    { id: 't-001', title_en: 'Prepare reagents for the titration workshop', title_ar: 'تحضير الكواشف لورشة المعايرة', description_en: 'Standardise 0.1 M NaOH and label all bottles with date and concentration.', description_ar: 'معايرة هيدروكسيد الصوديوم ٠٫١ مولاري ووسم جميع الزجاجات بالتاريخ والتركيز.', committee_id: committeeIdBySlug.get('experiments') ?? null, project_id: null, event_id: 'e-001', status: 'in_progress', priority: 'high', due_date: isoDay(4), created_by: 'u-005', created_at: isoAt(-8, 9) },
    { id: 't-002', title_en: 'Print safety sheets for Laboratory 2', title_ar: 'طباعة أوراق السلامة لمختبر ٢', description_en: 'Fifteen copies, laminated, one per bench.', description_ar: 'خمس عشرة نسخة مغلّفة، واحدة لكل طاولة.', committee_id: committeeIdBySlug.get('experiments') ?? null, project_id: null, event_id: 'e-001', status: 'todo', priority: 'medium', due_date: isoDay(5), created_by: 'u-005', created_at: isoAt(-6, 9) },
    { id: 't-003', title_en: 'Finalise the water treatment poster', title_ar: 'إنهاء ملصق معالجة المياه', description_en: 'Incorporate the cost analysis chart and supervisor comments.', description_ar: 'إدراج مخطط تحليل التكلفة وملاحظات المشرفة.', committee_id: committeeIdBySlug.get('research-innovation') ?? null, project_id: 'p-002', event_id: null, status: 'review', priority: 'high', due_date: isoDay(6), created_by: 'u-003', created_at: isoAt(-12, 9) },
    { id: 't-004', title_en: 'Photograph the Open Laboratory rehearsal', title_ar: 'تصوير بروفة المختبر المفتوح', description_en: 'Wide shots of each demonstration station for the magazine.', description_ar: 'لقطات واسعة لكل ركن تجربة لاستخدامها في المجلة.', committee_id: committeeIdBySlug.get('media') ?? null, project_id: null, event_id: 'e-004', status: 'todo', priority: 'low', due_date: isoDay(30), created_by: 'u-007', created_at: isoAt(-3, 9) },
    { id: 't-005', title_en: 'Design the Issue 03 cover', title_ar: 'تصميم غلاف العدد الثالث', description_en: 'Follow the AECC editorial cover system; three options for review.', description_ar: 'الالتزام بنظام أغلفة النادي التحريري، مع ثلاثة خيارات للمراجعة.', committee_id: committeeIdBySlug.get('media') ?? null, project_id: null, event_id: null, status: 'in_progress', priority: 'medium', due_date: isoDay(21), created_by: 'u-007', created_at: isoAt(-9, 9) },
    { id: 't-006', title_en: 'Book the main hall for the campaign launch', title_ar: 'حجز القاعة الرئيسية لإطلاق الحملة', description_en: 'Confirm with administration and request the projector.', description_ar: 'التأكيد مع الإدارة وطلب جهاز العرض.', committee_id: committeeIdBySlug.get('events') ?? null, project_id: null, event_id: 'e-002', status: 'done', priority: 'high', due_date: isoDay(-2), created_by: 'u-008', created_at: isoAt(-15, 9) },
    { id: 't-007', title_en: 'Collect the second monthly recycling weights', title_ar: 'جمع أوزان إعادة التدوير للشهر الثاني', description_en: 'All twelve locations, recorded on the shared sheet by Thursday.', description_ar: 'المواقع الاثنا عشر جميعها، وتُسجَّل في الجدول المشترك قبل الخميس.', committee_id: committeeIdBySlug.get('sustainability') ?? null, project_id: 'p-004', event_id: null, status: 'todo', priority: 'medium', due_date: isoDay(9), created_by: 'u-024', created_at: isoAt(-4, 9) },
    { id: 't-008', title_en: 'Write the Grade 10 bonding revision sheet', title_ar: 'إعداد ورقة مراجعة الروابط للصف العاشر', description_en: 'Two pages, worked examples, matching the current textbook order.', description_ar: 'صفحتان مع أمثلة محلولة تتبع ترتيب الكتاب الحالي.', committee_id: committeeIdBySlug.get('education') ?? null, project_id: null, event_id: null, status: 'in_progress', priority: 'medium', due_date: isoDay(12), created_by: 'u-010', created_at: isoAt(-7, 9) },
    { id: 't-009', title_en: 'Review ester synthesis alternatives', title_ar: 'مراجعة بدائل تحضير الإستر', description_en: 'Compare three lower-hazard acid catalysts and report to the team.', description_ar: 'مقارنة ثلاثة عوامل حفز حمضية أقل خطورة ورفع تقرير للفريق.', committee_id: committeeIdBySlug.get('sustainability') ?? null, project_id: 'p-001', event_id: null, status: 'in_progress', priority: 'high', due_date: isoDay(11), created_by: 'u-009', created_at: isoAt(-5, 9) },
    { id: 't-010', title_en: 'Update the club resource library index', title_ar: 'تحديث فهرس مكتبة مصادر النادي', description_en: 'Archive superseded documents and tag everything by category.', description_ar: 'أرشفة الوثائق المستبدلة ووسم كل شيء حسب التصنيف.', committee_id: null, project_id: null, event_id: null, status: 'done', priority: 'low', due_date: isoDay(-6), created_by: 'u-004', created_at: isoAt(-20, 9) },
    { id: 't-011', title_en: 'Prepare the olympiad practice set', title_ar: 'إعداد مجموعة تدريب الأولمبياد', description_en: 'Twenty past questions with fully worked solutions.', description_ar: 'عشرون سؤالًا سابقًا مع حلول كاملة.', committee_id: committeeIdBySlug.get('research-innovation') ?? null, project_id: null, event_id: 'e-003', status: 'in_progress', priority: 'high', due_date: isoDay(14), created_by: 'u-001', created_at: isoAt(-11, 9) },
    { id: 't-012', title_en: 'Confirm exhibition equipment return', title_ar: 'تأكيد إعادة معدات المعرض', description_en: 'All borrowed glassware checked back into the store.', description_ar: 'التأكد من إعادة جميع الزجاجيات المستعارة إلى المستودع.', committee_id: committeeIdBySlug.get('events') ?? null, project_id: 'p-003', event_id: 'e-005', status: 'done', priority: 'medium', due_date: isoDay(-28), created_by: 'u-008', created_at: isoAt(-34, 9) },
  ];

  const task_assignees: TaskAssignee[] = [
    { task_id: 't-001', user_id: 'u-011' },
    { task_id: 't-001', user_id: 'u-012' },
    { task_id: 't-002', user_id: 'u-014' },
    { task_id: 't-003', user_id: 'u-015' },
    { task_id: 't-003', user_id: 'u-003' },
    { task_id: 't-004', user_id: 'u-018' },
    { task_id: 't-005', user_id: 'u-019' },
    { task_id: 't-006', user_id: 'u-021' },
    { task_id: 't-007', user_id: 'u-025' },
    { task_id: 't-008', user_id: 'u-028' },
    { task_id: 't-008', user_id: 'u-029' },
    { task_id: 't-009', user_id: 'u-026' },
    { task_id: 't-010', user_id: 'u-027' },
    { task_id: 't-011', user_id: 'u-016' },
    { task_id: 't-011', user_id: 'u-017' },
    { task_id: 't-012', user_id: 'u-023' },
  ];

  /* ------------------------------------------------------------ challenges -- */
  const challenges: Challenge[] = [
    {
      id: 'ch-001',
      title_en: 'The disappearing precipitate',
      title_ar: 'الراسب المتلاشي',
      kind: 'multiple_choice',
      question_en:
        'Aqueous sodium hydroxide is added dropwise to aluminium chloride solution. A white precipitate forms and then dissolves as more hydroxide is added. Which property of aluminium hydroxide explains this?',
      question_ar:
        'يُضاف محلول هيدروكسيد الصوديوم قطرةً قطرة إلى محلول كلوريد الألومنيوم، فيتكوّن راسب أبيض ثم يذوب مع زيادة الهيدروكسيد. أي خاصية لهيدروكسيد الألومنيوم تفسّر ذلك؟',
      image_url: null,
      options_en: ['It is amphoteric', 'It is a strong base', 'It is thermally unstable', 'It is a reducing agent'],
      options_ar: ['أنه أمفوتيري', 'أنه قاعدة قوية', 'أنه غير مستقر حراريًا', 'أنه عامل مختزل'],
      correct_answer: 'It is amphoteric',
      explanation_en:
        'Aluminium hydroxide reacts with both acids and bases. In excess hydroxide it forms the soluble aluminate ion, [Al(OH)₄]⁻, so the precipitate redissolves.',
      explanation_ar:
        'يتفاعل هيدروكسيد الألومنيوم مع الأحماض والقواعد معًا. وفي وجود فائض من الهيدروكسيد يكوّن أيون الألومينات الذائب [Al(OH)₄]⁻ فيذوب الراسب.',
      points: 10,
      opens_at: isoAt(-3, 8),
      closes_at: isoAt(4, 20),
      status: 'open',
      created_by: 'u-001',
    },
    {
      id: 'ch-002',
      title_en: 'Reading a rate graph',
      title_ar: 'قراءة منحنى السرعة',
      kind: 'short_answer',
      question_en:
        'A reaction’s concentration–time graph is a straight line with a constant negative gradient until the reactant is exhausted. What is the order of the reaction with respect to that reactant?',
      question_ar:
        'منحنى التركيز–الزمن لتفاعلٍ ما خط مستقيم ذو ميل سالب ثابت حتى نفاد المتفاعل. ما رتبة التفاعل بالنسبة لهذا المتفاعل؟',
      image_url: null,
      options_en: [],
      options_ar: [],
      correct_answer: 'zero',
      explanation_en:
        'A constant rate of change of concentration means the rate does not depend on that reactant’s concentration — a zero-order reaction.',
      explanation_ar:
        'ثبات معدل تغيّر التركيز يعني أن السرعة لا تعتمد على تركيز ذلك المتفاعل، أي تفاعل من الرتبة الصفرية.',
      points: 10,
      opens_at: isoAt(-17, 8),
      closes_at: isoAt(-10, 20),
      status: 'closed',
      created_by: 'u-001',
    },
    {
      id: 'ch-003',
      title_en: 'Chemistry mystery: the cold pack',
      title_ar: 'لغز كيميائي: الكمادة الباردة',
      kind: 'mystery',
      question_en:
        'An instant cold pack contains a solid salt and a sealed pouch of water. Squeezing it makes the pack cold within seconds. No reaction occurs — the salt simply dissolves. Where does the energy go?',
      question_ar:
        'تحتوي الكمادة الباردة الفورية على ملح صلب وكيس ماء محكم. وعند الضغط عليها تبرد خلال ثوانٍ دون حدوث تفاعل، إذ يذوب الملح فحسب. فأين تذهب الطاقة؟',
      image_url: null,
      options_en: [],
      options_ar: [],
      correct_answer: 'lattice',
      explanation_en:
        'Breaking the ionic lattice absorbs more energy than is released when the ions are hydrated. The net enthalpy of solution is positive, so the pack draws heat from its surroundings.',
      explanation_ar:
        'تكسير الشبكة الأيونية يمتص طاقة أكبر مما يُطلق عند إماهة الأيونات، فتكون محصلة إنثالبي الذوبان موجبة وتسحب الكمادة الحرارة من محيطها.',
      points: 15,
      opens_at: isoAt(9, 8),
      closes_at: isoAt(16, 20),
      status: 'scheduled',
      created_by: 'u-002',
    },
    {
      id: 'ch-004',
      title_en: 'Identify the glassware',
      title_ar: 'تعرّفي على الأداة الزجاجية',
      kind: 'image',
      question_en:
        'Which piece of apparatus is shown, and which single property makes it the correct choice for preparing a standard solution?',
      question_ar: 'ما الأداة الظاهرة، وما الخاصية الوحيدة التي تجعلها الاختيار الصحيح لتحضير محلول قياسي؟',
      image_url: '/media/covers/cover-flame.svg',
      options_en: ['Conical flask', 'Volumetric flask', 'Beaker', 'Measuring cylinder'],
      options_ar: ['دورق مخروطي', 'دورق حجمي', 'كأس زجاجي', 'مخبار مدرّج'],
      correct_answer: 'Volumetric flask',
      explanation_en:
        'A volumetric flask is calibrated to contain one precise volume at one temperature, which is what a standard solution requires.',
      explanation_ar:
        'الدورق الحجمي معاير ليحتوي حجمًا واحدًا دقيقًا عند درجة حرارة واحدة، وهو ما يتطلبه المحلول القياسي.',
      points: 10,
      opens_at: isoAt(-31, 8),
      closes_at: isoAt(-24, 20),
      status: 'closed',
      created_by: 'u-001',
    },
  ];

  const challenge_submissions: ChallengeSubmission[] = [];
  let csSeq = 1;
  for (const challenge of challenges) {
    if (challenge.status === 'scheduled') continue;
    const participants = activeMemberIds.filter(() => rand() > (challenge.status === 'open' ? 0.55 : 0.35));
    for (const userId of participants) {
      const isCorrect = rand() > 0.32;
      challenge_submissions.push({
        id: `cs-${String(csSeq++).padStart(4, '0')}`,
        challenge_id: challenge.id,
        user_id: userId,
        answer: isCorrect ? challenge.correct_answer : (challenge.options_en[1] ?? 'first order'),
        is_correct: isCorrect,
        submitted_at: isoAt(Math.round((new Date(challenge.opens_at).getTime() - Date.now()) / DAY) + 1, 15),
        points_awarded: isCorrect ? challenge.points : 0,
      });
    }
  }

  /* ----------------------------------------------------------------- ideas -- */
  const ideas: Idea[] = [
    { id: 'i-001', user_id: 'u-013', title: 'A monthly “chemistry of one object” display', description: 'A small display case in the corridor, changed monthly, explaining the chemistry of a single everyday object — a battery, a match, a bar of soap.', category: 'Outreach', attachment_url: null, status: 'selected', admin_feedback: 'Excellent, low-cost and highly visible. Media Team to design the first case.', created_at: isoAt(-46, 10), decided_by: 'u-001', decided_at: isoAt(-38, 10) },
    { id: 'i-002', user_id: 'u-028', title: 'Peer tutoring hour before exams', description: 'Grade 12 members run a weekly hour of chemistry tutoring for Grade 10 in the two weeks before exams.', category: 'Education', attachment_url: null, status: 'implemented', admin_feedback: 'Ran last term with thirty-one attendees. Now a permanent part of the calendar.', created_at: isoAt(-88, 10), decided_by: 'u-001', decided_at: isoAt(-80, 10) },
    { id: 'i-003', user_id: 'u-019', title: 'Illustrated periodic table for the corridor', description: 'A large printed periodic table where each element carries one real use photographed in the school.', category: 'Media', attachment_url: null, status: 'approved', admin_feedback: 'Approved in principle; needs a printing quote before we can schedule it.', created_at: isoAt(-22, 10), decided_by: 'u-002', decided_at: isoAt(-16, 10) },
    { id: 'i-004', user_id: 'u-025', title: 'Refill station audit', description: 'Measure how much single-use plastic the school could avoid with two more water refill stations.', category: 'Sustainability', attachment_url: null, status: 'under_review', admin_feedback: null, created_at: isoAt(-9, 10), decided_by: null, decided_at: null },
    { id: 'i-005', user_id: 'u-022', title: 'Club podcast', description: 'A short monthly audio episode where a member explains one concept in five minutes.', category: 'Media', attachment_url: null, status: 'new', admin_feedback: null, created_at: isoAt(-3, 10), decided_by: null, decided_at: null },
    { id: 'i-006', user_id: 'u-014', title: 'Glow-in-the-dark chemistry night', description: 'An evening session on luminescence with safe chemiluminescence demonstrations.', category: 'Events', attachment_url: null, status: 'not_selected', admin_feedback: 'The reagents are outside our current safety approval. Revisit if the department approves them.', created_at: isoAt(-58, 10), decided_by: 'u-001', decided_at: isoAt(-50, 10) },
    { id: 'i-007', user_id: 'u-017', title: 'Shared instrument booking sheet', description: 'A simple online sheet so committees do not double-book the pH meter and balance.', category: 'Operations', attachment_url: null, status: 'planned', admin_feedback: 'Sensible. Will be added to the platform’s resources section.', created_at: isoAt(-14, 10), decided_by: 'u-002', decided_at: isoAt(-11, 10) },
  ];

  const idea_votes: IdeaVote[] = [];
  for (const idea of ideas) {
    for (const userId of activeMemberIds) {
      if (userId !== idea.user_id && rand() > 0.62) {
        idea_votes.push({ idea_id: idea.id, user_id: userId, created_at: isoAt(-5, 11) });
      }
    }
  }

  /* --------------------------------------------------------- announcements -- */
  const announcements: Announcement[] = [
    {
      id: 'an-001',
      title_en: 'Registration is open for the Microscale Titration Workshop',
      title_ar: 'التسجيل مفتوح لورشة المعايرة المصغّرة',
      body_en:
        'Eighteen places are available for next week’s workshop in Laboratory 2. Registration closes two days before the session. Laboratory coat and goggles are required — no exceptions.',
      body_ar:
        'تتوفر ثمانية عشر مقعدًا لورشة الأسبوع القادم في مختبر ٢، ويغلق التسجيل قبل الجلسة بيومين. ويلزم معطف المختبر والنظارات دون استثناء.',
      level: 'important',
      audience_kind: 'everyone',
      audience_committee_id: null,
      audience_user_ids: [],
      published_at: isoAt(-2, 9),
      expires_at: isoAt(6, 9),
      created_by: 'u-005',
      pinned: true,
    },
    {
      id: 'an-002',
      title_en: 'Laboratory access suspended on Wednesday morning',
      title_ar: 'تعليق الدخول إلى المختبر صباح الأربعاء',
      body_en:
        'The fume cupboard is being serviced. No member may enter Laboratory 2 before 12:00 on Wednesday, including for equipment collection.',
      body_ar:
        'تُجرى صيانة لخزانة الأبخرة، ولا يُسمح لأي عضوة بدخول مختبر ٢ قبل الساعة ١٢:٠٠ يوم الأربعاء، ولو لاستلام أدوات.',
      level: 'urgent',
      audience_kind: 'everyone',
      audience_committee_id: null,
      audience_user_ids: [],
      published_at: isoAt(-1, 8),
      expires_at: isoAt(3, 12),
      created_by: 'u-001',
      pinned: true,
    },
    {
      id: 'an-003',
      title_en: 'Issue 03 submissions close at the end of the month',
      title_ar: 'يغلق استقبال مشاركات العدد الثالث نهاية الشهر',
      body_en:
        'Drafts for the next magazine issue should be submitted through the platform. Articles arriving after the deadline will be held for Issue 04.',
      body_ar:
        'تُرسل مسودات العدد القادم من المجلة عبر المنصة، وتُؤجَّل المقالات الواردة بعد الموعد إلى العدد الرابع.',
      level: 'normal',
      audience_kind: 'everyone',
      audience_committee_id: null,
      audience_user_ids: [],
      published_at: isoAt(-6, 10),
      expires_at: isoAt(20, 20),
      created_by: 'u-002',
      pinned: false,
    },
    {
      id: 'an-004',
      title_en: 'Research team: bring your raw data sheets on Sunday',
      title_ar: 'فريق البحث: أحضرن أوراق البيانات الخام يوم الأحد',
      body_en:
        'We will reconcile all four media trials against the master sheet before the poster is finalised.',
      body_ar: 'سنطابق تجارب الأوساط الأربعة جميعها مع الجدول الرئيسي قبل إنهاء الملصق.',
      level: 'normal',
      audience_kind: 'committee',
      audience_committee_id: committeeIdBySlug.get('research-innovation') ?? null,
      audience_user_ids: [],
      published_at: isoAt(-4, 15),
      expires_at: isoAt(5, 20),
      created_by: 'u-003',
      pinned: false,
    },
    {
      id: 'an-005',
      title_en: 'Committee leaders: term reports due',
      title_ar: 'قائدات اللجان: موعد التقارير الفصلية',
      body_en:
        'Each committee leader should upload her term report to the resources library before the planning meeting.',
      body_ar: 'ترفع كل قائدة لجنة تقريرها الفصلي إلى مكتبة المصادر قبل اجتماع التخطيط.',
      level: 'important',
      audience_kind: 'leaders',
      audience_committee_id: null,
      audience_user_ids: [],
      published_at: isoAt(-8, 9),
      expires_at: isoAt(2, 20),
      created_by: 'u-004',
      pinned: false,
    },
  ];

  /* ------------------------------------------------------------- resources -- */
  const resources: Resource[] = [
    { id: 'r-001', title_en: 'AECC Laboratory Safety Policy', title_ar: 'سياسة سلامة المختبر في النادي', description_en: 'The full safety protocol every member agrees to before her first session.', description_ar: 'بروتوكول السلامة الكامل الذي توافق عليه كل عضوة قبل جلستها الأولى.', category: 'safety', file_url: '#', file_kind: 'pdf', size_kb: 412, visibility: 'all', uploaded_by: 'u-001', uploaded_at: isoAt(-300, 9) },
    { id: 'r-002', title_en: 'Chemical hazard quick reference', title_ar: 'مرجع سريع لمخاطر المواد الكيميائية', description_en: 'GHS pictograms, hazard statements and the club’s storage rules on two pages.', description_ar: 'رموز النظام المنسق عالميًا وعبارات الخطورة وقواعد التخزين في صفحتين.', category: 'safety', file_url: '#', file_kind: 'pdf', size_kb: 288, visibility: 'all', uploaded_by: 'u-001', uploaded_at: isoAt(-280, 9) },
    { id: 'r-003', title_en: 'Experiment write-up template', title_ar: 'قالب كتابة التجربة', description_en: 'Aim, method, results, uncertainty and conclusion — the club’s standard structure.', description_ar: 'الهدف والطريقة والنتائج وعدم اليقين والاستنتاج، وهو الهيكل المعتمد في النادي.', category: 'experiments', file_url: '#', file_kind: 'doc', size_kb: 96, visibility: 'all', uploaded_by: 'u-005', uploaded_at: isoAt(-210, 9) },
    { id: 'r-004', title_en: 'Microscale titration method sheet', title_ar: 'ورقة طريقة المعايرة المصغّرة', description_en: 'Step-by-step method for the 2 mL titration, with the calculation worked through.', description_ar: 'طريقة خطوة بخطوة لمعايرة ٢ مل مع الحساب محلولًا بالكامل.', category: 'experiments', file_url: '#', file_kind: 'pdf', size_kb: 340, visibility: 'all', uploaded_by: 'u-005', uploaded_at: isoAt(-62, 9) },
    { id: 'r-005', title_en: 'Research proposal template', title_ar: 'قالب مقترح البحث', description_en: 'Question, hypothesis, variables, method and risk assessment.', description_ar: 'السؤال والفرضية والمتغيرات والطريقة وتقييم المخاطر.', category: 'research', file_url: '#', file_kind: 'doc', size_kb: 120, visibility: 'all', uploaded_by: 'u-002', uploaded_at: isoAt(-190, 9) },
    { id: 'r-006', title_en: 'How to read a scientific paper', title_ar: 'كيف تقرئين ورقة علمية', description_en: 'A short guide for members starting their first literature review.', description_ar: 'دليل موجز للعضوات اللواتي يبدأن أول مراجعة أدبيات.', category: 'research', file_url: '#', file_kind: 'slides', size_kb: 1840, visibility: 'all', uploaded_by: 'u-002', uploaded_at: isoAt(-150, 9) },
    { id: 'r-007', title_en: 'Regional Olympiad — rules and syllabus', title_ar: 'أولمبياد المنطقة — اللائحة والمنهج', description_en: 'Official competition documentation for this year’s qualifying round.', description_ar: 'الوثائق الرسمية لمسابقة هذا العام في الدور التأهيلي.', category: 'competitions', file_url: '#', file_kind: 'pdf', size_kb: 720, visibility: 'all', uploaded_by: 'u-001', uploaded_at: isoAt(-40, 9) },
    { id: 'r-008', title_en: 'Club constitution and membership rules', title_ar: 'لائحة النادي وقواعد العضوية', description_en: 'Roles, elections, attendance expectations and the code of conduct.', description_ar: 'الأدوار والانتخابات ومتطلبات الحضور وميثاق السلوك.', category: 'policies', file_url: '#', file_kind: 'pdf', size_kb: 260, visibility: 'all', uploaded_by: 'u-001', uploaded_at: isoAt(-320, 9) },
    { id: 'r-009', title_en: 'Committee term report template', title_ar: 'قالب التقرير الفصلي للجنة', description_en: 'What each committee leader submits at the end of term.', description_ar: 'ما تقدّمه كل قائدة لجنة في نهاية الفصل.', category: 'policies', file_url: '#', file_kind: 'doc', size_kb: 88, visibility: 'leaders', uploaded_by: 'u-004', uploaded_at: isoAt(-120, 9) },
    { id: 'r-010', title_en: 'Chemistry Week 2026 — full programme', title_ar: 'أسبوع الكيمياء ٢٠٢٦ — البرنامج الكامل', description_en: 'Schedule, station assignments and the demonstration scripts.', description_ar: 'الجدول وتوزيع الأركان ونصوص التجارب.', category: 'presentations', file_url: '#', file_kind: 'slides', size_kb: 4200, visibility: 'all', uploaded_by: 'u-008', uploaded_at: isoAt(-70, 9) },
    { id: 'r-011', title_en: 'Supervisor incident report form', title_ar: 'نموذج تقرير الحوادث للمشرفات', description_en: 'Completed by a supervisor after any laboratory incident, however minor.', description_ar: 'تعبّئه المشرفة بعد أي حادثة في المختبر مهما كانت بسيطة.', category: 'safety', file_url: '#', file_kind: 'doc', size_kb: 64, visibility: 'admin', uploaded_by: 'u-001', uploaded_at: isoAt(-300, 9) },
  ];

  /* --------------------------------------------------------------- gallery -- */
  const albumDefs: { slug: string; title_en: string; title_ar: string; desc_en: string; desc_ar: string; eventId: string | null; isPublic: boolean; offset: number }[] = [
    { slug: 'album-chemistry-week', title_en: 'Chemistry Week', title_ar: 'أسبوع الكيمياء', desc_en: 'Five days of demonstrations across the school.', desc_ar: 'خمسة أيام من التجارب في أنحاء المدرسة.', eventId: null, isPublic: true, offset: -32 },
    { slug: 'album-experiment-day', title_en: 'Experiment Day', title_ar: 'يوم التجارب', desc_en: 'The Experiments Team at the bench.', desc_ar: 'فريق التجارب على منصة العمل.', eventId: null, isPublic: true, offset: -45 },
    { slug: 'album-exhibition', title_en: 'Science Exhibition', title_ar: 'معرض العلوم', desc_en: 'Fourteen stands and four research posters.', desc_ar: 'أربعة عشر ركنًا وأربعة ملصقات بحثية.', eventId: 'e-005', isPublic: true, offset: -32 },
    { slug: 'album-competition', title_en: 'Competition', title_ar: 'المسابقة', desc_en: 'Representing the school at the regional round.', desc_ar: 'تمثيل المدرسة في الدور الإقليمي.', eventId: null, isPublic: true, offset: -60 },
    { slug: 'album-meetings', title_en: 'Club Meetings', title_ar: 'لقاءات النادي', desc_en: 'Weekly sessions and committee planning.', desc_ar: 'الجلسات الأسبوعية وتخطيط اللجان.', eventId: null, isPublic: false, offset: -20 },
  ];

  const gallery_albums: GalleryAlbum[] = albumDefs.map((def, index) => ({
    id: `ga-${String(index + 1).padStart(3, '0')}`,
    slug: def.slug,
    title_en: def.title_en,
    title_ar: def.title_ar,
    description_en: def.desc_en,
    description_ar: def.desc_ar,
    event_id: def.eventId,
    cover_image: `/media/gallery/${def.slug}.svg`,
    created_at: isoAt(def.offset, 16),
    is_public: def.isPublic,
  }));

  const gallery_images: GalleryImage[] = [];
  let giSeq = 1;
  for (const [index, def] of albumDefs.entries()) {
    for (let i = 1; i <= 6; i += 1) {
      gallery_images.push({
        id: `gi-${String(giSeq++).padStart(4, '0')}`,
        album_id: `ga-${String(index + 1).padStart(3, '0')}`,
        url: `/media/gallery/${def.slug}-${i}.svg`,
        caption_en: `${def.title_en} — moment ${i}`,
        caption_ar: `${def.title_ar} — لقطة ${i}`,
        sort_order: i,
      });
    }
  }

  /* ---------------------------------------------------------- certificates -- */
  const certificates: Certificate[] = [
    { id: 'cert-001', user_id: 'u-003', kind: 'competition', title_en: 'Regional Chemistry Olympiad — First Place', title_ar: 'أولمبياد الكيمياء الإقليمي — المركز الأول', event_id: 'e-005', project_id: null, issued_on: isoDay(-28), serial: 'AECC-2026-0001', issued_by: 'u-001', template_key: 'award', pdf_url: null },
    { id: 'cert-002', user_id: 'u-009', kind: 'outstanding', title_en: 'Outstanding Member — Sustainability', title_ar: 'عضوة متميزة — الاستدامة', event_id: null, project_id: 'p-001', issued_on: isoDay(-26), serial: 'AECC-2026-0002', issued_by: 'u-001', template_key: 'outstanding', pdf_url: null },
    { id: 'cert-003', user_id: 'u-004', kind: 'ambassador', title_en: 'Chemistry Ambassador', title_ar: 'سفيرة الكيمياء', event_id: null, project_id: null, issued_on: isoDay(-26), serial: 'AECC-2026-0003', issued_by: 'u-001', template_key: 'ambassador', pdf_url: null },
    { id: 'cert-004', user_id: 'u-015', kind: 'research', title_en: 'Research Participation — Water Treatment Study', title_ar: 'مشاركة بحثية — دراسة معالجة المياه', event_id: null, project_id: 'p-002', issued_on: isoDay(-20), serial: 'AECC-2026-0004', issued_by: 'u-002', template_key: 'research', pdf_url: null },
    { id: 'cert-005', user_id: 'u-016', kind: 'research', title_en: 'Research Participation — Water Treatment Study', title_ar: 'مشاركة بحثية — دراسة معالجة المياه', event_id: null, project_id: 'p-002', issued_on: isoDay(-20), serial: 'AECC-2026-0005', issued_by: 'u-002', template_key: 'research', pdf_url: null },
    { id: 'cert-006', user_id: 'u-013', kind: 'participation', title_en: 'Certificate of Participation — Chemistry Week 2026', title_ar: 'شهادة مشاركة — أسبوع الكيمياء ٢٠٢٦', event_id: 'e-005', project_id: 'p-003', issued_on: isoDay(-30), serial: 'AECC-2026-0006', issued_by: 'u-002', template_key: 'participation', pdf_url: null },
    { id: 'cert-007', user_id: 'u-011', kind: 'participation', title_en: 'Certificate of Participation — Chemistry Week 2026', title_ar: 'شهادة مشاركة — أسبوع الكيمياء ٢٠٢٦', event_id: 'e-005', project_id: 'p-003', issued_on: isoDay(-30), serial: 'AECC-2026-0007', issued_by: 'u-002', template_key: 'participation', pdf_url: null },
    { id: 'cert-008', user_id: 'u-018', kind: 'participation', title_en: 'Certificate of Participation — Chemistry Week 2026', title_ar: 'شهادة مشاركة — أسبوع الكيمياء ٢٠٢٦', event_id: 'e-005', project_id: 'p-003', issued_on: isoDay(-30), serial: 'AECC-2026-0008', issued_by: 'u-002', template_key: 'participation', pdf_url: null },
  ];

  /* -------------------------------------------------------------- magazine -- */
  const magazine_categories = SEED_CATEGORIES.map((cat, index) => ({
    id: `mc-${String(index + 1).padStart(3, '0')}`,
    slug: cat.slug,
    name_en: cat.name_en,
    name_ar: cat.name_ar,
    description_en: cat.description_en,
    description_ar: cat.description_ar,
    accent: cat.accent,
  }));
  const categoryIdBySlug = new Map(magazine_categories.map((c) => [c.slug, c.id]));

  const authorIds = Array.from(new Set(SEED_ARTICLES.map((a) => a.authorId)));
  const magazine_authors: MagazineAuthor[] = authorIds.map((userId) => {
    const person = SEED_PEOPLE.find((p) => p.id === userId);
    const isStudent = person?.role !== 'admin';
    return {
      user_id: userId,
      pen_name_en: person?.name_en ?? '',
      pen_name_ar: person?.name_ar ?? '',
      bio_en: person?.bio_en ?? '',
      bio_ar: person?.bio_ar ?? '',
      is_student: isStudent,
      grade: isStudent ? (person?.grade ?? null) : null,
    };
  });

  const magazine_articles: MagazineArticle[] = SEED_ARTICLES.map((article) => ({
    id: article.id,
    slug: article.slug,
    title_en: article.title_en,
    title_ar: article.title_ar,
    subtitle_en: article.subtitle_en,
    subtitle_ar: article.subtitle_ar,
    category_id: categoryIdBySlug.get(article.category) ?? magazine_categories[0].id,
    author_id: article.authorId,
    cover_image: article.cover,
    blocks: article.blocks,
    reading_minutes: article.readingMinutes,
    status: article.status,
    submitted_at: article.submitted ? `${article.submitted}T09:00:00.000Z` : null,
    reviewed_by:
      article.status === 'under_review' || article.status === 'approved' || article.status === 'published'
        ? 'u-002'
        : null,
    review_notes: article.reviewNotes ?? null,
    scheduled_for: article.scheduled ? `${article.scheduled}T09:00:00.000Z` : null,
    published_at: article.published ? `${article.published}T09:00:00.000Z` : null,
    featured: article.featured,
    views: article.views,
    references: article.references,
    created_at: `${article.published ?? article.submitted ?? isoDay(-20)}T08:00:00.000Z`,
    updated_at: `${article.published ?? article.submitted ?? isoDay(-5)}T08:00:00.000Z`,
  }));

  const magazine_submissions: MagazineSubmissionEvent[] = [];
  let msSeq = 1;
  for (const article of magazine_articles) {
    const push = (action: MagazineSubmissionEvent['action'], actor: string, offsetDays: number, note?: string) => {
      magazine_submissions.push({
        id: `ms-${String(msSeq++).padStart(4, '0')}`,
        article_id: article.id,
        action,
        note: note ?? null,
        actor_id: actor,
        created_at: isoAt(offsetDays, 10),
      });
    };
    push('created', article.author_id, -70);
    if (article.submitted_at || article.published_at) push('submitted', article.author_id, -60);
    if (article.status === 'under_review' || article.status === 'approved' || article.status === 'published')
      push('under_review', 'u-002', -50);
    if (article.status === 'approved' || article.status === 'published')
      push('approved', 'u-002', -45, 'Clear structure and accurate chemistry. Approved.');
    if (article.status === 'published') push('published', 'u-002', -40);
  }

  const magazine_issues: MagazineIssue[] = SEED_ISSUES.map((issue, index) => ({
    id: `mi-${String(index + 1).padStart(3, '0')}`,
    number: issue.number,
    title_en: issue.title_en,
    title_ar: issue.title_ar,
    cover_image: issue.cover,
    editors_note_en: issue.note_en,
    editors_note_ar: issue.note_ar,
    published_on: issue.published,
    status: issue.status,
    pdf_url: null,
  }));

  const magazine_issue_articles: MagazineIssueArticle[] = [];
  SEED_ISSUES.forEach((issue, index) => {
    issue.articles.forEach((articleId, order) => {
      magazine_issue_articles.push({
        issue_id: `mi-${String(index + 1).padStart(3, '0')}`,
        article_id: articleId,
        sort_order: order,
      });
    });
  });

  /* ------------------------------------------------------------ audit logs -- */
  const audit_logs: AuditLog[] = [
    { id: 'al-001', actor_id: 'u-001', action: 'points.award', entity: 'point_transactions', entity_id: 'pt-0001', summary_en: 'Awarded 50 points to Sara Al-Mutairi for winning the regional qualifier', summary_ar: 'منح ٥٠ نقطة لسارة المطيري لفوزها في التصفيات الإقليمية', reason: 'Competition result', created_at: isoAt(-30, 13) },
    { id: 'al-002', actor_id: 'u-001', action: 'points.reverse', entity: 'point_transactions', entity_id: 'pt-0002', summary_en: 'Reversed an award recorded against the wrong member', summary_ar: 'التراجع عن منح سُجّل لعضوة خاطئة', reason: 'Data entry correction', created_at: isoAt(-2, 14) },
    { id: 'al-003', actor_id: 'u-001', action: 'attendance.correct', entity: 'attendance_records', entity_id: 'ar-0031', summary_en: 'Changed an attendance record from absent to excused', summary_ar: 'تغيير رصد حضور من غائبة إلى بعذر', reason: 'Medical note received', created_at: isoAt(-24, 11) },
    { id: 'al-004', actor_id: 'u-001', action: 'role.assign', entity: 'user_roles', entity_id: 'u-010', summary_en: 'Assigned the Committee Leader role to Maryam Al-Dosari', summary_ar: 'إسناد دور قائدة لجنة إلى مريم الدوسري', reason: 'Committee election result', created_at: isoAt(-160, 9) },
    { id: 'al-005', actor_id: 'u-002', action: 'magazine.publish', entity: 'magazine_articles', entity_id: 'ma-001', summary_en: 'Published “The Chemistry of a Cup of Tea” and set it as the featured story', summary_ar: 'نشر «كيمياء فنجان الشاي» وتعيينه مقال الغلاف', reason: null, created_at: isoAt(-40, 10) },
    { id: 'al-006', actor_id: 'u-001', action: 'user.deactivate', entity: 'users', entity_id: 'u-030', summary_en: 'Set Fatimah Al-Rashed’s account to inactive', summary_ar: 'تعيين حساب فاطمة الراشد كغير نشط', reason: 'Approved academic leave', created_at: isoAt(-55, 9) },
    { id: 'al-007', actor_id: 'u-002', action: 'certificate.issue', entity: 'certificates', entity_id: 'cert-004', summary_en: 'Issued a research participation certificate to Rital Al-Amri', summary_ar: 'إصدار شهادة مشاركة بحثية لريتال العمري', reason: null, created_at: isoAt(-20, 12) },
    { id: 'al-008', actor_id: 'u-001', action: 'settings.update', entity: 'club_settings', entity_id: 'idea_voting_enabled', summary_en: 'Enabled member voting on the Ideas Box', summary_ar: 'تفعيل تصويت العضوات في صندوق الأفكار', reason: 'Council request', created_at: isoAt(-12, 9) },
  ];

  const club_settings = [
    { key: 'club_name_en', value: 'Al Eman Chemistry Club' },
    { key: 'club_name_ar', value: 'نادي الكيمياء' },
    { key: 'school_name_en', value: 'Al Eman Secondary School' },
    { key: 'school_name_ar', value: 'مدرسة الإيمان الثانوية' },
    { key: 'academic_year', value: '2026–2027' },
    { key: 'term_start', value: isoDay(-120) },
    { key: 'term_end', value: isoDay(90) },
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
    audit_logs,
    club_settings,
  };
}
