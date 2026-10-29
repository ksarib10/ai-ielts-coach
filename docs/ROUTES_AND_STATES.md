# Routes and states

## Learn Category Collections & Real Resource Bank Delta — 2026-10-29

The `/learn/category/:categoryId` family is fully expanded to render tailored collection exploration screens powered by the real normalized vocabulary provider (`src/features/discovery/screens/LearnCategoryCollections.tsx` wired into `LearnCatalog.tsx`):

| Category Slug | Screen Name & Behavior | Data Provider Connection |
|---|---|---|
| `/learn/category/vocabulary` | Vocabulary Hub & All Vocabulary Explorer | Oxford 3000/5000: 10,270 entries, 44 detail shards, 41 search index shards. A–Z bar, CEFR/POS filters, search, word cards with definitions & examples |
| `/learn/category/awl` | Academic Word Families Screen | 570 canonical AWL word families across 10 sublists and 57 ten-family study groups (`AWL_GRP_01`–`AWL_GRP_57`), with 3,112 verified morphological headwords and inflected forms |
| `/learn/category/phrasal-verbs` | Phrasal Verbs Topic Decks | 129 curated phrasal verbs across 14 topic decks (Education, Work, Technology, Environment, etc.), with transitivity, separability, and collocations |
| `/learn/category/idioms` | Idioms Handbook Screen | 122 curated idioms categorized across 3 difficulty tiers (57 Easy, 55 Intermediate, 10 Advanced) with literal/figurative definitions, IELTS speaking context, and example sentences |
| `/learn/category/linking-words` | Linking Words & Connectors Screen | 100 connectors across 5 functional categories (20 each: Cause/Effect, Concession, Concluding/Summarising, Contrast, Exemplifying/Illustrating) with grammatical types and register guidance |
| `/learn/category/british-american` | British vs American Variations Screen | 606 regional variant pairs across 16 categories with split provenance resolver (`provenance_resolver_part1.json` for pairs 1–303, `provenance_resolver_part2.json` for pairs 304–606) providing UK/US spelling, vocabulary, and phonetic differences with IELTS band scoring guidance |
| `/learn/category/collocations` | Academic Collocations Screen | Filtered view surfacing verified source-backed collocations from Oxford entries |
| `/learn/category/ted`, `/grammar-tenses`, `/irregular-verbs` | Truthful Category Fallback | Explicit `PLANNED` or `SAMPLE` state with contextual guidance, preserving truthful availability states without fabricating unverified content |

All collection screens use the accessible dual-purple theme, support responsive desktop/mobile viewports, and include empty/error fallback states.

---

## IELTS About route content delta — 2026-10-28, Content Pack v1.1

All nine `/ielts-about/:topicId` slugs (`what-is-ielts`, `academic-general`, `test-format`, `sections-duration`, `bands`, `registration-test-day`, `computer-paper`, `accessibility`, `faqs`) remain unchanged and render comprehensive, self-contained educational reference guides via `AboutTopicBody` (`src/features/discovery/about/AboutPages.tsx`). Unknown `/ielts-about/:topicId` paths continue to recover safely via `UnknownDiscoveryScreen`. `/ielts-about/test-format` provides client-side skill tabs (`Listening`, `Reading`, `Writing`, `Speaking`) and keyboard-accessible question-type accordions (6 Listening, 11 Academic Reading). `/ielts-about/faqs` provides client-side search and topic-chip filtering across 18 FAQ items (categorized under Basics, Format, Scoring, Test day, Access and delivery) with distinct purple block buttons and Show/Hide toggle indicators. Internal navigation links connect related About guides (e.g. from Format FAQs to Test format and Duration). All external source links are validated as `https:` and open with `target="_blank" rel="noopener noreferrer"`.

---

## Current route and navigation delta — 2026-10-28, Slice 2

This dated entry supersedes affected route descriptions below. HashRouter, session/onboarding/active-Exam guards, workspace validation and diagnostic skip/resume are retained. Sidebar now has ten links: Main (Dashboard, Learn); IELTS Skills (Listening, Reading, Writing, Speaking); Assessment & Progress (Complete IELTS Exam, Progress); Information (IELTS About, Settings). Removed sidebar links do not remove engines or old URLs.

| Path / family | Current behavior |
|---|---|
| `/learn` | Ten-category Learn catalog; nonempty `?search=` retains existing lesson search |
| `/learn/category/:categoryId` | Vocabulary/Grammar sample tools or explicit planned collection; unknown ID recovers |
| `/learn/lessons?category=…` | Original sample LearningHub with initial category filter; manual filters remain local UI state |
| `/learn/:id` | Original lesson deep link unchanged |
| `/{skill}` | Six typed activity cards; supported short samples, original practice gate or pending information |
| `/{skill}/library` | Original module hub retained as sample library, including its modes/history/bookmarks |
| `/{skill}/activities/:activityId` | Planned activity information; unknown ID recovery |
| `/{skill}/scoring-criteria` | Distinct per-skill educational reference, content pending |
| `/ielts-about`, `/ielts-about/:topicId` | Nine-topic catalog and source-pending information screens |
| `/progress`, `/progress/readiness` | Overview/Readiness subnavigation; sidebar Progress stays active |
| `/readiness` | Redirect to `/progress/readiness` |
| `/exam` | Existing Exam Center displayed as Complete IELTS Exam, with shortened-sample limitations retained |

`{skill}` means listening, reading, writing or speaking. Vocabulary links through Learn to `/saved` and existing vocabulary lessons. Mock Tests remains reachable from each skill hub. `/practice`, `/practice/activity-library`, `/mock-tests`, `/saved`, `/vocabulary`, `/ai-coach`, all existing `/{skill}/:mode/:id`, result routes and legacy task/exam aliases remain registered. No existing route guard/destination was removed. Timed Writing routes to the existing strict Task 2 **test** workspace, not an untimed practice engine. Academic/General Training Task 1 follows the saved track.

The persistent shell disclosure is Development Preview. Non-strict repeated mode/demo banners are consolidated; strict assistance-disabled labeling and material sample/identity/data limitations remain. This file is the authoritative maintained route-flow map. Exact paths/targets and actual checks: [route manifest](reviews/stage-1b/slice-2/ROUTE_MANIFEST.md), [browser evidence](reviews/stage-1b/slice-2/evidence/BROWSER_OBSERVATIONS.json).

---

## Current route and flow delta — 2026-10-27

The existing public paths, aliases, guards and HashRouter remain intact. `src/App.tsx` now imports Dashboard from `features/dashboard/screens/Dashboard.tsx` and Progress, Readiness and DiagnosticStatus from `features/dashboard/screens/Insights.tsx`. `/diagnostic/results` retains its historical complete-plus-result guard but displays validation status instead of legacy bands. Old result/screen implementations are preserved as unused historical source.

Current core flow: public/demo session → saved onboarding → start **or skip** `/diagnostic` → `/dashboard`; returning to `/diagnostic` resumes saved answers and position using the existing engine. Diagnostic completion is not a dashboard requirement. Legacy practice locks remain unchanged and are described as prototype completion gates, not proof of a validated assessment. Active Exam route restrictions remain unchanged; independent Test/Exam/diagnostic headers retain assistance-disabled behavior.

The sidebar's existing 14 links remain. AI Coach, Mock tests and Exam Simulation carry Demo labels. TED learning, Academic Word List, Grammar resources and Curriculum & notes are non-link COMING_SOON entries, not new routes. Search still navigates to the existing Learn search. Mobile navigation becomes a modal drawer, isolates background content, closes on navigation/Escape and restores its trigger focus. Theme control is available on public/onboarding/shell/strict headers.

Presentation: EMPTY means no readable record, TEMP_UNAVAILABLE reports read failure with retry, IN_PROGRESS reflects existing diagnostic participation, and unvalidated/unsupported metrics retain null. No learner lifecycle or attempt schema was introduced. The future immutable assignment routes below remain proposals.

This file remains the sole maintained route-flow map. Same-slice changes to routes, guards, redirects, availability or flow must update this map and relevant feature/contracts/decisions entries. Actual smoke evidence is in [browser-smoke.json](reviews/stage-1b/slice-1/evidence/browser-smoke.json); full Exam completion and new Diagnostic V1 lifecycle were not browser-tested or implemented in Slice 1.

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

2026-10-23. OBSERVED_SOURCE and PROPOSED_DESIGN are deliberately separate. Source: `src/App.tsx`, `src/main.tsx`, `src/state.ts`, feature files and services. Nothing below changes routing. STAGE_2_ENTRY = BLOCKED.

## Observed route inventory

URLs use HashRouter (`/#/dashboard`). `src/main.tsx` normalizes initial direct application paths to hashes; `vercel.json` contains an SPA fallback. These are existing static-client behaviors, not server authentication.

| Existing path / family | Screen and policy |
|---|---|
| `/`, `/login`, `/signup`, `/forgot-password` | Landing, demo forms; recovery explicitly sends no email |
| `/register` | Redirect to `/signup` |
| `/onboarding` | Six resumable screens; local session required; incomplete setup allowed here |
| `/diagnostic` | Seven sections; saves, skips or resumes exact saved section/question |
| `/diagnostic/results` | Requires existing `complete` plus non-null results; otherwise diagnostic |
| `/dashboard` | Requires session and completed onboarding; diagnostic may be skipped |
| `/learn`, `/learn/:id` | General sample catalog/lesson; missing content recovery |
| `/practice`, `/practice/activity-library` | Current personalized practice lock until prototype baseline |
| `/reading`, `/writing`, `/listening`, `/speaking` | Four hubs; Learn, Practice and Test |
| `/{module}/:mode/:id` | Validates resource/module/mode; practice baseline lock; strict Test |
| `/reading/practice` | Redirect to `/reading/practice/gardens` |
| `/writing/task/:id`, `/speaking/part/:id` | Legacy redirects to valid current practice resources |
| `/{module}/exam`, `/{module}/exam/:id`, `/exam-simulation` | Redirect to standalone `/exam` |
| `/mock-tests` | Independent shorter module tests, immediate reviews |
| `/exam`, `/exam/setup`, `/exam/attempt/:attemptId`, `/exam/result/:attemptId` | Center, three-step setup, saved sequential strict simulation, held combined result |
| `/results/:id` | Saved attempt review; active Exam sections held; missing result/content recovery |
| `/progress`, `/readiness` | Saved history/provisional planning; neutral if no prototype baseline |
| `/ai-coach`, `/saved`, `/vocabulary`, `/settings` | Sample Coach, saved words, alias, settings |
| `/profile`, `/mistakes` | Redirect to `/settings`, `/progress` |
| `*` | Recoverable not-found screen; global guards still apply |

`{module}` means each of reading/writing/listening/speaking. Route order/ranking and resource validity remain authoritative in source; the table is not a generated router.

Observed guard order: no demo session → `/`; incomplete onboarding → `/onboarding`; missing diagnostic result → `/diagnostic`; active Exam → its exact current attempt except `/exam` and that attempt. Public routes bypass onboarding checking, but active Exam then forces the active attempt even for public routes. A signed-out learner retains stored progress. Active Exam may therefore temporarily restrict dashboard access; changing that historical strict-mode policy needs owner agreement, not an unnoticed new diagnostic guard.

## Observed state and gaps

`DiagnosticStatus = not_started | in_progress | complete | skipped`. UI sets `in_progress` on entry. Skip preserves response map, Writing text, duration, playback use and position. Complete plus results is only a coarse prototype baseline check, not validation of assignment, content version, result schema or scorer. All data sits under device-wide keys; a demo login is not per-user authorization.

Onboarding supports Academic/General Training, default target 7 and six steps. UNDECIDED is newly accepted vision but not implemented. Exam state has unique IDs/deadlines/history; diagnostic state has no attempt ID/immutable assignment. Do not silently reinterpret old `complete` records as reviewed results.

## Proposed routes and guards — pending D01/D04/D05/D06

Keep existing public/core paths and aliases first. `SessionProvider` exposes checking/anonymous/authenticated/error; `RequireSession` waits for checking and preserves a validated same-origin return path. Profile-required routes redirect to resumable onboarding; a skipped diagnostic NEVER redirects a completed-profile learner away from the dashboard. Metric eligibility is a selector, not a whole-dashboard access guard. UI guards do not replace later server ownership checks.

Diagnostic proposal: `/diagnostic` resolves current assignment/attempt; optional future `/diagnostic/attempt/:attemptId` and `/diagnostic/results/:attemptId` support stable multiple-attempt history, with backward redirects only after migration approval. Keep the old result until a replacement submits successfully; retain legacy data as unverified history. Save errors retain entered content, prevent false navigation and offer retry. Unsupported assessment versions show safe recovery rather than substituting new questions into the old attempt.

Feature destinations reserved for later approval: `/ted`, `/ted/:talkId`, `/awl`, `/vocabulary/resources`, `/grammar`, `/resources`, `/curriculum`, `/notes`; optionally `/admin` and `/plans` only under separate F17/F18 approval. No such new route exists today. Availability shell must say COMING_SOON or PROPOSED/RESEARCH_ONLY and must not offer fake Start/payment/publish actions.

Proposed attempt states: NOT_STARTED → IN_PROGRESS → SUBMITTING → SUBMITTED. NOT_STARTED/IN_PROGRESS → SKIPPED_OR_DEFERRED; resuming goes to NOT_STARTED if no attempt exists, otherwise IN_PROGRESS at the exact saved item. Save/retry errors are operation states and do not overwrite lifecycle or answers. SUBMITTED is immutable; a new attempt is a distinct assignment after retake approval. SUBMITTED does not imply SCORED_VALID.

Loading/empty/unavailable are explicit: skeleton or status while loading; EMPTY only after successful empty retrieval; REQUIRES_VALID_DIAGNOSTIC for blocked derived metrics; TEMP_UNAVAILABLE for provider/storage failure; stale data retains its timestamp and stale reason. Missing record/forbidden owner must not expose someone else's assignment or result.

Details: [architecture](reviews/stage-1a/ARCHITECTURE_AND_ROUTES_PROPOSAL.md), [diagnostic contract](reviews/stage-1a/DIAGNOSTIC_DYNAMIC_SOURCE_CONTRACT_PROPOSAL.md), [data contracts](DATA_CONTRACTS.md).
