import type { NavigationGroup, NavigationIcon } from '../types';
const link = (label: string, path: string, icon: NavigationIcon, demo = false) => ({ label, path, icon, availability: 'AVAILABLE' as const, demo });
const future = (label: string) => ({ label, path: null, icon: 'book' as const, availability: 'COMING_SOON' as const });
export const navigationGroups: NavigationGroup[] = [
  { label: 'Your learning', items: [link('Dashboard', '/dashboard', 'home'), link('Learn', '/learn', 'book'), link('Practice', '/practice', 'practice'), link('AI Coach', '/ai-coach', 'coach', true)] },
  { label: 'IELTS modules', items: [link('Reading', '/reading', 'book'), link('Writing', '/writing', 'writing'), link('Listening', '/listening', 'listening'), link('Speaking', '/speaking', 'speaking')] },
  { label: 'Your journey', items: [link('Mock tests', '/mock-tests', 'test', true), link('Exam Simulation', '/exam', 'exam', true), link('Progress', '/progress', 'progress'), link('Readiness', '/readiness', 'readiness'), link('My vocabulary', '/saved', 'saved'), link('Settings', '/settings', 'settings')] },
  { label: 'Coming soon', items: [future('TED learning'), future('Academic Word List'), future('Grammar resources'), future('Curriculum & notes')] },
];
