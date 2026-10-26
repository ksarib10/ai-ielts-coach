export type AppearancePreference = 'light' | 'dark' | 'system';
export type ResolvedAppearance = 'light' | 'dark';
export interface AppearanceState {
  preference: AppearancePreference;
  resolved: ResolvedAppearance;
  saveError: boolean;
  setPreference: (preference: AppearancePreference) => void;
}
