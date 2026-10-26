import { useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from './UI';
import { resetState } from '../state';
import { resetLearning } from '../services/platform';
import { sessionService } from '../services/session';

export function DemoResetControl({ open, onClose, returnFocus }: {
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      if (!dialog.current?.open) dialog.current?.showModal();
      cancel.current?.focus();
      return;
    }
    if (dialog.current?.open) dialog.current.close();
    if (wasOpen.current) {
      wasOpen.current = false;
      returnFocus.current?.focus();
    }
  }, [open, returnFocus]);

  const confirmReset = () => {
    const failures: string[] = [];
    try { resetState(); } catch { failures.push('profile and diagnostic'); }
    try { resetLearning(); } catch { failures.push('learning activity'); }
    for (const [key, label] of [['ielts-reminders', 'reminder preference'], ['ielts-large-text', 'text-size preference']] as const) {
      try { localStorage.removeItem(key); } catch { failures.push(label); }
    }
    document.documentElement.classList.remove('large-text');
    if (failures.length) {
      const resetError = `Some local data may already have been cleared, but ${failures.join(' and ')} could not be fully removed. You have been signed out for safety. Free browser storage, then sign in and try the reset again.`;
      sessionService.signOut();
      onClose();
      navigate('/', { replace: true, state: { resetError } });
      return;
    }
    sessionService.signOut();
    onClose();
    navigate('/', { replace: true });
  };

  if (typeof document === 'undefined') return null;
  return createPortal(
    <dialog
      ref={dialog}
      className="submit-dialog demo-reset-dialog"
      aria-labelledby="demo-reset-title"
      aria-describedby="demo-reset-description demo-reset-warning"
      onCancel={event => { event.preventDefault(); onClose(); }}
    >
      <h2 id="demo-reset-title">Reset this demo learner?</h2>
      <p id="demo-reset-description">This clears the profile, goals, diagnostic, activity streak, drafts, attempts, exam history, vocabulary, and preferences saved by this browser.</p>
      <p id="demo-reset-warning"><strong>This cannot be undone.</strong> You will return to the public landing page and can demonstrate the new-learner journey from the beginning.</p>
      <div className="button-row">
        <Button kind="secondary" onClick={onClose} className="demo-reset-cancel">Keep current progress</Button>
        <Button kind="danger" onClick={confirmReset}>Reset demo learner</Button>
      </div>
    </dialog>,
    document.body,
  );
}
