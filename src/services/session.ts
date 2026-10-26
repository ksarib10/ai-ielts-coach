import { useSyncExternalStore } from 'react';
const KEY = 'ielts-demo-session';
const listeners = new Set<() => void>();
let current: boolean | null = null;

export function isSessionActive() {
  if (current !== null) return current;
  try {
    current = localStorage.getItem(KEY) === 'active';
  } catch {
    current = false;
  }
  return current;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function change(active: boolean) {
  // Keep the requested session state authoritative for this tab even when
  // browser storage is temporarily unavailable.
  current = active;
  try {
    localStorage.setItem(KEY, active ? 'active' : 'signed-out');
  } catch {
    // The in-memory value still provides a safe session for this tab.
  }
  notify();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== KEY) return;
    current = event.newValue === 'active';
    notify();
  });
}

export const sessionService = { start: () => change(true), signOut: () => change(false) };
export const useSession = () => useSyncExternalStore(
  (listener) => {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  isSessionActive,
  () => false,
);
