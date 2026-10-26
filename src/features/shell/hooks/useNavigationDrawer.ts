import { useEffect, useRef, useState } from 'react';
export function useNavigationDrawer(pathname: string) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 1050px)').matches);
  const drawer = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1050px)');
    const update = () => { setCompact(media.matches); if (!media.matches) setOpen(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
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
