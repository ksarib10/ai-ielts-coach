# AI IELTS Coach — project overview

## Current checkpoint — 2026-10-28, Stage 1B Slice 2

Owner-authorized UI restructuring is implemented and locally validated; **Slice 2 human acceptance PENDING**. This dated entry supersedes affected current summaries below, preserving their historical evidence. Work continued from `65a25bbacc97a021d728946839da5404d262924e` on `feat/stage-1b-slice-2-navigation`. The existing private GitHub origin and Vercel frontend are acknowledged from the handoff; this slice makes no remote change, push, merge or deployment.

React/TypeScript/Vite/HashRouter and the purple theme remain. `features/discovery` separates UI catalog types, metadata service, route builders, shared cards and screen components. Ten Learn categories, six cards per skill, nine pending information topics, four pending scoring references and Progress/Readiness subnavigation are implemented. Original module libraries/workspaces remain accessible. Dashboard content, diagnostic/scoring/persistence/media and Exam engine are preserved; Exam display names alone become Complete IELTS Exam.

Eight suites (seven retained plus discovery), TypeScript and production build passed. Actual local-browser evidence covers affected routes, both themes at 1440/390/320px, all category/card/topic destinations, legacy deep links, drawer keyboard/resize behavior, appearance reload persistence and original diagnostic G1 B skip/save/resume. The mobile preview disclosure overflow found during QA was corrected. See [Slice 2 report](reviews/stage-1b/slice-2/SLICE_2_IMPLEMENTATION_REPORT.md) and its exact file/route/evidence manifests. No independent assistive-technology certification or full Exam browser completion is claimed.

The 23 audited datasets are not integrated. Diagnostic V1 remains unapproved; all 15 M01–M11 metrics still need genuine implementation, verification and human acceptance; M12–M17 remain unavailable. D06/D07 remain open. No packages, skill installation, learner migration, resource ingestion, backend or AI integration occurred. The existing seven-document continuity rule remains in force; historical Memory.md and previous audits are unchanged.

---

## Current checkpoint — 2026-10-27, Stage 1B Slice 1

Owner authorization: D01 plus D03-S1 only. Slice 1 implementation and bounded automated/browser validation are complete; **owner acceptance is pending**. Full Stage 1B is incomplete, Diagnostic V1 remains unapproved and Stage 2 remains blocked. No remote, push, deployment, backend, skill installation or dependency upgrade occurred.

Development root: `C:\Users\ksari\source\repos\ai-ielts-coach`. Preserved restored source: `C:\Users\ksari\OneDrive\Desktop\ai_ielts_coach_app`. Independent backup: `C:\Users\ksari\Backups\AI_IELTS_Coach\2026-10-24_PreStage1B_01`. The previously verified copy covered 6,318 files / 108,366,561 bytes. New, honestly dated Git baseline on `main`: `93dd4a2641753e5afb7f3ad3ccb6d22230502f82`; original Git history was absent. Resume verification preserved 166 original non-dependency files, 36 candidate-bank files and the backup's 117 files plus seven supplemental checksum entries. See the [Slice 1 report](reviews/stage-1b/slice-1/SLICE_1_REPORT.md), exact change manifest and [Git checkpoint](reviews/stage-1b/slice-1/GIT_CHECKPOINT.md).

React/TypeScript/Vite/HashRouter and installed dependencies are retained. A feature-based appearance provider, shell navigation/drawer and read-only dashboard presentation now supplement the existing architecture. Light/dark/system appearance persists separately from learner records. Dashboard, Progress, Readiness, diagnostic-result presentation and four module hubs no longer present legacy heuristic proficiency as validated statistics; sample lesson mastery percentages are hidden. Goals and legacy participation remain visible where readable. Original diagnostic/scoring/storage and Exam engines are unchanged.

Seven suites, TypeScript and production build passed; resumed browser checks cover both themes, skip/resume, drawer/account Escape, reset cancellation, all four hubs, Progress/Readiness and 320–1440px dashboard reflow. This is bounded evidence, not diagnostic-quality or WCAG certification. All 15 M01–M11 baseline IDs still require later implementation/verification/human acceptance; M12–M17 are unavailable. Tokens remain provisional, awaiting owner inspection.

Continuity rule: update the appropriate documents among these seven in the same slice whenever routes, data contracts, feature states or architecture change. `ROUTES_AND_STATES.md` is the authoritative route/flow map; `FEATURE_REGISTRY.md` is the implementation-status register. Review reports contain dated evidence, not competing authorities. Preserve historical root Memory.md and audit reports.

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

Updated: 2026-10-23 (Asia/Karachi). Owner: project owner. Maintainer: assigned frontend engineer, not yet appointed.

## Authority and current stage

ACCEPTED_REQUIREMENT: The owner's 23 October Stage 1A request and four handoff documents govern this review. The feature inventory F01–F18 is approved product vision, not permission to implement it. Original inputs are archived unchanged in [review inputs](reviews/stage-1a/inputs/). Older README.md, Memory.md, QA.md, AUDIT.md and SOURCE_AUDIT.md remain historical prototype evidence; their prior completion claims do not satisfy the new gate.

**Stage 1A: PASS_WITH_REVIEW. STAGE_2_ENTRY = BLOCKED. Stage 1B and Stage 2: NOT AUTHORIZED.**

| Area | Current evidence | Status / next boundary |
|---|---|---|
| Application | React 18.3.1, TypeScript 5.9.3, Vite 6.4.3, Router 7.18.3, plain CSS, npm lockfile | OBSERVED_SOURCE; preserve stack, incremental refactoring proposed |
| Original files | 82 non-doc project files hashed before review; source/assets/tests/build retained | Final preservation comparison in change manifest |
| Git | status, branch and HEAD commands report “not a git repository” | UNKNOWN history; sourceCommit=null. No Git initialization or history changes |
| Checks | Six existing suites, TypeScript and production build exit 0 in an isolated copy | IMPLEMENTED_AND_TESTED for existing prototype behavior only |
| Browser | Landing, login destination, unauthenticated dashboard redirect; no credentials or demo entered | Limited fresh smoke evidence, not full journey/a11y certification |
| Authentication | Local boolean demo session; no credential verification or server | MOCK_OR_DEV_ONLY |
| Diagnostic | Seven sections, 27 objective questions plus Writing/Speaking; saved skip/resume | OBSERVED_SOURCE; no assignment/version pin; scorer not validated |
| Dashboard | Saved goals/activity plus heuristic estimates and readiness | MOCK_OR_DEV_ONLY scoring; new statistics gate remains unsatisfied |
| Design | Shared components, responsive CSS, reduced motion, larger text | Light theme observed; dark theme/provider absent |
| Backend/content | No application fetch/SDK backend; original short samples | FUTURE; no production auth, scoring, licensed bank, TED/AWL ingestion |
| Skills | Seven external candidates statically evaluated; no installation or agent creation | Existing tools sufficient; one optional instruction-only candidate for approval |

## Product and journeys

ACCEPTED_REQUIREMENT: Uzbekistan first. Connect account/profile, IELTS Academic/General Training/undecided goals, optional initial diagnostic, dashboard, language foundations, practice/tests, Exam Simulation, real history and eventual personalized support. No official endorsement, score guarantee or unverified rights claim.

Core journey: public site → account boundary → learner profile/goals → start OR skip diagnostic → dashboard. A skipper must retain profile/navigation access and a start/resume action. Missing diagnostic data is not failure and must not become a zero score. A submitted attempt can enable raw metrics only after source/scoring validation. Readiness and bands need separate validated models.

The existing broader prototype remains intact, including Learn, four module hubs/workspaces, Mock Tests, Exam, Progress, Readiness, saved vocabulary and mock Coach. Preservation does not turn those samples into production features. TED, AWL, full resource catalogs, administration and plans/payments remain future or conditional scope.

## Proposed execution gates

1. Stage 1A ends with these documents and owner review. No application changes, installs, backend or deployment.
2. Optional Stage 1B requires a new explicit authorization for the precise fixture, attempt/persistence, baseline statistics, theme and acceptance work described in the gate decision. Local-only history sufficiency must be accepted explicitly.
3. Human acceptance of the agreed statistics definition and observed outputs is necessary but does not itself authorize Stage 2.
4. Stage 2 requires an independent request after the gate is met. Backend, dynamic delivery, content ingestion, AI scoring, billing and publication require their own later gates.

## Living documentation

- [Routes and states](ROUTES_AND_STATES.md): observed routes and proposed guards.
- [UI design system](UI_DESIGN_SYSTEM.md): existing tokens and draft theme/component rules.
- [Feature registry](FEATURE_REGISTRY.md): all F01–F18 statuses and evidence.
- [Data contracts](DATA_CONTRACTS.md): draft provider/state/metric/error boundaries.
- [Decisions](DECISIONS.md): accepted authority versus pending architectural choices.
- [Changelog](CHANGELOG.md): documentation-only review entry.
- [Stage 1A report](reviews/stage-1a/STAGE_1A_READINESS_REPORT.md), [owner decisions](reviews/stage-1a/DECISION_REQUIRED.md), [gate decision](reviews/stage-1a/STAGE_2_ENTRY_GATE_AND_SEQUENCE_DECISION.md), and [validation manifest](reviews/stage-1a/STAGE_1A_VALIDATION_AND_CHANGE_MANIFEST.json).

## Non-goals and evidence discipline

No source rewrites, migrations, dependency changes, secret inspection, skill/agent/MCP installation, connected accounts, database work or publication in Stage 1A. Browser-local learner data was neither inspected nor reset. No Git commit is claimed. Static skill review is not a security certificate; old “zero vulnerabilities” statements are not a current vulnerability scan.

Labels: OBSERVED_SOURCE = code/files observed; ACCEPTED_REQUIREMENT = owner-approved behavior; PROPOSED_DESIGN = draft, also called PROPOSED; MOCK_OR_DEV_ONLY = illustrative/local simulation, also called MOCK_ONLY; IMPLEMENTED_AND_TESTED = explicitly bounded fresh test evidence; UNKNOWN = evidence absent; BLOCKED = approval/data prerequisite absent; FUTURE = later authorized scope. Availability words are separately defined in the feature registry.
