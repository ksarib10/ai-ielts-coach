import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Moon, Monitor, Sun } from 'lucide-react';
import { useAppearance } from '../hooks/AppearanceProvider';
import { isAppearance } from '../services/preference';
import type { AppearancePreference } from '../types';

interface AppearanceOption {
  value: AppearancePreference;
  label: string;
  icon: typeof Sun;
}

const OPTIONS: readonly AppearanceOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export function AppearanceControl() {
  const { preference, saveError, setPreference } = useAppearance();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const currentOption = OPTIONS.find(opt => opt.value === preference) ?? OPTIONS[2];
  const ActiveIcon = currentOption.icon;

  useEffect(() => {
    if (!open) return;

    const selectedIdx = OPTIONS.findIndex(opt => opt.value === preference);
    const targetIdx = selectedIdx >= 0 ? selectedIdx : 0;
    itemRefs.current[targetIdx]?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const items = itemRefs.current.filter((el): el is HTMLButtonElement => el !== null);
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.key === 'ArrowDown'
          ? (currentIndex + 1) % items.length
          : (currentIndex - 1 + items.length) % items.length;
        items[nextIndex]?.focus();
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        itemRefs.current[0]?.focus();
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        itemRefs.current[OPTIONS.length - 1]?.focus();
        return;
      }
      if (event.key === 'Tab') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, preference]);

  const selectOption = (val: AppearancePreference) => {
    if (isAppearance(val)) {
      setPreference(val);
    }
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div
      className="appearance-control"
      ref={containerRef}
      onBlur={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`appearance-trigger ${open ? 'open' : ''}`}
        aria-label="Appearance"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="appearance-menu"
        value={preference}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={handleTriggerKeyDown}
      >
        <ActiveIcon size={16} aria-hidden="true" className="appearance-trigger-icon" />
        <span className="appearance-trigger-text">{currentOption.label}</span>
        <ChevronDown size={14} aria-hidden="true" className={`appearance-chevron ${open ? 'open' : ''}`} />
      </button>

      <div
        id="appearance-menu"
        role="listbox"
        aria-label="Appearance"
        className={`appearance-popover ${open ? 'open' : ''}`}
        aria-hidden={!open}
      >
        {OPTIONS.map((opt, idx) => {
          const isSelected = preference === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              ref={el => { itemRefs.current[idx] = el; }}
              type="button"
              role="option"
              aria-selected={isSelected}
              value={opt.value}
              tabIndex={open ? (isSelected ? 0 : -1) : -1}
              className={`appearance-option ${isSelected ? 'selected' : ''}`}
              onClick={() => selectOption(opt.value)}
            >
              <Icon size={16} aria-hidden="true" className="appearance-option-icon" />
              <span className="appearance-option-label">{opt.label}</span>
              {isSelected && (
                <Check size={14} aria-hidden="true" className="appearance-option-check" />
              )}
            </button>
          );
        })}
      </div>

      {saveError && (
        <span className="appearance-error" role="status">
          Appearance applies for this visit. Device storage is unavailable.
        </span>
      )}
    </div>
  );
}
