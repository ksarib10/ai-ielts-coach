import type { AboutCardContent, AboutHighlight, AboutTopicId, QuestionTypeContent } from './types';
import whatIsIelts from './what-is-ielts.json';
import academicGeneral from './academic-general.json';
import testFormat from './test-format.json';
import sectionsDuration from './sections-duration.json';
import bands from './bands.json';
import registrationTestDay from './registration-test-day.json';
import computerPaper from './computer-paper.json';
import accessibility from './accessibility.json';
import faqs from './faqs.json';
import questionTypesJson from './test-format-question-types.json';

export type { AboutCardContent, AboutHighlight, AboutTopicId, QuestionType, QuestionTypeContent, QuestionTypeSection } from './types';
export { SOURCE_COVERAGE_SUMMARY, sourceCoverageMap, type SourceCoverageRecord, type CoverageStatus } from './coverage';

/** Content pack version as delivered in IELTS_ABOUT_9_CARD_CONTENT_PACK_V1_1. */
export const ABOUT_CONTENT_PACK_VERSION = '1.1';

/** Display order preserves the existing nine `/ielts-about/:topicId` slugs. */
export const ABOUT_TOPIC_ORDER: readonly AboutTopicId[] = [
  'what-is-ielts', 'academic-general', 'test-format', 'sections-duration', 'bands',
  'registration-test-day', 'computer-paper', 'accessibility', 'faqs',
];

const cards: Record<AboutTopicId, AboutCardContent> = {
  'what-is-ielts': whatIsIelts as AboutCardContent,
  'academic-general': academicGeneral as AboutCardContent,
  'test-format': testFormat as AboutCardContent,
  'sections-duration': sectionsDuration as AboutCardContent,
  bands: bands as AboutCardContent,
  'registration-test-day': registrationTestDay as AboutCardContent,
  'computer-paper': computerPaper as AboutCardContent,
  accessibility: accessibility as AboutCardContent,
  faqs: faqs as AboutCardContent,
};

export const questionTypeContent = questionTypesJson as QuestionTypeContent;

export const isAboutTopicId = (value: unknown): value is AboutTopicId =>
  typeof value === 'string' && (ABOUT_TOPIC_ORDER as readonly string[]).includes(value);

export const aboutCard = (id: AboutTopicId): AboutCardContent => cards[id];
export const allAboutCards = (): readonly AboutCardContent[] => ABOUT_TOPIC_ORDER.map(id => cards[id]);

/** Highlights for one section, in source order. */
export const highlightsIn = (card: AboutCardContent, section: string): readonly AboutHighlight[] =>
  card.highlights.filter(h => h.section === section);

/** Only absolute https URLs are rendered as source links. */
export function isSafeSourceUrl(url: string): boolean {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && !!parsed.hostname; } catch { return false; }
}

/** Human-readable host label used beside each source link. */
export function sourceHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'source'; }
}

/** Unique, safe source URLs, preserving order. */
export const uniqueSources = (urls: readonly string[]): string[] => [...new Set(urls)].filter(isSafeSourceUrl);

/** Structural validation of the bundled content; used by QA tests. Returns problems (empty when valid). */
export function validateAboutContent(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const id of ABOUT_TOPIC_ORDER) {
    const card = cards[id];
    if (!card) { problems.push(`missing card ${id}`); continue; }
    if (card.cardId !== id) problems.push(`card id mismatch ${id}`);
    if (card.route !== `/ielts-about/${id}`) problems.push(`route mismatch ${id}`);
    if (!card.highlights.length) problems.push(`no highlights ${id}`);
    for (const h of card.highlights) {
      if (ids.has(h.id)) problems.push(`duplicate highlight ${h.id}`);
      ids.add(h.id);
      if (!h.heading.trim() || !h.text.trim()) problems.push(`empty highlight ${h.id}`);
      if (!h.source_urls.length || !h.source_urls.every(isSafeSourceUrl)) problems.push(`bad source ${h.id}`);
      if (!h.original_topic_ids.length) problems.push(`no traceability ${h.id}`);
    }
  }
  for (const section of questionTypeContent.sections) {
    if (!isSafeSourceUrl(section.officialReference)) problems.push(`bad reference ${section.skillId}`);
    section.questionTypes.forEach((q, index) => {
      if (q.order !== index + 1) problems.push(`order ${q.id}`);
      if (!q.whatIsInvolved || !q.skillsTested || !q.questionCount) problems.push(`incomplete ${q.id}`);
      if (!q.sourceUrls.length || !q.sourceUrls.every(isSafeSourceUrl)) problems.push(`bad source ${q.id}`);
    });
  }
  return problems;
}
