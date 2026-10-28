# UI design system

## IELTS About reference components and question-type accordions — 2026-10-28

`src/features/discovery/about/AboutComponents.tsx` and `.about-*` rules in `src/foundation.css` add reusable semantic-token components for the nine IELTS About guides: `HighlightCard`, `SourceLinks` (host-badged external pill links distinguished from internal navigation), `AboutTabs` (roving-tabindex WAI-ARIA `tablist`/`tab`/`tabpanel`), `AccordionItem` (`h3`/`h4 > button[aria-expanded]` controlling a labelled `role="region"` panel with subtle chevron rotation respecting `prefers-reduced-motion`), `AboutSection` and `AboutNotice` (info/warning semantic surfaces). `.about-question-types` matches the clean separator-row layout and typography for the 6 Listening and 11 Academic Reading question types (`What's involved?`, `What skills are tested?`, `How many questions are there?`, `Practical note`, and official sources). Responsive grids collapse cleanly at `≤1050px` and `≤760px`, with `forced-colors` support and zero horizontal overflow verified at 1440px (dark/light) and 390px.

---

## Theme consistency remediation — 2026-10-28

Source-level correction supersedes affected Slice 1 color mappings below. `styles.css` and `prototype.css` legacy component declarations now use semantic surfaces/foregrounds instead of hard-coded white/pale/blue-gray colors. `foundation.css` remains the final theme/token layer; it adds opaque/subtle surfaces, shared hero gradient, success/warning/error surfaces, disabled and highlight pairings, and resolves eleven missing legacy aliases. Light/dark/System application and storage provider are unchanged. Existing layout, React architecture and approved purple direction are retained; no additional framework, blanket background rule or route-specific override pile.

Legacy slate/status variables are compatibility aliases to semantic roles. White foregrounds on filled actions use on-action; informational gradients use surface/text. Reading/editor/media/timer/footer/table surfaces remain opaque. Fixed PDF canvas pixels and the previously deferred decorative module progress gradients are deliberate exceptions. Disabled controls retain readable labels without opacity reduction; selected/completed states retain native checked/disabled state, outlines and existing check icons/text. Light control border is #856b98 after measuring 2.97:1 for its predecessor on lavender. Color/background transitions were removed so rapid theme changes do not interpolate incompatible palettes; movement/width transitions and reduced-motion handling remain.

Actual computed/browser evidence: 178 retained passing checks across both themes,1440/390/320px; normal text minimum 5.21:1 and audited control boundaries minimum 3.75:1. Full seven-section disposable Exam progressed through combined results; diagnostic Reading/Listening/Writing/Speaking/result and shared pages inspected. Both themes survive reload; System selection, native keyboard focus and reset cancellation verified. Gradient endpoints/alpha ancestors are conservatively composited; native media/pictogram pixels, independent screen readers and OS high-contrast/hardware were not certified. `qa/computed-theme-audit.mjs` is a read-only browser scanner; `qa/theme.test.mjs` guards semantic surface declarations/missing aliases/transitions and verifies recorded browser evidence (npm test does not launch a browser). [Report](reviews/stage-1b/theme-consistency/THEME_CONSISTENCY_REMEDIATION_REPORT.md), [computed evidence](reviews/stage-1b/theme-consistency/BROWSER_CONTRAST_RESULTS.json), [screenshots](reviews/stage-1b/theme-consistency/SCREENSHOT_INDEX.md). Owner acceptance pending.

---

## Slice 2 discovery and navigation components — 2026-10-28

Existing provisional purple light/dark/system tokens, opaque assessment surfaces and CSS architecture are retained. `CatalogCard` reuses shared `Card`, Lucide icons, h2/description, truthful availability and uniquely named links. Discovery grids use three columns, two at ≤1050px, one at ≤760px; min-width:0, wrapping titles, 44px action targets and semantic text/action/surface tokens support narrow layouts. Category/info and Progress subnavigation share the existing visual language; no dashboard redesign.

`DevelopmentPreview` is a native keyboard-operable disclosure in AppShell (including strict headers). It consolidates repeated shell demo/sample warnings, explains shared-device identity, browser-only saves, scripted Coach and unvalidated diagnostic, and links Settings. Escape closes it and returns focus. QA found the initially right-anchored panel clipped left at 390/320px; a localized ≤760px fixed inset panel now stays inside the viewport with bounded height/scrolling. Existing mobile Coach dock and navigation focus protections remain unchanged.

Actual browser DOM/reflow checks cover Learn, four hubs, IELTS About, Progress, Readiness and Exam at 1440/390/320px in both themes; representative screenshots support visual inspection. No page-level horizontal overflow observed. Card keyboard focus is visible; native drawer keyboard behavior and three mobile/desktop cycles passed. Theme reload persistence passed. Existing foundation contrast tests pass, but no independent screen-reader/hardware/WCAG certification is claimed. Exact aesthetics and new Slice 2 owner acceptance remain pending. Evidence: [screenshot index](reviews/stage-1b/slice-2/SCREENSHOT_INDEX.md).

---

## Implemented provisional purple foundation — 2026-10-27

`src/foundation.css` loads after existing styles; it adds semantic light/dark tokens, layered purple gradients, restrained translucent navigation/cards, opaque diagnostic/editor/content surfaces and a no-blur fallback. It does not replace the existing CSS architecture or introduce a component library. Reading passages, Writing editors and long content retain opaque backgrounds. Existing assessment content/timing behavior is unchanged.

`features/appearance` separates preference types, storage service, provider hook and labeled native select. Values are light/dark/system; default system is resolved before initial render. Preference key is `ielts-appearance-v1`; changes follow system/storage events. Failed persistence leaves an in-memory selection with feedback. Learner stores are not rewritten. `features/shell` separates typed navigation, availability data, drawer focus behavior and sidebar rendering. `features/dashboard/components` owns reusable availability and unassessed-module status presentation.

The new tokens distinguish text, muted text, action/on-action, control border, focus, danger/success and surface roles. Both token sets pass focused text-pair contrast >=4.5:1 and control-border contrast >=3:1 tests; this is not an audit of every historical selector. Visible focus, reduced-motion and forced-colors rules exist. Dark module tabs, reset-dialog contrast and inherited section-caption colors were corrected after browser/screenshot inspection. Native controls keep accessible names and unavailable navigation has no functional link.

Actual browser checks: dashboard reflows without page/main horizontal overflow at 320, 390, 768, 1024 and 1440 CSS px; Reading hub also checked at 320px. At 320px drawer open focuses Close, background is inert and Escape returns Open navigation; account-menu Escape and reset cancellation pass. Light/dark screenshots are in [Slice 1 evidence](reviews/stage-1b/slice-1/evidence/). Human appearance acceptance, screen-reader audit, 200% text zoom, actual OS forced-colors/reduced-motion testing and full legacy-workspace visual audit remain unverified. Exact colors and glass treatment remain provisional pending owner review.

Visual-acceptance corrections (2026-10-27): legacy `.option`, `.diagnostic-progress-panel`, `.coach-context`, `.marketing-cta` and `.auth-links a` now map to semantic surface/text/action tokens (measured 7.7–15:1 in both themes) with forced-colors overrides. On ≤760px the Coach launcher is a static dock below the scroll region instead of a fixed overlay. The navigation drawer reads the 1050px breakpoint via `useSyncExternalStore` and syncs `inert` in a layout effect. Onboarding errors use a stable `onboarding-field-error` id with `aria-invalid`/`aria-describedby` and focus on the first invalid control. Evidence: [correction addendum](reviews/stage-1b/slice-1/visual-acceptance/CORRECTION_ADDENDUM.md); owner acceptance pending.

---

## Historical Stage 1A record — 2026-10-23

The dated record below is retained; current deltas above take precedence for the affected Slice 1 scope. Historical review reports are unchanged.

2026-10-23. This document records existing design evidence and draft adoption rules, not permission to restyle the app. STAGE_2_ENTRY = BLOCKED.

## Observed foundation

`src/styles.css` defines brand/slate/emerald/amber/rose/AI scales, shadows and `--radius:16px`. `src/prototype.css`, imported later, overrides brand and AI values and adds dense layout corrections. Examples: original `--brand-600:#2563eb` is overridden by `#2459d3`; purple AI tokens are partly overridden with blue. Numerous hard-coded colors remain. There is no observed dark-theme selector, theme store/provider or theme toggle. Larger text and reduced-motion CSS exist; they are not dark mode.

KEEP reusable visual structure: shared Button/Badge/Card/PageHeader/ProgressBar/EmptyState, sidebar/header, onboarding choices and stepper, native fieldset/radio controls, responsive activity panels, content blocks, accessible progress text and recovery UI. REFACTOR_AFTER_APPROVAL: two cascading monolithic stylesheets, compressed components, hand-rolled focus/menu behavior, form errors without consistent field association, and mock-only criterion/band displays. No WCAG certification is claimed.

Historical references in `reference/` and `standalone/` and the supplied screenshots express layout intent, not frozen tokens or production availability. The three archived HTML references are separate from the current React implementation. No competitor assets or fonts are copied by this review.

## Proposed semantic tokens — review required

| Token | Light candidate | Dark candidate | Purpose |
|---|---|---|---|
| `--color-bg` | #f8fafc | #0f172a | Page surface |
| `--color-surface` | #ffffff | #1e293b | Cards/dialogs |
| `--color-text` | #0f172a | #f8fafc | Main copy |
| `--color-text-muted` | #475569 | #cbd5e1 | Secondary copy |
| `--color-border` | #cbd5e1 | #64748b | Controls/separators |
| `--color-action` | #1d4ed8 | #93c5fd | Primary action |
| `--color-on-action` | #ffffff | #0f172a | Action text |
| `--color-focus` | #1d4ed8 | #fbbf24 | Visible keyboard focus |
| `--color-danger` | #b91c1c | #fca5a5 | Failure/destructive action |
| `--color-success` | #047857 | #6ee7b7 | Confirmed success |

These are PROPOSED_DESIGN candidates, not measured accepted combinations. Validate each actual text/state/background pair before acceptance. Use semantic role tokens rather than universal replacement of literal colors. Retain approved visual identity while separating status, mode and brand color meanings. AI mock copy must not gain authority from a decorative badge.

Typography proposal: retain the current system-first sans-serif stack; no new remote font dependency. Body 16px / 1.5+, body/small/heading tokens with rem units; do not encode meaning by size alone. Space scale 4/8/12/16/24/32px, radius 8/12/16px, two restrained shadow levels. Owners may approve this baseline or request visual exploration later; no theme PDF has been accepted as a frozen design specification.

## Proposed provider and component responsibilities

`ThemeProvider` supports light/dark/system, persists only the explicit preference, resolves system changes and avoids flash on load. Storage denial keeps an in-memory preference. Theme does not mutate learner/assessment records. Selection and resolved theme remain distinct. Accessible names/errors/focus stay consistent across both themes.

Shared component inventory: Button (primary/secondary/ghost/danger, busy, disabled reason); Field/FormErrorSummary (label, hint, aria-invalid/describedby); ChoiceGroup; Card/PageHeader; Tabs/NavItem; Dialog/Drawer/Menu (focus containment/Escape/return); Status/Loading/Retry/EmptyState; MetricCard (value+unit+availability+source date); Progress (text and bounded value); AvailabilityBadge; DiagnosticQuestion/QuestionNavigation; structured ContentViewer. Start from existing components; add primitives individually only if a specific interaction cannot be maintained reliably. No wholesale Tailwind/shadcn migration is proposed.

## Responsive and accessibility acceptance proposal

Existing breakpoints include 1050/760/430px with additional local overrides. Consolidation proposal: content-driven compact <760px, medium 760–1049px, wide ≥1050px; verify 320, 390, 768, 1024 and 1440px widths, 200% text zoom and reflow at 320 CSS px. Data tables may scroll within labeled regions; page-level horizontal scrolling is a defect. Dialogs fit/scroll within viewport; sticky footers cannot cover inputs or focus.

Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) as a future acceptance standard: text contrast 4.5:1 (3:1 for large text), relevant non-text contrast 3:1, visible/non-obscured focus, keyboard operation, descriptive labels/errors, native semantics, status announcements and reduced motion. Use ≥44px product touch-target goal where practical; this is a product target beyond AA's 24px criterion/exceptions. Audio alternatives and assessment accommodations need a separate policy that preserves assessment intent. No autoplay with sound; microphone denial must never fabricate a learner answer.

Fresh Stage 1A browser smoke only found landing width 1274px = document width 1274px. Previous QA.md describes earlier viewport tests. Neither proves all new themes/components meet the proposed requirements. See the future [acceptance plan](reviews/stage-1a/DASHBOARD_ACCEPTANCE_TEST_PLAN.md).
