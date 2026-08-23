# AECC — Al Eman Chemistry Club

## Master Brand & Platform Architecture

_Derived from `AECC_Claude_Code_Master_Brand_Website_Guide_2026_2027.pdf` and the two approved logo
assets. Where any framework default conflicts with the guide, the guide wins._

---

## 1. Interpretation of the AECC visual identity

Both approved logos share one design language, and the product is that language translated into a
digital system:

| Logo element                                     | Translation into the platform                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Warm blush-ivory canvas, never white              | `--aecc-ivory` (`#FBEAE6`) is the page canvas. White is reserved for data surfaces (tables, forms).            |
| Deep plum lettering (AECC / نادي الكيمياء)        | `--aecc-plum` for H1/H2, primary navigation, active state, primary CTA.                                        |
| Thin rose-gold broken circle with dotted arc      | Hairline dividers, section rules, the "orbital" decorative motif, top-ranking treatment.                        |
| Four-point sparkle                                | Restrained accent used at section rules and award moments only — never as sprinkled particles.                  |
| Watercolour botanical branch in a test tube       | The core "chemistry + botanical" motif: fine-line glassware and leaf illustration at low opacity.               |
| Bodoni-like high-contrast serif in the wordmark   | Bodoni Moda for display/editorial moments; Noto Naskh Arabic for Arabic display.                                |
| Wide-tracked small caps subtitle                  | Uppercase, letter-spaced eyebrow labels above section titles.                                                   |
| Italic serif tagline "Explore. React. Discover."  | Italic serif used for taglines, editor's notes and pull quotes.                                                 |

**Personality:** elegant, feminine, academic, modern, calm, intelligent, chemistry-led, highly
organised. Femininity is delivered through proportion, softness, typography, spacing and muted rose
tones — never hearts, glitter or cartoon science.

**Logo rules honoured in code**

- Logos are shipped as image assets (`/public/brand/*.png`) and rendered through a single
  `<Logo/>` component. AECC lettering is never rebuilt in CSS or a substitute font.
- Aspect ratio 1:1 and the original breathing space of the artwork are preserved; no drop shadow,
  glow, outline, recolouring, stretching or cropping is applied.
- The approved artwork was supplied on two slightly different cream backgrounds. Per the guide's
  **logo & background lock**, the flat canvas was keyed to transparency so both variants always sit
  on the *same* Warm Ivory `#FBEAE6` surface. The untouched supplied files are preserved as
  `aecc-logo-en-master.png` / `aecc-logo-ar-master.png`.
- The English logo renders for `en`, the Arabic logo for `ar`. Logo text is never transliterated.

---

## 2. Design tokens (verbatim from the guide)

### Colour

| Token       | Hex       | Use                                                     |
| ----------- | --------- | ------------------------------------------------------- |
| Primary Plum | `#48132F` | Primary navigation, H1/H2, primary CTA, active states   |
| Deep Plum    | `#3C0824` | Hover/pressed state, strongest text                     |
| Dusty Rose   | `#9F656B` | Secondary CTA, selected state, charts                   |
| Berry        | `#764E61` | Limited accent and emphasis                             |
| Soft Rose    | `#D7A7A5` | Soft accents, avatars, decorative data series           |
| Warm Ivory   | `#FBEAE6` | Main page background                                    |
| Rose Gold    | `#CB8C78` | Dividers, top ranking, awards, premium details          |
| Mauve        | `#AF949E` | Secondary headings, iconography                         |
| Blush        | `#FDF5EF` | Cards, section panels, empty states                     |
| Ink          | `#3B2732` | Primary body text                                       |
| Muted        | `#765F69` | Secondary text and metadata                             |

Semantic colours are muted derivatives only: success `#4F6B57`, warning `#B58551`,
danger `#9B4A4A`, info `#6E5A72`. No blue/cyan is admitted anywhere, including focus rings,
links, toggles and charts.

**Chart series order (fixed):** Plum → Dusty Rose → Rose Gold → Mauve → Soft Rose.

### Typography

| Usage          | English      | Arabic            | Notes                                   |
| -------------- | ------------ | ----------------- | --------------------------------------- |
| Display / Hero | Bodoni Moda  | Noto Naskh Arabic | Elegant brand moments only              |
| UI / Body      | Manrope      | Tajawal           | Dashboards, forms, tables, controls     |
| Fallback       | Georgia / Arial | Arial / serif  | Only when a web font is unavailable     |

Scale: hero 48/56 desktop and 36/44 mobile, H1 36/44, H2 28/36, H3 22/30, body 16/26,
small 14/22, caption 12/18. The display serif never runs dense UI.

### Layout

Max content width 1280px · sidebar 264px · spacing scale 4/8/12/16/24/32/48/64 ·
card radius 18px · control radius 12px · pill radius 999px ·
card shadow `0 10px 35px rgba(75,22,50,.08)` · motion 150–220ms opacity/translate/scale.

---

## 3. Application architecture

```
aecc/
├─ public/brand/                  approved EN + AR logo assets
├─ src/
│  ├─ app/                        Next.js App Router
│  │  ├─ (public)/                marketing + magazine reader (no auth)
│  │  ├─ (auth)/                  login, forgot password
│  │  └─ (portal)/                authenticated club platform
│  ├─ components/
│  │  ├─ brand/                   Logo, motifs, decorative line art
│  │  ├─ ui/                      AECC-restyled primitives (button, card, table…)
│  │  ├─ charts/                  Recharts wrappers locked to the brand series
│  │  └─ portal/                  shell, sidebar, topbar, page header
│  ├─ lib/
│  │  ├─ auth/                    session, password hashing, RBAC, guards
│  │  ├─ db/                      repository layer + adapters
│  │  ├─ i18n/                    dictionaries, locale + direction resolution
│  │  └─ domain/                  business rules (points, attendance, workflow)
│  └─ data/                       seeded sample dataset
└─ supabase/                      SQL schema, RLS policies, seed
```

**Data layer.** All reads and writes go through a repository module (`src/lib/db`). Two adapters
implement it:

1. **Local adapter (default).** A relational-shaped, JSON-backed store seeded with realistic sample
   data so every screen is fully previewable with zero configuration. Writes persist to
   `.data/aecc.json`.
2. **Supabase adapter.** Activated when `NEXT_PUBLIC_SUPABASE_URL` and the service key are present.
   The SQL in `supabase/migrations` creates the identical schema with Row Level Security.

Because both adapters implement one interface, no page or server action changes when the club moves
to Supabase.

**Auth.** Credentials are never stored in plaintext: passwords are hashed with `scrypt` and a
per-user salt, verified in constant time. Sessions are signed, `httpOnly`, `sameSite=lax` cookies.
Every portal route resolves the session server-side and enforces a permission before rendering —
hiding a button is never the access control.

**Auditing.** Points, attendance, role changes, publishing and user administration write an
`audit_logs` row (actor, action, target, timestamp, reason). Point transactions are append-only;
corrections are compensating negative transactions.

---

## 4. Roles and permissions

| Role                | Scope                                                                    | Restrictions                                    |
| ------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| Supervisor (Admin)  | Full operational administration, publishing, configuration, exports       | Cannot bypass audit/security rules              |
| President           | Elevated student management, events, tasks, committees, announcements     | No role changes, no system settings, no user admin |
| Vice President      | Same operational scope as President, narrower configuration               | As configured                                   |
| Committee Leader    | Own committee's members, tasks, activity drafts                           | No global admin access                          |
| Member              | Own profile, events, ideas, challenges, resources, magazine submissions   | No admin data, cannot award herself points      |

Permissions are expressed as capability strings (`members:write`, `points:award`,
`magazine:publish`, `users:admin`, …) resolved from the role, and checked in server code.

---

## 5. Database schema

Core (guide §9) plus the magazine module requested in the brief.

```
users(id, username, email, password_hash, password_salt, status, must_change_password,
      last_login_at, created_at)
profiles(user_id → users, full_name_en, full_name_ar, grade, avatar_url, bio_en, bio_ar,
      joined_at, phone, guardian_contact, status, admin_notes)
roles(key, name_en, name_ar, rank, permissions[])
user_roles(user_id → users, role_key → roles, granted_by, granted_at)

committees(id, slug, name_en, name_ar, description_en, description_ar, leader_id → users,
      colour_token, created_at, archived)
committee_members(committee_id, user_id, role_in_committee, joined_at)

events(id, title_en, title_ar, description_en, description_ar, starts_at, ends_at, location_en,
      location_ar, organizer_id, committee_id, capacity, registration_deadline, materials,
      safety_note, points_reward, status, cover_image)
event_registrations(id, event_id, user_id, status, registered_at, decided_by, decided_at)

attendance_sessions(id, title_en, title_ar, kind, held_at, committee_id, event_id, created_by)
attendance_records(id, session_id, user_id, status, note, recorded_by, recorded_at)

point_reasons(id, code, label_en, label_ar, default_points, active)
point_transactions(id, user_id, points, reason_id, reason_text, event_id, project_id,
      awarded_by, created_at, reversal_of)

badges(id, code, name_en, name_ar, description_en, description_ar, icon, tier)
user_badges(id, user_id, badge_id, awarded_by, awarded_at, note)

tasks(id, title_en, title_ar, description, committee_id, project_id, event_id, status,
      priority, due_date, created_by, created_at)
task_assignees(task_id, user_id)

projects(id, slug, title_en, title_ar, objective_en, objective_ar, description_en, description_ar,
      supervisor_id, leader_id, committee_id, starts_on, deadline, progress, status,
      results_en, results_ar, cover_image)
project_members(project_id, user_id, role_in_project)
project_milestones(id, project_id, title_en, title_ar, due_date, done)
project_files(id, project_id, name, url, kind, uploaded_by, uploaded_at)

challenges(id, title_en, title_ar, kind, question_en, question_ar, image_url, options,
      correct_answer, explanation_en, explanation_ar, points, opens_at, closes_at, status)
challenge_submissions(id, challenge_id, user_id, answer, is_correct, submitted_at, points_awarded)

ideas(id, user_id, title, description, category, attachment_url, status, admin_feedback,
      votes_enabled, created_at, decided_by, decided_at)
idea_votes(idea_id, user_id, created_at)

announcements(id, title_en, title_ar, body_en, body_ar, level, audience_kind, audience_ref,
      published_at, expires_at, created_by, pinned)

resources(id, title_en, title_ar, description, category, file_url, file_kind, size_kb,
      visibility, uploaded_by, uploaded_at)

gallery_albums(id, slug, title_en, title_ar, description, event_id, cover_image, created_at,
      is_public)
gallery_images(id, album_id, url, caption_en, caption_ar, sort_order)

certificates(id, user_id, kind, title_en, title_ar, event_id, project_id, issued_on,
      serial, issued_by, template_key, pdf_url)

magazine_categories(id, slug, name_en, name_ar, description_en, description_ar, accent_token)
magazine_authors(user_id, pen_name_en, pen_name_ar, bio_en, bio_ar, is_student, grade)
magazine_articles(id, slug, title_en, title_ar, subtitle_en, subtitle_ar, category_id, author_id,
      cover_image, body_en, body_ar, reading_minutes, status, submitted_at, reviewed_by,
      review_notes, scheduled_for, published_at, featured, views, references)
magazine_submissions(id, article_id, author_id, action, note, actor_id, created_at)
magazine_issues(id, number, title_en, title_ar, cover_image, editors_note_en, editors_note_ar,
      published_on, status, pdf_url)
magazine_issue_articles(issue_id, article_id, sort_order)

audit_logs(id, actor_id, action, entity, entity_id, summary, reason, created_at)
club_settings(key, value)
```

Article status flow: `draft → submitted → under_review → approved → scheduled → published`
(with `revision_requested` and `unpublished` returns). Only `magazine:publish` holders publish.

---

## 6. Route map

### Public (`(public)`)

```
/                              Public home — hero, about, activities, projects, achievements
/about                         About AECC, vision, mission, supervisors
/activities                    Club activities and programme
/projects                      Selected public projects
/achievements                  Public achievements and awards
/gallery                       Public albums
/gallery/[slug]                Album view
/magazine                      Magazine home — featured story, latest, categories, issues
/magazine/article/[slug]       Article reader
/magazine/category/[slug]      Category index
/magazine/issues               Issue archive
/magazine/issues/[number]      Single issue with editor's note
/magazine/authors/[id]         Author profile
```

### Auth (`(auth)`)

```
/login                         Editorial ivory login with approved logo
/forgot-password               Reset request
```

### Portal (`(portal)`, authenticated)

```
/portal                        Dashboard (admin view / member view by role)
/portal/members                Directory with search + filters
/portal/members/[id]           Member profile
/portal/committees             Committee index
/portal/committees/[slug]      Committee detail
/portal/events                 List + calendar toggle
/portal/events/[id]            Event detail, registration, attendance
/portal/attendance             Session list
/portal/attendance/[id]        Mark attendance
/portal/points                 Points ledger + award form
/portal/leaderboard            Month / semester / all-time
/portal/tasks                  Kanban + list
/portal/projects               Project index
/portal/projects/[id]          Project detail
/portal/challenges             Challenge list
/portal/challenges/[id]        Challenge play + statistics
/portal/ideas                  Ideas box
/portal/achievements           Badge gallery + award history
/portal/announcements          Announcement centre
/portal/gallery                Album management
/portal/resources              Resource library
/portal/certificates           Certificate records
/portal/reports                Analytics with brand-palette charts
/portal/magazine               Editorial dashboard
/portal/magazine/articles      All articles by status
/portal/magazine/articles/[id] Editor / review screen
/portal/magazine/new           Author submission form
/portal/magazine/issues        Issue builder
/portal/magazine/categories    Category management
/portal/profile                Own profile
/portal/settings               Preferences (language, notifications)
/portal/admin/users            User management
/portal/admin/roles            Role and permission matrix
/portal/admin/audit            Audit log
/portal/admin/club-settings    Club configuration
```

Every portal route is wrapped by a server-side session + capability guard; unauthorised access
renders the branded permission-denied state rather than leaking data.

### Bilingual routing

Locale is carried by a cookie plus the `?lang=` switch and applied at the document level
(`<html lang dir>`), so Arabic is genuinely RTL: sidebar, tables, forms, breadcrumbs, chart axes,
and directional icons all mirror. Dates and numerals follow the active locale.

---

## 7. Build order

| Phase | Scope                                                                                     |
| ----- | ----------------------------------------------------------------------------------------- |
| 1     | Setup, tokens, fonts, logos, i18n/RTL, auth, roles, app shell, dashboards                  |
| 2     | Members, committees, events, attendance, points, leaderboard                               |
| 3     | Tasks, projects, challenges, ideas, announcements                                          |
| 4     | Electronic magazine: reader, editorial workflow, issues, editorial dashboard               |
| 5     | Gallery, resources, achievements, certificates, reports, public site                       |
| 6     | Responsive QA, Arabic QA, security review, accessibility, final polish                     |

---

## 8. Acceptance checklist (guide §14)

- [ ] All visible colours come from AECC tokens or the approved muted semantic set.
- [ ] EN/AR logos render undistorted with adequate clear space.
- [ ] No framework blue remains in focus rings, links, charts, buttons or toggles.
- [ ] Supervisors are admins; role guards are enforced server-side.
- [ ] Passwords are hashed, never plaintext.
- [ ] Points, attendance and role changes are auditable.
- [ ] Desktop, tablet, mobile and RTL layouts verified.
- [ ] Loading, empty, error, success, disabled and permission-denied states are branded.
- [ ] Forms validate with readable messages.
- [ ] Core workflows meet WCAG AA contrast and keyboard navigation.
