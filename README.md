# AI IELTS Coach

A responsive, client-presentable React, TypeScript and Vite prototype. The active implementation is in `src/`; `reference/`, `prototype.html` and `standalone/` are historical references.

## Run and verify

Use Node.js 22 or 24 and npm.

```sh
npm ci
npm run dev
npm test
npx tsc --noEmit
npm run build
npm run preview
```

Choose **Get started** for the full learner journey or **Explore the demo** for the canonical Dilnoza sample. Demo sign-in is local and does not store credentials.

## Product journey

1. Phase 1 collects goals in six resumable screens: Welcome, About you, IELTS goal, Language settings, Starting point, and Diagnostic handoff.
2. Phase 2 assesses Grammar, Vocabulary, Reading, Listening, Writing, Speaking, and IELTS Familiarity one question at a time. Exact position, answers, Writing text, Listening use, and Speaking state persist locally.
3. Learners may save, skip, reach a neutral dashboard, and resume. Until all seven sections produce a baseline, the app shows no IELTS estimate or readiness percentage and keeps personalized practice locked.
4. Completing the assessment creates explicitly provisional estimates and unlocks a state-derived dashboard, activity streak, daily and weekly totals, module practice, Progress, and Readiness.
5. Reading, Writing, Listening, and Speaking each provide Learn, Practice, and Test. Module Tests are shorter independent attempts with AI disabled and immediate results.
6. Exam Simulation is a separate seven-section Academic or General Training journey. It uses source-backed module timing, a shared Writing deadline, saved resume, sequential section locking, strict no-AI behavior, and one held combined result.
7. Learners can review attempts, lessons, vocabulary, goals, preferences, contextual Coach guidance, and recovery states. The account menu supports sign-out and a clearly warned demo reset.

## Architecture and state

- `src/domain.ts` defines content, activity, attempt, mode, and Exam contracts.
- `src/types.ts` defines the versioned learner, onboarding, diagnostic, and result state.
- `src/data/` contains original structured samples and the IELTS reference model derived from the supplied CSVs.
- `src/services/` separates session, evidence, readiness, Exam, persistence, assessment, recommendation, and mock Coach behavior.
- `src/components/` provides the shared shell, structured viewer, activity renderer, media controls, Coach, reset dialog, progress widgets, and recovery states.
- `src/features/` implements public/auth, onboarding, diagnostic, dashboard/learning, modules, results, Exam/Mock Tests, Progress/Readiness, and account screens.

Browser storage keys are `aiIELTSCoach` plus its migration-compatible profile/onboarding/diagnostic/result keys, `ielts-learning-v2`, and `ielts-demo-session`. Display and reminder preferences use their own local keys. Learner answers, drafts, attempts, Exam history, vocabulary, activity events, and migrations are preserved across sign-out. Reset attempts every category even if one browser-storage deletion fails and reports partial failure safely.

Storage errors remain visible. Diagnostic answers do not advance unless saved, attempt submission can retry without duplicates, malformed JSON falls back to a blank safe state, and unavailable routes/resources provide recovery actions. Response-free submissions remain in history but do not change readiness or personalized recommendations.

Learn and Practice allow their documented support. Test and Exam hide Coach, hints, transcripts, explanations, and sample Speaking content until submission. The active Exam uses original shortened samples and reports raw objective and saved response evidence; it does not infer an official overall, Writing, or Speaking band.

## Routes

Public: `/`, `/login`, `/signup`, `/forgot-password`.

Journey: `/onboarding`, `/diagnostic`, `/diagnostic/results`, `/dashboard`, `/learn`, `/learn/:id`, `/practice`, `/practice/activity-library`.

Modules: `/reading`, `/writing`, `/listening`, `/speaking`; workspaces use `/<module>/<learn|practice|test>/<resource-id>`.

Exam and reviews: `/mock-tests`, `/exam`, `/exam/setup`, `/exam/attempt/:attemptId`, `/exam/result/:attemptId`, `/results/:id`, `/progress`, `/readiness`.

Account: `/ai-coach`, `/saved`, `/settings`.

`/exam-simulation` and retired module Exam URLs redirect to `/exam`. Legacy register, profile, mistakes, Writing-task, and Speaking-part links resolve to current screens. Hash navigation and direct application paths both work; direct paths normalize to the current route.

## Deployment

`vercel.json` builds the Vite app into `dist` and falls back to `index.html` for application routes. No secrets or environment variables are required for this prototype. Remote publication is outside the local Definition of Done; after deployment, smoke-check the public landing page and a direct learner route in that environment.

See `QA.md` for final evidence, `Memory.md` for continuity, and `AUDIT.md` / `SOURCE_AUDIT.md` for the completed preserve-refactor-replace decisions.
