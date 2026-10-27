import type { NavigationGroup, NavigationIcon } from '../types';
const link = (label: string, path: string, icon: NavigationIcon, demo = false) => ({ label, path, icon, availability: 'AVAILABLE' as const, demo });

export const navigationGroups: NavigationGroup[] = [
 {label:'Main',items:[link('Dashboard','/dashboard','home'),link('Learn','/learn','book')]},
 {label:'IELTS Skills',items:[link('Listening','/listening','listening'),link('Reading','/reading','book'),link('Writing','/writing','writing'),link('Speaking','/speaking','speaking')]},
 {label:'Assessment & Progress',items:[link('Complete IELTS Exam','/exam','exam'),link('Progress','/progress','progress')]},
 {label:'Information',items:[link('IELTS About','/ielts-about','info'),link('Settings','/settings','settings')]},
];
