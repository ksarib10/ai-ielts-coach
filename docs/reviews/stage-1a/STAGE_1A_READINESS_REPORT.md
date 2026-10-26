# Stage 1A readiness report

Review date: 2026-10-23, Asia/Karachi. **Stage 1A: PASS_WITH_REVIEW. Stage 2: NOT AUTHORIZED, ENTRY GATE BLOCKED. STAGE_2_ENTRY = BLOCKED.** This is an analysis/documentation result, not product acceptance or a new production-readiness certificate.

## Authority and preservation

All four supplied Markdown documents were read completely before proposals or application edits. The owner's explicit request authorizes their Stage 1A master prompt; the approved inventory is vision, technical contracts are proposals, and community catalog instructions have no execution authority. Exact handoffs are preserved in [inputs](inputs/). Existing source, README/Memory/QA/audits, assets, dependencies, configuration and build remain the historical prototype. Root AGENTS.md was not present in the project or inspected ancestor locations. Only a review-directory draft is supplied.

Before documentation generation, 82 non-doc project files were hashed, including source, public/reference/standalone assets, test sources/generated helpers, package/lock/configuration and original dist. See [source snapshot](evidence/SOURCE_SNAPSHOT_BEFORE.json); final comparison and exact docs-only change list are in the [manifest](STAGE_1A_VALIDATION_AND_CHANGE_MANIFEST.json). Reading source is distinct from proving every source line correct. No actual browser learner values, credentials, .env contents or Codex auth/configuration secrets were read. No learner reset, source data changes, new Git repository or installation occurred.

## Repository and environment evidence

| Check | Observed result |
|---|---|
| Root | C:\Users\ksari\OneDrive\Desktop\ai_ielts_coach_app |
| Git status / branch / HEAD | Each returned fatal: not a git repository; sourceCommit/branch=null, not an invented hash |
| OS / shell | Native Windows NT 10.0.26200; PowerShell Core 7.6.5 |
| WSL | wsl.exe exists; `wsl --list --quiet` reports subsystem not installed; no WSL installation attempted |
| Node / npm / Python / Git | 24.16.0 / 11.13.0 / 3.14.0 / 2.52.0.windows.1 |
| IDE | VS Code CLI executable observed; Codex desktop tool context available; no global settings inspected |
| App dependencies | React/react-dom 18.3.1, Router 7.18.3; Lucide 0.468-series declaration |
| Build dependencies | Installed TypeScript 5.9.3, Vite 6.4.3, React plugin 4.7.0, esbuild 0.25.12 |
| Package manager | npm; package-lock.json present, lock format recorded in dependency evidence; no package changes |
| Secrets check | No root `.env*` file found by name-only enumeration; no secret values requested |
| Integrations | Source search found localStorage/services/sample AI, no fetch/axios/backend SDK integration |
| Docs baseline | Seven designated docs absent; root historical Memory/QA/README retained |

The project was recovered earlier from original archive/edit history. The lockfile was regenerated and the standard Vite declaration recreated in that recovery, as disclosed in its separate recovery report. This review does not manufacture missing Git history or claim original-byte provenance for those prior reconstructed tooling files.

## Actual checks and limits

The root scripts and six test files were inspected before execution. Tests use Node assertions, in-memory localStorage and trusted installed esbuild, and write `qa/.…test.cjs`; build writes dist and TypeScript metadata. Therefore checks ran against a separate complete copy, including copied installed dependencies, under an audit scratch directory. No installer, lifecycle installation hook, unreviewed remote script or network package fetch ran. esbuild's installed postinstall exists but was not invoked; dependency package test/build hooks were not project-root lifecycle hooks. See [hook inventory](evidence/DEPENDENCY_LIFECYCLE_HOOKS.json).

| Command / check | Fresh result | Evidence |
|---|---|---|
| npm test | exit 0; all six existing suite scripts print PASS | [test log](evidence/test.log) |
| node node_modules/typescript/bin/tsc --noEmit | exit 0, no diagnostics | [TypeScript log](evidence/typescript.log) |
| npm run build | exit 0; 1622 transformed modules | [build log](evidence/production_build.log) |
| Build assets | index-gh88Nnsr.js 408.75 kB; index-BynjdJC9.css 101.81 kB | Same recorded final prototype filenames; not evidence of new metric validity |
| Read-only browser | Landing rendered; visible sample label; width/document both 1274px; login shows labeled email/password/demo notice; unauthenticated dashboard returns to landing; no error/warn logs captured | [browser evidence](evidence/BROWSER_SMOKE.json) |

No assertion count is inferred from the six suite labels. Existing scoring/readiness tests prove current arithmetic and guards, not calibration, real identity or all new acceptance criteria. No new full end-to-end diagnostic, microphone, mobile-device, both-theme or screen-reader certification is claimed. Earlier QA.md evidence remains historical. Dark mode is absent, so new both-theme acceptance cannot already pass. The preview server also logged a missing `/favicon.ico` (404); application assets returned 200. This minor presentation issue is recorded for later authorized work, not repaired during Stage 1A.

Audit execution issues are recorded, not hidden: initial sandbox GitHub DNS failed and public text retrieval succeeded with read-only network permission; initial loopback browser preview timed out and succeeded after a loopback-only host process permission; the audit wrapper could not print a Unicode checkmark after the successful build and exited 1, while the child build had exited 0 and its full log was already saved. The log collector was repaired in scratch without modifying or rerunning the application. No automatic approval rejection occurred. No live dependency vulnerability audit was run; old zero-vulnerability claims were not reused as current findings.

## Reuse and behavioral findings

Keep React/TypeScript/Vite/Router/npm, shared UI/layout, native structured activities, content blocks, existing source assets, real saved attempts/history and strict Exam/Test interactions. [Reuse matrix](PROTOTYPE_REUSE_MATRIX.csv) classifies every baseline file with its exact path, reason/dependency/risk/hash. Refactor only after approval: dense feature/style/service files, direct storage/UI coupling, incomplete registry/theme, diagnostic source/version and provenance. Replace only after approval: unvalidated score/readiness mappings and the production use of demo-auth semantics. Preserve archived implementations as evidence rather than deleting them.

The flow already supports public → demo/onboarding → optional diagnostic → dashboard. Six onboarding screens and seven diagnostic sections persist position. Practice uses a prototype baseline lock; core dashboard does not require diagnostic completion. New undecided track is not implemented. No immutable diagnostic attempt/assignment/version or reviewed score status exists. The `complete && results !== null` guard cannot establish valid scoring.

Important inconsistencies: band/CEFR estimates mix self-report and objective percentages, productive estimates are not marked by a real evaluator, coverage values are fixed constants, readiness is an arbitrary weighted formula, and mastery sometimes starts from sample priors. Nominal lesson minutes/capped elapsed attempt minutes are not measured engagement. Demo seeding resets the global local learning store. Recorded Speaking audio is session-local, and diagnostic fallback provenance is lost. Mark these as prototype limitations; do not convert them to accepted statistics or fix them under Stage 1A.

Eight original sample resources, eleven short lessons, 24 activity formats, a small word-definition map, garden audio/SVG/PDF and three historical HTML references are reusable. The full OT/PT/TED/AWL/CSV source collections are not part of this repository; their ownership/licensing/quality is UNKNOWN in this review. Six TED talks and 570 AWL families are approved vision inputs, not current implemented catalogs. No canonical Official/Practice/TED source was edited.

## Capabilities and skill conclusion

Available capabilities include safe local shell/file inspection, built-in IAB browser, official OpenAI Docs, skill creator/installer already in the catalog, review tooling and existing project suites. Tool availability is not proof that every connector is configured/authenticated. No credential-bearing configuration was opened and no MCP/account was registered. Historical agent names are not an approved agent installation plan; no agents were created or invoked for this stage.

The [skills matrix](SKILL_EVALUATION_MATRIX.csv) evaluates seven external candidates from the exact requested repositories, plus existing capabilities. Repository pins: ComposioHQ be2a406907dbc61b73e6827ded415c96139d13a2; sickn33 dee7acce0658c35cb276154892700811affcfdb2. Complete candidate folder enumeration and per-file hashes are in [skill source evidence](evidence/SKILL_SOURCE_EVIDENCE.json). Full text/scripts/references were read as data; an unwanted nested component archive was inventoried, not cleared for reuse. Missing/transitive references and unsupported host assumptions are explicit in the [security review](SKILL_SECURITY_REVIEW.md).

Recommendation: existing tools suffice; optional later adoption of only pinned `fixing-accessibility` with MIT notice is reasonable after owner approval. Other reviewed candidates are deferred or rejected. No broad catalog installer, AAS CLI/MCP, skills pack, agent orchestration or scaffold is recommended. Static audit is not proof of safety, and a catalog's “risk” label is not an independent rating. [Official skills documentation](https://developers.openai.com/plugins/concepts/skills) describes optional scripts/resources around instructions; those capabilities do not replace permissions or local compatibility review.

## Outputs and unresolved prerequisites

Seven core living docs now distinguish observed/accepted/proposed/mock/tested/unknown/future states. Detailed outputs: reuse/skills/metrics CSVs; this report; architecture/routes; fixed/dynamic diagnostic contract; gate/sequence decision; owner decisions; root AGENTS proposal; acceptance plan; source/check/skill/browser evidence and final manifest. These are review artifacts, not new working API endpoints or application source.

The [gate decision](STAGE_2_ENTRY_GATE_AND_SEQUENCE_DECISION.md) proposes a separately authorized minimal Stage 1B, with exact baseline metric families M01–M11 (15 concrete metric IDs) and six intentionally gated future metrics M12–M17. The owner must approve the meaning of complete, local versus cross-device scope, question/key blueprint, skip/retake/migration/media policy, stack preservation and any skill adoption. Acceptance tests and human sign-off must follow that implementation. Stage 2 cannot begin from this report.

**Stop condition reached: Stage 1A deliverables complete; owner decisions pending. No Stage 1B/Stage 2/installation/implementation/backend work is authorized.**
