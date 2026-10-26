import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { APPEARANCE_KEY, applyAppearance, initialAppearance, readAppearance, resolveAppearance, saveAppearance } from '../services/preference';
import type { AppearancePreference, AppearanceState } from '../types';

const AppearanceContext = createContext<AppearanceState | null>(null);
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [preference, setLocal] = useState(initialAppearance);
  const [systemDark, setSystemDark] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [saveError, setSaveError] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const changed = () => setSystemDark(media.matches);
    media.addEventListener('change', changed);
    const synced = (event: StorageEvent) => {
      if (event.key === APPEARANCE_KEY || event.key === null) {
        try { setLocal(readAppearance(window.localStorage)); setSaveError(false); } catch { /* Keep the current appearance in memory. */ }
      }
    };
    window.addEventListener('storage', synced);
    return () => { media.removeEventListener('change', changed); window.removeEventListener('storage', synced); };
  }, []);
  useEffect(() => { applyAppearance(preference, systemDark); }, [preference, systemDark]);
  const setPreference = (value: AppearancePreference) => {
    setLocal(value);
    try { setSaveError(!saveAppearance(window.localStorage, value)); } catch { setSaveError(true); }
  };
  return <AppearanceContext.Provider value={{ preference, resolved: resolveAppearance(preference, systemDark), saveError, setPreference }}>{children}</AppearanceContext.Provider>;
}
export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('Appearance control requires its provider.');
  return value;
}
