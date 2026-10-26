import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock3, GraduationCap, Save, ShieldCheck, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { diagnosticSections, readingPassage, speakingPrompt, writingPrompt } from '../data';
import { readState, writeState } from '../state';
import { buildDiagnosticResults } from '../services/diagnostic';
import { Button, Badge, Card, EmptyState, PageHeader, ProgressBar } from '../components/UI';
import { ActivityRenderer } from '../components/ActivityRenderer';
import { ContentViewer } from '../components/ContentViewer';
import { AudioPlayer, SpeakingRecorder } from '../components/MediaControls';
import { AppShell } from '../components/AppShell';
import type { AppState } from '../types';

const sectionIds = diagnosticSections.map(section => section.id);

function firstIncomplete(completed: string[]) {
  const index = sectionIds.findIndex(id => !completed.includes(id));
  return index < 0 ? diagnosticSections.length - 1 : index;
}

function words(value: string) {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function initialDiagnosticState() {
  const saved = readState();
  if (saved.diagnostic.status === 'complete' && saved.results) return saved;
  const nextSection = firstIncomplete(saved.diagnostic.completedSections);
  const savedSection = Math.max(0, Math.min(diagnosticSections.length - 1, saved.diagnostic.currentSection));
  const savedIsAvailable = saved.diagnostic.completedSections.includes(diagnosticSections[savedSection].id) || savedSection === nextSection;
  saved.diagnostic.currentSection = savedIsAvailable ? savedSection : nextSection;
  const questionCount = diagnosticSections[saved.diagnostic.currentSection].questions?.length ?? 1;
  saved.diagnostic.currentQuestion = Math.max(0, Math.min(questionCount - 1, saved.diagnostic.currentQuestion));
  return saved;
}

export function Diagnostic() {
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>(initialDiagnosticState);
  const stateRef = useRef(state);
  const [processing, setProcessing] = useState(
    () => state.diagnostic.status !== 'complete' && sectionIds.every(id => state.diagnostic.completedSections.includes(id)),
  );
  const [processingError, setProcessingError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [restored] = useState(() => {
    const saved = readState().diagnostic;
    return saved.status === 'skipped'
      || saved.currentSection > 0
      || saved.currentQuestion > 0
      || saved.completedSections.length > 0
      || Object.keys(saved.responses).length > 0
      || !!saved.writingText
      || saved.speakingStatus === 'SUBMITTED';
  });

  const sectionIndex = Math.max(0, Math.min(diagnosticSections.length - 1, state.diagnostic.currentSection));
  const current = diagnosticSections[sectionIndex];
  const questions = current.questions ?? [];
  const questionIndex = questions.length
    ? Math.max(0, Math.min(questions.length - 1, state.diagnostic.currentQuestion))
    : 0;
  const question = questions[questionIndex];
  const completedCount = state.diagnostic.completedSections.filter(id => sectionIds.includes(id)).length;
  const nextIncomplete = firstIncomplete(state.diagnostic.completedSections);
  const writingWords = words(state.diagnostic.writingText);
  const objectiveReady = !!question && state.diagnostic.responses[question.id] !== undefined;
  const currentReady = current.kind === 'writing'
    ? writingWords >= 180
    : current.kind === 'speaking'
      ? state.diagnostic.speakingStatus === 'SUBMITTED'
      : objectiveReady && (current.kind !== 'listening' || state.diagnostic.listeningPlayed);

  function commit(mutator: (next: AppState) => void, keepOnFailure = false) {
    const next = structuredClone(stateRef.current);
    mutator(next);
    next.diagnostic.updatedAt = new Date().toISOString();
    try {
      writeState(next);
      stateRef.current = next;
      setState(next);
      setSaveError('');
      return true;
    } catch {
      if (keepOnFailure) {
        stateRef.current = next;
        setState(next);
      }
      setSaveError('This change is still visible, but it could not be saved on this device. Free some browser storage, then try the action again before leaving this page.');
      return false;
    }
  }

  useEffect(() => {
    if (state.diagnostic.status === 'complete' && state.results) {
      navigate('/diagnostic/results', { replace: true });
      return;
    }
    commit(next => {
      next.diagnostic.status = 'in_progress';
      next.diagnostic.startedAt ||= new Date().toISOString();
      next.diagnostic.currentSection = sectionIndex;
      next.diagnostic.currentQuestion = questionIndex;
    });
    // This runs only when the diagnostic route is entered. Subsequent updates are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!processing) return;
    const timer = window.setTimeout(() => {
      try {
        const next = structuredClone(stateRef.current);
        next.diagnostic.status = 'complete';
        next.diagnostic.updatedAt = new Date().toISOString();
        next.results = buildDiagnosticResults(next);
        writeState(next);
        stateRef.current = next;
        setState(next);
        setSaveError('');
        navigate('/diagnostic/results', { replace: true });
      } catch {
        setProcessing(false);
        setProcessingError('We could not prepare your profile just now. Your completed sections remain available on this screen; choose Finish diagnostic to try again after browser storage is available.');
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [processing, navigate]);

  function chooseAnswer(answer: string) {
    if (!question) return;
    commit(next => {
      next.diagnostic.status = 'in_progress';
      next.diagnostic.currentSection = sectionIndex;
      next.diagnostic.currentQuestion = questionIndex;
      next.diagnostic.responses[question.id] = question.options.indexOf(answer);
    }, true);
  }

  function goToQuestion(nextQuestion: number) {
    commit(next => {
      next.diagnostic.currentSection = sectionIndex;
      next.diagnostic.currentQuestion = nextQuestion;
    });
  }

  function goToSection(nextSection: number, nextQuestion = 0) {
    commit(next => {
      next.diagnostic.currentSection = nextSection;
      next.diagnostic.currentQuestion = nextQuestion;
    });
  }

  function continueForward() {
    if (!currentReady) return;
    if (questions.length && questionIndex < questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }
    const saved = commit(next => {
      next.diagnostic.completedSections = [...new Set([...next.diagnostic.completedSections, current.id])];
      next.diagnostic.currentQuestion = 0;
      if (sectionIndex < diagnosticSections.length - 1) next.diagnostic.currentSection = sectionIndex + 1;
    });
    if (saved && sectionIndex === diagnosticSections.length - 1) {
      setProcessingError('');
      setProcessing(true);
    }
  }

  function goBack() {
    if (questionIndex > 0) {
      goToQuestion(questionIndex - 1);
      return;
    }
    if (sectionIndex === 0) return;
    const previous = diagnosticSections[sectionIndex - 1];
    goToSection(sectionIndex - 1, Math.max(0, (previous.questions?.length ?? 1) - 1));
  }

  function leaveDiagnostic(status: 'in_progress' | 'skipped') {
    const saved = commit(next => {
      next.diagnostic.status = status;
      next.diagnostic.currentSection = sectionIndex;
      next.diagnostic.currentQuestion = questionIndex;
    });
    if (saved) navigate('/dashboard');
  }

  if (processing) {
    return <div className="processing-page" role="status" aria-live="polite"><Card className="processing-card">
      <div className="spinner" aria-hidden="true"/>
      <Badge tone="blue">Phase 2 complete</Badge>
      <h1>Preparing your starting profile…</h1>
      <p className="muted">We are connecting only the evidence you completed to a provisional learning plan.</p>
      <div className="processing-list" aria-label="Diagnostic section status">
        {diagnosticSections.map(section => {
          const done = state.diagnostic.completedSections.includes(section.id);
          return <div className="processing-item" key={section.id}><span><span className={`processing-pip ${done ? 'done' : ''}`}/>{section.name}</span><strong>{done ? 'Completed' : 'Waiting'}</strong></div>;
        })}
      </div>
    </Card></div>;
  }

  const questionLabel = questions.length ? `Question ${questionIndex + 1} of ${questions.length}` : current.kind === 'writing' ? 'Written response' : 'Spoken response';
  const continueLabel = questions.length && questionIndex < questions.length - 1
    ? 'Next question'
    : sectionIndex === diagnosticSections.length - 1
      ? 'Finish diagnostic'
      : 'Complete section';

  return <AppShell mode="test"><div className="diagnostic-workflow">
    <PageHeader
      eyebrow="Phase 2 of 2 · Initial diagnostic"
      title="Let’s find your starting point."
      description="Seven short evidence sections. Hints, answer feedback and AI assistance stay off until you finish."
      actions={<div className="diagnostic-exit-actions"><Button kind="secondary" onClick={() => leaveDiagnostic('in_progress')}><Save size={16}/>Save &amp; continue later</Button><Button kind="ghost" onClick={() => leaveDiagnostic('skipped')}><SkipForward size={16}/>Skip for now</Button></div>}
    />

    <div className="diagnostic-progress-panel">
      <div className="diagnostic-progress-copy"><span>Section {sectionIndex + 1} of {diagnosticSections.length} · {current.name}</span><small>{completedCount} of {diagnosticSections.length} sections completed</small></div>
      <div role="progressbar" aria-label="Diagnostic completion" aria-valuemin={0} aria-valuemax={diagnosticSections.length} aria-valuenow={completedCount}><ProgressBar value={(completedCount / diagnosticSections.length) * 100}/></div>
    </div>

    <nav className="section-tabs" aria-label="Diagnostic sections">
      {diagnosticSections.map((item, index) => {
        const done = state.diagnostic.completedSections.includes(item.id);
        const available = done || index === nextIncomplete || index === sectionIndex;
        return <button type="button" className={`section-tab ${sectionIndex === index ? 'active' : ''} ${done ? 'done' : ''}`} key={item.id} disabled={!available} aria-current={sectionIndex === index ? 'step' : undefined} onClick={() => goToSection(index, index === sectionIndex ? questionIndex : 0)}>{done ? '✓ ' : ''}{item.name}</button>;
      })}
    </nav>

    {restored && <div className="notice diagnostic-restored" role="status"><CheckCircle2 size={16}/>Your saved diagnostic work is restored. You can continue from this section and question.</div>}
    {saveError && <div className="error-box" role="alert">{saveError}</div>}
    {processingError && <div className="error-box" role="alert">{processingError}</div>}

    <Card className="diagnostic-card">
      <div className="question-head"><div><div className="eyebrow">{current.name}</div><h2>{questionLabel}</h2></div><Badge tone={saveError ? 'amber' : state.diagnostic.completedSections.includes(current.id) ? 'green' : 'gray'}>{saveError ? 'Not saved' : state.diagnostic.completedSections.includes(current.id) ? 'Section completed' : 'Autosaved'}</Badge></div>

      {current.kind === 'reading' && question && <div className="diagnostic-reading-grid">
        <div className="diagnostic-passage"><ContentViewer mode="test" resourceId="diagnostic-reading" title="Urban green spaces" blocks={[{ type: 'heading', text: 'Urban green spaces and city life' }, ...readingPassage.map(text => ({ type: 'paragraph' as const, text }))]}/></div>
        <div className="diagnostic-question-panel"><ActivityRenderer key={question.id} mode="test" activity={{ id: question.id, type: 'single_choice', prompt: question.q, options: question.options, skill: question.skill, explanation: '' }} value={question.options[state.diagnostic.responses[question.id]]} onChange={value => chooseAnswer(String(value))}/></div>
      </div>}

      {current.kind === 'listening' && question && <div className="diagnostic-listening">
        <div className="diagnostic-audio-wrap"><AudioPlayer src="/listening-diagnostic.wav" mode="test" played={state.diagnostic.listeningPlayed} onPlayed={() => commit(next => {
          next.diagnostic.currentSection = sectionIndex;
          next.diagnostic.currentQuestion = questionIndex;
          next.diagnostic.listeningPlayed = true;
        }, true)}/></div>
        {!state.diagnostic.listeningPlayed && <p className="diagnostic-requirement"><ShieldCheck size={16}/>Play the recording once before moving through the questions. Your playback status is saved.</p>}
        <ActivityRenderer key={question.id} mode="test" activity={{ id: question.id, type: 'single_choice', prompt: question.q, options: question.options, skill: question.skill, explanation: '' }} value={question.options[state.diagnostic.responses[question.id]]} onChange={value => chooseAnswer(String(value))}/>
      </div>}

      {current.kind === 'objective' && question && <ActivityRenderer key={question.id} mode="test" activity={{ id: question.id, type: 'single_choice', prompt: question.q, options: question.options, skill: question.skill, explanation: '' }} value={question.options[state.diagnostic.responses[question.id]]} onChange={value => chooseAnswer(String(value))}/>}

      {current.kind === 'writing' && <div className="writing-test diagnostic-writing">
        <div className="prompt-card"><Badge tone="amber"><Clock3 size={13}/>20-minute guidance</Badge><h2>Writing diagnostic</h2><blockquote>{writingPrompt}</blockquote><p>Discuss both views and give your own opinion. Aim for 180–250 words for this focused diagnostic.</p></div>
        <label className="editor-wrap"><span className="editor-top"><strong>Your response</strong><span className={writingWords >= 180 ? 'word-target met' : 'word-target'}>{writingWords} / 180 minimum</span></span><textarea aria-describedby="diagnostic-writing-note" className="writing-editor" value={state.diagnostic.writingText} onChange={event => commit(next => {
          next.diagnostic.currentSection = sectionIndex;
          next.diagnostic.currentQuestion = 0;
          next.diagnostic.writingText = event.target.value;
        }, true)} placeholder="Write your response in your own words…"/><span id="diagnostic-writing-note" className="save-status"><Save size={14}/>{saveError ? 'Not safely saved yet · keep this page open and retry' : 'Saved on this device as you type'} · target range 180–250 words</span></label>
      </div>}

      {current.kind === 'speaking' && <div className="speaking-test diagnostic-speaking">
        <div className="speaking-prompt"><Badge tone="amber">1 minute to prepare · up to 2 minutes to speak</Badge><h2>{speakingPrompt.title}</h2><ul>{speakingPrompt.bullets.map(item => <li key={item}>{item}</li>)}</ul></div>
        <SpeakingRecorder mode="test" value={state.diagnostic.speakingStatus === 'SUBMITTED' ? `Recorded response (${state.diagnostic.speakingDuration}s).` : ''} onChange={value => {
          const duration = Number(value.match(/\((\d+)s\)/)?.[1] ?? 0);
          commit(next => {
            next.diagnostic.currentSection = sectionIndex;
            next.diagnostic.currentQuestion = 0;
            next.diagnostic.speakingStatus = value ? 'SUBMITTED' : 'READY';
            next.diagnostic.speakingDuration = duration;
          }, true);
        }}/>
        <p className="small muted">Preparation and recording happen on this device. Once submitted, the response status and duration are saved so you can resume safely.</p>
      </div>}

      <div className="diag-actions">
        <Button kind="secondary" disabled={sectionIndex === 0 && questionIndex === 0} onClick={goBack}>Back</Button>
        <div className="diag-right"><span className="small muted">{!currentReady ? current.kind === 'writing' ? `${Math.max(0, 180 - writingWords)} more words needed` : current.kind === 'speaking' ? 'Submit one response to continue' : current.kind === 'listening' && !state.diagnostic.listeningPlayed ? 'Play the audio and answer this question' : 'Choose an answer to continue' : 'Ready to continue'}</span><Button disabled={!currentReady} onClick={continueForward}>{continueLabel}</Button></div>
      </div>
    </Card>
  </div></AppShell>;
}

export function DiagnosticResults() {
  const state = readState();
  const navigate = useNavigate();
  const results = state.results;
  if (!results || state.diagnostic.status !== 'complete') {
    const started = state.diagnostic.status === 'in_progress' || state.diagnostic.status === 'skipped';
    return <AppShell><EmptyState title="Your starting profile is waiting" detail={started ? 'Your diagnostic work is saved. Complete all seven sections to generate your provisional profile.' : 'Complete the initial diagnostic to generate a provisional starting profile.'} action={started ? 'Resume diagnostic' : 'Start diagnostic'} onAction={() => navigate('/diagnostic')}/></AppShell>;
  }

  const completedEvidenceCount = state.diagnostic.completedSections.filter(id => sectionIds.includes(id)).length;
  return <AppShell><div className="diagnostic-results-page">
    <PageHeader eyebrow="Initial diagnostic complete" title="Your starting profile is ready." description="These estimates reflect the evidence in this diagnostic and will become more reliable as you complete lessons and assessments." actions={<Button onClick={() => navigate('/dashboard')}>See my learning plan</Button>}/>

    <section className="diagnostic-result-hero" aria-labelledby="diagnostic-overall-title">
      <div><Badge tone="blue"><GraduationCap size={14}/>Working English estimate · {results.cefr}</Badge><h2 id="diagnostic-overall-title">Provisional IELTS {results.overall.toFixed(1)}</h2><p>CEFR and IELTS describe different aspects of language ability, so this is a starting estimate rather than a direct conversion.</p></div>
      <div className="diagnostic-result-summary"><span>Evidence collected</span><strong>{completedEvidenceCount} / {diagnosticSections.length}</strong><small>{completedEvidenceCount === diagnosticSections.length ? 'all diagnostic sections' : 'recorded sections in this saved profile'}</small></div>
    </section>

    <div className="diagnostic-score-grid">
      {Object.entries(results.moduleScores).map(([name, score]) => <Card className="diagnostic-score-card" key={name}><div className="diagnostic-score-head"><strong>{name}</strong><Badge tone={score.confidence === 'High' ? 'green' : score.confidence === 'Medium' ? 'blue' : 'amber'}>{score.confidence} confidence</Badge></div><span className="diagnostic-band">{score.band.toFixed(1)}</span><ProgressBar value={score.evidencePercent} label={`${name} diagnostic evidence coverage`} valueText={`${score.evidencePercent} percent`}/><small>{score.evidencePercent}% evidence coverage</small></Card>)}
    </div>

    <div className="diagnostic-insight-grid">
      <Card className="diagnostic-insight-card"><div className="eyebrow">Evidence-based strengths</div><h2>A useful foundation</h2>{results.strengths.map(item => <p className="diagnostic-insight-line positive" key={item}><CheckCircle2 size={16}/>{item}</p>)}</Card>
      <Card className="diagnostic-insight-card"><div className="eyebrow">First priorities</div><h2>Where to focus next</h2>{results.weaknesses.map(item => <p className="diagnostic-insight-line" key={item}>{item}</p>)}</Card>
      <Card className="diagnostic-insight-card"><div className="eyebrow">IELTS familiarity</div><h2>{results.familiarity}%</h2><p className="muted">Based on the format-awareness questions you answered in the final section.</p></Card>
    </div>

    <div className="notice diagnostic-evidence-note"><ShieldCheck size={17}/><span>Objective items are checked against their answer keys. Writing and Speaking currently provide completion evidence with limited-confidence estimates; future scored attempts can refine every module.</span></div>
  </div></AppShell>;
}
