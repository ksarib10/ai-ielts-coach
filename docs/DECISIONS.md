# Decisions

## Owner-authorized Slice 2 UI architecture — 2026-10-28

- **APPROVED SCOPE / IMPLEMENTED_AND_TESTED, HUMAN ACCEPTANCE PENDING:** Stage 1B Slice 2 frontend navigation/catalog restructuring only, per the owner's pasted instruction. This is not Stage 2 authorization.
- **Navigation decision:** exact ten-link/four-group sidebar; Readiness inside Progress; vocabulary inside Learn; original engines/deep links retained. Exam Simulation display becomes Complete IELTS Exam with original sample limitations.
- **Catalog decision:** typed metadata, pure route builders, reusable card and separate screens in `features/discovery`. SAMPLE/PLANNED/REFERENCE_PENDING avoid pretending unavailable datasets or full tests work. Existing module hubs are retained as libraries; no framework/provider rewrite.
- **Information decision:** About topics and distinct scoring references are structural pending destinations until verified content approval. No policy research/ingestion or rubrics fabricated.
- **Disclosure decision:** consolidate repeated non-strict shell demo/sample banners into one accessible Development Preview, retaining material shared-device identity, local-save, scripted-AI and invalid-assessment limitations. Strict assistance-disabled presentation stays.
- **Checkpoint reconciliation:** owner handoff reports Slice 1 corrections completed by Google Antigravity, existing private GitHub connection/push and Vercel frontend deployment. Base `65a25bbacc97a021d728946839da5404d262924e` matches the local origin/main reference at preflight. Earlier no-remote/deployment statements below describe historical stages. This slice does not fetch, push, merge, reconnect accounts, change remotes or deploy. Four existing untracked GitHub/Vercel reports are preserved and excluded from the Slice 2 commit.
- **Still OPEN:** owner review of Slice 2 and provisional appearance, D06 Diagnostic V1 freeze/keys/media/assignments/retakes, D07 privacy/timezone/retention/migration, all 15 M01–M11 genuine baseline metrics and human acceptance. D01 established baseline remains preserved; D05 local-only permission does not create secure identity. M12–M17 remain unavailable. No new package/skill/backend/AI/data migration. Publishing this slice requires separate authorization.

Same-slice updates to authoritative routes, feature status, architecture/contracts and related living documents remain mandatory. [Implementation/evidence report](reviews/stage-1b/slice-2/SLICE_2_IMPLEMENTATION_REPORT.md).

---

## Dated owner authorization and Slice 1 outcomes — 2026-10-27

This entry supersedes only the current status of affected historical proposals below; it does not backdate approval.

- **D01 APPROVED / EXECUTED for this copy and baseline:** owner approved development root `C:\Users\ksari\source\repos\ai-ielts-coach`, unchanged original/backup and a new honest Git baseline. Baseline `93dd4a2641753e5afb7f3ad3ccb6d22230502f82` is on main, without recovered historical commits or remotes. Existing Git signing/hook configuration was retained; no signing bypass or hooks redirection was used. Preservation evidence is in the Slice 1 review. Private remote/account choices remain unapproved.
- **D03-S1 APPROVED / IMPLEMENTED_AND_TESTED within bounds, OWNER ACCEPTANCE PENDING:** shell, provisional dual-purple theme and truthful presentation only. This does not authorize full Stage 1B, Diagnostic V1 or Stage 2. Legacy engines/data contracts remain unchanged; no packages/skills installed.
- **D04 ACCEPTED_REQUIREMENT:** all 15 M01–M11 baseline IDs must be genuinely implemented/verified/human-accepted before Stage 2. This slice does not meet that gate. M12–M17 remain unavailable.
- **D05 ACCEPTED for local development only:** learner-scoped local persistence is an acceptable later development boundary; current device-wide demo stores were preserved, not migrated into secure identity isolation.
- **D06 OPEN:** approved question blueprint, keys/provenance/audio verification, immutable assignments, resume/retake/scoring policy and Diagnostic V1 freeze. Step 2A V2 remains candidate content; no runtime activation.
- **D07 OPEN:** privacy, IANA timezone policy, legacy migration/backups, retention/export/deletion and continuity details. No learner migration was performed.
- **D02 defaults to NO INSTALLATION.** No third-party skill/agent/MCP installation occurred.
- **Visual direction APPROVED; exact tokens NOT ACCEPTED yet.** Purple light/dark previews and bounded contrast/keyboard/reflow evidence are ready for inspection. No WCAG certification.
- **Deployment preparation only:** Vite static-build compatibility recorded; private Git remote, account access, commercial plan, protection configuration, push and deployment require separate authorization. See [Vercel preparation](reviews/stage-1b/slice-1/VERCEL_PREPARATION.md).
- **Continuity rule ESTABLISHED for future slices:** update the authoritative route map (`ROUTES_AND_STATES.md`), status register (`FEATURE_REGISTRY.md`) and any affected overview/design/contracts/decisions/changelog within the same reviewed slice. No redundant authoritative copies. Preserve historical audits and Memory.md.

Implementation and subsequent evidence-recording commits are recorded in [Git checkpoint](reviews/stage-1b/slice-1/GIT_CHECKPOINT.md). Human acceptance of Slice 1 remains distinct from any next-slice authorization.

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

2026-10-23. Owner is the final decision maker. Dates below record this review, not implied acceptance. Prior root documentation is preserved. STAGE_2_ENTRY = BLOCKED.

## ADR-001 — Stage boundary and continuity

Status: ACCEPTED_REQUIREMENT, owner Stage 1A request. Context: approved vision coexists with a no-implementation review. Options: perform features now; document and stop. Outcome: documentation/read-only validation only. Rationale: explicit narrow authorization. Consequence: no source/config/lockfile/root AGENTS.md edits, skill/agent installs, backend or publication; later work needs new permission. Supersedes older Memory.md “next phase” guidance only for present authorization, without rewriting that history.

## ADR-002 — Preserve the observed frontend

Status: PROPOSED_DESIGN; owner decision D01. Context: functioning React 18/Vite app and passing current tests. Options: incremental feature boundaries, Next/SSR migration, complete rewrite. Recommendation: retain React/TypeScript/Vite/Router/npm and CSS, reuse shared UI; no React 19/Tailwind/server-component assumption. Consequences: lower migration risk; improve dense files/providers incrementally later. No dependency upgrade chosen now. Git is absent: restoring known history or initializing a new repository needs a separate decision, never a fabricated commit.

## ADR-003 — Fixture first, versioned attempt ownership

Status: ACCEPTED_REQUIREMENT for separate versioned fixtures and skippable dashboard access; PROPOSED_DESIGN for exact schema/resume policy (D06). Context: current data array has keys but no immutable assignments. Options: inline UI data, immutable fixture provider, dynamic API now. Recommendation: immutable fixture provider and separate raw scorer now only after Stage 1B approval; API contract later. Consequences: deterministic resume, no retroactive scoring against edited questions; legacy attempts preserved as unverified. API answer keys never public; development bundles explicitly insecure for secret scoring.

## ADR-004 — Define the statistics gate explicitly

Status: BLOCKED pending D03/D04/D05. Context: owner requires complete statistics before Stage 2 but Stage 1A forbids coding. Options: separately authorized Stage 1B prerequisite; owner-approved renumbering; full future-platform prerequisite. Recommendation: accept precise M01–M11 baseline plus explicit unavailable states for M12–M17, authorize minimal Stage 1B, review observed outputs, then independently consider Stage 2. This recommendation does not itself redefine complete. Consequence: old heuristic percentages and passing old math tests cannot satisfy the gate. Stage 2 stays blocked until owner signs off scope and completion evidence.

## ADR-005 — Skills and trust

Status: ACCEPTED_REQUIREMENT: install nothing in Stage 1A. PROPOSED_DESIGN: retain current tools, optionally adopt only pinned fixing-accessibility after D02. Context: broad catalogs contain host-specific scripts and imperative text. Options: bulk catalog/plugin install, individual audited instruction-only skill, no addition. Recommendation: no new skill required; one optional future candidate. Consequence: no catalog CLI/MCP, no black-box execution, no agents created. Static audit cannot prove safety or transitive supply-chain safety. Attribution and exact-revision re-review required before any later adoption.

## ADR-006 — Theme and reusable UI

Status: PROPOSED_DESIGN (D01/D03). Context: two CSS layers and light-only prototype. Recommendation: incremental semantic tokens, light/dark/system provider, accessible fields/dialogs and metric availability states, retaining current visual work. Alternative: wholesale UI library migration, rejected as unnecessary at this point. Consequence: both-theme, keyboard and responsive acceptance becomes explicit in a later authorized stage; no current compliance certification.

## ADR-007 — Identity, history and privacy

Status: BLOCKED for production choice; proposed local-only Stage 1B policy needs D05/D07. Context: current demo login shares one browser store and loadDemo resets learning history. Recommendation: isolate demo fixtures, preserve existing records, add provenance/learner scoping only under approved migration; no real auth or cross-device claims until secure services are authorized. Consequence: local signed-in appearance is not authentication; human acceptance must state the allowed scope and retention/media policy.

See [precise owner choices](reviews/stage-1a/DECISION_REQUIRED.md). Append a dated acceptance/superseding entry after the owner responds; do not edit pending entries to appear historically accepted.
