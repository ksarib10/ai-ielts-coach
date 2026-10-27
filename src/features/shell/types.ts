export type NavigationIcon = 'info' | 'home' | 'book' | 'practice' | 'coach' | 'writing' | 'listening' | 'speaking' | 'test' | 'exam' | 'progress' | 'readiness' | 'saved' | 'settings';
export interface NavigationItem { label: string; path: string | null; icon: NavigationIcon; availability: 'AVAILABLE' | 'COMING_SOON'; demo?: boolean }
export interface NavigationGroup { label: string; items: NavigationItem[] }
