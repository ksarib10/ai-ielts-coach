# Candidate content QA and scoring eligibility

2026-10-24 · Step2A V2 content/contract preparation only. LLM-assisted authoring and self-review; no independent human approval or calibrated assessment claim.

| Population | Count | Current status |
|---|---:|---|
| Objective candidates |54|44 text/content-review-ready;10 blocked on missing verified audio |
| Productive tasks |4|Capture-only review; no objective keys or grades |
| Approved scoring-eligible objective items |0|All content/key/rights/owner approvals pending |
| Release-selectable complete forms |0|No approved Listening recording for either form |
| New candidate ambiguities identified after self-review |0|Not independent validation; human adjudication can still find issues |
| Historical disputed items |4|G2/G6/V1/I4 remain historically disputed; proposed derivatives do not overwrite that record |

Counts exclude the29-item historical snapshot. Candidate authorship:13 objective prompts/options reused with authored option reordering,4 proposed objective revisions,37 wholly new objective items,2 reused productive prompts,2 new productive prompts. Thus **43 generated/revised candidates and15 reused candidates =58**. New Reading passages and Listening scripts:2 each; no new audio produced. Form A and B each have6 Grammar,6 Vocabulary,5 Reading,5 Listening,5 Familiarity,1 Writing,1 Speaking, with disjoint item/stimulus identities. Forms have not been equated and must not be treated as interchangeable measurements of proficiency.

## Individual content review evidence

All54 items have a proposed correct option, explanation, three option-specific distractor rationales and source/stimulus evidence in [private keys](private/keys-and-explanations.json). All58 have separate review/eligibility/provenance records in [review evidence](private/review-evidence.json). The same assistant authored and self-reviewed the new content; this is not a second assessor. Every scoringEligible flag remains false.

- G2 derivative explicitly requests present perfect simple and specifies continuing study. G6 derivative explicitly requests a present-result mixed conditional. These remove the earlier open temporal-reading issue by narrowing the construct; both need human approval.
- V1 derivative uses a speed-based gloss for rapid in context. I4 derivative asks about prerecorded stimulus questions, avoiding confusion with recording the Speaking interview. Original wording/keys remain archived unchanged.
- Two newly composed fictional Reading passages cover tool lending and quiet study, with exact paragraph quotes for each of10 keys. All10 Listening keys cite exact production-script segments; those text matches do not prove any spoken audio exists.
- Form A Reading facts are not reused by its museum Listening script; Form B quiet-study Reading facts are not reused by its lost-property Listening script. No historical garden stimulus is selected. Semantic independence was reviewed by the author, not psychometrically measured.
- Quotas target agreement, tense/conditional recognition, uncountables, vocabulary meaning/form/collocation, five Reading skills, five Listening skills and five format-awareness topics. Some vocabulary items overlap with word-form grammar and some distractors are conspicuously malformed; this is a limited recognition bank, not broad skill mastery.
- Correct positions: Form A A7/B7/C7/D6; Form B A7/B7/C6/D7; combined A14/B14/C13/D13. Order is authored and pinned; no runtime shuffling or answer-position-based IDs.216 unique option IDs derive from item identity and exact label, independently of correctness.
- The correct answer is the uniquely longest label in **20/54** items. This is a residual cueing risk for human review, not a scoring-eligibility grant. These item IDs are diagv1.a.g02.r1, diagv1.a.v6.r1, diagv1.a.r01.r1, diagv1.a.r04.r1, diagv1.a.r05.r1, diagv1.a.l01.r1, diagv1.a.l04.r1, diagv1.a.l05.r1, diagv1.a.i3.r1, diagv1.a.i04.r1, diagv1.a.i5.r1, diagv1.b.v02.r1, diagv1.b.v06.r1, diagv1.b.r01.r1, diagv1.b.r02.r1, diagv1.b.r03.r1, diagv1.b.r04.r1, diagv1.b.r05.r1, diagv1.b.l01.r1, diagv1.b.l05.r1. Generic “Choose the correct sentence” stems recur in historical G1/G5 but complete item texts/options differ. No complete duplicate objective item occurs across forms.

Reading whitespace word counts: {"stim.a.reading.r1": 244, "stim.b.reading.r1": 240}. Listening script word counts: {"stim.a.listening.r1": 218, "stim.b.listening.r1": 231}. Audio pace targets are production guidance only; actual durations/timecodes are null. No CEFR/difficulty classification, IELTS band mapping, calibrated confidence, AI evaluation or readiness score is supplied.

## Actual validation

Python3.14.0 with existing jsonschema4.26.0: **16 schemas checked,14 content JSON documents validated,15 negative mutations rejected**. Checks cover exact quotas,58 item IDs,216 option IDs,54 key references,162 distractor rationales,20 exact stimulus evidence quotes, source links, historical crosswalk, public/key separation, immutable payload digests and15 unchanged metric formulas. Evidence report and hash manifest have their own schemas. The approved-only assignment schema is design-only; no learner assignment or selection was created. Schema parsing/reference checks cannot establish linguistic correctness, licensing or audio alignment.

PASS: structural/reference checks and preservation. SOURCE_REVIEW: all authored/reused content, independent review, rights and cueing quality. BLOCKED:2 recordings affecting10 items, human/key/rights freeze and usable-form release. No unexpected validation FAIL remains in the delivered candidate package; unresolved original application/scoring gaps from Step2 are preserved and unmodified. Existing frontend tests/build were not rerun because no application code changed.

## Statistics and stop boundary

The derived [metric compatibility record](policies/metric-compatibility.json) preserves all15 exact M01–M11 IDs/formulas from the existing matrix. M04 uses distinct valid selected responses, M05 each frozen selected eligible denominator, M06 validated post-submit item review and M07 genuine capture with score=null. Profile/activity metrics still require their original sources and validity rules. M12–M17 remain unavailable; raw values across non-equated forms cannot create a skill trend. Two complete27+2 **desk-review** forms exist; neither is a complete usable scored Listening form. Stage1B remains NOT_AUTHORIZED.
