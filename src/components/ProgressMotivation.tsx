import { ArrowRight, CalendarDays, Flame, LockKeyhole, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { readState } from '../state';
import { progressService, useLearning } from '../services/platform';
import { readinessService } from '../services/readiness';
import { Badge, Button, Card } from './UI';

const shortDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const longDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function boundedPercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(value / total * 100)));
}

function ProgressMeter({ value, total, label }: { value: number; total: number; label: string }) {
  const percent = boundedPercent(value, total);
  return <div
    className="motivation-meter"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={Math.max(0, total)}
    aria-valuenow={Math.max(0, Math.min(value, total || value))}
  ><span style={{ width: `${percent}%` }}/></div>;
}

export function ProgressMotivation() {
  const learner = readState();
  const learning = useLearning();
  const navigate = useNavigate();
  const readiness = readinessService.summary(learner, learning);
  const activity = progressService.gamification();
  const assessmentStarted = learner.diagnostic.status === 'in_progress'
    || learner.diagnostic.status === 'skipped'
    || learner.diagnostic.completedSections.length > 0;
  const readinessAction = readiness.calculated ? 'See readiness plan' : assessmentStarted ? 'Resume assessment' : 'Start assessment';
  const readinessRoute = readiness.calculated ? '/readiness' : '/diagnostic';

  return <section className="progress-motivation" aria-label="Readiness and study progress">
    <Card className={`motivation-card readiness-motivation-card ${readiness.calculated ? '' : 'uncalculated'}`}>
      <div className="motivation-card-head">
        <div className="motivation-icon readiness-icon" aria-hidden="true">{readiness.calculated ? <Target size={19}/> : <LockKeyhole size={18}/>}</div>
        <div><div className="eyebrow">IELTS readiness</div><h2>Where you stand</h2></div>
        <Badge tone={readiness.calculated ? 'blue' : 'gray'}>{readiness.calculated ? readiness.label : 'Baseline needed'}</Badge>
      </div>
      <div
        className="motivation-gauge"
        role="img"
        aria-label={readiness.calculated ? `${readiness.value}% ready, ${readiness.label}` : 'IELTS readiness has not been calculated'}
      >
        <svg viewBox="0 0 220 126" aria-hidden="true" focusable="false">
          <path className="motivation-gauge-track" pathLength="100" d="M 20 108 A 90 90 0 0 1 200 108"/>
          {readiness.calculated && <path className="motivation-gauge-value" pathLength="100" strokeDasharray={`${readiness.value} 100`} d="M 20 108 A 90 90 0 0 1 200 108"/>}
        </svg>
        <div className="motivation-gauge-copy">
          {readiness.calculated ? <><strong>{readiness.value}%</strong><span>ready</span></> : <><strong>Not calculated</strong><span>Complete your assessment</span></>}
        </div>
      </div>
      {readiness.calculated
        ? <div className="readiness-evidence"><p><span>Current estimate</span><strong>{readiness.current.toFixed(1)} → {readiness.target.toFixed(1)} target</strong></p><p><span>Strongest evidence</span><strong>{readiness.strongest}</strong></p><p><span>Needs attention</span><strong>{readiness.attention}</strong></p><small>{readiness.evidence}% average diagnostic evidence · provisional</small></div>
        : <p className="motivation-empty-copy">Readiness appears only after all seven assessment sections establish a provisional baseline.</p>}
      <Button kind="ghost" className="motivation-action" onClick={() => navigate(readinessRoute)}>{readinessAction}<ArrowRight size={15}/></Button>
    </Card>

    <Card className="motivation-card streak-motivation-card">
      <div className="motivation-card-head">
        <div className="motivation-icon streak-icon" aria-hidden="true"><Flame size={19}/></div>
        <div><div className="eyebrow">Study streak</div><h2>Your rhythm</h2></div>
        <Badge tone={activity.currentStreak > 0 ? 'amber' : 'gray'}>{activity.currentStreak > 0 ? 'Active' : 'Ready to begin'}</Badge>
      </div>
      <div className="streak-number"><strong>{activity.currentStreak}</strong><span>{activity.currentStreak === 1 ? 'day' : 'days'}</span></div>
      <p className="streak-note">{activity.currentStreak > 0 ? `Best streak: ${activity.bestStreak} ${activity.bestStreak === 1 ? 'day' : 'days'}. Keep the next step small and consistent.` : 'Complete a learning activity to start your first streak.'}</p>
      <div className="motivation-week" aria-label={`${activity.thisWeekDays} active study ${activity.thisWeekDays === 1 ? 'day' : 'days'} this week`}>
        {shortDays.map((day, index) => <span key={`${day}-${index}`} className={activity.activeWeekDays[index] ? 'active' : ''} aria-label={`${longDays[index]}: ${activity.activeWeekDays[index] ? 'activity completed' : 'no activity yet'}`}>{day}</span>)}
      </div>
      <Button kind="ghost" className="motivation-action" onClick={() => navigate('/progress')}>View activity<ArrowRight size={15}/></Button>
    </Card>

    <Card className="motivation-card activity-motivation-card">
      <div className="motivation-card-head">
        <div className="motivation-icon activity-icon" aria-hidden="true"><CalendarDays size={19}/></div>
        <div><div className="eyebrow">Study progress</div><h2>Today and this week</h2></div>
      </div>
      <div className="motivation-progress-group">
        <div className="motivation-progress-copy"><span>Today</span><strong>{activity.todayActivities} of {activity.todayGoal} {activity.todayGoal === 1 ? 'activity' : 'activities'}</strong></div>
        <ProgressMeter value={activity.todayActivities} total={activity.todayGoal} label={`${activity.todayActivities} of ${activity.todayGoal} activities completed today`}/>
      </div>
      <div className="motivation-progress-group">
        <div className="motivation-progress-copy"><span>This week</span><strong>{activity.weeklyMinutes} of {activity.weeklyGoalMinutes} min</strong></div>
        <ProgressMeter value={activity.weeklyMinutes} total={activity.weeklyGoalMinutes} label={`${activity.weeklyMinutes} of ${activity.weeklyGoalMinutes} study minutes completed this week`}/>
      </div>
      <p className="progress-note">{activity.todayActivities >= activity.todayGoal && activity.todayGoal > 0 ? 'Today’s goal is complete. Your activity is saved on this device.' : 'Every completed lesson or submitted activity moves these totals forward.'}</p>
      <Button kind="ghost" className="motivation-action" onClick={() => navigate('/progress')}>Open progress<ArrowRight size={15}/></Button>
    </Card>
  </section>;
}
