import type { Attempt, Draft, ExamSession, LearningState, Module } from '../domain';
import { ieltsExamReference } from '../data/ieltsReference';
import type { IELTSMode } from '../types';

export interface ExamSection {
  resourceId: string;
  module: Module;
  label: string;
}

const sharedSections: ExamSection[] = [
  { resourceId: 'listening-gardens', module: 'Listening', label: 'Listening sample' },
  { resourceId: 'gardens', module: 'Reading', label: 'Reading sample' },
];

const speakingSections: ExamSection[] = [
  { resourceId: 'speaking-1', module: 'Speaking', label: 'Speaking Part 1' },
  { resourceId: 'speaking-2', module: 'Speaking', label: 'Speaking Part 2' },
  { resourceId: 'speaking-3', module: 'Speaking', label: 'Speaking Part 3' },
];

export function examSections(type: IELTSMode): ExamSection[] {
  return [
    ...sharedSections,
    { resourceId: type === 'Academic' ? 'writing-1' : 'writing-letter', module: 'Writing', label: `${type} Writing Task 1` },
    { resourceId: 'writing-2', module: 'Writing', label: 'Writing Task 2' },
    ...speakingSections,
  ];
}

export function examModuleMinutes(module: Module) {
  const reference = ieltsExamReference.modules[module];
  return typeof reference.minutes === 'number' ? reference.minutes : reference.minutes.maximum;
}

export function examDraftKey(examId: string, resourceId: string) {
  return `exam:${examId}:${resourceId}`;
}

export function createExamSession(type: IELTSMode, now = Date.now()): ExamSession {
  return {
    id: crypto.randomUUID(),
    type,
    section: 0,
    attemptIds: [],
    complete: false,
    startedAt: now,
    moduleStartedAt: now,
    moduleDeadline: now + examModuleMinutes('Listening') * 60_000,
  };
}

export function normalizeExamSession(raw: Partial<ExamSession> | undefined, drafts: Record<string, Draft>, now = Date.now()): ExamSession | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const type: IELTSMode = raw.type === 'General Training' ? 'General Training' : 'Academic';
  const sections = examSections(type);
  const section = Math.max(0, Math.min(sections.length - 1, Number.isFinite(raw.section) ? Number(raw.section) : 0));
  const startedAt = Number.isFinite(raw.startedAt) ? Number(raw.startedAt) : now;
  const legacyResourceId = sections[section].resourceId;
  const legacyDeadline = drafts[`exam:${legacyResourceId}`]?.deadline;
  const moduleStartedAt = Number.isFinite(raw.moduleStartedAt) ? Number(raw.moduleStartedAt) : startedAt;
  const moduleDeadline = Number.isFinite(raw.moduleDeadline)
    ? Number(raw.moduleDeadline)
    : Number.isFinite(legacyDeadline)
      ? Number(legacyDeadline)
      : now + examModuleMinutes(sections[section].module) * 60_000;
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `legacy-${startedAt}`,
    type,
    section,
    attemptIds: Array.isArray(raw.attemptIds) ? [...new Set(raw.attemptIds.filter((id): id is string => typeof id === 'string'))] : [],
    complete: Boolean(raw.complete),
    startedAt,
    moduleStartedAt,
    moduleDeadline,
    ...(Number.isFinite(raw.completedAt) ? { completedAt: Number(raw.completedAt) } : {}),
  };
}

export function beginExam(state: LearningState, type: IELTSMode, now = Date.now()) {
  if (state.exam?.complete && !state.examHistory?.some(exam => exam.id === state.exam!.id)) {
    state.examHistory = [state.exam, ...(state.examHistory ?? [])];
  }
  state.exam = createExamSession(type, now);
}

export function advanceExam(state: LearningState, examId: string, attempt: Attempt, now = Date.now()) {
  const exam = state.exam;
  if (!exam || exam.id !== examId || exam.complete) return;
  if (!exam.attemptIds.includes(attempt.id)) exam.attemptIds.push(attempt.id);
  const sections = examSections(exam.type);
  if (exam.section >= sections.length - 1) {
    exam.complete = true;
    exam.completedAt = now;
    return;
  }
  const previousModule = sections[exam.section].module;
  exam.section += 1;
  const nextModule = sections[exam.section].module;
  if (nextModule !== previousModule) {
    exam.moduleStartedAt = now;
    exam.moduleDeadline = now + examModuleMinutes(nextModule) * 60_000;
  }
}

export function findExam(state: LearningState, id: string) {
  if (state.exam?.id === id) return state.exam;
  return state.examHistory?.find(exam => exam.id === id);
}

export function examModuleStatus(exam: ExamSession, module: Module): 'complete' | 'current' | 'upcoming' {
  const sections = examSections(exam.type);
  const currentModule = exam.complete ? undefined : sections[exam.section]?.module;
  const moduleIndex = ieltsExamReference.completeJourney.indexOf(module);
  const currentIndex = currentModule ? ieltsExamReference.completeJourney.indexOf(currentModule) : ieltsExamReference.completeJourney.length;
  return moduleIndex < currentIndex || exam.complete ? 'complete' : module === currentModule ? 'current' : 'upcoming';
}
