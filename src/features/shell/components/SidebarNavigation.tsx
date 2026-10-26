import { NavLink } from 'react-router-dom';
import { BookOpen, House, Dumbbell, PenTool, Headphones, Mic, ChartNoAxesColumnIncreasing, Target, Sparkles, Bookmark, Settings, ClipboardCheck, FileCheck2, type LucideIcon } from 'lucide-react';
import { navigationGroups } from '../services/navigation';
import type { NavigationIcon } from '../types';
const icons: Record<NavigationIcon, LucideIcon> = { home: House, book: BookOpen, practice: Dumbbell, coach: Sparkles, writing: PenTool, listening: Headphones, speaking: Mic, progress: ChartNoAxesColumnIncreasing, readiness: Target, saved: Bookmark, settings: Settings, test: ClipboardCheck, exam: FileCheck2 };
export function SidebarNavigation({ onNavigate }: { onNavigate: () => void }) {
  return <nav className="side-nav" aria-label="Main navigation">{navigationGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-title">{group.label}</div>{group.items.map(item => {
    const Icon = icons[item.icon];
    return item.path && item.availability === 'AVAILABLE'
      ? <NavLink key={item.label} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={item.path} onClick={onNavigate}><Icon size={18} aria-hidden="true"/><span>{item.label}</span>{item.demo && <small className="nav-status">Demo</small>}</NavLink>
      : <span className="nav-link nav-unavailable" aria-disabled="true" key={item.label}><Icon size={18} aria-hidden="true"/><span>{item.label}<small>Coming soon</small></span></span>;
  })}</div>)}</nav>;
}
