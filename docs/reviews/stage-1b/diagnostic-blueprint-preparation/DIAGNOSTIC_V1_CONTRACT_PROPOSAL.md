# Diagnostic V1 contract proposal

2026-10-24 · PROPOSED_DESIGN, NOT IMPLEMENTED OR FROZEN. Authority: owner Step 2 request; existing [docs/DATA_CONTRACTS.md](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/docs/DATA_CONTRACTS.md) and [docs/reviews/stage-1a/DIAGNOSTIC_DYNAMIC_SOURCE_CONTRACT_PROPOSAL.md](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/docs/reviews/stage-1a/DIAGNOSTIC_DYNAMIC_SOURCE_CONTRACT_PROPOSAL.md). This review refines names/boundaries without editing either authority document. Application storage version2 is not a question version.

## Identity and immutable relationships

| Identity | Meaning / constraint |
|---|---|
| assessmentId | Stable diagnostic family, e.g. aiielts-starter; not an attempt or learner |
| blueprintVersion | Immutable domain counts, item types, ordering/administration, completion and eligibility policy; proposed 27 objective +2 capture shape |
| questionSetVersion | Immutable wording/options/stimuli and reviewed public metadata version; replaces the earlier proposal name assessmentVersion, not a second competing field |
| assignmentId | Unique allocation of exact served snapshot/order to a learner; no refresh rotation; a retake receives a new allocation even if set unchanged |
| attemptId | Unique attempt, binds exactly one learner/assignment; retakes do not overwrite old attempts |
| questionId | Stable unique content item identity within an immutable set; retain explicit legacy mapping G1… I5; productive tasks need new IDs, currently absent |
| optionId | Opaque unique ID under an item, never inferred from displayed letter/index; option labels/order are pinned |
| scoringPolicyVersion | Immutable single-choice rules, eligibility list, rounding, unanswered treatment and source/key validation; no automatic replacement |
| sourceDigest | SHA-256 of exact canonical served public payload, including ordered IDs/text/stimuli/media hashes; replaces contentDigest in the earlier proposal |
| learnerId | Local development profile scope, validated on all reads/writes; not secure authentication; later server derives authorization from session |

Names above are proposals, not identifiers retroactively attached to legacy records. A content/key correction creates a new approved version; it never re-scores historical records silently.

## Separate records and ports

1. **PublicQuestionSetV1**: schemaVersion, assessmentId, blueprintVersion, questionSetVersion, track applicability, sourceMode, title/instructions, ordered sections/items, stimulus references, public source notices. Each choice item has questionId/sectionId/kind/prompt/options(optionId,label); productive items have prompt, approved capture instructions and limits. No answer, correctOptionId, private rubric or pre-submit explanation. Listening transcript is a private verification artifact or post-submit resource, never a learner-visible pre-submit stimulus.
2. **DevelopmentKeySetV1**: same version tuple, sourceDigest, keyDigest, scorer version, approved eligible question IDs per dimension, correctOptionId per eligible item, review/rights signoff. Store separately from components. Bundled development keys are inspectable; this is not secure production marking. Future API does not send this record to learners.
3. **AssignmentSnapshotV1**: assignmentId, learnerId, exact PublicQuestionSetV1 served payload, sourceDigest, ordered questionIds and optionIds, pinned eligible IDs/scoringPolicyVersion/keyDigest, allocatedAt and recordOrigin. Media bytes must be retained at a content-addressed or otherwise immutable version; a digest cannot recover a replaced file. Do not use a moving URL as the only recovery resource.
4. **AttemptV1**: attemptId/learnerId/assignmentId, immutable snapshot reference plus local recoverable snapshot, revision, lifecycle, saved position by IDs, typed responses, playback history, startedAt/lastSavedAt/submittedAt UTC and recordOrigin. No global latest-set lookups on resume. Before submission draft fields mutable only under revision checks; after submission immutable.
5. **Responses**: SINGLE_CHOICE {questionId, optionId|null}; WRITTEN_RESPONSE {questionId,responseId,text,updatedAt}; SPOKEN_RESPONSE {questionId,responseId,captureKind,sessionId,durationSeconds,mediaReference|null,mediaSha256|null,persistenceState}. Explicit NO_MIC_FALLBACK is not RECORDED and does not count as provided. Raw private text/audio stays outside analytics. Invalid ID/type is an error, not unanswered. Preserve text unchanged; word count is a derived observation.
6. **SubmissionResultV1**: resultId, learnerId, attemptId, assignmentId, immutable version tuple/sourceDigest/keyDigest, submittedAt, inputRevision, idempotencyKey, validation per dimension, correct/answered/eligible/unanswered counts and sourceQuestionIds, percent:number|null, productive capture observations with score:null. An invalid dimension cannot produce a validated percentage; overall status may be PARTIAL_VALID_RAW with explicit per-dimension gates, never a proficiency grade. M06 review releases only validated objective item outcomes and flags all exclusions.

Proposed typed ports: `DiagnosticQuestionSource.loadAssessment({assessmentId,questionSetVersion,track})` returns versioned public content without allocating or scoring. `DiagnosticAttemptRepository.create/load/saveDraft/submit` manages identity, revisions, ownership and durable receipts. `DiagnosticScorer.validateAndScore` consumes the pinned approved keys and final responses, never arbitrary client correctness fields. This explicitly separates the earlier four-method facade; a compatibility facade can delegate, but the exact split requires owner D06 approval. No port or endpoint exists because of this document. A later API adapter implements these same ports/DTOs and errors; screens and resume semantics stay unchanged. No dynamic generation, random assignment or network implementation is proposed here.

## Deterministic digest and audit projection

Canonicalization: UTF-8 JSON, recursively sort object keys, preserve array order and exact strings, no insignificant whitespace, reject nonfinite numbers; digest excludes the sourceDigest field itself and private keys. This protocol uses integer limits/counts and strings (not arbitrary floating-point serialization). SHA-256 lowercase hex. Validate snapshot digest on every load/save/submit. keyDigest separately covers keys/policy; do not put private key material into public digest inputs.

A **documentation-only projection** of all 29 unchanged source items was assembled and checked in audit scratch; it was not installed as a fixture. Proposed IDs use `.v1-draft`, assignment example `audit-assignment-001`, attempt `audit-attempt-001`, learner `audit-local-learner-A`. All 27 key option references resolve and all seven sections map exactly once. The audit projection includes the declared Listening script for reviewer inspection, so it is **not a learner-public delivery payload** and must not be shipped unchanged.

- Audit projection sourceDigest: `f51a4a80e618bee49e93668cb8caea40236a4ef4a81e0f19e8564a0230e323cd`.
- Audit projection keyDigest: `0b4f4e6c7a3f904f82301b157342493206b94dbefc9542d0685b5b77616c3446`.
- These hashes identify the audit projection only, not an approved V1 release. The eventual public payload must omit the pre-submit Listening script and be rehashed; no placeholder is claimed to be its digest.

## Raw scoring and validity

Current [src/services/diagnostic.ts:9](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/services/diagnostic.ts:9) checks numeric index equality against all source items, rounds percent to integer, and does not validate status/version/type. A separate generic platform text normalizer is not used. Missing responses count wrong; malformed response types also fall through as wrong. A no-question section would return0 rather than unavailable. Read-only probes document those failures.

Proposed single-choice scoring: validate owned assignment/snapshot/version/approved key set first; normalize **nothing** beyond already-typed stable option IDs. Reject unknown IDs, duplicates, nonmember options, numeric/string coercions and invalid capture metadata. `answered` counts structurally valid choices whether right or wrong. `correct` counts exact approved optionId matches. `eligible` is the reviewed assigned list frozen **before** the attempt. `unanswered=eligible-answered` for that dimension. No response-dependent or retrospective denominator changes.

Subject to owner approval, explicit final submission may include unanswered objective items after an incomplete-answer warning: unanswered remains in the eligible denominator and contributes0 correct. A malformed response/key/digest is an error, not unanswered. If required eligible keys are missing/invalid, set that dimension INVALID/PENDING_REVIEW and percent=null; do not drop the broken item to inflate accuracy. If eligibility is revoked after assignment, preserve source and mark affected result unavailable pending an explicit new-version policy; never silently shrink it. Zero eligible items means UNSUPPORTED/null. Before durable valid submission use REQUIRES_VALID_DIAGNOSTIC/null; save/provider error gives TEMP_UNAVAILABLE/null. True all-wrong valid final result is AVAILABLE/0.

Raw percent = round(100*correct/eligible); display correct/eligible plus answered/unanswered and limitations. A synthetic 5-item valid assignment with2 right,2 wrong,1 unanswered gives40%; before submit the same responses have no released metric. That arithmetic example is not evidence that these source questions are validated.

Content-only candidates now: Grammar4/6 (hold G2/G6), Vocabulary5/6 (hold V1), Reading5/5, Listening0/5 (audio review), Familiarity4/5 (hold I4). These are possible **future** frozen denominators, not an authorized change to the current27-item scorer. All also require source/rights and owner freeze. No candidate count establishes representative proficiency or calibrated confidence. Preserve27+2 shape if four items are approved/revised and five Listening items verified/replaced in a later version; do not remove a whole dimension to pass the gate.

## Productive and historical limitations

Writing word count uses trim/split whitespace for display; hyphen/apostrophe treatment is not an IELTS marking rule. Nonblank saved text counts capture even below180; completing the task is a separate approved rule. Speaking requires explicit capture provenance, finite nonnegative duration and finalized usable evidence; duration alone is insufficient. Session-only recordings must be labeled and cannot become persisted-response claims after reload. Neither task has objective correctness, AI evaluation, IELTS band or assessed CEFR. Legacy SUBMITTED-only speech is UNKNOWN/UNSUPPORTED, not inferred recorded audio.

No raw objective percentage, word count, fallback timer, self-reported level or combined mastery heuristic may populate IELTS bands, assessed CEFR, readiness or AI assessment. Existing estimates stay historical unverified data until an authorized implementation changes their presentation. No migration/re-keying performed.
