import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import path from 'node:path';

const output = path.resolve('qa/.ielts-reference-test.cjs');
buildSync({ entryPoints: ['src/data/ieltsReference.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent' });
const require = createRequire(import.meta.url);
const { ieltsExamReference, formatContinuousSession, formatExamCommitment, writingTaskOneDescription } = require(output);

assert.deepEqual(ieltsExamReference.sessionOrder, ['Listening', 'Reading', 'Writing']);
assert.equal(ieltsExamReference.modules.Listening.workingMinutes + ieltsExamReference.modules.Listening.transferMinutes, 40);
assert.equal(ieltsExamReference.modules.Reading.minutes, 60);
assert.equal(ieltsExamReference.modules.Writing.minutes, 60);
assert.equal(ieltsExamReference.modules.Writing.taskTwoWeight, 2);
assert.deepEqual(ieltsExamReference.modules.Speaking.minutes, { minimum: 11, maximum: 14 });
assert.equal(formatExamCommitment(), 'approximately 171–174 minutes across all four skills');
assert.equal(formatContinuousSession(), '160 minutes across Listening, Reading and Writing');
assert.match(writingTaskOneDescription('Academic'), /visual information/i);
assert.match(writingTaskOneDescription('General Training'), /letter/i);
assert.equal(ieltsExamReference.sourceLimits.hasFullQuestionBank, false);

console.log('PASS: IELTS reference model preserves supplied timing, order, and type differences.');
