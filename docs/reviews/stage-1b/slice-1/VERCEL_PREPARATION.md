# Vercel preparation — no connection or deployment

2026-10-27. Preparation only. No remote, push, Vercel CLI, account connection, environment configuration or deployment was created. The current root is `C:\Users\ksari\source\repos\ai-ielts-coach`.

## Compatibility and routing

The actual Vite 6.4.3 build passes with installed dependencies. Proposed deployment root is the repository root (`.`), build `npm run build`, output `dist`, framework Vite. Existing `vercel.json` already records these values and an SPA rewrite excluding asset/file paths; it was not modified. Future clean managed install should honor package-lock.json; no package installation was performed in this slice. Vite SPA deep links need a fallback, as described in [Vercel's Vite guide](https://vercel.com/docs/frameworks/frontend/vite).

Actual routing is HashRouter: `/#/dashboard` sends only `/` to hosting. `src/main.tsx` converts initial direct app paths to hashes while preserving the query. Direct `/dashboard` refresh needs the existing SPA fallback. Missing assets should remain file errors, not receive index.html. Verify hash/direct-path refresh, aliases, missing assets and protected deep links on an eventual authorized preview; none of those hosting checks has run on Vercel.

## Content and identity boundary

Only dist should be served. `docs/`, reference sources, candidate private keys/scripts, local logs/exports and Git metadata must not be published as public assets. This build contains no docs directory; named candidate key/script markers and candidate imports are absent. Local Vite rejects the two checked private-review URLs with 403. That local result is not Vercel protection evidence. Existing legacy development fixtures/answer keys remain client-inspectable and cannot support secure marking. Original sample audio remains public sample content, not approved Diagnostic V1 media.

No environment variables are required by this prototype. Never place secrets in `VITE_*` variables or client source. Keep future credentials in provider-managed server settings only after a separately approved architecture. Private repository visibility does not protect deployment URLs. Demo sign-in is a shared browser session, not production identity or learner isolation. Use synthetic team-review data only; no production collection is authorized. Label previews as development prototype, scripted AI, unvalidated assessment.

## Access and commercial account decisions

The newer [9 September 2026 Vercel announcement](https://vercel.com/changelog/protect-production-deployments-for-free-on-every-plan) says Vercel Authentication can protect all deployments, including production, on every plan without an additional protection charge. Its All Deployments setting is the proposed team-preview policy. Older cached protection documentation described narrower plan limits; confirm actual project controls and account entitlements before enabling anything. Do not rely on old pricing claims.

[Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) restricts access to users with deployment access through Vercel accounts. Explicitly grant the team lead appropriate project access and verify its actual billing/role terms. Avoid public share bypass links or deployment exceptions. Test main, branch previews, deep links and assets in an unauthenticated browser after future authorization; protection is not yet configured or verified here.

Protection availability does not settle commercial eligibility. [Hobby is for personal, non-commercial use](https://vercel.com/docs/plans/hobby); a commercial/team project needs Pro or an appropriate commercial agreement. The owner must choose account/team, plan, roles, billing and repository ownership. No price or free collaboration seat is promised.

## Proposed future workflow — requires authorization

1. Owner approves a private repository and Vercel team/project, commercial plan and access policy; authorize remote creation/push separately.
2. Feature branch → seven suites, TypeScript, build and exposure review → protected branch preview for team lead.
3. Owner reviews visual/functional limitations; validated PR and acceptance → stable main demonstration deployment, also protected. Stage 2 is still blocked.
4. Preserve immutable deployment identifiers for rollback to a prior accepted artifact. Verify routes, access and artifact exposure after each deployment.

No feature branch, remote, PR or hosting workflow was created by this preparation.
