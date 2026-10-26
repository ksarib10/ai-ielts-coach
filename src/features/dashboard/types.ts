export type PresentationState = 'AVAILABLE' | 'EMPTY' | 'IN_PROGRESS' | 'REQUIRES_VALID_DIAGNOSTIC' | 'TEMP_UNAVAILABLE' | 'UNSUPPORTED';
export interface MetricPresentation { id: string; title: string; state: PresentationState; value: string | null; detail: string }
export interface SavedPresentation {
  state: 'AVAILABLE' | 'EMPTY' | 'TEMP_UNAVAILABLE';
  name: string | null; track: string | null; target: number | null;
  diagnostic: 'not_started' | 'in_progress' | 'complete' | 'skipped' | null;
  completedSections: number | null;
}
export interface SavedHistory { state: 'AVAILABLE' | 'EMPTY' | 'TEMP_UNAVAILABLE'; entries: { id: string; module: string; mode: string; submittedAt: string }[] }
