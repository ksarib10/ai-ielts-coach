# Vercel Deployment Report — Sub-stage B

**Date:** 2026-10-27  
**Project:** AI IELTS Coach  
**Working Root:** `C:\Users\ksari\source\repos\ai-ielts-coach`  
**Milestone:** Stage 1B Slice 1 — Vercel Sub-stage B (Protected Development Preview)  

---

## 1. Executive Summary

The existing AI IELTS Coach React/TypeScript/Vite frontend has been successfully connected and deployed via the official Vercel Dashboard GitHub integration.

* **Live Deployment URL:** [`https://ai-ielts-coach-project.vercel.app/`](https://ai-ielts-coach-project.vercel.app/)
* **GitHub Source Repository:** [`https://github.com/ksarib10/ai-ielts-coach`](https://github.com/ksarib10/ai-ielts-coach) (Private)
* **Verified Git Commit:** `65a25bbacc97a021d728946839da5404d262924e` (`main`)
* **Deployment Protection:** **Vercel Authentication (All Deployments)** — **ACTIVE**
* **Access Control Status:** Unauthenticated visitors cannot access any part of the site, its routes, or its assets. Requests are intercepted and redirected to Vercel SSO login (`302 Found` / `https://vercel.com/login`).
* **Content Boundary Integrity:** Verified that no development documents, private question-bank keys, or assessment answer keys are published in the build.

---

## 2. Preflight & Build Verification

* **Framework Preset:** Vite
* **Root Directory:** `./`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Routing Configuration (`vercel.json`):**
  ```json
  {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [{ "source": "/((?!assets/|.*\\.[a-zA-Z0-9]+$).*)", "destination": "/index.html" }]
  }
  ```
* **Production Build Assets:**
  * HTML: `/index.html` (SHA ETag: `"0e25b7495b007513b4e04c2df44e5a49"`)
  * JavaScript Bundle: `/assets/index-Da45QNAr.js` (395.82 kB)
  * CSS Bundle: `/assets/index-hnLFfhHa.css` (115.94 kB)
  * Both asset hashes match the local production build generated from commit `65a25bb`.

---

## 3. Account, Plan & Commercial Gate Status

* **Hosting Provider:** Vercel
* **Account Owner:** `ksarib10`
* **Plan Basis:** Vercel account with Vercel's September 9, 2026 update enabling **Vercel Authentication with All Deployments on every plan without additional protection charges**.
* **Intended Purpose:** Development preview and demonstration for owner and team-lead review only.
* **Commercial Gate Note:** This deployment is an internal development evaluation and review milestone. It is not an unauthenticated public commercial launch or production IELTS test service.

---

## 4. Deployment Protection & Access Control Audit

### Unauthenticated Request Verification (Live Tests):
1. **Root URL (`GET /`):**
   * Output: `HTTP/1.1 302 Found`
   * Location: `https://vercel.com/sso-api?url=https%3A%2F%2Fai-ielts-coach-project.vercel.app%2F&nonce=...`
   * Response text: `Protected by Vercel Authentication`
2. **Deep Assets (`GET /assets/index-Da45QNAr.js`):**
   * Output: `HTTP/1.1 302 Found`
   * Location: `https://vercel.com/sso-api?url=...`
   * Direct script asset access without authentication is completely blocked.
3. **Headless Browser Navigation Test:**
   * Automated headless Chrome visit to `https://ai-ielts-coach-project.vercel.app/` was redirected to `https://vercel.com/login?next=...` with title *"Login – Vercel"* and H1 *"Log in to Vercel"*.
   * Result: **Zero information leakage to unauthenticated traffic**.
4. **Candidate Question Bank & Answer Key Isolation:**
   * Probed `/docs/reviews/stage-1b/diagnostic-question-bank-preparation/v2.0.0-candidate/private/keys-and-explanations.json`.
   * Result: Not deployed in `dist`. Prior to authentication challenge it returned `404 Not Found`; under active protection it redirects to SSO login.
   * Assessment review files and private keys remain strictly unbundled.

---

## 5. Development & Review Workflow

* **Stable Review Branch:** `main` tracks production deployments.
* **Feature Branches & PRs:** Automatically receive protected Preview deployments under Vercel Authentication.
* **Rollback & Immutability:** Any deployment can be rolled back instantaneously in Vercel to prior immutable deployment hashes (e.g. tracking Git commit `65a25bb`).
* **Team-Lead Access:**
  * To grant the team lead access, the owner can add them as a member/viewer to the Vercel project or team dashboard under Project Settings → Access.
  * No public bypass tokens, unrestricted share links, or password bypasses have been enabled.

---

## 6. Remaining Limitations & Boundaries

1. **Human Visual Acceptance:** Visual acceptance of VA-01 through VA-05 remains **PENDING** owner review on the live protected preview.
2. **No Backend / Mock AI:** AI IELTS Coach remains a client-side prototype. The AI Coach responses are scripted samples; no external AI service or database backend is connected.
3. **Diagnostic V1:** The assessment questions and scoring models remain demonstration versions; candidate Question Bank V2 is not approved or implemented.
4. **Vercel Scope:** No serverless functions, Edge middleware, or paid addons were provisioned.

---

## 7. Mandatory Stop

Vercel Sub-stage B is complete.
* No application code or dependencies were altered.
* No backend architecture, database work, or Stage 2 implementation was started.
* Ready for independent ChatGPT and owner review.
