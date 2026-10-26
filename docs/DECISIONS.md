# Decisions

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
