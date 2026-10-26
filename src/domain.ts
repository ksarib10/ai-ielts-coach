export type Module = 'Reading' | 'Writing' | 'Listening' | 'Speaking';
export type Mode = 'learn' | 'practice' | 'test' | 'exam';
export type Answer = string | string[];
export type ContentBlock =
  | { type: 'heading' | 'paragraph' | 'instruction' | 'prompt' | 'transcript'; text: string }
  | { type: 'rich_text'; parts: { text: string; emphasis?: boolean }[] }
  | { type: 'list'; items: string[] }
  | { type: 'table'; caption: string; headers: string[]; rows: string[][] }
  | { type: 'chart'; caption: string; values: { label: string; value: number }[] }
  | { type: 'image' | 'diagram'; src: string; alt: string; caption: string };
export type ActivityType = 'single_choice' | 'multiple_choice' | 'true_false' | 'true_false_not_given' | 'yes_no_not_given' | 'short_answer' | 'fill_blank' | 'sentence_completion' | 'summary_completion' | 'note_completion' | 'table_completion' | 'form_completion' | 'matching' | 'matching_headings' | 'matching_information' | 'ordering' | 'sentence_reorder' | 'dropdown_completion' | 'image_question' | 'diagram_labeling' | 'chart_interpretation' | 'writing_response' | 'speaking_response' | 'discussion_prompt';
export interface Activity { id: string; type: ActivityType; prompt: string; options?: string[]; answer?: Answer; explanation: string; skill: string; hint?: string; image?: string; fields?: string[]; preparation?: number; sampleResponse?: string; }
export interface Resource { id: string; title: string; module: Module; level: string; minutes: number; task: string; blocks: ContentBlock[]; activities: Activity[]; audio?: string; transcript?: string; wordTarget?: number; }
export interface Lesson { id: string; title: string; category: string; level: string; minutes: number; objective: string; blocks: ContentBlock[]; check: Activity; module: Module; }
export interface Attempt { id: string; resourceId: string; module: Module; mode: Mode; answers: Record<string, Answer>; correct: number; total: number; seconds: number; submittedAt: string; }
export interface Draft { answers: Record<string, Answer>; flags: string[]; deadline?: number; startedAt: number; audioPlayed?: boolean; }
export interface ActivityEvent { id: string; kind: 'lesson' | 'attempt'; referenceId: string; occurredAt: string; minutes: number; }
export interface ExamSession {
  id: string;
  type: 'Academic' | 'General Training';
  section: number;
  attemptIds: string[];
  complete: boolean;
  startedAt: number;
  moduleStartedAt: number;
  moduleDeadline: number;
  completedAt?: number;
}
export interface LearningState { attempts: Attempt[]; drafts: Record<string, Draft>; completedLessons: string[]; mastery: Record<string, number>; highlights: Record<string, string[]>; vocabulary: { word: string; meaning: string; context: string; mastered: boolean }[]; activityLog: ActivityEvent[]; exam?: ExamSession; examHistory?: ExamSession[]; }
export const modules: Module[] = ['Reading', 'Writing', 'Listening', 'Speaking'];
export const policies: Record<Mode, { label: string; ai: string; hints: boolean; strict: boolean }> = {
  learn: { label: 'Learn', ai: 'Full AI assistance', hints: true, strict: false },
  practice: { label: 'Practice', ai: 'Limited AI guidance', hints: true, strict: false },
  test: { label: 'Test', ai: 'AI disabled', hints: false, strict: true },
  exam: { label: 'Exam Simulation', ai: 'AI disabled · strict conditions', hints: false, strict: true },
};
