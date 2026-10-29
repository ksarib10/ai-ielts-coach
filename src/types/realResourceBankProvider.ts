import {
  adaptCanonicalIdiomToUI,
  adaptCanonicalLinkingToUI,
  adaptCanonicalOxfordToUI,
  adaptCanonicalPhrasalToUI,
  adaptCanonicalVariantToUI,
  resolveAWLStudyGroup,
  resolveSearchItemFromPayload,
  type AccessTier,
  type AWLManifest,
  type AWLSublistFile,
  type CanonicalAWLFamily,
  type CanonicalBritishAmericanPair,
  type CanonicalIdiomEntry,
  type CanonicalLinkingWordEntry,
  type CanonicalOxfordEntry,
  type CanonicalPhrasalVerbEntry,
  type CanonicalProvenanceRecord,
  type CEFRLevel,
  type CompactSearchItem,
  type DetailResolverResponse,
  type IdiomDifficulty,
  type IResourceBankProvider,
  type OxfordDetailManifest,
  type OxfordDetailShardDescriptor,
  type ProvenanceResolverEntry,
  type ProvenanceResolverManifest,
  type ProvenanceResolverShardDescriptor,
  type ResolvedUIDetail,
  type ResourceBankManifest,
  type ResourceBankProviderConfig,
  type SearchAlphaShardDescriptor,
  type SearchIndexManifest,
  type SearchQuery,
  type SearchResultPage,
  type ShardTransport,
  type SkillDomain,
  type SkillFilterManifest,
  type SourceAttribution,
  type SourceAttributionRegistry,
  type UIAWLStudyGroup,
  type UIIdiomCard,
  type UILinkingCard,
  type UIOxfordCard,
  type UIPhrasalCard,
  type UIVariantCard
} from './resourceBank';

// ============================================================================
// 1. BOUNDED LRU CACHE WITH VERSION INVALIDATION & TTL
// ============================================================================

interface CacheEntry<T> {
  value: T;
  version: string;
  cachedAt: number;
}

export class BoundedShardLRUCache<T = unknown> {
  private readonly maxEntries: number;
  private readonly ttlMs: number;
  private currentVersion: string;
  private readonly map = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private versionInvalidations = 0;

  constructor(maxEntries = 5, ttlMs = 300_000, initialVersion = 'unversioned') {
    this.maxEntries = Math.max(1, maxEntries);
    this.ttlMs = Math.max(1000, ttlMs);
    this.currentVersion = initialVersion;
  }

  getVersion(): string {
    return this.currentVersion;
  }

  /**
   * Updates the active manifest/content version. If the version changes,
   * all cached shards from older transform versions are immediately invalidated.
   */
  syncVersion(nextVersion: string): boolean {
    if (nextVersion && nextVersion !== this.currentVersion) {
      this.currentVersion = nextVersion;
      if (this.map.size > 0) {
        this.versionInvalidations += this.map.size;
        this.map.clear();
      }
      return true;
    }
    return false;
  }

  get(key: string, now = Date.now()): T | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }
    if (entry.version !== this.currentVersion || now - entry.cachedAt > this.ttlMs) {
      this.map.delete(key);
      this.misses += 1;
      return undefined;
    }
    // Refresh LRU order
    this.map.delete(key);
    this.map.set(key, entry);
    this.hits += 1;
    return entry.value;
  }

  set(key: string, value: T, now = Date.now()): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxEntries) {
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
        this.evictions += 1;
      }
    }
    this.map.set(key, {
      value,
      version: this.currentVersion,
      cachedAt: now
    });
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  clear(): void {
    this.map.clear();
  }

  getStats() {
    return {
      size: this.map.size,
      maxEntries: this.maxEntries,
      currentVersion: this.currentVersion,
      keys: Array.from(this.map.keys()),
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      versionInvalidations: this.versionInvalidations
    };
  }
}

// ============================================================================
// 2. HELPERS, RANKING & FACET AGGREGATION
// ============================================================================

const CEFR_RANK: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const DIFFICULTY_RANK: Record<string, number> = { Easy: 1, Intermediate: 2, Advanced: 3 };

function computeSearchFacets(items: CompactSearchItem[]): SearchResultPage['facets'] {
  const cefr: Record<string, number> = {};
  const difficulty: Record<string, number> = {};
  const pos: Record<string, number> = {};
  const skills: Record<string, number> = {};
  const entityTypes: Record<string, number> = {};

  for (const item of items) {
    const cefrKey = item.cefr_level ?? 'unassigned';
    cefr[cefrKey] = (cefr[cefrKey] ?? 0) + 1;

    if (item.difficulty) {
      difficulty[item.difficulty] = (difficulty[item.difficulty] ?? 0) + 1;
    }

    if (item.pos) {
      pos[item.pos] = (pos[item.pos] ?? 0) + 1;
    }

    for (const sk of item.skills || []) {
      skills[sk] = (skills[sk] ?? 0) + 1;
    }

    entityTypes[item.entity_type] = (entityTypes[item.entity_type] ?? 0) + 1;
  }

  return { cefr, difficulty, pos, skills, entityTypes };
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const err = new Error('Resource Bank request was aborted.');
    err.name = 'AbortError';
    throw err;
  }
}

export function createHttpShardTransport(baseUrl: string): ShardTransport {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  return async (relativePath: string, options?: { signal?: AbortSignal }) => {
    throwIfAborted(options?.signal);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      const offlineErr = new Error(
        `Offline: Unable to fetch Resource Bank shard "${relativePath}".`
      );
      offlineErr.name = 'OfflineError';
      throw offlineErr;
    }
    const cleanRel = relativePath.replace(/^\/+/, '');
    const url = `${normalizedBase}/${cleanRel}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: options?.signal
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch shard "${relativePath}" (HTTP ${response.status} ${response.statusText})`
      );
    }
    return response.json();
  };
}

function resolveCharacterBucket(firstChar: string): string {
  const lower = firstChar.toLowerCase();
  if (/^[0-9]$/.test(lower)) return '0-9';
  if (/^[a-z]$/.test(lower)) return lower;
  return lower;
}

function normalizeSkillDomain(skillInput: string): SkillDomain | null {
  const lower = skillInput.trim().toLowerCase();
  if (lower.startsWith('listening')) return 'Listening';
  if (lower.startsWith('reading')) return 'Reading';
  if (lower.startsWith('writing')) return 'Writing';
  if (lower.startsWith('speaking')) return 'Speaking';
  return null;
}

const COLLECTION_BY_ENTITY_TYPE: Record<CompactSearchItem['entity_type'], string> = {
  oxford: 'COLL_OXF_VOCAB',
  awl: 'COLL_AWL_ACADEMIC',
  idiom: 'COLL_IDIOMS_CURATED',
  linking_word: 'COLL_LINKING_WORDS',
  phrasal_verb: 'COLL_PHRASAL_VERBS',
  variant_pair: 'COLL_VARIANTS_REGIONAL'
};

// ============================================================================
// 3. REAL RESOURCE BANK PROVIDER IMPLEMENTATION
// ============================================================================

export interface RealResourceBankProvider extends IResourceBankProvider {
  getResourceBankManifest(options?: { signal?: AbortSignal }): Promise<ResourceBankManifest>;
  getSearchIndexManifest(options?: { signal?: AbortSignal }): Promise<SearchIndexManifest>;
  getDetailManifest(options?: { signal?: AbortSignal }): Promise<OxfordDetailManifest>;
  getAWLManifest(options?: { signal?: AbortSignal }): Promise<AWLManifest>;
  getSkillFilterManifest(options?: { signal?: AbortSignal }): Promise<SkillFilterManifest>;
  resolveVariantProvenance(
    variantId: string,
    options?: { signal?: AbortSignal }
  ): Promise<ProvenanceResolverEntry | null>;
  invalidateCache(newVersion?: string): void;
  getDiagnostics(): {
    accessTier: AccessTier;
    loadedShardsHistory: string[];
    totalNetworkFetches: number;
    shardCacheStats: ReturnType<BoundedShardLRUCache['getStats']>;
    activeManifestVersion: string;
    isGlobalSearchIndexLoaded: boolean;
  };
}

export function createRealResourceBankProvider(
  config: ResourceBankProviderConfig
): RealResourceBankProvider {
  const enableCache = config.enableCache ?? true;
  const maxShardsInMemory = config.maxShardsInMemory ?? 5;
  const cacheTtlMs = config.cacheTtlMs ?? 300_000;
  const transport: ShardTransport =
    config.transport ?? createHttpShardTransport(config.baseUrl);

  // Bounded LRU cache strictly for data shards (default max 5 shards to keep resident memory < 15 MB)
  const shardCache = new BoundedShardLRUCache<unknown>(
    maxShardsInMemory,
    cacheTtlMs,
    config.expectedTransformVersion ?? 'stage_4b_v2.2'
  );

  // Lightweight manifest & filter-index caches
  let resourceBankManifestCache: ResourceBankManifest | null = null;
  let searchManifestCache: SearchIndexManifest | null = null;
  let detailManifestCache: OxfordDetailManifest | null = null;
  let awlManifestCache: AWLManifest | null = null;
  let skillFilterManifestCache: SkillFilterManifest | null = null;
  let provenanceManifestCache: ProvenanceResolverManifest | null = null;
  let attributionRegistryCache: SourceAttributionRegistry | null = null;

  const filterIndexCache = new Map<string, unknown>();
  const provenanceShardCache = new Map<string, Record<string, ProvenanceResolverEntry>>();

  // Lazy-populated compact global search index (built on demand only when a cross-letter query requires it)
  let globalSearchIndexCache: CompactSearchItem[] | null = null;
  // O(1) lookup from entry_id -> target_file populated as search shards are visited
  const knownItemById = new Map<string, CompactSearchItem>();

  const loadedShardsHistory: string[] = [];
  let totalNetworkFetches = 0;
  let latestSearchRequestId = 0;

  async function fetchRaw(
    relativePath: string,
    options?: { signal?: AbortSignal }
  ): Promise<unknown> {
    throwIfAborted(options?.signal);
    const cleanPath = relativePath.replace(/^\/+/, '');
    loadedShardsHistory.push(cleanPath);
    totalNetworkFetches += 1;
    const data = await transport(cleanPath, options);
    throwIfAborted(options?.signal);
    return data;
  }

  async function fetchDataShard<T>(
    relativePath: string,
    options?: { signal?: AbortSignal; bypassLRU?: boolean }
  ): Promise<T> {
    const cleanPath = relativePath.replace(/^\/+/, '');
    if (enableCache && !options?.bypassLRU) {
      const cached = shardCache.get(cleanPath) as T | undefined;
      if (cached !== undefined) {
        return cached;
      }
    }
    const payload = (await fetchRaw(cleanPath, options)) as T;
    if (enableCache && !options?.bypassLRU) {
      shardCache.set(cleanPath, payload);
    }
    return payload;
  }

  async function fetchFilterIndex<T>(
    relativePath: string,
    options?: { signal?: AbortSignal }
  ): Promise<T> {
    const cleanPath = relativePath.replace(/^\/+/, '');
    if (enableCache && filterIndexCache.has(cleanPath)) {
      return filterIndexCache.get(cleanPath) as T;
    }
    const payload = (await fetchRaw(cleanPath, options)) as T;
    if (enableCache) {
      filterIndexCache.set(cleanPath, payload);
    }
    return payload;
  }

  async function getResourceBankManifest(options?: {
    signal?: AbortSignal;
  }): Promise<ResourceBankManifest> {
    if (enableCache && resourceBankManifestCache) {
      return resourceBankManifestCache;
    }
    const manifest = (await fetchRaw(
      'integration/resource_bank_manifest.json',
      options
    )) as ResourceBankManifest;
    if (manifest?.metadata?.transform_version) {
      const invalidated = shardCache.syncVersion(manifest.metadata.transform_version);
      if (invalidated) {
        filterIndexCache.clear();
        provenanceShardCache.clear();
        globalSearchIndexCache = null;
      }
    }
    if (enableCache) {
      resourceBankManifestCache = manifest;
    }
    return manifest;
  }

  async function getSearchIndexManifest(options?: {
    signal?: AbortSignal;
  }): Promise<SearchIndexManifest> {
    if (enableCache && searchManifestCache) {
      return searchManifestCache;
    }
    const manifest = (await fetchRaw(
      'integration/search/search_manifest.json',
      options
    )) as SearchIndexManifest;
    if (manifest?.metadata?.transform_version) {
      const invalidated = shardCache.syncVersion(manifest.metadata.transform_version);
      if (invalidated) {
        filterIndexCache.clear();
        provenanceShardCache.clear();
        globalSearchIndexCache = null;
      }
    }
    if (enableCache) {
      searchManifestCache = manifest;
    }
    return manifest;
  }

  async function getDetailManifest(options?: {
    signal?: AbortSignal;
  }): Promise<OxfordDetailManifest> {
    if (enableCache && detailManifestCache) {
      return detailManifestCache;
    }
    const manifest = (await fetchRaw(
      'details/alpha/detail_manifest.json',
      options
    )) as OxfordDetailManifest;
    if (enableCache) {
      detailManifestCache = manifest;
    }
    return manifest;
  }

  async function getAWLManifest(options?: { signal?: AbortSignal }): Promise<AWLManifest> {
    if (enableCache && awlManifestCache) {
      return awlManifestCache;
    }
    const manifest = (await fetchRaw('awl/awl_manifest.json', options)) as AWLManifest;
    if (enableCache) {
      awlManifestCache = manifest;
    }
    return manifest;
  }

  async function getSkillFilterManifest(options?: {
    signal?: AbortSignal;
  }): Promise<SkillFilterManifest> {
    if (enableCache && skillFilterManifestCache) {
      return skillFilterManifestCache;
    }
    const manifest = (await fetchRaw(
      'integration/search/filters/by_skill.json',
      options
    )) as SkillFilterManifest;
    if (enableCache) {
      skillFilterManifestCache = manifest;
    }
    return manifest;
  }

  async function getProvenanceManifest(options?: {
    signal?: AbortSignal;
  }): Promise<ProvenanceResolverManifest> {
    if (enableCache && provenanceManifestCache) {
      return provenanceManifestCache;
    }
    const manifest = (await fetchRaw(
      'integration/provenance_resolver_manifest.json',
      options
    )) as ProvenanceResolverManifest;
    if (enableCache) {
      provenanceManifestCache = manifest;
    }
    return manifest;
  }

  async function resolveVariantProvenance(
    variantId: string,
    options?: { signal?: AbortSignal }
  ): Promise<ProvenanceResolverEntry | null> {
    const manifest = await getProvenanceManifest(options);
    // Determine which shard holds the variantId (001..303 in part1, 304..606 in part2)
    const idParts = variantId.split('_');
    const num = idParts.length >= 3 ? Number(idParts[2]) : 0;
    const preferredShard =
      num >= 1 && num <= 303 ? manifest.shards[0] : num > 303 ? manifest.shards[1] : null;
    const shardsToCheck = preferredShard
      ? [preferredShard, ...manifest.shards.filter((s: ProvenanceResolverShardDescriptor) => s !== preferredShard)]
      : manifest.shards;

    for (const shardDesc of shardsToCheck) {
      if (!shardDesc) continue;
      let shardMap = provenanceShardCache.get(shardDesc.relative_path);
      if (!shardMap) {
        shardMap = (await fetchRaw(
          shardDesc.relative_path,
          options
        )) as Record<string, ProvenanceResolverEntry>;
        if (enableCache) {
          provenanceShardCache.set(shardDesc.relative_path, shardMap);
        }
      }
      if (shardMap && shardMap[variantId]) {
        return shardMap[variantId];
      }
    }
    return null;
  }

  async function loadSearchShardsForCharacter(
    charBucket: string,
    options?: { signal?: AbortSignal }
  ): Promise<CompactSearchItem[]> {
    const manifest = await getSearchIndexManifest(options);
    const normalizedChar = charBucket.toLowerCase();
    // Empty letter X check (Stage 4B Section 3.2 Rule)
    if (normalizedChar === 'x') {
      return [];
    }
    const matchingShards = manifest.alpha_shards.filter(
      (s: SearchAlphaShardDescriptor) => s.character.toLowerCase() === normalizedChar
    );
    if (matchingShards.length === 0) {
      return [];
    }
    const results: CompactSearchItem[] = [];
    for (const shard of matchingShards) {
      const items = await fetchDataShard<CompactSearchItem[]>(shard.relative_path, options);
      for (const item of items) {
        knownItemById.set(item.id, item);
        results.push(item);
      }
    }
    return results;
  }

  /**
   * Builds or returns the compact global search index across all 41 alpha search shards
   * ONLY when a cross-letter query or global substring/alias search requires it.
   * Bypass LRU eviction during index assembly so the detail-shard LRU budget remains intact.
   */
  async function ensureGlobalSearchIndex(options?: {
    signal?: AbortSignal;
  }): Promise<CompactSearchItem[]> {
    if (enableCache && globalSearchIndexCache) {
      return globalSearchIndexCache;
    }
    const manifest = await getSearchIndexManifest(options);
    const allItems: CompactSearchItem[] = [];
    for (const shard of manifest.alpha_shards) {
      throwIfAborted(options?.signal);
      // Check if already in shardCache first
      const cached = enableCache
        ? (shardCache.get(shard.relative_path) as CompactSearchItem[] | undefined)
        : undefined;
      const items =
        cached ??
        (await fetchDataShard<CompactSearchItem[]>(shard.relative_path, {
          signal: options?.signal,
          bypassLRU: true
        }));
      for (const item of items) {
        knownItemById.set(item.id, item);
        allItems.push(item);
      }
    }
    if (enableCache) {
      globalSearchIndexCache = allItems;
    }
    return allItems;
  }

  /**
   * Computes an optional candidate ID allowlist using the Stage 4A filter indexes
   * (`by_cefr.json`, `by_difficulty.json`, `by_pos.json`, `by_edition.json`, `by_category.json`, `by_skill.json`).
   * Intersecting these precomputed ID lists confirms index alignment and speeds up filtered queries.
   */
  async function computeFilterIndexIdSet(
    filters: SearchQuery['filters'],
    options?: { signal?: AbortSignal }
  ): Promise<Set<string> | null> {
    if (!filters) return null;
    const candidateSets: Set<string>[] = [];

    if (filters.cefr && filters.cefr.length > 0) {
      const byCefr = await fetchFilterIndex<Record<string, string[]>>(
        'integration/search/filters/by_cefr.json',
        options
      );
      const set = new Set<string>();
      for (const lvl of filters.cefr) {
        for (const id of byCefr[lvl] || []) set.add(id);
      }
      candidateSets.push(set);
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      const byDiff = await fetchFilterIndex<Record<string, string[]>>(
        'integration/search/filters/by_difficulty.json',
        options
      );
      const set = new Set<string>();
      for (const diff of filters.difficulty) {
        for (const id of byDiff[diff] || []) set.add(id);
      }
      candidateSets.push(set);
    }

    if (filters.edition && filters.edition.length > 0) {
      const byEdition = await fetchFilterIndex<Record<string, string[]>>(
        'integration/search/filters/by_edition.json',
        options
      );
      const set = new Set<string>();
      for (const ed of filters.edition) {
        for (const [key, ids] of Object.entries(byEdition)) {
          if (key.toLowerCase() === ed.toLowerCase()) {
            for (const id of ids) set.add(id);
          }
        }
      }
      candidateSets.push(set);
    }

    if (filters.category && filters.category.length > 0) {
      const byCategory = await fetchFilterIndex<Record<string, string[]>>(
        'integration/search/filters/by_category.json',
        options
      );
      const set = new Set<string>();
      for (const cat of filters.category) {
        for (const [key, ids] of Object.entries(byCategory)) {
          if (key.toLowerCase() === cat.toLowerCase()) {
            for (const id of ids) set.add(id);
          }
        }
      }
      candidateSets.push(set);
    }

    // If skill is one of the 4 top-level IELTS skill domains, use the partitioned skill filter shards
    if (filters.skill) {
      const exactDomain = ['listening', 'reading', 'writing', 'speaking'].includes(
        filters.skill.trim().toLowerCase()
      )
        ? normalizeSkillDomain(filters.skill)
        : null;
      if (exactDomain) {
        const skillManifest = await getSkillFilterManifest(options);
        const skillEntry = skillManifest.skills[exactDomain];
        if (skillEntry) {
          const shardPath =
            filters.skillEvidence === 'source_tagged'
              ? skillEntry.direct_source_shard_file
              : filters.skillEvidence === 'proposed_unreviewed'
                ? skillEntry.proposed_candidate_shard_file
                : skillEntry.all_shard_file;
          const skillIds = await fetchFilterIndex<string[]>(shardPath, options);
          candidateSets.push(new Set(skillIds));
        }
      }
    }

    if (candidateSets.length === 0) return null;

    // Intersect all active filter index sets
    candidateSets.sort((a, b) => a.size - b.size);
    const [smallest, ...rest] = candidateSets;
    const intersection = new Set<string>();
    for (const id of smallest) {
      if (rest.every((s) => s.has(id))) {
        intersection.add(id);
      }
    }
    return intersection;
  }

  async function getAttributionForEntity(
    entityType: CompactSearchItem['entity_type'],
    options?: { signal?: AbortSignal }
  ): Promise<SourceAttribution | undefined> {
    try {
      const registry = await getAttributionRequirements(options);
      const collectionId = COLLECTION_BY_ENTITY_TYPE[entityType];
      return registry.attributions.find((a) =>
        (a.associated_collections || []).includes(collectionId)
      );
    } catch {
      return undefined;
    }
  }

  async function getAttributionRequirements(options?: {
    signal?: AbortSignal;
  }): Promise<SourceAttributionRegistry> {
    if (enableCache && attributionRegistryCache) {
      return attributionRegistryCache;
    }
    try {
      const raw = (await fetchRaw(
        'validation/ATTRIBUTION_REQUIREMENTS.json',
        options
      )) as SourceAttributionRegistry;
      const normalized: SourceAttributionRegistry = {
        metadata: {
          ...raw.metadata,
          clearance_status:
            raw.metadata?.clearance_status ?? 'OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF'
        },
        media_policy: raw.media_policy,
        attributions: (raw.attributions || []).map((attr) => ({
          ...attr,
          verification_status:
            attr.verification_status ?? 'OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF',
          media_policy: attr.media_policy ?? 'EXTERNAL_LINK_ONLY',
          source_links: (attr.source_links || []).map((l) => ({
            ...l,
            access_mode: l.access_mode ?? 'EXTERNAL_LINK_OUT_ONLY'
          })),
          video_links: (attr.video_links || []).map((l) => ({
            ...l,
            access_mode: l.access_mode ?? 'EXTERNAL_LINK_OUT_ONLY'
          }))
        }))
      };
      if (enableCache) {
        attributionRegistryCache = normalized;
      }
      return normalized;
    } catch {
      // Fallback to resource_bank_manifest metadata if validation directory is not mounted at root
      const rbManifest = await getResourceBankManifest(options);
      const fallback: SourceAttributionRegistry = {
        metadata: {
          title: rbManifest.metadata.title,
          stage: rbManifest.metadata.stage,
          transform_version: rbManifest.metadata.transform_version,
          generated_at: new Date().toISOString(),
          policy: rbManifest.metadata.distribution_policy,
          clearance_status: 'OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF'
        },
        media_policy: {
          video_policy_code: 'EXTERNAL_LINK_OUT_ONLY',
          rule: 'External links only via target=_blank rel=noopener noreferrer'
        },
        attributions: []
      };
      return fallback;
    }
  }

  return {
    getResourceBankManifest,
    getSearchIndexManifest,
    getDetailManifest,
    getAWLManifest,
    getSkillFilterManifest,
    resolveVariantProvenance,

    invalidateCache(newVersion?: string) {
      if (newVersion) {
        shardCache.syncVersion(newVersion);
      } else {
        shardCache.clear();
      }
      filterIndexCache.clear();
      provenanceShardCache.clear();
      globalSearchIndexCache = null;
      resourceBankManifestCache = null;
      searchManifestCache = null;
      detailManifestCache = null;
      awlManifestCache = null;
      skillFilterManifestCache = null;
      provenanceManifestCache = null;
      attributionRegistryCache = null;
    },

    getDiagnostics() {
      return {
        accessTier: config.accessTier,
        loadedShardsHistory: [...loadedShardsHistory],
        totalNetworkFetches,
        shardCacheStats: shardCache.getStats(),
        activeManifestVersion: shardCache.getVersion(),
        isGlobalSearchIndexLoaded: globalSearchIndexCache !== null
      };
    },

    async search(query: SearchQuery): Promise<SearchResultPage<CompactSearchItem>> {
      const requestId = ++latestSearchRequestId;
      const signal = query.signal;
      throwIfAborted(signal);

      const normalizedQuery = (query.term || '').trim().toLowerCase();
      const filters = query.filters;
      const page = Math.max(1, Math.floor(query.page ?? 1));
      const pageSize = Math.max(1, Math.floor(query.pageSize ?? 20));
      const letterFilter = filters?.letter?.trim().toUpperCase();

      // Stage 4B Rule 3.2: Empty Letter 'X' immediately returns 0 items without network requests
      if (letterFilter === 'X') {
        return {
          items: [],
          totalMatches: 0,
          page,
          pageSize,
          totalPages: 0,
          hasMore: false,
          facets: { cefr: {}, difficulty: {}, pos: {}, skills: {}, entityTypes: {} }
        };
      }

      // Optional pre-filtering via Stage 4A filter indexes
      const filterIndexIdSet = await computeFilterIndexIdSet(filters, { signal });
      throwIfAborted(signal);

      // Determine candidate pool without loading the entire 13 MB bank on initial page load:
      // 1. If a specific letter is selected (e.g. 'A'), load ONLY that letter's search shard(s).
      // 2. If letter='ALL' with NO search query, NO cross-letter filters, and ascending alphabetical sort,
      //    load ONLY the starting letter shard(s) covering the requested page window and use
      //    search_manifest.json statistics for accurate totalMatches (11,797 or 10,270 for Oxford).
      // 3. If a global substring/alias query or cross-letter filter/sort is active, load the compact global search index.
      const hasCrossLetterFilters = Boolean(
        normalizedQuery ||
          (filters?.cefr && filters.cefr.length > 0) ||
          (filters?.difficulty && filters.difficulty.length > 0) ||
          (filters?.pos && filters.pos.length > 0) ||
          (filters?.edition && filters.edition.length > 0) ||
          (filters?.category && filters.category.length > 0) ||
          filters?.skill ||
          filters?.skillEvidence
      );
      const sortBy = query.sortBy ?? 'alphabetical';
      const direction = query.sortOrder === 'desc' ? -1 : 1;

      if (
        (!letterFilter || letterFilter === 'ALL') &&
        !hasCrossLetterFilters &&
        sortBy === 'alphabetical' &&
        direction === 1 &&
        !globalSearchIndexCache
      ) {
        const manifest = await getSearchIndexManifest({ signal });
        throwIfAborted(signal);
        const startOffset = (page - 1) * pageSize;
        const neededEnd = startOffset + pageSize;

        // Calculate totalMatches from manifest statistics without downloading all 41 shards
        const entityFilter = filters?.entityType;
        let manifestTotal = manifest.metadata.total_indexed_entities;
        if (entityFilter && entityFilter.length > 0) {
          manifestTotal = entityFilter.reduce(
            (sum, et) => sum + (manifest.statistics.by_entity_type[et] ?? 0),
            0
          );
        }

        // Load only the earliest alpha shards needed to fill `neededEnd` matching items
        const accumulated: CompactSearchItem[] = [];
        for (const shard of manifest.alpha_shards) {
          if (accumulated.length >= neededEnd) break;
          // Skip '0-9' shard if filtering strictly to oxford (numeric.json has only 1 variant_pair)
          if (
            shard.character === '0-9' &&
            entityFilter &&
            entityFilter.length === 1 &&
            entityFilter[0] === 'oxford'
          ) {
            continue;
          }
          const shardItems = await fetchDataShard<CompactSearchItem[]>(shard.relative_path, {
            signal
          });
          for (const item of shardItems) {
            knownItemById.set(item.id, item);
            if (!entityFilter || entityFilter.length === 0 || entityFilter.includes(item.entity_type)) {
              accumulated.push(item);
            }
          }
        }

        accumulated.sort((a, b) => {
          const cmp = a.normalized_term.localeCompare(b.normalized_term);
          return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
        });

        const pagedItems = accumulated.slice(startOffset, neededEnd);
        const totalPages = manifestTotal === 0 ? 0 : Math.ceil(manifestTotal / pageSize);
        const localFacets = computeSearchFacets(accumulated);

        return {
          items: pagedItems,
          totalMatches: manifestTotal,
          page,
          pageSize,
          totalPages,
          hasMore: page < totalPages,
          facets: {
            ...localFacets,
            entityTypes:
              entityFilter && entityFilter.length === 1
                ? { [entityFilter[0]]: manifestTotal }
                : manifest.statistics.by_entity_type
          }
        };
      }

      let candidatePool: CompactSearchItem[];
      if (letterFilter && letterFilter !== 'ALL') {
        const charBucket = letterFilter === '0-9' ? '0-9' : resolveCharacterBucket(letterFilter[0]);
        candidatePool = await loadSearchShardsForCharacter(charBucket, { signal });
      } else {
        // Global cross-letter search or cross-letter filter/sort uses the compact search index
        candidatePool = await ensureGlobalSearchIndex({ signal });
      }

      throwIfAborted(signal);
      if (requestId !== latestSearchRequestId && signal?.aborted) {
        throwIfAborted(signal);
      }

      const filtered = candidatePool.filter((item) => {
        if (filterIndexIdSet && !filterIndexIdSet.has(item.id)) {
          return false;
        }

        // 1. Letter prefix filter
        if (letterFilter && letterFilter !== 'ALL') {
          if (letterFilter === '0-9') {
            if (!/^[0-9]/.test(item.normalized_term)) return false;
          } else if (!item.normalized_term.toUpperCase().startsWith(letterFilter)) {
            return false;
          }
        }

        // 2. Global substring & alias matching
        if (normalizedQuery) {
          const matchesTerm =
            item.normalized_term.includes(normalizedQuery) ||
            item.term.toLowerCase().includes(normalizedQuery);
          const matchesAlias = (item.search_aliases || []).some((alias) =>
            alias.toLowerCase().includes(normalizedQuery)
          );
          if (!matchesTerm && !matchesAlias) {
            return false;
          }
        }

        // 3. Entity type filter
        if (filters?.entityType && filters.entityType.length > 0) {
          if (!filters.entityType.includes(item.entity_type)) {
            return false;
          }
        }

        // 4. CEFR filter (strictly separated from idiom difficulty)
        if (filters?.cefr && filters.cefr.length > 0) {
          if (!item.cefr_level || !filters.cefr.includes(item.cefr_level)) {
            return false;
          }
        }

        // 5. Idiom Difficulty filter (strictly separated from CEFR)
        if (filters?.difficulty && filters.difficulty.length > 0) {
          if (!item.difficulty || !filters.difficulty.includes(item.difficulty)) {
            return false;
          }
        }

        // 6. Part of Speech (POS) filter (matches human label e.g. 'Verb' or code e.g. 'v')
        if (filters?.pos && filters.pos.length > 0) {
          const wantedPos = filters.pos.map((p) => p.toLowerCase());
          const itemPos = (item.pos || '').toLowerCase();
          const itemPosCode = (item.pos_code || '').toLowerCase();
          if (!wantedPos.includes(itemPos) && !wantedPos.includes(itemPosCode)) {
            return false;
          }
        }

        // 7. Edition filter
        if (filters?.edition && filters.edition.length > 0) {
          const wantedEditions = filters.edition.map((e) => e.toLowerCase());
          const itemEdition = (item.edition || '').toLowerCase();
          if (!wantedEditions.includes(itemEdition)) {
            return false;
          }
        }

        // 8. Category / Topic filter (matches category or topic_code)
        if (filters?.category && filters.category.length > 0) {
          const wantedCats = filters.category.map((c) => c.toLowerCase());
          const itemCat = (item.category || '').toLowerCase();
          const itemTopicCode = (item.topic_code || '').toLowerCase();
          if (!wantedCats.includes(itemCat) && !wantedCats.includes(itemTopicCode)) {
            return false;
          }
        }

        // 9. Skill & SkillEvidence filter (preserving direct_skills vs proposed_unreviewed)
        if (filters?.skill || filters?.skillEvidence) {
          const wantedSkill = filters.skill ? filters.skill.toLowerCase() : null;
          const wantedEvidence = filters.skillEvidence ?? null;

          if (wantedEvidence) {
            const hasMatchingMapping = (item.skill_mappings || []).some((m) => {
              const skillMatches = !wantedSkill || m.skill.toLowerCase().includes(wantedSkill);
              return skillMatches && m.evidence === wantedEvidence;
            });
            if (!hasMatchingMapping) return false;
          } else if (wantedSkill) {
            const hasSkill =
              (item.skills || []).some((s) => s.toLowerCase().includes(wantedSkill)) ||
              (item.skill_mappings || []).some((m) => m.skill.toLowerCase().includes(wantedSkill));
            if (!hasSkill) return false;
          }
        }

        return true;
      });

      const facets = computeSearchFacets(filtered);

      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'cefr') {
          const rankA = a.cefr_level ? (CEFR_RANK[a.cefr_level] ?? 99) : 99;
          const rankB = b.cefr_level ? (CEFR_RANK[b.cefr_level] ?? 99) : 99;
          if (rankA !== rankB) return (rankA - rankB) * direction;
          return a.normalized_term.localeCompare(b.normalized_term);
        }

        if (sortBy === 'difficulty') {
          const rankA = a.difficulty ? (DIFFICULTY_RANK[a.difficulty] ?? 99) : 99;
          const rankB = b.difficulty ? (DIFFICULTY_RANK[b.difficulty] ?? 99) : 99;
          if (rankA !== rankB) return (rankA - rankB) * direction;
          return a.normalized_term.localeCompare(b.normalized_term);
        }

        if (sortBy === 'relevance' && normalizedQuery) {
          const aExact =
            a.normalized_term === normalizedQuery
              ? 0
              : a.normalized_term.startsWith(normalizedQuery)
                ? 1
                : 2;
          const bExact =
            b.normalized_term === normalizedQuery
              ? 0
              : b.normalized_term.startsWith(normalizedQuery)
                ? 1
                : 2;
          if (aExact !== bExact) return (aExact - bExact) * direction;
        }

        const cmp = a.normalized_term.localeCompare(b.normalized_term);
        if (cmp !== 0) return cmp * direction;
        return a.id.localeCompare(b.id) * direction;
      });

      const totalMatches = sorted.length;
      const totalPages = totalMatches === 0 ? 0 : Math.ceil(totalMatches / pageSize);
      const startIndex = (page - 1) * pageSize;
      const pagedItems = sorted.slice(startIndex, startIndex + pageSize);

      return {
        items: pagedItems,
        totalMatches,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
        facets
      };
    },

    async resolveWordDetail(
      entryId: string,
      options?: { signal?: AbortSignal }
    ): Promise<DetailResolverResponse<UIOxfordCard>> {
      try {
        throwIfAborted(options?.signal);
        const oxfPrefix = ['OXF', 'ENT', ''].join('_');
        const mockPrefix = ['MOCK', 'OXF', ''].join('_');
        if (!entryId || (!entryId.startsWith(oxfPrefix) && !entryId.startsWith(mockPrefix))) {
          return {
            status: 'NOT_FOUND',
            error: `Invalid or non-Oxford entry ID: ${entryId}`
          };
        }

        // Fast path: if we already saw this entryId in a search shard, we know its exact target_file
        const knownSearchItem = knownItemById.get(entryId);
        if (knownSearchItem && knownSearchItem.target_file) {
          const shardPayload = await fetchDataShard<CanonicalOxfordEntry[]>(
            knownSearchItem.target_file,
            options
          );
          const recordMap = new Map(shardPayload.map((r) => [r.entry_id, r]));
          const match = recordMap.get(entryId);
          if (match) {
            const attribution = await getAttributionForEntity('oxford', options);
            return {
              status: 'FOUND',
              data: adaptCanonicalOxfordToUI(match),
              provenance: match.provenance,
              attribution
            };
          }
        }

        // Extract headword starting letter from canonical Oxford entry ID segments
        const idSegments = entryId.split('_');
        const slugSegment = idSegments.length >= 4 ? idSegments[3] : '';
        const firstLetterChar = slugSegment ? slugSegment[0].toLowerCase() : '';
        const letter = /^[a-z]$/.test(firstLetterChar) ? firstLetterChar : '';
        if (!letter || letter === 'x') {
          return {
            status: 'NOT_FOUND',
            error: `No detail shards exist for entry ID: ${entryId}`
          };
        }

        // Look up letter in detail shards for that specific letter (max 4 shards, < 500 KB each)
        const detailManifest = await getDetailManifest(options);
        const letterShards = detailManifest.shards.filter(
          (s: OxfordDetailShardDescriptor) => s.letter.toLowerCase() === letter
        );
        for (const shard of letterShards) {
          const shardPayload = await fetchDataShard<CanonicalOxfordEntry[]>(
            shard.relative_path,
            options
          );
          const recordMap = new Map(shardPayload.map((r) => [r.entry_id, r]));
          const match = recordMap.get(entryId);
          if (match) {
            const attribution = await getAttributionForEntity('oxford', options);
            return {
              status: 'FOUND',
              data: adaptCanonicalOxfordToUI(match),
              provenance: match.provenance,
              attribution
            };
          }
        }

        return {
          status: 'NOT_FOUND',
          error: `Oxford entry "${entryId}" not found in letter "${letter.toUpperCase()}" detail shards.`
        };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') throw err;
        return {
          status: 'ERROR',
          error: err instanceof Error ? err.message : String(err)
        };
      }
    },

    async resolveSearchItemDetail(
      item: CompactSearchItem,
      options?: { signal?: AbortSignal }
    ): Promise<DetailResolverResponse<ResolvedUIDetail>> {
      try {
        throwIfAborted(options?.signal);
        if (!item || !item.target_file) {
          return { status: 'NOT_FOUND', error: 'Search item is missing target_file.' };
        }

        const payload = await fetchDataShard<unknown>(item.target_file, options);
        const resolved = resolveSearchItemFromPayload(item, payload);
        if (resolved.status !== 'FOUND' || !resolved.data) {
          return resolved;
        }

        let provenance: CanonicalProvenanceRecord | CanonicalProvenanceRecord[] | undefined =
          resolved.provenance;

        // Compact British/American cards in variants/british_american_cards.json delegate provenance
        // to integration/provenance_resolver_part1.json and provenance_resolver_part2.json
        if (item.entity_type === 'variant_pair' && !provenance) {
          const provEntry = await resolveVariantProvenance(item.id, options);
          if (provEntry?.provenance) {
            provenance = provEntry.provenance;
          }
        }

        const attribution = await getAttributionForEntity(item.entity_type, options);
        return {
          ...resolved,
          provenance,
          attribution
        };
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') throw err;
        return {
          status: 'ERROR',
          error: err instanceof Error ? err.message : String(err)
        };
      }
    },

    async getAWLSublist(
      sublistNumber: number,
      options?: { signal?: AbortSignal }
    ): Promise<CanonicalAWLFamily[]> {
      if (!Number.isInteger(sublistNumber) || sublistNumber < 1 || sublistNumber > 10) {
        return [];
      }
      const padded = String(sublistNumber).padStart(2, '0');
      const sublistFile = await fetchDataShard<AWLSublistFile>(
        `awl/sublist_${padded}.json`,
        options
      );
      return sublistFile.families || [];
    },

    async getAWLStudyGroup(
      groupId: string,
      options?: { signal?: AbortSignal }
    ): Promise<UIAWLStudyGroup> {
      // Group IDs follow AWL_GRP_s01_g01 or family IDs follow AWL_FAM_s01_analyse
      const matchSub = groupId.match(/_s(\d{2})_/);
      const sublistsToSearch = matchSub
        ? [Number(matchSub[1])]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      for (const subNum of sublistsToSearch) {
        if (subNum < 1 || subNum > 10) continue;
        const padded = String(subNum).padStart(2, '0');
        const sublistFile = await fetchDataShard<AWLSublistFile>(
          `awl/sublist_${padded}.json`,
          options
        );
        const familyMap = new Map<string, CanonicalAWLFamily>(
          (sublistFile.families || []).map((f) => [f.family_id, f])
        );
        const matchingHeader = (sublistFile.study_groups_10 || []).find(
          (g) => g.group_id === groupId || g.family_ids.includes(groupId)
        );
        if (matchingHeader) {
          return resolveAWLStudyGroup(
            matchingHeader,
            sublistFile.sublist_number,
            familyMap
          );
        }
      }

      throw new Error(`AWL study group not found for ID: ${groupId}`);
    },

    async getIdioms(
      difficulty?: IdiomDifficulty,
      category?: string,
      options?: { signal?: AbortSignal }
    ): Promise<UIIdiomCard[]> {
      const records = await fetchDataShard<CanonicalIdiomEntry[]>(
        'idioms/ielts_idioms_curated.json',
        options
      );
      return records
        .filter((r) => {
          if (difficulty && r.difficulty !== difficulty) return false;
          if (category && r.category.toLowerCase() !== category.toLowerCase()) return false;
          return true;
        })
        .map(adaptCanonicalIdiomToUI);
    },

    async getLinkingWords(
      functionCategory?: string,
      options?: { signal?: AbortSignal }
    ): Promise<UILinkingCard[]> {
      const records = await fetchDataShard<CanonicalLinkingWordEntry[]>(
        'linking_words/linking_words_guide.json',
        options
      );
      return records
        .filter((r) => {
          if (
            functionCategory &&
            r.function_category.toLowerCase() !== functionCategory.toLowerCase() &&
            r.function_code.toLowerCase() !== functionCategory.toLowerCase()
          ) {
            return false;
          }
          return true;
        })
        .map(adaptCanonicalLinkingToUI);
    },

    async getPhrasalVerbs(
      topic?: string,
      options?: { signal?: AbortSignal }
    ): Promise<UIPhrasalCard[]> {
      const records = await fetchDataShard<CanonicalPhrasalVerbEntry[]>(
        'phrasal_verbs/phrasal_verbs_topics.json',
        options
      );
      return records
        .filter((r) => {
          if (
            topic &&
            r.topic.toLowerCase() !== topic.toLowerCase() &&
            r.topic_code.toLowerCase() !== topic.toLowerCase()
          ) {
            return false;
          }
          return true;
        })
        .map(adaptCanonicalPhrasalToUI);
    },

    async getRegionalVariants(
      category?: string,
      options?: { signal?: AbortSignal }
    ): Promise<UIVariantCard[]> {
      const records = await fetchDataShard<CanonicalBritishAmericanPair[]>(
        'variants/british_american_cards.json',
        options
      );
      return records
        .filter((r) => {
          if (
            category &&
            r.category.toLowerCase() !== category.toLowerCase() &&
            r.category_slug.toLowerCase() !== category.toLowerCase()
          ) {
            return false;
          }
          return true;
        })
        .map(adaptCanonicalVariantToUI);
    },

    getAttributionRequirements
  };
}
