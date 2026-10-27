import type { AppState } from '../../../types';
export type OnboardingField = 'firstName' | 'studyContext' | 'reason' | 'selfAssessment';
export interface OnboardingIssue { field: OnboardingField; message: string }
export const ONBOARDING_ERROR_ID = 'onboarding-field-error';
export function onboardingIssue(state: AppState, step: number): OnboardingIssue | null {
  if (step === 1 && !state.user.firstName.trim()) return { field: 'firstName', message: 'Enter your first name to continue.' };
  if (step === 1 && !state.user.studyContext.trim()) return { field: 'studyContext', message: 'Choose the option that best describes what you are doing now.' };
  if (step === 2 && !state.onboarding.reason) return { field: 'reason', message: 'Choose your main reason for taking IELTS.' };
  if (step === 4 && !state.onboarding.selfAssessment) return { field: 'selfAssessment', message: 'Choose the English level that feels closest to your starting point.' };
  return null;
}
export function focusOnboardingIssue(root: Pick<HTMLElement, 'querySelector'>, issue: OnboardingIssue) {
  const field = root.querySelector<HTMLElement>(`[data-onboarding-field="${issue.field}"]`);
  const target = field?.matches('input,select') ? field : field?.querySelector<HTMLElement>('button');
  target?.focus();
}
