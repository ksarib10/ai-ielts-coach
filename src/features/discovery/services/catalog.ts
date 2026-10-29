import type { Module } from '../../../domain';
import type { CatalogEntry, CatalogSource, LearnCategory, SkillActivity, SkillTarget, CatalogIcon } from '../types';
const planned=(id:string,title:string,description:string,icon:CatalogIcon):LearnCategory=>({id,title,description,icon,availability:'PLANNED',actions:[]});
const learn:readonly LearnCategory[]=[
 {id:'vocabulary',title:'Vocabulary',description:'Build useful word choices and revisit the words you save.',icon:'words',availability:'SAMPLE',actions:[{label:'All Vocabulary Explorer',href:'/learn/vocabulary/all'},{label:'My saved vocabulary',href:'/saved'},{label:'Vocabulary sample lessons',href:'/learn/lessons?category=Vocabulary'}]},
 planned('awl','Academic Word List (AWL)','Explore academic word families in a future verified collection.','book'),
 planned('ted','TED Talk Learning','Develop listening and language skills with future reviewed talks.','video'),
 {id:'grammar-tenses',title:'Grammar & Tenses',description:'Practise clear sentence patterns with the existing grammar samples.',icon:'grammar',availability:'SAMPLE',actions:[{label:'Grammar sample lessons',href:'/learn/lessons?category=Grammar'}]},
 planned('phrasal-verbs','Phrasal Verbs','Learn how verbs and particles work together in context.','layers'),
 planned('idioms','Idioms','Understand expressions and where they fit naturally.','speaking'),
 planned('irregular-verbs','Irregular Verbs','Build confidence with changing verb forms.','grammar'),
 planned('collocations','Collocations','Explore words that work well together.','words'),
 planned('linking-words','Linking Words & Connectors','Connect ideas clearly in speech and writing.','link'),
 planned('british-american','British vs American English','Compare usage and spelling through future reviewed examples.','globe'),
];
const activity=(id:string,title:string,description:string,icon:CatalogIcon,target:SkillTarget):SkillActivity=>({id,title,description,icon,target,availability:target.kind==='planned'?'PLANNED':target.kind==='criteria'?'REFERENCE_PENDING':'SAMPLE'});
const criteria=(m:Module)=>activity('criteria',`${m} Scoring Criteria`,'An educational reference, pending verified scoring-source content.','criteria',{kind:'criteria'});
const tips=(m:Module)=>activity('tips',`${m} Strategies & Tips`,'A dedicated strategy collection is being prepared for source review.','book',{kind:'planned'});
const skills:Record<Module,readonly SkillActivity[]>={
 Listening:[activity('mini','Mini Listening Practice','Use the original short listening sample; the existing practice gate applies.','headphones',{kind:'workspace',mode:'practice',resourceId:'listening-gardens'}),activity('parts','Part Practice','Dedicated part-by-part listening activities are not available yet.','layers',{kind:'planned'}),activity('full-tests','Full Listening Tests','Full verified listening papers are not available yet.','clock',{kind:'planned'}),activity('lessons','Listening Lessons','Explore the existing listening skill lesson samples.','book',{kind:'lessons',category:'Listening Skills'}),tips('Listening'),criteria('Listening')],
 Reading:[activity('mini','Mini Reading Practice','Practise with one original short passage; the existing practice gate applies.','book',{kind:'workspace',mode:'practice',resourceId:'gardens'}),activity('passages','Passage Practice','Revisit the same short passage sample with focused questions.','layers',{kind:'workspace',mode:'practice',resourceId:'gardens'}),activity('full-tests','Full Reading Tests','Full verified reading papers are not available yet.','clock',{kind:'planned'}),activity('lessons','Reading Lessons','Explore the existing reading skill lesson samples.','book',{kind:'lessons',category:'Reading Skills'}),tips('Reading'),criteria('Reading')],
 Writing:[activity('task-1','Writing Task 1','Open the existing task sample for your saved Academic or General Training track.','writing',{kind:'task-one'}),activity('task-2','Writing Task 2','Plan and draft with the existing essay sample.','writing',{kind:'workspace',mode:'learn',resourceId:'writing-2'}),activity('timed','Timed Writing Practice','Use the existing timed Task 2 test sample with assistance disabled.','clock',{kind:'workspace',mode:'test',resourceId:'writing-2'}),activity('models','Model Essays','A reviewed collection of model essays is not available yet.','book',{kind:'planned'}),tips('Writing'),criteria('Writing')],
 Speaking:[activity('part-1','Speaking Part 1','Open the existing interview-style learning sample.','speaking',{kind:'workspace',mode:'learn',resourceId:'speaking-1'}),activity('part-2','Speaking Part 2','Prepare a response with the existing long-turn sample.','speaking',{kind:'workspace',mode:'learn',resourceId:'speaking-2'}),activity('part-3','Speaking Part 3','Explore the existing discussion-style learning sample.','speaking',{kind:'workspace',mode:'learn',resourceId:'speaking-3'}),activity('simulation','Speaking Simulation','A dedicated complete interview simulation is not available yet.','clock',{kind:'planned'}),tips('Speaking'),criteria('Speaking')],
};
const about:readonly CatalogEntry[]=[
 ['what-is-ielts','What is IELTS?','The name, the four skills and why IELTS results are used.','globe'],
 ['academic-general','IELTS Academic vs General Training','Which test fits your goal, and what is shared or different.','layers'],
 ['test-format','Test format','Four skill tabs with detailed Listening and Academic Reading question types.','book'],
 ['sections-duration','Test sections and duration','Section timings, Writing time planning and the test-day sequence.','clock'],
 ['bands','Band-score overview','The 0–9 scale, overall band rounding and how sections are assessed.','criteria'],
 ['registration-test-day','Registration and test-day information','Before booking, test-day and results checklists.','criteria'],
 ['computer-paper','IELTS on Computer / Paper','The 2026 delivery update, test-centre computer and IELTS Online.','layers'],
 ['accessibility','Accessibility and arrangements','Access arrangements by need, and why to contact the centre early.','link'],
 ['faqs','FAQs','Searchable answers to ten common questions.','book'],
].map<CatalogEntry>(([id,title,description,icon])=>({id,title,description,icon:icon as CatalogIcon,availability:'REFERENCE_PENDING'}));
export const localCatalogSource:CatalogSource={learn:()=>learn,skills:module=>skills[module],about:()=>about};
