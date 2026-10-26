import type { Answer, Attempt } from '../domain';

const NO_CONTENT_MARKERS = [
  'no-microphone demo fallback',
  'no sample answer was supplied',
];

export function answerHasLearnerContent(answer: Answer | undefined) {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.some(value => value.trim().length > 0);
  const value = answer.trim();
  if (!value) return false;
  const normalized = value.toLowerCase();
  return !NO_CONTENT_MARKERS.every(marker => normalized.includes(marker));
}

export function attemptHasLearnerContent(attempt: Pick<Attempt, 'answers'>) {
  return Object.values(attempt.answers).some(answerHasLearnerContent);
}
