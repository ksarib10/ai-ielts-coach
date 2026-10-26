import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { Badge, Button, Card, EmptyState, PageHeader, ProgressBar } from '../components/UI';
import { contentService, isCorrect, openCoach, progressService, useLearning } from '../services/platform';
import { criterionFeedback, demoTranscript, illustrativeCriterionBands } from '../data/fixtures';
import { ContentViewer } from '../components/ContentViewer';
import { readState } from '../state';
import { answerHasLearnerContent, attemptHasLearnerContent } from '../services/evidence';

export function AttemptResults() {
  const { id } = useParams();
  const state = useLearning();
  const attempt = state.attempts.find(item => item.id === id);
  const navigate = useNavigate();

  if (!attempt) return <AppShell><EmptyState title="No result for this attempt yet" detail="Complete a practice or test to see your answers and a personalised follow-up." action="Find an activity" onAction={() => navigate('/practice')}/></AppShell>;
  if (attempt.mode === 'exam' && state.exam?.attemptIds.includes(attempt.id) && !state.exam.complete) {
    return <AppShell mode="exam"><EmptyState title="Results are held until the exam is complete" detail="Continue your remaining sections before reviewing answers." action="Continue exam" onAction={() => navigate(`/exam/attempt/${state.exam!.id}`)}/></AppShell>;
  }

  const resource = contentService.resource(attempt.resourceId);
  if (!resource) return <AppShell><EmptyState title="This saved result cannot be opened" detail="The attempt is still preserved, but its original sample content is unavailable in this build." action="Return to progress" onAction={() => navigate('/progress')}/></AppShell>;
  const estimate = readState().results?.moduleScores[attempt.module].band;
  const next = progressService.recommendationFor(attempt);
  const skills = [...new Set(resource.activities.map(activity => activity.skill))];
  const subjective = attempt.module === 'Writing' || attempt.module === 'Speaking';
  const examSubjective = subjective && attempt.mode === 'exam';
  const hasResponse = attemptHasLearnerContent(attempt);
  const criteria = subjective ? criterionFeedback[attempt.module as 'Writing' | 'Speaking'] : [];
  const correctAnswer = (activity: typeof resource.activities[number]) => isCorrect(
    attempt.answers[activity.id],
    activity.answer,
    activity.type === 'ordering' || activity.type === 'sentence_reorder',
  );
  const evaluationLabel = examSubjective || !hasResponse ? 'Not scored' : 'Provisional';
  const evaluationDetail = examSubjective
    ? 'No automated band for this Exam response'
    : hasResponse
      ? 'Illustrative feedback'
      : 'No learner response content';

  return <AppShell>
    <PageHeader
      eyebrow={`${attempt.module} · ${attempt.mode} review`}
      title="Make this attempt count."
      description={`${resource.title} · Submitted ${new Date(attempt.submittedAt).toLocaleString()}`}
      actions={<Button onClick={() => navigate(`/learn/${next.id}`)}>Start recommended lesson</Button>}
    />

    <div className="four-grid result-metrics">
      <Card><span>{subjective ? 'Evaluation' : 'Raw score'}</span><strong className="metric">{subjective ? evaluationLabel : `${attempt.correct} / ${attempt.total}`}</strong><small>{subjective ? evaluationDetail : 'Based on your submitted answers'}</small></Card>
      <Card><span>Current module estimate</span><strong className="metric">{estimate?.toFixed(1) || '—'}</strong><small>{estimate ? 'Profile estimate, unchanged by this short sample' : 'Complete the diagnostic for a starting profile'}</small></Card>
      <Card><span>{subjective ? 'Response' : 'Accuracy'}</span><strong className="metric">{subjective ? hasResponse ? 'Saved' : 'Not provided' : `${Math.round(attempt.correct / Math.max(1, attempt.total) * 100)}%`}</strong><small>{subjective ? hasResponse ? 'Your own submission appears below' : 'The section was submitted without learner content' : 'Review mistakes to improve mastery'}</small></Card>
      <Card><span>Time spent</span><strong className="metric">{Math.floor(attempt.seconds / 60)}:{String(attempt.seconds % 60).padStart(2, '0')}</strong><small>{attempt.mode === 'practice' ? 'Practice at your own pace' : 'Timed attempt'}</small></Card>
    </div>

    {examSubjective && <div className="notice section-space"><strong>No automated Exam score:</strong> this review reports only the learner content saved during the simulation. Writing and Speaking require qualified human or calibrated service assessment.</div>}

    {subjective && !examSubjective && hasResponse && <>
      <div className="notice section-space">Sample criterion feedback demonstrates the review experience. No AI scoring or pronunciation analysis was performed. Bands shown below are illustrative examples, not an evaluation of your submitted response.</div>
      <h2 className="section-space">Provisional criterion breakdown</h2>
      <div className="four-grid">{criteria.map(([label, feedback], index) => <Card key={label}><Badge tone="gray">Illustrative</Badge><h3>{index === 0 && resource.id !== 'writing-2' && attempt.module === 'Writing' ? 'Task Achievement' : label}</h3><strong className="metric">{illustrativeCriterionBands[index].toFixed(1)}</strong><p>{feedback}</p></Card>)}</div>
      <div className="two-col section-space">
        <Card><h2>What to keep</h2><p>{attempt.module === 'Writing' ? 'Keep a clear position and a paragraph for each main idea. Read your saved response below to identify your strongest example.' : 'Keep a direct opening answer. Add a reason and one example to help the listener follow your ideas.'}</p></Card>
        <Card><h2>What to practise</h2><p>{attempt.module === 'Writing' ? 'Check repeated words, missing articles and unsupported claims. Rewrite one paragraph with a more specific example.' : 'Practise clear thought groups. Record the same idea again using fewer fillers and more specific vocabulary.'}</p><Button kind="secondary" onClick={() => navigate(`/learn/${attempt.module === 'Writing' ? 'writing-development' : 'speaking-fluency'}`)}>Work on this skill</Button></Card>
      </div>
    </>}

    {!subjective && <Card className="section-space padded"><h2>Performance by question type</h2>{skills.map(skill => {
      const items = resource.activities.filter(activity => activity.skill === skill && activity.answer !== undefined);
      const correct = items.filter(correctAnswer).length;
      return <div key={skill} className="mastery-item"><div><span>{skill}</span><strong>{correct}/{items.length} correct</strong></div><ProgressBar value={correct / Math.max(1, items.length) * 100} label={`${skill} result`} valueText={`${correct} of ${items.length} correct`}/></div>;
    })}</Card>}

    <h2 className="section-space">{subjective ? hasResponse ? 'Your response and next revision' : 'No response content was provided' : 'Review your answers'}</h2>
    {resource.activities.map((activity, index) => {
      const correct = correctAnswer(activity);
      const response = attempt.answers[activity.id];
      const responseProvided = answerHasLearnerContent(response);
      return <Card className="review-card" key={activity.id}>
        <div className="card-title"><span>{index + 1}. {activity.prompt}</span><Badge tone={subjective ? 'gray' : correct ? 'green' : 'amber'}>{subjective ? responseProvided ? 'Submitted' : 'Not provided' : correct ? 'Correct' : 'Needs review'}</Badge></div>
        <div className="submitted-text">{responseProvided ? Array.isArray(response) ? response.join(' · ') : response : 'No answer content submitted'}</div>
        {activity.answer !== undefined && <p><strong>Correct answer:</strong> {Array.isArray(activity.answer) ? activity.answer.join(' · ') : activity.answer}</p>}
        <p>{activity.explanation}</p>
        <div className="button-row">
          {subjective
            ? responseProvided && <Button kind="secondary" onClick={() => openCoach({ mode: 'learn', module: attempt.module, resource: resource.title, question: activity.prompt, selectedText: typeof response === 'string' ? response.slice(0, 200) : activity.prompt, explanation: activity.explanation })}>Review this response with Coach</Button>
            : <Button kind="secondary" onClick={() => openCoach({ mode: 'learn', module: attempt.module, resource: resource.title, question: activity.prompt, selectedText: typeof response === 'string' && response ? response.slice(0, 200) : activity.prompt, explanation: activity.explanation })}>{correct ? 'Explain this answer' : 'Why was this answer wrong?'}</Button>}
          {subjective && <Button kind="ghost" onClick={() => navigate(`/${attempt.module.toLowerCase()}/practice/${resource.id}`)}>Try a rewrite / new response</Button>}
        </div>
      </Card>;
    })}

    {resource.audio && resource.transcript && <Card className="section-space padded"><h2>Listen again with the transcript</h2><audio controls src={resource.audio}/><ContentViewer title="Listening transcript" resourceId={`${resource.id}-transcript`} blocks={[{ type: 'transcript', text: resource.transcript }]}/><p><strong>Keywords to notice:</strong> gardening knowledge · shade · without regular care · shared community space</p></Card>}
    {attempt.module === 'Speaking' && attempt.mode !== 'exam' && hasResponse && <Card className="section-space padded"><Badge tone="gray">Sample transcript for review</Badge><p>This original example illustrates how a transcript could support feedback. It is not an automatic transcription of your recording.</p><ContentViewer title="Sample speaking transcript" blocks={[{ type: 'transcript', text: resource.activities[0].sampleResponse || demoTranscript }]}/><Button kind="secondary" onClick={() => openCoach({ selectedText: 'I would like to learn photography because I enjoy exploring my city.', explanation: 'This sentence starts with a direct answer and immediately adds a reason. Extend it with a concrete example.', resource: 'Sample speaking transcript' })}>Explore sentence feedback</Button></Card>}

    <div className="learning-hero section-space"><div><Badge tone="blue">THE NEXT USEFUL STEP</Badge><h2>{next.title}</h2><p>{next.objective} Your attempt is now included in your learning history.</p></div><div className="button-row"><Button onClick={() => navigate(`/learn/${next.id}`)}>Learn, then try again</Button><Button kind="secondary" onClick={() => navigate('/progress')}>See progress</Button></div></div>
  </AppShell>;
}
