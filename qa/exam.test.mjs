import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
import path from 'node:path';

const output = path.resolve('qa/.exam-test.cjs');
buildSync({ entryPoints: ['src/services/exam.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent' });
const require = createRequire(import.meta.url);
const exam = require(output);

assert.deepEqual(exam.examSections('Academic').map(section => section.resourceId), ['listening-gardens', 'gardens', 'writing-1', 'writing-2', 'speaking-1', 'speaking-2', 'speaking-3']);
assert.deepEqual(exam.examSections('General Training').map(section => section.resourceId), ['listening-gardens', 'gardens', 'writing-letter', 'writing-2', 'speaking-1', 'speaking-2', 'speaking-3']);

const started = Date.UTC(2026, 8, 9, 9);
const session = exam.createExamSession('Academic', started);
const state = { exam: session, attempts: [], drafts: {}, completedLessons: [], mastery: {}, highlights: {}, vocabulary: [], activityLog: [], examHistory: [] };
const attempt = (id, module) => ({ id, resourceId: id, module, mode: 'exam', answers: {}, correct: 0, total: 0, seconds: 1, submittedAt: new Date(started).toISOString() });

exam.advanceExam(state, session.id, attempt('listen', 'Listening'), started + 1_000);
assert.equal(state.exam.section, 1);
assert.equal(state.exam.moduleDeadline, started + 1_000 + 60 * 60_000, 'Reading receives its source-backed module limit');
exam.advanceExam(state, session.id, attempt('read', 'Reading'), started + 2_000);
const writingDeadline = state.exam.moduleDeadline;
exam.advanceExam(state, session.id, attempt('write-1', 'Writing'), started + 3_000);
assert.equal(state.exam.moduleDeadline, writingDeadline, 'Writing Tasks 1 and 2 share one deadline');
exam.advanceExam(state, session.id, attempt('write-2', 'Writing'), started + 4_000);
assert.equal(state.exam.moduleDeadline, started + 4_000 + 14 * 60_000, 'Speaking uses the supported upper timing bound');
exam.advanceExam(state, session.id, attempt('speak-1', 'Speaking'), started + 5_000);
exam.advanceExam(state, session.id, attempt('speak-2', 'Speaking'), started + 6_000);
exam.advanceExam(state, session.id, attempt('speak-3', 'Speaking'), started + 7_000);
assert.equal(state.exam.complete, true);
assert.equal(state.exam.attemptIds.length, 7);
assert.equal(exam.examModuleStatus(state.exam, 'Speaking'), 'complete');

const completeId = state.exam.id;
exam.beginExam(state, 'General Training', started + 8_000);
assert.equal(state.exam.type, 'General Training');
assert.equal(state.examHistory[0].id, completeId, 'Starting another simulation preserves the completed session');

const legacy = exam.normalizeExamSession({ section: 2, attemptIds: ['old', 'old'], complete: false, startedAt: started, type: 'Academic' }, {
  'exam:writing-1': { answers: { essay: 'Saved legacy draft' }, flags: [], startedAt: started, deadline: started + 30_000 },
}, started + 10_000);
assert.equal(legacy.id, `legacy-${started}`);
assert.deepEqual(legacy.attemptIds, ['old']);
assert.equal(legacy.moduleDeadline, started + 30_000, 'Legacy active deadline and draft position are preserved');

console.log('PASS: standalone exam order, shared module timing, completion, and history are consistent.');
