import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarCheck, CheckCircle2, Clock3, Ear, Eye, FileCheck2, Laptop, Monitor, Search, Brain, ShieldCheck, Wifi } from 'lucide-react';
import { aboutCard, highlightsIn, questionTypeContent, type AboutCardContent, type AboutHighlight, type AboutTopicId, type QuestionTypeSection } from '../../../content/ielts-about';
import { differingSkills, durationDisplay, fourSkills, primaryGuidance, sharedSkills } from '../../../content/ielts-about/presentation';
import { aboutHref } from '../routes';
import { AboutNotice, AboutSection, AboutTabs, AccordionItem, HighlightCard, SourceLinks } from './AboutComponents';

const byId = (card: AboutCardContent, id: string): AboutHighlight => {
  const found = card.highlights.find(h => h.id === id);
  if (!found) throw new Error(`Missing IELTS About highlight ${id}`);
  return found;
};
const Chips = ({ items, label }: { items: readonly string[]; label: string }) => (
  <ul className="about-chips" aria-label={label}>{items.map(item => <li key={item}>{item}</li>)}</ul>
);
const Guidance = ({ id }: { id: AboutTopicId }) => {
  const guide = primaryGuidance[id];
  return guide ? <a className="about-guidance-link" href={guide.url} target="_blank" rel="noopener noreferrer">{guide.label}<span className="sr-only"> (opens in a new tab)</span><ArrowRight size={16} aria-hidden="true" /></a> : null;
};
const RelatedLink = ({ to, children }: { to: AboutTopicId; children: string }) => (
  <Link className="about-related-link" to={aboutHref(to)}>{children}<ArrowRight size={16} aria-hidden="true" /></Link>
);

/* 1. What is IELTS? */
function WhatIsIelts() {
  const card = aboutCard('what-is-ielts');
  const [name, skills] = highlightsIn(card, 'Overview');
  const purpose = highlightsIn(card, 'Purpose and recognition');
  const partners = highlightsIn(card, 'History and IELTS partners');
  return <>
    <AboutSection title="Overview">
      <div className="about-grid about-grid-2">
        <HighlightCard item={name} className="about-feature" />
        <HighlightCard item={skills}><Chips items={fourSkills} label="Skills tested" /></HighlightCard>
      </div>
    </AboutSection>
    <AboutSection title="Purpose and recognition">
      <div className="about-grid about-grid-3">{purpose.map(item => <HighlightCard key={item.id} item={item} />)}</div>
    </AboutSection>
    <AboutSection title="Background">
      <div className="about-accordion">
        {partners.map(item => (
          <AccordionItem key={item.id} title={`History and IELTS partners — ${item.heading}`} highlightId={item.id}>
            <p>{item.text}</p><SourceLinks urls={item.source_urls} />
          </AccordionItem>
        ))}
      </div>
    </AboutSection>
    <div className="about-related"><RelatedLink to="academic-general">Compare Academic and General Training</RelatedLink><RelatedLink to="test-format">Explore the test format</RelatedLink></div>
  </>;
}

/* 2. Academic vs General Training */
function AcademicGeneral() {
  const card = aboutCard('academic-general');
  const column = (title: string, intro: AboutHighlight, detail: AboutHighlight) => (
    <article className="about-compare-column" data-highlight-id={intro.id}>
      <span className="about-track-label">{title}</span>
      <h3>Who it is for</h3><p>{intro.text}</p><SourceLinks urls={intro.source_urls} />
      <div className="about-compare-detail" data-highlight-id={detail.id}>
        <h3>{detail.heading}</h3><p>{detail.text}</p><SourceLinks urls={detail.source_urls} />
      </div>
    </article>
  );
  return <>
    <AboutSection title="Which test?" description="Choose based on the requirement of the organization receiving your result.">
      <div className="about-compare">{column('IELTS Academic', byId(card, 'academic-general-01'), byId(card, 'academic-general-05'))}{column('IELTS General Training', byId(card, 'academic-general-02'), byId(card, 'academic-general-06'))}</div>
    </AboutSection>
    <AboutSection title="Common and different">
      <div className="about-grid about-grid-2">
        <HighlightCard item={byId(card, 'academic-general-03')}><Chips items={sharedSkills} label="Shared sections" /></HighlightCard>
        <HighlightCard item={byId(card, 'academic-general-04')}><Chips items={differingSkills} label="Sections that differ" /></HighlightCard>
      </div>
    </AboutSection>
    <div className="about-related"><RelatedLink to="test-format">See each section in detail</RelatedLink></div>
  </>;
}

/* 3. Test format */
function QuestionTypeList({ section }: { section: QuestionTypeSection }) {
  return (
    <div className="about-accordion about-question-types" data-skill={section.skillId}>
      {section.questionTypes.map(q => (
        <AccordionItem key={q.id} title={`Question type ${q.order} – ${q.title}`} highlightId={q.id}>
          <h4>What's involved?</h4><p>{q.whatIsInvolved}</p>
          <h4>What skills are tested?</h4><p>{q.skillsTested}</p>
          <h4>How many questions are there?</h4><p>{q.questionCount}</p>
          {q.practicalNote && <><h4>Practical note</h4><p>{q.practicalNote}</p></>}
          <SourceLinks urls={q.sourceUrls} />
        </AccordionItem>
      ))}
    </div>
  );
}
function TestFormat() {
  const card = aboutCard('test-format');
  const tracks = aboutCard('academic-general');
  const durations = aboutCard('sections-duration');
  const listening = questionTypeContent.sections.find(s => s.skillId === 'listening');
  const reading = questionTypeContent.sections.find(s => s.skillId === 'academic-reading');
  const summary = (section: string) => <div className="about-grid about-grid-2">{highlightsIn(card, section).map(item => <HighlightCard key={item.id} item={item} />)}</div>;
  const tabs = [
    { id: 'listening', label: 'Listening', content: <>
      <div className="about-tab-head"><h2>Listening</h2><span className="about-track-label">Academic &amp; General Training</span></div>
      {summary('Listening')}
      {listening && <section className="about-types"><h3 className="about-types-title">Types of question</h3><QuestionTypeList section={listening} /><SourceLinks urls={[listening.officialReference]} label="Official Listening format" /></section>}
    </> },
    { id: 'reading', label: 'Reading', content: <>
      <div className="about-tab-head"><h2>Reading</h2><span className="about-track-label">Academic Reading</span></div>
      {summary('Reading')}
      <AboutNotice title="General Training Reading">
        <p>The question types below describe <strong>Academic Reading</strong>. Detailed General Training Reading question-type information is pending verification and is not shown here.</p>
      </AboutNotice>
      {reading && <section className="about-types"><h3 className="about-types-title">Types of question — Academic Reading</h3><QuestionTypeList section={reading} /><SourceLinks urls={[reading.officialReference]} label="Official Academic Reading format" /></section>}
    </> },
    { id: 'writing', label: 'Writing', content: <>
      <div className="about-tab-head"><h2>Writing</h2><span className="about-track-label">Track-specific Task 1</span></div>
      <HighlightCard item={byId(card, 'test-format-05')} className="about-feature" />
      <h3 className="about-subheading">Task 1</h3>
      <div className="about-grid about-grid-3">
        <HighlightCard item={byId(card, 'test-format-07')} />
        <HighlightCard item={byId(tracks, 'academic-general-05')}><span className="about-track-label">Academic</span></HighlightCard>
        <HighlightCard item={byId(tracks, 'academic-general-06')}><span className="about-track-label">General Training</span></HighlightCard>
      </div>
      <h3 className="about-subheading">Task 2</h3>
      <div className="about-grid about-grid-2"><HighlightCard item={byId(card, 'test-format-06')} /><HighlightCard item={byId(card, 'test-format-08')} /></div>
      <div className="about-related"><RelatedLink to="sections-duration">How Writing time is usually divided</RelatedLink></div>
    </> },
    { id: 'speaking', label: 'Speaking', content: <>
      <div className="about-tab-head"><h2>Speaking</h2><span className="about-track-label">Academic &amp; General Training</span></div>
      <HighlightCard item={byId(card, 'test-format-09')} className="about-feature">
        <ol className="about-parts" aria-label="Speaking parts"><li><span>Part 1</span>Interview</li><li><span>Part 2</span>Individual long turn</li><li><span>Part 3</span>Discussion</li></ol>
      </HighlightCard>
      <div className="about-grid about-grid-2"><HighlightCard item={byId(card, 'test-format-10')} /><HighlightCard item={byId(durations, 'sections-duration-04')} /></div>
    </> },
  ];
  return <>
    <AboutTabs tabs={tabs} label="IELTS skills" />
    <AboutNotice title="About this format guide">
      <ul>{questionTypeContent.deliveryNotes.slice(0, 3).map(note => <li key={note}>{note}</li>)}</ul>
    </AboutNotice>
  </>;
}

/* 4. Sections and duration */
function SectionsDuration() {
  const card = aboutCard('sections-duration');
  const [listening, reading, writing, speaking, task1, task2] = highlightsIn(card, 'Core durations');
  const sequence = highlightsIn(card, 'Test sequence');
  const tile = (item: AboutHighlight) => {
    const display = durationDisplay[item.id];
    return (
      <article key={item.id} className="about-duration" data-highlight-id={item.id}>
        <h3>{item.heading}</h3>
        {display && <p className="about-duration-value"><strong>{display.value}</strong> {display.unit}</p>}
        {display?.qualifier && <span className="about-track-label">{display.qualifier}</span>}
        <p>{item.text}</p><SourceLinks urls={item.source_urls} />
      </article>
    );
  };
  return <>
    <AboutSection title="Core durations"><div className="about-grid about-grid-4">{[listening, reading, writing, speaking].map(tile)}</div></AboutSection>
    <AboutSection title="Planning your Writing time" description="Suggested split of the 60-minute Writing section.">
      <div className="about-split" aria-hidden="true"><span style={{ flexGrow: 1 }}>Task 1 · ~20 min</span><span style={{ flexGrow: 2 }}>Task 2 · ~40 min</span></div>
      <div className="about-grid about-grid-2"><HighlightCard item={task1} /><HighlightCard item={task2} /></div>
    </AboutSection>
    <AboutSection title="Test sequence">
      <ol className="about-timeline" aria-label="Typical test sequence">
        <li><span>1</span>Listening</li><li><span>2</span>Reading</li><li><span>3</span>Writing</li><li className="about-timeline-separate"><span>4</span>Speaking <small>may be scheduled separately</small></li>
      </ol>
      {sequence.map(item => <HighlightCard key={item.id} item={item} />)}
    </AboutSection>
    <AboutSection title="Delivery-specific timing">
      <AboutNotice title="Timings can differ by delivery mode" icon={<Clock3 size={20} />} tone="warning">
        <p>Administration details, such as how answers are recorded, depend on whether you take the test on computer, on paper where still offered, or online. Confirm details with your test provider.</p>
      </AboutNotice>
      <div className="about-related"><RelatedLink to="computer-paper">Current delivery options</RelatedLink></div>
    </AboutSection>
  </>;
}

/* 5. Band scores */
function Bands() {
  const card = aboutCard('bands');
  const [scale] = highlightsIn(card, 'Band scale');
  const calc = highlightsIn(card, 'Overall score calculation');
  const [objective] = highlightsIn(card, 'Section scoring');
  const criteria = highlightsIn(card, 'Writing and Speaking criteria');
  const disclaimer = criteria.find(h => h.id === 'bands-08');
  return <>
    {disclaimer && <AboutNotice title={disclaimer.heading} icon={<ShieldCheck size={20} />} tone="warning"><p data-highlight-id={disclaimer.id}>{disclaimer.text}</p><SourceLinks urls={disclaimer.source_urls} /></AboutNotice>}
    <AboutSection title="Band scale">
      <HighlightCard item={scale} className="about-feature">
        <ol className="about-band-ladder" aria-label="Band scale from 0 to 9">{Array.from({ length: 10 }, (_, band) => <li key={band}>{band}</li>)}</ol>
        <p className="about-muted-note">Detailed band descriptors are published by IELTS; follow the official source for their wording.</p>
      </HighlightCard>
    </AboutSection>
    <AboutSection title="How the overall band is calculated">
      <ol className="about-steps">{calc.map((item, index) => <li key={item.id}><span className="about-step-number" aria-hidden="true">{index + 1}</span><HighlightCard item={item} /></li>)}</ol>
    </AboutSection>
    <AboutSection title="Section scoring"><HighlightCard item={objective} /></AboutSection>
    <AboutSection title="Writing and Speaking criteria">
      <div className="about-accordion">
        {criteria.filter(h => h.id !== 'bands-08').map(item => <AccordionItem key={item.id} title={item.heading} highlightId={item.id}><p>{item.text}</p><SourceLinks urls={item.source_urls} /></AccordionItem>)}
      </div>
    </AboutSection>
  </>;
}

/* 6. Registration and test day */
function RegistrationTestDay() {
  const card = aboutCard('registration-test-day');
  const column = (title: string, icon: JSX.Element) => (
    <section className="about-checklist" key={title}>
      <h2>{icon}{title}</h2>
      <ul>{highlightsIn(card, title).map(item => (
        <li key={item.id} data-highlight-id={item.id}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <div><h3>{item.heading}</h3><p>{item.text}</p>{item.note && <p className="about-caveat">{item.note}</p>}<SourceLinks urls={item.source_urls} /></div>
        </li>
      ))}</ul>
    </section>
  );
  return <>
    <AboutNotice title="Policies vary by provider and location" tone="warning" icon={<AlertTriangle size={20} />}>
      <p>Booking steps, accepted ID, fees, result timing and review deadlines are set by your official test provider. Always follow the instructions in your booking confirmation.</p><Guidance id="registration-test-day" />
    </AboutNotice>
    <div className="about-checklists">{column('Before booking', <CalendarCheck size={20} aria-hidden="true" />)}{column('On test day', <FileCheck2 size={20} aria-hidden="true" />)}{column('Results and enquiries', <ShieldCheck size={20} aria-hidden="true" />)}</div>
  </>;
}

/* 7. Computer / paper */
function ComputerPaper() {
  const card = aboutCard('computer-paper');
  const [update] = highlightsIn(card, '2026 update');
  const centre = highlightsIn(card, 'Test centre computer delivery');
  const online = highlightsIn(card, 'IELTS Online');
  return <>
    <AboutNotice title="2026 update: paper-based IELTS is being phased out" tone="warning" icon={<AlertTriangle size={20} />}>
      <p data-highlight-id={update.id}>{update.text}</p>
      <p className="about-muted-note">Announced in March 2026. Timelines differ by country; check your local options before booking.</p>
      <SourceLinks urls={update.source_urls} /><Guidance id="computer-paper" />
    </AboutNotice>
    <AboutSection title="Delivery options compared">
      <div className="about-compare">
        <article className="about-compare-column"><span className="about-track-label"><Monitor size={14} aria-hidden="true" /> At a test centre</span><h3>Computer-delivered IELTS</h3>
          {centre.map(item => <div key={item.id} className="about-compare-detail" data-highlight-id={item.id}><h4>{item.heading}</h4><p>{item.text}</p><SourceLinks urls={item.source_urls} /></div>)}
        </article>
        <article className="about-compare-column"><span className="about-track-label"><Wifi size={14} aria-hidden="true" /> Remote · Academic only</span><h3>IELTS Online</h3>
          {online.map(item => <div key={item.id} className="about-compare-detail" data-highlight-id={item.id}><h4>{item.heading}</h4><p>{item.text}</p><SourceLinks urls={item.source_urls} /></div>)}
        </article>
      </div>
    </AboutSection>
    <AboutSection title="Legacy paper guidance">
      <AboutNotice title="Pending verification" icon={<Laptop size={20} />}>
        <p>Older paper-test guidance in our source archive predates the 2026 update and has been withheld until it is verified against current official information.</p>
      </AboutNotice>
    </AboutSection>
  </>;
}

/* 8. Accessibility */
function Accessibility() {
  const card = aboutCard('accessibility');
  const support = highlightsIn(card, 'Getting support');
  const categories: [string, JSX.Element][] = [['Vision', <Eye size={22} />], ['Hearing and speech', <Ear size={22} />], ['Learning differences', <Brain size={22} />], ['Exemptions', <FileCheck2 size={22} />]];
  return <>
    <AboutNotice title="Contact your test centre early" icon={<CalendarCheck size={20} />}>
      {support.map(item => <div key={item.id} data-highlight-id={item.id}><p><strong>{item.heading}.</strong> {item.text}</p></div>)}
      <SourceLinks urls={support.flatMap(item => item.source_urls)} /><Guidance id="accessibility" />
    </AboutNotice>
    <AboutSection title="Support categories" description="Arrangements depend on individual needs and are subject to approval. No arrangement is guaranteed.">
      <div className="about-grid about-grid-2">
        {categories.flatMap(([section, icon]) => highlightsIn(card, section).map(item => (
          <HighlightCard key={item.id} item={item}><span className="about-category"><span className="discovery-icon" aria-hidden="true">{icon}</span>{section}</span></HighlightCard>
        )))}
      </div>
    </AboutSection>
  </>;
}

/* 9. FAQs */
function Faqs() {
  const card = aboutCard('faqs');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All');
  const categories = ['All', ...card.display.section_groups];
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return card.highlights.filter(item => (category === 'All' || item.section === category) && (!q || `${item.heading} ${item.text}`.toLowerCase().includes(q)));
  }, [card, query, category]);
  return <>
    <div className="about-faq-tools">
      <label className="about-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search FAQs</span>
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search questions" /></label>
      <div className="about-filters" role="group" aria-label="Filter by topic">
        {categories.map(name => <button key={name} type="button" aria-pressed={category === name} className={category === name ? 'active' : ''} onClick={() => setCategory(name)}>{name}</button>)}
      </div>
    </div>
    <p className="about-result-count" role="status" aria-live="polite">{results.length} of {card.highlights.length} questions</p>
    {results.length ? <div className="about-accordion">
      {results.map(item => <AccordionItem key={item.id} title={item.heading} highlightId={item.id}><span className="about-track-label">{item.section}</span><p>{item.text}</p><SourceLinks urls={item.source_urls} /></AccordionItem>)}
    </div> : <p className="about-empty">No questions match. Try another word or choose “All”.</p>}
  </>;
}

const pages: Record<AboutTopicId, () => JSX.Element> = {
  'what-is-ielts': WhatIsIelts, 'academic-general': AcademicGeneral, 'test-format': TestFormat, 'sections-duration': SectionsDuration,
  bands: Bands, 'registration-test-day': RegistrationTestDay, 'computer-paper': ComputerPaper, accessibility: Accessibility, faqs: Faqs,
};

export function AboutTopicBody({ id }: { id: AboutTopicId }) {
  const Page = pages[id];
  return <Page />;
}

