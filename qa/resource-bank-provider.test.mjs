import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';

buildSync({
  stdin: {
    contents: `
      export * from './src/types/resourceBank';
      export * from './src/types/realResourceBankProvider';
      export * from './src/features/vocabulary/services/syntheticCatalog';
      export * from './src/features/vocabulary/services/resourceBankHooks';
    `,
    resolveDir: process.cwd(),
    loader: 'ts'
  },
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'cjs',
  outfile: 'qa/.rb-provider-test.cjs',
  logLevel: 'silent'
});

const require = createRequire(import.meta.url);
const rb = require('./.rb-provider-test.cjs');

const LOCAL_REPO_OUTPUTS = path.resolve(process.cwd(), 'Learning-data-preprocessing-automation/OUTPUTS');
const ONEDRIVE_FALLBACK = 'C:/Users/ksari/OneDrive/Desktop/Learning-data-preprocessing-automation/OUTPUTS';

const PRIVATE_OUTPUTS_ROOT =
  process.env.IELTS_RESOURCE_BANK_OUTPUTS_ROOT ||
  (fs.existsSync(LOCAL_REPO_OUTPUTS) ? LOCAL_REPO_OUTPUTS : ONEDRIVE_FALLBACK);

const SUBSETS_DIR = path.join(PRIVATE_OUTPUTS_ROOT, '03_subsets');
const HANDOFF_DIR = path.join(PRIVATE_OUTPUTS_ROOT, '04_handoff');

function createDiskShardTransport() {
  let bytesReadTotal = 0;
  const transport = async (relativePath, options) => {
    if (options?.signal?.aborted) {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      throw err;
    }
    const cleanRel = relativePath.replace(/^\/+/, '');
    if (cleanRel.includes('quarantine') || cleanRel.includes('idioms_grouped')) {
      throw new Error(`HTTP 403 Forbidden: Quarantined resource blocked (${cleanRel})`);
    }
    const candidateHandoff = path.join(HANDOFF_DIR, cleanRel);
    const candidateSubsets = path.join(SUBSETS_DIR, cleanRel);
    const resolved = fs.existsSync(candidateHandoff)
      ? candidateHandoff
      : fs.existsSync(candidateSubsets)
        ? candidateSubsets
        : null;
    if (!resolved) {
      throw new Error(`HTTP 404 Not Found: Shard not found (${cleanRel})`);
    }
    const buf = fs.readFileSync(resolved);
    bytesReadTotal += buf.byteLength;
    return JSON.parse(buf.toString('utf-8'));
  };
  return {
    transport,
    getBytesRead: () => bytesReadTotal,
    resetBytesRead: () => {
      bytesReadTotal = 0;
    }
  };
}

try {
  // ============================================================================
  // 1. BOUNDED LRU CACHE & VERSION INVALIDATION UNIT TESTS
  // ============================================================================
  const lru = new rb.BoundedShardLRUCache(5, 60_000, 'stage_4b_v2.2');
  for (let i = 1; i <= 7; i++) {
    lru.set(`shard_${i}.json`, { shard: i }, 1000 + i);
  }
  const statsAfter7 = lru.getStats();
  assert.equal(statsAfter7.size, 5, 'LRU cache must bound resident shards to maxEntries (5)');
  assert.equal(statsAfter7.evictions, 2, 'LRU cache must record 2 evictions after 7 insertions');
  assert.equal(lru.get('shard_1.json', 2000), undefined, 'Oldest shard_1 must be evicted');
  assert.deepEqual(lru.get('shard_3.json', 2000), { shard: 3 }, 'shard_3 must still be resident');

  // Version sync invalidation
  const invalidated = lru.syncVersion('stage_4b_v2.3');
  assert.equal(invalidated, true);
  assert.equal(lru.getStats().size, 0, 'Version change must clear all cached shards');
  assert.equal(lru.getStats().versionInvalidations, 5);

  // ============================================================================
  // 2. REAL RESOURCE BANK INTEGRATION TESTS (11,797 ENTITIES)
  // ============================================================================
  assert.ok(
    fs.existsSync(SUBSETS_DIR) && fs.existsSync(HANDOFF_DIR),
    `Expected Stage 3/4 outputs at ${PRIVATE_OUTPUTS_ROOT}`
  );

  await (async () => {
    const disk = createDiskShardTransport();
    const provider = rb.createRealResourceBankProvider({
      baseUrl: '/api/private-data',
      transport: disk.transport,
      enableCache: true,
      maxShardsInMemory: 5,
      cacheTtlMs: 300_000,
      accessTier: 'INTERNAL_DEV_ONLY'
    });

    // --------------------------------------------------------------------------
    // 2A. LAZY FIRST-PAGE LOADING GATE (No 13 MB download on initial page load)
    // --------------------------------------------------------------------------
    const page1Res = await provider.search({
      term: '',
      filters: { entityType: ['oxford'] },
      page: 1,
      pageSize: 6,
      sortBy: 'alphabetical',
      sortOrder: 'asc'
    });
    const diagAfterPage1 = provider.getDiagnostics();
    assert.equal(page1Res.totalMatches, 10270, 'Oxford totalMatches on page 1 must equal 10,270');
    assert.equal(page1Res.items.length, 6, 'First page must return 6 items');
    assert.equal(page1Res.totalPages, Math.ceil(10270 / 6));
    assert.equal(
      diagAfterPage1.isGlobalSearchIndexLoaded,
      false,
      'Global search index must NOT be loaded on initial alphabetical page 1 render'
    );
    assert.equal(
      diagAfterPage1.totalNetworkFetches,
      2,
      'Page 1 must only fetch search_manifest.json + a_part1.json (2 requests)'
    );
    assert.ok(
      disk.getBytesRead() < 500_000,
      `First page bytes read (${disk.getBytesRead()}) must be < 500 KB, never the 13 MB bank`
    );

    // Resolve the 6 items on page 1 via resolveWordDetail
    for (const item of page1Res.items) {
      const detailRes = await provider.resolveWordDetail(item.id);
      assert.equal(detailRes.status, 'FOUND', `Failed to resolve page 1 word ${item.id}`);
      assert.ok(detailRes.data.word.length > 0);
      assert.ok(detailRes.provenance?.source_file);
    }

    // --------------------------------------------------------------------------
    // 2B. EMPTY LETTER 'X' GATE (Zero network requests)
    // --------------------------------------------------------------------------
    const fetchesBeforeX = provider.getDiagnostics().totalNetworkFetches;
    const letterXRes = await provider.search({
      term: '',
      filters: { letter: 'X', entityType: ['oxford'] }
    });
    const fetchesAfterX = provider.getDiagnostics().totalNetworkFetches;
    assert.equal(letterXRes.totalMatches, 0);
    assert.equal(letterXRes.items.length, 0);
    assert.equal(
      fetchesAfterX,
      fetchesBeforeX,
      'Empty letter X must return immediately with 0 network requests'
    );

    // --------------------------------------------------------------------------
    // 2C. MANIFEST COUNTS & QUARANTINE ENFORCEMENT
    // --------------------------------------------------------------------------
    const rbManifest = await provider.getResourceBankManifest();
    const byColId = new Map(rbManifest.collections.map((c) => [c.collection_id, c]));
    assert.equal(byColId.get('COLL_OXF_VOCAB').records_count, 10270);
    assert.equal(byColId.get('COLL_AWL_ACADEMIC').records_count, 570);
    assert.equal(byColId.get('COLL_IDIOMS_CURATED').records_count, 122);
    assert.equal(byColId.get('COLL_LINKING_WORDS').records_count, 100);
    assert.equal(byColId.get('COLL_PHRASAL_VERBS').records_count, 129);
    assert.equal(byColId.get('COLL_VARIANTS_REGIONAL').records_count, 606);
    assert.equal(
      byColId.get('COLL_IDIOMS_QUARANTINED').rights_status,
      'QUARANTINED_COPYRIGHT_RISK_PERMANENTLY_BLOCKED'
    );

    // Verify quarantine path is blocked by transport
    await assert.rejects(
      () => disk.transport('quarantine/idioms_grouped_quarantine_manifest.json'),
      /HTTP 403 Forbidden/
    );

    const searchManifest = await provider.getSearchIndexManifest();
    assert.equal(searchManifest.metadata.total_indexed_entities, 11797);
    assert.equal(searchManifest.statistics.by_entity_type.oxford, 10270);
    assert.equal(searchManifest.statistics.by_entity_type.awl, 570);
    assert.equal(searchManifest.statistics.by_entity_type.idiom, 122);
    assert.equal(searchManifest.statistics.by_entity_type.linking_word, 100);
    assert.equal(searchManifest.statistics.by_entity_type.phrasal_verb, 129);
    assert.equal(searchManifest.statistics.by_entity_type.variant_pair, 606);
    assert.ok(
      searchManifest.metadata.empty_letters.some((l) => l.toLowerCase().startsWith('x'))
    );

    // --------------------------------------------------------------------------
    // 2D. COUNT-CHECKED COLLECTIONS & ZERO BROKEN REFERENCES
    // --------------------------------------------------------------------------
    // 1. 122 Curated Idioms + Separate Difficulty Dimension
    const allIdioms = await provider.getIdioms();
    assert.equal(allIdioms.length, 122, 'Must load exactly 122 curated idioms');
    const easyIdioms = await provider.getIdioms('Easy');
    const interIdioms = await provider.getIdioms('Intermediate');
    const advIdioms = await provider.getIdioms('Advanced');
    assert.equal(easyIdioms.length, 57);
    assert.equal(interIdioms.length, 55);
    assert.equal(advIdioms.length, 10);

    // Search idioms by difficulty dimension (separate from CEFR)
    const searchAdvIdioms = await provider.search({
      term: '',
      filters: { difficulty: ['Advanced'] },
      pageSize: 50
    });
    assert.equal(searchAdvIdioms.totalMatches, 10);
    assert.ok(
      searchAdvIdioms.items.every(
        (i) => i.entity_type === 'idiom' && i.difficulty === 'Advanced' && i.cefr_level === null
      )
    );

    // 2. 100 Linking Words (Connectors)
    const allLinking = await provider.getLinkingWords();
    assert.equal(allLinking.length, 100, 'Must load exactly 100 linking words');
    const contrastLinking = await provider.getLinkingWords('Contrast');
    assert.equal(contrastLinking.length, 20);

    // 3. 129 Phrasal Verbs
    const allPhrasal = await provider.getPhrasalVerbs();
    assert.equal(allPhrasal.length, 129, 'Must load exactly 129 phrasal verbs');

    // 4. 606 Regional Variants + Split Provenance Resolver (part1 & part2)
    const allVariants = await provider.getRegionalVariants();
    assert.equal(allVariants.length, 606, 'Must load exactly 606 regional variant pairs');
    assert.ok(
      allVariants.every(
        (v) =>
          v.british_word.length >= 1 &&
          v.american_word.length >= 1 &&
          v.british_variants.length >= 1 &&
          v.american_variants.length >= 1
      ),
      'Every UIVariantCard must populate non-empty british_word/variants and american_word/variants'
    );

    // Verify provenance resolver across both part1 (VAR_PAIR_001..303) and part2 (VAR_PAIR_304..606)
    const prov1 = await provider.resolveVariantProvenance('VAR_PAIR_001_food_crisps');
    const prov606 = await provider.resolveVariantProvenance('VAR_PAIR_606_nature_lucky_dip');
    assert.ok(prov1?.provenance?.source_file, 'Part 1 variant provenance must resolve');
    assert.ok(prov606?.provenance?.source_file, 'Part 2 variant provenance must resolve');

    // 5. 570 AWL Families & 57 10-Family Study Groups
    const awlManifest = await provider.getAWLManifest();
    assert.equal(awlManifest.metadata.total_families, 570);
    assert.equal(awlManifest.metadata.total_study_groups_10, 57);

    let totalAWLFamiliesLoaded = 0;
    let totalAWLGroupsResolved = 0;
    for (const subMeta of awlManifest.sublists) {
      const families = await provider.getAWLSublist(subMeta.sublist);
      assert.equal(families.length, subMeta.family_count);
      totalAWLFamiliesLoaded += families.length;

      const paddedSub = String(subMeta.sublist).padStart(2, '0');
      for (let g = 1; g <= subMeta.study_group_count; g++) {
        const paddedGrp = String(g).padStart(2, '0');
        const grpId = ['AWL', 'GRP', `s${paddedSub}`, `g${paddedGrp}`].join('_');
        const resolvedGrp = await provider.getAWLStudyGroup(grpId);
        assert.equal(resolvedGrp.families_count, 10);
        assert.equal(resolvedGrp.families.length, 10);
        totalAWLGroupsResolved += 1;
      }
    }
    assert.equal(totalAWLFamiliesLoaded, 570, 'All 10 AWL sublists must total 570 families');
    assert.equal(totalAWLGroupsResolved, 57, 'All 57 AWL study groups must resolve cleanly');

    // 6. Verify all 11,797 search index items have valid target_file and 0 broken references
    const allSearchRes = await provider.search({
      term: '',
      page: 1,
      pageSize: 12000
    });
    assert.equal(allSearchRes.totalMatches, 11797);
    assert.equal(allSearchRes.items.length, 11797);

    // Group all 11,797 search items by target_file and verify every single ID resolves in its target shard
    const itemsByTarget = new Map();
    for (const item of allSearchRes.items) {
      assert.ok(item.target_file, `Search item ${item.id} missing target_file`);
      if (!itemsByTarget.has(item.target_file)) {
        itemsByTarget.set(item.target_file, []);
      }
      itemsByTarget.get(item.target_file).push(item);
    }

    let verifiedResolvedCount = 0;
    for (const [targetFile, items] of itemsByTarget.entries()) {
      const shardPayload = await disk.transport(targetFile);
      for (const item of items) {
        const res = rb.resolveSearchItemFromPayload(item, shardPayload);
        assert.equal(
          res.status,
          'FOUND',
          `Broken reference: ${item.id} (${item.entity_type}) failed to resolve in ${targetFile}: ${res.error}`
        );
        assert.ok(res.data, `Missing projected UI data for ${item.id}`);
        verifiedResolvedCount += 1;
      }
    }
    assert.equal(
      verifiedResolvedCount,
      11797,
      'Every single one of the 11,797 search items must resolve with 0 broken references'
    );

    // Also test end-to-end provider.resolveSearchItemDetail for a sample of each of the 6 entity types
    const sampleByEntity = ['oxford', 'awl', 'idiom', 'linking_word', 'phrasal_verb', 'variant_pair'].map(
      (et) => allSearchRes.items.find((i) => i.entity_type === et)
    );
    for (const sampleItem of sampleByEntity) {
      assert.ok(sampleItem);
      const detail = await provider.resolveSearchItemDetail(sampleItem);
      assert.equal(detail.status, 'FOUND');
      assert.ok(detail.data);
      assert.ok(
        detail.provenance,
        `Provenance must resolve for entity_type=${sampleItem.entity_type} (${sampleItem.id})`
      );
    }

    // --------------------------------------------------------------------------
    // 2E. DIRECT (source_tagged) VS PROPOSED (proposed_unreviewed) SKILL TAGS
    // --------------------------------------------------------------------------
    const expectedSkillPartitions = [
      { skill: 'Listening', direct: 5325, proposed: 606, all: 5931 },
      { skill: 'Reading', direct: 8787, proposed: 570, all: 9357 },
      { skill: 'Writing', direct: 9599, proposed: 1176, all: 10775 },
      { skill: 'Speaking', direct: 7628, proposed: 0, all: 7628 }
    ];
    for (const expected of expectedSkillPartitions) {
      const directRes = await provider.search({
        term: '',
        filters: { skill: expected.skill, skillEvidence: 'source_tagged' },
        pageSize: 1
      });
      const proposedRes = await provider.search({
        term: '',
        filters: { skill: expected.skill, skillEvidence: 'proposed_unreviewed' },
        pageSize: 1
      });
      const allSkillRes = await provider.search({
        term: '',
        filters: { skill: expected.skill },
        pageSize: 1
      });
      assert.equal(
        directRes.totalMatches,
        expected.direct,
        `${expected.skill} source_tagged count mismatch`
      );
      assert.equal(
        proposedRes.totalMatches,
        expected.proposed,
        `${expected.skill} proposed_unreviewed count mismatch`
      );
      assert.equal(
        allSkillRes.totalMatches,
        expected.all,
        `${expected.skill} combined count mismatch`
      );
    }

    // --------------------------------------------------------------------------
    // 2F. GLOBAL SUBSTRING, ALIAS & NUMERIC ('0-9') SEARCH
    // --------------------------------------------------------------------------
    const aliasSearch = await provider.search({
      term: 'chips'
    });
    assert.ok(aliasSearch.totalMatches >= 2);
    assert.ok(
      aliasSearch.items.some((i) => i.id === 'VAR_PAIR_001_food_crisps'),
      'Alias search for "chips" must match British headword "crisps" (VAR_PAIR_001_food_crisps) via search_aliases'
    );

    const numericSearch = await provider.search({
      term: '',
      filters: { letter: '0-9' }
    });
    assert.equal(numericSearch.totalMatches, 1);
    assert.equal(numericSearch.items[0].term, '18 (certificate) (UK) / R (rated) (US)');

    // --------------------------------------------------------------------------
    // 2G. BOUNDED LRU CACHE EVICTION & VERSION INVALIDATION ON PROVIDER
    // --------------------------------------------------------------------------
    const sampleOxfordFrom7Shards = [
      'OXF_ENT_UK_abandon_v_b2',
      'OXF_ENT_UK_baby_n_a1',
      'OXF_ENT_UK_cabinet_n_c1',
      'OXF_ENT_UK_daily_adj_a2',
      'OXF_ENT_UK_eager_adj_c1',
      'OXF_ENT_UK_fabric_n_b2',
      'OXF_ENT_UK_gain_n_b2'
    ];
    for (const id of sampleOxfordFrom7Shards) {
      const res = await provider.resolveWordDetail(id);
      assert.equal(res.status, 'FOUND', `Expected ${id} to resolve`);
    }
    const cacheStats = provider.getDiagnostics().shardCacheStats;
    assert.ok(
      cacheStats.size <= 5,
      `Provider shard cache size (${cacheStats.size}) must never exceed 5`
    );
    assert.ok(cacheStats.evictions >= 2, 'Resolving 7 distinct shards must evict at least 2 shards');

    provider.invalidateCache('stage_4b_v9.9');
    const postInvalidateStats = provider.getDiagnostics().shardCacheStats;
    assert.equal(postInvalidateStats.size, 0);
    assert.equal(postInvalidateStats.currentVersion, 'stage_4b_v9.9');

    // --------------------------------------------------------------------------
    // 2H. ABORTSIGNAL & NOT-FOUND RESILIENCE
    // --------------------------------------------------------------------------
    const abortCtrl = new AbortController();
    abortCtrl.abort();
    await assert.rejects(
      () => provider.search({ term: 'abandon', signal: abortCtrl.signal }),
      (err) => err instanceof Error && err.name === 'AbortError'
    );

    const notFoundRes = await provider.resolveWordDetail('OXF_ENT_UK_nonexistent_zzz_n_a1');
    assert.equal(notFoundRes.status, 'NOT_FOUND');
  })();

  console.log(
    'PASS: Real Resource Bank Provider verified against all 11,797 indexed entities (10,270 Oxford, 570 AWL/57 groups, 122 Idioms, 100 Linking Words, 129 Phrasal Verbs, 606 Regional Pairs), 0 broken references, lazy first-page loading (<500 KB, 2 requests), empty letter X (0 requests), direct vs proposed skill partitions, bounded 5-shard LRU cache, version invalidation, and AbortSignal handling.'
  );
} finally {
  fs.rmSync('qa/.rb-provider-test.cjs', { force: true });
}
