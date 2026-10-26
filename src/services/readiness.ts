import { modules, type LearningState, type Module } from '../domain';
import { hasDiagnosticBaseline } from '../state';
import type { AppState } from '../types';
import { attemptHasLearnerContent } from './evidence';

export type ReadinessSummary =
  | { calculated: false; label: 'Not calculated' }
  | {
      calculated: true;
      value: number;
      label: 'Foundation' | 'Building' | 'Developing' | 'Approaching target' | 'Ready to verify';
      current: number;
      target: number;
      strongest: Module;
      attention: Module;
      evidence: number;
    };

const clamp = (value: number) => Math.min(95, Math.max(0, Math.round(value)));

export const readinessService = {
  summary(state: AppState, learning: LearningState): ReadinessSummary {
    if (!hasDiagnosticBaseline(state)) return { calculated: false, label: 'Not calculated' };
    const results = state.results!;
    const target = Math.max(1, state.onboarding.targetBand);
    const entries = modules.map(module => [module, results.moduleScores[module]] as const);
    const strongest = [...entries].sort((left, right) => right[1].band - left[1].band)[0][0];
    const attention = [...entries].sort((left, right) => left[1].band - right[1].band)[0][0];
    const evidence = Math.round(entries.reduce((sum, [, score]) => sum + score.evidencePercent, 0) / entries.length);
    const timedModules = new Set(learning.attempts
      .filter(attempt => (attempt.mode === 'test' || attempt.mode === 'exam') && attemptHasLearnerContent(attempt))
      .map(attempt => attempt.module)).size;
    const targetRatio = Math.min(1, results.overall / target);
    const value = clamp(targetRatio * 68 + evidence * 0.2 + results.familiarity * 0.1 + timedModules * 1.5);
    const label = value < 40 ? 'Foundation' : value < 60 ? 'Building' : value < 75 ? 'Developing' : value < 90 ? 'Approaching target' : 'Ready to verify';
    return { calculated: true, value, label, current: results.overall, target, strongest, attention, evidence };
  },
};
