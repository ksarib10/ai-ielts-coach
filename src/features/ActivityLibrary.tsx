import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ActivityRenderer } from '../components/ActivityRenderer';
import { Badge, Button, Card, PageHeader } from '../components/UI';
import { activityLibrary } from '../data/activityLibrary';
import type { Answer } from '../domain';
import { answered, isCorrect } from '../services/platform';
import { hasDiagnosticBaseline, readState } from '../state';

export function ActivityLibrary() {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const learner = readState();
  const a = activityLibrary[index];

  if (!hasDiagnosticBaseline(learner)) {
    const assessmentStarted = learner.diagnostic.status !== 'not_started' || learner.diagnostic.completedSections.length > 0;
    return <AppShell><PageHeader eyebrow="Practice · Question formats" title="Build a baseline before personalized practice." description="The format library adapts its recommendations after your initial assessment."/><section className="card baseline-lock-card" aria-labelledby="library-lock-title"><div className="baseline-lock-icon" aria-hidden="true"><LockKeyhole size={24}/></div><div><Badge tone="gray">Not assessed</Badge><h2 id="library-lock-title">Complete your initial assessment to open the practice library.</h2><p>Your goals and any answers already entered are saved on this device, so you can continue where you stopped.</p></div><Button onClick={() => navigate('/diagnostic')}>{assessmentStarted ? 'Resume initial assessment' : 'Start initial assessment'}<ArrowRight size={17}/></Button></section></AppShell>;
  }

  return <AppShell mode="practice"><PageHeader eyebrow="Practice · Question formats" title="Get familiar with the task." description="Explore reusable IELTS and English activity patterns using small original examples."/><label className="field search-field">Question format<select className="select" value={index} onChange={e => { setIndex(Number(e.target.value)); setChecked(false); }}>{activityLibrary.map((a, i) => <option value={i} key={a.id}>{a.type.split('_').join(' ')}</option>)}</select></label><Card className="padded"><Badge tone="blue">{index + 1} of {activityLibrary.length} formats</Badge><ActivityRenderer key={a.id} activity={a} value={values[a.id]} onChange={v => { setValues({ ...values, [a.id]: v }); setChecked(false); }}/><div className="button-row"><Button kind="secondary" disabled={index === 0} onClick={() => { setIndex(index - 1); setChecked(false); }}>Previous format</Button><Button disabled={!answered(values[a.id])} onClick={() => setChecked(true)}>Check response</Button><Button kind="secondary" disabled={index === activityLibrary.length - 1} onClick={() => { setIndex(index + 1); setChecked(false); }}>Next format</Button></div>{checked && <div className="answer-review" role="status"><strong>{a.answer === undefined ? 'A response to reflect on' : isCorrect(values[a.id], a.answer, ['ordering', 'sentence_reorder', 'table_completion', 'form_completion'].includes(a.type)) ? 'Correct' : 'Try again'}</strong><p>{a.explanation}</p></div>}</Card></AppShell>;
}

