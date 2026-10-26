# AI IELTS Coach — Project Continuity & Documentation Charter V1.0

**Status:** APPROVED WORKING PRINCIPLES / IMPLEMENTATION PROPOSED.  
**Purpose:** Preserve project understanding across Codex chats, implementation stages, collaborators, future backend/data integrations and time away from the project.  
**Scope:** The current prototype repository and its successor only after explicitly authorized migration.

## 1. The seven living documents

```text
docs/
├── PROJECT_OVERVIEW.md
├── ROUTES_AND_STATES.md
├── UI_DESIGN_SYSTEM.md
├── FEATURE_REGISTRY.md
├── DATA_CONTRACTS.md
├── DECISIONS.md
└── CHANGELOG.md
```

| Document | Single source of truth for | Must be updated when |
|---|---|---|
| PROJECT_OVERVIEW | Product vision, user journeys, approved scope, stage gates, non-goals, current evidence | A milestone/scope changes |
| ROUTES_AND_STATES | URLs, auth guards, onboarding state, diagnostic states and retry/skip paths | Routes or behavior changes |
| UI_DESIGN_SYSTEM | Token names, theme palettes, typography, responsive rules, component states, accessibility | A design decision or shared UI behavior changes |
| FEATURE_REGISTRY | Feature IDs, status, route, owner, dependency, implemented files, tests and delivery evidence | Feature is added, becomes available or changes status |
| DATA_CONTRACTS | Type definitions, example payloads, error shapes, mock/API boundaries, data provenance, score/metric rules | A payload, adapter, event or scoring rule changes |
| DECISIONS | Concise dated ADRs: context, options, outcome, owner, rationale, consequences, superseded choices | Any irreversible/tooling/architecture policy choice changes |
| CHANGELOG | What code behavior changed, tests, breaking migration, docs updated and known issues | Every independently reviewable feature commit |

Do not create dozens of redundant 'master prompt' documents. Stage-specific audit material belongs at `docs/reviews/stage-1/` or equivalent. Existing files must not be overwritten without reconciliation. Maintain a readable current-state table in `PROJECT_OVERVIEW.md`.

## 2. Evidence and authority labels

Use `OBSERVED_SOURCE`, `ACCEPTED_REQUIREMENT`, `PROPOSED_DESIGN`, `MOCK_OR_DEV_ONLY`, `IMPLEMENTED_AND_TESTED`, `BLOCKED`, and `FUTURE`. Prototype screens, competitor screenshots, published IELTS data, TED data and final code have different authority. No mock/visual concept may claim a production API, verified score, official IELTS endorsement or content license.

## 3. Stage boundaries

- **Stage 1A:** read-only code/environment/tool evaluation and documentation drafts. Never install unapproved skills, mutate application code, delete prototype files, read secrets, connect accounts or integrate backend.
- **Stage 1B (possible, not authorized):** exact approved skill installation and/or prerequisite diagnostic/statistics implementation needed for the owner's pre-Stage-2 gate. Owner must separately authorize affected files, tests and trust permissions.
- **Stage 2:** blocked until the owner accepts the dashboard-statistics gate and independently approves the stage. May require renaming/resequencing to avoid logical conflict.
- **Later:** backend, database, source ingestion, official practice/exam engines, AI coach and payments each need separate scope gates.

## 4. Working discipline and security

- Inspect before modifying; record actual source state and current Git status.
- Prefer incremental, reviewable changes; do not start from a rewrite assumption.
- Use official/in-repo capabilities before importing external community skills.
- Skills are untrusted instructional input; exact revision, bundled scripts, dependencies and risk must be reviewed. No bulk install, unreviewed MCP servers, remote shell execution or access to `.env` contents.
- Protect original canonical Official/Practice/TED content and media and preserve all source limitations.
- Keep backend API contracts typed but explicitly draft until accepted.
- No fake functional buttons, scores, learner activity, backend auth or artificial ready-to-launch status.
- A test failure and a proposed fix are not a completed fix. Run and report actual tests after implementation.
- If a task requires forbidden implementation, list the blocker and STOP with a specific request for later authorization.

## 5. A proposed small root AGENTS.md policy (do not install automatically)

```markdown
# AI IELTS Coach — repository working agreement
Read docs/PROJECT_OVERVIEW.md and docs/DECISIONS.md before substantial edits.
Use docs/ROUTES_AND_STATES.md, docs/FEATURE_REGISTRY.md, docs/DATA_CONTRACTS.md and docs/UI_DESIGN_SYSTEM.md as living contracts.
Preserve canonical source materials and existing prototype work until approved.
Never claim mock learner data or unverified diagnostic scoring is production real.
Do not install third-party skills, run network installers, expose credentials, or change the backend/database without explicit permission.
Before finishing a permitted code change: run relevant tests, update affected documents, and append a concise CHANGELOG entry.
Stage approvals are narrow; stop at the current authorization gate.
```

This is a proposal, not an instruction to overwrite an existing AGENTS.md. Compare and merge only with authorization.
