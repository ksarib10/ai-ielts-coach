# Feature registry

## IELTS About content integration — 2026-10-28, Content Pack v1.1

All nine `/ielts-about/:topicId` routes (`what-is-ielts`, `academic-general`, `test-format`, `sections-duration`, `bands`, `registration-test-day`, `computer-paper`, `accessibility`, `faqs`) now render structured, source-linked educational content from static versioned JSON (`src/content/ielts-about/`). All 66 prepared starter highlights are represented across their intended pages, and `/ielts-about/test-format` includes four WAI-ARIA skill tabs (`Listening | Reading | Writing | Speaking`) with six expandable Listening question types and eleven expandable Academic Reading question types from `test-format-question-types.json`. General Training Reading question-type details remain explicitly disclosed as pending verification so Academic Reading details are not mislabelled. The 2026 paper-delivery transition and IELTS Online policies carry prominent verification notices, and `bands` explicitly states that educational score-reporting explanations do not validate platform scores. Content remains tagged `DRAFT_PARAPHRASE_OWNER_REVIEW_REQUIRED`; `REFERENCE_PENDING` catalog metadata is preserved until owner editorial and visual acceptance. No raw CSV archive, source-review folders or manifests are bundled into the client.

---

## Presentation quality delta — 2026-10-28, theme remediation

Theme-only correction for F03/F05–F10/F12/F13/F16 and shared public/onboarding/settings surfaces: legacy colors now consume semantic roles; existing routes, actions, engines, data and feature availability are unchanged. Full disposable Exam setup/seven sections/combined result and diagnostic/shared states were browser-inspected in dark/light at 1440/390/320px. Nine-suite regression, TypeScript and production build PASS. This is tested presentation, not new assessment validity, secure identity, calibrated readiness, content availability or owner acceptance. Exact boundaries/limitations: [report](reviews/stage-1b/theme-consistency/THEME_CONSISTENCY_REMEDIATION_REPORT.md). M01–M11 gate unchanged, M12–M17 unavailable, Stage2 blocked.

---

## Current implementation-status delta — 2026-10-28, Slice 2

This dated entry supersedes the affected Slice 1 descriptions below. **Implemented/tested does not mean owner-accepted; Slice 2 acceptance PENDING.**

| Feature | Slice 2 implementation | Evidence / remaining boundary |
|---|---|---|
| F12 Learn | Ten typed category cards; Vocabulary/Grammar connect existing samples; eight collections Coming soon | All ten destinations checked; no CSV/Excel/resource bank imported |
| F05–F08 skills | Six shared cards per hub; existing sample links, practice gates, retained libraries | All 24 card targets checked; full tests/models/simulation/tips remain unavailable where absent |
| IELTS information | Nine IELTS About topics and four distinct scoring-reference screens | Actual pending screens checked; no unverified official policy/descriptors or scoring validity claims |
| F13 Progress/Readiness | Overview/Readiness tabs, canonical child path, old alias | Both routes/redirect checked; existing null/unsupported states unchanged |
| F09/F10 assessment | Complete IELTS Exam display name; existing Mock Tests reachable within skills | Engine/service unchanged, historical Exam suite passes; no new full Exam implementation |
| F16 shell | Ten links in four groups; persistent accessible Development Preview disclosure | Both themes, responsive layout, visible keyboard focus, drawer/Escape/three resize cycles; mobile disclosure clipping fixed |
| F03/F04 diagnostic/dashboard | Preserved existing behavior and truthful unavailable metrics | Saved G1 B skip/save/resume observed; no assessment or metric acceptance implied |
| F15 Coach/auth identity | Scripted Coach and shared-device sign-in explicitly disclosed | Existing destination/function retained; strict timed Writing has no Coach launcher; no real AI/auth added |

Catalog-specific SAMPLE means an existing short sample, PLANNED means Coming soon, REFERENCE_PENDING means no verified reference content. These are UI metadata states, not replacements for the M01–M11 metric availability model. Diagnostic V1 remains unapproved; all 15 baseline metrics await later genuine implementation and human acceptance, M12–M17 remain unavailable, Stage 2 remains blocked. [Slice 2 evidence](reviews/stage-1b/slice-2/SLICE_2_IMPLEMENTATION_REPORT.md).

---

## Current implementation-status delta — 2026-10-27

This file is the authoritative feature/status register. The dated Stage 1A inventory below is preserved as history; this delta supersedes its affected implementation descriptions. Implemented, tested and owner-accepted are separate states. **No Slice 1 feature is owner-accepted yet.**

| Feature | Implemented in authorized Slice 1 | Actual testing | Acceptance / remaining boundary |
|---|---|---|---|
| F01/F02 public and onboarding | Appearance controls; honest demo and diagnostic-validation wording | Browser restored existing step6, skip-to-dashboard, saved goal; historical state suite | Production identity/recovery and undecided-track work remain future |
| F03 diagnostic | Existing engine preserved; result route now shows legacy participation/validation status | Saved G1 answer resumed; strict header checked; historical diagnostic suite | Candidate bank inactive; scoring/capture/assignment validity not approved |
| F04 dashboard | Read-only saved goals/participation; explicit availability for 15 baseline IDs and six future exclusions | Pure adapter/component tests, browser desktop/mobile | All 15 metric definitions still need later implementation and human acceptance; rendering is not metric acceptance |
| F05–F08 modules / F12 learning | Four hubs show Not assessed; saved goals retained; lesson mastery percentage removed; prototype lock/suggestion copy corrected | All hubs desktop and Reading 320px; pure shared-status tests; historical service suites | Engines, practice gates, scores and records unchanged; no new module features |
| F09/F10 tests and Exam | Shared shell/theme only; independent assistance-disabled policy preserved | Historical Exam/mode regressions; focused strict-shell rendering | Full browser Exam completion not rerun; result models remain legacy demonstrations |
| F13 progress/readiness | Safe history metadata, empty/retry states; no heuristic trends, bands, CEFR or readiness scores | Unit states and browser route inspection | M12–M17 UNSUPPORTED/null; no assessment or readiness acceptance |
| F14 gamification | No achievement/streak percentages promoted into new dashboard | Null/gating tests | Durable scoped events, timezone and validated activity statistics remain pending |
| F15 Coach | Explicit demo navigation and scripted-sample notice; omitted on overview and strict screens | Navigation/component and existing mode tests | No AI service or automated proficiency evaluation |
| F16 theme/shell | Purple light/dark/system, separate preference, responsive drawer and honest navigation | Seven-suite run, contrast tests, theme persistence, drawer/account Escape, five viewport widths | Provisional tokens; human and broader accessibility acceptance outstanding |
| TED/AWL/Grammar/Curriculum | COMING_SOON non-links | Typed navigation/static rendering | No new routes or engines |

M01–M11 formulas and IDs remain governed by the accepted Stage 1A metric matrix. Slice 1 exposes saved preference/participation where readable and keeps unimplemented metrics null; unknown is not zero. D04/D05 scope approval does not validate the prototype's heuristic math. Stage 2 remains blocked. Future route, data, architecture and feature-state changes must update this register and appropriate other living documents within the same slice.

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

2026-10-23. ACCEPTED_REQUIREMENT: F01–F18 are approved vision. Status below describes current evidence, not delivery permission. STAGE_2_ENTRY = BLOCKED.

Availability vocabulary: AVAILABLE = functioning capability with relevant tests within its declared scope; COMING_SOON = real destination but capability absent; REQUIRES_VALID_DIAGNOSTIC = derived metric lacks reviewed submitted evidence; EMPTY = successful retrieval with no real records; IN_PROGRESS = active real attempt/activity; TEMP_UNAVAILABLE = operational error; PROPOSED/RESEARCH_ONLY = no working destination. These proposed registry values are not implemented centrally today. A tested mock can be available only as an explicitly labeled demo, never as production authentication/AI/scoring.

| ID | Domain / current status | Current route / reserved proposal | Observed behavior and implemented files | Tests / evidence | Dependencies / accountable owner |
|---|---|---|---|---|---|
| F01 | Public/account; MOCK_OR_DEV_ONLY | /; /login; /signup; /forgot-password; /settings | Local forms/session exist; credentials unverified; no recovery email. `src/features/Public.tsx; src/services/session.ts` | qa/state.test.mjs; public browser smoke | Session contract, approved secure provider later; Frontend/auth owner unassigned |
| F02 | Onboarding; OBSERVED_SOURCE | /onboarding | Six saved screens and migration; undecided track missing. `src/features/Onboarding.tsx; src/state.ts` | qa/state.test.mjs; source validation rules | Accepted field schema; migration approval; Frontend owner unassigned |
| F03 | Diagnostic; OBSERVED_SOURCE | /diagnostic; /diagnostic/results | Seven sections and skip/resume; no assignment version; heuristic result. `src/features/Diagnostic.tsx; src/data.ts; src/services/diagnostic.ts` | qa/diagnostic.test.mjs; qa/state.test.mjs | Reviewed fixture/scorer/attempt contract; Assessment/content owner unassigned |
| F04 | Dashboard; MOCK_OR_DEV_ONLY | /dashboard | Goals/real local events mixed with provisional estimates and fixture/demo flows. `src/features/Learning.tsx; src/components/ProgressMotivation.tsx` | qa/domain.test.mjs; qa/readiness.test.mjs | Owner metric definition and Stage 1B acceptance; Frontend/product owner |
| F05 | Exam Simulation; MOCK_OR_DEV_ONLY | /exam; /exam/setup; /exam/attempt/:attemptId; /exam/result/:attemptId | Working shortened simulation preserved; no official paper/calibrated score. `src/features/Exam.tsx; src/services/exam.ts` | qa/exam.test.mjs; qa/ielts-reference.test.mjs | Licensed content, audited real engine later; Assessment owner unassigned |
| F06 | Module Tests; MOCK_OR_DEV_ONLY | /mock-tests; /{module}/test/:id | Independent short samples and actual saved attempts. `src/features/Exam.tsx; src/features/Modules.tsx` | qa/domain.test.mjs; source strict policies | Real module content/evaluation later; Assessment owner unassigned |
| F07 | IELTS practice; MOCK_OR_DEV_ONLY | /practice; /practice/activity-library; /{module}/practice/:id | Reusable formats and original samples; personalized baseline lock. `src/components/ActivityRenderer.tsx; src/features/ActivityLibrary.tsx; src/features/Modules.tsx` | qa/domain.test.mjs; source route locks | OT/PT source ownership and scoring contracts; Content owner unassigned |
| F08 | TED learning; FUTURE | PROPOSED /ted; /ted/:talkId | No TED route/provider or six-talk dataset located in current project. `none` | none | Dataset/media rights and normalization audit; Content owner unassigned |
| F09 | Academic Word List; FUTURE | PROPOSED /awl | 570-family target accepted; full dataset/UI absent. `none` | none | Dataset quality/rights and learning design; Content owner unassigned |
| F10 | Vocabulary resources; MOCK_OR_DEV_ONLY | /saved; /vocabulary; PROPOSED /vocabulary/resources | Saved-word flashcards and four dictionary samples; not full vocabulary library. `src/features/Account.tsx; src/data/fixtures.ts` | qa/domain.test.mjs | Dictionary/source rights and metadata; Content owner unassigned |
| F11 | Grammar/resources; MOCK_OR_DEV_ONLY | /learn; PROPOSED /grammar; /resources | Short sample lessons; not a complete grammar/resource curriculum. `src/data/fixtures.ts; src/features/Learning.tsx` | qa/domain.test.mjs | Content plan/quality/rights; Content owner unassigned |
| F12 | Curriculum/notes; MOCK_OR_DEV_ONLY | /learn/:id; PROPOSED /curriculum; /notes | Eleven sample lessons; full sequencing/notes absent. `src/features/Learning.tsx; src/data/fixtures.ts` | qa/domain.test.mjs | Approved curriculum/notes contracts later; Learning owner unassigned |
| F13 | Progress/analytics; BLOCKED | /progress; /readiness; /dashboard | Local history works; heuristic bands/readiness fail new validity/acceptance gate. `src/features/Progress.tsx; src/services/platform.ts; src/services/readiness.ts` | qa/domain.test.mjs; qa/readiness.test.mjs test prototype math only | D04/D05; separate Stage 1B; human acceptance; Owner is final acceptor |
| F14 | Gamification; FUTURE | dashboard widgets; future quest destinations TBD | Streak/activity widgets exist; quests/points/badges/unlocks not implemented. `src/components/ProgressMotivation.tsx; src/services/platform.ts` | qa/domain.test.mjs for existing activity math | Authentic event contract; points never proficiency; Product owner |
| F15 | AI Coach; MOCK_OR_DEV_ONLY | /ai-coach | Rule-based sample replies; no AI model, STT or calibrated evaluation. `src/components/AIAssistant.tsx; src/services/platform.ts` | qa/domain.test.mjs checks strict no-assistance | Reliability/privacy/bias review and separate AI scope; AI owner unassigned |
| F16 | Accessibility/localization/themes; PROPOSED_DESIGN | shared routes; /settings | Responsive/large-text/Uzbek sample support; no dark theme/full localization. `src/styles.css; src/prototype.css; src/components/UI.tsx` | Historic QA plus limited fresh smoke; no new a11y certification | Both-theme keyboard/responsive acceptance; Design/a11y owner unassigned |
| F17 | Content administration; FUTURE | CONDITIONAL PROPOSED /admin | Not implemented or initially authorized. `none` | none | Roles, server authorization, publishing gate; Owner separate approval |
| F18 | Plans/payments; FUTURE | CONDITIONAL PROPOSED /plans | Not implemented or initially authorized. `none` | none | Business/provider/security/payment approval; Owner separate approval |

No production feature is marked delivered by this table. Preserve all existing prototype routes while planning future availability. Any future source registry must record featureId, route, availability, reason, evidence/test IDs and owner, and must not infer availability from a non-empty mock fixture.

See [reuse matrix](reviews/stage-1a/PROTOTYPE_REUSE_MATRIX.csv), [architecture](reviews/stage-1a/ARCHITECTURE_AND_ROUTES_PROPOSAL.md), and [metric matrix](reviews/stage-1a/PERSONALIZED_DASHBOARD_METRIC_MATRIX.csv).
