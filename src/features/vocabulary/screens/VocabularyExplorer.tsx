import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AppShell } from '../../../components/AppShell';
import { Badge, Button, Card, EmptyState, PageHeader } from '../../../components/UI';
import { mutateLearning, useLearning } from '../../../services/platform';
import {
  adaptCanonicalOxfordToUI,
  type CEFRLevel,
  type CompactSearchItem,
  type IResourceBankProvider,
  type OxfordPOSCode,
  type SearchFilters,
  type SearchResultPage,
  type UIOxfordCard
} from '../../../types/resourceBank';
import {
  defaultMockResourceBankProvider,
  SYNTHETIC_CREDITS_ENTRY,
  SYNTHETIC_OXFORD_ENTRIES
} from '../services/syntheticCatalog';
import { useResourceBank } from '../services/resourceBankHooks';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CEFR_OPTIONS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const POS_OPTIONS = [
  { label: 'All Parts of Speech', value: 'ALL' },
  { label: 'Verb (v)', value: 'Verb' },
  { label: 'Noun (n)', value: 'Noun' },
  { label: 'Adjective (adj)', value: 'Adjective' },
  { label: 'Adverb (adv)', value: 'Adverb' },
  { label: 'Preposition (prep)', value: 'Preposition' },
  { label: 'Conjunction (conj)', value: 'Conjunction' }
];
const EDITION_OPTIONS = [
  { label: 'All Editions', value: 'ALL' },
  { label: 'UK English (UKEnglish)', value: 'UKEnglish' },
  { label: 'US English (USEnglish)', value: 'USEnglish' }
];
const SKILL_OPTIONS = [
  { label: 'All IELTS Skills', value: 'ALL' },
  { label: 'Writing Task 1', value: 'Writing Task 1' },
  { label: 'Writing Task 2', value: 'Writing Task 2' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Listening', value: 'Listening' },
  { label: 'Speaking', value: 'Speaking' }
];
const SORT_OPTIONS = [
  { label: 'Alphabetical (A → Z)', value: 'alphabetical-asc' },
  { label: 'Alphabetical (Z → A)', value: 'alphabetical-desc' },
  { label: 'CEFR Level (A1 → C1)', value: 'cefr-asc' },
  { label: 'CEFR Level (C1 → A1)', value: 'cefr-desc' }
];

const SYNCHRONOUS_OXFORD_UI_MAP = new Map<string, UIOxfordCard>(
  SYNTHETIC_OXFORD_ENTRIES.map((entry) => [entry.entry_id, adaptCanonicalOxfordToUI(entry)])
);

function isBrowserTTSSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

export function VocabularyHubScreen() {
  const state = useLearning();
  const savedCount = state.vocabulary.length;
  const { mode } = useResourceBank();
  const isRealData = mode === 'PRIVATE_DEV_REAL_DATA';

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        Back to Learn
      </Link>
      <PageHeader
        eyebrow={isRealData ? "Learn · Vocabulary · Oxford 3000/5000" : "Learn · Vocabulary"}
        title="Vocabulary Hub"
        description={
          isRealData
            ? "Build academic and general IELTS lexical range. Explore all 10,270 Oxford entries powered by the real data provider, or practise the words you have saved."
            : "Build academic and general IELTS lexical range. Explore our interactive Vocabulary Explorer with synthetic development fixtures, or practise the words you have saved."
        }
      />

      <section
        className="vocab-governance-banner"
        role="region"
        aria-label="Dataset governance and mock mode notice"
      >
        <div className="vocab-governance-header">
          {isRealData ? (
            <>
              <Badge tone="ai">REAL_RESOURCE_BANK_ACTIVE</Badge>
              <Badge tone="blue">10,270 Oxford Entries (44 Shards)</Badge>
              <span className="vocab-governance-tag">Local Development Shards Active (/api/private-data/)</span>
            </>
          ) : (
            <>
              <Badge tone="blue">MOCK_DATA_ONLY</Badge>
              <Badge tone="amber">OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF</Badge>
              <span className="vocab-governance-tag">Synthetic Development Fixtures Active</span>
            </>
          )}
        </div>
        <p className="vocab-governance-text">
          {isRealData ? (
            <>
              Connected to the <strong>Real Resource Bank Provider</strong> serving 10,270 normalized Oxford lexical entries across 44 detail shards and 41 search index shards. Public builds remain strictly guarded by fail-closed <code>MOCK_DATA_ONLY</code> isolation.
            </>
          ) : (
            <>
              This public preview runs in <strong>fail-closed mock mode</strong> using 20 original synthetic lexical entries (<code>MOCK_OXF_001</code>–<code>MOCK_OXF_020</code>). Proprietary source CSVs, the 10,270-record Oxford dataset, 570 AWL families, and the quarantined grouped-idiom concordance corpus remain strictly isolated outside client bundles pending private licensing clearance.
            </>
          )}
        </p>
      </section>

      <div className="discovery-grid vocab-hub-grid">
        <Card className="discovery-card vocab-hub-primary-card">
          <div className="discovery-card-top">
            <span className="discovery-icon">
              <BookOpen size={22} aria-hidden="true" />
            </span>
            <span className="availability-label">
              {isRealData ? 'Real Oxford Bank (10,270 entries)' : 'Synthetic Demo (20 entries)'}
            </span>
          </div>
          <h2>All Vocabulary Explorer</h2>
          <p>
            {isRealData
              ? 'Search 10,270 Oxford headwords, browse A–Z (including explicit empty-letter X handling), filter by CEFR level (A1–C1), Part of Speech, UK/US edition, and IELTS skill, sort alphabetically or by CEFR, and inspect complete word definitions, collocations, and examples.'
              : 'Search headwords and aliases, browse A–Z (including explicit empty-letter X handling), filter by CEFR level (A1–C1), Part of Speech, UK/US edition, and IELTS skill, sort alphabetically or by CEFR, and expand cards for collocations and examples.'}
          </p>
          <div className="vocab-hub-card-actions">
            <Link
              className="btn btn-primary"
              to="/learn/vocabulary/all"
              aria-label="Open All Vocabulary Explorer"
            >
              Open All Vocabulary Explorer
            </Link>
          </div>
        </Card>

        <Card className="discovery-card">
          <div className="discovery-card-top">
            <span className="discovery-icon">
              <Bookmark size={22} aria-hidden="true" />
            </span>
            <span className="availability-label">{savedCount} saved words</span>
          </div>
          <h2>My Saved Vocabulary</h2>
          <p>
            Revisit the words you have bookmarked from lessons, reading passages, or the All Vocabulary Explorer, and practise active meaning recall.
          </p>
          <div className="vocab-hub-card-actions">
            <Link className="btn btn-secondary" to="/saved">
              Open My Saved Vocabulary
            </Link>
          </div>
        </Card>

        <Card className="discovery-card">
          <div className="discovery-card-top">
            <span className="discovery-icon">
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <span className="availability-label">Sample available</span>
          </div>
          <h2>Vocabulary Sample Lessons</h2>
          <p>
            Practise vocabulary in context with our existing starter lesson samples before moving to timed IELTS skill workspaces.
          </p>
          <div className="vocab-hub-card-actions">
            <Link className="btn btn-secondary" to="/learn/lessons?category=Vocabulary">
              Browse Vocabulary Lessons
            </Link>
          </div>
        </Card>
      </div>

      <Card className="vocab-quick-alpha-card">
        <div className="vocab-quick-alpha-header">
          <div>
            <h3>Quick A–Z Explorer Jump</h3>
            <p className="muted-note">
              Select any starting letter to open the All Vocabulary Explorer filtered to that letter (select <strong>X</strong> to inspect the zero-entry letter state).
            </p>
          </div>
          <Link className="btn btn-ghost" to="/learn/vocabulary/all">
            View all letters (A–Z)
          </Link>
        </div>
        <div className="vocab-alpha-bar" role="navigation" aria-label="Quick A to Z jump">
          {ALPHABET.map((letter) => (
            <Link
              key={letter}
              to={`/learn/vocabulary/all?letter=${letter}`}
              className={`vocab-alpha-btn ${letter === 'X' ? 'vocab-alpha-empty-hint' : ''}`}
              aria-label={`Browse vocabulary starting with ${letter}${letter === 'X' ? ' (0 entries in lexicon)' : ''}`}
            >
              {letter}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="vocab-architecture-card">
        <h3>Stage 4B Resource Bank Architecture & Collection Status</h3>
        <p className="muted-note">
          All collections share the unified <code>IResourceBankProvider</code> contract and projection adapters (<code>adaptCanonical*ToUI</code>) while keeping real datasets outside public static assets.
        </p>
        <div className="about-table-wrap">
          <table className="about-table">
            <thead>
              <tr>
                <th scope="col">Collection</th>
                <th scope="col">Adapter / Contract</th>
                <th scope="col">Public Build Mode</th>
                <th scope="col">Governance Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Vocabulary Explorer (CARD_01)</strong></td>
                <td><code>adaptCanonicalOxfordToUI</code></td>
                <td>{isRealData ? 'Active Real Explorer (10,270 entries)' : 'Active Synthetic Explorer (20 mock entries)'}</td>
                <td>
                  <code>
                    {isRealData
                      ? 'PRIVATE_DEV_REAL_DATA (10,270 entries connected; fail-closed MOCK_DATA_ONLY in prod)'
                      : 'MOCK_DATA_ONLY (10,270 source entries gated)'}
                  </code>
                </td>
              </tr>
              <tr>
                <td><strong>Academic Word List (CARD_02)</strong></td>
                <td><code>resolveAWLStudyGroup</code> (10-family groups)</td>
                <td>Adapter verified (<code>MOCK_AWL_GRP_01</code>)</td>
                <td><code>OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF</code></td>
              </tr>
              <tr>
                <td><strong>Phrasal Verbs (CARD_05)</strong></td>
                <td><code>adaptCanonicalPhrasalToUI</code></td>
                <td>Adapter verified (<code>MOCK_PV_001</code>)</td>
                <td><code>OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF</code></td>
              </tr>
              <tr>
                <td><strong>IELTS Idioms Handbook (CARD_06)</strong></td>
                <td><code>adaptCanonicalIdiomToUI</code></td>
                <td>Curated mock only (Grouped corpus excluded)</td>
                <td>Grouped corpus: <code>QUARANTINED_RESEARCH_ONLY</code></td>
              </tr>
              <tr>
                <td><strong>Linking Words (CARD_09)</strong></td>
                <td><code>adaptCanonicalLinkingToUI</code></td>
                <td>Adapter verified (<code>MOCK_LNK_001</code>)</td>
                <td><code>OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF</code></td>
              </tr>
              <tr>
                <td><strong>Regional Terminology & Spelling (CARD_10)</strong></td>
                <td><code>adaptCanonicalVariantToUI</code></td>
                <td>Adapter verified (<code>MOCK_VAR_001</code>)</td>
                <td><code>OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}

export interface AllVocabularyExplorerProps {
  customProvider?: IResourceBankProvider;
  initialLetter?: string;
  initialQuery?: string;
  initialCefr?: CEFRLevel | 'ALL';
  initialPos?: string;
  initialEdition?: string;
  initialSkill?: string;
  initialSort?: string;
  initialPageSize?: number;
  initialPage?: number;
  initialExpandedId?: string | null;
  initialSimulatedState?: 'normal' | 'loading' | 'error';
  forceTTSAvailable?: boolean;
}

export function AllVocabularyExplorerScreen({
  customProvider,
  initialLetter,
  initialQuery,
  initialCefr,
  initialPos,
  initialEdition,
  initialSkill,
  initialSort,
  initialPageSize = 6,
  initialPage = 1,
  initialExpandedId = null,
  initialSimulatedState = 'normal',
  forceTTSAvailable
}: AllVocabularyExplorerProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useLearning();
  const resourceBank = useResourceBank();
  const provider = customProvider ?? resourceBank.provider;
  const isRealData = !customProvider && resourceBank.mode === 'PRIVATE_DEV_REAL_DATA';
  const isMockMode = !isRealData;

  const [queryTerm, setQueryTerm] = useState<string>(
    initialQuery ?? searchParams.get('q') ?? ''
  );
  const [selectedLetter, setSelectedLetter] = useState<string>(
    (initialLetter ?? searchParams.get('letter') ?? 'ALL').toUpperCase()
  );
  const [selectedCefr, setSelectedCefr] = useState<CEFRLevel | 'ALL'>(
    (initialCefr ?? (searchParams.get('cefr') as CEFRLevel) ?? 'ALL')
  );
  const [selectedPos, setSelectedPos] = useState<string>(
    initialPos ?? searchParams.get('pos') ?? 'ALL'
  );
  const [selectedEdition, setSelectedEdition] = useState<string>(
    initialEdition ?? searchParams.get('edition') ?? 'ALL'
  );
  const [selectedSkill, setSelectedSkill] = useState<string>(
    initialSkill ?? searchParams.get('skill') ?? 'ALL'
  );
  const [sortOption, setSortOption] = useState<string>(
    initialSort ?? searchParams.get('sort') ?? 'alphabetical-asc'
  );
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(
    Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : initialPage
  );
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(
    initialExpandedId ? { [initialExpandedId]: true } : {}
  );
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'error'>(
    initialSimulatedState
  );
  const [speakingWordId, setSpeakingWordId] = useState<string | null>(null);
  const [ttsStatusMessage, setTtsStatusMessage] = useState<string | null>(null);

  const ttsSupported = useMemo(
    () => (typeof forceTTSAvailable === 'boolean' ? forceTTSAvailable : isBrowserTTSSupported()),
    [forceTTSAvailable]
  );

  const [sortBy, sortOrder] = useMemo(() => {
    const [field, dir] = sortOption.split('-');
    return [
      (field === 'cefr' ? 'cefr' : 'alphabetical') as 'alphabetical' | 'cefr',
      (dir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
    ];
  }, [sortOption]);

  const activeFilters = useMemo<SearchFilters>(() => {
    const f: SearchFilters = {
      entityType: ['oxford']
    };
    if (selectedLetter && selectedLetter !== 'ALL') {
      f.letter = selectedLetter;
    }
    if (selectedCefr && selectedCefr !== 'ALL') {
      f.cefr = [selectedCefr];
    }
    if (selectedPos && selectedPos !== 'ALL') {
      f.pos = [selectedPos];
    }
    if (selectedEdition && selectedEdition !== 'ALL') {
      f.edition = [selectedEdition];
    }
    if (selectedSkill && selectedSkill !== 'ALL') {
      f.skill = selectedSkill;
    }
    return f;
  }, [selectedLetter, selectedCefr, selectedPos, selectedEdition, selectedSkill]);

  // Compute initial synchronous result for deterministic SSR and zero-flicker initial render
  const initialSyncResult = useMemo<SearchResultPage<CompactSearchItem>>(() => {
    if (!isMockMode) {
      return {
        items: [],
        totalMatches: 0,
        page: 1,
        pageSize,
        totalPages: 0,
        hasMore: false,
        facets: { cefr: {}, difficulty: {}, pos: {}, skills: {}, entityTypes: {} }
      };
    }

    const normalizedQuery = queryTerm.trim().toLowerCase();
    if (selectedLetter === 'X') {
      const emptyX: SearchResultPage<CompactSearchItem> = {
        items: [],
        totalMatches: 0,
        page: 1,
        pageSize,
        totalPages: 0,
        hasMore: false,
        facets: { cefr: {}, difficulty: {}, pos: {}, skills: {}, entityTypes: {} }
      };
      return emptyX;
    }

    const baseItems = SYNTHETIC_OXFORD_ENTRIES.map((entry) => {
      const card = SYNCHRONOUS_OXFORD_UI_MAP.get(entry.entry_id)!;
      return { entry, card };
    });

    // Use provider search synchronously on initial render by mirroring the exact filter/sort/page rules
    const CEFR_RANK_LOCAL: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const matchedEntries = baseItems.filter(({ entry }) => {
      const termLower = entry.headword_clean.toLowerCase();
      if (selectedLetter !== 'ALL' && !termLower.toUpperCase().startsWith(selectedLetter)) {
        return false;
      }
      if (normalizedQuery) {
        const inWord = termLower.includes(normalizedQuery);
        const inMeaning = entry.meaning.toLowerCase().includes(normalizedQuery);
        if (!inWord && !inMeaning) {
          // Check aliases via provider on async pass; sync fallback checks headword
          return false;
        }
      }
      if (selectedCefr !== 'ALL' && entry.cefr_level !== selectedCefr) return false;
      if (
        selectedPos !== 'ALL' &&
        entry.part_of_speech.toLowerCase() !== selectedPos.toLowerCase() &&
        entry.pos_code.toLowerCase() !== selectedPos.toLowerCase()
      ) {
        return false;
      }
      if (selectedEdition !== 'ALL' && entry.edition !== selectedEdition) return false;
      if (
        selectedSkill !== 'ALL' &&
        !entry.ielts_usage_tags.some((t) => t.toLowerCase().includes(selectedSkill.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });

    const dir = sortOrder === 'desc' ? -1 : 1;
    matchedEntries.sort((a, b) => {
      if (sortBy === 'cefr') {
        const rA = CEFR_RANK_LOCAL[a.entry.cefr_level] ?? 99;
        const rB = CEFR_RANK_LOCAL[b.entry.cefr_level] ?? 99;
        if (rA !== rB) return (rA - rB) * dir;
      }
      return a.entry.headword_clean.localeCompare(b.entry.headword_clean) * dir;
    });

    const totalMatches = matchedEntries.length;
    const totalPages = totalMatches === 0 ? 0 : Math.ceil(totalMatches / pageSize);
    const safePage = Math.max(1, Math.min(page, Math.max(1, totalPages)));
    const sliced = matchedEntries.slice((safePage - 1) * pageSize, safePage * pageSize);

    const cefrFacets: Record<string, number> = {};
    const posFacets: Record<string, number> = {};
    for (const { entry } of matchedEntries) {
      cefrFacets[entry.cefr_level] = (cefrFacets[entry.cefr_level] ?? 0) + 1;
      posFacets[entry.part_of_speech] = (posFacets[entry.part_of_speech] ?? 0) + 1;
    }

    return {
      items: sliced.map(({ entry }) => ({
        id: entry.entry_id,
        term: entry.headword_clean,
        normalized_term: entry.headword_clean.toLowerCase(),
        search_aliases: [entry.headword_clean],
        entity_type: 'oxford',
        cefr_level: entry.cefr_level,
        difficulty: null,
        pos: entry.part_of_speech,
        pos_code: entry.pos_code,
        edition: entry.edition,
        category: null,
        topic_code: null,
        skills: entry.ielts_usage_tags,
        direct_skills: entry.ielts_usage_tags,
        skill_mappings: entry.ielts_usage_tags.map((skill) => ({
          skill,
          evidence:
            entry.entry_id.includes('003') ||
            entry.entry_id.includes('011') ||
            entry.entry_id.includes('019')
              ? 'proposed_unreviewed'
              : 'source_tagged',
          approval_status:
            entry.entry_id.includes('003') ||
            entry.entry_id.includes('011') ||
            entry.entry_id.includes('019')
              ? 'PROPOSED_UNREVIEWED'
              : 'SOURCE_VERIFIED'
        })),
        target_file: 'DEVELOPMENT_FIXTURES/mock_oxford_card.json'
      })),
      totalMatches,
      page: safePage,
      pageSize,
      totalPages,
      hasMore: safePage < totalPages,
      facets: {
        cefr: cefrFacets,
        difficulty: {},
        pos: posFacets,
        skills: {},
        entityTypes: { oxford: totalMatches }
      }
    };
  }, [
    isMockMode,
    queryTerm,
    selectedLetter,
    selectedCefr,
    selectedPos,
    selectedEdition,
    selectedSkill,
    sortBy,
    sortOrder,
    page,
    pageSize
  ]);

  const [resultPage, setResultPage] = useState<SearchResultPage<CompactSearchItem>>(initialSyncResult);
  const [resolvedCards, setResolvedCards] = useState<Record<string, UIOxfordCard>>(() => {
    const map: Record<string, UIOxfordCard> = {};
    for (const [id, card] of SYNCHRONOUS_OXFORD_UI_MAP.entries()) {
      map[id] = card;
    }
    return map;
  });
  const [isLoading, setIsLoading] = useState<boolean>(!isMockMode);
  const [providerError, setProviderError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function runQuery() {
      setIsLoading(true);
      setProviderError(null);
      try {
        const res = await provider.search({
          term: queryTerm,
          filters: activeFilters,
          page,
          pageSize,
          sortBy,
          sortOrder
        });
        if (cancelled) return;
        setResultPage(res);

        // Resolve full UIOxfordCard detail for each returned item via provider
        const detailEntries = await Promise.all(
          res.items.map(async (item) => {
            const detailRes = await provider.resolveWordDetail(item.id);
            return [item.id, detailRes.status === 'FOUND' && detailRes.data ? detailRes.data : null] as const;
          })
        );
        if (cancelled) return;
        setResolvedCards((prev) => {
          const next = { ...prev };
          for (const [id, data] of detailEntries) {
            if (data) next[id] = data;
          }
          return next;
        });
        setIsLoading(false);
      } catch (err) {
        if (cancelled) return;
        setProviderError(err instanceof Error ? err.message : 'Unable to query vocabulary provider.');
        setIsLoading(false);
      }
    }
    void runQuery();
    return () => {
      cancelled = true;
    };
  }, [provider, queryTerm, activeFilters, page, pageSize, sortBy, sortOrder]);

  const hasActiveFilters =
    queryTerm.trim() !== '' ||
    selectedLetter !== 'ALL' ||
    selectedCefr !== 'ALL' ||
    selectedPos !== 'ALL' ||
    selectedEdition !== 'ALL' ||
    selectedSkill !== 'ALL';

  function resetAllFilters() {
    setQueryTerm('');
    setSelectedLetter('ALL');
    setSelectedCefr('ALL');
    setSelectedPos('ALL');
    setSelectedEdition('ALL');
    setSelectedSkill('ALL');
    setSortOption('alphabetical-asc');
    setPage(1);
    setSimulatedState('normal');
    setProviderError(null);
    setSearchParams({});
  }

  function handleLetterSelect(letter: string) {
    setSelectedLetter(letter);
    setPage(1);
  }

  function toggleCardExpanded(id: string) {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handlePronounce(card: UIOxfordCard) {
    if (!ttsSupported || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsStatusMessage(`Browser TTS is unavailable in this environment for "${card.word}".`);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(card.word);
      utterance.lang = card.edition === 'USEnglish' ? 'en-US' : 'en-GB';
      utterance.rate = 0.95;
      setSpeakingWordId(card.id);
      setTtsStatusMessage(
        `Speaking "${card.word}" via browser speech synthesis (${utterance.lang}).`
      );
      utterance.onend = () => setSpeakingWordId(null);
      utterance.onerror = () => setSpeakingWordId(null);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingWordId(null);
      setTtsStatusMessage(`Could not play browser TTS for "${card.word}".`);
    }
  }

  function handleSaveWord(card: UIOxfordCard) {
    mutateLearning((s) => {
      if (!s.vocabulary.some((w) => w.word.toLowerCase() === card.word.toLowerCase())) {
        s.vocabulary.unshift({
          word: card.word,
          meaning: card.definition,
          context: `Vocabulary Explorer (${card.cefr_level} · ${card.part_of_speech})`,
          mastered: false
        });
      }
    });
  }

  const effectiveLoading = simulatedState === 'loading' || isLoading;
  const effectiveError =
    simulatedState === 'error'
      ? 'Simulated Resource Bank provider connection error: Shard fetch timed out in mock resilience check.'
      : providerError ?? (isRealData && resourceBank.error ? resourceBank.error.message : null);

  const startIndex = resultPage.totalMatches === 0 ? 0 : (resultPage.page - 1) * resultPage.pageSize + 1;
  const endIndex = Math.min(resultPage.page * resultPage.pageSize, resultPage.totalMatches);

  const pageWindow = useMemo(() => {
    const current = resultPage.page;
    const total = resultPage.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < total - 1) pages.push('ellipsis');
    pages.push(total);
    return pages;
  }, [resultPage.page, resultPage.totalPages]);

  return (
    <AppShell>
      <div className="vocab-breadcrumb-row">
        <Link className="discovery-back" to="/learn/category/vocabulary">
          Back to Vocabulary Hub
        </Link>
        <span className="vocab-breadcrumb-sep" aria-hidden="true">/</span>
        <Link className="discovery-back" to="/learn">
          Learn Catalog
        </Link>
      </div>

      <PageHeader
        eyebrow={isRealData ? "Learn · Vocabulary · Oxford 3000/5000" : "Learn · Vocabulary · Synthetic Fixtures"}
        title="All Vocabulary Explorer"
        description={
          isRealData
            ? "Search, filter, sort, and inspect 10,270 Oxford 3000/5000 vocabulary cards powered by the Real Resource Bank Provider."
            : "Search, filter, sort, and inspect structured vocabulary cards powered by the Stage 4B Resource Bank adapter and publication-safe synthetic fixtures."
        }
        actions={
          <Link className="btn btn-secondary" to="/saved">
            My Saved Words ({state.vocabulary.length})
          </Link>
        }
      />

      <section
        className="vocab-governance-banner vocab-explorer-banner"
        role="region"
        aria-label="Dataset governance and audio provenance notice"
      >
        <div className="vocab-governance-header">
          {isRealData ? (
            <>
              <Badge tone="ai">REAL_RESOURCE_BANK_ACTIVE</Badge>
              <Badge tone="blue">10,270 Oxford Entries (44 Shards)</Badge>
              <Badge tone="green">LRU Shard Cache Active (Max 5)</Badge>
            </>
          ) : (
            <>
              <Badge tone="blue">MOCK_DATA_ONLY</Badge>
              <Badge tone="gray">20 Synthetic Entries (MOCK_OXF_001–020)</Badge>
            </>
          )}
          <Badge tone={ttsSupported ? 'green' : 'amber'}>
            {ttsSupported
              ? 'Pronunciation: Browser TTS Active (No Recorded Lexicon Audio)'
              : 'Pronunciation: Unavailable (No Browser TTS / No Recorded Audio)'}
          </Badge>
        </div>
        <div className="vocab-resilience-bar" role="group" aria-label="Resilience state verification controls">
          <span className="vocab-resilience-label">UI State Check:</span>
          <button
            type="button"
            className={`vocab-state-pill ${simulatedState === 'normal' ? 'active' : ''}`}
            aria-pressed={simulatedState === 'normal'}
            onClick={() => setSimulatedState('normal')}
          >
            Normal Data
          </button>
          <button
            type="button"
            className={`vocab-state-pill ${simulatedState === 'loading' ? 'active' : ''}`}
            aria-pressed={simulatedState === 'loading'}
            onClick={() => setSimulatedState('loading')}
          >
            Loading State
          </button>
          <button
            type="button"
            className={`vocab-state-pill ${simulatedState === 'error' ? 'active' : ''}`}
            aria-pressed={simulatedState === 'error'}
            onClick={() => setSimulatedState('error')}
          >
            Error State
          </button>
        </div>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="vocab-explorer-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search vocabulary headwords or aliases</span>
          </label>
          <input
            id="vocab-explorer-search"
            type="search"
            className="input vocab-search-input"
            value={queryTerm}
            onChange={(e) => {
              setQueryTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search headword or alias (e.g. achieve, attain, bolster, empirical, ubiquitous)..."
            aria-label="Search vocabulary headwords or aliases"
          />
          {hasActiveFilters && (
            <Button kind="secondary" onClick={resetAllFilters}>
              <RotateCcw size={15} aria-hidden="true" /> Reset all filters
            </Button>
          )}
        </div>

        <div className="vocab-alpha-section">
          <div className="vocab-alpha-label-row">
            <span className="vocab-control-heading">A–Z Headword Index</span>
            <span className="muted-note">
              {selectedLetter === 'ALL'
                ? 'Showing all letters A–Z'
                : `Filtered to starting letter "${selectedLetter}"`}
            </span>
          </div>
          <div className="vocab-alpha-bar" role="toolbar" aria-label="Filter vocabulary by starting letter">
            <button
              type="button"
              className={`vocab-alpha-btn ${selectedLetter === 'ALL' ? 'active' : ''}`}
              aria-pressed={selectedLetter === 'ALL'}
              onClick={() => handleLetterSelect('ALL')}
            >
              All
            </button>
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                className={`vocab-alpha-btn ${selectedLetter === letter ? 'active' : ''} ${
                  letter === 'X' ? 'vocab-alpha-empty-hint' : ''
                }`}
                aria-pressed={selectedLetter === letter}
                aria-label={`Letter ${letter}${letter === 'X' ? ' (0 entries)' : ''}`}
                onClick={() => handleLetterSelect(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        <div className="vocab-filters-grid">
          <label className="field vocab-filter-field">
            <span>
              <Filter size={13} aria-hidden="true" /> CEFR Level
            </span>
            <select
              id="vocab-filter-cefr"
              className="select"
              aria-label="Filter by CEFR level"
              value={selectedCefr}
              onChange={(e) => {
                setSelectedCefr(e.target.value as CEFRLevel | 'ALL');
                setPage(1);
              }}
            >
              <option value="ALL">All CEFR Levels (A1–C1)</option>
              {CEFR_OPTIONS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl} {resultPage.facets.cefr[lvl] !== undefined ? `(${resultPage.facets.cefr[lvl]})` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="field vocab-filter-field">
            <span>Part of Speech</span>
            <select
              id="vocab-filter-pos"
              className="select"
              aria-label="Filter by Part of Speech"
              value={selectedPos}
              onChange={(e) => {
                setSelectedPos(e.target.value);
                setPage(1);
              }}
            >
              {POS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field vocab-filter-field">
            <span>English Edition</span>
            <select
              id="vocab-filter-edition"
              className="select"
              aria-label="Filter by English edition"
              value={selectedEdition}
              onChange={(e) => {
                setSelectedEdition(e.target.value);
                setPage(1);
              }}
            >
              {EDITION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field vocab-filter-field">
            <span>IELTS Skill Tag</span>
            <select
              id="vocab-filter-skill"
              className="select"
              aria-label="Filter by IELTS skill"
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                setPage(1);
              }}
            >
              {SKILL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field vocab-filter-field">
            <span>Sort Order</span>
            <select
              id="vocab-filter-sort"
              className="select"
              aria-label="Sort vocabulary entries"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field vocab-filter-field">
            <span>Page Size</span>
            <select
              id="vocab-filter-pagesize"
              className="select"
              aria-label="Entries per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </label>
        </div>
      </Card>

      {ttsStatusMessage && (
        <div className="vocab-tts-toast" role="status" aria-live="polite">
          <span>{ttsStatusMessage}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTtsStatusMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STATE 1: LOADING */}
      {effectiveLoading ? (
        <Card className="vocab-state-card">
          <div className="vocab-loading-indicator" role="status" aria-live="polite">
            <span className="vocab-spinner" aria-hidden="true" />
            <div>
              <h2>Loading synthetic vocabulary entries…</h2>
              <p className="muted-note">
                Resolving search index facets and projecting canonical records via <code>adaptCanonicalOxfordToUI</code>.
              </p>
            </div>
          </div>
        </Card>
      ) : effectiveError ? (
        /* STATE 2: ERROR */
        <Card className="vocab-state-card vocab-error-card">
          <div role="alert">
            <div className="vocab-error-header">
              <ShieldAlert size={24} aria-hidden="true" />
              <div>
                <h2>Vocabulary Explorer could not load entries</h2>
                <p>{effectiveError}</p>
              </div>
            </div>
            <div className="button-row section-space">
              <Button
                onClick={() => {
                  setSimulatedState('normal');
                  setProviderError(null);
                }}
              >
                Retry loading
              </Button>
              <Button kind="secondary" onClick={resetAllFilters}>
                Reset filters
              </Button>
            </div>
          </div>
        </Card>
      ) : selectedLetter === 'X' ? (
        /* STATE 3: EXPLICIT EMPTY LETTER X (Stage 4B Section 3.2 Rule) */
        <Card className="vocab-state-card vocab-empty-x-card">
          <div role="status">
            <Badge tone="amber">Empty Lexicon Shard · Letter X (0 Records)</Badge>
            <h2>No Oxford vocabulary entries begin with the letter X</h2>
            <p>
              In accordance with the Stage 4B search manifest specification, the source vocabulary contains <strong>0 headwords</strong> starting with the letter <strong>X</strong>. This empty state is rendered immediately without initiating a shard network request.
            </p>
            <div className="button-row section-space">
              <Button onClick={() => handleLetterSelect('ALL')}>Show all letters (A–Z)</Button>
              <Button kind="secondary" onClick={() => handleLetterSelect('A')}>
                Browse Letter A
              </Button>
            </div>
          </div>
        </Card>
      ) : resultPage.items.length === 0 ? (
        /* STATE 4: GENERAL EMPTY FILTER / SEARCH STATE */
        <EmptyState
          title={isRealData ? "No Oxford vocabulary entries match your active filters" : "No synthetic vocabulary entries match your active filters"}
          detail={`No words matched ${[
            queryTerm ? `query "${queryTerm}"` : null,
            selectedLetter !== 'ALL' ? `letter "${selectedLetter}"` : null,
            selectedCefr !== 'ALL' ? `CEFR ${selectedCefr}` : null,
            selectedPos !== 'ALL' ? `POS ${selectedPos}` : null,
            selectedEdition !== 'ALL' ? `Edition ${selectedEdition}` : null,
            selectedSkill !== 'ALL' ? `Skill ${selectedSkill}` : null
          ]
            .filter(Boolean)
            .join(', ')}. Try broadening your filters or resetting to the full ${isRealData ? 'vocabulary catalog' : 'synthetic catalog'}.`}
          action="Clear all filters"
          onAction={resetAllFilters}
        />
      ) : (
        /* STATE 5: POPULATED RESULTS GRID + PAGINATION */
        <>
          <div className="vocab-results-summary-bar" role="status" aria-live="polite">
            <span>
              Showing <strong>{startIndex}–{endIndex}</strong> of{' '}
              <strong>{resultPage.totalMatches}</strong> matching {isRealData ? 'Oxford vocabulary' : 'synthetic'} entries (Page{' '}
              <strong>{resultPage.page}</strong> of <strong>{resultPage.totalPages}</strong>)
            </span>
            <div className="vocab-facet-pills">
              {CEFR_OPTIONS.map((lvl) => {
                const count = resultPage.facets.cefr[lvl] ?? 0;
                return (
                  <button
                    key={lvl}
                    type="button"
                    className={`vocab-cefr-chip ${selectedCefr === lvl ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCefr(selectedCefr === lvl ? 'ALL' : lvl);
                      setPage(1);
                    }}
                    aria-pressed={selectedCefr === lvl}
                  >
                    {lvl}: {count}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="vocab-cards-grid">
            {resultPage.items.map((item) => {
              const card: UIOxfordCard = resolvedCards[item.id] ?? SYNCHRONOUS_OXFORD_UI_MAP.get(item.id) ?? {
                id: item.id,
                word: item.term,
                edition: (item.edition === 'USEnglish' ? 'USEnglish' : 'UKEnglish') as 'UKEnglish' | 'USEnglish',
                part_of_speech: item.pos || 'Word',
                pos_code: (item.pos_code || 'n') as OxfordPOSCode,
                cefr_level: (item.cefr_level || 'B2') as CEFRLevel,
                definition: 'Loading definition from detail shard...',
                example_sentences: [],
                collocations: [],
                ielts_skills: item.skills || [],
                audio_status: 'none'
              };
              const isExpanded = Boolean(expandedIds[item.id]);
              const isSaved = state.vocabulary.some(
                (w) => w.word.toLowerCase() === card.word.toLowerCase()
              );
              const detailRegionId = `vocab-detail-${item.id}`;
              const hasProposedMapping = item.skill_mappings.some(
                (m) => m.evidence === 'proposed_unreviewed'
              );
              const rationale = item.skill_mappings.find((m) => m.pedagogical_rationale)?.pedagogical_rationale;

              return (
                <Card
                  key={item.id}
                  className={`vocab-word-card ${isExpanded ? 'vocab-word-card-expanded' : ''}`}
                >
                  <div className="vocab-word-card-top">
                    <div className="vocab-badge-group">
                      <Badge tone="blue">{card.cefr_level}</Badge>
                      <Badge tone="gray">
                        {card.part_of_speech} ({card.pos_code})
                      </Badge>
                      <Badge tone="gray">
                        {card.edition === 'USEnglish' ? 'US English' : 'UK English'}
                      </Badge>
                    </div>
                    <code className="vocab-id-pill">{card.id}</code>
                  </div>

                  <div className="vocab-headword-row">
                    <div>
                      <h2 className="vocab-headword">{card.word}</h2>
                      {item.search_aliases && item.search_aliases.length > 1 && (
                        <p className="vocab-aliases">
                          Search aliases: {item.search_aliases.filter((a) => a !== card.word).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="vocab-audio-controls">
                      {ttsSupported ? (
                        <button
                          type="button"
                          className={`btn btn-secondary btn-sm vocab-tts-btn ${
                            speakingWordId === card.id ? 'speaking' : ''
                          }`}
                          onClick={() => handlePronounce(card)}
                          aria-label={`Pronounce ${card.word} using browser speech synthesis (${
                            card.edition === 'USEnglish' ? 'US' : 'UK'
                          } English, synthetic TTS)`}
                        >
                          <Volume2 size={15} aria-hidden="true" />
                          <span>
                            {speakingWordId === card.id
                              ? 'Speaking…'
                              : `Pronounce (Browser TTS · ${
                                  card.edition === 'USEnglish' ? 'US' : 'UK'
                                })`}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm vocab-tts-btn vocab-tts-unavailable"
                          disabled
                          aria-disabled="true"
                          aria-label={`Pronunciation unavailable for ${card.word}: recorded audio is not bundled in mock mode and browser TTS is unavailable`}
                        >
                          <VolumeX size={15} aria-hidden="true" />
                          <span>Audio Unavailable (Mock Mode)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="vocab-definition-text">{card.definition}</p>

                  <div className="vocab-skills-row" aria-label="IELTS skill mappings">
                    {card.ielts_skills.map((skill) => (
                      <span
                        key={skill}
                        className={`vocab-skill-tag ${
                          hasProposedMapping ? 'vocab-skill-proposed' : 'vocab-skill-verified'
                        }`}
                      >
                        {skill}
                        {hasProposedMapping ? ' · Recommended Practice' : ''}
                      </span>
                    ))}
                  </div>

                  <div className="vocab-card-footer">
                    <button
                      type="button"
                      className="vocab-expand-btn"
                      aria-expanded={isExpanded}
                      aria-controls={detailRegionId}
                      onClick={() => toggleCardExpanded(item.id)}
                    >
                      <span>
                        {isExpanded
                          ? 'Hide examples & collocations'
                          : 'Show examples & collocations'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} aria-hidden="true" />
                      ) : (
                        <ChevronDown size={16} aria-hidden="true" />
                      )}
                    </button>

                    <button
                      type="button"
                      className={`btn btn-sm ${isSaved ? 'btn-ghost' : 'btn-secondary'}`}
                      onClick={() => handleSaveWord(card)}
                      disabled={isSaved}
                      aria-label={
                        isSaved
                          ? `${card.word} is saved in My Vocabulary`
                          : `Save ${card.word} to My Vocabulary`
                      }
                    >
                      {isSaved ? (
                        <>
                          <Check size={14} aria-hidden="true" /> Saved in My Vocabulary
                        </>
                      ) : (
                        <>
                          <Bookmark size={14} aria-hidden="true" /> Save word
                        </>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div
                      id={detailRegionId}
                      role="region"
                      aria-label={`Detailed usage and examples for ${card.word}`}
                      className="vocab-detail-panel"
                    >
                      <div className="vocab-detail-section">
                        <h4>Contextual Example Sentences</h4>
                        {card.example_sentences.length > 0 ? (
                          <ul className="about-bullets">
                            {card.example_sentences.map((ex, i) => (
                              <li key={i}>“{ex}”</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="muted-note">No example sentence recorded in this mock fixture.</p>
                        )}
                      </div>

                      <div className="vocab-detail-section">
                        <h4>Common Academic Collocations</h4>
                        {card.collocations.length > 0 ? (
                          <div className="vocab-collocation-list">
                            {card.collocations.map((col) => (
                              <span key={col} className="vocab-collocation-chip">
                                {col}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="muted-note">No collocations listed for this entry.</p>
                        )}
                      </div>

                      {(card.notes || rationale) && (
                        <div className="vocab-detail-section">
                          <h4>IELTS Register & Pedagogical Notes</h4>
                          {card.notes && <p>{card.notes}</p>}
                          {rationale && (
                            <p className="muted-note">
                              <strong>Candidate Mapping Note:</strong> {rationale}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="vocab-detail-provenance">
                        <span>
                          <strong>Audio Status:</strong> <code>audio_status: "{card.audio_status}"</code> (Recorded audio omitted in public mock build; browser TTS optional).
                        </span>
                        <span>
                          <strong>Attribution:</strong> {isRealData ? 'Oxford 3000/5000 & Educational Lexicon' : SYNTHETIC_CREDITS_ENTRY.provider_name} (
                          <code>{isRealData ? 'CANONICAL_SOURCE_VERIFIED' : SYNTHETIC_CREDITS_ENTRY.verification_status}</code>)
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {resultPage.totalPages > 1 && (
            <nav className="vocab-pagination" aria-label="Vocabulary pagination">
              <Button
                kind="secondary"
                disabled={resultPage.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous Page
              </Button>
              <div className="vocab-page-numbers">
                {pageWindow.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="vocab-pagination-ellipsis" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`vocab-page-btn ${resultPage.page === p ? 'active' : ''}`}
                      aria-current={resultPage.page === p ? 'page' : undefined}
                      aria-label={`Page ${p}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <Button
                kind="secondary"
                disabled={!resultPage.hasMore}
                onClick={() => setPage((p) => Math.min(resultPage.totalPages, p + 1))}
              >
                Next Page
              </Button>
            </nav>
          )}
        </>
      )}
    </AppShell>
  );
}
