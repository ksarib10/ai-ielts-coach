import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import path from 'node:path';

const output = path.resolve('qa/.state-test.cjs');
buildSync({ entryPoints: ['src/state.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent' });
const require = createRequire(import.meta.url);
const store = new Map();
globalThis.localStorage = {
  getItem: key => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, value),
  removeItem: key => store.delete(key),
};
const state = require(output);

store.set(state.STORAGE_KEY, JSON.stringify({
  version: 1,
  user: { firstName: 'Saved learner', studyContext: 'University' },
  onboarding: { complete: true, step: 7, targetBand: 7.5 },
  diagnostic: { status: 'complete', completedSections: ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'], responses: { G1: 1 } },
  results: { overall: 6.5 },
  progress: { learningHours: 8, streak: 4, completedLessons: 9, recent: [] },
}));
let migrated = state.readState();
assert.equal(migrated.version, 2);
assert.equal(migrated.onboarding.step, 5);
assert.equal(migrated.onboarding.flowVersion, 2);
assert.equal(migrated.results.overall, 6.5);
assert.equal(migrated.progress.completedLessons, 9);
assert.equal(state.hasDiagnosticBaseline(migrated), true);

store.set(state.STORAGE_KEY, JSON.stringify({
  version: 1,
  user: { firstName: 'Partial learner', studyContext: '' },
  onboarding: { complete: false, step: 6 },
  diagnostic: {
    status: 'in_progress', currentSection: 3, currentQuestion: 2,
    completedSections: ['grammar', 'vocabulary', 'reading'], responses: { G1: 1, L1: 2 },
  },
}));
migrated = state.readState();
assert.equal(migrated.onboarding.step, 4);
assert.equal(migrated.diagnostic.currentSection, 3);
assert.equal(migrated.diagnostic.currentQuestion, 2);
assert.deepEqual(migrated.diagnostic.responses, { G1: 1, L1: 2 });
assert.equal(state.firstIncompleteDiagnosticSection(migrated.diagnostic.completedSections), 3);
assert.equal(state.hasDiagnosticBaseline(migrated), false);
assert.equal(state.learnerRouteRedirect('/dashboard', migrated), '/onboarding');

migrated.onboarding.complete = true;
assert.equal(state.learnerRouteRedirect('/learn', migrated), null);
assert.equal(state.learnerRouteRedirect('/diagnostic/results', migrated), '/diagnostic');

state.writeState(migrated);
assert.ok(store.has(state.STORAGE_KEY));
state.resetState();
assert.equal(store.has(state.STORAGE_KEY), false);
assert.equal(store.has(state.PROFILE_KEY), false);
assert.equal(store.has(state.ONBOARDING_KEY), false);
assert.equal(store.has(state.DIAGNOSTIC_KEY), false);
assert.equal(store.has(state.RESULTS_KEY), false);

const stateKeys = [state.STORAGE_KEY, state.PROFILE_KEY, state.ONBOARDING_KEY, state.DIAGNOSTIC_KEY, state.RESULTS_KEY];
stateKeys.forEach(key => store.set(key, 'saved'));
const removeItem = globalThis.localStorage.removeItem;
const attempted = [];
globalThis.localStorage.removeItem = key => {
  attempted.push(key);
  if (key === state.PROFILE_KEY) throw new Error('simulated storage failure');
  store.delete(key);
};
assert.throws(() => state.resetState(), /Could not clear 1 saved state entry/);
assert.deepEqual(attempted, stateKeys);
assert.equal(store.has(state.PROFILE_KEY), true);
assert.equal(stateKeys.filter(key => key !== state.PROFILE_KEY).some(key => store.has(key)), false);
globalThis.localStorage.removeItem = removeItem;

store.clear();
store.set(state.STORAGE_KEY, '{malformed json');
const recovered = state.readState();
assert.equal(recovered.onboarding.complete, false);
assert.equal(recovered.diagnostic.status, 'not_started');

store.clear();
const blank = state.readState();
assert.equal(blank.progress.learningHours, 0);
assert.equal(blank.progress.streak, 0);
assert.equal(blank.mistakes.length, 0);
assert.equal(blank.saved.length, 0);

console.log('PASS: state migration preserves complete and partial learner progress.');
