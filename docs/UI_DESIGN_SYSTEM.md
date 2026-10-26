# UI design system

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
