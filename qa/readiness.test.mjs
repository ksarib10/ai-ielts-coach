import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import path from 'node:path';

const output = path.resolve('qa/.readiness-test.cjs');
buildSync({ entryPoints: ['src/services/readiness.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent' });
const require = createRequire(import.meta.url);
const { readinessService } = require(output);
const moduleScores = {
  Reading: { band: 5.5, confidence: 'Low', evidencePercent: 55 },
  Writing: { band: 5, confidence: 'Low', evidencePercent: 35 },
  Listening: { band: 5, confidence: 'Low', evidencePercent: 50 },
  Speaking: { band: 5, confidence: 'Low', evidencePercent: 30 },
};
const base = {
  onboarding: { targetBand: 7 },
  diagnostic: { status: 'in_progress' },
  results: { overall: 5.5, familiarity: 60, moduleScores },
};
const learning = { attempts: [], activityLog: [], drafts: {}, completedLessons: [], mastery: {}, highlights: {}, vocabulary: [] };
assert.deepEqual(readinessService.summary(base, learning), { calculated: false, label: 'Not calculated' });
const assessed = readinessService.summary({ ...base, diagnostic: { status: 'complete' } }, learning);
assert.equal(assessed.calculated, true);
assert.equal(assessed.value, 68);
assert.equal(assessed.strongest, 'Reading');
assert.equal(assessed.attention, 'Writing');
assert.equal(assessed.label, 'Developing');
assert.ok(assessed.value >= 0 && assessed.value <= 100);
const emptyTimed = readinessService.summary({ ...base, diagnostic: { status: 'complete' } }, {
  ...learning,
  attempts: [{ mode: 'exam', module: 'Speaking', answers: { response: 'Speaking response marked complete with the no-microphone demo fallback (4s). No sample answer was supplied.' } }],
});
assert.equal(emptyTimed.value, assessed.value, 'Fallback-only Exam submissions must not increase readiness');
const evidencedTimed = readinessService.summary({ ...base, diagnostic: { status: 'complete' } }, {
  ...learning,
  attempts: [{ mode: 'exam', module: 'Reading', answers: { response: 'B' } }],
});
assert.equal(evidencedTimed.value, assessed.value + 2, 'A timed module with learner evidence contributes the intended small readiness increment');

console.log('PASS: readiness is gated by a baseline and derives from saved evidence.');
