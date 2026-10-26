import { sessionService } from './session';
import { useSyncExternalStore } from 'react';
import { lessons, resources, learnerFixture, wordDefinitions } from '../data/fixtures';
import type { ActivityEvent, Answer, Attempt, Draft, LearningState, Lesson, Mode, Resource } from '../domain';
import { blankState, hasDiagnosticBaseline, readState, writeState } from '../state';
import { normalizeExamSession } from './exam';
import { attemptHasLearnerContent } from './evidence';
export { answerHasLearnerContent, attemptHasLearnerContent } from './evidence';
const KEY = 'ielts-learning-v2';
const initial = (): LearningState => ({ attempts: [], drafts: {}, completedLessons: [], mastery: {}, highlights: {}, vocabulary: [], activityLog: [], examHistory: [] });
let cached: LearningState | undefined;
let storageError = '';
const listeners = new Set<() => void>();
export const persistenceStatus = () => storageError;
export function localDayKey(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function attemptEvent(attempt: Attempt): ActivityEvent {
  const resourceMinutes = resources.find(resource => resource.id === attempt.resourceId)?.minutes ?? 60;
  const minutes = Math.max(1, Math.min(resourceMinutes, Math.round(attempt.seconds / 60)));
  return { id: `attempt:${attempt.id}`, kind: 'attempt', referenceId: attempt.id, occurredAt: attempt.submittedAt, minutes };
}
export function getLearning(): LearningState {
  if (!cached) {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || '{}') as Partial<LearningState>;
      cached = { ...initial(), ...parsed, activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [] };
      cached.exam = normalizeExamSession(parsed.exam, cached.drafts);
      cached.examHistory = Array.isArray(parsed.examHistory)
        ? parsed.examHistory.map(exam => normalizeExamSession(exam, cached!.drafts)).filter((exam): exam is NonNullable<typeof exam> => !!exam && exam.complete)
        : [];
      for (const attempt of cached.attempts) {
        const normalizedEvent = attemptEvent(attempt);
        const savedEvent = cached.activityLog.find(event => event?.id === normalizedEvent.id);
        if (savedEvent) savedEvent.minutes = normalizedEvent.minutes;
        else cached.activityLog.push(normalizedEvent);
      }
    } catch { cached = initial(); }
  }
  return cached!;
}
export function mutateLearning(fn: (state: LearningState) => void, requirePersistence = false) {
  const next = structuredClone(getLearning()); fn(next);
  try { localStorage.setItem(KEY, JSON.stringify(next)); storageError = ''; } catch { storageError = 'Changes could not be saved on this device. Free some browser storage, then try again.'; if (requirePersistence) throw new Error(storageError); }
  cached = next; listeners.forEach(fn => fn()); return next;
}
export const useLearning = () => useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, getLearning);
export function resetLearning() {
  let failed = false;
  try {
    localStorage.removeItem(KEY);
    storageError = '';
  } catch {
    storageError = 'Demo progress could not be reset on this device. Free some browser storage, then try again.';
    failed = true;
  }
  cached = initial();
  listeners.forEach(listener => listener());
  if (failed) throw new Error(storageError);
}
export function loadDemo() {
  sessionService.start();
  resetLearning();
  const s = blankState();
  s.user = { firstName: 'Dilnoza Karimova', studyContext: 'University student', occupation: 'Student' };
  s.onboarding = { ...s.onboarding, complete: true, step: 5, reason: 'Study abroad', selfAssessment: 'B1' };
  s.results = structuredClone(learnerFixture);
  s.diagnostic = {
    ...s.diagnostic,
    status: 'complete',
    currentSection: 6,
    currentQuestion: 4,
    completedSections: ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking', 'familiarity'],
    listeningPlayed: true,
    speakingStatus: 'SUBMITTED',
    speakingDuration: 60,
    updatedAt: new Date().toISOString(),
  };
  writeState(s);
}
export const contentService = {
  resources: () => resources,
  resource: (id: string) => resources.find(r => r.id === id),
  lessons: () => lessons,
  lesson: (id: string) => lessons.find(l => l.id === id),
};
export const normalise = (value: string) => value.trim().toLowerCase().replace(/[.!?]$/g, '');
export function isCorrect(actual: Answer | undefined, expected: Answer | undefined, ordered = false) {
  if (expected === undefined || actual === undefined) return false;
  if (Array.isArray(expected)) { if (!Array.isArray(actual)) return false; const a = actual.map(normalise), b = expected.map(normalise); if (!ordered) { a.sort(); b.sort(); } return JSON.stringify(a) === JSON.stringify(b); }
  return !Array.isArray(actual) && normalise(actual) === normalise(expected);
}
export const answered = (answer?: Answer) => Array.isArray(answer) ? answer.length > 0 && answer.every(x => x.trim()) : !!answer?.trim();
export const assessmentService = {
  submit(resource: Resource, mode: Mode, draft: Draft, seconds: number, options: { draftKey?: string; mutate?: (state: LearningState, attempt: Attempt) => void } = {}): Attempt {
    const objective = resource.activities.filter(a => a.answer !== undefined);
    const attempt: Attempt = { id: crypto.randomUUID(), resourceId: resource.id, module: resource.module, mode, answers: draft.answers, correct: objective.filter(a => isCorrect(draft.answers[a.id], a.answer, a.type === 'ordering' || a.type === 'sentence_reorder')).length, total: objective.length, seconds, submittedAt: new Date().toISOString() };
    mutateLearning(s => { s.attempts.unshift(attempt); s.activityLog.unshift(attemptEvent(attempt)); delete s.drafts[options.draftKey ?? `${mode}:${resource.id}`]; objective.forEach(a => { const score = isCorrect(draft.answers[a.id], a.answer, a.type === 'ordering' || a.type === 'sentence_reorder') ? 100 : 0; const old = s.mastery[a.skill] ?? learnerFixture.skillMastery[a.skill] ?? 50; s.mastery[a.skill] = Math.round(old * .75 + score * .25); }); options.mutate?.(s, attempt); }, true);
    return attempt;
  },
};
export const progressService = {
  mastery: () => ({ ...(readState().results?.skillMastery ?? {}), ...getLearning().mastery }),
  recommendationFor: (attempt: Attempt) => {
    if (attempt.module === 'Writing') return lessons.find(l => l.id === 'writing-development')!;
    if (attempt.module === 'Speaking') return lessons.find(l => l.id === 'speaking-fluency')!;
    const r = contentService.resource(attempt.resourceId);
    const missed = r?.activities.find(a => a.answer !== undefined && !isCorrect(attempt.answers[a.id], a.answer, ['ordering', 'sentence_reorder'].includes(a.type)));
    return lessons.find(l => l.check.skill === missed?.skill) ?? lessons.find(l => l.module === attempt.module)!;
  },
  recommendations: () => {
    const s = getLearning(); const last = s.attempts.find(attemptHasLearnerContent);
    if (last) { const relevant = progressService.recommendationFor(last); return [relevant, ...lessons.filter(l => l.id !== relevant.id && !s.completedLessons.includes(l.id)).slice(0, 3)]; }
    const priorities = readState().results?.priorities ?? [];
    const lessonForModule: Record<string, string> = { Reading: 'matching-headings', Writing: 'writing-development', Listening: 'listening-detail', Speaking: 'speaking-fluency' };
    const priorityLessons = priorities.map(module => lessons.find(lesson => lesson.id === lessonForModule[module])).filter((lesson): lesson is Lesson => !!lesson);
    if (priorityLessons.length) {
      const ordered = [...priorityLessons, ...lessons.filter(lesson => !priorityLessons.some(priority => priority.id === lesson.id))];
      const unique = ordered.filter((lesson, index, all) => all.findIndex(item => item.id === lesson.id) === index);
      const incomplete = unique.filter(lesson => !s.completedLessons.includes(lesson.id));
      return (incomplete.length ? incomplete : unique).slice(0, 4);
    }
    return [lessons[0], lessons[3], lessons[4], lessons[5]];
  },
  completeLesson(id: string, skill: string, correct: boolean) { mutateLearning(s => {
    if (correct && !s.completedLessons.includes(id)) {
      s.completedLessons.push(id);
      const lesson = contentService.lesson(id);
      const occurredAt = new Date().toISOString();
      s.activityLog.unshift({ id: `lesson:${id}:${localDayKey(occurredAt)}`, kind: 'lesson', referenceId: id, occurredAt, minutes: lesson?.minutes ?? 8 });
    }
    s.mastery[skill] = Math.min(100, Math.max(s.mastery[skill] ?? learnerFixture.skillMastery[skill] ?? 40, correct ? 75 : 45));
  }); },
  gamification: (now = new Date()) => summarizeGamification(getLearning(), readState().onboarding.dailyMinutes, now),
};

export function summarizeGamification(learning: Pick<LearningState, 'activityLog'>, dailyMinutes: number, now = new Date()) {
  const safeEvents = learning.activityLog.filter(event => event && Number.isFinite(event.minutes) && !Number.isNaN(new Date(event.occurredAt).getTime()));
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const keyForOffset = (offset: number) => { const date = new Date(today); date.setDate(date.getDate() + offset); return localDayKey(date); };
  const activeKeys = new Set(safeEvents.map(event => localDayKey(event.occurredAt)));
  let currentStreak = 0;
  let offset = activeKeys.has(keyForOffset(0)) ? 0 : activeKeys.has(keyForOffset(-1)) ? -1 : 1;
  if (offset <= 0) {
    while (activeKeys.has(keyForOffset(offset))) { currentStreak += 1; offset -= 1; }
  }
  const sortedKeys = [...activeKeys].sort();
  let bestStreak = 0; let run = 0; let previous: Date | null = null;
  for (const key of sortedKeys) {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    run = previous && Math.round((date.getTime() - previous.getTime()) / 86400000) === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = date;
  }
  const monday = new Date(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekKeys = Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(date.getDate() + index); return localDayKey(date); });
  const activeWeekDays = weekKeys.map(key => activeKeys.has(key));
  const weekSet = new Set(weekKeys);
  const todayKey = localDayKey(today);
  return {
    currentStreak,
    bestStreak,
    thisWeekDays: activeWeekDays.filter(Boolean).length,
    activeWeekDays,
    todayActivities: safeEvents.filter(event => localDayKey(event.occurredAt) === todayKey).length,
    todayGoal: 4,
    weeklyMinutes: safeEvents.filter(event => weekSet.has(localDayKey(event.occurredAt))).reduce((sum, event) => sum + Math.max(0, event.minutes), 0),
    weeklyGoalMinutes: Math.max(60, dailyMinutes * 6),
  };
}
export interface CoachContext { mode: Mode; module?: string; resource?: string; question?: string; selectedText?: string; explanation?: string; }
export function openCoach(context: Partial<CoachContext>) { window.dispatchEvent(new CustomEvent('open-coach', { detail: context })); }
export const aiService = {
  respond(action: string, context: CoachContext) {
    if (context.mode === 'test' || context.mode === 'exam') return 'AI answer assistance is disabled until you submit this assessment.';
    const word = (context.selectedText ?? '').trim().toLowerCase().replace(/[.,!?]/g, ''); const entry = wordDefinitions[word];
    if (entry) { if (/uzbek/i.test(action)) return entry.uzbek; if (/synonym/i.test(action)) return entry.synonyms; if (/example/i.test(action)) return entry.example; return `${context.selectedText}: ${entry.meaning} In this context, connect its meaning to the surrounding sentence. Example: ${entry.example}`; }
    if (/why|wrong|explain/i.test(action) && context.explanation) return context.explanation;
    if (/uzbek/i.test(action)) return 'Avval asosiy fikrni toping. Keyin matndagi dalillarni tekshiring. Faqat bitta tanish so‘zga qarab javob tanlamang. (First find the main idea, then check the evidence.)';
    if (/grammar|conditional/i.test(action)) return 'For an imagined present situation, use if + past simple, then would + base verb: “If I had more time, I would practise every day.” Avoid would in the if-clause.';
    if (/plan|progress|improve|next/i.test(action)) { if (!hasDiagnosticBaseline(readState())) return 'Complete the initial assessment before I choose a personalized priority. Until then, use the Learn area for general language and IELTS skill lessons.'; const next = progressService.recommendations()[0]; return `Your next useful step is “${next.title}”. ${next.objective} Spend ${next.minutes} minutes on the lesson, then try a short ${next.module.toLowerCase()} practice. Your saved evidence shapes this recommendation.`; }
    if (/write.*essay|essay.*me/i.test(action)) return 'Let’s build your own answer. Choose a position, list one reason for each view, and add an example. I can explain the prompt or review a paragraph after you draft it.';
    if (/example/i.test(action)) return 'For example, a paragraph about sharing tools, advice and responsibility is mainly about cooperation. A heading about tools alone is too narrow.';
    if (/simpl/i.test(action)) return 'Ask: what is the whole paragraph about? Find the idea repeated across its examples. Choose the answer that covers that idea.';
    if (context.selectedText) return `You selected “${context.selectedText}” in ${context.resource ?? 'your learning activity'}. ${context.explanation ?? 'Read the sentence before and after it. Work out whether it introduces an idea, gives an example, or contrasts with something earlier.'} This is sample coaching guidance; a dictionary entry is not available for every selection.`;
    return `For ${context.module ?? 'IELTS preparation'}, start with one specific skill, practise it, then review your evidence. ${progressService.recommendations()[0].objective} Try asking about grammar, your next activity, or a selected sentence.`;
  },
  saveWord(text: string, context: string) { const word = text.trim(); if (!word) return; mutateLearning(s => { if (!s.vocabulary.some(w => w.word.toLowerCase() === word.toLowerCase())) s.vocabulary.push({ word, meaning: wordDefinitions[word.toLowerCase()]?.meaning ?? 'Saved phrase — revisit the source sentence to practise its meaning.', context, mastered: false }); }); },
};

