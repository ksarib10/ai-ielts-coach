# Stage 2 entry gate and sequence decision

2026-10-23. **STAGE_2_ENTRY = BLOCKED. Stage 2: NOT AUTHORIZED. Stage 1B: NOT AUTHORIZED.**

ACCEPTED_REQUIREMENT: “do not advance to Stage 2 before complete personalized dashboard statistics are implemented” AND accepted. Stage 1A explicitly forbids implementation. The prior Stage 2 label denoted frontend construction. Existing prototype completion, a working mock dashboard or a PASS on heuristic arithmetic cannot resolve that logical conflict.

## Owner choice needed (D03/D04/D05)

Recommended option, still PROPOSED_DESIGN: accept a separately scoped Stage 1B prerequisite implementation and human acceptance before independently approving Stage 2. Alternative: owner renames the first implementation stage but preserves the same statistics acceptance gate. If complete means the entire future-platform scorecard (calibrated readiness/bands, full modules, trends and verified AI), the gate needs representative data, validated scoring and later authorized services; a small local Stage 1B is insufficient. Do not shrink the owner's gate automatically.

## Owner-reviewable definition of complete

Baseline proposal comprises **15 metric IDs**: M01 profile completion; M02 saved goal; M03 diagnostic state; M04 answered count; M05-GRAMMAR/VOCABULARY/READING/LISTENING/FAMILIARITY raw accuracy; M06 review availability; M07 productive capture status; M08 activity count; M09 active days; M10 today's activity; M11 streak. Every value must match an accepted formula, owned real input and pinned definition. Administrative/learning counts can work for a skipper; score-dependent values stay null until valid reviewed submission. A legitimate known zero is not interchangeable with unavailable data.

M12 comparable trend, M13 measured active duration, M14 readiness, M15 IELTS/CEFR estimate, M16 AI recommendation and M17 full curriculum completion remain explicitly unavailable until their separate data/models exist. Current nominal minutes and arbitrary gauges do not fill those slots. Their honest gated state is part of the proposed baseline acceptance, but exclusion from numeric completion requires explicit owner sign-off. Matrix formulas, limitations, privacy and test IDs are in [metric matrix](PERSONALIZED_DASHBOARD_METRIC_MATRIX.csv).

## Smallest proposed Stage 1B authorization envelope

1. Review actual starter questions/keys/provenance and approve a blueprint. Add immutable fixture/scorer separation and attempt identity/version/public snapshot; no randomization or live backend.
2. Add typed participant/deferred/attempt/result validity, deterministic save/skip/resume, explicit fallback capture metadata and provenance. Preserve existing stores/history; validate legacy snapshots with backup/rollback tests. No silent legacy score promotion.
3. Implement pure baseline metric selectors/envelopes and durable event normalization/scoping necessary for those metrics, using existing lesson/attempt completion actions. Do not implement new lesson/module/Exam engines. Do not claim nominal time is measured study.
4. Wire the existing dashboard/core result views to truthful metrics, availability, loading/empty/error/retry states. Audit current consumers of legacy scores so new functional views do not reintroduce unsupported estimates. Preserve historical demo functionality with explicit isolation/labels where agreed.
5. Add the narrowly necessary semantic themes/shared field/focus behavior so the accepted core flow can pass light/dark, keyboard and responsive tests. No whole-platform visual rebuild.
6. Run unit, provider/integration and browser scenarios, preserve existing regressions, update all seven docs and present observed outputs for human acceptance. No skill installation bundled into feature approval unless exact payload/path/trust scope is separately accepted.

Potential affected existing files to authorize explicitly: `src/types.ts`, `src/state.ts`, `src/services/diagnostic.ts`, `src/services/platform.ts`, `src/services/readiness.ts`, `src/services/evidence.ts`, `src/App.tsx`, `src/main.tsx`, `src/features/Onboarding.tsx`, `src/features/Diagnostic.tsx`, `src/features/Learning.tsx`, `src/features/Progress.tsx`, and metric-consuming portions of `Modules.tsx`, `Results.tsx`, `Exam.tsx`, `Account.tsx`, `components/AIAssistant.tsx`, `AppShell.tsx`, `UI.tsx`, `ProgressMotivation.tsx`, `MediaControls.tsx`, `src/styles.css`, `src/prototype.css`. Keep `src/data.ts` as preserved legacy content; approved fixtures copy reviewed content under a new version. Existing Exam service/timing, assets and canonical external sources stay untouched.

Potential new files: fixture/key data under `src/fixtures/diagnostic/` and `src/fixtures/scoring/`; typed ports/validators/adapters/selectors; provider/metric/migration tests under `qa/`; documentation updates. Exact names, diffs and test-tool dependencies require the later authorization. Root package/lock/configuration changes are outside the minimal plan unless owner separately approves test/tool requirements. Auth provider, server/database, cross-device storage, live question APIs, new content ingestion, AI evaluation, admin/payments and publication remain excluded.

## Gate acceptance record — deliberately unsigned

| Requirement | Current gate status |
|---|---|
| Owner accepts baseline definition versus full future scorecard | BLOCKED; D04 pending |
| Owner accepts local-only learner-scoped prototype evidence, or separately authorizes secure cross-device work | BLOCKED; D05 pending |
| Starter blueprint/keys/provenance and policy approved | BLOCKED; D06/D07 pending |
| Explicit implementation scope authorized | BLOCKED; D03 pending |
| All agreed metric/state/privacy formulas implemented and demonstrated | NOT IMPLEMENTED under this stage |
| Future tests and regressions pass with saved evidence | NOT RUN for the proposed implementation |
| Human acceptance: name/date/evidence/rejected items | NOT RECORDED |
| Separate Stage 2 approval | NOT GRANTED |

No elapsed time, documentation completion, old sample result or automated success may fill this record on the owner's behalf.
