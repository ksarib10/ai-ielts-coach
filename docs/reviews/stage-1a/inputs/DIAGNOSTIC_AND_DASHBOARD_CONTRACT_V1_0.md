# Diagnostic & Personalized Dashboard — Pre-implementation Contract V1.0

**Status:** APPROVED PRODUCT BEHAVIOR / PROPOSED TECHNICAL CONTRACTS. No implementation authorized.  
**Important owner gate:** Do not begin Stage 2 before personalized dashboard statistics are implemented **and accepted**. The pre-Stage-2 implementation mechanism needs separate authorization; Stage 1A only designs and investigates it.

## A. Diagnostic: initial and future question delivery

The first diagnostic uses a **hard-coded, versioned fixture** chosen for demo/development. This must be a separate content source such as `fixtures/diagnostic/starter-v1.json` with provenance and validated response keys, not inline JSX and not a false production backend. Scoring policy and answer keys belong outside display components. Each saved attempt must pin `assessmentId`, `assessmentVersion`, question identifiers, and the served question set so results are reproducible.

Proposed interface (framework-neutral; signatures for design only):

```ts
interface DiagnosticQuestionSource {
  loadAssessment(context: { track: 'ACADEMIC' | 'GENERAL_TRAINING' | 'UNDECIDED'; learnerId?: string }): Promise<PublicDiagnosticAssessment>;
  loadAttempt(attemptId: string): Promise<DiagnosticAttempt | null>;
  saveDraft(attempt: DiagnosticAttempt): Promise<void>;
  submitAttempt(attemptId: string, responses: DiagnosticResponse[]): Promise<DiagnosticSubmission>;
}
```

Future provider may use a **versioned backend endpoint**, for example `GET /api/v1/diagnostics/assignment` to allocate a server-owned assessment and `POST /api/v1/diagnostics/attempts/{attemptId}/submit` for final answers. These paths are *suggestions*, not working routes or approved infrastructure. Randomization/rotating item banks need per-attempt immutable assignments, user-appropriate policy and source/test ownership. Do not transmit private scoring keys as part of a public question payload. Hard-coded v1 result computation can be a clearly isolated development scoring adapter and must never imply secure official IELTS certification.

### Public assessment candidate shape

```json
{
  "assessmentId": "starter-diagnostic",
  "assessmentVersion": "fixture-v1",
  "assignmentId": "dev-assignment-001",
  "track": "ACADEMIC",
  "questionCount": 8,
  "items": [
    {"questionId":"rdg-001","skill":"READING","type":"SINGLE_CHOICE","prompt":"Illustrative question only","options":[{"optionId":"a","label":"Option A"},{"optionId":"b","label":"Option B"}]}
  ]
}
```

Examples are **contract illustrations**. They are not the user's actual canonical questions, and the number 8 is not an approved test blueprint. Valid item types, skill coverage, difficulty, time, rubrics and wording must be confirmed. Client payloads must not include hidden answer keys. Use a separate result-scoring policy when a valid source key exists.

### Attempt lifecycle

`NOT_STARTED → IN_PROGRESS → SUBMITTED` and `NOT_STARTED/IN_PROGRESS → SKIPPED_OR_DEFERRED`. A skipped learner can access the dashboard, complete their profile, navigate, and start/resume under an explicit policy (exact resume/restart distinction pending confirmation). A successfully submitted diagnostic can produce only validated, supported derived metrics. No invented band or overall IELTS readiness grade.

## B. Personalized dashboard statistics: source-of-truth plan

A metric must have stable `metricId`, title, definition, numerator/denominator or algorithm, source events/records, required sample size, timestamp, privacy constraints, stale-data policy, fallback and tests. Never compute a progress metric from navigation clicks unless explicitly defined as such.

| Metric candidate | Acceptable real input | Legitimate availability | Important caveat |
|---|---|---|---|
| Profile completion | Saved learner profile fields | Profile exists | Not IELTS proficiency |
| Diagnostic state | Real per-learner saved attempt | Attempt exists | Skipped ≠ failed |
| Diagnostic answered count | Persisted attempt responses | Attempt in progress | Count is not a score |
| Diagnostic per-skill raw accuracy | Valid answer key and submitted attempt | Valid scored items per skill | Not an IELTS band estimate |
| Diagnostic response review | Item-level results from valid policy | Scorer and source approved | Separate practice vs official scoring |
| Learning activity count | Real logged completed events | Event capture/persistence available | Distinguish practice from mock exam |
| Weekly active study days | Real timestamped learner activity | At least one event captured | Define timezone and dedupe |
| Skill trend | ≥2 comparable valid scored attempts | Sufficient consistent assessments | Do not draw trends from a single attempt |
| Readiness estimate | Independently validated calibration/scoring model | Separately certified metric | **Remain gated until validation** |
| AI-recommended next activity | Verified recommendation engine and evidence | Future authorization | Do not fabricate |

**Operational definition open:** The owner's phrase “complete personalized dashboard statistics” may mean all valid currently-computable personalized metrics, or a future complete platform scorecard. Stage 1A shall present an explicit metric-by-metric acceptance checklist with two categories: (1) real, demonstrable baseline statistics that can be completed before Stage 2 with the separately approved prerequisite implementation, and (2) unavailable future metrics that remain intentionally gated. Request owner sign-off on this definition before any Stage 1B/Stage 2 work. Do not silently shrink the gate.

## C. Dashboard API candidate (NOT approved endpoint)

```json
{
  "learnerId": "example-id",
  "profile": {"ieltsTrack":"ACADEMIC","targetBand":null},
  "diagnostic": {"state":"SKIPPED_OR_DEFERRED","assessmentVersion":null,"completedAt":null},
  "metrics": [
    {"metricId":"diagnostic-skill-accuracy","state":"REQUIRES_VALID_DIAGNOSTIC","value":null,"unit":"percent","sourceRecordIds":[],"computedAt":null}
  ],
  "nextAction": {"kind":"START_DIAGNOSTIC","enabled":true},
  "featureAvailability": []
}
```

Do not confuse the shape above with proof that a backend or analytics engine exists. Preserve `null` for uncomputed values; never insert zero as a synonym for unknown. No frontend persistence mechanism should be described as secure authenticated multi-device storage without appropriate backend.

## D. Test and acceptance criteria for a future separately authorized implementation

1. Diagnostic loads from its fixture provider, not hard-coded rendered text; it can swap to an API adapter without rewriting UI components.
2. Every attempt pins assignment/version and question set, and resumes deterministically.
3. Skip and resume behavior is correct; profile/dashboard navigation remains accessible.
4. Only data-backed statistics render; missing/invalid source shows accurate empty/gated/error status.
5. Metrics have documented formulas and test fixtures; invalid answer keys or missing events cannot generate a score.
6. No invented IELTS band/readiness, no fabricated trends, no AI evaluation.
7. Real persistence and user authorization semantics are demonstrable for any claim of cross-session or per-user history.
8. Unit, integration and browser tests, keyboard/focus check, both theme states and route smoke tests pass.
9. All seven documentation files updated with committed code paths, decisions, contracts and known limitations.
10. **Human acceptance** of dashboard-statistics scope and observed outputs is recorded before Stage 2 entry.

The exact implementation sequence is unresolved because Stage 1A forbids coding but the owner requires this work before Stage 2. Stage 1A must propose an explicit Stage 1B (or revised numbering) and STOP for approval.
