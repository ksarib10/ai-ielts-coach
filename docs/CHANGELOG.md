# Changelog

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
