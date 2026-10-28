import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
buildSync({stdin:{contents:`export * from './src/features/discovery/services/catalog'; export * from './src/features/discovery/routes'; export * from './src/features/discovery/components/CatalogCard'; export * from './src/features/shell/components/DevelopmentPreview'; export {contentService} from './src/services/platform'; export {navigationGroups} from './src/features/shell/services/navigation'; export * from './src/content/ielts-about'; export * from './src/content/ielts-about/presentation'; export * from './src/features/discovery/about/AboutPages';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,packages:'external',platform:'node',format:'cjs',outfile:'qa/.discovery-test.cjs',logLevel:'silent'});
const require=createRequire(import.meta.url);const x=require('./.discovery-test.cjs');const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {MemoryRouter}=require('react-router-dom');
const expected=['Vocabulary','Academic Word List (AWL)','TED Talk Learning','Grammar & Tenses','Phrasal Verbs','Idioms','Irregular Verbs','Collocations','Linking Words & Connectors','British vs American English'];
const categories=x.localCatalogSource.learn();assert.deepEqual(categories.map(c=>c.title),expected);assert.equal(new Set(categories.map(c=>c.id)).size,10);
assert.equal(categories.filter(c=>c.availability==='SAMPLE').length,2);assert.ok(categories.filter(c=>c.availability==='PLANNED').every(c=>c.actions.length===0));
for(const c of categories)assert.ok(x.categoryHref(c.id).startsWith('/learn/category/'));
for(const module of ['Listening','Reading','Writing','Speaking']){
 const items=x.localCatalogSource.skills(module);assert.equal(items.length,6);assert.equal(new Set(items.map(i=>i.id)).size,6);
 assert.equal(x.skillActivityHref(module,items.at(-1),'Academic'),`/${module.toLowerCase()}/scoring-criteria`);
 for(const item of items){
  const href=x.skillActivityHref(module,item,'General Training');assert.ok(href.startsWith('/'));
  if(item.target.kind==='workspace'){const r=x.contentService.resource(item.target.resourceId);assert.ok(r,item.target.resourceId);assert.equal(r.module,module);}
  if(item.target.kind==='lessons')assert.ok(x.contentService.lessons().some(l=>l.category===item.target.category));
  if(item.title.startsWith('Full '))assert.equal(item.availability,'PLANNED');
 }
}
const writing=x.localCatalogSource.skills('Writing');assert.equal(x.skillActivityHref('Writing',writing[0],'Academic'),'/writing/learn/writing-1');assert.equal(x.skillActivityHref('Writing',writing[0],'General Training'),'/writing/learn/writing-letter');assert.equal(writing[2].target.mode,'test');
assert.equal(x.localCatalogSource.about().length,9);assert.ok(x.localCatalogSource.about().every(i=>i.availability==='REFERENCE_PENDING'));
assert.deepEqual(x.navigationGroups.map(g=>g.label),['Main','IELTS Skills','Assessment & Progress','Information']);
const links=x.navigationGroups.flatMap(g=>g.items);assert.equal(links.length,10);assert.ok(!links.some(i=>['/practice','/mock-tests','/readiness','/saved','/ai-coach'].includes(i.path)));assert.equal(links.find(i=>i.path==='/exam').label,'Complete IELTS Exam');
const oldError=console.error;console.error=(m,...a)=>{if(!String(m).includes('useLayoutEffect does nothing on the server'))oldError(m,...a)};
const render=e=>renderToStaticMarkup(React.createElement(MemoryRouter,null,e));
const pending=render(React.createElement(x.CatalogCard,{item:categories[1],href:x.categoryHref(categories[1].id)}));assert.ok(pending.includes('Coming soon'));assert.ok(pending.includes('View availability: Academic Word List'));assert.ok(!pending.includes('Start learning'));
const locked=render(React.createElement(x.CatalogCard,{item:x.localCatalogSource.skills('Reading')[0],href:'/reading/practice/gardens',locked:true}));assert.ok(locked.includes('Assessment required'));assert.ok(locked.includes('View requirements'));
const disclosure=render(React.createElement(x.DevelopmentPreview));assert.ok(disclosure.includes('<summary>Development Preview</summary>'));assert.ok(disclosure.includes('shared device'));assert.ok(disclosure.includes('not validated'));
assert.deepEqual(x.validateAboutContent(),[]);
const aboutCards=x.allAboutCards();assert.equal(aboutCards.length,9);
assert.equal(aboutCards.reduce((sum,c)=>sum+c.highlights.length,0),83);
const starterIds=['what-is-ielts-01','what-is-ielts-02','what-is-ielts-03','what-is-ielts-04','what-is-ielts-05','what-is-ielts-06','academic-general-01','academic-general-02','academic-general-03','academic-general-04','academic-general-05','academic-general-06','test-format-01','test-format-02','test-format-03','test-format-04','test-format-05','test-format-06','test-format-07','test-format-08','test-format-09','test-format-10','sections-duration-01','sections-duration-02','sections-duration-03','sections-duration-04','sections-duration-05','sections-duration-06','sections-duration-07','bands-01','bands-02','bands-03','bands-04','bands-05','bands-06','bands-07','bands-08','registration-test-day-01','registration-test-day-02','registration-test-day-03','registration-test-day-04','registration-test-day-05','registration-test-day-06','registration-test-day-07','computer-paper-01','computer-paper-02','computer-paper-03','computer-paper-04','computer-paper-05','computer-paper-06','accessibility-01','accessibility-02','accessibility-03','accessibility-04','accessibility-05','accessibility-06','faqs-01','faqs-02','faqs-03','faqs-04','faqs-05','faqs-06','faqs-07','faqs-08','faqs-09','faqs-10'];
assert.equal(starterIds.length,66);for(const sid of starterIds)assert.ok(aboutCards.some(c=>c.highlights.some(h=>h.id===sid)),`Missing starter highlight ${sid}`);
assert.equal(x.SOURCE_COVERAGE_SUMMARY.totalRecords,458);assert.equal(x.SOURCE_COVERAGE_SUMMARY.included,439);assert.equal(x.SOURCE_COVERAGE_SUMMARY.consolidated,14);assert.equal(x.SOURCE_COVERAGE_SUMMARY.withheld,5);assert.equal(x.sourceCoverageMap.length,458);
const faqCard=aboutCards.find(c=>c.cardId==='faqs');assert.equal(faqCard.highlights.length,18);
for(const q of ['What is the IELTS test format?','In what order will I take the test sections?','What accents will I hear in the Listening section?','What accents will I hear in the Speaking section?']){
 assert.ok(faqCard.highlights.some(h=>h.heading===q),`Missing screenshot FAQ: ${q}`);
}
assert.equal(x.questionTypeContent.sections.find(s=>s.skillId==='listening').questionTypes.length,6);
assert.equal(x.questionTypeContent.sections.find(s=>s.skillId==='academic-reading').questionTypes.length,11);
const aboutOverview=render(React.createElement(x.CatalogCard,{item:x.localCatalogSource.about()[0],href:x.aboutHref('what-is-ielts'),statusLabel:x.aboutCardSummary['what-is-ielts'],actionLabel:'Open guide'}));assert.ok(aboutOverview.includes('What is IELTS?'));assert.ok(aboutOverview.includes('Open guide'));
for(const card of aboutCards){
 const pageHtml=render(React.createElement(x.AboutTopicBody,{id:card.cardId}));
 for(const h of card.highlights)assert.ok(pageHtml.includes(`data-highlight-id="${h.id}"`),`Missing highlight ${h.id} on ${card.cardId}`);
 assert.ok(pageHtml.includes('rel="noopener noreferrer"'),`Missing safe external links on ${card.cardId}`);
}
const tfHtml=render(React.createElement(x.AboutTopicBody,{id:'test-format'}));
assert.ok(tfHtml.includes('Question type 1 – Multiple choice'));assert.ok(tfHtml.includes('Question type 6 – Short-answer questions'));
assert.ok(tfHtml.includes("What&#x27;s involved?")||tfHtml.includes("What's involved?"));assert.ok(tfHtml.includes('What skills are tested?'));assert.ok(tfHtml.includes('How many questions are there?'));
assert.ok(tfHtml.includes('Question type 11 – Short-answer questions'));assert.ok(tfHtml.includes('Types of question — Academic Reading'));
assert.ok(tfHtml.includes('Task 1')&&tfHtml.includes('Task 2'));assert.ok(tfHtml.includes('Part 1')&&tfHtml.includes('Part 2')&&tfHtml.includes('Part 3'));
console.error=oldError;
const app=fs.readFileSync('src/App.tsx','utf8');for(const oldRoute of ['/practice','/mock-tests','/saved','/vocabulary','/ai-coach','/readiness','/exam-simulation','/learn/:id'])assert.ok(app.includes(`path="${oldRoute}"`),oldRoute);
assert.ok(app.includes('discoveryRoutes.readiness'));assert.ok(app.includes('ModuleLibrary'));
console.log('PASS: ten Learn categories, 24 skill cards, nine IELTS About pages (83 highlights covering 458 source records + 6 Listening & 11 Academic Reading question types + 18 FAQs), existing resource targets, track-specific Task1, compact sidebar, availability semantics, preview disclosure and preserved legacy routes.');
