// Presentation-only metadata for the IELTS About pages. This is product copy
// written for AI IELTS Coach (intros, short display labels derived from the
// cited highlights). It is NOT source content and adds no new IELTS facts.
import type { AboutTopicId } from './types';

export const aboutIntro: Record<AboutTopicId, string> = {
  'what-is-ielts': 'A short orientation to the test, why people take it and who stands behind it.',
  'academic-general': 'Compare the two IELTS test types and see which sections are shared and which differ.',
  'test-format': 'Explore each of the four skills, including the question types you can meet in Listening and Academic Reading.',
  'sections-duration': 'How long each section lasts, how Writing time is usually divided and how the sections run on the day.',
  bands: 'How IELTS reports results on the 0–9 band scale and how the overall band is worked out.',
  'registration-test-day': 'A practical checklist for before you book, on the day and after your results.',
  'computer-paper': 'Current delivery options, including the 2026 change to paper-based testing and IELTS Online.',
  accessibility: 'Support that may be available if you have specific needs, and how to request it early.',
  faqs: 'Quick answers to common questions. Search or filter by topic.',
};

/** Short card descriptions used on the IELTS About index. */
export const aboutCardSummary: Record<AboutTopicId, string> = {
  'what-is-ielts': 'The name, the four skills and why IELTS results are used.',
  'academic-general': 'Which test fits your goal, and what is shared or different.',
  'test-format': 'Four skill tabs with detailed Listening and Academic Reading question types.',
  'sections-duration': 'Section timings, Writing time planning and the test-day sequence.',
  bands: 'The 0–9 scale, overall band rounding and how sections are assessed.',
  'registration-test-day': 'Before booking, test-day and results checklists.',
  'computer-paper': 'The 2026 delivery update, test-centre computer and IELTS Online.',
  accessibility: 'Access arrangements by need, and why to contact the centre early.',
  faqs: 'Searchable answers to ten common questions.',
};

/** Large display values for the duration tiles, keyed by highlight id; each restates its cited highlight. */
export const durationDisplay: Record<string, { value: string; unit: string; qualifier?: string }> = {
  'sections-duration-01': { value: '≈30', unit: 'minutes', qualifier: 'Varies by delivery mode' },
  'sections-duration-02': { value: '60', unit: 'minutes' },
  'sections-duration-03': { value: '60', unit: 'minutes', qualifier: 'Two tasks' },
  'sections-duration-04': { value: '11–14', unit: 'minutes' },
};

/** Skill chips derived from the cited highlight text (no additional facts). */
export const sharedSkills = ['Listening', 'Speaking'] as const;
export const differingSkills = ['Reading', 'Writing'] as const;
export const fourSkills = ['Listening', 'Reading', 'Writing', 'Speaking'] as const;

/** Primary official guidance link per page, chosen from URLs already cited in that page's content. */
export const primaryGuidance: Partial<Record<AboutTopicId, { label: string; url: string }>> = {
  'computer-paper': { label: 'Read the official 2026 delivery update', url: 'https://ielts.org/news-and-insights/updates-to-ielts-test-delivery' },
  accessibility: { label: 'Official access arrangements guidance', url: 'https://www.ielts.org/take-a-test/booking-your-test/access-arrangements' },
  'registration-test-day': { label: 'Official test-day guidance', url: 'https://ielts.org/take-a-test/booking-your-test/test-day' },
};

