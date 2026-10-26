# Diagnostic V1 question-bank candidate — Step2A V2

2026-10-24 · **CONTENT PREPARATION ONLY. CANDIDATE_NOT_APPROVED. Stage1B NOT_AUTHORIZED; Stage2 BLOCKED.**

Two review-ready forms each contain27 objective items plus Writing and Speaking. Total54 objective+4 productive:41 generated/revised objective,13 reused objective,2 new productive,2 reused productive. All29 historical items/identities are retained separately and excluded from these totals. Reused objective wording/labels are unchanged; only the new candidate option order/IDs were authored to reduce the earlier position bias.

**44 objective text candidates are ready for human review;10 Listening items are blocked by2 missing recordings. Zero candidates are approved for real scoring and zero full forms are release-selectable.** New content is LLM-assisted, not validated by generation. Two independent Reading passages and two independent Listening scripts are provided; no audio placeholder or fabricated verification exists.

| Deliverable | Location |
|---|---|
| Learner-visible candidate content | [Form A](public/form-a.json), [Form B](public/form-b.json), [catalog/digests](public/bank-catalog.json) |
| Proposed keys, explanations, distractors, source spans | [Private key bank](private/keys-and-explanations.json) |
| Productive task instructions/capture | Separate productiveTasks in each form; [capture/scoring policy](policies/scoring-and-capture-policy.json) |
| Versioned quotas and creation-only selection contract | [Blueprint](policies/blueprint.json), [selection policy](policies/selection-policy.json) |
| Source and historical continuity | [Provenance](provenance/source-register.json), [crosswalk](private/legacy-crosswalk.json), [historical29 snapshot](private/historical-29-snapshot.json) |
| Content QA/eligibility and independent-review limits | [QA report](CONTENT_QA_AND_SCORING_ELIGIBILITY.md), [per-item review](private/review-evidence.json) |
| Exact Listening production and human verification requirements | [Scripts](private/listening-production-scripts.json), [missing-asset manifest](media/listening-asset-manifest.json) |
| All15 exact baseline metric formulas and six future exclusions | [Compatibility](policies/metric-compatibility.json) |
| JSON Schemas and deterministic validator | [Schemas](schemas/), [validator](validation/validate_bank.py), [actual run](validation/latest-validation.json) |
| Freeze decisions and validation/hashes | [Owner checklist](OWNER_DECISION_CHECKLIST.md), [manifest](VALIDATION_AND_HASH_MANIFEST.json) |

Only public/ belongs in a future learner content adapter. The complete review package contains inspectable development keys/private scripts and must not be shipped as secure test delivery. Listening transcripts are absent from public payloads. Public option IDs do not encode the correct-answer position. No frontend file imports this bank.

Selection is a written contract: choose one eligible complete form at assignment creation only; preserve bank/key versions, exact snapshot/order, frozen denominators, seed and eligibility digest. Skip/resume never reselects. A retake creates distinct records under an approved policy. No random selection, attempt creation, audio production or API implementation was executed.

Validation used the already-installed Python/jsonschema tools, without installation. From this folder, run `python validation/validate_bank.py --verify-hashes` for read-only schemas/content/negative cases and integrity checks. Optional `--project-root` checks all preserved original files and formula authority. `--write-report` creates a report only if absent; default execution never rewrites the recorded report. Assignment schema is approved-only design, not an instantiated learner record.

All130 pre-existing project files, including original source/assets, earlier audits, Memory.md and the seven living docs, remain byte-identical. The independent backup hashes were rechecked without modification. No Git initialization, package install, frontend/backend feature work or learner-data access/migration. This folder is a review candidate, not an operational feature update. **STOP after Step2A; await human content/policy approval and separate implementation authorization.**
