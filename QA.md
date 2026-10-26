# Final focused-correction QA — 2026-09-11

## Result and scope

The focused product-flow correction and the original prototype Definition of Done are complete in the local production preview. Verification used the rendered React application, saved-state migrations, six service/state suites, TypeScript validation, and Vite production compilation. Remote publication is not claimed.

## Ordered implementation coverage

| Area | Verified behavior |
| --- | --- |
| Session and recovery | Sign out returns to the public landing page; protected routes cannot remain active; signing in restores learner data. Password recovery is clearly a local preview. |
| Phase 1 | All public journey CTAs enter the six-screen goals flow. Required fields, optional details, source-aligned choices, autosave, Save & exit, diagnostic handoff, and legacy-state migration are implemented. |
| Phase 2 | Seven ordered sections run one active question at a time. Exact question, answers, Writing text, Listening playback use, and Speaking state persist. Save/Skip/Resume restores the saved point. Failed diagnostic writes keep entered content visible and block false advancement. |
| Gating | Incomplete/skipped learners can use a neutral dashboard and general lessons. They receive no IELTS bands, strengths, personalized priorities, Coach recommendation, or readiness percentage. Personalized practice and direct practice routes explain the lock and link to Start/Resume assessment. |
| Assessed dashboard | Completion creates provisional state-derived estimates, priority order, module practice, Today’s Plan, Next Best Activity, current-week activity days, local-day streak, daily activities, and weekly minutes. Attempt minutes are capped to the resource duration so expired offline deadlines cannot inflate totals. |
| Modules | Reading, Writing, Listening, and Speaking expose Learn, Practice, and Test only. Retired module Exam links recover to the standalone Exam center without clearing saved data. |
| Mock Tests | Four independent, shorter Module Tests may be taken in any order with breaks. AI is disabled and each submitted attempt receives an immediate review. |
| Exam Simulation | `/exam` has source timing, type differences, setup/instructions/pre-check, seven sequential sections, saved resume, continuous Listening/Reading/Writing timing, one shared Writing deadline, one-use Listening, strict no-AI UI, held results, and saved completed history. |
| Exam evidence | The combined result reports real objective accuracy, elapsed attempt time, saved response counts, observed gaps, readiness impact, and section reviews. Empty Writing/Speaking sections say Not provided and Not scored. Empty submissions neither increase readiness nor replace diagnostic recommendations. |
| Progress and Readiness | Unassessed views are neutral. Assessed views derive numbers, strengths, attention, priority lessons, and 7/14-day plans from the saved diagnostic and response-bearing activity. Progress bars expose text labels and values. |
| Reset | Reset is discreetly placed in the account menu. Its portal dialog names every cleared category, focuses Cancel, supports Escape, restores trigger focus, and reports partial storage failure on the landing page. Disposable tests verify all state categories are attempted even if one deletion fails. |

## End-to-end scenarios

- **A — New learner:** Landing → six Phase 1 screens → seven Phase 2 sections → provisional results → assessed dashboard → personalized module practice unlocked.
- **B — Diagnostic skipped:** Landing → Phase 1 → begin Phase 2 → Save/Skip → neutral dashboard with no estimate/readiness number, visible practice locks, and Resume Assessment.
- **C — Resume diagnostic:** Resume returns to the exact saved question and content, then completion produces results, assessed dashboard, and unlocked practice.
- **D — Logout:** User menu → Sign out → public landing; protected URL returns to landing; login restores the same profile, activity, attempts, and Exam history.
- **E — Exam:** Sidebar → Exam Simulation → setup → instructions → pre-check → seven sections → final combined result. General Training letter, Academic visual task, shared Writing limit, refresh resume, route lock, held results, and strict no-AI conditions were checked.
- **F — Modules:** All four hubs visibly show `Learn · full support`, `Practice · limited help`, and `Test · AI off`; no module Exam control remains.

## Responsive, accessibility, and recovery evidence

- Desktop 1440×1000, tablet 768×1024, and mobile 390×844 checks cover landing, goals/diagnostic, assessed and unassessed dashboards, module locks/hubs/workspaces, Progress, Readiness, Exam center/result/strict workspace, settings, and vocabulary.
- Core mobile routes have no horizontal overflow. Landing keeps Log in visible. The strict header fits at 390px, the sticky workspace submission control remains reachable, and dialogs fit or scroll within `100dvh`.
- Mobile navigation focuses Close after opening, traps keyboard focus, closes with Escape, and restores the trigger. The account menu supports arrow/Home/End/Escape behavior.
- Reset opens as a top-level modal outside the menu, focuses Keep current progress, closes with Escape, and restores the user-menu trigger. The destructive confirmation was not used against saved QA learners.
- Submission dialogs are named, focus the safe action, fit mobile, close with Escape, and restore the submit trigger. Failed submission closes the modal and exposes a focusable retry alert while retaining the draft.
- Route changes move focus to `#main-content`. Skip links, labeled form controls, pressed filter states, question-current state, recorder status/timer text, visible readiness text, and labeled progress values are present.
- Active Exam permits a safe “Save & exit simulation” route to the Exam center while its timer continues; all other off-path learner routes return to the exact active section.
- Malformed storage, missing results/resources/attempts, invalid routes, unavailable microphone, and storage-write failures have explicit safe fallbacks. Direct production-preview routes and refresh recovery work.
- Browser console inspection found no significant application errors.

## Automated checks

`npm test` runs:

- `qa/domain.test.mjs`: scoring, normalization, ordered answers, strict assistance policy, transactional retry, vocabulary, mastery, state-derived recommendations, and empty-attempt exclusion.
- `qa/state.test.mjs`: version migration, partial learner preservation, route gating, complete reset, partial-reset continuation, and malformed JSON fallback.
- `qa/diagnostic.test.mjs`: saved-evidence results and provisional labels.
- `qa/readiness.test.mjs`: baseline gating, saved-evidence calculation, and exclusion of no-content timed attempts.
- `qa/ielts-reference.test.mjs`: source timing, continuous-session duration, order, Writing rules, and Academic/General differences.
- `qa/exam.test.mjs`: unique sessions, shared deadlines, resume, sequential progression, completion, and retained history.

The final command sequence is `npm test`, `npx tsc --noEmit`, and `npm run build`. `dist/` is the deployment artifact.

## Verification boundaries

- Browser checks use Chromium viewport emulation; physical iOS/Android and full assistive-technology certification remain deployment-stage work.
- Real microphone permission/hardware was not exercised. Error, retry, and a response-free fallback are implemented without inserting sample learner content.
- Authentication, AI, transcription, content licensing/extraction, calibrated diagnostic scoring, Writing/Speaking evaluation, and backend persistence remain future production integrations.
- The Exam resources are shortened original samples governed by supplied IELTS structure/timing facts. No official score or readiness guarantee is inferred.
- Vercel configuration and local production output are ready; the public URL needs its own post-publication smoke check.
