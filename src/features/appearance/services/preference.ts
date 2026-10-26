import type { AppearancePreference, ResolvedAppearance } from '../types';
export const APPEARANCE_KEY = 'ielts-appearance-v1';
export const isAppearance = (value: unknown): value is AppearancePreference => value === 'light' || value === 'dark' || value === 'system';
export function readAppearance(storage: Pick<Storage, 'getItem'>): AppearancePreference {
  try { const value = storage.getItem(APPEARANCE_KEY); return isAppearance(value) ? value : 'system'; }
  catch { return 'system'; }
}
export function saveAppearance(storage: Pick<Storage, 'setItem'>, value: AppearancePreference): boolean {
  try { storage.setItem(APPEARANCE_KEY, value); return true; } catch { return false; }
}
export const resolveAppearance = (preference: AppearancePreference, systemDark: boolean): ResolvedAppearance => preference === 'system' ? systemDark ? 'dark' : 'light' : preference;
export function initialAppearance(): AppearancePreference {
  try { return readAppearance(window.localStorage); } catch { return 'system'; }
}
export function applyAppearance(preference: AppearancePreference, systemDark: boolean) {
  const resolved = resolveAppearance(preference, systemDark);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}
