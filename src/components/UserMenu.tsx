import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, RotateCcw, Settings, UserRound } from 'lucide-react';
import { readState } from '../state';
import { sessionService } from '../services/session';
import { DemoResetControl } from './DemoResetControl';
export function UserMenu() {
  const [open, setOpen] = useState(false); const [resetOpen, setResetOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null); const navigate = useNavigate(); const s = readState();
  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLButtonElement>('[role=menuitem]')?.focus();
    const click = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]') || []);
        const i = items.indexOf(document.activeElement as HTMLButtonElement); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
      }
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault(); const items = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role=menuitem]') || []);
        items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
      }
    };
    document.addEventListener('pointerdown', click); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', click); document.removeEventListener('keydown', key); };
  }, [open]);
  const go = (path: string) => { setOpen(false); navigate(path); };
  return <>
    <div className="user-menu" ref={ref} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <button ref={trigger} className="profile-btn" aria-label="Open user menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><div className="profile-meta"><strong>{s.user.firstName || 'Your learning journey'}</strong><span>{s.onboarding.englishVariant} English · {s.onboarding.ieltsType}</span></div><span className="avatar">{s.user.firstName?.split(' ').map(x => x[0]).slice(0,2).join('') || 'D'}</span><ChevronDown size={15}/></button>
      {open && <div className="user-dropdown" role="menu" aria-label="Your account"><strong>{s.user.firstName || 'Demo learner'}</strong><button role="menuitem" onClick={() => go('/profile')}><UserRound size={17}/>Profile</button><button role="menuitem" onClick={() => go('/settings')}><Settings size={17}/>Settings</button><hr/><button role="menuitem" className="demo-reset-menu-item" onClick={() => { setOpen(false); setResetOpen(true); }}><RotateCcw size={17}/>Reset demo progress</button><button role="menuitem" onClick={() => { setOpen(false); sessionService.signOut(); navigate('/', { replace: true }); }}><LogOut size={17}/>Sign out</button></div>}
    </div>
    <DemoResetControl open={resetOpen} onClose={() => setResetOpen(false)} returnFocus={trigger}/>
  </>;
}
