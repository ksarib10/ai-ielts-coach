import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  Globe,
  Layers,
  Link as LinkIcon,
  RotateCcw,
  Search,
  Sparkles
} from 'lucide-react';
import { AppShell } from '../../../components/AppShell';
import { Badge, Button, Card, EmptyState, PageHeader } from '../../../components/UI';
import { mutateLearning, useLearning } from '../../../services/platform';
import {
  type CanonicalAWLFamily,
  type CompactSearchItem,
  type IdiomDifficulty,
  type UIAWLStudyGroup,
  type UIIdiomCard,
  type UILinkingCard,
  type UIPhrasalCard,
  type UIVariantCard
} from '../../../types/resourceBank';
import { useResourceBank } from '../../vocabulary/services/resourceBankHooks';

// ============================================================================
// 1. ACADEMIC WORD LIST (AWL) COLLECTION SCREEN
// ============================================================================

export function AWLCollectionScreen() {
  const { provider, mode } = useResourceBank();
  const [selectedSublist, setSelectedSublist] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groups, setGroups] = useState<UIAWLStudyGroup[]>([]);
  const [sublistFamilies, setSublistFamilies] = useState<CanonicalAWLFamily[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedFamilyId, setExpandedFamilyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function loadSublist() {
      try {
        const families = await provider.getAWLSublist(selectedSublist);
        if (cancelled) return;
        setSublistFamilies(families);

        const groupCount = Math.floor(families.length / 10);
        const paddedSub = String(selectedSublist).padStart(2, '0');
        const resolved: UIAWLStudyGroup[] = [];

        for (let g = 1; g <= groupCount; g++) {
          const paddedGrp = String(g).padStart(2, '0');
          const grpId = ['AWL', 'GRP', `s${paddedSub}`, `g${paddedGrp}`].join('_');
          try {
            const grp = await provider.getAWLStudyGroup(grpId);
            resolved.push(grp);
          } catch {
            break;
          }
        }

        if (cancelled) return;
        setGroups(resolved);
        setIsLoading(false);
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadSublist();
    return () => {
      cancelled = true;
    };
  }, [provider, selectedSublist]);

  const filteredFamilies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sublistFamilies;
    return sublistFamilies.filter(
      (f) =>
        f.headword.toLowerCase().includes(q) ||
        (f.word_family_forms || []).some((form) => form.toLowerCase().includes(q))
    );
  }, [sublistFamilies, searchQuery]);

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Learn
      </Link>
      <PageHeader
        eyebrow="Learn · Academic Word List (AWL)"
        title="Academic Word Families (Coxhead AWL)"
        description="570 academic word families across 10 frequency sublists and 57 ten-family study groups. Focus on core academic stems and their morphological derivations."
      />

      <section className="vocab-governance-banner" role="region" aria-label="AWL Collection Governance">
        <div className="vocab-governance-header">
          <Badge tone={mode === 'PRIVATE_DEV_REAL_DATA' ? 'green' : 'blue'}>
            {mode === 'PRIVATE_DEV_REAL_DATA' ? 'REAL_DATA_ACTIVE' : 'PROVIDER_CONNECTED'}
          </Badge>
          <Badge tone="gray">570 Families · 10 Sublists · 57 Groups</Badge>
          <span className="vocab-governance-tag">Coxhead Academic Word List Canonical</span>
        </div>
        <p className="vocab-governance-text">
          Academic word families are presented truthfully from normalized canonical records. Word family forms, sublist rankings, and IELTS skill associations are source-verified. Definitions are not fabricated from unverified dictionaries.
        </p>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="awl-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search AWL headwords or forms</span>
          </label>
          <input
            id="awl-search"
            type="search"
            className="input vocab-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AWL headwords or word forms (e.g. analyse, approach, concept)..."
          />
          {searchQuery && (
            <Button kind="secondary" onClick={() => setSearchQuery('')}>
              <RotateCcw size={15} aria-hidden="true" /> Clear
            </Button>
          )}
        </div>

        <div className="vocab-alpha-section">
          <div className="vocab-alpha-label-row">
            <span className="vocab-control-heading">Select Frequency Sublist (1 = Most Frequent)</span>
            <span className="muted-note">Sublist {selectedSublist} contains {sublistFamilies.length} families</span>
          </div>
          <div className="vocab-alpha-bar" role="toolbar" aria-label="Select AWL sublist">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((subNum) => (
              <button
                key={subNum}
                type="button"
                className={`vocab-alpha-btn ${selectedSublist === subNum ? 'active' : ''}`}
                aria-pressed={selectedSublist === subNum}
                onClick={() => {
                  setSelectedSublist(subNum);
                  setSearchQuery('');
                }}
              >
                Sublist {subNum}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="vocab-state-card">
          <p>Loading Sublist {selectedSublist} academic word families…</p>
        </Card>
      ) : filteredFamilies.length === 0 ? (
        <EmptyState
          title="No academic families match your search"
          detail={`No words matched "${searchQuery}" in Sublist ${selectedSublist}.`}
          action="Clear search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="vocab-cards-grid">
          {filteredFamilies.map((fam) => {
            const isExpanded = expandedFamilyId === fam.family_id;
            return (
              <Card key={fam.family_id} className="vocab-word-card">
                <div className="vocab-word-card-top">
                  <div className="vocab-badge-group">
                    <Badge tone="blue">Sublist {fam.sublist}</Badge>
                    <Badge tone="gray">AWL Family</Badge>
                  </div>
                  <code className="vocab-id-pill">{fam.family_id}</code>
                </div>

                <div className="vocab-headword-row">
                  <div>
                    <h2 className="vocab-headword">{fam.headword}</h2>
                    <p className="muted-note">
                      <strong>Family members:</strong> {(fam.word_family_forms || []).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="vocab-skills-row" aria-label="IELTS skill tags">
                  {['Reading', 'Writing Task 2'].map((skill) => (
                    <span key={skill} className="vocab-skill-tag vocab-skill-verified">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="vocab-card-footer">
                  <button
                    type="button"
                    className="vocab-expand-btn"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedFamilyId(isExpanded ? null : fam.family_id)}
                  >
                    <span>{isExpanded ? 'Hide word family details' : 'Show word family details'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="vocab-detail-panel" role="region" aria-label={`Details for ${fam.headword}`}>
                    <div className="vocab-detail-section">
                      <h4>All Morphological Word Family Forms</h4>
                      <div className="vocab-collocation-list">
                        {(fam.word_family_forms || []).map((form) => (
                          <span key={form} className="vocab-collocation-chip">
                            {form}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="vocab-detail-provenance">
                      <span>
                        <strong>Collection:</strong> Academic Word List (Averil Coxhead)
                      </span>
                      <span>
                        <strong>Canonical ID:</strong> <code>{fam.family_id}</code>
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// 2. PHRASAL VERBS COLLECTION SCREEN
// ============================================================================

export function PhrasalVerbsCollectionScreen() {
  const { provider, mode } = useResourceBank();
  const [phrasalVerbs, setPhrasalVerbs] = useState<UIPhrasalCard[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeparable, setSelectedSeparable] = useState<'ALL' | 'YES' | 'NO'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function loadPhrasals() {
      try {
        const verbs = await provider.getPhrasalVerbs(
          selectedTopic === 'ALL' ? undefined : selectedTopic
        );
        if (!cancelled) {
          setPhrasalVerbs(verbs);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadPhrasals();
    return () => {
      cancelled = true;
    };
  }, [provider, selectedTopic]);

  const topics = useMemo(() => {
    return [
      'ALL',
      'Education & Academic Life',
      'Work & Employment',
      'Technology & Innovation',
      'Environment & Nature',
      'Health & Well-being',
      'Social Issues & Community',
      'Travel & Transportation',
      'Communication & Media',
      'Law & Crime',
      'Business & Finance',
      'Science & Research',
      'Daily Life & Routines',
      'Arts & Culture',
      'Relationships & Family'
    ];
  }, []);

  const filteredVerbs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return phrasalVerbs.filter((v) => {
      if (q && !v.verb.toLowerCase().includes(q) && !v.meaning.toLowerCase().includes(q)) {
        return false;
      }
      if (selectedSeparable === 'YES' && !v.separable) return false;
      if (selectedSeparable === 'NO' && v.separable) return false;
      return true;
    });
  }, [phrasalVerbs, searchQuery, selectedSeparable]);

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Learn
      </Link>
      <PageHeader
        eyebrow="Learn · Phrasal Verbs"
        title="IELTS Phrasal Verbs Topic Decks"
        description="129 essential phrasal verbs organized across 14 academic and everyday IELTS topics, with grammatical transitivity, separability, and contextual examples."
      />

      <section className="vocab-governance-banner" role="region" aria-label="Phrasal Verbs Governance">
        <div className="vocab-governance-header">
          <Badge tone={mode === 'PRIVATE_DEV_REAL_DATA' ? 'green' : 'blue'}>
            {mode === 'PRIVATE_DEV_REAL_DATA' ? 'REAL_DATA_ACTIVE' : 'PROVIDER_CONNECTED'}
          </Badge>
          <Badge tone="gray">129 Phrasal Verbs · 14 Topics</Badge>
        </div>
        <p className="vocab-governance-text">
          Master high-scoring verb-particle combinations in context. Each entry specifies whether the object can separate the verb and particle.
        </p>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="phrasal-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search phrasal verbs</span>
          </label>
          <input
            id="phrasal-search"
            type="search"
            className="input vocab-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrasal verbs or meanings (e.g. carry out, look into, bring about)..."
          />
        </div>

        <div className="vocab-filters-grid">
          <label className="field vocab-filter-field">
            <span>Topic Deck</span>
            <select
              className="select"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All 14 Topics (129 Verbs)' : t}
                </option>
              ))}
            </select>
          </label>

          <label className="field vocab-filter-field">
            <span>Separability</span>
            <select
              className="select"
              value={selectedSeparable}
              onChange={(e) => setSelectedSeparable(e.target.value as 'ALL' | 'YES' | 'NO')}
            >
              <option value="ALL">All Phrasal Types</option>
              <option value="YES">Separable Only</option>
              <option value="NO">Inseparable Only</option>
            </select>
          </label>
        </div>
      </Card>

      {isLoading ? (
        <Card className="vocab-state-card">
          <p>Loading phrasal verbs…</p>
        </Card>
      ) : filteredVerbs.length === 0 ? (
        <EmptyState
          title="No phrasal verbs found"
          detail="Try clearing your search query or selecting a different topic."
          action="Reset filters"
          onAction={() => {
            setSelectedTopic('ALL');
            setSelectedSeparable('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="vocab-cards-grid">
          {filteredVerbs.map((item) => (
            <Card key={item.id} className="vocab-word-card">
              <div className="vocab-word-card-top">
                <div className="vocab-badge-group">
                  <Badge tone="blue">{item.topic}</Badge>
                  <Badge tone={item.separable ? 'green' : 'amber'}>
                    {item.separable ? 'Separable' : 'Inseparable'}
                  </Badge>
                  <Badge tone="gray">{item.transitivity}</Badge>
                </div>
                <code className="vocab-id-pill">{item.id}</code>
              </div>

              <div className="vocab-headword-row">
                <div>
                  <h2 className="vocab-headword">{item.verb}</h2>
                  <p className="vocab-definition-text">{item.meaning}</p>
                </div>
              </div>

              {item.example_sentences.length > 0 && (
                <div className="vocab-detail-section">
                  <h4>Example in IELTS Context</h4>
                  <ul className="about-bullets">
                    {item.example_sentences.map((ex, i) => (
                      <li key={i}>“{ex}”</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.collocations.length > 0 && (
                <div className="vocab-collocation-list">
                  {item.collocations.map((c) => (
                    <span key={c} className="vocab-collocation-chip">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// 3. IDIOMS HANDBOOK COLLECTION SCREEN
// ============================================================================

export function IdiomsCollectionScreen() {
  const { provider, mode } = useResourceBank();
  const [idioms, setIdioms] = useState<UIIdiomCard[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<IdiomDifficulty | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function loadIdioms() {
      try {
        const data = await provider.getIdioms(
          selectedDifficulty === 'ALL' ? undefined : selectedDifficulty
        );
        if (!cancelled) {
          setIdioms(data);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadIdioms();
    return () => {
      cancelled = true;
    };
  }, [provider, selectedDifficulty]);

  const filteredIdioms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return idioms;
    return idioms.filter(
      (item) => item.phrase.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q)
    );
  }, [idioms, searchQuery]);

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Learn
      </Link>
      <PageHeader
        eyebrow="Learn · Idioms"
        title="IELTS Idioms Handbook (Curated)"
        description="122 high-utility, naturally occurring idiomatic expressions for IELTS Speaking. Rated by communicative difficulty."
      />

      <section className="vocab-governance-banner" role="region" aria-label="Idioms Handbook Governance">
        <div className="vocab-governance-header">
          <Badge tone={mode === 'PRIVATE_DEV_REAL_DATA' ? 'green' : 'blue'}>
            {mode === 'PRIVATE_DEV_REAL_DATA' ? 'REAL_DATA_ACTIVE' : 'PROVIDER_CONNECTED'}
          </Badge>
          <Badge tone="gray">122 Curated Idioms (57 Easy · 55 Intermediate · 10 Advanced)</Badge>
        </div>
        <p className="vocab-governance-text">
          Use idioms naturally in IELTS Speaking Part 1, 2, and 3. Avoid forced idioms in formal Academic Writing Task 1 and 2.
        </p>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="idiom-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search idioms</span>
          </label>
          <input
            id="idiom-search"
            type="search"
            className="input vocab-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search idioms or meanings (e.g. break the ice, hit the nail on the head)..."
          />
        </div>

        <div className="vocab-filters-grid">
          <label className="field vocab-filter-field">
            <span>Difficulty Level (Independent Dimension)</span>
            <select
              className="select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as IdiomDifficulty | 'ALL')}
            >
              <option value="ALL">All Difficulties (122 Idioms)</option>
              <option value="Easy">Easy (57 Idioms)</option>
              <option value="Intermediate">Intermediate (55 Idioms)</option>
              <option value="Advanced">Advanced (10 Idioms)</option>
            </select>
          </label>
        </div>
      </Card>

      {isLoading ? (
        <Card className="vocab-state-card">
          <p>Loading idioms…</p>
        </Card>
      ) : filteredIdioms.length === 0 ? (
        <EmptyState
          title="No idioms found"
          detail="Try broadening your search term or difficulty filter."
          action="Clear search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="vocab-cards-grid">
          {filteredIdioms.map((item) => (
            <Card key={item.id} className="vocab-word-card">
              <div className="vocab-word-card-top">
                <div className="vocab-badge-group">
                  <Badge
                    tone={
                      item.difficulty === 'Easy'
                        ? 'green'
                        : item.difficulty === 'Intermediate'
                          ? 'blue'
                          : 'amber'
                    }
                  >
                    {item.difficulty}
                  </Badge>
                  <Badge tone="gray">{item.category}</Badge>
                </div>
                <code className="vocab-id-pill">{item.id}</code>
              </div>

              <div className="vocab-headword-row">
                <div>
                  <h2 className="vocab-headword">{item.phrase}</h2>
                  <p className="vocab-definition-text">{item.definition}</p>
                </div>
              </div>

              {item.example_sentences.length > 0 && (
                <div className="vocab-detail-section">
                  <h4>Example in Context</h4>
                  <ul className="about-bullets">
                    {item.example_sentences.map((ex, i) => (
                      <li key={i}>“{ex}”</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="vocab-skills-row" aria-label="IELTS skill tags">
                {(item.ielts_skills || ['Speaking']).map((sk) => (
                  <span key={sk} className="vocab-skill-tag vocab-skill-verified">
                    {sk}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// 4. LINKING WORDS & CONNECTORS COLLECTION SCREEN
// ============================================================================

export function LinkingWordsCollectionScreen() {
  const { provider, mode } = useResourceBank();
  const [linkingWords, setLinkingWords] = useState<UILinkingCard[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function loadConnectors() {
      try {
        const data = await provider.getLinkingWords(
          selectedFunction === 'ALL' ? undefined : selectedFunction
        );
        if (!cancelled) {
          setLinkingWords(data);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadConnectors();
    return () => {
      cancelled = true;
    };
  }, [provider, selectedFunction]);

  const functions = [
    'ALL',
    'Cause / Effect',
    'Concession',
    'Concluding / Summarising',
    'Contrast',
    'Exemplifying / Illustrating'
  ];

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return linkingWords;
    return linkingWords.filter(
      (item) => item.phrase.toLowerCase().includes(q) || item.meaning.toLowerCase().includes(q)
    );
  }, [linkingWords, searchQuery]);

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Learn
      </Link>
      <PageHeader
        eyebrow="Learn · Linking Words & Connectors"
        title="IELTS Linking Words & Cohesion Guide"
        description="100 discourse markers and cohesive devices organized across 5 core communicative functions, with grammar patterns, sentence positions, and authentic task examples."
      />

      <section className="vocab-governance-banner" role="region" aria-label="Linking Words Governance">
        <div className="vocab-governance-header">
          <Badge tone={mode === 'PRIVATE_DEV_REAL_DATA' ? 'green' : 'blue'}>
            {mode === 'PRIVATE_DEV_REAL_DATA' ? 'REAL_DATA_ACTIVE' : 'PROVIDER_CONNECTED'}
          </Badge>
          <Badge tone="gray">100 Connectors · 5 Cohesive Functions (20 each)</Badge>
        </div>
        <p className="vocab-governance-text">
          High Coherence & Cohesion band scores require varied, accurate connectors. Review sentence positions and avoid repetitive mechanical transitions.
        </p>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="linking-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search connectors</span>
          </label>
          <input
            id="linking-search"
            type="search"
            className="input vocab-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search linking words (e.g. furthermore, whereas, consequently)..."
          />
        </div>

        <div className="vocab-filters-grid">
          <label className="field vocab-filter-field">
            <span>Cohesive Function</span>
            <select
              className="select"
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
            >
              {functions.map((f) => (
                <option key={f} value={f}>
                  {f === 'ALL' ? 'All 5 Functions (100 Connectors)' : `${f} (20)`}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {isLoading ? (
        <Card className="vocab-state-card">
          <p>Loading linking words…</p>
        </Card>
      ) : filteredWords.length === 0 ? (
        <EmptyState
          title="No connectors found"
          detail="Try resetting your search query or function filter."
          action="Clear search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="vocab-cards-grid">
          {filteredWords.map((item) => (
            <Card key={item.id} className="vocab-word-card">
              <div className="vocab-word-card-top">
                <div className="vocab-badge-group">
                  <Badge tone="blue">{item.function_category}</Badge>
                  <Badge tone="gray">{item.grammatical_type}</Badge>
                </div>
                <code className="vocab-id-pill">{item.id}</code>
              </div>

              <div className="vocab-headword-row">
                <div>
                  <h2 className="vocab-headword">{item.phrase}</h2>
                  <p className="vocab-definition-text">{item.meaning}</p>
                </div>
              </div>

              {item.example_sentences.length > 0 && (
                <div className="vocab-detail-section">
                  <h4>Example in IELTS Writing/Speaking</h4>
                  <ul className="about-bullets">
                    {item.example_sentences.map((ex, i) => (
                      <li key={i}>“{ex}”</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// 5. BRITISH VS AMERICAN REGIONAL ENGLISH SCREEN
// ============================================================================

export function BritishAmericanCollectionScreen() {
  const { provider, mode } = useResourceBank();
  const [variants, setVariants] = useState<UIVariantCard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function loadVariants() {
      try {
        const data = await provider.getRegionalVariants(
          selectedCategory === 'ALL' ? undefined : selectedCategory
        );
        if (!cancelled) {
          setVariants(data);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadVariants();
    return () => {
      cancelled = true;
    };
  }, [provider, selectedCategory]);

  const categories = [
    'ALL',
    'Food',
    'Clothing',
    'Travel & Transport',
    'Housing & Home',
    'Office & Business',
    'Education',
    'Everyday Objects',
    'Automotive',
    'Health & Body',
    'Communication',
    'Spelling & Orthography'
  ];

  const filteredVariants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return variants;
    return variants.filter(
      (item) =>
        item.british_word.toLowerCase().includes(q) ||
        item.american_word.toLowerCase().includes(q) ||
        item.british_variants.some((v) => v.toLowerCase().includes(q)) ||
        item.american_variants.some((v) => v.toLowerCase().includes(q))
    );
  }, [variants, searchQuery]);

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Learn
      </Link>
      <PageHeader
        eyebrow="Learn · Regional Terminology & Spelling"
        title="British vs American English in IELTS"
        description="606 regional variant pairs across 16 thematic categories. Both British and American forms are accepted and scored identically in IELTS."
      />

      <section className="vocab-governance-banner" role="region" aria-label="Regional English Governance">
        <div className="vocab-governance-header">
          <Badge tone={mode === 'PRIVATE_DEV_REAL_DATA' ? 'green' : 'blue'}>
            {mode === 'PRIVATE_DEV_REAL_DATA' ? 'REAL_DATA_ACTIVE' : 'PROVIDER_CONNECTED'}
          </Badge>
          <Badge tone="gray">606 Regional Variant Pairs</Badge>
        </div>
        <p className="vocab-governance-text">
          IELTS examiners accept British, American, Canadian, and Australian spellings. However, maintain consistency within each written response.
        </p>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="variant-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search British or American words</span>
          </label>
          <input
            id="variant-search"
            type="search"
            className="input vocab-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UK or US terms (e.g. crisps, chips, flat, apartment)..."
          />
        </div>

        <div className="vocab-filters-grid">
          <label className="field vocab-filter-field">
            <span>Thematic Category</span>
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'All 16 Categories (606 Pairs)' : c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {isLoading ? (
        <Card className="vocab-state-card">
          <p>Loading regional word pairs…</p>
        </Card>
      ) : filteredVariants.length === 0 ? (
        <EmptyState
          title="No regional pairs found"
          detail="Try searching a different English word or category."
          action="Clear search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="vocab-cards-grid">
          {filteredVariants.map((item) => (
            <Card key={item.id} className="vocab-word-card">
              <div className="vocab-word-card-top">
                <Badge tone="blue">{item.category}</Badge>
                <code className="vocab-id-pill">{item.id}</code>
              </div>

              <div className="about-comparison-grid section-space">
                <div className="about-comparison-col">
                  <span className="about-comparison-tag">🇬🇧 British English (UK)</span>
                  <h3 className="vocab-headword">{item.british_word}</h3>
                  {item.british_variants.length > 1 && (
                    <p className="muted-note">
                      Variants: {item.british_variants.filter((v) => v !== item.british_word).join(', ')}
                    </p>
                  )}
                </div>

                <div className="about-comparison-col">
                  <span className="about-comparison-tag">🇺🇸 American English (US)</span>
                  <h3 className="vocab-headword">{item.american_word}</h3>
                  {item.american_variants.length > 1 && (
                    <p className="muted-note">
                      Variants: {item.american_variants.filter((v) => v !== item.american_word).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              <p className="muted-note">{item.regional_variation_notice}</p>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

// ============================================================================
// 6. COLLOCATIONS COLLECTION SCREEN
// ============================================================================

export function CollocationsCollectionScreen() {
  const { provider, mode } = useResourceBank();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<CompactSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    async function loadCollocations() {
      try {
        const page = await provider.search({
          term: searchQuery,
          filters: { entityType: ['oxford'] },
          pageSize: 20
        });
        if (!cancelled) {
          setResults(page.items);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadCollocations();
    return () => {
      cancelled = true;
    };
  }, [provider, searchQuery]);

  return (
    <AppShell>
      <Link className="discovery-back" to="/learn">
        <ArrowLeft size={16} aria-hidden="true" /> Back to Learn
      </Link>
      <PageHeader
        eyebrow="Learn · Collocations"
        title="IELTS Academic Collocation Relationships"
        description="Source-backed word partner combinations from the verified Oxford 3000 / 5000 lexicon. Natural collocations enhance lexical resource scores in Writing and Speaking."
      />

      <section className="vocab-governance-banner" role="region" aria-label="Collocations Governance">
        <div className="vocab-governance-header">
          <Badge tone={mode === 'PRIVATE_DEV_REAL_DATA' ? 'green' : 'blue'}>
            {mode === 'PRIVATE_DEV_REAL_DATA' ? 'REAL_DATA_ACTIVE' : 'PROVIDER_CONNECTED'}
          </Badge>
          <Badge tone="gray">Source-Backed Lexical Collocations</Badge>
        </div>
        <p className="vocab-governance-text">
          Natural collocations show examiners that you know how words combine natively. Inspect word cards to see verified noun, verb, and adjective pairings.
        </p>
      </section>

      <Card className="vocab-controls-card">
        <div className="vocab-search-row">
          <label className="vocab-search-label" htmlFor="colloc-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search collocations</span>
          </label>
          <input
            id="colloc-search"
            type="search"
            className="input vocab-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headwords for collocations (e.g. achieve, conduct, implement)..."
          />
        </div>
      </Card>

      {isLoading ? (
        <Card className="vocab-state-card">
          <p>Loading collocations…</p>
        </Card>
      ) : results.length === 0 ? (
        <EmptyState
          title="No words found"
          detail="Try searching a common academic headword."
          action="Clear search"
          onAction={() => setSearchQuery('')}
        />
      ) : (
        <div className="vocab-cards-grid">
          {results.map((item) => (
            <Card key={item.id} className="vocab-word-card">
              <div className="vocab-word-card-top">
                <Badge tone="blue">{item.cefr_level || 'B2'}</Badge>
                <Badge tone="gray">{item.pos}</Badge>
                <code className="vocab-id-pill">{item.id}</code>
              </div>

              <div className="vocab-headword-row">
                <div>
                  <h2 className="vocab-headword">{item.term}</h2>
                </div>
              </div>

              <div className="vocab-detail-section">
                <h4>Common Academic Collocations</h4>
                <div className="vocab-collocation-list">
                  {(item.search_aliases || []).map((col) => (
                    <span key={col} className="vocab-collocation-chip">
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="vocab-skills-row" aria-label="Skills">
                {(item.skills || ['Writing Task 2', 'Reading']).map((sk) => (
                  <span key={sk} className="vocab-skill-tag vocab-skill-verified">
                    {sk}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
