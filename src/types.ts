export type EnglishVariant = "UK" | "US";
export type ExplanationLanguage = "English" | "Uzbek" | "English + Uzbek";
export type IELTSMode = "Academic" | "General Training";
export type DiagnosticStatus = "not_started" | "in_progress" | "complete" | "skipped";
export type ActivityMode = "LEARNING" | "PRACTICE" | "TEST" | "EXAM SIMULATION";

export interface User {
  firstName: string;
  ageGroup?: string;
  studyContext: string;
  occupation?: string;
}

export interface Onboarding {
  flowVersion: 2;
  ieltsType: IELTSMode;
  targetBand: number;
  examDate: string;
  reason: string;
  englishVariant: EnglishVariant;
  explanationLanguage: ExplanationLanguage;
  selfAssessment: string;
  dailyMinutes: number;
  sessionLength: number;
  intensity: string;
  complete: boolean;
  step: number;
}

export interface DiagnosticState {
  status: DiagnosticStatus;
  currentSection: number;
  currentQuestion: number;
  responses: Record<string, number>;
  writingText: string;
  speakingStatus: "READY" | "PREPARING" | "RECORDING" | "PROCESSING" | "SUBMITTED";
  speakingDuration: number;
  listeningPlayed: boolean;
  completedSections: string[];
  startedAt?: string;
  updatedAt?: string;
}

export interface ModuleScore {
  band: number;
  confidence: "High" | "Medium" | "Low";
  evidencePercent: number;
}

export interface DiagnosticResults {
  cefr: string;
  moduleScores: Record<"Reading" | "Writing" | "Listening" | "Speaking", ModuleScore>;
  overall: number;
  overallConfidence: "High" | "Medium" | "Low";
  skillMastery: Record<string, number>;
  familiarity: number;
  strengths: string[];
  weaknesses: string[];
  recurringWeaknesses: string[];
  priorities: string[];
  readiness: "Foundation" | "Pre-IELTS" | "IELTS Practice" | "Exam Ready";
  plan: { title: string; reason: string; duration: string; kind: string }[];
  generatedAt: string;
}

export interface Mistake {
  id: string;
  category: string;
  mistake: string;
  correction: string;
  explanation: string;
  date: string;
  recurrence: number;
  mastery: number;
  practice: string;
}

export interface SavedItem {
  id: string;
  type: string;
  title: string;
  detail: string;
}

export interface AppState {
  version: number;
  user: User;
  onboarding: Onboarding;
  diagnostic: DiagnosticState;
  results: DiagnosticResults | null;
  currentActivity: {
    mode: ActivityMode;
    title: string;
    route: string;
  };
  progress: {
    learningHours: number;
    streak: number;
    completedLessons: number;
    recent: { date: string; title: string; detail: string }[];
  };
  mistakes: Mistake[];
  saved: SavedItem[];
}
