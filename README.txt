AI IELTS COACH — COMPLETE RESPONSIVE FRONTEND PROTOTYPE
========================================================

This package transforms the approved onboarding, diagnostic and dashboard references into one coherent AI IELTS Coach frontend experience. The original reference files are retained under /reference for comparison.

1. FASTEST WAY TO RUN THE PROTOTYPE
------------------------------------
Option A — zero-install demo:

Open:
  standalone/index.html

This version is a self-contained browser prototype using the same design system and product flow. It uses hash navigation and browser localStorage, so it can be opened directly without a build step. Keep the standalone folder together because it contains the original prototype PDF and audio assets.

Option B — React + TypeScript + Vite source:

Requirements:
  Node.js 18+ recommended

Commands:
  npm install
  npm run dev

Production build:
  npm run build

Preview the build:
  npm run preview

The React app is the architected implementation under src/. In environments without package installation/network access, use Option A for the runnable demonstration.

2. PRODUCT FLOW
---------------
Landing
  -> Registration / Login
  -> Onboarding
  -> Diagnostic introduction
  -> Diagnostic
  -> Provisional results
  -> Student dashboard
  -> Learn / Practice
  -> Reading / Writing / Listening / Speaking
  -> Progress / My Mistakes / Saved Content
  -> Mock tests
  -> Exam simulation
  -> Readiness

The dashboard is state-driven. It does not show invented CEFR or IELTS estimates before diagnostic completion.

3. SHARED DESIGN SYSTEM
------------------------
The implementation intentionally preserves the approved visual language:
  - Inter typography
  - blue / purple AI identity
  - slate application background
  - white rounded cards
  - desktop sidebar + mobile drawer
  - top navigation with search, notifications and profile
  - progress indicators
  - restrained gradients and animations

Shared reusable React pieces are in src/components/ and global styles are in src/styles.css.

4. ROUTES
---------
Public:
  /
  /login
  /register

Core journey:
  /onboarding
  /diagnostic
  /diagnostic/results
  /dashboard

Learning:
  /learn
  /learn/:id
  /practice

Reading:
  /reading
  /reading/practice
  /reading/test/:id
  /reading/results/:id

Writing:
  /writing
  /writing/task/:id
  /writing/results/:id

Listening:
  /listening
  /listening/test/:id
  /listening/results/:id

Speaking:
  /speaking
  /speaking/part/:id
  /speaking/results/:id

Tracking / AI:
  /progress
  /mistakes
  /saved
  /ai-coach

Exam:
  /mock-tests
  /exam-simulation
  /readiness

Account:
  /profile
  /settings
  /help

5. STATE MANAGEMENT
-------------------
The prototype persists application state in localStorage.

Master key:
  aiIELTSCoach

Mirrored keys used for compatibility with the approved HTML prototypes:
  ai_ielts_user_profile
  ai_ielts_onboarding_state
  ai_ielts_diagnostic_state
  ai_ielts_results

Core state shape:
  {
    version,
    user,
    onboarding,
    diagnostic,
    results,
    progress,
    mistakes,
    saved,
    activity
  }

Diagnostic status is represented as:
  not_started
  in_progress
  processing
  complete
  skipped

Onboarding and diagnostic progress survive refresh and Save & exit.

To reset demo state, use the dashboard profile menu -> Reset demo data, or run:
  localStorage.clear();

6. DIAGNOSTIC INTEGRITY
-----------------------
During diagnostic / test modes:
  - AI assistance is disabled
  - hints are disabled
  - translation assistance is disabled
  - answers are not revealed
  - the Listening transcript is hidden
  - speaking retakes are controlled

The UI visibly communicates the mode:
  LEARNING          AI available
  PRACTICE          AI limited
  TEST              AI disabled
  EXAM SIMULATION   AI disabled

Diagnostic results are explicitly provisional. Objective results are derived from the submitted evidence. Writing and speaking use frontend prototype scoring heuristics and must not be represented as official IELTS scoring.

7. MOCK SERVICES / FUTURE BACKEND BOUNDARIES
---------------------------------------------
React service interfaces live in:
  src/services.ts

The current implementation provides deterministic/mock behavior for:
  - authentication
  - user/profile operations
  - diagnostic scoring
  - learning content
  - reading / writing / listening / speaking
  - analytics
  - recommendations
  - contextual AI coaching

These interfaces are intentionally replaceable by future:
  - REST/GraphQL APIs
  - database persistence
  - RAG retrieval
  - LLM calls
  - STT / TTS services
  - analytics infrastructure
  - production authentication

No production backend is implemented in this prototype.

8. PDF VIEWER
------------
The Reading workspace includes a real browser PDF rendering surface using the local prototype PDF resource rather than a fake image. The React implementation uses pdfjs-dist and the standalone implementation uses the browser's native PDF renderer.

Included asset:
  public/sample-reading.pdf
  standalone/sample-reading.pdf

The concept supports page navigation, zoom, search/fullscreen controls, loading/error boundaries and responsive placement. Exam mode can later enforce stricter restrictions at the service/router level.

9. AUDIO / SPEAKING
-------------------
Included original prototype audio:
  public/listening-diagnostic.wav
  standalone/listening-diagnostic.wav

Speaking uses browser microphone permission when available. When it is not available, the prototype still demonstrates the controlled READY -> PREPARING -> RECORDING -> PROCESSING -> SUBMITTED interaction state.

10. REFERENCE FILES
-------------------
The approved files supplied for this iteration remain in:
  reference/

They were used as the visual and structural baseline rather than discarded.

11. QA NOTES
------------
The delivered package includes static/syntax checks for the standalone JavaScript and HTML structure, route coverage checks, local asset checks, and browser-rendered inspection of the standalone experience using an isolated DOM harness.

A full Vite production build was not produced in this sandbox because package installation/network access was unavailable during implementation. The React source is complete and intended to be installed and built in a normal Node/npm environment; the standalone build is supplied so the prototype remains directly runnable without dependency installation.
