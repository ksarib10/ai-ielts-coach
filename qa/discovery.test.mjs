import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { buildSync } from 'esbuild';
buildSync({stdin:{contents:`export * from './src/features/discovery/services/catalog'; export * from './src/features/discovery/routes'; export * from './src/features/discovery/components/CatalogCard'; export * from './src/features/shell/components/DevelopmentPreview'; export {contentService} from './src/services/platform'; export {navigationGroups} from './src/features/shell/services/navigation';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,packages:'external',platform:'node',format:'cjs',outfile:'qa/.discovery-test.cjs',logLevel:'silent'});
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
console.error=oldError;
const app=fs.readFileSync('src/App.tsx','utf8');for(const oldRoute of ['/practice','/mock-tests','/saved','/vocabulary','/ai-coach','/readiness','/exam-simulation','/learn/:id'])assert.ok(app.includes(`path="${oldRoute}"`),oldRoute);
assert.ok(app.includes('discoveryRoutes.readiness'));assert.ok(app.includes('ModuleLibrary'));
console.log('PASS: ten Learn categories,24 skill cards, nine information topics, existing resource targets, track-specific Task1, compact sidebar, availability semantics, preview disclosure and preserved legacy routes.');
