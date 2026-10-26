import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, PageHeader, ProgressBar } from '../components/UI';
import { modules, type Attempt, type Module } from '../domain';
import { attemptHasLearnerContent, contentService, progressService, useLearning } from '../services/platform';
import { readinessService } from '../services/readiness';
import { hasDiagnosticBaseline, readState } from '../state';
import type { AppState, DiagnosticResults } from '../types';

const DIAGNOSTIC_SECTION_COUNT = 7;
const LESSON_FOR_MODULE: Record<Module, string> = {
  Reading: 'matching-headings',
  Writing: 'writing-development',
  Listening: 'listening-detail',
  Speaking: 'speaking-fluency',
};

function diagnosticNextStep(state: AppState) {
  const completed = Math.min(
    DIAGNOSTIC_SECTION_COUNT,
    new Set(state.diagnostic.completedSections).size,
  );
  const started = state.diagnostic.status === 'in_progress'
    || state.diagnostic.status === 'skipped'
    || completed > 0;

  return {
    action: started ? 'Resume assessment' : 'Start assessment',
    heading: started ? 'Continue your saved assessment.' : 'Establish your starting point.',
    detail: started
      ? `${completed} of ${DIAGNOSTIC_SECTION_COUNT} sections are complete. Continue from your saved question to unlock personalized evidence.`
      : 'Complete the initial assessment before this page identifies IELTS estimates, strengths, priorities, or readiness.',
  };
}

function priorityModules(results: DiagnosticResults) {
  const saved = results.priorities.filter(
    (priority): priority is Module => modules.includes(priority as Module),
  );
  const byLowestEstimate = [...modules].sort(
    (left, right) => results.moduleScores[left].band - results.moduleScores[right].band,
  );

  return [...saved, ...byLowestEstimate]
    .filter((module, index, all) => all.indexOf(module) === index)
    .slice(0, 3);
}

function attemptLabel(attempt: Attempt) {
  if (attempt.mode === 'test') return `${attempt.module} module test`;
  if (attempt.mode === 'exam') return `${attempt.module} Exam Simulation section`;
  if (attempt.mode === 'practice') return `${attempt.module} practice activity`;
  return `${attempt.module} learning check`;
}

function savedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Saved activity' : date.toLocaleString();
}

function evidenceList(items: string[], fallback: string) {
  return items.length ? items.join('; ') : fallback;
}

export function Progress() {
  const learner = readState();
  const learning = useLearning();
  const navigate = useNavigate();
  const [skill, setSkill] = useState<string>('Overall');
  const assessed = hasDiagnosticBaseline(learner);
  const diagnosticStep = diagnosticNextStep(learner);
  const results = assessed ? learner.results : null;
  const current = results
    ? skill === 'Overall'
      ? results.overall
      : results.moduleScores[skill as Module].band
    : undefined;
  const recommendations = assessed ? progressService.recommendations() : [];
  const next = recommendations[0];
  const evidenceAttempts = learning.attempts.filter(attemptHasLearnerContent);
  const mastery = Object.entries(
    assessed ? progressService.mastery() : learning.mastery,
  );

  return <AppShell>
    <PageHeader
      eyebrow="Progress centre"
      title="See the work adding up."
      description={assessed
        ? 'Your saved diagnostic baseline, concept mastery and learning history in one place.'
        : 'Your saved learning activity and initial-assessment progress in one place.'}
      actions={<Button onClick={() => navigate(assessed ? '/readiness' : '/diagnostic')}>
        {assessed ? 'Explore readiness' : diagnosticStep.action}
      </Button>}
    />

    <div className="progress-layout">
      <Card className="padded">
        <div className="card-title">
          <span>{assessed ? 'Saved provisional IELTS baseline' : 'IELTS baseline'}</span>
          <Badge tone="gray">{assessed ? 'Diagnostic evidence' : 'Assessment needed'}</Badge>
        </div>

        {results && current !== undefined ? <>
          <div className="practice-tabs" aria-label="Choose a saved baseline estimate">
            {['Overall', ...modules].map(module => <button
              type="button"
              className={module === skill ? 'active' : ''}
              aria-pressed={module === skill}
              onClick={() => setSkill(module)}
              key={module}
            >{module}</button>)}
          </div>
          <div className="trend-summary">
            <strong>{current.toFixed(1)}</strong>
            <span>{skill} · provisional diagnostic estimate</span>
          </div>
          <svg
            className="trend-chart"
            viewBox="0 0 600 210"
            role="img"
            aria-label={`${skill} saved provisional diagnostic estimate: ${current.toFixed(1)}`}
          >
            <line x1="30" x2="570" y1="160" y2="160" stroke="#dce5ef"/>
            <line x1="30" x2="570" y1="90" y2="90" stroke="#e9eef4"/>
            <circle
              cx="300"
              cy={170 - (Math.max(0, Math.min(9, current)) / 9) * 120}
              r="7"
              fill="#2563eb"
            />
            <text
              x="300"
              y={148 - (Math.max(0, Math.min(9, current)) / 9) * 120}
              textAnchor="middle"
              fill="#334155"
              fontSize="17"
            >{current.toFixed(1)}</text>
            <text x="300" y="200" textAnchor="middle" fill="#64748b" fontSize="14">
              Initial diagnostic baseline
            </text>
          </svg>
          <p className="small muted">
            This is the one saved diagnostic baseline. Future representative assessments can add real history; short activities update concept mastery, not IELTS bands.
          </p>
        </> : <div className="section-space">
          <h2>{diagnosticStep.heading}</h2>
          <p>{diagnosticStep.detail}</p>
          <Button onClick={() => navigate('/diagnostic')}>{diagnosticStep.action}</Button>
        </div>}
      </Card>

      <Card className="next-card">
        <Badge tone="blue">{assessed ? 'NEXT SAVED PRIORITY' : 'NEXT STEP'}</Badge>
        {assessed && next ? <>
          <h2>{evidenceAttempts.length
            ? `${evidenceAttempts.length} response-bearing attempt${evidenceAttempts.length === 1 ? '' : 's'} to learn from.`
            : 'Your diagnostic priorities are ready.'}</h2>
          <p>{learning.completedLessons.length} lesson{learning.completedLessons.length === 1 ? '' : 's'} completed on this device. {evidenceAttempts.length
            ? 'Your latest submitted activity and saved evidence guide this recommendation.'
            : 'Your saved diagnostic priority order guides this recommendation.'}</p>
          <h3>{next.title}</h3>
          <p>{next.objective}</p>
          <Button onClick={() => navigate(`/learn/${next.id}`)}>Work on this next</Button>
        </> : <>
          <h2>{diagnosticStep.heading}</h2>
          <p>{diagnosticStep.detail}</p>
          <Button onClick={() => navigate('/diagnostic')}>{diagnosticStep.action}</Button>
        </>}
      </Card>
    </div>

    <div className="two-col section-space">
      <Card>
        <h2>Concept mastery</h2>
        {mastery.map(([name, value]) => {
          const status = value >= 90 ? 'Mastered' : value >= 75 ? 'Practising' : value >= 50 ? 'Developing' : 'Introduced';
          return <div className="mastery-item" key={name}>
            <div><span>{name}</span><strong>{value}% · {status}</strong></div>
            <ProgressBar
              value={value}
              label={`${name} concept mastery`}
              valueText={`${value}%: ${status}`}
            />
          </div>;
        })}
        {!mastery.length && <p>Complete a general lesson or the initial assessment to begin recording concept evidence.</p>}
      </Card>

      <Card>
        <h2>{assessed ? 'Saved diagnostic priorities' : 'Personal priorities'}</h2>
        {results ? priorityModules(results).map((module, index) => {
          const score = results.moduleScores[module];
          const lesson = contentService.lesson(LESSON_FOR_MODULE[module]);
          return <div className="priority-item" key={module}>
            <Badge tone="amber">Focus {index + 1}</Badge>
            <h3>{module}</h3>
            <p>{score.band.toFixed(1)} provisional estimate · {score.confidence.toLowerCase()} confidence · {score.evidencePercent}% diagnostic evidence. {lesson?.objective}</p>
            {lesson && <Button kind="ghost" onClick={() => navigate(`/learn/${lesson.id}`)}>Practise this skill</Button>}
          </div>;
        }) : <div className="priority-item">
          <Badge tone="gray">Baseline needed</Badge>
          <h3>No personalized priority yet</h3>
          <p>Finish all seven initial-assessment sections before the platform identifies strengths or areas requiring attention.</p>
          <Button kind="ghost" onClick={() => navigate('/diagnostic')}>{diagnosticStep.action}</Button>
        </div>}
      </Card>
    </div>

    <Card className="padded section-space">
      <h2>Your learning history</h2>
      {learning.attempts.map(attempt => {
        const title = contentService.resource(attempt.resourceId)?.title ?? `${attempt.module} saved activity`;
        return <button
          type="button"
          className="history-row"
          key={attempt.id}
          onClick={() => navigate(`/results/${attempt.id}`)}
        >
          <span>
            <strong>{title}</strong>
            <small>{savedDate(attempt.submittedAt)} · {attemptLabel(attempt)}</small>
          </span>
          <span>Review →</span>
        </button>;
      })}
      {learning.completedLessons.map(id => <div className="history-row" key={id}>
        <span>✓ {contentService.lesson(id)?.title ?? 'Saved lesson no longer in this content set'}</span>
        <Badge tone="green">Lesson completed</Badge>
      </div>)}
      {!learning.attempts.length && !learning.completedLessons.length
        && <p>No activity yet. Finish a lesson or submit an attempt to start your history.</p>}
    </Card>
  </AppShell>;
}

export function Readiness() {
  const learner = readState();
  const navigate = useNavigate();
  const learning = useLearning();
  const [days, setDays] = useState(14);
  const assessed = hasDiagnosticBaseline(learner);
  const diagnosticStep = diagnosticNextStep(learner);
  const readiness = readinessService.summary(learner, learning);

  if (!assessed || !readiness.calculated || !learner.results) {
    return <AppShell>
      <PageHeader
        eyebrow="IELTS readiness"
        title="Build the evidence first."
        description="Readiness, strengths and priorities appear only after the complete initial assessment establishes a saved baseline."
        actions={<Button onClick={() => navigate('/diagnostic')}>{diagnosticStep.action}</Button>}
      />
      <div className="learning-hero">
        <div>
          <Badge tone="gray">Not calculated</Badge>
          <h2>{diagnosticStep.heading}</h2>
          <p>{diagnosticStep.detail}</p>
        </div>
        <Button onClick={() => navigate('/diagnostic')}>{diagnosticStep.action}</Button>
      </div>
      <div className="four-grid section-space">
        {modules.map(module => <Card key={module}>
          <h3>{module}</h3>
          <Badge tone="gray">Needs evidence</Badge>
          <strong className="metric">—</strong>
          <p>Complete the initial assessment before this module receives an estimate or readiness status.</p>
        </Card>)}
      </div>
      <div className="two-col section-space">
        <Card>
          <h2>What readiness needs</h2>
          <p>All seven initial-assessment sections provide the first cross-skill baseline. Later module tests and Exam Simulations can add stronger timed evidence.</p>
          <Button onClick={() => navigate('/diagnostic')}>{diagnosticStep.action}</Button>
        </Card>
        <Card>
          <h2>What you can use now</h2>
          <p>General English and IELTS lessons remain available while personalized practice, priorities and readiness are waiting for the baseline.</p>
          <Button kind="secondary" onClick={() => navigate('/learn')}>Explore general lessons</Button>
        </Card>
      </div>
      <Card className="padded section-space">
        <div className="card-title"><span>Your next step</span><Badge tone="gray">Assessment first</Badge></div>
        <div className="plan-grid">
          <button type="button" className="plan-item plan-button" onClick={() => navigate('/diagnostic')}>
            <div><Badge tone="blue">Phase 2</Badge><h3>{diagnosticStep.action}</h3><span>Continue assessment →</span></div>
          </button>
          <button type="button" className="plan-item plan-button" onClick={() => navigate('/learn')}>
            <div><Badge tone="gray">Optional</Badge><h3>Use a general lesson</h3><span>Browse lessons →</span></div>
          </button>
        </div>
      </Card>
    </AppShell>;
  }

  const results = learner.results;
  const target = readiness.target;
  const priorityOrder = [...priorityModules(results), ...modules]
    .filter((module, index, all) => all.indexOf(module) === index);
  const evidenceAttemptIds = new Set(
    learning.attempts.filter(attemptHasLearnerContent).map(attempt => attempt.id),
  );
  const moduleTests = learning.attempts.filter(
    attempt => attempt.mode === 'test' && attemptHasLearnerContent(attempt),
  ).length;
  const completedExamIds = new Set([
    ...(learning.exam?.complete && learning.exam.attemptIds.some(id => evidenceAttemptIds.has(id)) ? [learning.exam.id] : []),
    ...(learning.examHistory ?? [])
      .filter(exam => exam.complete && exam.attemptIds.some(id => evidenceAttemptIds.has(id)))
      .map(exam => exam.id),
  ]);
  const weaknessEvidence = results.recurringWeaknesses.length
    ? results.recurringWeaknesses
    : results.weaknesses;
  const planRanges = days === 14
    ? ['Days 1–3', 'Days 4–6', 'Days 7–9', 'Days 10–11']
    : ['Days 1–2', 'Day 3', 'Day 4', 'Day 5'];
  const plan = priorityOrder.map((module, index) => {
    const lesson = contentService.lesson(LESSON_FOR_MODULE[module])!;
    return {
    day: planRanges[index],
    title: `${lesson.module}: ${lesson.title}`,
    path: `/learn/${lesson.id}`,
    };
  });
  plan.push(
    {
      day: days === 14 ? 'Days 12–13' : 'Day 6',
      title: 'Choose one module test and review its evidence',
      path: '/mock-tests',
    },
    {
      day: days === 14 ? 'Day 14' : 'Day 7',
      title: 'Review saved results and update your focus',
      path: '/progress',
    },
  );

  return <AppShell>
    <PageHeader
      eyebrow="IELTS readiness"
      title="Know what still needs your attention."
      description="A planning view built from your saved diagnostic, module activity and Exam Simulation evidence."
    />
    <div className="learning-hero">
      <div>
        <Badge tone="amber">{readiness.label} · provisional</Badge>
        <h2>Current estimate {readiness.current.toFixed(1)} → target {target.toFixed(1)}</h2>
        <p>Readiness is {readiness.value}% from the saved prototype evidence. Consistent performance across all four skills and under timed conditions is still needed.</p>
      </div>
      <Button onClick={() => navigate('/mock-tests')}>Choose a module test</Button>
    </div>

    <div className="four-grid">
      {modules.map(module => {
        const score = results.moduleScores[module];
        const gap = Math.max(0, target - score.band);
        const status = gap === 0
          ? 'At target · verify with tests'
          : gap >= 2
            ? 'Needs attention'
            : 'Developing';
        return <Card key={module}>
          <h3>{module}</h3>
          <Badge tone={gap === 0 ? 'green' : 'amber'}>{status}</Badge>
          <strong className="metric">{score.band.toFixed(1)}</strong>
          <p>{gap.toFixed(1)} band gap to target · {score.confidence.toLowerCase()} confidence.</p>
          <ProgressBar
            value={score.band / target * 100}
            label={`${module} progress toward the saved target band`}
            valueText={`${score.band.toFixed(1)} provisional estimate; ${target.toFixed(1)} target`}
          />
          <Button kind="ghost" onClick={() => navigate(`/${module.toLowerCase()}`)}>Work on {module}</Button>
        </Card>;
      })}
    </div>

    <div className="two-col section-space">
      <Card>
        <h2>What could hold you back?</h2>
        <p>{evidenceList(weaknessEvidence, `${readiness.attention} has the lowest saved module estimate.`)}</p>
        <p>{moduleTests} submitted module test{moduleTests === 1 ? '' : 's'} and {completedExamIds.size} completed Exam Simulation{completedExamIds.size === 1 ? '' : 's'} saved. More representative timed evidence will make this planning view stronger.</p>
        <Badge tone="gray">No readiness guarantee</Badge>
      </Card>
      <Card>
        <h2>What is helping?</h2>
        <p>{evidenceList(results.strengths, `${readiness.strongest} has the strongest saved module estimate.`)}</p>
        <p>Your current strengths come from the saved diagnostic evidence and completed learning activity.</p>
        <Button kind="secondary" onClick={() => navigate('/progress')}>Review the evidence</Button>
      </Card>
    </div>

    <Card className="padded section-space">
      <div className="card-title">
        <span>Your next {days} days</span>
        <div className="practice-tabs" aria-label="Choose planning period">
          {[7, 14].map(period => <button
            type="button"
            key={period}
            className={days === period ? 'active' : ''}
            aria-pressed={days === period}
            onClick={() => setDays(period)}
          >{period} days</button>)}
        </div>
      </div>
      <div className="plan-grid">
        {plan.map(item => <button
          type="button"
          className="plan-item plan-button"
          key={`${item.day}:${item.path}`}
          onClick={() => navigate(item.path)}
        >
          <div><Badge tone="blue">{item.day}</Badge><h3>{item.title}</h3><span>Open activity →</span></div>
        </button>)}
      </div>
    </Card>
  </AppShell>;
}
