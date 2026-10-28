# Comprehensive theme consistency remediation

2026-10-28. **Implemented and validated; owner visual acceptance PENDING.** Base `f548c54d2c916e7bfcc18d0e62231f0d8bf83e3c`; local branch `fix/theme-consistency-contrast`. The commit containing this report is the local checkpoint; its exact hash is returned in the final handoff. No merge, push or deployment.

## Root causes and correction

Before corrections, legacy styles fixed pale backgrounds while dark slate aliases changed foregrounds to white/lavender. Exam hero actually rendered near-white gradient endpoints with rgb(255,255,255) h2 and rgb(211,197,226) body copy. Prototype selectors also fixed paragraph/link colors independently. Eleven referenced palette names were undefined. Token-only tests missed these actual cascade combinations. [Pre-change investigation](PRE_CHANGE_INVESTIGATION.md) was recorded before applying changes.

Corrected 253 literal color declarations in existing styles.css/prototype.css, plus interactive border pairing and transitions; foundation.css centralizes status/disabled/highlight/subtle/opaque/hero roles and compatibility aliases. No JSX/component or screen layout rewrite. Filled controls use on-action; informational hero gradients use surface/text. White fixed PDF canvas pixels and previously deferred decorative module progress fills are deliberate exceptions. All other legacy background literals in these sources are guarded against reintroduction. No !important additions or blanket background override.

QA also exposed transient mixed foreground/background colors during rapid appearance changes and a Light mobile control border at 2.97:1. Legacy color/background interpolation was removed; border token corrected to #856b98. Final checks pass. Existing disabled/checked/selected/completed text, icons and native semantics remain.

## Actual verification

- 178 retained passing computed-browser checks; 23 initial failing **observations**, not23 independent bugs, retained separately. Normal text minimum 5.21:1, audited component boundary minimum 3.75:1; larger text meets3:1. [Computed results](BROWSER_CONTRAST_RESULTS.json), [representative exact pairs](REPRESENTATIVE_CONTRAST.csv).
- Both themes at 1440/390/320px on Exam setup, instructions/checklist, representative Listening/Reading/Writing/Speaking workspaces, combined result and key diagnostic surfaces. Full seven-section Exam progressed through existing UI to combined result with empty disposable submissions; no clock or progression changes. Academic selected and General Training setup inspected; actual journey General Training.
- Diagnostic original G1 B was observed unchanged at entry. Skip→dashboard→Resume returned to Listening position. Further synthetic objective choices,200-word disposable Writing and existing no-microphone fallback reached productive/completion/result presentation; audio used the original Play once control. No microphone permission granted or actual recording/source validation claimed. These are disposable Visual Audit localhost4497 records, not real learner data.
- Learn/four hubs/About/Progress/Readiness/Settings/authentication/onboarding checked in both themes across the three widths; no page-level horizontal overflow in final measured checks. Readability/layout screenshots are representative, not full pixel/assistive-technology certification. Native controls verified Light/Dark reload persistence, System selection, reset-dialog cancellation and visible focus. No reset confirmed.
- Focused `node qa/theme.test.mjs` PASS; final full `npm test` run once, all nine suites PASS; TypeScript `--noEmit` exit0; `npm run build` exit0 (Vite6.4.3,1640 modules; JS410.86kB/gzip126.84kB; CSS123.12kB/gzip22.40kB). [Test log](test-results.txt), [TypeScript](typescript-results.txt), [build](build-results.txt). Historical scoring-test messages are regression checks, not validated Diagnostic V1/IELTS marking.

`qa/theme.test.mjs` tests legacy surface/gradient regressions, defined variables, disabled/status pairing and atomic theme transitions, including deliberately bad fixture declarations that the guard rejects. `qa/computed-theme-audit.mjs` runs read-only in the actual browser. npm test verifies recorded computed results and static guards; it does not launch an independent browser session.

## Evidence and preserved behavior

[Screenshot index](SCREENSHOT_INDEX.md) contains25 actual before/after captures. Visible viewport/inner-scroll captures are labeled by state/theme/width. [Preservation results](PRESERVATION_RESULTS.json): 64 versioned non-CSS source/media/config/lock files byte-identical;36 candidate-bank files equal base. No questions/keys/order/scoring/audio/capture/Exam rules/route destinations/learner schema changed. Dependency lockfile unchanged, no installation. Original restored source/backup and historical audits untouched. Five living docs updated; route/data-contract authorities unchanged because their responsibilities/contracts did not change.

## Failed attempts, recovery and limits

Initial browser binding required reset; early contrast helper had a malformed comment boundary, then used parseFloat unavailable in the restricted read-only scope. Both corrected before valid checks. An early boundary calculation incorrectly compared a filled control only with its inside fill; corrected to border/fill against the adjacent surface. UTF-8 evidence packaging initially failed under Windows' default text decoding and was rerun explicitly as UTF-8. No passing result fabricated from those errors.

A previously opened short timed module sample expired normally during this long audit; its result screen was checked. Later Playwright control calls reported detached elements. Native CUA accessibility controls successfully completed persistence/System/focus/reset-cancellation checks; no app-code/reload workaround was presented as a fix for an app defect. One guessed Reading heading was corrected using the actual UI title. The Exam journey itself and diagnostic section progression completed successfully before these late tool-control failures.

Computed contrast uses actual getComputedStyle values, alpha-composited ancestor layers and conservative gradient endpoints; it does not certify native media chrome, pictogram pixels, actual OS high-contrast, independent screen readers or microphone hardware. Existing reduced-motion/forced-colors protections retained. These limitations do not convert untested states into passes. Owner review remains required. No known remaining measured text/control contrast failure in retained final checks; no complete WCAG certification.

Diagnostic V1 remains unapproved, all 15 baseline metric IDs still need genuine implementation/verification/human acceptance, M12–M17 unavailable, Stage2 blocked. STOP after local checkpoint. Owner approval is required before publishing or further development.
