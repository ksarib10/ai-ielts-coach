import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '../hooks/AppearanceProvider';
import { isAppearance } from '../services/preference';
export function AppearanceControl() {
  const { preference, resolved, saveError, setPreference } = useAppearance();
  const Icon = resolved === 'dark' ? Moon : Sun;
  return <div className="appearance-control"><label><Icon size={17} aria-hidden="true"/><span className="sr-only">Appearance</span><select aria-label="Appearance" value={preference} onChange={event => { if (isAppearance(event.target.value)) setPreference(event.target.value); }}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>{saveError && <span className="appearance-error" role="status">Appearance applies for this visit. Device storage is unavailable.</span>}</div>;
}
