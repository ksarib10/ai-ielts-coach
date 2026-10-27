# Slice 1 visual acceptance audit

2026-10-27, Asia/Karachi. **NEEDS_CORRECTIONS — ready for owner review, not ready for unconditional visual acceptance. Human acceptance remains PENDING.**

Read-only audit of the existing Stage1B Slice1. No source, CSS, routes, questions, scores, dependencies, learner migration or Git history was changed. Only this new review folder is added. No GitHub authentication, remote/push, Vercel work or further stage was resumed.

## Checkpoint and method

Development root: `C:\Users\ksari\source\repos\ai-ielts-coach`. Baseline `93dd4a2641753e5afb7f3ad3ccb6d22230502f82`; implementation `b9f49f52b06d5b755737696242ba1ab737d612b7`; audited HEAD `f95fc5898a3048f01e9384e336c543de6cb1f505`. Initial tracked working tree was clean, branch main and no remote. Existing [summary](../SLICE_1_REPORT.md), [Git checkpoint](../GIT_CHECKPOINT.md), [scope](../PRE_CHANGE_SCOPE.md), change manifest, current route/design/feature documents and live source route table were used. Historical reports are unchanged.

Started the existing script `npm run dev -- --host 127.0.0.1 --port 4497 --strictPort` successfully (Vite6.4.3). A separate local origin was used for disposable synthetic profile Visual Audit, General Training target7.5 and one original Grammar response. Existing learner origins were not reset or edited. No credentials were supplied, account created, productive response captured, audio generated or reset confirmed. Browser actions necessarily saved this disposable profile/appearance/answer through the existing UI only.

Reused the committed seven-suite, TypeScript and production-build logs under [existing evidence](../evidence/). **No new full suite or build was run during this audit.** Those checks establish the previous technical checkpoint; they do not establish visual accessibility. Focused browser rechecks followed the newly observed navigation problem.

## Actual route coverage

**14 routes visually reviewed**, including all6 onboarding steps (19 primary screen states before menus/dialogs);1 additional destination-only quick-action check to `/learn`. Not every route/theme/width combination was exhaustively tested.

| Actual route | Inspected theme / viewport combinations and scope |
|---|---|
| `/` (`/#/`) | Dark1440 hero, Light390 hero, Dark390 footer/CTA |
| `/login` | Dark1440; empty submit focused required Email; secondary links |
| `/signup` | Light320; form layout, labels and demo wording; no submission |
| `/forgot-password` | Dark390; recovery form and navigation; no email sent |
| `/onboarding` | All6 steps; Dark1440 profile/error, Light390 goals/language, Dark320 study/invitation; Previous/Next and retained choices |
| `/dashboard` | Dark1440/1024/768/390/320; Light1440; expanded baseline states; goals, deferred/in-progress participation and actions |
| `/diagnostic` | Dark1440/320; Light390; existing Grammar question, skip/save/resume and strict header; no assessment submission |
| `/progress` | Dark1440 empty history and unsupported trends |
| `/readiness` | Dark1440 and Light390; unavailable metrics and actions |
| `/reading` | Light390 hub, locked practice and sample navigation |
| `/writing` | Dark1440 hub, General Training resources and active navigation |
| `/listening` | Dark1440 hub and active navigation; no media completion claim |
| `/speaking` | Dark320 hub and sample Coach panel; no microphone interaction |
| `/settings` | Dark390 saved synthetic profile/goal and form alignment; no Save preferences |

Supplemental UI: mobile drawer, account menu, reset confirmation/cancellation, focus indicator, coming-soon entries and public footer. `/learn` was checked only as the Explore lessons destination, not as a complete learning-workspace audit. `/diagnostic/results` was not reached because no diagnostic was submitted; its prior source/presentation evidence is reused rather than fabricated as a fresh browser pass.

## What passed within the exercised scope

- Both themes share a recognizable purple shell, card geometry, system typography and primary-action language. The main dashboard hierarchy is clear. Gradients/glass are restrained rather than animated or distracting in the checked diagnostic header/workspace.
- Theme switching works; Light and Dark survived actual reloads. Explicit keyboard focus was visible on the account control. Normal mobile drawer Tab/Shift+Tab wrapping, background inertness and Escape return passed; account Escape and reset cancellation also passed. The separate responsive race below limits any blanket navigation-pass claim.
- Dashboard had no page/main horizontal overflow at all5 requested widths. Two-column hero remained at768/1024 and stacked at390/320. Representative auth, settings, module, diagnostic and public views also fit the measured viewport; diagnostic section tabs use contained horizontal scrolling.
- Synthetic saved track/goal remained labeled as a self-declared goal. Skipping reached Dashboard; participation changed truthfully from deferred to in-progress. Resume restored the selected original G1B response without reselection. Diagnostic had no sidebar/Coach assistance.
- All15 baseline IDs were inspected in the expanded disclosure. Only saved goal/participation were shown; other values remained unavailable, not invented zeroes. M12–M17 were all UNSUPPORTED. Progress/Readiness showed no fabricated bands, CEFR, mastery or readiness charts. All4 hubs displayed validation pending/Not assessed with no old band or diagnostic-priority badge.
- Future sidebar features are disabled non-links with Coming soon labels. Existing AI/Mock/Exam destinations carry Demo labels. Sample Coach disclosure is present. Public illustrative band5.5 is explicitly a sample, not the current learner's score.
- Onboarding error text is visible with role=alert, although input association needs correction. Blank auth submission prevented navigation and focused Email; a native error tooltip was not reliably exposed by this browser and is not claimed verified.

## Findings and recommended correction scope

**P0=0; P1=3; P2=2; P3=2.** P0=none observed, not a security/data-loss certification. See [exact register](UI_ISSUES_REGISTER.csv) and [screenshots](SCREENSHOT_INDEX.md).

| ID | Priority | Finding | Scope |
|---|---|---|---|
| VA-01 | P1 | Dark diagnostic options/completion panel, Coach context strip and public bottom CTA retain pale backgrounds with pale text. Actual diagnostic contrast 1.39:1; Coach context 1.06:1. | Medium, focused semantic-surface mapping |
| VA-02 | P1 | Dark auth navigation retains blue links; measured 2.8:1 against card. | Small, link-state styling |
| VA-03 | P1 | Visible desktop sidebar can remain aria-hidden/inert after immediate mobile route change→desktop resize. | Small/medium, drawer synchronization plus focused regression |
| VA-04 | P2 | Floating Coach overlaps mobile explanatory text/action area and Settings date-field area. | Small/medium, responsive positioning/clearance |
| VA-05 | P2 | Onboarding inline error is not associated with invalid input; focus stays Continue. | Small, field semantics/recovery |
| VA-06 | P3 optional | Duplicate blue/purple progress treatments dilute visual consistency. | Small, only after aesthetic choice |
| VA-07 | P3 optional |320px onboarding hero has edge-to-edge copy unlike inset form cards. | Small, owner gutter preference |

VA-03 reproduction: at390px open Readiness, use Back to dashboard and immediately resize to1440. The sidebar was visibly240px wide with `aria-hidden=true` and `inert`, while `matchMedia(max-width:1050px)=false` and the opener had display:none. Observed once initially and once in2 focused follow-up attempts; another attempt passed. Reload cleared the mismatch. This is intermittent evidence, not a deterministic all-runs failure. Screenshot alone cannot show inertness: pair it with the recorded DOM observations. Likely cause, inferred from `useNavigationDrawer.ts`: media subscription is attached without synchronizing current state at attachment, allowing a route-remount/resize timing gap. Remediation must confirm the cause rather than assume it.

VA-01/02 likely result from remaining hard-coded legacy selectors and colors. Foundation maps question-choice/option-row, but rendered answer labels use `.option`; several nested light surfaces are outside the semantic override. Actual browser styles, not only token-pair tests, must be reviewed after any future patch. Contrast ratios use the standard sRGB relative-luminance formula on observed opaque colors; they are spot measurements, not a full WCAG audit.

Recommend one separately authorized **focused visual/accessibility correction patch**, medium overall scope, addressing VA-01–VA-05. Preserve current architecture, data, routes and scoring. No framework/package/theme-token redesign or diagnostic implementation is needed. Recheck affected actual selectors in both themes, mobile overlap and rapid route/breakpoint transitions. VA-06/07 are optional owner decisions, not automatically classified implementation failures. No corrections were made here.

## Assessment against the ten visual criteria

| Dimension | Observed assessment |
|---|---|
| Hierarchy | Main dashboard heading→goal/participation→skills is clear; repeated unavailable cards and disclaimers create a long overview. Density is an owner choice. |
| Typography/readability | Core shell readable; dark legacy subcomponents/auth links are blockers. Long invitation copy is tight at320. |
| Alignment/spacing | Shared cards/actions generally align; floating Coach obscures mobile content. Onboarding gutters vary. |
| Token consistency | Purple tokens work for shared surfaces but do not reach every old selector. Blue progress remnants remain. |
| Dark/light quality | Light overview is cohesive; dark gradients restrained, but dark acceptance fails on several pale islands. |
| Navigation | Normal drawer/menu behavior is usable; route/resize race is a functional blocker. |
| Forms | Labels and native controls readable; inline error visible, field association incomplete. |
| Responsive | Representative reflow passes all widths; transition correctness and floating-control clearance need correction. |
| Accessibility foundations | Focus, native controls, skip link and tested Escape behavior exist; actual contrast and error semantics remain incomplete. |
| Honesty | Goals, participation, unavailable statistics and sample labels are appropriately distinguished in exercised states; no final metric acceptance implied. |

## Limits, continuity and owner decisions

Only viewport/visibility browser capabilities were exposed; no forced-color/reduced-motion emulation was available. Actual environment reported both preferences false, document/body zoom1 and visual scale1. Existing CSS contains reduced-motion and forced-colors rules, but real OS behavior, screen readers,200% text zoom and assistive hardware remain **UNVERIFIED**. So do full Exam completion, microphone/audio verification, submitted-result visual state, populated genuine history, storage-denial recovery and exhaustive browser/device combinations. No WCAG certification or diagnostic/scoring-quality claim.

The seven living documents remain authoritative and untouched. This audit adds dated evidence only. `UI_DESIGN_SYSTEM.md`'s opaque/readable assessment intent is not fully met by actual dark `.option` surfaces; `FEATURE_REGISTRY.md`'s bounded theme/navigation testing does not cover the newly observed timing race. Prior technical token-pair tests and earlier smoke passes remain historical facts; they do not supersede these observed failures. Do not silently rewrite old reports or mark features accepted.

Owner decisions: accept/request changes to exact purple hues, glass intensity, typography/density, progress treatment and320px gutters; authorize the focused correction patch; decide disposition of P2/P3 items; then explicitly accept or reject the corrected previews. All approval fields in the [owner checklist](OWNER_VISUAL_ACCEPTANCE_CHECKLIST.md) remain pending. Full Stage1B, all15 metric gates and DiagnosticV1 are unfinished; Stage2 remains blocked. No GitHub or Vercel step is authorized by this report.

STOP: audit complete; await owner review. No source implementation commit was created.
