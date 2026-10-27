# Data contracts

## Slice 2 UI metadata boundary — 2026-10-28

`src/features/discovery/types.ts` defines CatalogEntry, LearnCategory/actions, SkillActivity/SkillTarget and CatalogSource. The metadata service supplies only titles, descriptions, icons, local availability and existing-route targets. Routes/builders live separately from rendering. CatalogSource is a **local UI metadata seam**, not a finalized content-record, backend or database contract. No CSV rows, Oxford bank, external media, answer keys or candidate scripts are imported. Future normalized records/API adapters still require their own approved source/schema/provider work.

SAMPLE, PLANNED and REFERENCE_PENDING apply only to catalog availability. Runtime presentation translates these to Sample available, Coming soon or Reference pending; the existing practice guard can show Assessment required. This does not alter accepted metric formulas, IDs, availability envelopes, eligible denominators or assessment meaning.

All learner stores/keys, AppState/domain types, scoring/services, diagnostic source/order/capture, Exam timing and workspace engine remain unchanged. Only existing profile track and baseline-presence predicate are read for Task 1 routing and practice-label accuracy. No catalog persistence, migration, random assignment or provider network call is added. Existing legacy bundled marking remains inspectable; no secure production assessment claim is made. D06/D07 and all 15 baseline-metric acceptance work remain open.

---

## Implemented Slice 1 boundaries — 2026-10-27

Only presentation/appearance contracts were added. `features/appearance/types.ts` defines light/dark/system preference and resolved appearance; `services/preference.ts` reads/writes only `ielts-appearance-v1`. Storage denial returns system/default or memory-only selection with feedback. No learner record, diagnostic answer, media or attempt format is changed.

`features/dashboard/types.ts` defines SavedPresentation, SavedHistory and MetricPresentation. `services/presentation.ts` is a **read-only** adapter over the existing master/legacy keys and learning-history key. It validates readable preference/participation fields, excludes legacy result scores, retains null for unknown values, distinguishes missing data from parse/storage errors and exposes only history id/module/mode/submission time. It performs no saves, resets, migration, scoring or achievement calculation. Saved goals are self-declared targets, not assessed bands.

Implemented presentation states: AVAILABLE, EMPTY, IN_PROGRESS, REQUIRES_VALID_DIAGNOSTIC, TEMP_UNAVAILABLE, UNSUPPORTED. All 15 M01–M11 IDs remain represented, but this adapter is not the accepted metric engine. Only readable saved track/goal and legacy participation are surfaced; validated answer count, five accuracies, review, capture and activity metrics remain gated or unsupported. M12–M17 are UNSUPPORTED with value=null. Existing AppState v2, device-wide keys, scoring, Speaking persistence and Exam contracts remain byte-preserved.

`features/shell/types.ts` and navigation service use AVAILABLE/COMING_SOON with explicit Demo metadata and null paths for future destinations. These local UI contracts do not implement the proposed LearnerRepository, DiagnosticQuestionSource or authenticated DashboardProvider below. Future API-backed replacements still require approved immutable assignments, version/digest/scoring policies, learner ownership and recovery contracts. Diagnostic Step 2A V2 files are candidate review documentation only, not imported into app/public assets. Development answer keys are inspectable if bundled; existing legacy fixtures are not secure production marking.

Local demo sign-in remains a shared-device session, not learner isolation, credential verification or cross-device synchronization. D05 permits future learner-scoped local development; it does not imply that migration/isolation was implemented here. D06 content/media/retakes and D07 timezone/privacy/retention/migration remain unresolved. No backend endpoint, environment secret or SDK was introduced.

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

2026-10-23. All interfaces below are PROPOSED_DESIGN documentation, not new application types or working endpoints. ACCEPTED_REQUIREMENT: separate versioned fixture now, replaceable API provider later, optional diagnostic and valid evidence only. STAGE_2_ENTRY = BLOCKED.

## Observed contracts and migration boundary

`src/types.ts` has AppState.version=2, profile, six-step onboarding, diagnostic status/position/number-indexed answers, Writing text, Speaking status/duration, nullable results and legacy progress. `src/domain.ts` has content blocks, activities, drafts, attempts, activity events and Exam sessions. `src/state.ts` reads the master key or legacy keys and migrates shallow/deep defaults. `src/services/platform.ts` owns a second local store and mock content/AI/recommendations. No learnerId scopes these stores.

Observed keys: aiIELTSCoach, ai_ielts_user_profile, ai_ielts_onboarding_state, ai_ielts_diagnostic_state, ai_ielts_results, ielts-learning-v2, ielts-demo-session; optional ielts-reminders/ielts-large-text. These names are not secrets. No stored personal learner values were read. Never wipe a store merely because a new schema fails validation. Preserve unrecognized/legacy records, report recovery and require approved migration/export before replacing anything. Existing sequence writes are not a cross-key transaction.

## Proposed identity, providers and stores

```ts
type Track = 'ACADEMIC' | 'GENERAL_TRAINING' | 'UNDECIDED';
type RecordOrigin = 'LEARNER_ENTERED' | 'ILLUSTRATIVE_SEED' | 'LEGACY_UNVERIFIED';
type SourceMode = 'DEVELOPMENT_FIXTURE' | 'SERVER';
type SessionState =
  | { status: 'CHECKING' | 'ANONYMOUS' }
  | { status: 'AUTHENTICATED'; subjectId: string; mode: 'DEMO' | 'SERVER' }
  | { status: 'ERROR'; error: OperationError };
interface LearnerProfileV1 {
  schemaVersion: 1; learnerId: string; revision: number; updatedAt: string;
  displayName: string; studyContext: string; track: Track;
  targetBand: number | null; plannedExamDate: string | null;
  dailyStudyMinutes: number; englishVariant: 'UK' | 'US';
  explanationLanguage: 'en' | 'uz' | 'en-uz'; timeZone: string;
  onboarding: { version: string; stepId: string; complete: boolean };
}
interface OperationError {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR'
      | 'VERSION_UNAVAILABLE' | 'CONFLICT' | 'STORAGE_UNAVAILABLE'
      | 'RATE_LIMITED' | 'TEMP_UNAVAILABLE';
  message: string; retryable: boolean; requestId: string;
  fieldErrors?: { field: string; code: string; message: string }[];
}
```

Seven-field profile completion proposal uses displayName, studyContext, track, dailyStudyMinutes, englishVariant, explanationLanguage and timeZone. Goal/date remain optional and do not falsely reduce proficiency. Bounds/enum/date validation are explicit and versioned; target, if present, must be an allowed half-band value. Final field list/timezone defaults need D05/D07 approval.

Provider boundaries: SessionPort (read/subscribe/sign-in/sign-out/recovery); LearnerRepository (load/save with revision); DiagnosticQuestionSource (assignment+attempt lifecycle); DiagnosticScorer (separate development raw scorer versus future server submission); ActivityRepository (append/deduplicate/list); DashboardProvider (summary with provenance); ContentProvider (read-only original/approved content); FeatureAvailabilityPolicy (capability status). Demo adapters never masquerade as secure services. Prefer existing useSyncExternalStore/subscriptions plus feature hooks and pure selectors; introduce a server cache only when actual network state requires it.

## Diagnostic and scoring

Every attempt pins assessmentId, assessmentVersion, assignmentId, blueprintVersion, public content digest, exact item IDs/order and scoringPolicyVersion. Persist the served public snapshot; never resume against a moving global array. Responses use stable questionId and optionId, not option indexes. Detailed item unions, lifecycle, submission and future endpoint shapes are in the [diagnostic proposal](reviews/stage-1a/DIAGNOSTIC_DYNAMIC_SOURCE_CONTRACT_PROPOSAL.md).

Local fixtures cannot keep bundled scoring keys secret. Label development scoring as such; isolate the key map from components. Future public assignment payloads must omit answer/correctOptionId/scoring keys, hidden rubrics and pre-submit explanations. Server scorer validates subject ownership, assigned items, version/digest, response types and source key integrity. Writing/Speaking completion evidence has score=null without calibrated assessment. Submitted ≠ validated, and raw percent ≠ IELTS band/CEFR/readiness.

## Activity and metrics

```ts
interface ActivityEventV1 {
  schemaVersion: 1; eventId: string; learnerId: string;
  eventType: 'LESSON_COMPLETED' | 'ATTEMPT_SUBMITTED';
  activityKind: 'LESSON' | 'MODULE_PRACTICE' | 'MODULE_TEST' | 'EXAM_SECTION' | 'DIAGNOSTIC';
  referenceId: string; occurredAt: string; timeZone: string;
  recordOrigin: RecordOrigin; hasLearnerEvidence: boolean;
  activeDurationMs: number | null; captureVersion: string;
}
type MetricState = 'AVAILABLE' | 'EMPTY' | 'REQUIRES_VALID_DIAGNOSTIC'
  | 'IN_PROGRESS' | 'TEMP_UNAVAILABLE' | 'UNSUPPORTED' | 'STALE';
interface MetricEnvelopeV1 {
  metricId: string; definitionVersion: string; state: MetricState;
  value: number | string | null; unit: string | null;
  sourceRecordIds: string[]; computedAt: string | null;
  sourceUpdatedAt: string | null; limitations: string[];
  recordOrigin: RecordOrigin; historyCompleteSince: string | null;
}
```

Events are emitted from successful durable completion/submission, not navigation, audio-play clicks or timer ticks. Deduplicate eventId and (learnerId,eventType,referenceId), filter future/invalid timestamps, and exclude illustrative seeds, unverified legacy imports and no-content fallback attempts from learning counts. Preserve excluded history for review. No speaking audio bytes, response text or credentials in analytics events. Existing nominal lesson minutes/capped attempt elapsed seconds are not measured active study time.

The [metric matrix](reviews/stage-1a/PERSONALIZED_DASHBOARD_METRIC_MATRIX.csv) is the formula authority. Baseline proposal M01–M11 is pending approval. M12–M17 remain future/gated. A known zero is valid only for a loaded, complete tracked history since its declared start; an unavailable store or unknown historical coverage is null. Cache invalidates on profile, attempt, key-policy, event or timezone revision; a local successful recomputation gets a timestamp. Future cached server summaries older than proposed 15 minutes are STALE, retain source date and cannot satisfy acceptance until refreshed; TTL is a draft policy, not current code.

Proposed summary/availability boundary:

```ts
interface FeatureAvailabilityV1 {
  featureId: string; route: string | null;
  state: 'AVAILABLE' | 'COMING_SOON' | 'REQUIRES_VALID_DIAGNOSTIC'
    | 'EMPTY' | 'IN_PROGRESS' | 'TEMP_UNAVAILABLE' | 'PROPOSED_RESEARCH_ONLY';
  reasonCode: string; evidenceIds: string[]; mode: 'DEMO' | 'SERVER';
}
interface DashboardSummaryV1 {
  schemaVersion: 1; learnerId: string; revision: string;
  profile: LearnerProfileV1;
  diagnostic: { state: DiagnosticAttemptStatus; attemptId: string | null;
    assessmentVersion: string | null; validation: string | null };
  metrics: MetricEnvelopeV1[];
  nextAction: { kind: 'COMPLETE_PROFILE' | 'START_DIAGNOSTIC' | 'RESUME_DIAGNOSTIC'
    | 'REVIEW_DIAGNOSTIC' | 'BROWSE_AVAILABLE_LEARNING'; route: string; enabled: boolean };
  featureAvailability: FeatureAvailabilityV1[];
  sourceMode: SourceMode; computedAt: string;
}
```

`DiagnosticAttemptStatus` means the five-state union in the diagnostic proposal. The summary is a typed view model; it need not imply an HTTP service. FeatureId must reference F01–F18; metricId must reference the matrix, never a title string. Available demo functionality remains explicitly DEMO.

Illustrative skipper fragment (not a full summary or a working endpoint):

```json
{"schemaVersion":1,"learnerId":"example-local-learner","sourceMode":"DEVELOPMENT_FIXTURE","diagnostic":{"state":"SKIPPED_OR_DEFERRED","attemptId":null,"assessmentVersion":null,"validation":null},"metrics":[{"metricId":"M05-READING","definitionVersion":"proposal-v1","state":"REQUIRES_VALID_DIAGNOSTIC","value":null,"unit":"percent","sourceRecordIds":[],"computedAt":null,"sourceUpdatedAt":null,"limitations":["No valid submitted result"],"recordOrigin":"LEARNER_ENTERED","historyCompleteSince":null}],"nextAction":{"kind":"START_DIAGNOSTIC","route":"/diagnostic","enabled":true},"featureAvailability":[]}
```

Error illustration: `{ "code": "STORAGE_UNAVAILABLE", "message": "Your draft is still open; retry saving before leaving.", "retryable": true, "requestId": "example-redacted-id" }`. Neither an error nor a pending request may be replaced with a successful empty response or a made-up zero metric.

## Future API illustration and security boundary

Candidate only: GET /api/v1/session, GET/PATCH /api/v1/me/profile, GET /api/v1/diagnostics/assignment, GET/PATCH /api/v1/diagnostics/attempts/{attemptId}, POST /api/v1/diagnostics/attempts/{attemptId}/submit, GET /api/v1/me/dashboard, GET /api/v1/me/activity?cursor=... . No endpoint was created or called.

Prefer server-managed secure/HttpOnly/SameSite cookies with CSRF protection for later web auth, subject to provider review; never put access/refresh secrets in localStorage. Authorize each record on the server, do not trust a client learnerId, return redacted errors and protect learner summaries with private/no-store policies. Version conflicts use 409, validation 422, unauthenticated 401, forbidden 403 or non-enumerating 404 per policy, unavailable 503. Idempotency keys prevent duplicate submissions; retry must not invent a successful save. No live service, auth provider, SDK, database or OpenAI API integration is authorized.

Privacy decisions pending: local-only versus secure per-user/cross-device scope, learner timezone, response/media retention/export/deletion, minors/consent and content rights. Cross-device history needs later authenticated storage. See [decisions](DECISIONS.md).
