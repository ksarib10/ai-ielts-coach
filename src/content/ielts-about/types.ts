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
  editorial_status: string;
}

export interface AboutCardContent {
  schemaVersion: string;
  cardId: AboutTopicId;
  route: string;
  title: string;
  status: string;
  lastCompiled: string;
  display: { layout: string; section_groups: readonly string[] };
  highlights: readonly AboutHighlight[];
  sourceRecordCount: number;
  sourceArchiveFile: string;
  rightsNote: string;
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

