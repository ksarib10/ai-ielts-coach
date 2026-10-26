import { STORAGE_KEY, PROFILE_KEY, ONBOARDING_KEY, DIAGNOSTIC_KEY } from '../../../state';
import type { MetricPresentation, SavedHistory, SavedPresentation } from '../types';
type Reader = Pick<Storage, 'getItem'>;
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
function parse(raw: string) {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid saved record');
  return object(value);
}
const absent = (state: SavedPresentation['state']): SavedPresentation => ({ state, name: null, track: null, target: null, diagnostic: null, completedSections: null });
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : null;
// Read-only presentation adapter. No legacy results, answer maps or scores are interpreted.
export function readSavedPresentation(storage: Reader): SavedPresentation {
  try {
    const master = storage.getItem(STORAGE_KEY);
    let root: Record<string, unknown>;
    if (master !== null) root = parse(master);
    else {
      const profile = storage.getItem(PROFILE_KEY), onboarding = storage.getItem(ONBOARDING_KEY), diagnostic = storage.getItem(DIAGNOSTIC_KEY);
      if (profile === null && onboarding === null && diagnostic === null) return absent('EMPTY');
      root = { user: profile === null ? {} : parse(profile), onboarding: onboarding === null ? {} : parse(onboarding), diagnostic: diagnostic === null ? {} : parse(diagnostic) };
    }
    const user = object(root.user), preferences = object(root.onboarding), diagnostic = object(root.diagnostic);
    const validSections = new Set(['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking', 'familiarity']);
    const status = diagnostic.status;
    return { state: 'AVAILABLE', name: text(user.firstName), track: preferences.ieltsType === 'Academic' || preferences.ieltsType === 'General Training' ? preferences.ieltsType : null,
      target: typeof preferences.targetBand === 'number' && Number.isFinite(preferences.targetBand) && preferences.targetBand >= 0 && preferences.targetBand <= 9 && Number.isInteger(preferences.targetBand * 2) ? preferences.targetBand : null,
      diagnostic: status === 'not_started' || status === 'in_progress' || status === 'complete' || status === 'skipped' ? status : null,
      completedSections: Array.isArray(diagnostic.completedSections) ? new Set(diagnostic.completedSections.filter(value => typeof value === 'string' && validSections.has(value))).size : null };
  } catch { return absent('TEMP_UNAVAILABLE'); }
}
export function browserSavedPresentation(): SavedPresentation {
  try { return readSavedPresentation(window.localStorage); } catch { return absent('TEMP_UNAVAILABLE'); }
}
export function diagnosticAction(source: SavedPresentation) {
  if (source.diagnostic === 'complete') return { label: 'View diagnostic status', path: '/diagnostic/results' };
  if (source.diagnostic === 'in_progress' || source.diagnostic === 'skipped') return { label: 'Resume diagnostic', path: '/diagnostic' };
  return { label: 'Explore diagnostic', path: '/diagnostic' };
}
export const participationLabel = (status: SavedPresentation['diagnostic']) => status === 'complete' ? 'Legacy diagnostic completed' : status === 'in_progress' ? 'In progress' : status === 'skipped' ? 'Deferred — return when ready' : status === 'not_started' ? 'Not started' : 'Not recorded';
export function baselinePresentations(source: SavedPresentation): MetricPresentation[] {
  const state = source.state;
  const gate: MetricPresentation['state'] = state === 'TEMP_UNAVAILABLE' ? 'TEMP_UNAVAILABLE' : 'REQUIRES_VALID_DIAGNOSTIC';
  const pending = (id: string, title: string, detail: string): MetricPresentation => ({ id, title, state: state === 'TEMP_UNAVAILABLE' ? state : 'UNSUPPORTED', value: null, detail });
  return [
    pending('M01', 'Profile completion', 'Saved preferences are visible. The complete profile validator is still pending.'),
    { id: 'M02', title: 'Track and goal', state: state === 'TEMP_UNAVAILABLE' ? state : source.track ? 'AVAILABLE' : 'EMPTY', value: source.track ? `${source.track}${source.target === null ? '' : ` · goal ${source.target.toFixed(1)}`}` : null, detail: 'Your saved preference and self-declared goal.' },
    { id: 'M03', title: 'Diagnostic participation', state: state === 'TEMP_UNAVAILABLE' ? state : source.diagnostic === 'in_progress' ? 'IN_PROGRESS' : source.diagnostic ? 'AVAILABLE' : 'EMPTY', value: source.diagnostic ? participationLabel(source.diagnostic) : null, detail: 'Observed legacy participation only. Completion does not establish scoring validity.' },
    { id: 'M04', title: 'Valid answered questions', state: gate, value: null, detail: 'Requires a validated, versioned assignment and responses.' },
    ...['Grammar', 'Vocabulary', 'Reading', 'Listening', 'Familiarity'].map<MetricPresentation>(title => ({ id: `M05-${title.toUpperCase()}`, title: `${title} raw accuracy`, state: gate, value: null, detail: 'Question, key and media validation must be accepted before a raw score is released.' })),
    { id: 'M06', title: 'Validated answer review', state: gate, value: null, detail: 'A reviewed diagnostic submission is required.' },
    pending('M07', 'Response capture', 'Writing and genuine recorded Speaking evidence require the approved capture contract.'),
    ...[['M08', 'Completed activities'], ['M09', 'Weekly active days'], ['M10', 'Today’s completed activities'], ['M11', 'Current activity streak']].map(([id, title]) => pending(id, title, 'Owned, durable completion events and history coverage are still being prepared.')),
  ];
}
export const futurePresentations: MetricPresentation[] = [
  ['M12', 'Comparable skill trends'], ['M13', 'Measured active study time'], ['M14', 'IELTS readiness'], ['M15', 'Assessed IELTS / CEFR level'], ['M16', 'AI next-activity recommendations'], ['M17', 'Whole-curriculum completion'],
].map(([id, title]) => ({ id, title, state: 'UNSUPPORTED', value: null, detail: 'Unavailable until its supporting system and evidence are implemented and accepted.' }));
export function readSavedHistory(storage: Reader): SavedHistory {
  try {
    const raw = storage.getItem('ielts-learning-v2');
    if (raw === null) return { state: 'EMPTY', entries: [] };
    const root = parse(raw);
    if (!Array.isArray(root.attempts)) return { state: 'TEMP_UNAVAILABLE', entries: [] };
    const entries: SavedHistory['entries'] = [];
    const ids = new Set<string>();
    for (const value of root.attempts) {
      const item = object(value);
      if (typeof item.id !== 'string' || !item.id || ids.has(item.id) || typeof item.module !== 'string' || typeof item.mode !== 'string' || typeof item.submittedAt !== 'string' || Number.isNaN(Date.parse(item.submittedAt))) continue;
      ids.add(item.id); entries.push({ id: item.id, module: item.module, mode: item.mode, submittedAt: item.submittedAt });
    }
    return { state: entries.length ? 'AVAILABLE' : 'EMPTY', entries };
  } catch { return { state: 'TEMP_UNAVAILABLE', entries: [] }; }
}
