// Typed contract for the IELTS About static content pack (v1.1).
// Content files are editorial drafts pending owner acceptance; they are not
// official IELTS statements. Source text is rendered as plain React text only.

export type AboutTopicId =
  | 'what-is-ielts'
  | 'academic-general'
  | 'test-format'
  | 'sections-duration'
  | 'bands'
  | 'registration-test-day'
  | 'computer-paper'
  | 'accessibility'
  | 'faqs';

export interface AboutHighlight {
  id: string;
  section: string;
  heading: string;
  text: string;
  note?: string;
  original_topic_ids: readonly string[];
  source_urls: readonly string[];
  editorial_status?: string;
  bullets?: readonly string[];
  paragraphs?: readonly string[];
  subsections?: readonly { title: string; text: string; bullets?: readonly string[] }[];
  table?: { caption?: string; headers: readonly string[]; rows: readonly (readonly string[])[] };
  internal_link?: { to: AboutTopicId; label: string };
  status?: 'CONFIRMED' | 'CONDITIONAL' | 'HISTORICAL_POLICY';
}

export interface AboutCardContent {
  schemaVersion: string;
  cardId: AboutTopicId;
  route: string;
  title: string;
  slug?: string;
  status?: string;
  editorialStatus?: string;
  lastCompiled?: string;
  lastReviewed?: string;
  display: {
    layout?: string;
    section_groups: readonly string[];
    primary_guidance?: string;
    primary_guidance_label?: string;
  };
  highlights: readonly AboutHighlight[];
  sourceRecordCount?: number;
  source_review_count?: number;
  sourceArchiveFile?: string;
  rightsNote?: string;
}

export interface QuestionType {
  id: string;
  order: number;
  title: string;
  whatIsInvolved: string;
  skillsTested: string;
  questionCount: string;
  practicalNote?: string;
  sourceTopicIds: readonly string[];
  sourceUrls: readonly string[];
  editorialStatus: string;
}

export interface QuestionTypeSection {
  skillId: 'listening' | 'academic-reading';
  title: string;
  officialReference: string;
  questionTypes: readonly QuestionType[];
}

export interface QuestionTypeContent {
  schemaVersion: string;
  contentType: string;
  editorialStatus: string;
  lastReviewed: string;
  deliveryNotes: readonly string[];
  sections: readonly QuestionTypeSection[];
}

