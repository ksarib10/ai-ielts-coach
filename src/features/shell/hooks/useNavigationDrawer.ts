import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
const query = '(max-width: 1050px)';
export const navigationIsCompact = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
export function subscribeNavigationBreakpoint(changed: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener('change', changed);
  return () => media.removeEventListener('change', changed);
}
export function useNavigationDrawer(pathname: string) {
  const [open, setOpen] = useState(false);
  const compact = useSyncExternalStore(subscribeNavigationBreakpoint, navigationIsCompact, () => false);
  const drawer = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLElement>(null);
  useEffect(() => { if (!compact) setOpen(false); }, [compact]);
  useEffect(() => { setOpen(false); }, [pathname]);
  useLayoutEffect(() => {
    drawer.current?.toggleAttribute('inert', compact && !open);
    content.current?.toggleAttribute('inert', compact && open);
    return () => { drawer.current?.removeAttribute('inert'); content.current?.removeAttribute('inert'); };
  }, [compact, open]);
  useEffect(() => {
    if (!compact || !open) return;
    const frame = requestAnimationFrame(() => drawer.current?.querySelector<HTMLButtonElement>('.mobile-close')?.focus());
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key !== 'Tab') return;
      const all = Array.from(drawer.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') || []).filter(element => element.getClientRects().length > 0);
      const first = all[0], last = all[all.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', keyboard); trigger.current?.focus(); };
  }, [compact, open]);
  return { open, setOpen, compact, drawer, trigger, content };
}
