import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ExternalLink, Info } from 'lucide-react';
import { sourceHost, uniqueSources, type AboutHighlight } from '../../../content/ielts-about';
import { aboutHref } from '../routes';

/** External official-source links. Visually distinct from internal navigation (icon, host label, new tab). */
export function SourceLinks({ urls, label = 'Official source' }: { urls: readonly string[]; label?: string }) {
  const safe = uniqueSources(urls);
  if (!safe.length) return <p className="about-source-pending">Source link pending verification.</p>;
  return (
    <p className="about-sources">
      <span className="about-sources-label">{safe.length > 1 ? `${label}s` : label}:</span>
      {safe.map(url => (
        <a key={url} className="about-source-link" href={url} target="_blank" rel="noopener noreferrer">
          {sourceHost(url)}
          <ExternalLink size={13} aria-hidden="true" />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </p>
  );
}

/** One cited highlight: heading, plain-text body, optional bullets, table, internal link, caveat and sources. */
export function HighlightCard({ item, className = '', children }: { item: AboutHighlight; className?: string; children?: ReactNode }) {
  return (
    <article className={`about-highlight ${className}`} data-highlight-id={item.id}>
      <h3>{item.heading}</h3>
      {item.paragraphs && item.paragraphs.length > 0 ? (
        item.paragraphs.map((p, i) => <p key={i}>{p}</p>)
      ) : (
        <p>{item.text}</p>
      )}
      {item.bullets && item.bullets.length > 0 && (
        <ul className="about-bullets">
          {item.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
      {item.table && (
        <div className="about-table-wrap">
          <table className="about-table">
            {item.table.caption && <caption className="sr-only">{item.table.caption}</caption>}
            <thead>
              <tr>{item.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {item.table.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {item.internal_link && (
        <div className="about-internal-link">
          <Link className="about-related-link" to={aboutHref(item.internal_link.to)}>
            {item.internal_link.label} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
      {children}
      {item.note && <p className="about-caveat"><Info size={15} aria-hidden="true" /><span>{item.note}</span></p>}
      <SourceLinks urls={item.source_urls} />
    </article>
  );
}

/** Accessible disclosure: heading > button[aria-expanded] controlling a labelled region. Collapsed by default. */
export function AccordionItem({ title, headingLevel = 3, children, defaultOpen = false, highlightId, showToggleText = false, className = '' }: {
  title: ReactNode; headingLevel?: 3 | 4; children: ReactNode; defaultOpen?: boolean; highlightId?: string; showToggleText?: boolean; className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const Heading = headingLevel === 3 ? 'h3' : 'h4';
  return (
    <div className={`about-accordion-item ${open ? 'open' : ''} ${className}`.trim()} data-highlight-id={highlightId}>
      <Heading className="about-accordion-heading">
        <button type="button" id={`${id}-button`} aria-expanded={open} aria-controls={`${id}-panel`} onClick={() => setOpen(value => !value)}>
          <span>{title}</span>
          <span className="about-accordion-action">
            {showToggleText && <span className="about-accordion-toggle-text">{open ? 'Hide' : 'Show'}</span>}
            <ChevronDown className="about-accordion-chevron" size={20} aria-hidden="true" />
          </span>
        </button>
      </Heading>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} className="about-accordion-panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

export interface TabDefinition { id: string; label: string; content: ReactNode }

/** WAI-ARIA tabs with roving focus (Arrow keys, Home, End). */
export function AboutTabs({ tabs, label }: { tabs: readonly TabDefinition[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0 : event.key === 'End' ? last : -1;
    if (next < 0) return;
    event.preventDefault();
    setActive(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div className="about-tabs">
      <div role="tablist" aria-label={label} className="about-tablist">
        {tabs.map((tab, index) => {
          const selected = tab.id === active;
          return (
            <button key={tab.id} ref={el => { refs.current[index] = el; }} type="button" role="tab" id={`${base}-${tab.id}-tab`}
              aria-selected={selected} aria-controls={`${base}-${tab.id}-panel`} tabIndex={selected ? 0 : -1}
              className={selected ? 'active' : ''} onClick={() => setActive(tab.id)} onKeyDown={event => onKey(event, index)}>
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map(tab => (
        <div key={tab.id} role="tabpanel" id={`${base}-${tab.id}-panel`} aria-labelledby={`${base}-${tab.id}-tab`}
          tabIndex={0} hidden={tab.id !== active} className="about-tabpanel">
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/** Standard page section with an h2. */
export function AboutSection({ title, description, children, className = '' }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`about-section ${className}`}>
      <h2>{title}</h2>
      {description && <p className="about-section-intro">{description}</p>}
      {children}
    </section>
  );
}

/** Notice/banner surface. `tone` maps to semantic tokens only. */
export function AboutNotice({ title, children, tone = 'info', icon }: { title: string; children: ReactNode; tone?: 'info' | 'warning'; icon?: ReactNode }) {
  return (
    <aside className={`about-notice about-notice-${tone}`} aria-label={title}>
      <span className="about-notice-icon" aria-hidden="true">{icon ?? <Info size={20} />}</span>
      <div><strong>{title}</strong>{children}</div>
    </aside>
  );
}

