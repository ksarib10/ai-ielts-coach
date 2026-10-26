import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import path from 'node:path';

const output = path.resolve('qa/.diagnostic-test.cjs');
buildSync({ entryPoints: ['src/services/diagnostic.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent' });
const require = createRequire(import.meta.url);
const { buildDiagnosticResults, diagnosticEvidence } = require(output);

const answers = {
  G1: 1, G2: 2, G3: 1, G4: 2, G5: 2, G6: 1,
  V1: 1, V2: 0, V3: 0, V4: 2, V5: 1, V6: 1,
  R1: 1, R2: 1, R3: 0, R4: 1, R5: 1,
  L1: 1, L2: 1, L3: 1, L4: 1, L5: 1,
  I1: 1, I2: 1, I3: 1, I4: 2, I5: 1,
};
const makeState = (responses) => ({
  onboarding: { selfAssessment: 'B1' },
  diagnostic: {
    responses,
    writingText: Array.from({ length: 180 }, () => 'word').join(' '),
    speakingStatus: 'SUBMITTED',
    speakingDuration: 75,
  },
});

const strong = buildDiagnosticResults(makeState(answers));
const wrong = Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, (answer + 1) % 4]));
const developing = buildDiagnosticResults(makeState(wrong));
assert.equal(diagnosticEvidence(makeState(answers)).familiarity.percent, 100);
assert.equal(strong.familiarity, 100);
assert.equal(developing.familiarity, 0);
assert.ok(strong.moduleScores.Reading.band > developing.moduleScores.Reading.band);
assert.ok(strong.moduleScores.Listening.band > developing.moduleScores.Listening.band);
assert.equal(strong.moduleScores.Writing.confidence, 'Low');
assert.equal(strong.overallConfidence, 'Low');
assert.equal(strong.plan.length, 3);

console.log('PASS: diagnostic results derive from saved evidence and remain provisional.');
