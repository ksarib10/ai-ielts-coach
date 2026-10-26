import type { MetricPresentation, PresentationState } from '../types';
const labels: Record<PresentationState, string> = { AVAILABLE: 'Saved', EMPTY: 'No saved information', IN_PROGRESS: 'In progress', REQUIRES_VALID_DIAGNOSTIC: 'Validation required', TEMP_UNAVAILABLE: 'Temporarily unavailable', UNSUPPORTED: 'Not available yet' };
export function AvailabilityCard({ metric }: { metric: MetricPresentation }) {
  return <section className="card availability-card" data-metric-id={metric.id} data-state={metric.state} aria-label={metric.title}><span className={`availability-label state-${metric.state.toLowerCase()}`}>{labels[metric.state]}</span><h3>{metric.title}</h3><strong className="availability-value">{metric.value ?? 'Not available'}</strong><p>{metric.detail}</p></section>;
}
