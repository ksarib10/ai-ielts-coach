from pathlib import Path
import json,hashlib,urllib.request,urllib.error
D=Path(r'C:\Users\ksari\source\repos\ai-ielts-coach');R=Path(__file__).parent;W=R/'slice1_work'
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
for name in ['keys-and-explanations.json','listening-production-scripts.json']:
 path='docs/reviews/stage-1b/diagnostic-question-bank-preparation/v2.0.0-candidate/private/'+name
 try:
  with urllib.request.urlopen('http://127.0.0.1:4391/'+path,timeout=15) as response:code=response.status
 except urllib.error.HTTPError as e:code=e.code
 assert code==403,(path,code);checks.append({'path':path,'httpStatus':code})
jsfiles=list((D/'dist/assets').glob('*.js'));assert jsfiles
bundle='\n'.join(p.read_text(encoding='utf-8') for p in jsfiles)
absent=['proposedCorrectOptionId','diagv1.a.g02.r1','Welcome to the Riverside Museum volunteer briefing.','This is a message for passengers using Hillford Station']
for text in absent:assert text not in bundle,'Candidate content found in production bundle'
assert not (D/'dist/docs').exists()
srcfiles=list((D/'src').rglob('*.ts'))+list((D/'src').rglob('*.tsx'))
for p in srcfiles:
 s=p.read_text(encoding='utf-8')
 assert 'diagnostic-question-bank-preparation' not in s and 'keys-and-explanations.json' not in s,p
for p in [D/'src/features/Modules.tsx',*list((D/'src/features/dashboard').rglob('*.tsx'))]:
 s=p.read_text(encoding='utf-8');assert 'moduleScores[module].band' not in s and 'results.overall' not in s,p
assert 'state.mastery[l.check.skill]}%' not in (D/'src/features/Learning.tsx').read_text(encoding='utf-8')
out={'clientDate':'2026-10-27','privateDocsDevHTTP':checks,'productionDocsDirectoryAbsent':True,'candidateKeyAndScriptMarkersAbsentFromBundle':absent,'candidateBankImportsInApplication':False,'activeModuleBandAndLessonMasteryPresentationRemoved':True,'sampleWavUnchanged':h(D/'public/listening-diagnostic.wav')==h(D/'dist/listening-diagnostic.wav'),'buildAssets':[{'path':p.relative_to(D).as_posix(),'bytes':p.stat().st_size,'sha256':h(p)} for p in sorted((D/'dist').rglob('*')) if p.is_file()],'limits':['Existing legacy data.ts development keys remain inspectable by design; Diagnostic V1 is not released.','Pattern checks cover named candidate material and imports, not a proof of total bundle secrecy.','Local Vite403 is not a test of a Vercel deployment; none was created.']}
(W/'delivery-inspection.json').write_text(json.dumps(out,indent=2),encoding='utf-8');print(json.dumps(out,indent=2))
