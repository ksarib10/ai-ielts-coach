import type { AppState, DiagnosticState, Onboarding, User } from "./types";

export const STORAGE_KEY = "aiIELTSCoach";
export const PROFILE_KEY = "ai_ielts_user_profile";
export const ONBOARDING_KEY = "ai_ielts_onboarding_state";
export const DIAGNOSTIC_KEY = "ai_ielts_diagnostic_state";
export const RESULTS_KEY = "ai_ielts_results";
const CURRENT_VERSION = 2;
const DIAGNOSTIC_IDS = ["grammar", "vocabulary", "reading", "listening", "writing", "speaking", "familiarity"] as const;

export const blankState = (): AppState => ({
  version: CURRENT_VERSION,
  user: { firstName:"", studyContext:"", ageGroup:"", occupation:"" },
  onboarding: {
    flowVersion:2,
    ieltsType:"Academic", targetBand:7, examDate:"", reason:"",
    englishVariant:"UK", explanationLanguage:"English + Uzbek", selfAssessment:"",
    dailyMinutes:30, sessionLength:25, intensity:"Balanced", complete:false, step:0
  },
  diagnostic: {
    status:"not_started", currentSection:0, currentQuestion:0,
    responses:{}, writingText:"", speakingStatus:"READY", speakingDuration:0,
    listeningPlayed:false, completedSections:[]
  },
  results:null,
  currentActivity:{mode:"LEARNING",title:"Home",route:"/dashboard"},
  progress:{learningHours:0,streak:0,completedLessons:0,recent:[]},
  mistakes:[],
  saved:[]
});

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function legacyOnboardingStep(step: unknown, complete: boolean) {
  if (complete) return 5;
  const value = typeof step === "number" && Number.isFinite(step) ? Math.max(0, Math.min(7, Math.floor(step))) : 0;
  return [0, 1, 2, 2, 3, 3, 4, 5][value];
}

function migrateState(value: unknown): AppState {
  const defaults = blankState();
  const input = objectValue(value);
  const user = objectValue(input.user);
  const onboarding = objectValue(input.onboarding);
  const diagnostic = objectValue(input.diagnostic);
  const progress = objectValue(input.progress);
  const currentActivity = objectValue(input.currentActivity);
  const isCurrent = input.version === CURRENT_VERSION || onboarding.flowVersion === 2;
  const complete = typeof onboarding.complete === "boolean" ? onboarding.complete : defaults.onboarding.complete;
  const completedSections = Array.isArray(diagnostic.completedSections)
    ? diagnostic.completedSections.filter((id): id is string => typeof id === "string" && DIAGNOSTIC_IDS.includes(id as typeof DIAGNOSTIC_IDS[number]))
    : [];
  const rawResponses = objectValue(diagnostic.responses);
  const responses = Object.fromEntries(
    Object.entries(rawResponses).filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1])),
  );
  const speakingStates = ["READY", "PREPARING", "RECORDING", "PROCESSING", "SUBMITTED"] as const;
  const diagnosticStatuses = ["not_started", "in_progress", "complete", "skipped"] as const;
  const rawSection = typeof diagnostic.currentSection === "number" ? diagnostic.currentSection : 0;
  const rawQuestion = typeof diagnostic.currentQuestion === "number" ? diagnostic.currentQuestion : 0;

  return {
    ...defaults,
    ...input,
    version: CURRENT_VERSION,
    user: { ...defaults.user, ...user },
    onboarding: {
      ...defaults.onboarding,
      ...onboarding,
      flowVersion: 2,
      complete,
      step: isCurrent
        ? Math.max(0, Math.min(5, typeof onboarding.step === "number" ? Math.floor(onboarding.step) : 0))
        : legacyOnboardingStep(onboarding.step, complete),
    },
    diagnostic: {
      ...defaults.diagnostic,
      ...diagnostic,
      status: diagnosticStatuses.includes(diagnostic.status as typeof diagnosticStatuses[number])
        ? diagnostic.status as DiagnosticState["status"]
        : defaults.diagnostic.status,
      currentSection: Math.max(0, Math.min(DIAGNOSTIC_IDS.length - 1, Math.floor(rawSection))),
      currentQuestion: Math.max(0, Math.floor(rawQuestion)),
      responses,
      completedSections,
      listeningPlayed: diagnostic.listeningPlayed === true,
      speakingStatus: speakingStates.includes(diagnostic.speakingStatus as typeof speakingStates[number])
        ? diagnostic.speakingStatus as DiagnosticState["speakingStatus"]
        : defaults.diagnostic.speakingStatus,
    },
    currentActivity: { ...defaults.currentActivity, ...currentActivity },
    progress: {
      ...defaults.progress,
      ...progress,
      recent: Array.isArray(progress.recent) ? progress.recent as AppState["progress"]["recent"] : [],
    },
    results: input.results && typeof input.results === "object" ? input.results as AppState["results"] : null,
    mistakes: Array.isArray(input.mistakes) ? input.mistakes as AppState["mistakes"] : [],
    saved: Array.isArray(input.saved) ? input.saved as AppState["saved"] : [],
  };
}

export function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
    const profile = localStorage.getItem(PROFILE_KEY);
    const onboarding = localStorage.getItem(ONBOARDING_KEY);
    const diagnostic = localStorage.getItem(DIAGNOSTIC_KEY);
    const results = localStorage.getItem(RESULTS_KEY);
    if (profile || onboarding || diagnostic || results) return migrateState({
      user: profile ? JSON.parse(profile) : undefined,
      onboarding: onboarding ? JSON.parse(onboarding) : undefined,
      diagnostic: diagnostic ? JSON.parse(diagnostic) : undefined,
      results: results ? JSON.parse(results) : null,
    });
  } catch {}
  return blankState();
}

export function writeState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.user));
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state.onboarding));
  localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify(state.diagnostic));
  if (state.results) localStorage.setItem(RESULTS_KEY, JSON.stringify(state.results));
  else localStorage.removeItem(RESULTS_KEY);
}

export function updateState(mutator: (state: AppState)=>void): AppState {
  const state = readState(); mutator(state); writeState(state); return state;
}

export function saveUser(user: User) {
  return updateState(s => { s.user = user; s.onboarding.complete = s.onboarding.complete; });
}

export function saveOnboarding(user: User, onboarding: Onboarding) {
  return updateState(s => { s.user=user; s.onboarding=onboarding; });
}

export function saveDiagnostic(diagnostic: DiagnosticState) {
  return updateState(s => { s.diagnostic=diagnostic; });
}

export function resetState() {
  const failures: string[] = [];
  for (const key of [STORAGE_KEY, PROFILE_KEY, ONBOARDING_KEY, DIAGNOSTIC_KEY, RESULTS_KEY]) {
    try { localStorage.removeItem(key); } catch { failures.push(key); }
  }
  if (failures.length) throw new Error(`Could not clear ${failures.length} saved state ${failures.length === 1 ? 'entry' : 'entries'}.`);
}

export function firstIncompleteDiagnosticSection(completedSections:string[]) {
  const next = DIAGNOSTIC_IDS.findIndex(id=>!completedSections.includes(id));
  return next < 0 ? DIAGNOSTIC_IDS.length - 1 : next;
}

export function hasDiagnosticBaseline(state: Pick<AppState, "diagnostic" | "results">) {
  return state.diagnostic.status === "complete" && state.results !== null;
}

export function learnerRouteRedirect(pathname: string, state: AppState) {
  if (pathname === "/onboarding") return null;
  if (!state.onboarding.complete) return "/onboarding";
  if (pathname === "/diagnostic/results" && !hasDiagnosticBaseline(state)) return "/diagnostic";
  return null;
}

