# AI IELTS Coach — Approved Platform Feature Scope V1.0

**Owner decision:** APPROVED, 23 October 2026.  
**Authority:** User's approved unified feature inventory and explicit amendments.  
**Not implied:** No frontend implementation, third-party skill installation, production-grade scoring, AI accuracy, source rights, or backend authorization is granted by this document.  
**Product launch geography:** Uzbekistan first; broader markets and localization remain planning considerations.

## 1. Product promise

Create a unified IELTS preparation platform connecting account/profile, diagnostic learning needs, authentic language foundation, IELTS skill practice, exam simulation, real attempt history, progress statistics and eventually personalized guidance. The UI architecture can expose destinations before their features work, but must display accurate availability labels. No official IELTS endorsement or guaranteed score improvement is claimed.

## 2. Confirmed full-platform product inventory

| ID | Domain | Approved platform vision | First implementation milestone / boundary |
|---|---|---|---|
| F01 | Public site & account | Landing, signup/login, recovery, identity and settings | Route/form and auth contract; secure production auth awaits approved provider/backend |
| F02 | Learner onboarding | Profile, Academic/General/undecided track, targets, dates and adjustable preferences | Real forms, explicit field validation, back/resume and state model |
| F03 | Initial diagnostic | Starter assessment, begin/skip/resume, versioned question sets, responses, submission and valid baseline result | **Initially hard-coded question fixtures** behind a replaceable provider interface; subsequent API-backed dynamic sets are planned |
| F04 | Feature dashboard | Goals, learner profile, actionable next step, personalized statistics and complete feature navigation | Show only valid, source-backed metrics; incomplete readiness must be gated, not fabricated |
| F05 | Exam simulation | Academic and applicable GT Listening, Reading, Writing, Speaking; timing, responses, media, submission and review | Destination/shell now; audited exam implementation later |
| F06 | Module tests | Standalone Listening parts, Reading passages, Writing tasks and Speaking prompt sections | Separate from full exam simulation; implementation later |
| F07 | IELTS practice | Four-skill mini/part/passage/full activities as evidenced, results, transcripts and learning feedback | Placeholder and taxonomy first; preserve OT/PT ownership and scoring contracts |
| F08 | TED Talks learning | Video, transcript, MCQ/open responses, evidence review, relevant vocabulary | Six normalized talks are internal design inputs; media rights/source checks and functionality remain separate |
| F09 | Academic Word List | 570 word families, contextual examples, flashcards, recall and revision | Dataset audit then learning UI, not a first-milestone working feature |
| F10 | Vocabulary resources | Dictionary, POS, CEFR when available, IELTS usage, collocations, idioms, linking words, phrasal verbs, UK/US differences | Collected sources need quality and usage rights checks |
| F11 | Grammar & resources | Tenses, clauses, complex sentences, exercises, IELTS scoring guides, strategies, tips, model answers and video resources | Designed destination; generated lessons or content not yet complete |
| F12 | Curriculum, lessons & notes | Sequenced learning plan, connected lessons, notes and exercises | Structure reserved, content generation deferred |
| F13 | Progress & analytics | Personalized dashboard metrics, valid attempt history, trends, goals and activity reports | **Pre-Stage-2 personalized statistics acceptance gate applies**; derive only from real captured data |
| F14 | Gamification | Word of Day, quests, streaks, points, badges and resource unlocks | Future; points are not IELTS proficiency |
| F15 | AI Coach | Personalized feedback and recommendations, possible criterion-informed Writing/Speaking evaluation | Future; must establish reliability, privacy and bias testing before claims |
| F16 | Accessibility & localization | Light/dark, desktop/tablet/mobile, keyboard/screen-reader usability, possible Uzbek/Russian support | Core accessibility and themes part of frontend foundation; localization later |
| F17 | Content administration | Roles, publishing, media/content QA and managed resources | Conditional future feature; no 'secret path' as authorization |
| F18 | Plans & payment | Possible entitlement model, pricing, subscription and payments | Conditional, not approved for initial build; separate business approval required |

## 3. The first actual frontend milestone

**Confirmed scope:** a real, maintainable frontend foundation (not the complete product) encompassing app shell, responsive light/dark theme, login/signup UI and auth boundaries, learner onboarding, an initially fixture-backed diagnostic, and a dashboard with a clear feature navigation/availability model. Routes, typed state and API interfaces, validation/error states, testing, documentation, future integration boundaries, and safe separation of mock/development adapters are part of the foundation.

**Diagnostic amendment:** The starter question set may initially be hard-coded for a bounded, deterministic implementation. Store question content in separate, versioned fixture data, **not inline in components**. Questions, response handling, attempt lifecycle, scorer interface and result schema must be designed for a later API-delivered collection that can vary across attempts. Question IDs/assessment version must remain stable within an attempt, and scoring rules must not become accidental UI logic. Do not send hidden answer keys in a presumed secure production API payload. No dynamic question generation is approved yet.

**Skippable diagnostic:** Learners can access the dashboard if they skip. State `SKIPPED`/`DEFERRED` must be distinguishable from `SUBMITTED` and `NOT_STARTED`. They may start/resume later under the accepted policy. Actual diagnostic-dependent readiness cards must remain unavailable until backed by valid, reviewed results. Goal/profile/navigation remains accessible.

**Personalized statistics amendment — HARD GATE:** Owner says **do not advance to Stage 2 before complete personalized dashboard statistics are implemented**. This conflicts with the existing division in which Stage 1A is analysis only and Stage 2 performs frontend implementation. Therefore **Stage 2 entry is BLOCKED** until a separate implementation/acceptance stage is explicitly authorized and its dashboard-statistics completion evidence reviewed, or the owner approves a revised stage boundary. Stage 1A shall only draft the metrics inventory, data provenance/formulas, event and API contracts, test plan and acceptance criteria. It must not implement statistics or misreport the gate as satisfied.

**Clarification still to resolve:** “Complete personalized dashboard statistics” cannot mean credible metrics for modules that have never recorded learner data. Codex must propose an evidence-appropriate, testable definition for current available features and a separate future-state metric roadmap. Owner approval of this definition is a gate, not something Codex can assume.

## 4. State and availability language

`AVAILABLE`: functionality really works and has tests.  
`COMING_SOON`: destination exists, capability is not built.  
`REQUIRES_VALID_DIAGNOSTIC`: a derived metric needs a valid submitted result.  
`EMPTY`: implemented feature, but no real learner records.  
`IN_PROGRESS`: a real activity/attempt is active.  
`TEMP_UNAVAILABLE`: ordinarily implemented feature cannot currently be used.  
`PROPOSED / RESEARCH_ONLY`: visual/content architecture or audit, not an implemented product.

Never show fabricated bands, readiness percentages, trends, session history, achievements, examiner evaluation or AI recommendations in the functional UI. If a design mockup shows illustrative metrics, label it as non-production demonstration content.

## 5. Stage boundaries and authorization

- **Stage 1A — NOW AUTHORIZED BY A SEPARATE PROMPT:** inspect prototype and tools, assess skills/security, draft architecture and seven living docs, specify metrics/payloads, no installation or implementation.
- **Stage 1B — NOT AUTHORIZED:** possible owner-approved prerequisite implementation and validation of real personalized dashboard statistics (with necessary approved diagnostic/data persistence work), plus selective skill installation if chosen. Do not assume Stage 1B can begin automatically.
- **Stage 2 — BLOCKED:** broader frontend construction under a separate authorization after the owner-specific statistics gate and Stage 1A review are resolved. This stage numbering is provisional pending the owner's approval of a feasible execution sequence.
- **Later — NOT AUTHORIZED:** backend/database/data pipeline, live diagnostic question APIs, OT/PT/TED activity engines, AWL/curriculum, gamification, AI evaluation, admin, billing, production deployment.

## 6. Nonnegotiable development rules

Read-only canonical Official/Practice/TED inputs; no competitor asset/content copying; no unverified source rights or automated IELTS scoring claims. Preserve original prototype and git state until migration is approved. All future API/payload proposals remain draft contracts. Production authentication and cross-device statistics require real secure services, not a front-end simulation. Maintain the seven repository documents in lockstep with functionality.
