/**
 * resourceBank.ts
 * AI IELTS Coach — Resource Bank TypeScript Interfaces, Projection Adapters & Mock Provider
 *
 * Version: stage_4b_v2.3 (Contract-Aligned, Full Filter/Sort/Pagination Mock Provider)
 * Target Application: React 18 + TypeScript + Vite AI IELTS Coach
 * Governance: MOCK_DATA_ONLY for public builds (OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF)
 */

// ============================================================================
// 1. PRIMITIVE IDENTIFIERS & ENUMS
// ============================================================================

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type IdiomDifficulty = 'Easy' | 'Intermediate' | 'Advanced';

export type OxfordPOSCode =
  | 'adj'   // Adjective
  | 'adv'   // Adverb
  | 'aux'   // Auxiliary Verb
  | 'conj'  // Conjunction
  | 'det'   // Determiner
  | 'excl'  // Exclamation / Interjection
  | 'mod'   // Modal Verb
  | 'n'     // Noun
  | 'num'   // Number
  | 'prep'  // Preposition
  | 'pron'  // Pronoun
  | 'v';    // Verb

export type OxfordEdition = 'UKEnglish' | 'USEnglish';

export type PhrasalSeparable = 'Yes' | 'No';

export type PhrasalTransitivity = 'Transitive' | 'Intransitive' | 'Both';

export type PartOfSpeechCode =
  | OxfordPOSCode
  | 'modal'
  | 'phrase'
  | 'pv'
  | 'idiom'
  | 'lnk'
  | 'awl'
  | 'var';

export type SkillDomain = 'Listening' | 'Reading' | 'Writing' | 'Speaking';

export type SkillEvidenceType = 'source_tagged' | 'proposed_unreviewed';

export type ApprovalStatus =
  | 'SOURCE_VERIFIED'
  | 'PROPOSED_UNREVIEWED'
  | 'INTERNAL_DEV_CLEARED'
  | 'BLOCKED_PENDING_RIGHTS';

export type AccessTier =
  | 'INTERNAL_DEV_ONLY'
  | 'QUARANTINED_CORPUS_RESTRICTED';

export type RightsVerificationStatus =
  | 'OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF'
  | 'CONFIRMED_EXEMPT'
  | 'PENDING_REVIEW';

export type SupportStatus =
  | 'SUPPORTED_SOURCE'
  | 'PARTIAL_DERIVED_CANDIDATE'
  | 'MISSING_SOURCE';

// ============================================================================
// 2. COMMON METADATA & PROVENANCE
// ============================================================================

export interface CanonicalProvenanceRecord {
  source_file: string;
  source_sha256?: string;
  source_row_index?: number;
  source_line_number?: number;
  source_original_id?: number | string;
  transform_version?: string;
  editorial_status?: string;
  [key: string]: unknown;
}

export type ContentProvenance = CanonicalProvenanceRecord;

export interface SkillMapping {
  skill: string;
  evidence: SkillEvidenceType;
  approval_status: ApprovalStatus;
  pedagogical_rationale?: string;
}

export interface PhoneticMetadata {
  uk_ipa?: string;
  us_ipa?: string;
  audio_status?: 'available' | 'mock_only' | 'none';
  audio_url?: string;
}

// ============================================================================
// 3. EXACT CANONICAL ENTITY SCHEMAS (Stage 2 Normalized JSON)
// ============================================================================

export interface CanonicalOxfordEntry {
  entry_id: string;
  lexeme_id: string;
  raw_source_id: string;
  headword_raw: string;
  headword_clean: string;
  homograph_index: number | null;
  edition: OxfordEdition;
  cefr_level: CEFRLevel;
  part_of_speech: string;
  pos_code: OxfordPOSCode;
  ielts_usage_raw: string | null;
  ielts_usage_tags: string[];
  meaning: string;
  collocations_raw: string | null;
  collocations: string[];
  example_sentence: string | null;
  notes_raw: string | null;
  sense_verification_status: string;
  provenance: CanonicalProvenanceRecord;
}

export interface CanonicalAWLFamily {
  family_id: string;
  sublist: number;
  headword: string;
  headword_clean: string;
  total_forms_count: number;
  word_family_forms: string[];
  word_family_raw: string;
  source_row_ids: number[];
  reconciliation_note: string | null;
  provenance: CanonicalProvenanceRecord[];
}

export interface CanonicalIdiomEntry {
  idiom_id: string;
  raw_source_id: number;
  idiom: string;
  category: string;
  difficulty: IdiomDifficulty;
  ielts_usage_raw: string;
  ielts_usage_tags: string[];
  definition: string;
  example_sentence: string;
  provenance: CanonicalProvenanceRecord;
}

export interface CanonicalLinkingWordEntry {
  linking_id: string;
  raw_source_id: string;
  function_category: string;
  function_code: string;
  linking_phrase: string;
  linking_phrase_clean: string;
  grammatical_type: string;
  meaning: string;
  ielts_usage_raw: string;
  ielts_usage_tags: string[];
  cefr_level: string;
  formality: string;
  sentence_position: string;
  grammar_pattern: string;
  common_usage: string;
  similar_connectors_raw: string;
  similar_connectors: string[];
  opposite_function: string;
  sample_sentence_ielts: string;
  sample_sentence_additional: string;
  common_mistakes: string;
  pedagogical_notes: string;
  provenance: CanonicalProvenanceRecord;
}

export interface CanonicalPhrasalVerbEntry {
  pv_id: string;
  raw_source_id: string;
  topic: string;
  topic_code: string;
  phrasal_verb: string;
  phrasal_verb_clean: string;
  meaning: string;
  usage_type: string;
  ielts_usage_raw: string;
  ielts_usage_tags: string[];
  cefr_level: string;
  formality: string;
  common_pattern: string;
  separable: PhrasalSeparable;
  transitivity: PhrasalTransitivity;
  synonyms_raw: string;
  synonyms: string[];
  antonyms_raw: string;
  antonyms: string[];
  collocations_raw: string;
  collocations: string[];
  sample_sentence_ielts: string;
  sample_sentence_additional: string;
  common_mistakes: string;
  memory_tip: string;
  notes: string;
  provenance: CanonicalProvenanceRecord;
}

export interface CanonicalBritishAmericanPair {
  variant_id: string;
  raw_source_id: number;
  category: string;
  category_slug: string;
  british_word_raw: string;
  british_word_primary: string;
  british_word_variants: string[];
  american_word_raw: string;
  american_word_primary: string;
  american_word_variants: string[];
  is_multivariant: boolean;
  provenance: CanonicalProvenanceRecord;
}

export interface AWLStudyGroupHeader {
  group_id: string;
  group_index: number;
  global_group_index: number;
  family_ids: string[];
  headwords: string[];
}

export interface AWLSublistFile {
  sublist_number: number;
  sublist_code: string;
  total_families: number;
  total_study_groups: number;
  study_groups_10: AWLStudyGroupHeader[];
  families: CanonicalAWLFamily[];
}

export interface QuarantinedIdiomCorpusEntry {
  corpus_id: string;
  idiom: string;
  citations_count: number;
  illustrative_sentences: string[];
  rights_notice: string;
  provenance: CanonicalProvenanceRecord;
}

export type OxfordEntry = CanonicalOxfordEntry;
export type AWLFamily = CanonicalAWLFamily;
export type IdiomEntry = CanonicalIdiomEntry;
export type LinkingWordEntry = CanonicalLinkingWordEntry;
export type PhrasalVerbEntry = CanonicalPhrasalVerbEntry;
export type BritishAmericanPair = CanonicalBritishAmericanPair;

// ============================================================================
// 4. UI PROJECTION MODELS (Tailored for React 18 Components)
// ============================================================================

export interface UIOxfordCard {
  id: string;
  word: string;
  edition: OxfordEdition;
  part_of_speech: string;
  pos_code: OxfordPOSCode;
  cefr_level: CEFRLevel;
  definition: string;
  example_sentences: string[];
  collocations: string[];
  ielts_skills: string[];
  audio_status: 'available' | 'mock_only' | 'none';
  audio_url?: string;
  notes?: string | null;
}

export interface UIAWLStudyGroup {
  group_id: string;
  sublist_number: number;
  group_index: number;
  global_group_index: number;
  title: string;
  families_count: number;
  families: CanonicalAWLFamily[];
}

export interface UIIdiomCard {
  id: string;
  phrase: string;
  difficulty: IdiomDifficulty;
  category: string;
  definition: string;
  example_sentences: string[];
  ielts_skills: string[];
}

export interface UILinkingCard {
  id: string;
  phrase: string;
  function_category: string;
  function_code: string;
  grammatical_type: string;
  meaning: string;
  example_sentences: string[];
  similar_connectors: string[];
  common_mistakes?: string;
  ielts_skills: string[];
}

export interface UIPhrasalCard {
  id: string;
  verb: string;
  topic: string;
  topic_code: string;
  meaning: string;
  cefr_level: string;
  separable: boolean;
  transitivity: PhrasalTransitivity;
  example_sentences: string[];
  synonyms: string[];
  collocations: string[];
  ielts_skills: string[];
}

export interface UIVariantCard {
  id: string;
  category: string;
  category_slug: string;
  british_word: string;
  british_variants: string[];
  american_word: string;
  american_variants: string[];
  is_multivariant: boolean;
  regional_variation_notice: string;
}

export type AWLStudyGroup = UIAWLStudyGroup;

// ============================================================================
// 5. PROJECTION ADAPTERS (Runtime Canonical-to-UI Mapping)
// ============================================================================

export function adaptCanonicalOxfordToUI(entry: CanonicalOxfordEntry): UIOxfordCard {
  return {
    id: entry.entry_id,
    word: entry.headword_clean,
    edition: entry.edition,
    part_of_speech: entry.part_of_speech,
    pos_code: entry.pos_code,
    cefr_level: entry.cefr_level,
    definition: entry.meaning,
    example_sentences: entry.example_sentence ? [entry.example_sentence] : [],
    collocations: entry.collocations || [],
    ielts_skills: entry.ielts_usage_tags || [],
    audio_status: 'none',
    notes: entry.notes_raw
  };
}

export function adaptCanonicalIdiomToUI(entry: CanonicalIdiomEntry): UIIdiomCard {
  return {
    id: entry.idiom_id,
    phrase: entry.idiom,
    difficulty: entry.difficulty,
    category: entry.category,
    definition: entry.definition,
    example_sentences: entry.example_sentence ? [entry.example_sentence] : [],
    ielts_skills: entry.ielts_usage_tags || []
  };
}

export function adaptCanonicalLinkingToUI(entry: CanonicalLinkingWordEntry): UILinkingCard {
  const examples: string[] = [];
  if (entry.sample_sentence_ielts) examples.push(entry.sample_sentence_ielts);
  if (entry.sample_sentence_additional) examples.push(entry.sample_sentence_additional);

  return {
    id: entry.linking_id,
    phrase: entry.linking_phrase_clean,
    function_category: entry.function_category,
    function_code: entry.function_code,
    grammatical_type: entry.grammatical_type,
    meaning: entry.meaning,
    example_sentences: examples,
    similar_connectors: entry.similar_connectors || [],
    common_mistakes: entry.common_mistakes || undefined,
    ielts_skills: entry.ielts_usage_tags || []
  };
}

export function adaptCanonicalPhrasalToUI(entry: CanonicalPhrasalVerbEntry): UIPhrasalCard {
  const examples: string[] = [];
  if (entry.sample_sentence_ielts) examples.push(entry.sample_sentence_ielts);
  if (entry.sample_sentence_additional) examples.push(entry.sample_sentence_additional);

  return {
    id: entry.pv_id,
    verb: entry.phrasal_verb_clean,
    topic: entry.topic,
    topic_code: entry.topic_code,
    meaning: entry.meaning,
    cefr_level: entry.cefr_level,
    separable: entry.separable === 'Yes',
    transitivity: entry.transitivity,
    example_sentences: examples,
    synonyms: entry.synonyms || [],
    collocations: entry.collocations || [],
    ielts_skills: entry.ielts_usage_tags || []
  };
}

export function adaptCanonicalVariantToUI(entry: CanonicalBritishAmericanPair): UIVariantCard {
  return {
    id: entry.variant_id,
    category: entry.category,
    category_slug: entry.category_slug,
    british_word: entry.british_word_primary,
    british_variants: entry.british_word_variants || [entry.british_word_primary],
    american_word: entry.american_word_primary,
    american_variants: entry.american_word_variants || [entry.american_word_primary],
    is_multivariant: entry.is_multivariant,
    regional_variation_notice: 'Regional Terminology & Spelling (Standard English variation, not an error)'
  };
}

export function resolveAWLStudyGroup(
  header: AWLStudyGroupHeader,
  sublistNumber: number,
  familyLookup: Map<string, CanonicalAWLFamily> | Record<string, CanonicalAWLFamily>
): UIAWLStudyGroup {
  const resolvedFamilies: CanonicalAWLFamily[] = [];

  for (const fid of header.family_ids) {
    const fam = familyLookup instanceof Map ? familyLookup.get(fid) : familyLookup[fid];
    if (fam) {
      resolvedFamilies.push(fam);
    } else {
      throw new Error(`Unresolved AWL family ID in study group ${header.group_id}: ${fid}`);
    }
  }

  return {
    group_id: header.group_id,
    sublist_number: sublistNumber,
    group_index: header.group_index,
    global_group_index: header.global_group_index,
    title: `Sublist ${sublistNumber} — Study Group ${header.group_index}`,
    families_count: resolvedFamilies.length,
    families: resolvedFamilies
  };
}

// ============================================================================
// 6. UNIFIED SEARCH & FILTERING MODELS
// ============================================================================

export interface CompactSearchItem {
  id: string;
  term: string;
  normalized_term: string;
  search_aliases: string[];
  entity_type: 'oxford' | 'awl' | 'idiom' | 'linking_word' | 'phrasal_verb' | 'variant_pair';
  cefr_level: CEFRLevel | null;
  difficulty: IdiomDifficulty | null;
  pos: string;
  pos_code: PartOfSpeechCode;
  edition: string;
  category: string | null;
  topic_code: string | null;
  skills: string[];
  direct_skills: string[];
  skill_mappings: SkillMapping[];
  target_file: string;
}

export interface SearchFilters {
  letter?: string; // Optional A-Z prefix filter ('A'..'Z' or 'ALL')
  cefr?: CEFRLevel[];
  difficulty?: IdiomDifficulty[];
  pos?: string[];
  edition?: string[];
  category?: string[];
  skill?: SkillDomain | string;
  skillEvidence?: SkillEvidenceType;
  entityType?: CompactSearchItem['entity_type'][];
}

export interface SearchQuery {
  term: string;
  filters?: SearchFilters;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'alphabetical' | 'cefr' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResultPage<T = CompactSearchItem> {
  items: T[];
  totalMatches: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  facets: {
    cefr: Record<string, number>;
    difficulty: Record<string, number>;
    pos: Record<string, number>;
    skills: Record<string, number>;
    entityTypes: Record<string, number>;
  };
}

// ============================================================================
// 7. DATA PROVIDER & DETAIL RESOLVER INTERFACES
// ============================================================================

export interface DetailResolverResponse<T> {
  status: 'FOUND' | 'NOT_FOUND' | 'LOADING' | 'ERROR';
  data?: T;
  provenance?: CanonicalProvenanceRecord | CanonicalProvenanceRecord[];
  attribution?: SourceAttribution;
  error?: string;
}

export interface ResourceBankProviderConfig {
  baseUrl: string;
  enableCache?: boolean;
  cacheTtlMs?: number;
  maxShardsInMemory?: number;
  fallbackToMocksOnError?: boolean;
  accessTier: AccessTier;
}

export type ResolvedUIDetail =
  | UIOxfordCard
  | UIAWLStudyGroup
  | UIIdiomCard
  | UILinkingCard
  | UIPhrasalCard
  | UIVariantCard;

export interface IResourceBankProvider {
  search(query: SearchQuery): Promise<SearchResultPage<CompactSearchItem>>;
  resolveWordDetail(entryId: string): Promise<DetailResolverResponse<UIOxfordCard>>;
  resolveSearchItemDetail(item: CompactSearchItem): Promise<DetailResolverResponse<ResolvedUIDetail>>;
  getAWLSublist(sublistNumber: number): Promise<CanonicalAWLFamily[]>;
  getAWLStudyGroup(groupId: string): Promise<UIAWLStudyGroup>;
  getIdioms(difficulty?: IdiomDifficulty, category?: string): Promise<UIIdiomCard[]>;
  getLinkingWords(functionCategory?: string): Promise<UILinkingCard[]>;
  getPhrasalVerbs(topic?: string): Promise<UIPhrasalCard[]>;
  getRegionalVariants(category?: string): Promise<UIVariantCard[]>;
  getAttributionRequirements(): Promise<SourceAttributionRegistry>;
}

export interface MockFixtureBundle {
  oxfordCard: CanonicalOxfordEntry;
  awlGroup: UIAWLStudyGroup & AWLStudyGroupHeader;
  idiomCard: CanonicalIdiomEntry;
  linkingCard: CanonicalLinkingWordEntry;
  phrasalCard: CanonicalPhrasalVerbEntry;
  variantCard: CanonicalBritishAmericanPair;
  searchResults: SearchResultPage<CompactSearchItem>;
  creditsEntry: SourceAttribution;
  extraOxfordEntries?: CanonicalOxfordEntry[];
  extraSearchItems?: CompactSearchItem[];
}

export function resolveSearchItemFromPayload(
  item: CompactSearchItem,
  targetPayload: unknown
): DetailResolverResponse<ResolvedUIDetail> {
  if (!targetPayload || typeof targetPayload !== 'object') {
    return { status: 'NOT_FOUND', error: `Invalid or empty payload for ${item.id}` };
  }

  if (item.entity_type === 'oxford') {
    const records: CanonicalOxfordEntry[] = Array.isArray(targetPayload)
      ? (targetPayload as CanonicalOxfordEntry[])
      : [targetPayload as CanonicalOxfordEntry];
    const match = records.find((r) => r && r.entry_id === item.id);
    if (!match) {
      return { status: 'NOT_FOUND', error: `Oxford ID ${item.id} not found in ${item.target_file}` };
    }
    return {
      status: 'FOUND',
      data: adaptCanonicalOxfordToUI(match),
      provenance: match.provenance
    };
  }

  if (item.entity_type === 'awl') {
    const payloadObj = targetPayload as Record<string, unknown>;
    const families = Array.isArray(payloadObj.families)
      ? (payloadObj.families as CanonicalAWLFamily[])
      : [];
    const familyMap = new Map<string, CanonicalAWLFamily>(
      families.map((f) => [f.family_id, f])
    );

    if (!familyMap.has(item.id)) {
      return { status: 'NOT_FOUND', error: `AWL family ID ${item.id} not found in ${item.target_file}` };
    }

    if (typeof payloadObj.group_id === 'string') {
      const header: AWLStudyGroupHeader = {
        group_id: payloadObj.group_id,
        group_index: typeof payloadObj.group_index === 'number' ? payloadObj.group_index : 1,
        global_group_index: typeof payloadObj.global_group_index === 'number' ? payloadObj.global_group_index : 1,
        family_ids: Array.isArray(payloadObj.family_ids)
          ? (payloadObj.family_ids as string[])
          : families.map((f) => f.family_id),
        headwords: Array.isArray(payloadObj.headwords)
          ? (payloadObj.headwords as string[])
          : families.map((f) => f.headword)
      };
      const sublistNum = typeof payloadObj.sublist_number === 'number' ? payloadObj.sublist_number : 1;
      const resolvedGroup = resolveAWLStudyGroup(header, sublistNum, familyMap);
      const matchedFamily = familyMap.get(item.id);
      return {
        status: 'FOUND',
        data: resolvedGroup,
        provenance: matchedFamily ? matchedFamily.provenance : undefined
      };
    }

    if (Array.isArray(payloadObj.study_groups_10)) {
      const groups = payloadObj.study_groups_10 as AWLStudyGroupHeader[];
      const matchingHeader = groups.find((g) => g.family_ids.includes(item.id));
      if (!matchingHeader) {
        return { status: 'NOT_FOUND', error: `No AWL study group contains ${item.id}` };
      }
      const sublistNum = typeof payloadObj.sublist_number === 'number' ? payloadObj.sublist_number : 1;
      const resolvedGroup = resolveAWLStudyGroup(matchingHeader, sublistNum, familyMap);
      const matchedFamily = familyMap.get(item.id);
      return {
        status: 'FOUND',
        data: resolvedGroup,
        provenance: matchedFamily ? matchedFamily.provenance : undefined
      };
    }

    return { status: 'NOT_FOUND', error: `Unrecognized AWL payload structure in ${item.target_file}` };
  }

  if (item.entity_type === 'idiom') {
    const records: CanonicalIdiomEntry[] = Array.isArray(targetPayload)
      ? (targetPayload as CanonicalIdiomEntry[])
      : [targetPayload as CanonicalIdiomEntry];
    const match = records.find((r) => r && r.idiom_id === item.id);
    if (!match) {
      return { status: 'NOT_FOUND', error: `Idiom ID ${item.id} not found in ${item.target_file}` };
    }
    return {
      status: 'FOUND',
      data: adaptCanonicalIdiomToUI(match),
      provenance: match.provenance
    };
  }

  if (item.entity_type === 'linking_word') {
    const records: CanonicalLinkingWordEntry[] = Array.isArray(targetPayload)
      ? (targetPayload as CanonicalLinkingWordEntry[])
      : [targetPayload as CanonicalLinkingWordEntry];
    const match = records.find((r) => r && r.linking_id === item.id);
    if (!match) {
      return { status: 'NOT_FOUND', error: `Linking ID ${item.id} not found in ${item.target_file}` };
    }
    return {
      status: 'FOUND',
      data: adaptCanonicalLinkingToUI(match),
      provenance: match.provenance
    };
  }

  if (item.entity_type === 'phrasal_verb') {
    const records: CanonicalPhrasalVerbEntry[] = Array.isArray(targetPayload)
      ? (targetPayload as CanonicalPhrasalVerbEntry[])
      : [targetPayload as CanonicalPhrasalVerbEntry];
    const match = records.find((r) => r && r.pv_id === item.id);
    if (!match) {
      return { status: 'NOT_FOUND', error: `Phrasal Verb ID ${item.id} not found in ${item.target_file}` };
    }
    return {
      status: 'FOUND',
      data: adaptCanonicalPhrasalToUI(match),
      provenance: match.provenance
    };
  }

  if (item.entity_type === 'variant_pair') {
    const records: CanonicalBritishAmericanPair[] = Array.isArray(targetPayload)
      ? (targetPayload as CanonicalBritishAmericanPair[])
      : [targetPayload as CanonicalBritishAmericanPair];
    const match = records.find((r) => r && r.variant_id === item.id);
    if (!match) {
      return { status: 'NOT_FOUND', error: `Variant ID ${item.id} not found in ${item.target_file}` };
    }
    return {
      status: 'FOUND',
      data: adaptCanonicalVariantToUI(match),
      provenance: match.provenance
    };
  }

  return { status: 'NOT_FOUND', error: `Unsupported entity type: ${String(item.entity_type)}` };
}

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

/**
 * Creates a deterministic, publication-safe Mock Resource Bank Provider backed by DEVELOPMENT_FIXTURES.
 * Genuinely executes all declared SearchFilters (term + aliases, letter, entityType, cefr, difficulty,
 * pos, edition, category, skill, skillEvidence), sorting (alphabetical, cefr, difficulty, relevance),
 * dynamic facet aggregation, and pagination (page, pageSize, totalPages, hasMore).
 */
export function createMockResourceBankProvider(bundle: MockFixtureBundle): IResourceBankProvider {
  const allOxfordRecords: CanonicalOxfordEntry[] = [
    bundle.oxfordCard,
    ...(bundle.extraOxfordEntries ?? [])
  ];
  const oxfordRecordMap = new Map<string, CanonicalOxfordEntry>(
    allOxfordRecords.map((r) => [r.entry_id, r])
  );

  const allSearchItems: CompactSearchItem[] = [
    ...bundle.searchResults.items,
    ...(bundle.extraSearchItems ?? []).filter(
      (extra) => !bundle.searchResults.items.some((base) => base.id === extra.id)
    )
  ];

  const targetFileMap: Record<string, unknown> = {
    'DEVELOPMENT_FIXTURES/mock_oxford_card.json': allOxfordRecords,
    'mock_oxford_card.json': allOxfordRecords,
    'DEVELOPMENT_FIXTURES/mock_awl_group.json': bundle.awlGroup,
    'mock_awl_group.json': bundle.awlGroup,
    'DEVELOPMENT_FIXTURES/mock_idiom_card.json': bundle.idiomCard,
    'mock_idiom_card.json': bundle.idiomCard,
    'DEVELOPMENT_FIXTURES/mock_linking_card.json': bundle.linkingCard,
    'mock_linking_card.json': bundle.linkingCard,
    'DEVELOPMENT_FIXTURES/mock_phrasal_card.json': bundle.phrasalCard,
    'mock_phrasal_card.json': bundle.phrasalCard,
    'DEVELOPMENT_FIXTURES/mock_variant_card.json': bundle.variantCard,
    'mock_variant_card.json': bundle.variantCard
  };

  return {
    async search(query: SearchQuery): Promise<SearchResultPage<CompactSearchItem>> {
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

      const filtered = allSearchItems.filter((item) => {
        // 1. Letter prefix filter
        if (letterFilter && letterFilter !== 'ALL') {
          if (!item.normalized_term.toUpperCase().startsWith(letterFilter)) {
            return false;
          }
        }

        // 2. Term + search_aliases matching
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

        // 4. CEFR filter
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

        // 6. Part of Speech (POS) filter (matches either human label e.g. 'Verb' or code e.g. 'v')
        if (filters?.pos && filters.pos.length > 0) {
          const wantedPos = filters.pos.map((p) => p.toLowerCase());
          const itemPos = (item.pos || '').toLowerCase();
          const itemPosCode = (item.pos_code || '').toLowerCase();
          if (!wantedPos.includes(itemPos) && !wantedPos.includes(itemPosCode)) {
            return false;
          }
        }

        // 7. Edition filter (matches UKEnglish, USEnglish, or Both)
        if (filters?.edition && filters.edition.length > 0) {
          const wantedEditions = filters.edition.map((e) => e.toLowerCase());
          const itemEdition = (item.edition || '').toLowerCase();
          if (!wantedEditions.includes(itemEdition)) {
            return false;
          }
        }

        // 8. Category filter
        if (filters?.category && filters.category.length > 0) {
          if (!item.category) return false;
          const wantedCats = filters.category.map((c) => c.toLowerCase());
          if (!wantedCats.includes(item.category.toLowerCase())) {
            return false;
          }
        }

        // 9. Skill & SkillEvidence filter
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

      // Compute dynamic facets across all filtered matches
      const facets = computeSearchFacets(filtered);

      // Sort matched items
      const sortBy = query.sortBy ?? 'alphabetical';
      const direction = query.sortOrder === 'desc' ? -1 : 1;

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
          const aExact = a.normalized_term === normalizedQuery ? 0 : a.normalized_term.startsWith(normalizedQuery) ? 1 : 2;
          const bExact = b.normalized_term === normalizedQuery ? 0 : b.normalized_term.startsWith(normalizedQuery) ? 1 : 2;
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

    async resolveWordDetail(entryId: string): Promise<DetailResolverResponse<UIOxfordCard>> {
      const match = oxfordRecordMap.get(entryId);
      if (match) {
        return {
          status: 'FOUND',
          data: adaptCanonicalOxfordToUI(match),
          provenance: match.provenance,
          attribution: bundle.creditsEntry
        };
      }
      return { status: 'NOT_FOUND', error: `Mock Oxford entry not found: ${entryId}` };
    },

    async resolveSearchItemDetail(item: CompactSearchItem): Promise<DetailResolverResponse<ResolvedUIDetail>> {
      const payload = targetFileMap[item.target_file];
      if (!payload) {
        return { status: 'NOT_FOUND', error: `Mock target file not registered: ${item.target_file}` };
      }
      const res = resolveSearchItemFromPayload(item, payload);
      if (res.status === 'FOUND') {
        return { ...res, attribution: bundle.creditsEntry };
      }
      return res;
    },

    async getAWLSublist(sublistNumber: number): Promise<CanonicalAWLFamily[]> {
      if (sublistNumber === bundle.awlGroup.sublist_number) {
        return bundle.awlGroup.families;
      }
      return [];
    },

    async getAWLStudyGroup(groupId: string): Promise<UIAWLStudyGroup> {
      const familyMap = new Map<string, CanonicalAWLFamily>(
        bundle.awlGroup.families.map((f) => [f.family_id, f])
      );
      if (groupId === bundle.awlGroup.group_id || familyMap.has(groupId)) {
        return resolveAWLStudyGroup(bundle.awlGroup, bundle.awlGroup.sublist_number, familyMap);
      }
      throw new Error(`Mock AWL study group not found: ${groupId}`);
    },

    async getIdioms(difficulty?: IdiomDifficulty, category?: string): Promise<UIIdiomCard[]> {
      const card = adaptCanonicalIdiomToUI(bundle.idiomCard);
      if (difficulty && card.difficulty !== difficulty) return [];
      if (category && card.category !== category) return [];
      return [card];
    },

    async getLinkingWords(functionCategory?: string): Promise<UILinkingCard[]> {
      const card = adaptCanonicalLinkingToUI(bundle.linkingCard);
      if (functionCategory && card.function_category !== functionCategory) return [];
      return [card];
    },

    async getPhrasalVerbs(topic?: string): Promise<UIPhrasalCard[]> {
      const card = adaptCanonicalPhrasalToUI(bundle.phrasalCard);
      if (topic && card.topic !== topic) return [];
      return [card];
    },

    async getRegionalVariants(category?: string): Promise<UIVariantCard[]> {
      const card = adaptCanonicalVariantToUI(bundle.variantCard);
      if (category && card.category !== category) return [];
      return [card];
    },

    async getAttributionRequirements(): Promise<SourceAttributionRegistry> {
      return {
        metadata: {
          title: 'Mock Attribution Registry',
          stage: 'Stage 4B',
          transform_version: 'stage_4b_v2.3',
          generated_at: '2026-10-29T00:00:00Z',
          policy: 'MOCK_DATA_ONLY',
          clearance_status: 'OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF'
        },
        media_policy: {
          video_policy_code: 'EXTERNAL_LINK_OUT_ONLY',
          rule: 'External links only via target=_blank rel=noopener noreferrer'
        },
        attributions: [bundle.creditsEntry]
      };
    }
  };
}

// ============================================================================
// 8. ATTRIBUTION & RIGHTS GOVERNANCE MODELS
// ============================================================================

export interface ExternalLink {
  label: string;
  url: string;
  access_mode: 'EXTERNAL_LINK_OUT_ONLY';
}

export interface SourceAttribution {
  source_id: string;
  provider_name: string;
  associated_collections: string[];
  usage_scope: string;
  verification_status: RightsVerificationStatus;
  acknowledgment_text: string;
  source_links: ExternalLink[];
  video_links: ExternalLink[];
  display_zones: string[];
  media_policy: 'EXTERNAL_LINK_ONLY';
}

export interface SourceAttributionRegistry {
  metadata: {
    title: string;
    stage: string;
    transform_version: string;
    generated_at: string;
    policy: string;
    clearance_status: RightsVerificationStatus;
  };
  media_policy: {
    video_policy_code: 'EXTERNAL_LINK_OUT_ONLY';
    rule: string;
  };
  attributions: SourceAttribution[];
}

// ============================================================================
// 9. LEARNER PROGRESS DECOUPLING (Client State)
// ============================================================================

export type LearnerMasteryLevel = 'NEW' | 'LEARNING' | 'PRACTICED' | 'MASTERED';

export interface LearnerProgressItem {
  resourceId: string;
  collectionId: string;
  masteryLevel: LearnerMasteryLevel;
  reviewCount: number;
  lastReviewedAt: string | null;
  bookmarked: boolean;
  personalNotes?: string;
}

export interface ILearnerProgressStore {
  getProgress(resourceId: string): Promise<LearnerProgressItem | null>;
  saveProgress(item: LearnerProgressItem): Promise<void>;
  toggleBookmark(resourceId: string, collectionId: string): Promise<boolean>;
  listBookmarked(collectionId?: string): Promise<LearnerProgressItem[]>;
}

