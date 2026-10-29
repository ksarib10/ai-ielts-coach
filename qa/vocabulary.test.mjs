import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';

buildSync({
  stdin: {
    contents: `
      export * from './src/features/vocabulary';
      export * from './src/features/discovery/routes';
      export * from './src/features/discovery/services/catalog';
      export * from './src/features/discovery/screens/LearnCatalog';
      export { AppearanceProvider } from './src/features/appearance/hooks/AppearanceProvider';
    `,
    resolveDir: process.cwd(),
    loader: 'ts'
  },
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'cjs',
  outfile: 'qa/.vocabulary-test.cjs',
  logLevel: 'silent'
});

const require = createRequire(import.meta.url);
const v = require('./.vocabulary-test.cjs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');

const oldError = console.error;
console.error = (m, ...a) => {
  if (!String(m).includes('useLayoutEffect does nothing on the server')) oldError(m, ...a);
};

const render = (el, initialEntries = ['/learn/vocabulary/all']) =>
  renderToStaticMarkup(
    React.createElement(
      v.AppearanceProvider,
      null,
      React.createElement(MemoryRouter, { initialEntries }, el)
    )
  );

// 1. Verify 8 approved mock JSON fixtures exist and match expected structures
const mockFiles = [
  'mock_oxford_card.json',
  'mock_awl_group.json',
  'mock_idiom_card.json',
  'mock_linking_card.json',
  'mock_phrasal_card.json',
  'mock_variant_card.json',
  'mock_search_results.json',
  'mock_credits_entry.json'
];
for (const fname of mockFiles) {
  const fpath = path.join('src/fixtures/mockData', fname);
  assert.ok(fs.existsSync(fpath), `Missing mock fixture ${fpath}`);
}

// Verify no private_canonical_samples or raw CSVs exist in src/ or public/
function listAllRepoFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listAllRepoFiles(full));
    else results.push(full);
  }
  return results;
}
for (const f of [...listAllRepoFiles('src'), ...listAllRepoFiles('public')]) {
  assert.ok(!f.includes('private_canonical'), `Private canonical sample leaked in ${f}`);
  assert.ok(!f.endsWith('.csv'), `Raw CSV leaked in ${f}`);
}

// 2. Test Projection Adapters
assert.equal(v.SYNTHETIC_OXFORD_ENTRIES.length, 20);
for (const entry of v.SYNTHETIC_OXFORD_ENTRIES) {
  const ui = v.adaptCanonicalOxfordToUI(entry);
  assert.equal(ui.id, entry.entry_id);
  assert.equal(ui.word, entry.headword_clean);
  assert.equal(ui.cefr_level, entry.cefr_level);
  assert.equal(ui.pos_code, entry.pos_code);
  assert.equal(ui.audio_status, 'none');
  assert.equal(ui.example_sentences.length, 1);
  assert.ok(ui.collocations.length >= 2);
}

const uiIdiom = v.adaptCanonicalIdiomToUI(v.SYNTHETIC_IDIOM_CARD);
assert.equal(uiIdiom.id, 'MOCK_IDI_001_synthetic_break_the_ice');
assert.equal(uiIdiom.difficulty, 'Intermediate');

const uiLinking = v.adaptCanonicalLinkingToUI(v.SYNTHETIC_LINKING_CARD);
assert.equal(uiLinking.id, 'MOCK_LNK_001_synthetic_furthermore');
assert.equal(uiLinking.example_sentences.length, 2);

const uiPhrasal = v.adaptCanonicalPhrasalToUI(v.SYNTHETIC_PHRASAL_CARD);
assert.equal(uiPhrasal.id, 'MOCK_PV_001_synthetic_carry_out');
assert.equal(uiPhrasal.separable, true);

const uiVariant = v.adaptCanonicalVariantToUI(v.SYNTHETIC_VARIANT_CARD);
assert.equal(uiVariant.id, 'MOCK_VAR_001_synthetic_crisps_chips');
assert.ok(uiVariant.regional_variation_notice.includes('Regional Terminology & Spelling'));

const resolvedAWL = v.resolveAWLStudyGroup(
  v.SYNTHETIC_AWL_GROUP,
  1,
  new Map(v.SYNTHETIC_AWL_GROUP.families.map((f) => [f.family_id, f]))
);
assert.equal(resolvedAWL.families_count, 10);
assert.equal(resolvedAWL.families.length, 10);

// 3. Test Provider Search, Filtering, Alias Matching, Sorting, Pagination & Detail Resolution
await (async () => {
  const provider = v.defaultMockResourceBankProvider;

  // 3a. Base 3 mock search items detail resolution (Oxford, AWL, Idiom)
  for (const baseItem of v.BASE_MOCK_SEARCH_ITEMS) {
    const res = await provider.resolveSearchItemDetail(baseItem);
    assert.equal(res.status, 'FOUND', `Failed to resolve ${baseItem.id}`);
    assert.ok(res.data);
    assert.equal(res.attribution.source_id, 'MOCK_SRC_OPEN_ACADEMIC_01');
  }

  // 3b. Resolve all 20 synthetic Oxford entries by ID
  for (const entry of v.SYNTHETIC_OXFORD_ENTRIES) {
    const res = await provider.resolveWordDetail(entry.entry_id);
    assert.equal(res.status, 'FOUND');
    assert.equal(res.data.word, entry.headword_clean);
  }
  const missingRes = await provider.resolveWordDetail('NONEXISTENT_ID');
  assert.equal(missingRes.status, 'NOT_FOUND');

  // 3c. Audit Finding #7 check: impossible POS and pageSize: 1 must return 0 matches and pageSize: 1
  const impossiblePosRes = await provider.search({
    term: '',
    filters: { pos: ['ImpossiblePOS'], entityType: ['oxford'] },
    page: 1,
    pageSize: 1
  });
  assert.equal(impossiblePosRes.totalMatches, 0);
  assert.equal(impossiblePosRes.items.length, 0);
  assert.equal(impossiblePosRes.pageSize, 1);
  assert.equal(impossiblePosRes.totalPages, 0);

  // 3d. Empty Letter 'X' check
  const letterXRes = await provider.search({
    term: '',
    filters: { letter: 'X', entityType: ['oxford'] }
  });
  assert.equal(letterXRes.totalMatches, 0);
  assert.equal(letterXRes.items.length, 0);

  // 3e. Letter filter check ('C' -> coherent, commute)
  const letterCRes = await provider.search({
    term: '',
    filters: { letter: 'C', entityType: ['oxford'] }
  });
  assert.equal(letterCRes.totalMatches, 2);
  assert.deepEqual(
    letterCRes.items.map((i) => i.term),
    ['coherent', 'commute']
  );

  // 3f. Alias search check ('attain' -> achieve; 'omnipresent' -> ubiquitous)
  const aliasRes1 = await provider.search({
    term: 'attain',
    filters: { entityType: ['oxford'] }
  });
  assert.equal(aliasRes1.totalMatches, 1);
  assert.equal(aliasRes1.items[0].term, 'achieve');

  const aliasRes2 = await provider.search({
    term: 'omnipresent',
    filters: { entityType: ['oxford'] }
  });
  assert.equal(aliasRes2.totalMatches, 1);
  assert.equal(aliasRes2.items[0].term, 'ubiquitous');

  // 3g. CEFR filter check ('C1' -> 6 entries)
  const cefrC1Res = await provider.search({
    term: '',
    filters: { cefr: ['C1'], entityType: ['oxford'] }
  });
  assert.equal(cefrC1Res.totalMatches, 6);
  assert.ok(cefrC1Res.items.every((i) => i.cefr_level === 'C1'));

  // 3h. POS filter check ('Verb' and 'v' -> 5 entries)
  const posVerbRes = await provider.search({
    term: '',
    filters: { pos: ['Verb'], entityType: ['oxford'] }
  });
  assert.equal(posVerbRes.totalMatches, 5);
  const posCodeVRes = await provider.search({
    term: '',
    filters: { pos: ['v'], entityType: ['oxford'] }
  });
  assert.equal(posCodeVRes.totalMatches, 5);

  // 3i. Edition filter check ('USEnglish' -> 6 entries, 'UKEnglish' -> 14 entries)
  const usRes = await provider.search({
    term: '',
    filters: { edition: ['USEnglish'], entityType: ['oxford'] }
  });
  assert.equal(usRes.totalMatches, 6);
  const ukRes = await provider.search({
    term: '',
    filters: { edition: ['UKEnglish'], entityType: ['oxford'] }
  });
  assert.equal(ukRes.totalMatches, 14);

  // 3j. Skill & SkillEvidence filter check
  const proposedRes = await provider.search({
    term: '',
    filters: { skillEvidence: 'proposed_unreviewed', entityType: ['oxford'] }
  });
  assert.equal(proposedRes.totalMatches, 3);
  assert.deepEqual(
    proposedRes.items.map((i) => i.term),
    ['bolster', 'inevitably', 'ubiquitous']
  );

  // 3k. Sorting checks (alphabetical desc, cefr asc/desc)
  const descAlpha = await provider.search({
    term: '',
    filters: { entityType: ['oxford'] },
    sortBy: 'alphabetical',
    sortOrder: 'desc',
    pageSize: 20
  });
  assert.equal(descAlpha.items[0].term, 'whereas');
  assert.equal(descAlpha.items.at(-1).term, 'achieve');

  const ascCefr = await provider.search({
    term: '',
    filters: { entityType: ['oxford'] },
    sortBy: 'cefr',
    sortOrder: 'asc',
    pageSize: 20
  });
  assert.equal(ascCefr.items[0].cefr_level, 'A1');
  assert.equal(ascCefr.items.at(-1).cefr_level, 'C1');

  // 3l. Pagination checks (20 items with pageSize: 6 -> 4 pages)
  const page1 = await provider.search({
    term: '',
    filters: { entityType: ['oxford'] },
    page: 1,
    pageSize: 6
  });
  assert.equal(page1.items.length, 6);
  assert.equal(page1.totalMatches, 20);
  assert.equal(page1.totalPages, 4);
  assert.equal(page1.hasMore, true);

  const page4 = await provider.search({
    term: '',
    filters: { entityType: ['oxford'] },
    page: 4,
    pageSize: 6
  });
  assert.equal(page4.items.length, 2);
  assert.equal(page4.totalMatches, 20);
  assert.equal(page4.totalPages, 4);
  assert.equal(page4.hasMore, false);
})();

// 4. Test UI Screen Rendering & States
const hubHtml = render(React.createElement(v.VocabularyHubScreen), ['/learn/category/vocabulary']);
assert.ok(hubHtml.includes('Vocabulary Hub'));
assert.ok(hubHtml.includes('All Vocabulary Explorer'));
assert.ok(hubHtml.includes('MOCK_DATA_ONLY'));
assert.ok(hubHtml.includes('OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF'));
assert.ok(hubHtml.includes('QUARANTINED_RESEARCH_ONLY'));
assert.ok(hubHtml.includes('/learn/vocabulary/all'));

const explorerDefaultHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, { forceTTSAvailable: true })
);
assert.ok(explorerDefaultHtml.includes('All Vocabulary Explorer'));
assert.ok(explorerDefaultHtml.includes('achieve'));
assert.ok(explorerDefaultHtml.includes('Pronounce (Browser TTS · UK)'));
assert.ok(explorerDefaultHtml.includes('Page'));

const explorerNoTTSHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, { forceTTSAvailable: false })
);
assert.ok(explorerNoTTSHtml.includes('Audio Unavailable (Mock Mode)'));
assert.ok(explorerNoTTSHtml.includes('aria-disabled="true"'));

const explorerExpandedHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, {
    initialExpandedId: 'MOCK_OXF_001_synthetic_achieve'
  })
);
assert.ok(explorerExpandedHtml.includes('Contextual Example Sentences'));
assert.ok(explorerExpandedHtml.includes('Common Academic Collocations'));
assert.ok(explorerExpandedHtml.includes('achieve a goal'));

const explorerLetterXHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, { initialLetter: 'X' })
);
assert.ok(explorerLetterXHtml.includes('No Oxford vocabulary entries begin with the letter X'));

const explorerEmptyQueryHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, { initialQuery: 'zzzz_nonexistent_word' })
);
assert.ok(
  explorerEmptyQueryHtml.includes('No synthetic vocabulary entries match your active filters')
);

const explorerLoadingHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, { initialSimulatedState: 'loading' })
);
assert.ok(explorerLoadingHtml.includes('Loading synthetic vocabulary entries'));

const explorerErrorHtml = render(
  React.createElement(v.AllVocabularyExplorerScreen, { initialSimulatedState: 'error' })
);
assert.ok(explorerErrorHtml.includes('Vocabulary Explorer could not load entries'));
assert.ok(explorerErrorHtml.includes('Retry loading'));

// 5. Hardened Build-Asset Guard Adversarial Tests (Audit Finding #6 verification)
function runPythonGuard(targetDir, extraArgs = []) {
  return spawnSync('python', ['scripts/verify_build_assets.py', '--dir', targetDir, ...extraArgs], {
    encoding: 'utf-8'
  });
}

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ielts-build-guard-test-'));
try {
  // 5a. Missing build directory -> exit code 1
  const missingDirRes = runPythonGuard(path.join(tmpRoot, 'does-not-exist'));
  assert.equal(missingDirRes.status, 1);
  assert.ok(missingDirRes.stdout.includes('MISSING_BUILD_DIRECTORY'));

  // 5b. Empty build directory -> exit code 1
  const emptyDir = path.join(tmpRoot, 'empty-dist');
  fs.mkdirSync(emptyDir);
  const emptyDirRes = runPythonGuard(emptyDir);
  assert.equal(emptyDirRes.status, 1);
  assert.ok(emptyDirRes.stdout.includes('EMPTY_BUILD_DIRECTORY'));

  // Helper to create a clean baseline dist folder
  function makeCleanDist(name) {
    const d = path.join(tmpRoot, name);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, 'index.html'), '<!doctype html><html><body>Clean</body></html>');
    fs.writeFileSync(path.join(d, 'app.js'), 'console.log("hello synthetic world");');
    fs.copyFileSync(
      'src/fixtures/mockData/mock_oxford_card.json',
      path.join(d, 'mock_oxford_card.json')
    );
    return d;
  }

  // 5c. Clean build passes -> exit code 0
  const cleanDir = makeCleanDist('clean-dist');
  const cleanRes = runPythonGuard(cleanDir);
  assert.equal(cleanRes.status, 0, cleanRes.stdout);

  // 5d. Protected OXF_ENT_* canonical ID in JS -> exit code 1
  const oxfIdDir = makeCleanDist('oxf-id-dist');
  fs.writeFileSync(path.join(oxfIdDir, 'leaked.js'), 'const id = "OXF_ENT_UK_april_n_a1";');
  const oxfIdRes = runPythonGuard(oxfIdDir);
  assert.equal(oxfIdRes.status, 1);
  assert.ok(oxfIdRes.stdout.includes('EMBEDDED_PROPRIETARY_DATA'));

  // 5e. Unexpected words.json -> exit code 1
  const wordsJsonDir = makeCleanDist('words-json-dist');
  fs.writeFileSync(path.join(wordsJsonDir, 'words.json'), '{"hello":"world"}');
  const wordsJsonRes = runPythonGuard(wordsJsonDir);
  assert.equal(wordsJsonRes.status, 1);
  assert.ok(wordsJsonRes.stdout.includes('UNEXPECTED_DATA_ASSET'));

  // 5f. Fake mock_secret.json -> exit code 1
  const fakeMockDir = makeCleanDist('fake-mock-dist');
  fs.writeFileSync(path.join(fakeMockDir, 'mock_secret.json'), '{"secret":true}');
  const fakeMockRes = runPythonGuard(fakeMockDir);
  assert.equal(fakeMockRes.status, 1);
  assert.ok(fakeMockRes.stdout.includes('UNTRUSTED_MOCK_FILE'));

  // 5g. Adversarial Case 1 (Audit Finding #6): study_content.zip -> exit code 1
  const zipDir = makeCleanDist('zip-dist');
  // Valid minimal ZIP header (PK\x03\x04)
  fs.writeFileSync(
    path.join(zipDir, 'study_content.zip'),
    Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00])
  );
  const zipRes = runPythonGuard(zipDir);
  assert.equal(zipRes.status, 1);
  assert.ok(zipRes.stdout.includes('COMPRESSED_OR_BINARY_CONTAINER_PAYLOAD'));

  // 5h. Adversarial Case 2 (Audit Finding #6): gzip payload in assets.dat -> exit code 1
  const gzipDatDir = makeCleanDist('gzip-dat-dist');
  const gzPayload = zlib.gzipSync(Buffer.from('{"secret":"canonical_data"}', 'utf-8'));
  fs.writeFileSync(path.join(gzipDatDir, 'assets.dat'), gzPayload);
  const gzipDatRes = runPythonGuard(gzipDatDir);
  assert.equal(gzipDatRes.status, 1);
  assert.ok(gzipDatRes.stdout.includes('COMPRESSED_OR_BINARY_CONTAINER_PAYLOAD'));

  // 5i. Adversarial Case 3 (Audit Finding #6): arbitrary segment.bin -> exit code 1
  const binDir = makeCleanDist('bin-dist');
  fs.writeFileSync(path.join(binDir, 'segment.bin'), Buffer.from([0xde, 0xad, 0xbe, 0xef]));
  const binRes = runPythonGuard(binDir);
  assert.equal(binRes.status, 1);
  assert.ok(
    binRes.stdout.includes('FORBIDDEN_FILE_PATTERN') ||
      binRes.stdout.includes('FORBIDDEN_ARCHIVE_OR_BINARY_PAYLOAD')
  );

  // 5j. Adversarial Case 4: Gzip payload disguised as bundle.js -> exit code 1
  const disguisedJsDir = makeCleanDist('disguised-js-dist');
  fs.writeFileSync(path.join(disguisedJsDir, 'disguised.js'), gzPayload);
  const disguisedJsRes = runPythonGuard(disguisedJsDir);
  assert.equal(disguisedJsRes.status, 1);
  assert.ok(disguisedJsRes.stdout.includes('COMPRESSED_OR_BINARY_CONTAINER_PAYLOAD'));
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  fs.rmSync('qa/.vocabulary-test.cjs', { force: true });
}

console.error = oldError;
console.log(
  'PASS: Stage 4B Resource Bank adapters, 20-entry synthetic Vocabulary Explorer (A-Z, Empty Letter X, CEFR/POS/Edition/Skill filters, alias search, sorting, pagination, TTS/unavailable states, loading/error states) and hardened ZIP/gzip/binary build-asset guard.'
);
