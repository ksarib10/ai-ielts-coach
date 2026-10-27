import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, CheckCircle2, Clock3, FileCheck2, Headphones, LockKeyhole, Mic, PenTool, Play, ShieldCheck } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, EmptyState, PageHeader } from '../components/UI';
import { contentService, isCorrect, mutateLearning, progressService, useLearning } from '../services/platform';
import { readState } from '../state';
import { modules, type ExamSession, type Module } from '../domain';
import type { IELTSMode } from '../types';
import { defaultResource } from './Learning';
import { Workspace } from './Modules';
import { advanceExam, beginExam, examDraftKey, examModuleStatus, examSections, findExam } from '../services/exam';
import { formatContinuousSession, formatExamCommitment, ieltsExamReference, writingTaskOneDescription } from '../data/ieltsReference';
import { readinessService } from '../services/readiness';
import { attemptHasLearnerContent } from '../services/evidence';

const moduleIcons: Record<Module, typeof BookOpen> = { Listening: Headphones, Reading: BookOpen, Writing: PenTool, Speaking: Mic };

function durationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ${seconds % 60} sec`;
  return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}

function statusLabel(status: ReturnType<typeof examModuleStatus>) {
  return status === 'complete' ? 'Complete' : status === 'current' ? 'Current' : 'Upcoming';
}

function ExamProgress({ exam }: { exam: ExamSession }) {
  return <div className="exam-progress" role="list" aria-label="Full exam progress">
    {ieltsExamReference.completeJourney.map((module, index) => {
      const status = examModuleStatus(exam, module);
      const Icon = moduleIcons[module];
      return <div className={`exam-progress-item ${status}`} role="listitem" key={module}>
        <span className="exam-progress-icon" aria-hidden="true">{status === 'complete' ? <Check size={16}/> : <Icon size={16}/>}</span>
        <span><small>Module {index + 1}</small><strong>{module}</strong></span>
        <Badge tone={status === 'complete' ? 'green' : status === 'current' ? 'blue' : 'gray'}>{statusLabel(status)}</Badge>
      </div>;
    })}
  </div>;
}

export function MockTests() {
  const navigate = useNavigate();
  const state = useLearning();

  return <AppShell>
    <PageHeader eyebrow="Mock Tests · focused checks" title="Test one IELTS skill at a time." description="Choose any shorter original module sample, submit it for an immediate attempt result, then leave or select another skill."/>

    <Card className="mock-test-intro">
      <div className="mock-format-copy">
        <Badge tone="blue">Choose the right format</Badge>
        <h2>Focused checks and the complete simulation serve different goals.</h2>
        <div className="mock-format-list">
          <div><strong>Module Test</strong><span>One timed skill sample with AI disabled and an immediate per-attempt result.</span></div>
          <div><strong>Mock Tests page</strong><span>A flexible place to choose those independent samples in any order and leave between tests.</span></div>
          <div><strong>Complete IELTS Exam</strong><span>All four skills in source-timed sequence, under strict conditions, with combined evidence held until the end.</span></div>
        </div>
      </div>
      <aside className="mock-exam-referral">
        <ShieldCheck aria-hidden="true"/>
        <span className="eyebrow">Need the complete journey?</span>
        <strong>171–174 minutes across four skills</strong>
        <p>Open the separate Exam Center for setup, source-backed timers and held combined results.</p>
        <Button onClick={() => navigate('/exam')}>Open Complete IELTS Exam<ArrowRight size={16}/></Button>
      </aside>
    </Card>

    <section className="section-space" aria-labelledby="module-test-list-title">
      <div className="section-heading compact"><div><span className="eyebrow">Independent timed samples</span><h2 id="module-test-list-title">Choose a module test</h2><p className="muted">Each card opens an existing shorter B1–C1 prototype sample. Your drafts and submitted attempts stay saved on this device.</p></div></div>
      <div className="mock-module-grid">{modules.map(module => {
        const resourceId = defaultResource(module);
        const resource = contentService.resource(resourceId);
        const attempts = state.attempts.filter(attempt => attempt.mode === 'test' && attempt.resourceId === resourceId);
        const latest = attempts[0];
        const draftSaved = Boolean(state.drafts[`test:${resourceId}`]);
        const Icon = moduleIcons[module];
        const status = draftSaved ? 'Draft saved' : attempts.length ? `${attempts.length} saved ${attempts.length === 1 ? 'attempt' : 'attempts'}` : 'Not attempted';
        const latestDetail = latest
          ? latest.total > 0
            ? `Latest result: ${latest.correct} of ${latest.total} correct · ${new Date(latest.submittedAt).toLocaleDateString()}`
            : `${attemptHasLearnerContent(latest) ? 'Latest response submitted' : 'Latest section submitted without response content'} · ${new Date(latest.submittedAt).toLocaleDateString()}`
          : 'Your result summary will appear as soon as you submit.';
        return <Card className="mock-module-card" key={module}>
          <div className="mock-module-head"><span className="mock-module-icon" aria-hidden="true"><Icon size={20}/></span><Badge tone={draftSaved ? 'amber' : attempts.length ? 'green' : 'gray'}>{status}</Badge></div>
          <div><span className="eyebrow">{module} · Module Test</span><h3>{module} timed sample</h3><p>{resource?.minutes ?? 'Short'} minute shortened original sample · B1–C1 · AI disabled</p></div>
          <small>{latestDetail}</small>
          <Button kind="secondary" onClick={() => navigate(`/${module.toLowerCase()}/test/${resourceId}`)}>{draftSaved ? 'Resume timed sample' : attempts.length ? 'Try another attempt' : 'Start timed sample'}<ArrowRight size={15}/></Button>
        </Card>;
      })}</div>
    </section>
  </AppShell>;
}

export function ExamCenter() {
  const navigate = useNavigate();
  const state = useLearning();
  const learner = readState();
  const current = state.exam;
  const completed = [current?.complete ? current : undefined, ...(state.examHistory ?? [])]
    .filter((exam): exam is ExamSession => !!exam)
    .filter((exam, index, all) => all.findIndex(item => item.id === exam.id) === index);

  return <AppShell>
    <PageHeader eyebrow="IELTS-style exam" title="Bring all four skills into one controlled journey." description="A complete simulation using IELTS reference structure and timing with original shortened sample tasks."/>
    <section className="exam-center-hero" aria-labelledby="exam-center-title">
      <div>
        <Badge tone="blue">Selected profile · {learner.onboarding.ieltsType}</Badge>
        <h2 id="exam-center-title">{learner.onboarding.ieltsType} Complete IELTS Exam</h2>
        <p>Listening, Reading and Writing follow one continuous paper-style session. Speaking is included in this walkthrough and may be scheduled separately in an IELTS test.</p>
        <div className="button-row">
          {current && !current.complete
            ? <Button onClick={() => navigate(`/exam/attempt/${current.id}`)}><Play size={17}/>Resume simulation</Button>
            : <Button onClick={() => navigate('/exam/setup')}>Prepare a simulation<ArrowRight size={17}/></Button>}
          {current?.complete && <Button kind="secondary" onClick={() => navigate(`/exam/result/${current.id}`)}>View latest combined result</Button>}
        </div>
      </div>
      <div className="exam-commitment-card">
        <Clock3 aria-hidden="true"/>
        <span>Source reference commitment</span>
        <strong>171–174 min</strong>
        <small>Across all four skills · Speaking may be separate</small>
      </div>
    </section>

    {current && !current.complete && <Card className="exam-resume-card">
      <div><Badge tone="amber">Simulation in progress</Badge><h2>Your answers and timer are saved on this device.</h2><p>{current.type} · sample section {current.section + 1} of {examSections(current.type).length}. Strict conditions continue when you return.</p></div>
      <Button onClick={() => navigate(`/exam/attempt/${current.id}`)}>Resume now<ArrowRight size={17}/></Button>
    </Card>}

    <div className="exam-module-grid section-space">
      {ieltsExamReference.completeJourney.map(module => {
        const Icon = moduleIcons[module]; const info = ieltsExamReference.modules[module];
        const time = typeof info.minutes === 'number' ? `${info.minutes} min` : `${info.minutes.minimum}–${info.minutes.maximum} min`;
        return <Card className="exam-module-card" key={module}><span className="exam-module-icon"><Icon size={20}/></span><div><span className="eyebrow">{time}</span><h3>{module}</h3><p>{info.description}</p></div></Card>;
      })}
    </div>

    <div className="two-col section-space">
      <Card className="padded exam-rule-card"><ShieldCheck/><div><h2>Strict simulation conditions</h2><ul><li>AI Coach, hints and teaching support are unavailable.</li><li>Answers autosave; source-backed module timers keep running.</li><li>Transcripts, explanations and section results are held until completion.</li><li>Listening playback is available once.</li></ul></div></Card>
      <Card className="padded exam-rule-card"><FileCheck2/><div><h2>Clear prototype boundaries</h2><p>This is not an official IELTS test. Available IELTS reference information supports the format and timing, but it does not include a full licensed question bank.</p><p>Active tasks are original shortened samples, so the combined result reports captured evidence without inventing an overall band.</p></div></Card>
    </div>

    <Card className="padded section-space exam-source-note"><strong>{formatExamCommitment()}.</strong><span>Listening and Speaking are common to both test types. Reading material and Writing Task 1 differ for Academic and General Training.</span></Card>

    {completed.length > 0 && <section className="section-space" aria-labelledby="exam-history-title"><div className="section-heading compact"><div><span className="eyebrow">Saved on this device</span><h2 id="exam-history-title">Completed simulations</h2></div></div><div className="exam-history-list">{completed.map(exam => <button className="history-row card" key={exam.id} onClick={() => navigate(`/exam/result/${exam.id}`)}><span><strong>{exam.type} Complete IELTS Exam</strong><small>{exam.completedAt ? new Date(exam.completedAt).toLocaleString() : 'Completed'} · {exam.attemptIds.length} sample sections saved</small></span><span>View combined result →</span></button>)}</div></section>}
  </AppShell>;
}

export function ExamSetup() {
  const navigate = useNavigate();
  const learner = readState();
  const [type, setType] = useState<IELTSMode>(learner.onboarding.ieltsType);
  const [step, setStep] = useState(1);
  const [checks, setChecks] = useState([false, false, false]);
  const [error, setError] = useState('');
  const allChecked = checks.every(Boolean);
  const setCheck = (index: number, value: boolean) => setChecks(items => items.map((item, itemIndex) => itemIndex === index ? value : item));

  const start = () => {
    setError('');
    try {
      const next = mutateLearning(state => beginExam(state, type), true);
      navigate(`/exam/attempt/${next.exam!.id}`);
    } catch {
      setError('The simulation could not be started because this device did not save the session. Free some browser storage, then try again.');
    }
  };

  return <AppShell>
    <PageHeader eyebrow={`Exam setup · Step ${step} of 3`} title={step === 1 ? 'Choose the IELTS path to simulate.' : step === 2 ? 'Understand the complete test structure.' : 'Complete the pre-exam check.'} description="Your profile is unchanged unless you update it in Settings. This choice applies to this simulation only."/>
    <ol className="exam-setup-steps" aria-label="Exam setup progress">
      {['IELTS type', 'Instructions', 'Pre-exam check'].map((label, index) => <li key={label} className={index + 1 < step ? 'complete' : index + 1 === step ? 'current' : ''} aria-current={index + 1 === step ? 'step' : undefined}><span>{index + 1 < step ? <Check size={15}/> : index + 1}</span>{label}</li>)}
    </ol>

    {step === 1 && <Card className="padded exam-setup-card">
      <fieldset className="exam-type-fieldset"><legend>Which IELTS type do you want to simulate?</legend><p>Reading material and Writing Task 1 change with this choice. Listening, Writing Task 2 and Speaking remain common.</p><div className="exam-type-grid">{(['Academic', 'General Training'] as IELTSMode[]).map(option => <label className={`exam-type-choice ${type === option ? 'selected' : ''}`} key={option}><input type="radio" name="exam-type" checked={type === option} onChange={() => setType(option)}/><span><strong>{option}</strong><small>{option === 'Academic' ? 'Academic Reading · visual-information Writing Task 1' : 'General Training Reading · letter Writing Task 1'}</small></span><CheckCircle2 aria-hidden="true"/></label>)}</div></fieldset>
      <div className="exam-setup-actions"><Button kind="secondary" onClick={() => navigate('/exam')}>Back to Exam Center</Button><Button onClick={() => setStep(2)}>Continue to instructions<ArrowRight size={17}/></Button></div>
    </Card>}

    {step === 2 && <div className="exam-instruction-layout">
      <Card className="padded exam-setup-card">
        <Badge tone="blue">{type}</Badge><h2>Source-backed reference structure</h2>
        <div className="exam-instruction-list">
          <div><Headphones/><span><strong>Listening · 40 minutes</strong><small>About 30 minutes to listen and answer, plus 10 minutes for paper-style answer transfer.</small></span></div>
          <div><BookOpen/><span><strong>Reading · 60 minutes</strong><small>The time includes transferring answers. {ieltsExamReference.typeDifferences[type].Reading}</small></span></div>
          <div><PenTool/><span><strong>Writing · 60 minutes shared</strong><small>{writingTaskOneDescription(type)} Task 2 requires at least 250 words and carries twice the weight of Task 1.</small></span></div>
          <div><Mic/><span><strong>Speaking · 11–14 minutes</strong><small>Three parts. This may be scheduled separately; the prototype places it after the continuous Listening–Reading–Writing walkthrough.</small></span></div>
        </div>
        <aside className="notice"><strong>Prototype scope:</strong> the timers follow the supplied reference timings, while each task contains shortened original sample material. No official result is produced.</aside>
        <div className="exam-setup-actions"><Button kind="secondary" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)}>Continue to pre-exam check<ArrowRight size={17}/></Button></div>
      </Card>
      <Card className="padded exam-continuity-card"><LockKeyhole/><h3>Continuous first session</h3><p>Listening, Reading and Writing proceed in that order without a break in the selected paper-style reference model. Each submitted section locks before the next opens.</p><strong>{formatContinuousSession()}</strong></Card>
    </div>}

    {step === 3 && <Card className="padded exam-setup-card">
      <div className="exam-check-heading"><span className="exam-module-icon"><ShieldCheck/></span><div><h2>Ready for strict conditions?</h2><p>Confirm each rule before the saved module timer begins.</p></div></div>
      <div className="exam-check-list">
        {[
          ['Timing and progression', 'I understand that module timers continue after refresh and submitted sections cannot be reopened.'],
          ['No learning assistance', 'I understand that AI Coach, hints, transcripts and explanations are unavailable during the active simulation.'],
          ['Original sample evidence', 'I understand that these are shortened original tasks and the result is simulated evidence, not an official IELTS score.'],
        ].map(([title, copy], index) => <label className="exam-check-option" key={title}><input type="checkbox" checked={checks[index]} onChange={event => setCheck(index, event.target.checked)}/><span><strong>{title}</strong><small>{copy}</small></span></label>)}
      </div>
      {error && <div className="error-box" role="alert">{error}</div>}
      <div className="exam-setup-actions"><Button kind="secondary" onClick={() => setStep(2)}>Back</Button><Button disabled={!allChecked} onClick={start}><LockKeyhole size={16}/>Start {type} simulation</Button></div>
    </Card>}
  </AppShell>;
}

export function ExamAttempt() {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const state = useLearning();
  const exam = state.exam;
  if (!exam) return <Navigate to="/exam" replace/>;
  if (exam.id !== attemptId) {
    const requested = findExam(state, attemptId);
    return <Navigate to={requested?.complete ? `/exam/result/${requested.id}` : exam.complete ? `/exam/result/${exam.id}` : `/exam/attempt/${exam.id}`} replace/>;
  }
  if (exam.complete) return <Navigate to={`/exam/result/${exam.id}`} replace/>;
  const sections = examSections(exam.type);
  const section = sections[exam.section];
  const resource = contentService.resource(section.resourceId);
  if (!resource) return <AppShell mode="exam"><EmptyState title="This exam section is unavailable" detail="The saved simulation references sample content that is not present in this build." action="Return to Exam Center" onAction={() => navigate('/exam')}/></AppShell>;
  const currentModuleIndex = ieltsExamReference.completeJourney.indexOf(section.module);
  const progressText = ieltsExamReference.completeJourney.map(module => `${module} ${statusLabel(examModuleStatus(exam, module)).toLowerCase()}`).join(' · ');
  const readingScope = section.module === 'Reading' ? ` This is a generic original interaction sample; available IELTS reference information establishes that ${exam.type} Reading content differs, but does not include a full licensed ${exam.type} paper.` : '';
  const resourceWithProgress = { ...resource, blocks: [{ type: 'instruction' as const, text: `Full exam progress: ${progressText}.${readingScope}` }, ...resource.blocks] };
  const isLast = exam.section === sections.length - 1;
  return <Workspace
    key={`${exam.id}:${exam.section}`}
    mode="exam"
    resource={resourceWithProgress}
    examPosition={`${exam.type} · Module ${currentModuleIndex + 1} of 4 · Sample section ${exam.section + 1} of ${sections.length}`}
    draftKey={examDraftKey(exam.id, section.resourceId)}
    deadline={exam.moduleDeadline}
    submissionMutation={(learning, attempt) => advanceExam(learning, exam.id, attempt)}
    onComplete={() => { if (isLast) navigate(`/exam/result/${exam.id}`); }}
  />;
}

export function ExamResult() {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const state = useLearning();
  const learner = readState();
  const exam = findExam(state, attemptId);
  if (!exam) return <Navigate to="/exam" replace/>;
  if (!exam.complete) return <Navigate to={`/exam/attempt/${exam.id}`} replace/>;
  const attempts = exam.attemptIds.map(id => state.attempts.find(attempt => attempt.id === id)).filter((attempt): attempt is NonNullable<typeof attempt> => !!attempt);
  const objective = attempts.filter(attempt => attempt.total > 0);
  const correct = objective.reduce((sum, attempt) => sum + attempt.correct, 0);
  const total = objective.reduce((sum, attempt) => sum + attempt.total, 0);
  const seconds = attempts.reduce((sum, attempt) => sum + attempt.seconds, 0);
  const sections = examSections(exam.type);
  const missedSkills = [...new Set(attempts.flatMap(attempt => {
    const resource = contentService.resource(attempt.resourceId);
    return resource?.activities.filter(activity => activity.answer !== undefined && !isCorrect(attempt.answers[activity.id], activity.answer, activity.type === 'ordering' || activity.type === 'sentence_reorder')).map(activity => activity.skill) ?? [];
  }))];
  const priorityAttempt = attempts.find(attempt => {
    if (!attempt.total) return false;
    const resource = contentService.resource(attempt.resourceId);
    return resource?.activities.some(activity => activity.answer !== undefined && !isCorrect(
      attempt.answers[activity.id],
      activity.answer,
      activity.type === 'ordering' || activity.type === 'sentence_reorder',
    ));
  });
  const baselineLessonByModule: Record<string, string> = { Reading: 'matching-headings', Writing: 'writing-development', Listening: 'listening-detail', Speaking: 'speaking-fluency' };
  const baselineLesson = contentService.lesson(baselineLessonByModule[learner.results?.priorities[0] ?? '']);
  const next = priorityAttempt ? progressService.recommendationFor(priorityAttempt) : baselineLesson ?? progressService.recommendations()[0];
  const hasExamEvidence = attempts.some(attemptHasLearnerContent);
  const readiness = readinessService.summary(learner, state);
  const moduleSummary = (module: Module) => {
    const relevant = attempts.filter(attempt => attempt.module === module);
    if (module === 'Listening' || module === 'Reading') {
      return { metric: `${relevant.reduce((sum, attempt) => sum + attempt.correct, 0)}/${relevant.reduce((sum, attempt) => sum + attempt.total, 0)}`, detail: 'raw objective answers correct' };
    }
    const answeredResponses = relevant.filter(attemptHasLearnerContent).length;
    if (module === 'Writing') {
      const words = relevant.reduce((sum, attempt) => sum + Object.values(attempt.answers).reduce((answerSum, answer) => answerSum + (typeof answer === 'string' ? answer.trim().split(/\s+/).filter(Boolean).length : 0), 0), 0);
      return { metric: `${answeredResponses} of ${relevant.length} provided`, detail: `${words} words saved · no automated band` };
    }
    return {
      metric: `${answeredResponses} of ${relevant.length} provided`,
      detail: answeredResponses ? 'learner recording summaries saved · no automated band' : 'no learner response content · no automated band',
    };
  };

  return <AppShell>
    <PageHeader eyebrow="Complete IELTS Exam · Combined result" title="Your complete four-skill evidence is saved." description={`${exam.type} · completed ${exam.completedAt ? new Date(exam.completedAt).toLocaleString() : 'on this device'}`}/>
    <section className="exam-result-hero" aria-labelledby="exam-result-title">
      <div><Badge tone="green"><CheckCircle2 size={14}/>Full journey complete</Badge><h2 id="exam-result-title">{attempts.length} of {sections.length} sample sections submitted</h2><p>Listening, Reading, Writing and Speaking are held together in one simulated result. The tasks are shortened original samples, so no overall IELTS band is inferred.</p></div>
      <div className="exam-result-score" aria-label={total ? `${correct} of ${total} objective answers correct` : 'Responses saved'}><span>Objective evidence</span><strong>{total ? `${correct}/${total}` : 'Saved'}</strong><small>Raw sample result · not a band score</small></div>
    </section>
    <div className="notice section-space"><strong>Provisional simulation evidence:</strong> Writing and Speaking need qualified human or calibrated service assessment. This prototype reports saved responses and raw objective accuracy only.</div>
    <ExamProgress exam={exam}/>
    <div className="exam-result-grid section-space">{ieltsExamReference.completeJourney.map(module => { const Icon = moduleIcons[module]; const summary = moduleSummary(module); return <Card className="exam-result-module" key={module}><div className="exam-module-icon"><Icon/></div><Badge tone="green">Complete</Badge><h3>{module}</h3><strong>{summary.metric}</strong><p>{summary.detail}</p></Card>; })}</div>
    <div className="two-col section-space">
      <Card className="padded"><span className="eyebrow">Time performance</span><h2>{durationLabel(seconds)} elapsed attempt time</h2><p>The source reference allows {formatExamCommitment()}. The active samples are shorter than a full paper, while their module countdowns use the supplied timing limits.</p><Badge tone="gray">No official pacing judgement</Badge></Card>
      <Card className="padded"><span className="eyebrow">Readiness impact</span><h2>{readiness.calculated ? hasExamEvidence ? `${readiness.label} · additional timed evidence saved` : `${readiness.label} · no new scored evidence` : 'Baseline still needed'}</h2><p>{readiness.calculated ? hasExamEvidence ? 'This simulation adds limited timed evidence to your plan. Representative full-length content and calibrated marking are still required before any exam-ready judgement.' : 'The journey was completed, but no learner answer content was provided. Your readiness remains based on earlier evidence.' : 'Complete the initial diagnostic before readiness can be calculated. Your exam responses remain saved.'}</p><Button kind="ghost" onClick={() => navigate(readiness.calculated ? '/readiness' : '/diagnostic')}>{readiness.calculated ? 'Review readiness plan' : 'Complete diagnostic'}<ArrowRight size={16}/></Button></Card>
    </div>
    <div className="two-col section-space">
      <Card className="padded"><span className="eyebrow">Observed priorities</span><h2>{missedSkills.length ? 'Review incorrect or unanswered objective items.' : 'No objective errors in this short sample.'}</h2>{missedSkills.length ? <ul>{missedSkills.map(skill => <li key={skill}>{skill}</li>)}</ul> : <p>Writing and Speaking still require separate qualitative assessment.</p>}</Card>
      <Card className="padded"><span className="eyebrow">Next best activity</span><h2>{next.title}</h2><p>{next.objective}</p><Button onClick={() => navigate(`/learn/${next.id}`)}>Open recommended lesson<ArrowRight size={16}/></Button></Card>
    </div>
    <Card className="padded section-space"><div className="section-heading compact"><div><span className="eyebrow">Section evidence</span><h2>Review submitted answers</h2></div></div><div className="exam-section-results">{attempts.map((attempt, index) => <button className="history-row" key={attempt.id} onClick={() => navigate(`/results/${attempt.id}`)}><span><strong>{index + 1}. {contentService.resource(attempt.resourceId)?.title ?? `${attempt.module} saved section`}</strong><small>{attempt.module} · {attempt.total ? `${attempt.correct}/${attempt.total} correct` : attemptHasLearnerContent(attempt) ? 'response provided' : 'no response content'} · {durationLabel(attempt.seconds)}</small></span><span>Review →</span></button>)}</div></Card>
    <div className="button-row section-space"><Button onClick={() => navigate('/exam/setup')}>Prepare another simulation</Button><Button kind="secondary" onClick={() => navigate('/exam')}>Return to Exam Center</Button></div>
  </AppShell>;
}
