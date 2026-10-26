# AI IELTS Coach — project overview

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
