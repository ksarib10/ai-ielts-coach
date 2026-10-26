# Backup and Git-readiness report

2026-10-24 · Asia/Karachi · **PREPARATION ONLY — Stage 1B implementation NOT AUTHORIZED; Stage 2 BLOCKED.**

## Verified root and preservation

Authoritative project: `C:\Users\ksari\OneDrive\Desktop\ai_ielts_coach_app`. Its actual root matches the Stage 1A manifest. All **82/82 original source/artifact hashes** and **34/34 recorded documentation hashes** match; all **35 Stage 1A document paths** exist. The manifest omitted its own self-hash, so its current SHA-256 is captured below rather than claimed historically certified. No files are missing or unexpectedly added in the frozen 117-file inventory. Existing code, `.gitignore`, dependencies, assets, original build, seven living docs and historical evidence are unchanged. No Git metadata or parent Git repository was found.

Current build integrity is verified against Stage 1A: the existing JS/CSS/index assets match their recorded bytes. No fresh build/test run was needed or performed; the preserved Stage 1A logs record those successful checks. Backup verification does not validate the proposed new diagnostic/statistics implementation.

## Independent backup — completed

Backup directory: **`C:\Users\ksari\Backups\AI_IELTS_Coach\2026-10-24_PreStage1B_01`** (outside OneDrive and the Codex cache).

- `project_snapshot/`: all **117 files / 10,785,098 bytes**, including source, original samples/assets/references, configuration/lockfile, generated historical artifacts and all Stage 1A documentation.
- `AI_IELTS_Coach_PreStage1B_Source_and_Docs.zip`: identical snapshot in ZIP form; CRC and every archived file's SHA-256 passed.
- `AI_IELTS_Coach_Complete_Restored.zip`: byte-verified retained copy of the earlier complete restored Windows environment ZIP, including dependencies. It matches all 82 original Stage 1A source entries but lacks the later docs; use the new snapshot for current source/docs.
- `BACKUP_MANIFEST.json`, `SHA256SUMS.txt`, `VERIFY_BACKUP.py` and `preparation_records/`: inventory, checksums, read-only verification helper and copies of this preparation report/proposal/evidence.

A real extraction round trip restored and verified **117/117 files** in an isolated audit folder without running the application. Snapshot scope excludes `node_modules/` (retained in the separate older full ZIP), browser-profile learner storage/session recordings and nonexistent historical Git metadata. No browser learner data was accessed or reset. Byte equality is certified; NTFS ACLs/alternate streams and OneDrive version history are not backed up.

An earlier independent-from-working-folder ZIP already existed in the Codex visualization directory; its recorded hash and CRC pass, but it has zero Stage 1A docs and cache-lifecycle risk. The new copy removes reliance on that cache location. All observed copies remain on C:; no off-device backup is verified.

## Recorded SHA-256 values

| Artifact | SHA-256 |
|---|---|
| New source/docs ZIP | `3c8def6d009423052aa3ab36a4dbc0590332631ccb035b920c48f8eb252760f5` |
| Frozen 117-file tree | `b60b01a8415a80c6f04a4fe935c0862e15579c4a54560d068609504cc5e53969` |
| Stage 1A source snapshot | `7ce9e96d2fc07abaee6efe99a1106a6cfb72922e7aea91e6d9fbdef7aac925e3` |
| Current Stage 1A manifest | `3d810eb1c33dc1dc2ee5f6a03984522412f1ba435716992e488a75933955ad04` |
| Retained full environment ZIP | `d0c8622d8aa1f412ba934b0c90e7631e981a009c402c1660765aa807da10a91f` |

Tree digest is SHA-256 of sorted UTF-8 `path<TAB>bytes<TAB>sha256<LF>` entries. Per-file values are in the backup manifest. The three new preparation records were created after freezing the project and are stored separately under `preparation_records/docs/reviews/stage-1b/preparation/`; restore them optionally after the original snapshot. No historical documentation was overwritten.

## .gitignore review — root file unchanged

Dependencies, dist, TypeScript metadata, .vercel and logs are already excluded. Gaps: no explicit `.env`/credential/private-key/local learner-export protection; only one of six generated QA helpers is excluded. The broad `*.log` would also omit three required Stage 1A audit logs from a future initial commit. [GITIGNORE_PROPOSAL.txt](GITIGNORE_PROPOSAL.txt) proposes targeted rules and an explicit allowlist for those reviewed logs; it is not installed. No sensitive/local learner-data filenames were found in the 117-file inventory. This was a name/rule audit, not proof of no embedded secrets. A redacted content/staged-file review is still required before committing. Do not blanket-ignore JSON/CSV, the lockfile or versioned development fixtures. [Git ignore documentation](https://git-scm.com/docs/gitignore) explains ignore patterns and their limits.

## Git and development-location plan — approval required

Recommend a **new copy**, not a move, at `C:\Users\ksari\source\repos\ai-ielts-coach`. That location is outside OneDrive and currently absent; it has not been created. Keep this original root and backup intact until the copied working tree is byte-verified and explicitly approved as the development root.

After separate approval only: (1) copy/verify into the chosen local path; (2) approve ignore rules and review candidate files for secrets plus any Git template/hook/signing settings; (3) initialize a new repository with main as the initial branch; (4) preview staging with `git add --dry-run` and inspect the actual staged diff/list; (5) create one honestly dated “Record restored prototype baseline” commit with the owner's chosen identity; (6) record its real commit ID and preservation evidence. No backdated commits, fabricated history, remote or push. These are written plans, not executed commands. See [Git initialization](https://git-scm.com/docs/git-init) and [dry-run staging](https://git-scm.com/docs/git-add).

## Recovery and outstanding decisions

1. Preserve the working project; do not extract over it. Verify both archives and the frozen snapshot by running the backup's read-only `VERIFY_BACKUP.py` with existing Python.
2. Extract the new source/docs ZIP into a fresh empty folder; the project is inside `ai_ielts_coach_app/`. Run `VERIFY_BACKUP.py` with that extracted project path to compare every restored file.
3. Optionally copy the three preparation records into the matching docs path. Retain the manifests/checksums separately. Dependencies may later be restored from the retained full Windows ZIP or installed from the lockfile only with appropriate approval; no installer runs as part of this recovery verification.

Remaining risks: same-drive failure; prior regenerated lockfile/tooling provenance; no Git history; browser progress/session audio outside project backup; possible embedded secrets not certified by name-only review. Copy the verified archive/checksums to an owner-chosen external/off-device location for physical resilience after approval. Do not treat a Git commit as a backup of browser data.

D01 preservation/new Git baseline and local working-copy choice still need owner acceptance. D04/D05 and the purple dual-theme direction were accepted in the draft; they do not authorize code. D03, D06 and D07 remain unresolved. **No Git initialization/commit/push, project move, package installation or application change occurred. STOP for owner approval.**
