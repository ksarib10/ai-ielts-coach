# Diagnostic lifecycle policy proposal

2026-10-24 · PROPOSED_DESIGN. Optional diagnostic/dashboard access is accepted; exact completion, retake, media, migration and persistence details still require owner decisions. No browser storage read or modified.

| State/action | Existing evidence | Recommended V1 behavior |
|---|---|---|
| Not started | status not_started, no attempt identity | Participation NOT_STARTED; no phantom assignment/result or0/N before actual allocation |
| Start | Route entry sets in_progress | Explicit deterministic create with owned assignment and durable snapshot receipt before claiming saved |
| In progress | Numeric section/question positions, response map | ID-based position, pinned snapshot, typed responses, revision and lastSavedAt; preserve current input on failure |
| Skip/defer | leaveDiagnostic(skipped) saves draft/position then dashboard | Keep draft/assignment and playback history; participation SKIPPED_OR_DEFERRED; dashboard/profile/core learning available; start/resume action |
| Save/resume | writeState; same global source expected on reload | Resume exact attempt/version/order; unknown version or digest mismatch has safe recovery/export, never replace with latest |
| Submitting | UI processing with800ms timer and local save | Separate operation state, freeze intended input revision/idempotency key; no fake success or achievements before durable receipt |
| Submitted | complete plus aggregate results; route redirects | Immutable final answers/result identity, distinct from scoring validity; review validated dimensions only |
| Error/retry | commit keeps changed text/answers visible; alerts; final save can fail | Retry same revision/submission key, preserve editable draft, explicit unsaved state, one result/event; conflict loads no replacement without reconciliation |
| Retake | No diagnostic attempt history model | No automatic retake; new assignment+attempt ID under explicit approved policy, prior submitted record preserved |

Sources: [src/types.ts:31](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/types.ts:31), [src/features/Diagnostic.tsx:25](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/features/Diagnostic.tsx:25), [src/features/Diagnostic.tsx:75](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/features/Diagnostic.tsx:75), [src/features/Diagnostic.tsx:109](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/features/Diagnostic.tsx:109), [src/features/Diagnostic.tsx:181](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/src/features/Diagnostic.tsx:181). Current section completion7/7 is not29 answered items or a validity proof. `hasDiagnosticBaseline` only checks complete/non-null results; it is not a validated-result selector. Local multi-key writes are not atomic and local demo identity is not secure isolation.

## Completion, unanswered and captures

Recommended for owner choice: distinguish deferred (no final submission) from an explicitly submitted incomplete assessment. If partial final submission is accepted, warn about unanswered items, retain frozen denominators and release only valid dimensions; Writing/Speaking can be unprovided without fabricating content. Alternatively require all eligible objective responses before final submission while retaining skip/core dashboard access. This choice is not inferred from permission to skip. Proposed incomplete-answer40% example in Stage1A presupposes an approved partial-final policy.

Keep M04 valid answered count, section navigation completion, task capture and scoring status separate. Writing nonblank is capture;180-word UI progression is a distinct current rule, not quality. Do not force no-microphone fallback into a genuine Speaking response to finish. Use NO_MIC_FALLBACK/NOT_PROVIDED/RECORDED_SESSION_ONLY/RECORDED_PERSISTED or UNKNOWN_LEGACY evidence with score=null. Before a durable audio store is approved, session-only capture may be shown during that session with provenance, then becomes unavailable evidence after loss; do not claim permanent capture from status/duration. Minimum meaningful recording/zero-byte/error rules need approval; no speech-quality inference from seconds or byte length.

## Replay and interruption recovery

Current once-played flag is set at play start, not completion. Suggested policy: record media ID/hash, playback starts/completion/error and approved allowance; permit explicit interruption recovery only according to an agreed rule. Do not reset silently on refresh, log navigation as learning or expose transcript/hints in strict mode. Decide hearing/accessibility accommodations, genuine device failures and whether using the same garden topic is acceptable. No change to existing Exam/Test timing/strictness is included here.

## Retakes, selection and preservation

Recommended initial default: no self-service retake until explicit policy accepted. If enabled, create a new attempt and allocation with current approved version, preserve all old answers/results and disclose same-question familiarity. Dashboard selection can use latest durable VALID_RAW attempt per accepted comparable version policy, never latest in-progress attempt; user-visible history shows provenance and invalid/unverified states. Comparability/trend M12 remains gated even if two same-item retakes exist. Changing goal/timezone/track does not rewrite submitted snapshots.

Before any authorized migration, export/back up exact legacy bytes and validate a versioned decoder/rollback in disposable records. Classify old heuristic bands and ambiguous speech as LEGACY_UNVERIFIED; do not attach today's question set to old responses or promote old percentages. Current readState catches parse/read errors and returns blankState, which can hide unavailable/corrupt data as a fresh profile; this is a source-review recovery gap, not evidence that owner data is corrupt or deleted. Preserve unknown/corrupt payload separately with recovery UI; do not auto-reset. Owner must approve D07 retention, consent, timezone and export/deletion rules. Existing source backup does not contain browser learner records or session-only audio. No migration was tested/executed in this audit.

## Future acceptance, not executed Stage1B tests

T01–T12 verify immutable source, skip/resume, invalid keys, unavailable versus0, typed capture and idempotency. T21/T22 cover scoped ownership/legacy/privacy. T23–T26 cover accessibility, recovery, provider substitution and strict Exam regression. Actual Stage1B cases remain BLOCKED until authorization and approved content; existing six-suite PASS does not substitute. See [docs/reviews/stage-1a/DASHBOARD_ACCEPTANCE_TEST_PLAN.md](C:/Users/ksari/OneDrive/Desktop/ai_ielts_coach_app/docs/reviews/stage-1a/DASHBOARD_ACCEPTANCE_TEST_PLAN.md). Local-only scope accepted by D05 still needs learner-scoped repository implementation; it does not authorize a backend or real credentials.
