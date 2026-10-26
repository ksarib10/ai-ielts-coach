# Focused correction source audit — 2026-09-09

Read the complete Focused Product Flow & UX Correction Prompt, all 11 Phase 1 images, all 30 Phase 2 images, the landing reference, both assessed-dashboard images and all 13 IELTS informational CSVs before edits. Inspected the current source/state/routes, module workspaces, services, exam, dashboard, styles and build configuration. Baseline build and service checks pass.

## Authoritative reference map
- Phase 1: six steps — Welcome; About you (name, age optional, study context, occupation optional); IELTS goal (type, band, optional date, reason); language settings; starting point (self-assessment, daily time, session length, intensity); diagnostic handoff. Preserve the source wording and card/stepper style.
- Phase 2: seven sections in order Grammar, Vocabulary, Reading, Listening, Writing, Speaking, IELTS Familiarity. Grammar/vocabulary/familiarity are one-question screens. Reading uses passage/questions; Listening hides transcript; Writing has 20-minute diagnostic guidance and 180–250-word target; Speaking has one-minute preparation and up to two minutes of response. Result evidence feeds priorities; estimates remain provisional.
- Screenshot selections are learner answers, not answer keys (e.g. mixed conditional and collocation choices can be incorrect). Existing answer keys are retained.
- Reference Reading asks about “harsh” but passage says “less severe”; align the quoted question phrase with the passage rather than testing a missing word.
- Screenshot processing screen shows contradictory waiting/completed rows. Only actual completed sections will be displayed as completed.

## Gaps found
No session/sign-out guard; Get Started goes to sign-up instead of goals; eight mismatched goal steps; seventh diagnostic section discarded; generic fixed results; question position not persisted; no skip state UI; unrestricted personalized practice; pre-baseline recommendations imply personalization; old seeded progress values; no dashboard streak/gauge; per-module Exam duplicates complete simulation; 96-minute sample timing not sourced; no sidebar Exam entry.

## Sequence
Logout → Phase 1 → Phase 2 → save/skip/resume → state/persistence → practice locks → unassessed dashboard → assessed dashboard → gamification → focused CSV exam analysis → remove module Exam → standalone exam → distinguish mocks → scenarios → responsive/accessibility → production build → final documentation.

## Exam source findings to use at the exam stage
Listening/Reading/Writing in one session without breaks; Speaking may be separately scheduled. Select an in-centre paper-style reference model: Listening ~30 + 10-minute answer transfer, Reading 60 including transfer, Writing 60, Speaking 11–14. Online sources describe a different schedule (Speaking usually first), breaks and 30-minute Listening; do not merge these into one rule set. Total selected model 171–174 minutes including Speaking. Listening/Speaking same for Academic/General; Reading/Writing differ. Writing Task 1 150+ words (Academic visual report; General letter), Task 2 250+ words, weighted twice. Source CSVs do not contain a full-length question bank, detailed General Reading section content, or part-by-part Speaking times. Clearly distinguish original sample material from the source-backed timing/format; do not fabricate official content or infer official bands from short samples.
