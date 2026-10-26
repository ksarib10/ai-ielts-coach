"""Content/schema validator only. No selection engine, app imports or package installation.

Uses the existing Python jsonschema package. Default is read-only with JSON on stdout.
--write-report creates validation/latest-validation.json once; refuses to overwrite it.
--verify-hashes verifies the final manifest after packaging.
--project-root optionally checks every preserved pre-existing file against the manifest.
"""
from pathlib import Path
import argparse,copy,collections,csv,datetime,hashlib,importlib.metadata,json,sys
try:
    from jsonschema import Draft202012Validator
except ImportError:
    raise SystemExit('Required validator jsonschema is unavailable. No installation attempted; request an approved validation environment.')

ROOT=Path(__file__).resolve().parents[1]
SCHEMAS={
 'public/form-a.json':'public-form','public/form-b.json':'public-form','public/bank-catalog.json':'catalog',
 'private/keys-and-explanations.json':'keys','private/listening-production-scripts.json':'scripts',
 'private/review-evidence.json':'review','private/legacy-crosswalk.json':'legacy-crosswalk',
 'private/historical-29-snapshot.json':'historical','provenance/source-register.json':'provenance',
 'media/listening-asset-manifest.json':'media','policies/blueprint.json':'blueprint',
 'policies/selection-policy.json':'selection','policies/scoring-and-capture-policy.json':'scoring',
 'policies/metric-compatibility.json':'metrics',
}
BASELINE=['M01','M02','M03','M04','M05-GRAMMAR','M05-VOCABULARY','M05-READING','M05-LISTENING','M05-FAMILIARITY','M06','M07','M08','M09','M10','M11']
QUOTAS={'grammar':6,'vocabulary':6,'reading':5,'listening':5,'familiarity':5,'writing':1,'speaking':1}
canonical=lambda x:json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode('utf-8')
digest=lambda b:hashlib.sha256(b).hexdigest()
def require(ok,code):
    if not ok:raise AssertionError(code)
def load():return {p:json.loads((ROOT/p).read_text(encoding='utf-8')) for p in SCHEMAS}

def validate(data,schemas):
    for p,s in SCHEMAS.items():
        failures=list(Draft202012Validator(schemas[s]).iter_errors(data[p]))
        require(not failures,'SCHEMA:'+p+(':'+str(failures[0].message) if failures else ''))
    forms=[data['public/form-a.json'],data['public/form-b.json']]
    objectives=[x for f in forms for x in f['objectiveItems']]
    tasks=[x for f in forms for x in f['productiveTasks']]
    items=objectives+tasks
    ids=[x['questionId'] for x in items]
    require(len(ids)==len(set(ids))==58,'UNIQUE_58_ITEMS')
    byid={x['questionId']:x for x in items}
    formof={x['questionId']:f['formId'] for f in forms for x in f['objectiveItems']+f['productiveTasks']}
    blueprint=data['policies/blueprint.json']
    optionids=[];stimuli={}
    fullitemkeys=[]
    for f in forms:
        its=f['objectiveItems']+f['productiveTasks']
        require(dict(collections.Counter(i['domain'] for i in its))==QUOTAS,'FORM_DOMAIN_QUOTAS')
        require(f['blueprintVersion']==blueprint['blueprintVersion'],'BLUEPRINT_VERSION')
        for sec in f['sections']:
            require(sec['questionIds']==[i['questionId'] for i in its if i['domain']==sec['domain']],'PERSISTED_SECTION_ORDER')
        require(len({s['domain'] for s in f['sections']})==7,'UNIQUE_SECTIONS')
        for domain,qs in blueprint['skillQuotas'].items():
            require(collections.Counter(i['skill'] for i in f['objectiveItems'] if i['domain']==domain)==collections.Counter({x['skill']:x['count'] for x in qs}),'SKILL_QUOTAS')
        for s in f['stimuli']:
            require(s['stimulusId'] not in stimuli,'STIMULUS_ID_UNIQUE')
            require(s['formId']==f['formId'],'STIMULUS_FORM_OWNER')
            stimuli[s['stimulusId']]=s
        for i in f['objectiveItems']:
            opts=i['options'];optionids.extend(o['optionId'] for o in opts)
            require(len({o['label'].strip().casefold() for o in opts})==4,'DISTINCT_OPTION_LABELS')
            fullitemkeys.append((i['prompt'],tuple(sorted(o['label'] for o in opts))))
            sid=i['stimulusId']
            if i['domain'] in ['reading','listening']:
                require(sid in stimuli and stimuli[sid]['formId']==f['formId'] and stimuli[sid]['domain']==i['domain'],'STIMULUS_GROUP_MEMBERSHIP')
            else:require(sid is None,'UNNEEDED_STIMULUS_REFERENCE')
        for t in f['productiveTasks']:
            require(t['captureRequirements']['genuineRecordedEvidenceRequired']==(t['domain']=='speaking'),'CAPTURE_KIND')
            require(t['captureRequirements']['rawTextPreserved']==(t['domain']=='writing'),'RAW_WRITING_CAPTURE')
    require(len(set(optionids))==216,'UNIQUE_216_OPTION_IDS')
    require(len(set(fullitemkeys))==54,'NO_COMPLETE_DUPLICATE_OBJECTIVE_ITEMS')
    left={i['questionId'] for i in forms[0]['objectiveItems']+forms[0]['productiveTasks']}
    right={i['questionId'] for i in forms[1]['objectiveItems']+forms[1]['productiveTasks']}
    require(not left&right,'INDEPENDENT_ITEM_IDENTITIES')
    require(len({p['text'] for s in stimuli.values() if s['kind']=='PASSAGE' for p in s['paragraphs']})==8,'INDEPENDENT_READING_TEXT')
    keys=data['private/keys-and-explanations.json']['entries']
    require({k['questionId'] for k in keys}=={x['questionId'] for x in objectives} and len(keys)==54,'EXACT_KEY_COVERAGE')
    keymap={k['questionId']:k for k in keys}
    sources={s['sourceId'] for s in data['provenance/source-register.json']['sources']}
    scriptsegments={s['stimulusId']:s['segments'] for s in data['private/listening-production-scripts.json']['scripts']}
    positions={}
    for k in keys:
        i=byid[k['questionId']];opts={o['optionId']:o['label'] for o in i['options']}
        require(k['formId']==formof[i['questionId']],'KEY_FORM_OWNER')
        require(k['proposedCorrectOptionId'] in opts,'KEY_OPTION_MEMBERSHIP')
        require({r['optionId'] for r in k['distractorRationales']}==set(opts)-{k['proposedCorrectOptionId']},'EXACT_THREE_DISTRACTOR_RATIONALES')
        for e in k['evidence']:
            require(e['sourceId'] in sources or e['sourceId'] in stimuli,'SOURCE_REFERENCE')
            if e['sourceId'] in stimuli:
                require(e['sourceId']==i['stimulusId'],'ITEM_EVIDENCE_STIMULUS')
                segments=scriptsegments[e['sourceId']] if i['domain']=='listening' else stimuli[e['sourceId']]['paragraphs']
                sidfield='segmentId' if i['domain']=='listening' else 'paragraphId'
                matching=[s for s in segments if s[sidfield]==e['locator']]
                require(len(matching)==1 and e['quote'] and e['quote'] in matching[0]['text'],'EXACT_EVIDENCE_QUOTE')
        position=next(n for n,o in enumerate(i['options']) if o['optionId']==k['proposedCorrectOptionId'])
        positions.setdefault(k['formId'],collections.Counter())[position]+=1
    for counts in positions.values():require(set(counts)=={0,1,2,3} and max(counts.values())-min(counts.values())<=1,'BALANCED_PER_FORM_KEYS')
    # IDs encode no correct-answer role: verify the documented text/content-derived identity.
    for i in objectives:
        for o in i['options']:
            require(o['optionId']=='opt.'+digest((i['questionId']+'\0'+o['label']).encode())[:20],'OPAQUE_ROLE_INDEPENDENT_OPTION_ID')
    review=data['private/review-evidence.json']['entries']
    require({x['questionId'] for x in review}==set(ids) and len(review)==58,'REVIEW_COVERAGE')
    for r in review:
        require(r['formId']==formof[r['questionId']] and r['domain']==byid[r['questionId']]['domain'],'REVIEW_ITEM_MATCH')
        require(not r['scoringEligible'] and not r['approvedBy'] and not r['approvedAt'],'NO_UNREVIEWED_APPROVAL')
        require(set(r['provenanceIds'])<=sources,'PROVENANCE_REFERENCE')
    assets=data['media/listening-asset-manifest.json']['assets']
    for a in assets:
        require(a['stimulusId'] in scriptsegments and a['mediaId']==stimuli[a['stimulusId']]['mediaId'],'AUDIO_SCRIPT_LINK')
        require(set(a['affectedQuestionIds'])=={i['questionId'] for i in objectives if i['stimulusId']==a['stimulusId']},'AUDIO_ITEM_GROUP')
        require(a['scriptDigest']==digest(canonical(scriptsegments[a['stimulusId']])),'SCRIPT_DIGEST')
        require(a['assetState']=='MISSING' and a['audioSha256'] is None and a['actualAssetPath'] is None,'NO_PLACEHOLDER_AUDIO_READY')
    require(not list(ROOT.rglob('*.wav')) and not list(ROOT.rglob('*.mp3')),'NO_FAKE_AUDIO_FILE')
    history=data['private/historical-29-snapshot.json']['items']
    cross=data['private/legacy-crosswalk.json']['entries']
    require(len(cross)==29 and {x['legacyAuditId'] for x in cross}=={x['auditItemId'] for x in history},'ALL_LEGACY_IDENTITIES_PRESERVED')
    old={x['auditItemId']:x for x in history}
    rmap={r['questionId']:r for r in review}
    for row in cross:
        require(row['existingQuestionId']==(old[row['legacyAuditId']]['existingQuestionId'] or None),'LEGACY_RUNTIME_ID_PRESERVED')
        for qid in row['candidateQuestionIds']:
            require(qid in byid and rmap[qid]['legacyId']==row['legacyAuditId'],'LEGACY_CROSSWALK_RESOLVES')
            if row['relationship']=='REUSED_WORDING_OPTIONS_REORDERED':
                require(byid[qid]['prompt']==old[row['legacyAuditId']]['wording'],'REUSED_PROMPT_EXACT')
                oldopts=json.loads(old[row['legacyAuditId']]['optionsJSON'])
                require(sorted(o['text'] for o in oldopts)==sorted(o['label'] for o in byid[qid]['options']),'REUSED_OPTION_LABELS_EXACT')
                correct=next(o['label'] for o in byid[qid]['options'] if o['optionId']==keymap[qid]['proposedCorrectOptionId'])
                require(correct==old[row['legacyAuditId']]['existingKeyText'],'REUSED_KEY_MEANING_EXACT')
            if row['relationship']=='REUSED_PROMPT':require(byid[qid]['prompt']==old[row['legacyAuditId']]['wording'],'REUSED_PRODUCTIVE_PROMPT_EXACT')
    compatibility=data['policies/metric-compatibility.json']
    require([x['metricId'] for x in compatibility['baseline']]==BASELINE,'ALL_15_BASELINE_IDS')
    require(compatibility['futureGated']==['M12','M13','M14','M15','M16','M17'],'SIX_FUTURE_GATES')
    catalog=data['public/bank-catalog.json']
    for entry,form in zip(catalog['forms'],forms):
        require(entry['publicPayloadDigest']==digest(canonical(form)),'PUBLIC_FORM_DIGEST')
        require(entry['formId']==form['formId'] and entry['questionSetVersion']==form['questionSetVersion'],'CATALOG_FORM_VERSION')
    require(catalog['bankDigest']==digest(canonical({k:catalog[k] for k in ['bankVersion','blueprintVersion','scoringPolicyVersion','forms']})),'BANK_DIGEST')
    require(catalog['currentlySelectableFormIds']==[],'NO_ELIGIBLE_APPROVED_FORM')
    for f in forms:
        text=canonical(f).decode()
        require(all('"'+key+'"' not in text for key in ['proposedCorrectOptionId','correctOptionId','answer','explanation','distractorRationales','verifiedStartMs','segments']),'NO_PUBLIC_KEY_OR_TRANSCRIPT')
    return {'objectiveItems':54,'productiveTasks':4,'uniqueOptionIds':216,'formKeyPositions':{f:{chr(65+n):c[n] for n in range(4)} for f,c in positions.items()},'contentReviewReadyObjective':44,'audioBlockedObjective':10,'approvedScoringEligible':0,'currentlySelectableForms':0,'authorshipCounts':dict(collections.Counter(x['authorship'] for x in review))}

def mutation_tests(data,schemas):
    tests=[]
    def trial(name,fn):
        altered=copy.deepcopy(data);fn(altered)
        try:validate(altered,schemas)
        except (AssertionError,KeyError,StopIteration) as e:tests.append({'test':name,'status':'PASS','actual':'REJECTED','reason':str(e)[:260]})
        else:raise AssertionError('NEGATIVE_TEST_NOT_REJECTED:'+name)
    trial('unknown_correct_option',lambda d:d['private/keys-and-explanations.json']['entries'][0].update(proposedCorrectOptionId='opt.'+'0'*20))
    trial('duplicate_question_identity',lambda d:d['public/form-a.json']['objectiveItems'][1].update(questionId=d['public/form-a.json']['objectiveItems'][0]['questionId']))
    trial('public_key_leak',lambda d:d['public/form-a.json']['objectiveItems'][0].update(answer='not allowed'))
    trial('listening_transcript_in_public',lambda d:d['public/form-a.json']['stimuli'][1].update(segments=['not allowed']))
    trial('missing_audio_marked_ready',lambda d:d['media/listening-asset-manifest.json']['assets'][0].update(assetState='READY'))
    trial('unreviewed_item_marked_eligible',lambda d:d['private/review-evidence.json']['entries'][0].update(scoringEligible=True))
    trial('wrong_skill_quota',lambda d:d['public/form-b.json']['objectiveItems'][0].update(skill='present_perfect'))
    trial('cross_form_reading_mix',lambda d:d['public/form-a.json']['objectiveItems'][12].update(stimulusId='stim.b.reading.r1'))
    trial('unsupported_evidence_quote',lambda d:d['private/keys-and-explanations.json']['entries'][12]['evidence'][0].update(quote='This phrase is not in the passage.'))
    trial('changed_form_without_new_digest',lambda d:d['public/form-b.json']['objectiveItems'][0].update(prompt='Changed text without a new version.'))
    trial('dropped_baseline_metric',lambda d:d['policies/metric-compatibility.json']['baseline'].pop())
    trial('productive_grade_added',lambda d:d['public/form-a.json']['productiveTasks'][0].update(score=7))
    trial('changed_script_without_new_digest',lambda d:d['private/listening-production-scripts.json']['scripts'][0]['segments'][0].update(text=d['private/listening-production-scripts.json']['scripts'][0]['segments'][0]['text']+' Additional unversioned sentence.'))
    trial('duplicate_option_label',lambda d:d['public/form-a.json']['objectiveItems'][0]['options'][1].update(label=d['public/form-a.json']['objectiveItems'][0]['options'][0]['label']))
    trial('changed_approved_metric_formula',lambda d:d['policies/metric-compatibility.json']['baseline'][4].update(exactAcceptedFormula='correct divided by54'))
    return tests

def verify_hashes(project_root=None):
    p=ROOT/'VALIDATION_AND_HASH_MANIFEST.json'
    m=json.loads(p.read_text(encoding='utf-8'))
    Draft202012Validator(json.loads((ROOT/'schemas/validation-manifest.schema.json').read_text(encoding='utf-8'))).validate(m)
    for x in m['outputFiles']:require(digest((ROOT/x['path']).read_bytes())==x['sha256'],'OUTPUT_HASH:'+x['path'])
    body={k:v for k,v in m.items() if k!='selfIntegrity'}
    require(digest(canonical(body))==m['selfIntegrity']['canonicalSha256'],'MANIFEST_CANONICAL_SELF_DIGEST')
    actual={x.relative_to(ROOT).as_posix() for x in ROOT.rglob('*') if x.is_file()}
    require(actual=={x['path'] for x in m['outputFiles']}|{p.name},'EXACT_OUTPUT_FILE_SET')
    if project_root:
        for x in m['preservedInputs']:
            require(digest((project_root/x['path']).read_bytes())==x['sha256'],'PRESERVED_INPUT_HASH:'+x['path'])
        require(not (project_root/'.git').exists(),'NO_GIT_INITIALIZATION')
        formulas=list(csv.DictReader((project_root/'docs/reviews/stage-1a/PERSONALIZED_DASHBOARD_METRIC_MATRIX.csv').open(encoding='utf-8-sig')))
        expected={x['metricId']:x['exactCalculation'] for x in formulas if x['gateGroup']=='BASELINE_PROPOSAL'}
        actual={x['metricId']:x['exactAcceptedFormula'] for x in load()['policies/metric-compatibility.json']['baseline']}
        require(actual==expected,'FORMULAS_UNCHANGED')
    return {'outputPayloadHashes':len(m['outputFiles']),'manifestCanonicalSelfDigest':'PASS','preservedInputHashes':len(m['preservedInputs']) if project_root else 'NOT_REQUESTED'}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--write-report',action='store_true');ap.add_argument('--verify-hashes',action='store_true');ap.add_argument('--project-root',type=Path);args=ap.parse_args()
    schemas={p.name.replace('.schema.json',''):json.loads(p.read_text(encoding='utf-8')) for p in (ROOT/'schemas').glob('*.schema.json')}
    for schema in schemas.values():Draft202012Validator.check_schema(schema)
    data=load();counts=validate(data,schemas);negative=mutation_tests(data,schemas)
    report={'executedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS_STRUCTURAL_NOT_CONTENT_APPROVAL','python':sys.version.split()[0],'jsonschema':importlib.metadata.version('jsonschema'),'schemasChecked':len(schemas),'jsonDocumentsValidated':len(data),'counts':counts,'negativeTests':negative,'negativeTestsRejected':len(negative),'selectionExecuted':False,'actualAttemptsCreated':0,'audioProductionOrHumanVerificationPerformed':False,'limitations':['Schema/reference checks cannot validate English assessment quality or rights.','LLM self-review is not independent human approval.','Assignment schema checked only; no eligible form or actual assignment exists.','No app tests/build rerun: application unchanged and this is content preparation only.']}
    if args.verify_hashes:report['integrity']=verify_hashes(args.project_root)
    Draft202012Validator(schemas['validation-report']).validate(report)
    if args.write_report:
        p=ROOT/'validation/latest-validation.json'
        if p.exists():raise SystemExit('Refusing to overwrite existing recorded validation report. Default stdout is read-only.')
        p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
