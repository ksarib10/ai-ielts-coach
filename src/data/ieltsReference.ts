import type { Module } from '../domain';
import type { IELTSMode } from '../types';

/**
 * Exam facts transcribed from the supplied IELTS informational CSVs.
 *
 * The prototype follows one coherent source model: an in-centre, paper-style
 * Listening/Reading/Writing session, with Speaking potentially scheduled
 * separately.  UI copy should keep these source timings separate from the
 * duration of our shortened original sample activities.
 */
export const ieltsExamReference = {
  model: 'In-centre paper-style IELTS reference',
  sessionOrder: ['Listening', 'Reading', 'Writing'] as Module[],
  completeJourney: ['Listening', 'Reading', 'Writing', 'Speaking'] as Module[],
  noBreakBetweenSessionModules: true,
  speakingMayBeScheduledSeparately: true,
  totalCommitmentMinutes: { minimum: 171, maximum: 174 },
  modules: {
    Listening: {
      minutes: 40,
      workingMinutes: 30,
      transferMinutes: 10,
      sameForBothTypes: true,
      description: 'Listen and answer, followed by a paper-style answer-transfer period.',
    },
    Reading: {
      minutes: 60,
      transferMinutes: 0,
      sameForBothTypes: false,
      description: 'The 60 minutes include transferring answers.',
    },
    Writing: {
      minutes: 60,
      sameForBothTypes: false,
      taskTwoWeight: 2,
      tasks: [
        { task: 1, minimumWords: 150 },
        { task: 2, minimumWords: 250 },
      ],
      description: 'Two tasks share one 60-minute module limit; Task 2 contributes twice as much as Task 1.',
    },
    Speaking: {
      minutes: { minimum: 11, maximum: 14 },
      parts: 3,
      sameForBothTypes: true,
      description: 'A three-part speaking interview that may be scheduled separately.',
    },
  },
  typeDifferences: {
    Academic: {
      Reading: 'Academic reading material.',
      WritingTask1: 'Describe, summarise or explain visual information in at least 150 words.',
    },
    'General Training': {
      Reading: 'General Training reading material.',
      WritingTask1: 'Write a letter in at least 150 words.',
    },
  } satisfies Record<IELTSMode, { Reading: string; WritingTask1: string }>,
  sourceLimits: {
    hasFullQuestionBank: false,
    hasDetailedGeneralReadingSample: false,
    hasPartLevelSpeakingTimings: false,
    note: 'The supplied CSVs define structure, requirements and timing, but do not provide a complete licensed paper. The prototype therefore labels every active resource as an original shortened sample.',
  },
} as const;

export function formatExamCommitment() {
  const { minimum, maximum } = ieltsExamReference.totalCommitmentMinutes;
  return `approximately ${minimum}–${maximum} minutes across all four skills`;
}

export function formatContinuousSession() {
  const minutes = ieltsExamReference.sessionOrder.reduce((sum, module) => {
    const timing = ieltsExamReference.modules[module].minutes;
    return sum + (typeof timing === 'number' ? timing : timing.maximum);
  }, 0);
  return `${minutes} minutes across Listening, Reading and Writing`;
}

export function writingTaskOneDescription(type: IELTSMode) {
  return ieltsExamReference.typeDifferences[type].WritingTask1;
}
