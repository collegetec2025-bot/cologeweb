# EFKGOU Project State — Last Updated 2026-08-04

## Project Identity
- **Name**: Engineer Folad Kabuli Global Online University (EFKGOU)
- **Stack**: Vite + React + TypeScript + Tailwind CSS + Supabase (PostgreSQL)
- **Languages**: Dari (fa), Pashto (ps), English (en) — full RTL support
- **Auth**: Supabase email/password (email confirmation OFF)
- **Database**: Supabase PostgreSQL with UUID primary keys, RLS on every table, soft deletes via `deleted_at` columns

## Architecture Pattern
- **Repository-Service-Controller** adapted to frontend:
  - `src/lib/supabase.ts` — TypeScript types (models) + Supabase client
  - `src/lib/services.ts` — Service layer (gradebook, transcript, finance, ticket, audit, academic)
  - `src/lib/menu.ts` — Navigation menu structure + BSCS curriculum data + i18n labels
  - `src/lib/i18n.ts` — Translation strings
  - `src/components/` — View components (controllers)
  - `src/context/` — React contexts (Auth, Language, Nav, Theme)
  - `src/pages/` — Top-level page routes

## Database Tables (Supabase Migrations Applied)
1. `profiles` — user profiles with role (student/instructor/admin)
2. `faculties` — academic faculties (trilingual)
3. `courses` — courses with faculty/instructor links, trilingual
4. `lessons` — course lessons (trilingual, video_url, order_index)
5. `assignments` — course assignments (trilingual, due_date, max_score)
6. `enrollments` — student-course enrollments (progress, enrolled_at, completed_at)
7. `news_events` — news, events, announcements (trilingual)
8. `media_assets` — media library (IMG/VID/DOC/NET/COD, file_number)
9. `departments` — departments linked to faculties
10. `academic_calendar` — calendar events (semester_start/end, exam, holiday, event, deadline)
11. `syllabi` — weekly syllabi per course (trilingual, week_number, objectives, readings)
12. `grades` — student grades (score, max_score, letter_grade, feedback)
13. `transcripts` — student transcripts (cgpa, total_credits, status, soft delete)
14. `invoices` — student invoices (invoice_number, amount, status, due_date)
15. `payments` — payment records (payment_method, transaction_id, status)
16. `scholarships` — scholarship awards (trilingual, amount, status)
17. `support_tickets` — helpdesk tickets (ticket_number, priority, status, assigned_to)
18. `audit_logs` — system audit trail (user_id, action, entity_type, old/new_values)

All tables have RLS enabled with per-verb policies (SELECT/INSERT/UPDATE/DELETE) scoped to `authenticated` using `auth.uid()` ownership checks.

## Migrations (in supabase/migrations/)
1. `20260803113120_efkgou_schema.sql` — core tables (profiles, faculties, courses, lessons, assignments, enrollments)
2. `20260803115308_efkgou_news_events.sql` — news_events table
3. `20260803131333_efkgou_media_scanner.sql` — media_assets table
4. `20260804115735_efkgou_enterprise_core.sql` — departments, academic_calendar, syllabi, grades, transcripts, invoices, payments, scholarships, support_tickets, audit_logs

## Components Built (Functional — Real CRUD)
| Component | Menu Items Routed | Status |
|---|---|---|
| `CalendarView.tsx` | calendar | Full CRUD, month grid, event types, add modal |
| `AuditLogView.tsx` | audit-logs | Admin-only, search/filter, stats, table |
| `IdCardView.tsx` | id-cards | Visual ID card, print, enrolled courses list |
| `AICenter.tsx` | ai-assistant, ai-translation | Chat assistant + translation tool (EN/FA/PS) |
| `GradebookView.tsx` | gradebook | Real grades, CGPA calc, letter grades |
| `FinanceView.tsx` | tuition, invoices, payments, scholarships, payroll | Invoices, payments, scholarships CRUD |
| `TicketsView.tsx` | support-tickets, helpdesk | Ticket CRUD, status management |
| `MediaScanner.tsx` | media-scanner, gallery, video-library, audio-library, document-manager | Media library with categories |
| `AcademicContentGenerator.tsx` | (used in course detail) | AI-assisted content generation |
| `ClassroomModal.tsx` | (used in course detail) | Virtual classroom modal |
| `ChancellorProfile.tsx` | (home page) | Chancellor profile section |

## Components Built (Static/Display)
- `Header.tsx` — top navigation bar
- `Footer.tsx` — site footer
- `Sidebar.tsx` — dashboard sidebar with collapsible categories
- `DashboardNav.tsx` — dashboard navigation tabs
- `DashboardSectionContent.tsx` — routing hub for all dashboard items
- `HeroCarousel.tsx` — homepage hero carousel
- `NewsEvents.tsx` — homepage news/events section
- `ProgramsPreview.tsx` — homepage programs preview

## Pages Built
- `Home.tsx` — landing page (hero, programs preview, news, chancellor profile)
- `About.tsx` — about page
- `Programs.tsx` — programs listing
- `BSCSCurriculum.tsx` — BSCS 4-year curriculum (8 semesters, 40+ courses)
- `Courses.tsx` — course catalog
- `CourseDetail.tsx` — single course view with lessons, assignments, classroom
- `News.tsx` — news/events listing
- `Contact.tsx` — contact page
- `Auth.tsx` — sign in / sign up
- `Portal.tsx` — portal entry
- `Dashboard.tsx` — main dashboard shell

## Context Providers
- `AuthContext.tsx` — session, profile, sign in/out, sign up
- `LanguageContext.tsx` — lang (en/fa/ps), dir (ltr/rtl), toggle
- `NavContext.tsx` — page navigation, active category/item
- `ThemeContext.tsx` — dark/light mode

## Menu Structure (12 categories, 50+ items)
1. **Core System & Security** — auth, users, roles, permissions, audit-logs, mfa, ip-restriction, language, darkmode
2. **University Governance** — university-profile, trustees, calendar, accreditation
3. **Academic & Curriculum** — bscs-program, syllabi, departments
4. **Admission & SIS** — registration, student-profile, id-cards, transcripts
5. **LMS & Virtual Classroom** — live-classes, recorded-classes, assignments, quizzes, gradebook, certificates
6. **Faculty & Teaching Portal** — teacher-schedule, grading, research-supervision
7. **CMS & News Portal** — articles, events, announcements, blog, media-scanner
8. **Media Center & Digital Assets** — gallery, video-library, audio-library, document-manager
9. **Library & Research Hub** — digital-books, thesis, journals, conferences
10. **Finance & HR Management** — tuition, invoices, payments, payroll, scholarships
11. **Services & Student Affairs** — helpdesk, support-tickets, career-center, alumni
12. **Infrastructure & AI** — academic-reports, financial-reports, ai-assistant, ai-translation, backups, monitoring

## Items Still Using Mock Data (generateRows fallback in DashboardSectionContent)
These menu items render a generic table with mock data and need real functional views:
- users, roles, permissions, mfa, ip-restriction
- university-profile, trustees, accreditation
- bscs-program (has curriculum page but not wired), syllabi, departments
- registration, student-profile, transcripts
- live-classes, recorded-classes, assignments, quizzes, certificates
- teacher-schedule, grading, research-supervision
- articles, events, announcements, blog
- digital-books, thesis, journals, conferences
- career-center, alumni
- academic-reports, financial-reports
- backups, monitoring

## Build Status
- `npm run build` — PASSES (zero errors)
- `npm run typecheck` — PASSES (zero errors)
- Bundle: ~567 KB JS (148 KB gzip), ~58 KB CSS (9 KB gzip)

## Key Files Reference
- Types: `src/lib/supabase.ts` (18 model types)
- Services: `src/lib/services.ts` (gradebook, transcript, finance, ticket, audit, academic)
- Menu: `src/lib/menu.ts` (12 categories, 50+ items, BSCS curriculum, color system)
- i18n: `src/lib/i18n.ts` (translation strings)
- Routing hub: `src/components/DashboardSectionContent.tsx`
- Auth: `src/context/AuthContext.tsx`
- Main app: `src/App.tsx`

## Continuation Rules
- This is a React + Supabase project, NOT Laravel
- Never recreate the project from scratch
- Extend existing files, never replace
- All new components must import from `@/` alias
- Use lucide-react for icons
- Follow trilingual pattern (title_en, title_fa, title_ps)
- Enable RLS on any new tables
- Use service layer pattern from services.ts
