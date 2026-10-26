# Prototype reconstruction audit — 8 September 2026

All seven supplied specifications were read before changes. The Mega Complete Prompt controls execution; supporting documents control product detail; the old implementation is reference only.

## Keep
React 18 / TypeScript / Vite / React Router, Lucide icons, shared buttons/cards, responsive sidebar, progressive onboarding structure, original diagnostic questions, community-garden passage and local audio.

## Refactor
Split the 376-line compressed page collection into feature modules. Centralize learner fixtures, resource contracts, activity state, scoring and recommendations. Repair onboarding resume and optional exam date. Make modes derive from the active workspace rather than stale browser state. Improve type safety and accessible controls.

## Replace
PDF-first Reading, inert practice controls, generic lessons, hard-coded results, misleading confidence and readiness gauge, placeholder Listening/Speaking results, simulated exam with no playable sections, generic coach response and inert settings/saved tabs.

## Execution map
1. Foundation: shell, consistent modes, state, types, errors.
2. Entry: landing/auth/onboarding and diagnostic evidence flow.
3. Learning: dashboard, catalog, lessons and mastery loop.
4. Activities: structured content and reusable question patterns.
5. Modules: Reading, Writing, Listening, Speaking with persistent attempts and review.
6. Coach: contextual selection, vocabulary and preferences.
7. Progress/readiness and controlled multi-section exam.
8. Responsive browser checks, production build and Vercel routing configuration.

Historical standalone/reference HTML is retained as archival reference, not an alternate deliverable. No production backend, scoring AI or content extraction is introduced.
