# Slice 2 exact route and target manifest

2026-10-28. HashRouter and existing guards retained. `{skill}` expands to listening, reading, writing, speaking. All URLs are client hash paths.

New registered route patterns: `/learn/category/:categoryId`, `/learn/lessons`, `/ielts-about`, `/ielts-about/:topicId`, `/{skill}/library`, `/{skill}/scoring-criteria`, `/{skill}/activities/:activityId`, `/progress/readiness`.

Replaced landing presentation at existing `/learn` and `/{skill}`; old lesson search preserved via `/learn?search=…`, existing LearningHub available at `/learn/lessons`. `/readiness` now redirects to `/progress/readiness`. Existing `/exam` display label changes only.

Learn category IDs: `vocabulary`, `awl`, `ted`, `grammar-tenses`, `phrasal-verbs`, `idioms`, `irregular-verbs`, `collocations`, `linking-words`, `british-american`.
Vocabulary links `/saved`, `/learn/lessons?category=Vocabulary`; Grammar links `/learn/lessons?category=Grammar`; others expose explicit planned information only.

| Hub | Existing working targets | Pending information activity IDs |
|---|---|---|
| Listening | `/listening/practice/listening-gardens` (original gate), `/learn/lessons?category=Listening%20Skills` | parts, full-tests, tips |
| Reading | `/reading/practice/gardens` for Mini/Passage (same short sample, original gate), `/learn/lessons?category=Reading%20Skills` | full-tests, tips |
| Writing | `/writing/learn/writing-1` Academic or `/writing/learn/writing-letter` General Training, `/writing/learn/writing-2`, `/writing/test/writing-2` strict timed Task2 | models, tips |
| Speaking | `/speaking/learn/speaking-1`, `/speaking/learn/speaking-2`, `/speaking/learn/speaking-3` | simulation, tips |

Each hub also links `/{skill}/scoring-criteria`, `/{skill}/library`, `/mock-tests`. Scoring references have no verified descriptors or actual band-marking claim.

About topic IDs: `what-is-ielts`, `academic-general`, `test-format`, `sections-duration`, `bands`, `registration-test-day`, `computer-paper`, `accessibility`, `faqs`. All source pending.

Retained old contracts: `/practice`, `/practice/activity-library`, `/learn/:id`, `/{skill}/:mode/:id`, `/reading/practice`, `/writing/task/:id`, `/speaking/part/:id`, `/{skill}/exam`, `/{skill}/exam/:id`, `/mock-tests`, all `/exam` setup/attempt/result paths, `/exam-simulation`, `/results/:id`, `/ai-coach`, `/saved`, `/vocabulary`, `/settings`, `/profile`, `/mistakes`, public/auth/onboarding/diagnostic/dashboard and fallback. No assessment engine or persisted-record schema is changed.
