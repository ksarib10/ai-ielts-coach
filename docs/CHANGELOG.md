# Changelog

## 2026-10-28 — IELTS About frontend content integration (v1.1)

- Integrated `IELTS_ABOUT_9_CARD_CONTENT_PACK_V1_1` static JSON into `src/content/ielts-about/` (9 card JSON files + `test-format-question-types.json`, typed loader, URL safety checks and structural validator). Excluded raw 458-row CSV archive, `01_by_card` and `03_manifests` from client assets.
- Implemented all nine `/ielts-about/:topicId` pages in `src/features/discovery/about/AboutPages.tsx` and shared accessible primitives in `src/features/discovery/about/AboutComponents.tsx`, rendering all 66 starter highlights with traceable `data-highlight-id` attributes and external `https:` official source links.
- Implemented the four-tab `Test Format` screen (`Listening | Reading | Writing | Speaking`) with 6 expandable Listening question types and 11 expandable Academic Reading question types, plus explicit General Training Reading pending-verification disclosure.
- Extended `qa/discovery.test.mjs` to validate all 9 cards, 66 highlights, 6+11 question types and rendered markup. All 9 test suites (`npm test`), TypeScript (`npx tsc -b`), production build (`npm run build`), and 1440px (dark/light) + 390px browser checks PASS with zero contrast or overflow failures. Owner visual and editorial acceptance pending.

---

## 2026-10-28 — Comprehensive theme consistency and contrast remediation

- Corrected legacy hard-coded pale/white surfaces and fixed blue-gray text at source in styles.css/prototype.css; semantic surface/text/action/status/disabled/highlight roles and eleven missing compatibility aliases in foundation.css. Exam hero/stepper/choices/timers/audio/table/footer/results and diagnostic/shared surfaces now follow the active theme; existing layouts preserved.
- Removed independent color/background interpolation, corrected a measured2.97:1 Light control border with #856b98, retained opaque workspaces and readable disabled labels. Fixed PDF canvas pixels and deferred decorative progress gradients remain explicit exceptions.
- Added read-only computed browser audit and focused surface/alias/transition regression suite. Actual checks include full disposable Exam journey and diagnostic/shared states, both themes/three widths, persistence/focus/cancel. Initial contrast observations and tool/helper recovery errors retained honestly; no full WCAG or microphone certification.
- Final full npm test once: nine suites PASS; TypeScript exit0; production build PASS. Protected non-CSS application/media/config/lockfile and 36 candidate files unchanged. Five relevant living docs updated; ROUTES_AND_STATES and DATA_CONTRACTS unchanged because neither contract changed. [Theme report and evidence](reviews/stage-1b/theme-consistency/THEME_CONSISTENCY_REMEDIATION_REPORT.md). Local feature commit only; owner acceptance pending, no merge/push/deploy.

---

## 2026-10-28 — Stage 1B Slice 2 navigation and learning architecture

- Continued base `65a25bbacc97a021d728946839da5404d262924e` on `feat/stage-1b-slice-2-navigation`; preserved four pre-existing untracked handoff reports and prior corrections. No restoration or earlier QA repeated.
- Added typed discovery metadata/routes/shared cards/screens: ten Learn categories, 24 skill activity cards, nine About topics and four pending scoring-reference pages. Retained original sample libraries, workspaces, practice locks and URLs; added initial lesson category filtering.
- Simplified sidebar to ten links/four groups, nested Readiness under Progress with old redirect, renamed Exam display labels to Complete IELTS Exam. Consolidated shell prototype clutter into Development Preview while preserving material limitations and strict no-assistance header.
- Browser QA found preview-panel clipping at 320/390px, corrected with a localized mobile inset rule. Actual checks: both themes at 1440/390/320px on affected screens, destination/deep-link navigation, theme persistence, drawer focus/Escape/three breakpoint cycles, strict timed Writing and unchanged G1 B skip/save/resume. Initial navigation timeout/stale reads are recorded rather than counted as application passes.
- Final `npm test`: eight suites PASS; TypeScript `--noEmit`: exit 0; `npm run build`: exit 0. Historical scoring suite passes certify unchanged prototype regressions only, not Diagnostic V1 validity or metric acceptance. Exact logs, screenshots, preservation hashes and file/route manifests: [Slice 2 review](reviews/stage-1b/slice-2/SLICE_2_IMPLEMENTATION_REPORT.md).
- Updated all seven living documents. No package/lockfile, question/candidate, diagnostic/scoring/persistence/capture, Exam engine, backend, ingestion or learner migration change. Human acceptance PENDING; Stage 2 blocked. Local feature checkpoint only; no merge/push/deploy in this slice.

---

## 2026-10-27 — Slice 1 visual-acceptance corrections (VA-01–VA-05)

- Focused corrections after the visual audit: semantic surface/text pairing for `.option`, diagnostic progress panel, Coach context and public CTA; readable underlined auth links; drawer breakpoint state via `useSyncExternalStore` with layout-effect inert/aria-hidden sync; mobile Coach launcher docked below the scroll region (`has-coach`); onboarding errors linked to the invalid field (`aria-invalid`, `aria-describedby`, focus) through `features/onboarding/services/validation.ts`; local 16px hero gutter at ≤430px. VA-06 deferred.
- No scoring, question, storage, route or learner-record changes. Technical evidence: [correction addendum](reviews/stage-1b/slice-1/visual-acceptance/CORRECTION_ADDENDUM.md). Human visual acceptance remains pending.

## 2026-10-26–27 — Resume and finish authorized Stage 1B Slice 1

- Resumed the existing verified development copy on main at baseline `93dd4a2641753e5afb7f3ad3ccb6d22230502f82`; no restoration, repository recreation or Phase A repetition. Original source, independent backup, candidate bank and protected diagnostic/storage/Exam files verified unchanged.
- Added feature-based appearance, shell and read-only dashboard layers; provisional purple light/dark/system preference, responsive navigation, focus/Escape handling, strict header appearance control and unavailable non-links.
- Replaced active overview/diagnostic-result presentation with honest availability, saved goals/participation and safe history metadata. Removed legacy estimated bands from all four hubs and lesson mastery percentages; retained original calculations, saved data, routes, locks and engines.
- Corrected dark reset dialog, module-tab contrast and inherited section-caption colors; preserved reset cancellation and saved diagnostic answers. No learner reset/migration or candidate-bank activation occurred.
- Final checks: all seven suites pass (six historical plus focused foundation), TypeScript no diagnostics, Vite production build succeeds. Resumed browser evidence covers both themes/persistence, onboarding skip, saved G1 resume, strict diagnostic shell, mobile drawer/account Escape, reset cancellation, four hubs, Progress/Readiness and dashboard 320/390/768/1024/1440px reflow. Initial server-rendering test failure preserved and corrected by extracting a pure status component; no store rewrite.
- Updated these seven living documents and dated Slice 1 review/evidence/change manifests. Historical audits and root Memory.md retained. Git checkpoint is recorded separately after the implementation commit to avoid a self-referential commit hash.
- Prepared Vercel compatibility/protection/workflow findings only; no remote, push, tooling installation, connected account, backend or deployment.

Status: **Slice 1 ready for bounded human inspection, not owner-accepted. Full Stage 1B incomplete; Diagnostic V1 unapproved; Stage 2 blocked.** Remaining accessibility/visual acceptance and all 15 baseline metric acceptance work are documented in the [Slice 1 report](reviews/stage-1b/slice-1/SLICE_1_REPORT.md).

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

## 2026-10-23 — Stage 1A documentation and readiness review

Stage 1A: PASS_WITH_REVIEW. STAGE_2_ENTRY = BLOCKED. Documentation-only delivery; no feature commit was made because the project has no Git metadata.

- Read all four authoritative handoffs, inspected actual source/routes/state/style/assets/test scripts, historical documentation and available capabilities.
- Created the seven living documents and detailed Stage 1A review package, source reuse/skills/metric matrices, draft contracts, owner decisions, root AGENTS.md proposal and future acceptance plan.
- Evaluated seven external skill bundles at pinned revisions. Retained current capabilities, recommended one optional instruction-only accessibility skill; installed zero skills, agents, tools or MCP servers.
- Ran six existing suites, TypeScript and production build in an isolated complete copy. All child checks exited 0; preserved output logs. Audit wrapper hit Windows stdout encoding after the successful build; collection was repaired without modifying or rerunning the app. Fresh browser checks covered landing/login/unauthenticated guard only.
- Original source, package/lockfile/configuration, assets, prior Memory.md/QA.md, installed dependencies and original dist output were not intentionally changed. Exact post-review file comparison is in the manifest. No browser learner data was read/reset.
- Known gaps: absent Git history, no reviewed diagnostic assignment/version/scoring validity, heuristic bands/readiness, device-wide demo stores, no dark theme, incomplete future catalogs and no production auth/backend. These are proposals/blockers, not completed fixes.

No migration, breaking runtime change, backend work, source-data change, deployment or new feature is included. Historical implementation evidence remains in the original root documents; it is not rewritten as new-stage acceptance.

[Manifest](reviews/stage-1a/STAGE_1A_VALIDATION_AND_CHANGE_MANIFEST.json) · [report](reviews/stage-1a/STAGE_1A_READINESS_REPORT.md) · [owner decisions](reviews/stage-1a/DECISION_REQUIRED.md).

## 2026-10-28 — Appearance picker progressive enhancement

Scoped CSS uses customizable native select support where available: rounded popup, semantic purple surfaces, hover/checked/focus and checkmark styling, plus forced-colors handling. Unsupported browsers retain their usable OS-native popup, whose selected highlight may remain system-controlled. No JS control, preference/persistence, dependency or unrelated style changes. Focused foundation/theme checks and TypeScript validation recorded in the local fix handoff; no browser audit or deployment.
