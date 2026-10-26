import { diagnosticSections } from '../data';
import type { AppState, DiagnosticResults, ModuleScore } from '../types';

type ObjectiveSection = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'familiarity';

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const halfBand = (value: number) => Math.round(value * 2) / 2;

function accuracyFor(state: AppState, sectionId: ObjectiveSection) {
  const questions = diagnosticSections.find((section) => section.id === sectionId)?.questions ?? [];
  if (!questions.length) return { correct: 0, total: 0, percent: 0 };
  const correct = questions.filter((question) => state.diagnostic.responses[question.id] === question.answer).length;
  return { correct, total: questions.length, percent: Math.round((correct / questions.length) * 100) };
}

function confidence(evidencePercent: number): ModuleScore['confidence'] {
  return evidencePercent >= 70 ? 'High' : evidencePercent >= 45 ? 'Medium' : 'Low';
}

function startingBand(selfAssessment: string) {
  return ({ A1: 3, A2: 4, B1: 5, B2: 6.5, 'C1+': 7.5 } as Record<string, number>)[selfAssessment] ?? 5;
}

function performanceBand(base: number, percent: number) {
  return halfBand(clamp(base + ((percent / 100) - 0.5) * 2, 3, 8.5));
}

export function diagnosticEvidence(state: AppState) {
  return {
    grammar: accuracyFor(state, 'grammar'),
    vocabulary: accuracyFor(state, 'vocabulary'),
    reading: accuracyFor(state, 'reading'),
    listening: accuracyFor(state, 'listening'),
    familiarity: accuracyFor(state, 'familiarity'),
    writingWords: state.diagnostic.writingText.trim().split(/\s+/).filter(Boolean).length,
    speakingSeconds: state.diagnostic.speakingDuration,
  };
}

export function buildDiagnosticResults(state: AppState): DiagnosticResults {
  const evidence = diagnosticEvidence(state);
  const base = startingBand(state.onboarding.selfAssessment);
  const languagePercent = Math.round((evidence.grammar.percent + evidence.vocabulary.percent) / 2);
  const languageBand = performanceBand(base, languagePercent);
  const readingBand = performanceBand(base, Math.round(evidence.reading.percent * 0.75 + languagePercent * 0.25));
  const listeningBand = performanceBand(base, Math.round(evidence.listening.percent * 0.8 + languagePercent * 0.2));
  // The prototype does not pretend to grade free responses. Their provisional
  // starting points combine the learner's self-assessment with objective language evidence.
  const productiveBand = halfBand(clamp(base * 0.65 + languageBand * 0.35, 3, 8.5));
  const moduleScores: DiagnosticResults['moduleScores'] = {
    Reading: { band: readingBand, evidencePercent: 58, confidence: confidence(58) },
    Writing: { band: productiveBand, evidencePercent: 35, confidence: confidence(35) },
    Listening: { band: listeningBand, evidencePercent: 58, confidence: confidence(58) },
    Speaking: { band: productiveBand, evidencePercent: 35, confidence: confidence(35) },
  };
  const overall = halfBand(Object.values(moduleScores).reduce((sum, score) => sum + score.band, 0) / 4);

  const skillMastery: Record<string, number> = {};
  for (const section of diagnosticSections) {
    for (const question of section.questions ?? []) {
      const score = state.diagnostic.responses[question.id] === question.answer ? 85 : 35;
      skillMastery[question.skill] = skillMastery[question.skill] === undefined
        ? score
        : Math.round((skillMastery[question.skill] + score) / 2);
    }
  }
  skillMastery['Writing idea development'] = evidence.writingWords >= 180 ? 50 : 30;
  skillMastery['Speaking fluency'] = state.diagnostic.speakingStatus === 'SUBMITTED' ? 50 : 30;

  const rankedSkills = Object.entries(skillMastery).sort((left, right) => right[1] - left[1]);
  const moduleRanking = Object.entries(moduleScores).sort((left, right) => left[1].band - right[1].band);
  const priorities = moduleRanking.slice(0, 3).map(([module]) => module);
  const planByModule: Record<string, DiagnosticResults['plan'][number]> = {
    Reading: { title: 'Find the main idea, not just a keyword', reason: 'Build the reading concept with the lowest starting evidence.', duration: '8 min', kind: 'Lesson' },
    Writing: { title: 'Turn an idea into a convincing paragraph', reason: 'Practise developing a claim with a reason and example.', duration: '8 min', kind: 'Lesson' },
    Listening: { title: 'Catch the detail after the contrast', reason: 'Strengthen detail recognition before another timed task.', duration: '8 min', kind: 'Lesson' },
    Speaking: { title: 'Build an answer that keeps moving', reason: 'Extend spoken ideas with a clear reason and example.', duration: '8 min', kind: 'Lesson' },
  };
  const cefr = ['A1', 'A2', 'B1', 'B2', 'C1+'].includes(state.onboarding.selfAssessment)
    ? state.onboarding.selfAssessment
    : overall < 4 ? 'A2' : overall < 5.5 ? 'B1' : overall < 7 ? 'B2' : 'C1';

  return {
    cefr,
    moduleScores,
    overall,
    overallConfidence: 'Low',
    skillMastery,
    familiarity: evidence.familiarity.percent,
    strengths: rankedSkills.slice(0, 2).map(([skill]) => skill),
    weaknesses: rankedSkills.slice(-3).reverse().map(([skill]) => skill),
    recurringWeaknesses: rankedSkills.slice(-2).reverse().map(([skill]) => `More evidence is needed for ${skill.toLowerCase()}.`),
    priorities,
    readiness: overall < 4.5 ? 'Foundation' : overall < 6 ? 'Pre-IELTS' : overall < 7 ? 'IELTS Practice' : 'Exam Ready',
    plan: priorities.map((module) => planByModule[module]),
    generatedAt: new Date().toISOString(),
  };
}
