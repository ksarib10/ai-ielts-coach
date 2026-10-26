# Routes and states

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
