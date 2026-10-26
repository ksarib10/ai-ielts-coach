# Diagnostic fixed fixture and future dynamic source contract

ACCEPTED_REQUIREMENT: initial separate versioned hard-coded source; optional diagnostic; stable per-attempt assignment; later API substitution; no official score claims. All technical shapes here are PROPOSED_DESIGN, not implemented services. STAGE_2_ENTRY = BLOCKED.

## Observed source

`src/data.ts` contains Grammar 6, Vocabulary 6, Reading 5, Listening 5, Writing prompt, Speaking prompt and Familiarity 5: 27 objective items plus two response tasks across seven sections. Objective items contain numeric `answer` indexes in the same public client bundle. `src/features/Diagnostic.tsx` imports this array directly; `src/services/diagnostic.ts` uses it for raw matches and unvalidated band/mastery estimates. AppState version 2 versions storage, not assessment content. There is no diagnostic attempt/assignment ID, immutable served snapshot or source/scorer version pin.

Current Writing requires 180 words to advance, and Speaking submission stores only status/duration; media blob URLs are session-local. In the diagnostic wrapper, the no-microphone fallback marker is reduced to SUBMITTED/duration, so persisted diagnostic state cannot reliably distinguish actual audio from fallback. Duration/status must never become speaking proficiency. A trusted new result needs explicit capture-kind metadata. These gaps are recorded, not repaired here.

## Fixture packaging proposal

Use `src/fixtures/diagnostic/starter-v1.json` (public questions/media references) and a separate development scorer/key module; neither path exists yet. Start from the preserved current content only after owner/content reviewer checks wording, keys, coverage, accessibility and provenance. The approved contract's illustrative questionCount=8 is not a blueprint. The existing 27+2 is an observed inventory, not an automatically approved next blueprint.

Public fixture fields: schemaVersion, assessmentId, assessmentVersion, blueprintVersion, contentDigest, track support, title/instructions, ordered sections and ordered public items, original-source/provenance notices. Stable item IDs and stable option IDs survive label edits only through a new immutable version; an attempt never follows “latest” after starting. Validate unique IDs, supported type, non-empty prompts/options, compatible media, legal key references in the private development map and expected section coverage. A broken/unknown version produces an explicit unavailable state, never a fabricated score.

`contentDigest` hashes a documented canonical serialization of public assessment content (e.g. recursively sorted object keys, array order preserved, UTF-8; strings unchanged). Publish a separate scorer/key digest in internal metadata, not private keys themselves. Store the actual public served snapshot so a digest alone is not mistaken for recoverability.

## Illustrative types, not code to install

```ts
type DiagnosticItem =
  | { questionId: string; skill: string; kind: 'SINGLE_CHOICE'; prompt: string;
      options: { optionId: string; label: string }[] }
  | { questionId: string; skill: 'WRITING'; kind: 'WRITTEN_RESPONSE'; prompt: string;
      minimumWords: number | null }
  | { questionId: string; skill: 'SPEAKING'; kind: 'SPOKEN_RESPONSE'; prompt: string;
      preparationSeconds: number; maximumSeconds: number };
interface PublicDiagnosticAssessment {
  schemaVersion: 1; assessmentId: string; assessmentVersion: string;
  blueprintVersion: string; assignmentId: string; contentDigest: string;
  track: 'ACADEMIC' | 'GENERAL_TRAINING' | 'UNDECIDED';
  questionCount: number; sections: { sectionId: string; itemIds: string[] }[];
  items: DiagnosticItem[]; sourceMode: 'DEVELOPMENT_FIXTURE' | 'SERVER';
}
type DiagnosticResponse =
  | { questionId: string; kind: 'SINGLE_CHOICE'; optionId: string }
  | { questionId: string; kind: 'WRITTEN_RESPONSE'; text: string }
  | { questionId: string; kind: 'SPOKEN_RESPONSE'; captureKind: 'RECORDED' | 'NO_MIC_FALLBACK';
      durationSeconds: number; mediaReference: string | null };
interface DiagnosticAttempt {
  schemaVersion: 1; attemptId: string; learnerId: string; revision: number;
  assessmentId: string; assessmentVersion: string; blueprintVersion: string;
  assignmentId: string; contentDigest: string; scoringPolicyVersion: string;
  servedAssessment: PublicDiagnosticAssessment; itemIds: string[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SKIPPED_OR_DEFERRED' | 'SUBMITTING' | 'SUBMITTED';
  responses: DiagnosticResponse[]; position: { sectionId: string; questionId: string };
  playbackUse: Record<string, { count: number; lastPlayedAt: string | null }>;
  startedAt: string | null; updatedAt: string; submittedAt: string | null;
  recordOrigin: 'LEARNER_ENTERED' | 'ILLUSTRATIVE_SEED' | 'LEGACY_UNVERIFIED';
}
interface DiagnosticSubmission {
  attemptId: string; assignmentId: string; assessmentVersion: string;
  scoringPolicyVersion: string; submittedAt: string;
  validation: 'VALID_RAW' | 'UNSCORED' | 'INVALID' | 'PENDING_REVIEW';
  objective: { skill: string; correct: number; eligibleItems: number;
    percent: number | null; sourceQuestionIds: string[] }[];
  productive: { skill: 'WRITING' | 'SPEAKING'; provided: boolean;
    capturedKind: string; score: null }[];
}
interface DiagnosticQuestionSource {
  loadAssessment(context: { track: PublicDiagnosticAssessment['track']; learnerId?: string }): Promise<PublicDiagnosticAssessment>;
  loadAttempt(attemptId: string): Promise<DiagnosticAttempt | null>;
  saveDraft(attempt: DiagnosticAttempt): Promise<void>;
  submitAttempt(attemptId: string, responses: DiagnosticResponse[]): Promise<DiagnosticSubmission>;
}
```

This preserves the four-method handoff shape. A later implementation may propose explicit createAttempt/revision receipts/cancellation methods for owner approval; saveDraft must verify the authoritative revision and loadAttempt must return it after save. Server identity comes from the session, not trusted `context.learnerId`. MediaReference describes a later approved owned resource, not an upload implemented by this review. The local initial provider may keep mediaReference=null and expose unavailable persistent audio honestly.

## Lifecycle, skip, resume and migration

NOT_STARTED → IN_PROGRESS on first saved attempt; IN_PROGRESS → SUBMITTING only with required-field/type validation; successful durable submission → SUBMITTED. On network/storage/validation failure return to editable IN_PROGRESS with unchanged evidence and explicit operation error. Repeated submit uses the same idempotency key and returns the same result.

NOT_STARTED or IN_PROGRESS may become SKIPPED_OR_DEFERRED. Keep all responses, assignment/version, exact question and playback state; if nothing was assigned, profile participation can be deferred without inventing an attempt. Dashboard stays accessible and readiness remains gated. Proposed default is resume the same question/set; restarting creates a new assignment only after explicit policy/owner approval. No automatic retake or dynamic generation. Submitted records are immutable, and changing goals does not rewrite their track/version.

Old v2 state is retained. A later approved importer can pin to a known legacy snapshot only if its exact content is available, otherwise classify LEGACY_UNVERIFIED. Do not silently copy an old `overall` into a valid raw score, attach today's version to old answers, clear prior progress, or reinterpret skipped as failed. Backup/rollback and decoder tests precede any migration.

## Future API examples — NOT endpoints that work

| Suggested request | Meaning / ownership rule |
|---|---|
| GET `/api/v1/diagnostics/assignment?track=ACADEMIC` | Read already allocated owned assignment; refresh cannot rotate items |
| POST `/api/v1/diagnostics/assignments` | Explicit future allocation, only if accepted; track validated server-side |
| POST `/api/v1/diagnostics/attempts` | Create an owned attempt for assignmentId; no client score inputs |
| GET `/api/v1/diagnostics/attempts/{attemptId}` | Return only authorized public snapshot and draft |
| PATCH `/api/v1/diagnostics/attempts/{attemptId}` | Versioned draft response/position update, revision/If-Match conflict handling |
| POST `/api/v1/diagnostics/attempts/{attemptId}/submit` | Idempotent finalize; body only version/digest/responses, server checks original assignment |

Example public payload (two illustrative items, NOT canonical content):

```json
{"schemaVersion":1,"assessmentId":"starter-diagnostic","assessmentVersion":"fixture-v1","blueprintVersion":"illustration-only","assignmentId":"dev-assignment-example","contentDigest":"illustrative-not-a-real-hash","track":"UNDECIDED","questionCount":2,"sections":[{"sectionId":"reading","itemIds":["example-r1","example-r2"]}],"items":[{"questionId":"example-r1","skill":"READING","kind":"SINGLE_CHOICE","prompt":"Illustration only","options":[{"optionId":"a","label":"Option A"},{"optionId":"b","label":"Option B"}]},{"questionId":"example-r2","skill":"READING","kind":"SINGLE_CHOICE","prompt":"Second illustration","options":[{"optionId":"a","label":"Option A"},{"optionId":"b","label":"Option B"}]}],"sourceMode":"DEVELOPMENT_FIXTURE"}
```

Example result fragment, from a separately validated five-item fixture: `correct=2, eligibleItems=5, percent=40`; two wrong and one unanswered still remain in denominator five under the proposed policy. The two-item illustration above is not the source of that five-item example. Missing/invalid key means validation INVALID and percent=null; a genuine all-wrong valid submitted attempt may be 0%. Grammar/vocabulary/familiarity raw percentages are separate dimensions, never averaged into an IELTS band. Writing word count and recording presence are completion observations only.

## Security and acceptance

Future public payload must contain no hidden answer, correctOptionId, private rubric, secret scorer or pre-submit explanation. Local bundled development keys are inspectable and must be labeled; do not describe the local client as secure test delivery. Validate unknown/duplicate item IDs, response type, option membership, assignment subject, revision/digest/version, invalid key maps, timeout/retry and no-microphone fallback. Score only once after durable submission and approved key policy; do not trust client `correct` fields.

The same provider contract tests must run against fixture and later API test doubles; swapping adapters must not rewrite screens. Tests T01–T12/T22–T26 in the [acceptance plan](DASHBOARD_ACCEPTANCE_TEST_PLAN.md) define reproducibility, skip/resume, invalid-source and privacy checks. These are future acceptance criteria, not newly passing implementation tests. Fixture wording/key/blueprint review, persistence/retake/media policy and local-only gate sufficiency need owner decisions D05/D06/D07.
