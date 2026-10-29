import {
  type AWLStudyGroupHeader,
  type CanonicalAWLFamily,
  type CanonicalBritishAmericanPair,
  type CanonicalIdiomEntry,
  type CanonicalLinkingWordEntry,
  type CanonicalOxfordEntry,
  type CanonicalPhrasalVerbEntry,
  type CEFRLevel,
  type CompactSearchItem,
  createMockResourceBankProvider,
  type IResourceBankProvider,
  type MockFixtureBundle,
  type OxfordEdition,
  type OxfordPOSCode,
  type SkillEvidenceType,
  type SourceAttribution,
  type UIAWLStudyGroup
} from '../../../types/resourceBank';

interface SyntheticOxfordSeed {
  num: string;
  word: string;
  edition: OxfordEdition;
  cefr: CEFRLevel;
  pos: string;
  posCode: OxfordPOSCode;
  skills: string[];
  evidence?: SkillEvidenceType;
  rationale?: string;
  meaning: string;
  collocations: string[];
  example: string;
  aliases: string[];
  notes: string | null;
}

const MOCK_PROVENANCE = {
  source_file: 'synthetic_mock_lexicon.json',
  source_sha256: 'mock_fixture_non_proprietary',
  transform_version: 'stage_4b_v2.3',
  editorial_status: 'MOCK_FIXTURE_FOR_LOCAL_DEVELOPMENT_ONLY'
};

function buildSyntheticOxfordEntry(seed: SyntheticOxfordSeed): CanonicalOxfordEntry {
  const slug = seed.word.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return {
    entry_id: `MOCK_OXF_${seed.num}_synthetic_${slug}`,
    lexeme_id: `MOCK_OXF_LEX_${slug}`,
    raw_source_id: `MOCK_OXF_SRC_${seed.num}`,
    headword_raw: seed.word,
    headword_clean: seed.word,
    homograph_index: null,
    edition: seed.edition,
    cefr_level: seed.cefr,
    part_of_speech: seed.pos,
    pos_code: seed.posCode,
    ielts_usage_raw: seed.skills.join(', '),
    ielts_usage_tags: seed.skills,
    meaning: seed.meaning,
    collocations_raw: seed.collocations.join(', '),
    collocations: seed.collocations,
    example_sentence: seed.example,
    notes_raw: seed.notes,
    sense_verification_status: 'mock_synthetic_standin',
    provenance: MOCK_PROVENANCE
  };
}

function buildSearchItemFromOxford(
  entry: CanonicalOxfordEntry,
  aliases: string[],
  evidence: SkillEvidenceType = 'source_tagged',
  rationale?: string
): CompactSearchItem {
  return {
    id: entry.entry_id,
    term: entry.headword_clean,
    normalized_term: entry.headword_clean.toLowerCase(),
    search_aliases: aliases,
    entity_type: 'oxford',
    cefr_level: entry.cefr_level,
    difficulty: null,
    pos: entry.part_of_speech,
    pos_code: entry.pos_code,
    edition: entry.edition,
    category: null,
    topic_code: null,
    skills: entry.ielts_usage_tags,
    direct_skills: evidence === 'source_tagged' ? entry.ielts_usage_tags : [],
    skill_mappings: entry.ielts_usage_tags.map((skill) => ({
      skill,
      evidence,
      approval_status: evidence === 'source_tagged' ? 'SOURCE_VERIFIED' : 'PROPOSED_UNREVIEWED',
      ...(rationale ? { pedagogical_rationale: rationale } : {})
    })),
    target_file: 'DEVELOPMENT_FIXTURES/mock_oxford_card.json'
  };
}

const SYNTHETIC_OXFORD_SEEDS: SyntheticOxfordSeed[] = [
  {
    num: '001',
    word: 'achieve',
    edition: 'UKEnglish',
    cefr: 'B1',
    pos: 'Verb',
    posCode: 'v',
    skills: ['Writing Task 1', 'Writing Task 2', 'Speaking'],
    meaning: 'to reach a desired objective or standard through sustained effort and practice',
    collocations: ['achieve a goal', 'achieve success', 'achieve objectives'],
    example: 'Candidates should aim to achieve coherence throughout their written responses.',
    aliases: ['achieve', 'attain', 'reach'],
    notes: null
  },
  {
    num: '002',
    word: 'agenda',
    edition: 'UKEnglish',
    cefr: 'A2',
    pos: 'Noun',
    posCode: 'n',
    skills: ['Listening', 'Speaking'],
    meaning: 'a structured list of items or topics to be discussed during a formal meeting or seminar',
    collocations: ['set an agenda', 'top of the agenda', 'hidden agenda'],
    example: 'Environmental conservation remained at the top of the municipal council agenda.',
    aliases: ['agenda', 'schedule', 'timetable'],
    notes: 'Frequently heard in IELTS Listening Section 2 and Section 3 academic discussions.'
  },
  {
    num: '003',
    word: 'bolster',
    edition: 'USEnglish',
    cefr: 'C1',
    pos: 'Verb',
    posCode: 'v',
    skills: ['Writing Task 2', 'Reading'],
    evidence: 'proposed_unreviewed',
    rationale: 'High-utility C1 verb for argument reinforcement in discursive essays.',
    meaning: 'to support, strengthen, or improve an argument, system, or confidence',
    collocations: ['bolster confidence', 'bolster an argument', 'bolster economic growth'],
    example: 'Empirical evidence was cited to bolster the claim that public transit reduces congestion.',
    aliases: ['bolster', 'reinforce', 'strengthen', 'support'],
    notes: 'Effective formal alternative to "make stronger" in Academic Writing Task 2.'
  },
  {
    num: '004',
    word: 'coherent',
    edition: 'UKEnglish',
    cefr: 'B2',
    pos: 'Adjective',
    posCode: 'adj',
    skills: ['Writing Task 1', 'Writing Task 2', 'Speaking'],
    meaning: 'logical, well-organized, and consistent so that every part connects clearly',
    collocations: ['coherent strategy', 'coherent argument', 'coherent framework'],
    example: 'A high-scoring essay presents a coherent progression of ideas across paragraphs.',
    aliases: ['coherent', 'logical', 'consistent', 'structured'],
    notes: 'Directly aligns with the Coherence and Cohesion assessment criterion.'
  },
  {
    num: '005',
    word: 'commute',
    edition: 'USEnglish',
    cefr: 'B1',
    pos: 'Verb',
    posCode: 'v',
    skills: ['Speaking', 'Listening'],
    meaning: 'to travel regularly between one’s place of residence and place of work or study',
    collocations: ['commute daily', 'commute by train', 'commute from the suburbs'],
    example: 'Many urban professionals commute for over an hour each morning by rail.',
    aliases: ['commute', 'travel daily', 'transit'],
    notes: 'Common topic vocabulary for Speaking Part 1 questions on hometown and daily routine.'
  },
  {
    num: '006',
    word: 'diligent',
    edition: 'UKEnglish',
    cefr: 'B2',
    pos: 'Adjective',
    posCode: 'adj',
    skills: ['Speaking', 'Writing Task 2'],
    meaning: 'showing steady, careful, and persistent effort in completing work or study tasks',
    collocations: ['diligent student', 'diligent research', 'diligent preparation'],
    example: 'Diligent revision of past feedback helps learners identify recurring grammatical patterns.',
    aliases: ['diligent', 'industrious', 'thorough', 'conscientious'],
    notes: 'Useful descriptive adjective for Speaking Part 2 prompts about a person you admire.'
  },
  {
    num: '007',
    word: 'empirical',
    edition: 'UKEnglish',
    cefr: 'C1',
    pos: 'Adjective',
    posCode: 'adj',
    skills: ['Reading', 'Writing Task 2'],
    meaning: 'based on direct observation, experiment, or verifiable data rather than pure theory',
    collocations: ['empirical evidence', 'empirical study', 'empirical data'],
    example: 'The researchers gathered empirical data from twelve coastal monitoring stations.',
    aliases: ['empirical', 'experimental', 'observational', 'factual'],
    notes: 'High-frequency academic modifier in IELTS Academic Reading passages.'
  },
  {
    num: '008',
    word: 'fluctuate',
    edition: 'UKEnglish',
    cefr: 'B2',
    pos: 'Verb',
    posCode: 'v',
    skills: ['Writing Task 1', 'Reading'],
    meaning: 'to rise and fall irregularly in number, price, rate, or intensity over time',
    collocations: ['fluctuate wildly', 'fluctuate between', 'fluctuate around'],
    example: 'Solar power output continued to fluctuate between 40 and 65 megawatts during autumn.',
    aliases: ['fluctuate', 'vary', 'oscillate', 'shift'],
    notes: 'Essential Academic Writing Task 1 trend verb for line graphs and dynamic charts.'
  },
  {
    num: '009',
    word: 'gradually',
    edition: 'UKEnglish',
    cefr: 'B1',
    pos: 'Adverb',
    posCode: 'adv',
    skills: ['Writing Task 1', 'Speaking'],
    meaning: 'slowly and steadily over a period of time rather than suddenly',
    collocations: ['increase gradually', 'decline gradually', 'adapt gradually'],
    example: 'Household recycling rates rose gradually over the twenty-year survey window.',
    aliases: ['gradually', 'steadily', 'progressively', 'slowly'],
    notes: 'Pairs naturally with dynamic verbs in Task 1 trend descriptions.'
  },
  {
    num: '010',
    word: 'habitat',
    edition: 'USEnglish',
    cefr: 'B1',
    pos: 'Noun',
    posCode: 'n',
    skills: ['Reading', 'Listening'],
    meaning: 'the natural environment in which a particular species of plant or animal lives and grows',
    collocations: ['natural habitat', 'habitat loss', 'wildlife habitat'],
    example: 'Wetland restoration projects protect the natural habitat of migratory birds.',
    aliases: ['habitat', 'environment', 'ecosystem', 'territory'],
    notes: 'Frequent lexical item in biology and environmental Listening and Reading texts.'
  },
  {
    num: '011',
    word: 'inevitably',
    edition: 'UKEnglish',
    cefr: 'B2',
    pos: 'Adverb',
    posCode: 'adv',
    skills: ['Writing Task 2', 'Speaking'],
    evidence: 'proposed_unreviewed',
    rationale: 'Recommended stance adverb for cause-and-effect reasoning.',
    meaning: 'in a way that cannot be avoided or prevented; as is certain to happen',
    collocations: ['inevitably lead to', 'inevitably result in', 'almost inevitably'],
    example: 'Rapid urbanization without transit planning inevitably leads to traffic bottlenecks.',
    aliases: ['inevitably', 'unavoidably', 'certainly'],
    notes: 'Use carefully in Writing Task 2; avoid overgeneralizing complex social claims.'
  },
  {
    num: '012',
    word: 'journey',
    edition: 'UKEnglish',
    cefr: 'A1',
    pos: 'Noun',
    posCode: 'n',
    skills: ['Speaking', 'Listening'],
    meaning: 'an act of travelling from one place to another, especially over a considerable distance',
    collocations: ['long journey', 'return journey', 'safe journey'],
    example: 'The train journey from the capital to the northern coast takes four hours.',
    aliases: ['journey', 'trip', 'voyage', 'excursion'],
    notes: 'Foundational A1 noun used in travel and transport contexts.'
  },
  {
    num: '013',
    word: 'mitigate',
    edition: 'USEnglish',
    cefr: 'C1',
    pos: 'Verb',
    posCode: 'v',
    skills: ['Writing Task 2', 'Reading'],
    meaning: 'to make a problem, risk, or negative impact less severe, harmful, or painful',
    collocations: ['mitigate risk', 'mitigate the effects', 'mitigate climate change'],
    example: 'Urban tree canopies help mitigate the heat-island effect in densely built districts.',
    aliases: ['mitigate', 'alleviate', 'lessen', 'reduce'],
    notes: 'Strong formal collocation partner with "effects", "impact", and "risks".'
  },
  {
    num: '014',
    word: 'notwithstanding',
    edition: 'UKEnglish',
    cefr: 'C1',
    pos: 'Preposition',
    posCode: 'prep',
    skills: ['Reading', 'Writing Task 2'],
    meaning: 'in spite of; without being prevented or affected by the factor mentioned',
    collocations: ['notwithstanding the difficulties', 'notwithstanding recent reforms'],
    example: 'Notwithstanding initial budget constraints, the laboratory completed the trial on schedule.',
    aliases: ['notwithstanding', 'despite', 'in spite of'],
    notes: 'Formal register preposition encountered in legal, policy, and academic texts.'
  },
  {
    num: '015',
    word: 'pivotal',
    edition: 'UKEnglish',
    cefr: 'C1',
    pos: 'Adjective',
    posCode: 'adj',
    skills: ['Writing Task 2', 'Speaking'],
    meaning: 'of central and decisive importance to the development or success of something',
    collocations: ['pivotal role', 'pivotal moment', 'pivotal factor'],
    example: 'Early childhood literacy plays a pivotal role in long-term educational attainment.',
    aliases: ['pivotal', 'crucial', 'decisive', 'vital'],
    notes: '"Play a pivotal role" is a natural academic alternative to "play an important part".'
  },
  {
    num: '016',
    word: 'resilient',
    edition: 'USEnglish',
    cefr: 'B2',
    pos: 'Adjective',
    posCode: 'adj',
    skills: ['Speaking', 'Reading'],
    meaning: 'able to recover quickly or adapt effectively after difficulties, shocks, or change',
    collocations: ['resilient economy', 'resilient community', 'highly resilient'],
    example: 'Diversified agricultural systems prove more resilient during prolonged droughts.',
    aliases: ['resilient', 'adaptable', 'robust', 'tough'],
    notes: 'Used across environmental, economic, and personal development topics.'
  },
  {
    num: '017',
    word: 'subsequently',
    edition: 'UKEnglish',
    cefr: 'B2',
    pos: 'Adverb',
    posCode: 'adv',
    skills: ['Writing Task 1', 'Reading'],
    meaning: 'after a particular event or stage has occurred; afterward in sequence',
    collocations: ['subsequently published', 'subsequently revised', 'subsequently expanded'],
    example: 'The raw clay is moulded into bricks and subsequently fired in a high-temperature kiln.',
    aliases: ['subsequently', 'afterwards', 'later', 'consequently'],
    notes: 'Particularly effective for Academic Writing Task 1 process diagrams.'
  },
  {
    num: '018',
    word: 'throughout',
    edition: 'UKEnglish',
    cefr: 'A2',
    pos: 'Preposition',
    posCode: 'prep',
    skills: ['Writing Task 1', 'Listening'],
    meaning: 'in every part of a place or object, or during the whole of a period of time',
    collocations: ['throughout the period', 'throughout the year', 'throughout the region'],
    example: 'Exports of manufactured goods remained stable throughout the final quarter.',
    aliases: ['throughout', 'across', 'during'],
    notes: 'Useful time and location preposition for summarizing overall chart trends.'
  },
  {
    num: '019',
    word: 'ubiquitous',
    edition: 'USEnglish',
    cefr: 'C1',
    pos: 'Adjective',
    posCode: 'adj',
    skills: ['Reading', 'Writing Task 2'],
    evidence: 'proposed_unreviewed',
    rationale: 'Advanced C1 adjective suited to technology and globalization essays.',
    meaning: 'seeming to be present, found, or used everywhere at the same time',
    collocations: ['ubiquitous smartphones', 'ubiquitous presence', 'become ubiquitous'],
    example: 'Mobile payment platforms have become ubiquitous in metropolitan retail markets.',
    aliases: ['ubiquitous', 'omnipresent', 'widespread', 'pervasive'],
    notes: 'High-register lexical item for technology and modern society topics.'
  },
  {
    num: '020',
    word: 'whereas',
    edition: 'UKEnglish',
    cefr: 'B1',
    pos: 'Conjunction',
    posCode: 'conj',
    skills: ['Writing Task 1', 'Writing Task 2'],
    meaning: 'in contrast or comparison with the fact that; while on the contrary',
    collocations: ['whereas in contrast', 'whereas previously'],
    example: 'Rail freight volume doubled over the decade, whereas inland water transport remained static.',
    aliases: ['whereas', 'while', 'by contrast', 'conversely'],
    notes: 'Core subordinating conjunction for contrasting two data categories in Task 1.'
  }
];

export const SYNTHETIC_OXFORD_ENTRIES: CanonicalOxfordEntry[] =
  SYNTHETIC_OXFORD_SEEDS.map(buildSyntheticOxfordEntry);

export const SYNTHETIC_OXFORD_SEARCH_ITEMS: CompactSearchItem[] =
  SYNTHETIC_OXFORD_SEEDS.map((seed, idx) =>
    buildSearchItemFromOxford(
      SYNTHETIC_OXFORD_ENTRIES[idx],
      seed.aliases,
      seed.evidence ?? 'source_tagged',
      seed.rationale
    )
  );

const AWL_DEMO_HEADWORDS = [
  'analyze_demo',
  'approach_demo',
  'area_demo',
  'assess_demo',
  'assume_demo',
  'authority_demo',
  'available_demo',
  'benefit_demo',
  'concept_demo',
  'consist_demo'
];

const SYNTHETIC_AWL_FAMILIES: CanonicalAWLFamily[] = AWL_DEMO_HEADWORDS.map((hw, idx) => {
  const num = String(idx + 1).padStart(2, '0');
  const forms = [hw, `${hw}d`, `${hw}s`, `${hw}ing`, `${hw}tion`];
  return {
    family_id: `MOCK_AWL_FAM_${num}_${hw}`,
    sublist: 1,
    headword: hw,
    headword_clean: hw,
    total_forms_count: 5,
    word_family_forms: forms,
    word_family_raw: forms.join('|'),
    source_row_ids: [1001 + idx],
    reconciliation_note: null,
    provenance: [
      {
        source_file: 'synthetic_mock_awl.json',
        source_sha256: 'mock_fixture_non_proprietary',
        transform_version: 'stage_4b_v2.3',
        editorial_status: 'MOCK_FIXTURE_FOR_LOCAL_DEVELOPMENT_ONLY'
      }
    ]
  };
});

export const SYNTHETIC_AWL_GROUP: UIAWLStudyGroup & AWLStudyGroupHeader = {
  group_id: 'MOCK_AWL_GRP_01',
  sublist_number: 1,
  group_index: 1,
  global_group_index: 1,
  title: 'Mock Sublist 1 -- Study Group 1',
  families_count: 10,
  family_ids: SYNTHETIC_AWL_FAMILIES.map((f) => f.family_id),
  headwords: AWL_DEMO_HEADWORDS,
  families: SYNTHETIC_AWL_FAMILIES
};

export const SYNTHETIC_IDIOM_CARD: CanonicalIdiomEntry = {
  idiom_id: 'MOCK_IDI_001_synthetic_break_the_ice',
  raw_source_id: 901,
  idiom: 'Break the ice',
  category: 'Communication',
  difficulty: 'Intermediate',
  ielts_usage_raw: 'Speaking Part 1, Speaking Part 2',
  ielts_usage_tags: ['Speaking Part 1', 'Speaking Part 2'],
  definition: 'To initiate conversation and help people feel relaxed in an unfamiliar setting.',
  example_sentence: 'The introductory speaking activity was designed to break the ice among candidates.',
  provenance: {
    source_file: 'synthetic_mock_idioms.json',
    source_sha256: 'mock_fixture_non_proprietary',
    transform_version: 'stage_4b_v2.3',
    editorial_status: 'MOCK_FIXTURE_FOR_LOCAL_DEVELOPMENT_ONLY'
  }
};

export const SYNTHETIC_LINKING_CARD: CanonicalLinkingWordEntry = {
  linking_id: 'MOCK_LNK_001_synthetic_furthermore',
  raw_source_id: 'MOCK_LNK_SRC_001',
  function_category: 'Adding Information',
  function_code: 'add',
  linking_phrase: 'furthermore',
  linking_phrase_clean: 'furthermore',
  grammatical_type: 'Adverbial Connector',
  meaning: 'in addition to what has previously been stated',
  ielts_usage_raw: 'Writing Task 2, Speaking Part 3',
  ielts_usage_tags: ['Writing Task 2', 'Speaking Part 3'],
  cefr_level: 'B2',
  formality: 'Formal',
  sentence_position: 'Sentence Initial',
  grammar_pattern: 'Furthermore, + independent clause',
  common_usage: 'Used to introduce a stronger or additional supporting point in formal essays.',
  similar_connectors_raw: 'moreover, additionally, in addition',
  similar_connectors: ['moreover', 'additionally', 'in addition'],
  opposite_function: 'Contrast, Concession',
  sample_sentence_ielts: 'The research was thoroughly documented; furthermore, the results were replicable.',
  sample_sentence_additional: 'The proposed measure reduced carbon emissions; furthermore, operational costs declined.',
  common_mistakes: 'Avoid using furthermore to connect short conversational remarks.',
  pedagogical_notes: 'High-value cohesive device for formal academic essays.',
  provenance: {
    source_file: 'synthetic_mock_linking.json',
    source_sha256: 'mock_fixture_non_proprietary',
    transform_version: 'stage_4b_v2.3',
    editorial_status: 'MOCK_FIXTURE_FOR_LOCAL_DEVELOPMENT_ONLY'
  }
};

export const SYNTHETIC_PHRASAL_CARD: CanonicalPhrasalVerbEntry = {
  pv_id: 'MOCK_PV_001_synthetic_carry_out',
  raw_source_id: 'MOCK_PV_SRC_001',
  topic: 'Education & Study',
  topic_code: 'edu',
  phrasal_verb: 'carry out',
  phrasal_verb_clean: 'carry out',
  meaning: 'to conduct or complete a task, experiment, or investigation',
  usage_type: 'Idiomatic',
  ielts_usage_raw: 'Writing Task 1, Writing Task 2, Reading',
  ielts_usage_tags: ['Writing Task 1', 'Writing Task 2', 'Reading'],
  cefr_level: 'B2',
  formality: 'Formal',
  common_pattern: 'carry out + noun phrase',
  separable: 'Yes',
  transitivity: 'Transitive',
  synonyms_raw: 'conduct, execute, implement',
  synonyms: ['conduct', 'execute', 'implement'],
  antonyms_raw: 'neglect, abandon',
  antonyms: ['neglect', 'abandon'],
  collocations_raw: 'carry out research, carry out a survey, carry out an experiment',
  collocations: ['carry out research', 'carry out a survey', 'carry out an experiment'],
  sample_sentence_ielts: 'Researchers carried out a controlled investigation into language acquisition.',
  sample_sentence_additional: 'The university committee plans to carry out an annual academic review.',
  common_mistakes: 'Using it for physical carrying instead of task execution.',
  memory_tip: 'Think of executing a task and carrying results outward.',
  notes: 'High-frequency academic phrasal verb.',
  provenance: {
    source_file: 'synthetic_mock_phrasal.json',
    source_sha256: 'mock_fixture_non_proprietary',
    transform_version: 'stage_4b_v2.3',
    editorial_status: 'MOCK_FIXTURE_FOR_LOCAL_DEVELOPMENT_ONLY'
  }
};

export const SYNTHETIC_VARIANT_CARD: CanonicalBritishAmericanPair = {
  variant_id: 'MOCK_VAR_001_synthetic_crisps_chips',
  raw_source_id: 901,
  category: 'Food',
  category_slug: 'food',
  british_word_raw: 'crisps',
  british_word_primary: 'crisps',
  british_word_variants: ['crisps'],
  american_word_raw: 'chips',
  american_word_primary: 'chips',
  american_word_variants: ['chips'],
  is_multivariant: false,
  provenance: {
    source_file: 'synthetic_mock_variants.json',
    source_sha256: 'mock_fixture_non_proprietary',
    transform_version: 'stage_4b_v2.3',
    editorial_status: 'MOCK_FIXTURE_FOR_LOCAL_DEVELOPMENT_ONLY'
  }
};

export const SYNTHETIC_CREDITS_ENTRY: SourceAttribution = {
  source_id: 'MOCK_SRC_OPEN_ACADEMIC_01',
  provider_name: 'Mock Academic Lexical Resource Project',
  associated_collections: ['COLL_MOCK_VOCAB'],
  usage_scope: 'Educational Development Mock Fixture (Non-production UI testing)',
  verification_status: 'OWNER_REPORTED_PENDING_PRIVATE_SIGNOFF',
  acknowledgment_text:
    'Sample lexical resource fixture modeled for local UI development. Terms pending private owner review and formal licensing signoff.',
  source_links: [
    {
      label: 'Mock Project Specification',
      url: 'https://example.org/mock-academic-resource',
      access_mode: 'EXTERNAL_LINK_OUT_ONLY'
    }
  ],
  video_links: [
    {
      label: 'Mock Project Overview Video (External)',
      url: 'https://example.org/mock-academic-resource/overview-video',
      access_mode: 'EXTERNAL_LINK_OUT_ONLY'
    }
  ],
  display_zones: ['/credits', 'LearnCardModal'],
  media_policy: 'EXTERNAL_LINK_ONLY'
};

export const BASE_MOCK_SEARCH_ITEMS: CompactSearchItem[] = [
  SYNTHETIC_OXFORD_SEARCH_ITEMS[0],
  {
    id: 'MOCK_AWL_FAM_01_analyze_demo',
    term: 'analyze_demo',
    normalized_term: 'analyze_demo',
    search_aliases: ['analysis_demo', 'analyst_demo'],
    entity_type: 'awl',
    cefr_level: null,
    difficulty: null,
    pos: 'Family',
    pos_code: 'awl',
    edition: 'Both',
    category: 'Sublist 1',
    topic_code: 's01',
    skills: ['Writing Task 2'],
    direct_skills: [],
    skill_mappings: [
      {
        skill: 'Writing Task 2',
        evidence: 'proposed_unreviewed',
        approval_status: 'PROPOSED_UNREVIEWED',
        pedagogical_rationale: 'High-frequency academic family recommended for Academic Writing Task 2.'
      }
    ],
    target_file: 'DEVELOPMENT_FIXTURES/mock_awl_group.json'
  },
  {
    id: 'MOCK_IDI_001_synthetic_break_the_ice',
    term: 'Break the ice',
    normalized_term: 'break the ice',
    search_aliases: ['break ice'],
    entity_type: 'idiom',
    cefr_level: null,
    difficulty: 'Intermediate',
    pos: 'Idiom',
    pos_code: 'idiom',
    edition: 'Both',
    category: 'Communication',
    topic_code: null,
    skills: ['Speaking Part 1', 'Speaking Part 2'],
    direct_skills: ['Speaking Part 1', 'Speaking Part 2'],
    skill_mappings: [
      {
        skill: 'Speaking Part 1',
        evidence: 'source_tagged',
        approval_status: 'SOURCE_VERIFIED'
      },
      {
        skill: 'Speaking Part 2',
        evidence: 'source_tagged',
        approval_status: 'SOURCE_VERIFIED'
      }
    ],
    target_file: 'DEVELOPMENT_FIXTURES/mock_idiom_card.json'
  }
];

export const DEFAULT_MOCK_FIXTURE_BUNDLE: MockFixtureBundle = {
  oxfordCard: SYNTHETIC_OXFORD_ENTRIES[0],
  awlGroup: SYNTHETIC_AWL_GROUP,
  idiomCard: SYNTHETIC_IDIOM_CARD,
  linkingCard: SYNTHETIC_LINKING_CARD,
  phrasalCard: SYNTHETIC_PHRASAL_CARD,
  variantCard: SYNTHETIC_VARIANT_CARD,
  searchResults: {
    items: BASE_MOCK_SEARCH_ITEMS,
    totalMatches: 3,
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasMore: false,
    facets: {
      cefr: { B1: 1, unassigned: 2 },
      difficulty: { Intermediate: 1 },
      pos: { Verb: 1, Family: 1, Idiom: 1 },
      skills: {
        'Writing Task 1': 1,
        'Writing Task 2': 2,
        Speaking: 1,
        'Speaking Part 1': 1,
        'Speaking Part 2': 1
      },
      entityTypes: { oxford: 1, awl: 1, idiom: 1 }
    }
  },
  creditsEntry: SYNTHETIC_CREDITS_ENTRY,
  extraOxfordEntries: SYNTHETIC_OXFORD_ENTRIES.slice(1),
  extraSearchItems: SYNTHETIC_OXFORD_SEARCH_ITEMS.slice(1)
};

export const defaultMockResourceBankProvider: IResourceBankProvider =
  createMockResourceBankProvider(DEFAULT_MOCK_FIXTURE_BUNDLE);

