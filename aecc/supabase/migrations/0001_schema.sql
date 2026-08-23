-- =============================================================================
-- AECC — Al Eman Chemistry Club
-- 0001_schema.sql — relational schema
--
-- Mirrors src/lib/domain/types.ts exactly, so the local sample-data adapter and the
-- Supabase adapter return identical row shapes.
--
-- Credentials live in auth.users and are handled by Supabase Auth. No application
-- table stores a password, hashed or otherwise.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums -----

create type aecc_account_status   as enum ('active', 'inactive', 'alumna', 'pending');
create type aecc_role_key         as enum ('admin', 'president', 'vice_president', 'committee_leader', 'member');
create type aecc_event_status     as enum ('upcoming', 'registration_open', 'full', 'completed', 'cancelled');
create type aecc_registration     as enum ('registered', 'pending', 'waitlisted', 'declined', 'cancelled');
create type aecc_session_kind     as enum ('meeting', 'workshop', 'event', 'competition', 'committee');
create type aecc_attendance       as enum ('present', 'absent', 'late', 'excused');
create type aecc_badge_tier       as enum ('foundation', 'distinction', 'honour');
create type aecc_task_status      as enum ('todo', 'in_progress', 'review', 'done');
create type aecc_task_priority    as enum ('low', 'medium', 'high');
create type aecc_project_status   as enum ('planning', 'active', 'review', 'completed', 'on_hold');
create type aecc_challenge_kind   as enum ('multiple_choice', 'short_answer', 'image', 'mystery');
create type aecc_challenge_status as enum ('scheduled', 'open', 'closed');
create type aecc_idea_status      as enum ('new', 'under_review', 'approved', 'selected', 'planned', 'implemented', 'not_selected');
create type aecc_announce_level   as enum ('normal', 'important', 'urgent');
create type aecc_audience_kind    as enum ('everyone', 'committee', 'leaders', 'selected');
create type aecc_resource_cat     as enum ('safety', 'experiments', 'research', 'competitions', 'policies', 'presentations');
create type aecc_visibility       as enum ('all', 'leaders', 'admin');
create type aecc_certificate_kind as enum ('participation', 'outstanding', 'ambassador', 'competition', 'research');
create type aecc_article_status   as enum ('draft', 'submitted', 'under_review', 'revision_requested', 'accepted', 'scheduled', 'published', 'unpublished');
create type aecc_accent           as enum ('plum', 'rose', 'gold', 'mauve', 'berry', 'soft');

-- --------------------------------------------------------- accounts --------

-- Mirrors the subset of auth.users the application needs to read.
create table public.users (
  id                    uuid primary key references auth.users (id) on delete cascade,
  username              text not null unique check (username = lower(username)),
  email                 text not null unique,
  status                aecc_account_status not null default 'active',
  must_change_password  boolean not null default false,
  last_login_at         timestamptz,
  created_at            timestamptz not null default now()
);

create table public.profiles (
  user_id           uuid primary key references public.users (id) on delete cascade,
  full_name_en      text not null,
  full_name_ar      text not null default '',
  grade             text not null default '',
  avatar_url        text,
  bio_en            text not null default '',
  bio_ar            text not null default '',
  joined_at         date not null default current_date,
  phone             text,
  guardian_contact  text,
  -- Supervisor-only. RLS below prevents a student from selecting this table's row
  -- for anyone but herself, and the column is excluded from member-facing views.
  admin_notes       text,
  updated_at        timestamptz not null default now()
);

create table public.roles (
  key         aecc_role_key primary key,
  name_en     text not null,
  name_ar     text not null,
  rank        int  not null,
  permissions text[] not null default '{}'
);

create table public.user_roles (
  user_id     uuid primary key references public.users (id) on delete cascade,
  role_key    aecc_role_key not null references public.roles (key),
  granted_by  uuid references public.users (id),
  granted_at  timestamptz not null default now()
);

-- ------------------------------------------------------- committees --------

create table public.committees (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_en         text not null,
  name_ar         text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  leader_id       uuid references public.users (id) on delete set null,
  accent          aecc_accent not null default 'plum',
  created_at      timestamptz not null default now(),
  archived        boolean not null default false
);

create table public.committee_members (
  committee_id       uuid not null references public.committees (id) on delete cascade,
  user_id            uuid not null references public.users (id) on delete cascade,
  role_in_committee  text not null default 'member',
  joined_at          date not null default current_date,
  primary key (committee_id, user_id)
);

-- ------------------------------------------------------------ events -------

create table public.events (
  id                     uuid primary key default gen_random_uuid(),
  title_en               text not null,
  title_ar               text not null default '',
  description_en         text not null default '',
  description_ar         text not null default '',
  starts_at              timestamptz not null,
  ends_at                timestamptz not null,
  location_en            text not null default '',
  location_ar            text not null default '',
  organizer_id           uuid not null references public.users (id),
  committee_id           uuid references public.committees (id) on delete set null,
  capacity               int  not null default 20 check (capacity > 0),
  registration_deadline  timestamptz,
  materials_en           text not null default '',
  materials_ar           text not null default '',
  safety_note_en         text not null default '',
  safety_note_ar         text not null default '',
  points_reward          int  not null default 0 check (points_reward >= 0),
  status                 aecc_event_status not null default 'upcoming',
  cover_image            text,
  created_at             timestamptz not null default now()
);

create table public.event_registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references public.events (id) on delete cascade,
  user_id        uuid not null references public.users (id) on delete cascade,
  status         aecc_registration not null default 'registered',
  registered_at  timestamptz not null default now(),
  decided_by     uuid references public.users (id),
  decided_at     timestamptz,
  unique (event_id, user_id)
);

-- -------------------------------------------------------- attendance -------

create table public.attendance_sessions (
  id            uuid primary key default gen_random_uuid(),
  title_en      text not null,
  title_ar      text not null default '',
  kind          aecc_session_kind not null default 'meeting',
  held_at       timestamptz not null,
  committee_id  uuid references public.committees (id) on delete set null,
  event_id      uuid references public.events (id) on delete set null,
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

create table public.attendance_records (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.attendance_sessions (id) on delete cascade,
  user_id      uuid not null references public.users (id) on delete cascade,
  status       aecc_attendance not null,
  note         text,
  recorded_by  uuid not null references public.users (id),
  recorded_at  timestamptz not null default now(),
  unique (session_id, user_id)
);

-- ------------------------------------------------------------ points -------

create table public.point_reasons (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  label_en       text not null,
  label_ar       text not null default '',
  default_points int  not null default 0,
  active         boolean not null default true
);

-- Append-only ledger: corrections are compensating rows, never deletes or updates.
create table public.point_transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  points          int  not null check (points <> 0),
  reason_id       uuid references public.point_reasons (id),
  reason_text_en  text not null default '',
  reason_text_ar  text not null default '',
  event_id        uuid references public.events (id) on delete set null,
  project_id      uuid,
  awarded_by      uuid not null references public.users (id),
  created_at      timestamptz not null default now(),
  reversal_of     uuid references public.point_transactions (id),
  -- A member can never award points to herself.
  constraint point_transactions_no_self_award check (user_id <> awarded_by)
);

create unique index point_transactions_single_reversal
  on public.point_transactions (reversal_of)
  where reversal_of is not null;

-- ------------------------------------------------------------ badges -------

create table public.badges (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  name_en         text not null,
  name_ar         text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  icon            text not null default 'sparkles',
  tier            aecc_badge_tier not null default 'foundation'
);

create table public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  badge_id    uuid not null references public.badges (id) on delete cascade,
  awarded_by  uuid not null references public.users (id),
  awarded_at  timestamptz not null default now(),
  note        text,
  unique (user_id, badge_id)
);

-- ----------------------------------------------------------- projects ------

create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title_en        text not null,
  title_ar        text not null default '',
  objective_en    text not null default '',
  objective_ar    text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  supervisor_id   uuid references public.users (id) on delete set null,
  leader_id       uuid not null references public.users (id),
  committee_id    uuid references public.committees (id) on delete set null,
  starts_on       date not null default current_date,
  deadline        date,
  progress        int  not null default 0 check (progress between 0 and 100),
  status          aecc_project_status not null default 'planning',
  results_en      text not null default '',
  results_ar      text not null default '',
  cover_image     text,
  is_public       boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.point_transactions
  add constraint point_transactions_project_fk
  foreign key (project_id) references public.projects (id) on delete set null;

create table public.project_members (
  project_id       uuid not null references public.projects (id) on delete cascade,
  user_id          uuid not null references public.users (id) on delete cascade,
  role_in_project  text not null default '',
  primary key (project_id, user_id)
);

create table public.project_milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title_en    text not null,
  title_ar    text not null default '',
  due_date    date,
  done        boolean not null default false
);

create table public.project_files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  name         text not null,
  url          text not null,
  kind         text not null default 'other',
  uploaded_by  uuid not null references public.users (id),
  uploaded_at  timestamptz not null default now()
);

-- -------------------------------------------------------------- tasks ------

create table public.tasks (
  id              uuid primary key default gen_random_uuid(),
  title_en        text not null,
  title_ar        text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  committee_id    uuid references public.committees (id) on delete set null,
  project_id      uuid references public.projects (id) on delete set null,
  event_id        uuid references public.events (id) on delete set null,
  status          aecc_task_status not null default 'todo',
  priority        aecc_task_priority not null default 'medium',
  due_date        date,
  created_by      uuid not null references public.users (id),
  created_at      timestamptz not null default now()
);

create table public.task_assignees (
  task_id  uuid not null references public.tasks (id) on delete cascade,
  user_id  uuid not null references public.users (id) on delete cascade,
  primary key (task_id, user_id)
);

-- --------------------------------------------------------- challenges ------

create table public.challenges (
  id              uuid primary key default gen_random_uuid(),
  title_en        text not null,
  title_ar        text not null default '',
  kind            aecc_challenge_kind not null default 'multiple_choice',
  question_en     text not null,
  question_ar     text not null default '',
  image_url       text,
  options_en      text[] not null default '{}',
  options_ar      text[] not null default '{}',
  correct_answer  text not null,
  explanation_en  text not null default '',
  explanation_ar  text not null default '',
  points          int  not null default 10,
  opens_at        timestamptz not null,
  closes_at       timestamptz not null,
  status          aecc_challenge_status not null default 'scheduled',
  created_by      uuid not null references public.users (id),
  check (closes_at > opens_at)
);

create table public.challenge_submissions (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references public.challenges (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  answer          text not null,
  is_correct      boolean not null default false,
  submitted_at    timestamptz not null default now(),
  points_awarded  int not null default 0,
  unique (challenge_id, user_id)
);

-- -------------------------------------------------------------- ideas ------

create table public.ideas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  title           text not null,
  description     text not null default '',
  category        text not null default 'General',
  attachment_url  text,
  status          aecc_idea_status not null default 'new',
  admin_feedback  text,
  created_at      timestamptz not null default now(),
  decided_by      uuid references public.users (id),
  decided_at      timestamptz
);

create table public.idea_votes (
  idea_id     uuid not null references public.ideas (id) on delete cascade,
  user_id     uuid not null references public.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (idea_id, user_id)
);

-- ------------------------------------------------------ announcements ------

create table public.announcements (
  id                     uuid primary key default gen_random_uuid(),
  title_en               text not null,
  title_ar               text not null default '',
  body_en                text not null default '',
  body_ar                text not null default '',
  level                  aecc_announce_level not null default 'normal',
  audience_kind          aecc_audience_kind not null default 'everyone',
  audience_committee_id  uuid references public.committees (id) on delete cascade,
  audience_user_ids      uuid[] not null default '{}',
  published_at           timestamptz not null default now(),
  expires_at             timestamptz,
  created_by             uuid not null references public.users (id),
  pinned                 boolean not null default false
);

-- ---------------------------------------------------------- resources ------

create table public.resources (
  id              uuid primary key default gen_random_uuid(),
  title_en        text not null,
  title_ar        text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  category        aecc_resource_cat not null default 'policies',
  file_url        text not null,
  file_kind       text not null default 'pdf',
  size_kb         int  not null default 0,
  visibility      aecc_visibility not null default 'all',
  uploaded_by     uuid not null references public.users (id),
  uploaded_at     timestamptz not null default now()
);

-- ------------------------------------------------------------ gallery ------

create table public.gallery_albums (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title_en        text not null,
  title_ar        text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  event_id        uuid references public.events (id) on delete set null,
  cover_image     text,
  created_at      timestamptz not null default now(),
  is_public       boolean not null default false
);

create table public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid not null references public.gallery_albums (id) on delete cascade,
  url         text not null,
  caption_en  text not null default '',
  caption_ar  text not null default '',
  sort_order  int  not null default 0
);

-- ------------------------------------------------------- certificates ------

create table public.certificates (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  kind          aecc_certificate_kind not null default 'participation',
  title_en      text not null,
  title_ar      text not null default '',
  event_id      uuid references public.events (id) on delete set null,
  project_id    uuid references public.projects (id) on delete set null,
  issued_on     date not null default current_date,
  serial        text not null unique,
  issued_by     uuid not null references public.users (id),
  template_key  text not null default 'participation',
  pdf_url       text
);

-- ---------------------------------------------------- electronic magazine --

create table public.magazine_categories (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_en         text not null,
  name_ar         text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  accent          aecc_accent not null default 'plum'
);

create table public.magazine_authors (
  user_id      uuid primary key references public.users (id) on delete cascade,
  pen_name_en  text not null default '',
  pen_name_ar  text not null default '',
  bio_en       text not null default '',
  bio_ar       text not null default '',
  is_student   boolean not null default true,
  grade        text
);

create table public.magazine_articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title_en         text not null,
  title_ar         text not null default '',
  subtitle_en      text not null default '',
  subtitle_ar      text not null default '',
  category_id      uuid not null references public.magazine_categories (id),
  author_id        uuid not null references public.users (id) on delete cascade,
  cover_image      text,
  -- Structured blocks, never raw HTML — the renderer styles each block type.
  blocks           jsonb not null default '[]'::jsonb,
  reading_minutes  int  not null default 1,
  status           aecc_article_status not null default 'draft',
  submitted_at     timestamptz,
  reviewed_by      uuid references public.users (id),
  review_notes     text,
  scheduled_for    timestamptz,
  published_at     timestamptz,
  featured         boolean not null default false,
  views            int  not null default 0,
  "references"     text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create unique index magazine_articles_one_featured
  on public.magazine_articles (featured)
  where featured;

create table public.magazine_submissions (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.magazine_articles (id) on delete cascade,
  action      text not null,
  note        text,
  actor_id    uuid not null references public.users (id),
  created_at  timestamptz not null default now()
);

create table public.magazine_issues (
  id                uuid primary key default gen_random_uuid(),
  number            int  not null unique,
  title_en          text not null,
  title_ar          text not null default '',
  cover_image       text,
  editors_note_en   text not null default '',
  editors_note_ar   text not null default '',
  published_on      date,
  status            text not null default 'draft',
  pdf_url           text
);

create table public.magazine_issue_articles (
  issue_id    uuid not null references public.magazine_issues (id) on delete cascade,
  article_id  uuid not null references public.magazine_articles (id) on delete cascade,
  sort_order  int  not null default 0,
  primary key (issue_id, article_id)
);

-- --------------------------------------------------------- oversight -------

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references public.users (id),
  action      text not null,
  entity      text not null,
  entity_id   text,
  summary_en  text not null default '',
  summary_ar  text not null default '',
  reason      text,
  created_at  timestamptz not null default now()
);

create table public.club_settings (
  key    text primary key,
  value  text not null default ''
);

-- ----------------------------------------------------------- indexes -------

create index on public.committee_members (user_id);
create index on public.event_registrations (user_id);
create index on public.attendance_records (user_id);
create index on public.point_transactions (user_id, created_at desc);
create index on public.user_badges (user_id);
create index on public.tasks (committee_id, status);
create index on public.task_assignees (user_id);
create index on public.project_members (user_id);
create index on public.challenge_submissions (user_id);
create index on public.ideas (user_id, created_at desc);
create index on public.magazine_articles (status, published_at desc);
create index on public.magazine_articles (author_id);
create index on public.audit_logs (created_at desc);
