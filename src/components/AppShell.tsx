import { UserMenu } from './UserMenu';
import { flushSync } from 'react-dom';
import { useState, useEffect, useRef, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, House, Dumbbell, PenTool, Headphones, Mic, ChartNoAxesColumnIncreasing, Target, Sparkles, Bookmark, Settings, Menu, X, GraduationCap, ClipboardCheck, FileCheck2 } from 'lucide-react';
import { hasDiagnosticBaseline, readState } from '../state';
import { policies, type Mode } from '../domain';
import type { ActivityMode } from '../types';
import { getLearning } from '../services/platform';
import { AIAssistant } from './AIAssistant';
const nav = [
  { group: 'YOUR LEARNING', items: [['Dashboard', '/dashboard', House], ['Learn', '/learn', BookOpen], ['Practice', '/practice', Dumbbell], ['AI Coach', '/ai-coach', Sparkles]] },
  { group: 'IELTS MODULES', items: [['Reading', '/reading', BookOpen], ['Writing', '/writing', PenTool], ['Listening', '/listening', Headphones], ['Speaking', '/speaking', Mic]] },
  { group: 'YOUR JOURNEY', items: [['Mock tests', '/mock-tests', ClipboardCheck], ['Exam Simulation', '/exam', FileCheck2], ['Progress', '/progress', ChartNoAxesColumnIncreasing], ['Readiness', '/readiness', Target], ['My vocabulary', '/saved', Bookmark], ['Settings', '/settings', Settings]] },
] as const;
const normalMode = (m: Mode | ActivityMode): Mode => m === 'LEARNING' ? 'learn' : m === 'PRACTICE' ? 'practice' : m === 'TEST' ? 'test' : m === 'EXAM SIMULATION' ? 'exam' : m;
export function AppShell({ children, mode = 'learn' }: { children: ReactNode; mode?: Mode | ActivityMode }) {
  const drawer = useRef<HTMLElement>(null); const menu = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const navigate = useNavigate(); const location = useLocation(); const s = readState(); const actualMode = normalMode(mode); const policy = policies[actualMode];
  const showCoach = !policy.strict && !(location.pathname === '/dashboard' && !hasDiagnosticBaseline(s));
  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => drawer.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus(), 220);
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') flushSync(() => setOpen(false));
      if (event.key === 'Tab') {
        const elements = drawer.current?.querySelectorAll<HTMLElement>('a, button');
        if (!elements?.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => { window.clearTimeout(focusTimer); document.removeEventListener('keydown', keyboard); menu.current?.focus(); };
  }, [open]);
  return <div className={`app-shell ${policy.strict ? 'focused-shell' : ''} ${actualMode === 'exam' ? 'exam-shell' : ''}`}>
    <a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    {!policy.strict && <aside ref={drawer} id="navigation-drawer" className={`sidebar ${open ? 'open' : ''}`}><div className="logo-area"><NavLink className="brand-btn" to="/dashboard"><span className="brand-mark"><GraduationCap size={20}/></span>AI IELTS Coach</NavLink><button className="mobile-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X/></button></div><nav className="side-nav" aria-label="Main navigation">{nav.map(group => <div className="nav-group" key={group.group}><div className="nav-title">{group.group}</div>{group.items.map(([label, to, Icon]) => <NavLink key={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={to} onClick={() => setOpen(false)}><Icon size={18}/>{label}</NavLink>)}</div>)}</nav><div className="sidebar-goal"><Target size={18}/><div>One step closer<span>Target band {s.onboarding.targetBand.toFixed(1)}</span></div></div></aside>}
    {open && <button className="drawer-overlay" aria-label="Close navigation overlay" onClick={() => setOpen(false)}/>}
    <section className="main-area"><header className="topbar"><div className="left-top">{!policy.strict ? <><button ref={menu} aria-expanded={open} aria-controls="navigation-drawer" className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu/></button><form className="search" onSubmit={e => { e.preventDefault(); navigate(`/learn?search=${encodeURIComponent(query)}`); }}><input aria-label="Search lessons" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find your next lesson…"/></form></> : <span className="brand-btn"><GraduationCap/>AI IELTS Coach · {policy.label}</span>}</div><div className="top-actions"><span className="demo-label">Interactive demo</span>{!policy.strict && <UserMenu/>}</div></header><main tabIndex={-1} id="main-content" className="main-scroll"><div className="content-area"><div className="mode-strip"><span className={`mode-badge ${actualMode}`}>{policy.label}</span><span className="mode-note">{policy.ai}</span></div>{children}</div></main>{showCoach && <AIAssistant mode={actualMode}/>}</section>
  </div>;
}






