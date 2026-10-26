import { useState } from 'react';
import type { Activity, Answer, Mode } from '../domain';
import { Button, Badge } from './UI';
import { openCoach } from '../services/platform';
import { SpeakingRecorder } from './MediaControls';
export function ActivityRenderer({ activity: a, value, onChange, mode = 'practice', readOnly = false }: { activity: Activity; value?: Answer; onChange: (value: Answer) => void; mode?: Mode; readOnly?: boolean }) {
  const [hint, setHint] = useState(false); const str = typeof value === 'string' ? value : ''; const values = Array.isArray(value) ? value : [];
  let options = a.options;
  if (a.type === 'true_false') options = ['True', 'False'];
  if (a.type === 'true_false_not_given') options = ['True', 'False', 'Not Given'];
  if (a.type === 'yes_no_not_given') options = ['Yes', 'No', 'Not Given'];
  const choice = ['single_choice', 'multiple_choice', 'true_false', 'true_false_not_given', 'yes_no_not_given', 'image_question', 'chart_interpretation'].includes(a.type) && !!options;
  const ordering = a.type === 'ordering' || a.type === 'sentence_reorder';
  const matching = ['matching', 'matching_headings', 'matching_information', 'dropdown_completion'].includes(a.type);
  const structured = !!a.fields?.length;
  return <fieldset className="activity-field" disabled={readOnly}><legend>{a.prompt}</legend><div className="activity-meta"><Badge tone="gray">{a.type.split('_').join(' ')}</Badge></div>{a.image && <img className="activity-image" src={a.image} alt="Question diagram with numbered labels"/>}
    {choice ? <div className="option-list">{options!.map((option, i) => <label className={`option ${(a.type === 'multiple_choice' ? values.includes(option) : str === option) ? 'selected' : ''}`} key={option}><input type={a.type === 'multiple_choice' ? 'checkbox' : 'radio'} name={a.id} checked={a.type === 'multiple_choice' ? values.includes(option) : str === option} onChange={() => onChange(a.type === 'multiple_choice' ? values.includes(option) ? values.filter(x => x !== option) : [...values, option] : option)}/><span className="option-letter">{String.fromCharCode(65 + i)}</span><span>{option}</span></label>)}</div>
    : ordering ? <div className="ordering"><p className="muted">Choose each item in the correct sequence.</p>{(values.length ? values : []).map((item, i) => <div className="order-item" key={item}><span>{i + 1}. {item}</span><button type="button" onClick={() => onChange(values.filter(x => x !== item))}>Remove</button></div>)}{a.options?.filter(x => !values.includes(x)).map(x => <Button key={x} kind="secondary" onClick={() => onChange([...values, x])}>{x}</Button>)}</div>
    : structured ? <div className="form-stack">{a.fields!.map((field, i) => <label className="field" key={field}>{field}<input className="input" value={values[i] || ''} onChange={e => { const next = a.fields!.map((_, j) => values[j] || ''); next[i] = e.target.value; onChange(next); }}/></label>)}</div>
    : matching ? <select aria-label={a.prompt} className="select" value={str} onChange={e => onChange(e.target.value)}><option value="">Choose an answer</option>{options?.map(x => <option key={x}>{x}</option>)}</select>
    : a.type === 'speaking_response' ? <SpeakingRecorder mode={mode} value={str} onChange={onChange} preparation={a.preparation} sampleResponse={a.sampleResponse}/>
    : a.type === 'writing_response' || a.type === 'discussion_prompt' ? <textarea aria-label={a.prompt} className="writing-editor" value={str} onChange={e => onChange(e.target.value)} placeholder="Write your own response here…"/>
    : <input className="input" aria-label={a.prompt} value={str} onChange={e => onChange(e.target.value)} placeholder="Type your answer"/>}
    {(mode === 'learn' || mode === 'practice') && !readOnly && <div className="question-help"><button className="text-link" type="button" onClick={() => setHint(!hint)}>{hint ? 'Hide hint' : 'Show a hint'}</button><button className="text-link" type="button" onClick={() => openCoach({ mode, question: a.prompt, selectedText: a.prompt, explanation: a.hint || 'Read the instructions carefully and locate the relevant evidence before choosing.', resource: a.skill })}>Explain this question</button>{hint && <p className="notice">{a.hint || 'Read the full context. Check exactly what the instructions ask you to provide.'}</p>}</div>}
  </fieldset>;
}



