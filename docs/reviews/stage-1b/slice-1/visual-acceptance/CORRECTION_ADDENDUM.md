# Visual correction addendum — VA-01 to VA-05 (post-fix evidence)

2026-10-27 (Asia/Karachi). Base HEAD `f95fc58`; corrections applied to the working tree and committed in the local correction checkpoint. **Human visual acceptance remains PENDING.** The original audit files in this folder are unchanged and remain the *before* evidence (26 screenshots in `screenshots/`). New *after* evidence lives only in [`post-fix/`](post-fix/).

## Method and honesty notes

- Interrupted Codex work was recovered, not restarted. Fixes were inspected in the actual diff, then re-verified live against `npm run dev` (port 4498) using headless Chrome driven over the DevTools protocol (the bundled Antigravity browser could not start: Playwright driver download blocked). Disposable synthetic profile ("Test"); no credentials, no real learner data, no Reset.
- Codex's earlier reports ("ten cycles passed", etc.) were **not** reused as proof; every value below was re-measured in this session. Codex-era screenshots were not present in the repository.
- Contrast = sRGB relative-luminance ratio of the computed foreground over the effective opaque background (alpha composited up the ancestor chain). Spot measurements, not a WCAG certification.
- Raw data: `post-fix/post-fix-measurements-{a,b,c,d,e}.json`. Run A aborted early (wrong waits; login/diagnostic not yet rendered) and is kept only as a record; B–E supersede it where they overlap.

## Results

| ID | Before (audit) | After (measured, working tree) | Status |
|---|---|---|---|
| VA-01 | Dark diagnostic option 1.39:1; Coach context 1.06:1; CTA headline near invisible | Dark `.option` 14.97:1; selected 11.90:1; option letter 11.90:1; progress panel 14.97:1; Coach context 14.97:1; CTA h2 14.97:1, p 8.99:1. Light: option 16.10, selected 13.10, panel 16.10, CTA h2 16.10 / p 6.82. Dark option keyboard focus outline `solid 3px rgb(222,200,255)`. | **Verified** (dark all states; light focus outline not re-measured in browser — same shared `.option:focus-within` rule; **unverified** in light) |
| VA-02 | Auth links 2.8:1 | Dark login/recovery links 8.17:1 (card bg rgb 34,23,47); light 7.66:1; underlined. Keyboard focus ring `solid 3px rgb(222,200,255)` observed on dark Forgot password link. Live login screenshot shows the full form (email, password, Log in, both links). | **Verified** |
| VA-03 | Visible 240px sidebar inert/aria-hidden after mobile→desktop | 10× mobile route (Readiness → Back to dashboard) → immediate 1440 resize and 10× 1440→390→route→1440, sampled at 0/100/350/1500 ms: **0** visible-but-inert/aria-hidden sidebars at every sample (20 cycles × 4 samples). Mobile closed: off-canvas, inert, aria-hidden. Drawer open: 16 Tab/Shift+Tab presses stayed inside drawer, background inert, Escape closed it and returned focus to "Open navigation". | **Verified** (intermittent defect — absence over 20 cycles is strong, not proof of impossibility) |
| VA-04 | Fixed Coach overlapped text/action at 320 and Settings 390 | Launcher is now `position:static`, docked below the scroll region (top 746 ≥ scroll bottom 738). Scroll sweep (150px steps) of Speaking 320 (24 positions), Speaking 390 (22), Settings 390 (12): **0** visible overlaps with any text/control. | **Verified** |
| VA-05 | Error unassociated; focus stayed on Continue | Blank name: `aria-invalid=true`, `aria-describedby=onboarding-field-error`, focus on First name, alert text "Enter your first name to continue." Typing "Kept" and leaving context blank: focus moves to the select with `aria-invalid=true`; first name still "Kept" and no longer invalid. Choosing a context clears the alert. Unit coverage added in `qa/foundation.test.mjs`. (Choice-group branches for reason/self-assessment are unit-tested only.) | **Verified** (text fields/select in browser; choice groups unit only) |
| VA-06 | Optional progress treatment | Not changed — deferred to owner | **Deferred** |
| VA-07 | Optional 320px hero gutters | Safe local gutter `padding-inline:16px` at ≤430px retained | **Implemented, owner decision pending** |

Diagnostic skip/resume unchanged: selecting option B, leaving to the Dashboard and returning restored the same selected option (`[false,true,false,false]` before and after). Scoring, question content and storage code are untouched.

## Note on transient samples

One early sampling approach read the sidebar in the same task as a CDP resize, before React could re-render, and saw `inert` for a moment. That is an instrumentation artifact (media state already `false`, DOM not yet committed); the refined run (run D) samples after real timers and shows none.

## Validation (this session, working tree)

`npm test` — 7 suites PASS. `node node_modules/typescript/bin/tsc --noEmit` — exit 0. `npm run build` — success (1633 modules).

## Not verified

Screen readers, 200% zoom, OS forced-colors/reduced-motion, other browsers/devices, light-theme option focus ring in browser, exhaustive routes. Not WCAG certification.
