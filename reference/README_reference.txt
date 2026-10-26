AI IELTS Coach — Connected Frontend Prototype
===============================================

Files
-----
01_onboarding.html
02_diagnostic.html
03_dashboard.html

Open
----
Open 01_onboarding.html in a modern browser. The three files are linked by normal
relative navigation, so keep all three files in the same folder.

User flow
---------
New user:
Onboarding → Diagnostic introduction → Diagnostic → Provisional Results → Dashboard

Returning user:
Dashboard reads saved browser state and shows the appropriate onboarding,
diagnostic-not-started, diagnostic-incomplete, or personalized state.

LocalStorage schema
-------------------
The prototype uses these keys:

aiIELTSCoach
  Master application state.

ai_ielts_user_profile
  Basic learner identity/preferences.

ai_ielts_onboarding_state
  Goals, IELTS type, target band, exam date, English variety, explanation
  language, self-assessment, and study preferences.

ai_ielts_diagnostic_state
  Diagnostic status, current section/question, objective responses,
  writing response, speaking recording state, timestamps, and completed sections.

ai_ielts_results
  Provisional CEFR, module estimates, confidence, skill evidence,
  strengths, weaknesses, readiness, and personalized starting plan.

The single master object follows this general shape:
{
  version: 1,
  user: {},
  onboarding: {},
  diagnostic: {
    status: "not_started | in_progress | complete",
    currentSection: 0,
    currentQuestion: 0,
    responses: {},
    completedSections: []
  },
  results: null
}

State behavior
--------------
- Refreshing the browser preserves onboarding answers and diagnostic progress.
- "Save & exit" returns to the dashboard without losing state.
- Diagnostic completion creates provisional results from submitted evidence.
- The dashboard never displays an invented CEFR or IELTS score before diagnostic completion.
- Partially completed diagnostics remain resumable.
- Editing the profile updates the dashboard immediately.

Reset demo
----------
Use the profile menu on the dashboard → "Reset demo data", or run this in the
browser console:

localStorage.clear();

Then reopen 01_onboarding.html.

Prototype assumptions
---------------------
- This is a frontend product prototype, not production AI.
- Objective scoring is deterministic from the provided assessment answers.
- Writing and speaking scores are simulated from submitted evidence and clearly
  labelled provisional.
- The Listening passage is original and embedded directly in 02_diagnostic.html
  so no external audio file is required.
- Browser microphone access is attempted for Speaking. When unavailable,
  the prototype still records timed interaction state for demonstration.
- Pages such as Progress, AI Coach, Reading, Writing, Listening, etc. are
  represented by connected prototype workspace states. They are intentionally
  not full backend modules yet.
- Future backend integrations can replace the mock calculation with APIs for
  databases, RAG, LLMs, STT, TTS, analytics, and recommendation services.

Design baseline
---------------
The dashboard keeps the existing baseline's Inter typography, blue/purple AI
language, sidebar navigation, top bar, search, notification/profile controls,
card-based layout, progress indicators, AI insight panel, learning plan,
streak/readiness widgets, and responsive drawer behavior. Phase content is now
state-driven instead of being switched by a fake developer phase control.

Quality checks performed
------------------------
- Parsed all generated HTML documents with an HTML parser.
- Extracted and syntax-checked embedded JavaScript with Node.js.
- Checked key IDs, navigation targets, and localStorage references.
- Exercised state transitions in a browser-like DOM script:
  onboarding save/resume, diagnostic partial state, completion/result persistence,
  dashboard state mapping, and profile edits.
- Inspected rendered screenshots at desktop and mobile widths with Chromium.

