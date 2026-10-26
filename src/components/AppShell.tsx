import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { policies, type Mode } from '../domain';
import type { ActivityMode } from '../types';
import { UserMenu } from './UserMenu';
import { AIAssistant } from './AIAssistant';
import { AppearanceControl } from '../features/appearance/components/AppearanceControl';
import { SidebarNavigation } from '../features/shell/components/SidebarNavigation';
import { useNavigationDrawer } from '../features/shell/hooks/useNavigationDrawer';
const normalMode = (mode: Mode | ActivityMode): Mode => mode === 'LEARNING' ? 'learn' : mode === 'PRACTICE' ? 'practice' : mode === 'TEST' ? 'test' : mode === 'EXAM SIMULATION' ? 'exam' : mode;
export function AppShell({ children, mode = 'learn' }: { children: ReactNode; mode?: Mode | ActivityMode }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate(); const location = useLocation();
  const { open, setOpen, compact, drawer, trigger, content } = useNavigationDrawer(location.pathname);
  const actualMode = normalMode(mode); const policy = policies[actualMode];
  const overview = ['/dashboard', '/progress', '/readiness', '/diagnostic/results'].includes(location.pathname);
  return <div className={`app-shell ${policy.strict ? 'focused-shell' : ''} ${actualMode === 'exam' ? 'exam-shell' : ''}`}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    {!policy.strict && <aside ref={drawer} id="navigation-drawer" className={`sidebar ${open ? 'open' : ''}`} role={compact && open ? 'dialog' : undefined} aria-modal={compact && open ? true : undefined} aria-label={compact && open ? 'Navigation' : undefined} aria-hidden={compact && !open ? true : undefined}>
      <div className="logo-area"><NavLink className="brand-btn" to="/dashboard" onClick={() => setOpen(false)}><span className="brand-mark"><GraduationCap size={20}/></span>AI IELTS Coach</NavLink><button className="mobile-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X/></button></div>
      <SidebarNavigation onNavigate={() => setOpen(false)}/><div className="sidebar-goal"><GraduationCap size={20} aria-hidden="true"/><div>Your learning space<span>Local prototype · this device</span></div></div>
    </aside>}
    {open && !policy.strict && <button className="drawer-overlay" tabIndex={-1} aria-label="Close navigation overlay" onClick={() => setOpen(false)}/>}
    <section ref={content} className="main-area"><header className="topbar"><div className="left-top">{!policy.strict ? <><button ref={trigger} aria-expanded={open} aria-controls="navigation-drawer" className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu/></button><form className="search" role="search" onSubmit={event => { event.preventDefault(); navigate(`/learn?search=${encodeURIComponent(query)}`); }}><input aria-label="Search lessons" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find your next lesson…"/></form></> : <span className="brand-btn"><GraduationCap aria-hidden="true"/>AI IELTS Coach · {policy.label}</span>}</div><div className="top-actions"><span className="demo-label">Local demo</span><AppearanceControl/>{!policy.strict && <UserMenu/>}</div></header>
      <main tabIndex={-1} id="main-content" className="main-scroll"><div className="content-area"><div className="mode-strip"><span className={`mode-badge ${actualMode}`}>{policy.label}</span><span className="mode-note">{policy.strict ? 'Independent workspace · assistance disabled' : 'Sample learning content'}</span></div><p className="demo-notice">Local prototype. Sign-in uses a shared device session. {location.pathname === '/ai-coach' ? 'Coach responses are scripted samples; no AI service is connected.' : 'Learning and assessment examples are for demonstration.'}</p>{children}</div></main>
      {!policy.strict && !overview && <AIAssistant mode={actualMode}/>}</section>
  </div>;
}
