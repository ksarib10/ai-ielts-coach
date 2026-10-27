import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
const output = path.resolve('qa/.foundation-test.cjs');
buildSync({ stdin: { contents: `export * from './src/features/onboarding/services/validation'; export * from './src/features/appearance/services/preference'; export * from './src/features/appearance/hooks/AppearanceProvider'; export * from './src/features/appearance/components/AppearanceControl'; export * from './src/features/dashboard/services/presentation'; export * from './src/features/dashboard/components/AvailabilityCard'; export * from './src/features/shell/services/navigation'; export * from './src/features/shell/components/SidebarNavigation'; export * from './src/components/AppShell'; export * from './src/features/dashboard/components/ModuleAssessmentStatus';`, resolveDir: process.cwd(), loader: 'ts' }, bundle: true, packages: 'external', platform: 'node', format: 'cjs', outfile: output, logLevel: 'silent' });
const require = createRequire(import.meta.url); const p = require(output);
const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server'); const { MemoryRouter } = require('react-router-dom');
const store = new Map(); const writes = [];
const storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => { store.set(key, value); writes.push(key); } };
globalThis.localStorage = storage;
assert.equal(p.readAppearance(storage), 'system');
store.set(p.APPEARANCE_KEY, 'invalid'); assert.equal(p.readAppearance(storage), 'system');
assert.equal(p.saveAppearance(storage, 'dark'), true); assert.equal(p.readAppearance(storage), 'dark');
assert.equal(p.resolveAppearance('system', true), 'dark'); assert.equal(p.resolveAppearance('system', false), 'light');
assert.equal(p.resolveAppearance('light', true), 'light'); assert.equal(p.resolveAppearance('dark', false), 'dark');
const denied = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
assert.equal(p.readAppearance(denied), 'system'); assert.equal(p.saveAppearance(denied, 'light'), false);
assert.deepEqual(writes, [p.APPEARANCE_KEY]);
const baseline = ['M01','M02','M03','M04','M05-GRAMMAR','M05-VOCABULARY','M05-READING','M05-LISTENING','M05-FAMILIARITY','M06','M07','M08','M09','M10','M11'];
const empty = p.readSavedPresentation(storage); assert.equal(empty.state, 'EMPTY'); assert.equal(empty.target, null);
assert.deepEqual(p.baselinePresentations(empty).map(x => x.id), baseline);
assert.equal(p.baselinePresentations(empty).find(x => x.id === 'M02').state, 'EMPTY');
const record = { user: { firstName: 'Review Learner' }, onboarding: { ieltsType: 'Academic', targetBand: 7 }, diagnostic: { status: 'skipped', completedSections: ['grammar','grammar','unknown'] }, results: { overall: 8.5, cefr: 'C1' } };
store.set('aiIELTSCoach', JSON.stringify(record)); const before = new Map(store);
let saved = p.readSavedPresentation(storage); assert.equal(saved.completedSections, 1); assert.equal(saved.diagnostic, 'skipped');
assert.equal(p.diagnosticAction(saved).path, '/diagnostic'); assert.equal(saved.target, 7);
record.diagnostic.status = 'complete'; store.set('aiIELTSCoach', JSON.stringify(record)); saved = p.readSavedPresentation(storage);
assert.equal(p.diagnosticAction(saved).path, '/diagnostic/results');
for (const metric of p.baselinePresentations(saved).filter(x => x.id.startsWith('M05-'))) { assert.equal(metric.value, null); assert.equal(metric.state, 'REQUIRES_VALID_DIAGNOSTIC'); }
assert.equal(p.baselinePresentations(saved).find(x => x.id === 'M08').value, null);
record.diagnostic.status = 'in_progress'; store.set('aiIELTSCoach', JSON.stringify(record));
assert.equal(p.baselinePresentations(p.readSavedPresentation(storage)).find(x => x.id === 'M03').state, 'IN_PROGRESS');
store.set('aiIELTSCoach', '{bad'); const error = p.readSavedPresentation(storage);
assert.equal(error.state, 'TEMP_UNAVAILABLE'); assert.equal(error.target, null);
assert.equal(p.baselinePresentations(error).find(x => x.id === 'M05-READING').state, 'TEMP_UNAVAILABLE');
assert.equal(p.readSavedPresentation(denied).state, 'TEMP_UNAVAILABLE');
store.delete('aiIELTSCoach'); store.set('ai_ielts_onboarding_state', JSON.stringify({ ieltsType: 'General Training', targetBand: 6.5 }));
assert.equal(p.readSavedPresentation(storage).track, 'General Training');
assert.deepEqual(p.futurePresentations.map(x => x.id), ['M12','M13','M14','M15','M16','M17']);
assert.ok(p.futurePresentations.every(x => x.value === null && x.state === 'UNSUPPORTED'));
assert.equal(p.readSavedHistory(storage).state, 'EMPTY');
store.set('ielts-learning-v2', '{bad'); assert.equal(p.readSavedHistory(storage).state, 'TEMP_UNAVAILABLE');
store.set('ielts-learning-v2', JSON.stringify({ attempts: [{id:'a',module:'Reading',mode:'test',submittedAt:'2026-10-26T10:00:00Z',answers:{private:'do not expose'}},{id:'a',module:'Reading',mode:'test',submittedAt:'2026-10-26T10:00:00Z'},{id:'b',module:'Reading',mode:'test',submittedAt:'bad'}] }));
const history = p.readSavedHistory(storage); assert.equal(history.entries.length, 1); assert.equal(JSON.stringify(history).includes('do not expose'), false);
const available = p.navigationGroups.flatMap(group => group.items).filter(x => x.availability === 'AVAILABLE');
assert.equal(new Set(available.map(x => x.path)).size, 14); assert.ok(available.some(x => x.path === '/exam'));
const future = p.navigationGroups.flatMap(group => group.items).filter(x => x.availability === 'COMING_SOON'); assert.equal(future.length, 4); assert.ok(future.every(x => x.path === null));
const h = React.createElement; const render = element => renderToStaticMarkup(h(MemoryRouter, { initialEntries: ['/dashboard'] }, h(p.AppearanceProvider, null, element)));
// Router emits its documented SSR layout-effect warning; rendering is only a structural assertion.
const originalError = console.error; console.error = (message, ...args) => { if (!String(message).includes('useLayoutEffect does nothing on the server')) originalError(message, ...args); };
const nav = render(h(p.SidebarNavigation, { onNavigate() {} })); assert.equal((nav.match(/aria-disabled="true"/g) || []).length, 4); assert.ok(!nav.includes('href="/ted"')); assert.ok(nav.includes('aria-current="page"'));
const metric = render(h(p.AvailabilityCard, { metric: p.futurePresentations[0] })); assert.ok(metric.includes('data-state="UNSUPPORTED"')); assert.ok(!metric.includes('0%'));
const appearance = render(h(p.AppearanceControl)); assert.ok(appearance.includes('aria-label="Appearance"')); assert.ok(appearance.includes('value="system"'));
const strict = render(h(p.AppShell, {mode:'test'}, h('p',null,'Independent'))); assert.ok(!strict.includes('Main navigation')); assert.ok(!strict.includes('Ask your coach')); assert.ok(strict.includes('assistance disabled'));
// A completed legacy diagnostic must not release estimated module bands.
store.set('aiIELTSCoach', JSON.stringify({ ...record, diagnostic: { ...record.diagnostic, status: 'complete' } }));
store.set('ielts-learning-v2', JSON.stringify({ attempts: [] }));
for (const module of ['Reading','Writing','Listening','Speaking']) {
 const html = render(h(p.ModuleAssessmentStatus, {module, targetBand:7}));
 assert.ok(html.includes('Validation pending'),module);
 assert.ok(!html.includes('Current estimate') && !html.includes('8.5'),module);
}
console.error = originalError;
// Contrast checks use the actual provisional semantic token pairs in both themes.
const css = fs.readFileSync('src/foundation.css','utf8');
function luminance(hex) { const rgb=hex.replace('#',''); const full=rgb.length===3?rgb.split('').map(x=>x+x).join(''):rgb; return full.match(/../g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0); }
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for (const block of [css.match(/:root\s*\{([^}]+)/)[1],css.match(/:root\[data-theme=dark\]\s*\{([^}]+)/)[1]]) {
 const tokens=Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[\da-f]{3,6})\s*;/gi)].map(m=>[m[1],m[2]]));
 for (const [a,b] of [['--color-text','--color-surface'],['--color-muted','--color-surface'],['--color-on-action','--color-action'],['--color-text','--color-soft']]) assert.ok(contrast(tokens[a],tokens[b])>=4.5,`${a}/${b}`);
 assert.ok(contrast(tokens['--color-control-border'],tokens['--color-surface'])>=3,'Control boundary contrast');
}
assert.ok(css.includes('prefers-reduced-motion')); assert.ok(css.includes('forced-colors')); assert.ok(css.includes('@supports (backdrop-filter'));
assert.equal(fs.readFileSync('src/main.tsx','utf8').includes('diagnostic-question-bank'),false);
assert.equal(fs.readFileSync('src/features/Modules.tsx','utf8').includes('moduleScores[module].band'),false);
assert.ok(fs.readFileSync('vite.config.ts','utf8').includes('**/docs/**'));
assert.equal(fs.readFileSync('src/features/Learning.tsx','utf8').includes('state.mastery[l.check.skill]}%'),false);
assert.equal(before.get('aiIELTSCoach').includes('8.5'), true); // Synthetic legacy payload retained; never migrated by presentation.

// Onboarding recovery advances to the first remaining invalid control without mutating input.
const draftProfile = { user:{firstName:'',studyContext:''}, onboarding:{reason:'',selfAssessment:''} };
let issue=p.onboardingIssue(draftProfile,1); assert.equal(issue.field,'firstName');
let focused='';
const root={querySelector(selector){return {matches(){return !selector.includes('reason')},focus(){focused=selector},querySelector(){return {focus(){focused='first reason choice'}}}}}};
p.focusOnboardingIssue(root,issue); assert.ok(focused.includes('firstName'));
draftProfile.user.firstName='Kept name';issue=p.onboardingIssue(draftProfile,1);assert.equal(issue.field,'studyContext');p.focusOnboardingIssue(root,issue);assert.ok(focused.includes('studyContext'));assert.equal(draftProfile.user.firstName,'Kept name');
draftProfile.user.studyContext='Preparing independently';assert.equal(p.onboardingIssue(draftProfile,1),null);
issue=p.onboardingIssue(draftProfile,2);p.focusOnboardingIssue(root,issue);assert.equal(focused,'first reason choice');
draftProfile.onboarding.reason='Personal goal';assert.equal(p.onboardingIssue(draftProfile,2),null);
assert.equal(p.onboardingIssue(draftProfile,4).field,'selfAssessment');draftProfile.onboarding.selfAssessment='B1';assert.equal(p.onboardingIssue(draftProfile,4),null);

console.log('PASS: appearance persistence/system/failure, read-only evidence/null gating, all metric IDs, navigation/unavailable states, strict shell, component semantics and provisional token contrast.');
