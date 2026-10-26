import { AppearanceControl } from './appearance/components/AppearanceControl';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Languages,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import { Badge, Button, Card, ProgressBar } from '../components/UI';
import { readState, updateState } from '../state';
import type { AppState, Onboarding as Preferences, User } from '../types';

const steps = [
  { label: 'Welcome', title: 'Let’s build a plan around you.' },
  { label: 'About you', title: 'First, tell us a little about you.' },
  { label: 'IELTS goal', title: 'What are you working towards?' },
  { label: 'Language settings', title: 'Choose how your coach communicates.' },
  { label: 'Starting point', title: 'Set a pace you can keep.' },
  { label: 'Diagnostic', title: 'One short assessment. A much clearer plan.' },
] as const;

type Choice<T extends string | number> = { value: T; label: string; detail?: string };

function ChoiceGrid<T extends string | number>({
  items,
  selected,
  onChange,
  className = '',
}: {
  items: Choice<T>[];
  selected: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={`choice-grid ${className}`}>
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <button
            type="button"
            key={item.value}
            aria-pressed={active}
            className={`choice-card phase-choice ${active ? 'selected' : ''}`}
            onClick={() => onChange(item.value)}
          >
            <span className="phase-choice-copy">
              <strong>{item.label}</strong>
              {item.detail && <small>{item.detail}</small>}
            </span>
            {active && <Check className="choice-check" size={18} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

export function Onboarding() {
  const navigate = useNavigate();
  const initial = readState();
  const [state, setState] = useState(initial);
  const [step, setStep] = useState(Math.max(0, Math.min(5, initial.onboarding.step || 0)));
  const [error, setError] = useState('');

  const save = (mutator: (next: AppState) => void) => {
    try {
      const next = updateState(mutator);
      setState(next);
      setError('');
      return true;
    } catch {
      setError('Your progress could not be saved on this device. Check browser storage and try again.');
      return false;
    }
  };

  const choose = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    save((next) => {
      next.onboarding[key] = value;
    });
  };

  const updateUser = <K extends keyof User>(key: K, value: User[K]) => {
    save((next) => {
      next.user[key] = value;
    });
  };

  const validate = () => {
    if (step === 1 && !state.user.firstName.trim()) {
      setError('Enter your first name to continue.');
      return false;
    }
    if (step === 1 && !state.user.studyContext.trim()) {
      setError('Choose the option that best describes what you are doing now.');
      return false;
    }
    if (step === 2 && !state.onboarding.reason) {
      setError('Choose your main reason for taking IELTS.');
      return false;
    }
    if (step === 4 && !state.onboarding.selfAssessment) {
      setError('Choose the English level that feels closest to your starting point.');
      return false;
    }
    setError('');
    return true;
  };

  const moveTo = (nextStep: number) => {
    if (nextStep > step && !validate()) return;
    const bounded = Math.max(0, Math.min(5, nextStep));
    if (save((next) => { next.onboarding.step = bounded; })) {
      setStep(bounded);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const saveAndExit = () => {
    if (save((next) => { next.onboarding.step = step; })) navigate('/');
  };

  const finish = (action: 'start' | 'skip') => {
    const now = new Date().toISOString();
    const saved = save((next) => {
      next.onboarding.complete = true;
      next.onboarding.step = 5;
      if (next.diagnostic.status !== 'complete') {
        next.diagnostic.status = action === 'start' ? 'in_progress' : 'skipped';
        if (action === 'start') next.diagnostic.startedAt ||= now;
        next.diagnostic.updatedAt = now;
      }
    });
    if (!saved) return;
    navigate(action === 'start' ? '/diagnostic' : '/dashboard');
  };

  return (
    <div className="onboard-page">
      <header className="onboard-top">
        <button className="brand-btn" onClick={saveAndExit} aria-label="Save progress and return home">
          <span className="brand-mark"><GraduationCap aria-hidden="true" /></span>
          AI IELTS Coach
        </button>
        <div className="onboard-actions"><AppearanceControl/><Button kind="ghost" onClick={saveAndExit}>Save &amp; exit</Button></div>
      </header>

      <main className="onboard-main phase-one-main">
        <div className="onboard-hero">
          <Badge tone="blue">Phase 1 of 2 · Goals &amp; personalization</Badge>
          <h1>{steps[step].title}</h1>
          <p>{step === 0 ? 'Six simple steps help us understand your goal, preferences and available study time.' : 'Your answers are saved as you go and can be changed later.'}</p>
        </div>

        <div className="onboard-shell">
          <div className="progress-top" aria-live="polite">
            <strong>Step {step + 1} of 6</strong>
            <span>{steps[step].label}</span>
          </div>
          <ProgressBar value={((step + 1) / 6) * 100} label="Goal setup progress" valueText={`Step ${step + 1} of 6`} />
          <div className="step-dots" aria-hidden="true">
            {steps.map((item, index) => <span className={`step-dot ${index <= step ? 'active' : ''}`} key={item.label} />)}
          </div>

          <Card className="onboard-panel">
            {step === 0 && (
              <div className="step-content phase-welcome">
                <div className="welcome-mark"><Sparkles size={28} aria-hidden="true" /></div>
                <Badge tone="green">Takes about 3 minutes</Badge>
                <h2>Your IELTS goal, your starting point, your plan.</h2>
                <p className="lead">We’ll ask about what you need, how you prefer to learn and how much time you have. You can then explore the prototype diagnostic, or skip it and keep learning.</p>
                <div className="phase-overview" aria-label="What happens next">
                  <div><UserRound aria-hidden="true" /><span><strong>Tell us about you</strong><small>Goals and study context</small></span></div>
                  <div><Clock3 aria-hidden="true" /><span><strong>Choose your pace</strong><small>Time and learning preferences</small></span></div>
                  <div><ClipboardCheck aria-hidden="true" /><span><strong>Check your starting point</strong><small>A diagnostic you can skip or resume</small></span></div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="step-content">
                <div className="phase-step-icon"><UserRound aria-hidden="true" /></div>
                <h2>About you</h2>
                <p className="lead">This keeps your plan relevant to your everyday English needs.</p>
                <div className="form-stack">
                  <label className="field">
                    <span>First name</span>
                    <input className="input" autoFocus autoComplete="given-name" value={state.user.firstName} onChange={(event) => updateUser('firstName', event.target.value)} placeholder="e.g. Dilnoza" />
                  </label>
                  <div className="inline-grid">
                    <label className="field">
                      <span>Age range <small>(optional)</small></span>
                      <select className="select" value={state.user.ageGroup || ''} onChange={(event) => updateUser('ageGroup', event.target.value)}>
                        <option value="">Prefer not to say</option>
                        <option value="Under 18">Under 18</option>
                        <option value="18–24">18–24</option>
                        <option value="25–34">25–34</option>
                        <option value="35–44">35–44</option>
                        <option value="45+">45+</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>What are you doing now?</span>
                      <select className="select" value={state.user.studyContext} onChange={(event) => updateUser('studyContext', event.target.value)}>
                        <option value="">Choose one</option>
                        <option value="School student">School student</option>
                        <option value="University student">University student</option>
                        <option value="Working professional">Working professional</option>
                        <option value="Preparing independently">Preparing independently</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    <span>Occupation or field of study <small>(optional)</small></span>
                    <input className="input" value={state.user.occupation || ''} onChange={(event) => updateUser('occupation', event.target.value)} placeholder="e.g. Computer science student" />
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <div className="phase-step-icon"><Target aria-hidden="true" /></div>
                <h2>Your IELTS goal</h2>
                <p className="lead">We’ll use this goal to organise your plan. It is a direction, not a promised score.</p>
                <fieldset className="phase-fieldset">
                  <legend>Which IELTS test are you preparing for?</legend>
                  <ChoiceGrid
                    items={[
                      { value: 'Academic', label: 'IELTS Academic', detail: 'For university and many professional registrations' },
                      { value: 'General Training', label: 'IELTS General Training', detail: 'For migration, work and everyday contexts' },
                    ]}
                    selected={state.onboarding.ieltsType}
                    onChange={(value) => choose('ieltsType', value)}
                  />
                </fieldset>
                <div className="inline-grid phase-form-gap">
                  <label className="field">
                    <span>Target IELTS band</span>
                    <select className="select" value={state.onboarding.targetBand} onChange={(event) => choose('targetBand', Number(event.target.value))}>
                      {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((band) => <option key={band} value={band}>{band.toFixed(1)}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span>Planned test date <small>(optional)</small></span>
                    <input className="input" type="date" value={state.onboarding.examDate} onChange={(event) => choose('examDate', event.target.value)} />
                  </label>
                </div>
                <fieldset className="phase-fieldset phase-form-gap">
                  <legend>What is your main reason?</legend>
                  <ChoiceGrid
                    className="phase-compact-grid"
                    items={[
                      { value: 'Study abroad', label: 'Study abroad' },
                      { value: 'Prepare for IELTS', label: 'University admission' },
                      { value: 'Professional goal', label: 'Work or career' },
                      { value: 'Migration', label: 'Migration' },
                      { value: 'Improve English first', label: 'Build English first' },
                      { value: 'Personal goal', label: 'Personal goal' },
                    ]}
                    selected={state.onboarding.reason}
                    onChange={(value) => choose('reason', value)}
                  />
                </fieldset>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <div className="phase-step-icon"><Languages aria-hidden="true" /></div>
                <h2>Language settings</h2>
                <p className="lead">These choices guide examples and coach explanations. IELTS tasks still stay in English.</p>
                <fieldset className="phase-fieldset">
                  <legend>Which English variety should examples follow?</legend>
                  <ChoiceGrid
                    items={[
                      { value: 'UK', label: 'UK English', detail: 'British spelling and common usage' },
                      { value: 'US', label: 'US English', detail: 'American spelling and common usage' },
                    ]}
                    selected={state.onboarding.englishVariant}
                    onChange={(value) => choose('englishVariant', value)}
                  />
                </fieldset>
                <fieldset className="phase-fieldset phase-form-gap">
                  <legend>How should your coach explain difficult ideas?</legend>
                  <ChoiceGrid
                    className="phase-three-grid"
                    items={[
                      { value: 'English', label: 'English', detail: 'Full English immersion' },
                      { value: 'Uzbek', label: 'Uzbek', detail: 'Support in Uzbek' },
                      { value: 'English + Uzbek', label: 'English + Uzbek', detail: 'Use both when helpful' },
                    ]}
                    selected={state.onboarding.explanationLanguage}
                    onChange={(value) => choose('explanationLanguage', value)}
                  />
                </fieldset>
              </div>
            )}

            {step === 4 && (
              <div className="step-content">
                <div className="phase-step-icon"><Clock3 aria-hidden="true" /></div>
                <h2>Your starting point and study pace</h2>
                <p className="lead">Choose the closest fit. This is your self-report, not an assessed CEFR level.</p>
                <fieldset className="phase-fieldset">
                  <legend>How would you describe your English today?</legend>
                  <ChoiceGrid
                    className="phase-level-grid"
                    items={[
                      { value: 'A1', label: 'A1 · Beginner', detail: 'A few basic words and phrases' },
                      { value: 'A2', label: 'A2 · Elementary', detail: 'Simple everyday exchanges' },
                      { value: 'B1', label: 'B1 · Intermediate', detail: 'Familiar topics with some detail' },
                      { value: 'B2', label: 'B2 · Upper-intermediate', detail: 'Clear discussion on many topics' },
                      { value: 'C1+', label: 'C1+ · Advanced', detail: 'Flexible, detailed communication' },
                    ]}
                    selected={state.onboarding.selfAssessment}
                    onChange={(value) => choose('selfAssessment', value)}
                  />
                </fieldset>
                <fieldset className="phase-fieldset phase-form-gap">
                  <legend>How much time can you study each day?</legend>
                  <ChoiceGrid
                    className="phase-five-grid"
                    items={[15, 30, 45, 60, 90].map((minutes) => ({ value: minutes, label: minutes === 90 ? '90+ min' : `${minutes} min` }))}
                    selected={state.onboarding.dailyMinutes}
                    onChange={(value) => choose('dailyMinutes', value)}
                  />
                </fieldset>
                <fieldset className="phase-fieldset phase-form-gap">
                  <legend>Preferred session length</legend>
                  <ChoiceGrid
                    className="phase-four-grid"
                    items={[
                      { value: 15, label: '10–15 min' },
                      { value: 25, label: '20–30 min' },
                      { value: 40, label: '30–45 min' },
                      { value: 55, label: '45–60 min' },
                    ]}
                    selected={state.onboarding.sessionLength}
                    onChange={(value) => choose('sessionLength', value)}
                  />
                </fieldset>
                <fieldset className="phase-fieldset phase-form-gap">
                  <legend>Choose your plan intensity</legend>
                  <ChoiceGrid
                    items={[
                      { value: 'Gentle', label: 'Gentle', detail: 'A light plan with more review time' },
                      { value: 'Balanced', label: 'Balanced', detail: 'Steady progress across the week' },
                      { value: 'Focused', label: 'Focused', detail: 'More practice on priority skills' },
                      { value: 'Intensive', label: 'Intensive', detail: 'A demanding schedule for a close date' },
                    ]}
                    selected={state.onboarding.intensity}
                    onChange={(value) => choose('intensity', value)}
                  />
                </fieldset>
              </div>
            )}

            {step === 5 && (
              <div className="step-content phase-handoff">
                <div className="phase-step-icon"><ClipboardCheck aria-hidden="true" /></div>
                <Badge tone="ai">Phase 2 · Diagnostic assessment</Badge>
                <h2>Ready to find your starting point?</h2>
                <p className="lead">The diagnostic checks Grammar, Vocabulary, Reading, Listening, Writing, Speaking and IELTS Familiarity. Question, media and scoring validation are pending. This prototype cannot establish a validated baseline.</p>
                <div className="assess-intro">
                  <div className="assess-list">
                    <p><Check size={17} aria-hidden="true" /> Seven short sections in a clear order</p>
                    <p><Check size={17} aria-hidden="true" /> Save your place and continue later</p>
                    <p><Check size={17} aria-hidden="true" /> AI support stays unavailable during assessment</p>
                    <p><Check size={17} aria-hidden="true" /> Skip for now if you want to explore first</p>
                  </div>
                </div>
                <p className="phase-note">Allow about 20–30 minutes for the original sample tasks. This prototype does not issue an official IELTS score.</p>
              </div>
            )}

            {error && <p className="error-box" role="alert">{error}</p>}

            <div className={`onboard-actions ${step === 5 ? 'phase-final-actions' : ''}`}>
              {step > 0 ? (
                <Button kind="secondary" onClick={() => moveTo(step - 1)}><ArrowLeft size={16} aria-hidden="true" />Back</Button>
              ) : <span aria-hidden="true" />}
              {step < 5 ? (
                <Button onClick={() => moveTo(step + 1)}>{step === 0 ? 'Get started' : 'Continue'}<ArrowRight size={16} aria-hidden="true" /></Button>
              ) : (
                <div className="phase-handoff-actions">
                  <Button kind="secondary" onClick={() => finish('skip')}>Skip for now</Button>
                  <Button onClick={() => finish('start')}>Start assessment<ArrowRight size={16} aria-hidden="true" /></Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
