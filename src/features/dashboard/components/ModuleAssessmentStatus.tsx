import type { Module } from '../../../domain';

export function ModuleAssessmentStatus({ module, targetBand }: { module: Module; targetBand?: number }) {
  const hasGoal = typeof targetBand === 'number' && Number.isFinite(targetBand) && targetBand >= 0 && targetBand <= 9;
  return <div className="module-score-placeholder module-score-unassessed" aria-label={`${module} assessment not validated`}><span>Validation pending</span><strong>Not assessed</strong><span>{hasGoal ? `Saved goal ${targetBand.toFixed(1)}` : 'Validated score unavailable'}</span></div>;
}
