import { Link,useParams } from 'react-router-dom';
import { AppShell } from '../../../components/AppShell';
import { Card,EmptyState,PageHeader } from '../../../components/UI';
import type { Module } from '../../../domain';
import { readState,hasDiagnosticBaseline } from '../../../state';
import { CatalogCard } from '../components/CatalogCard';
import { localCatalogSource } from '../services/catalog';
import { skillActivityHref,skillLibraryHref } from '../routes';
export function SkillHub({module}:{module:Module}){
 const learner=readState();const hasBaseline=hasDiagnosticBaseline(learner);
 return <AppShell><PageHeader eyebrow="IELTS Skills" title={module} description={`Choose how to develop your ${module.toLowerCase()} skills. Available activities use the existing short samples.`}/><div className="discovery-grid">{localCatalogSource.skills(module).map(item=><CatalogCard key={item.id} item={item} href={skillActivityHref(module,item,learner.onboarding.ieltsType)} locked={!hasBaseline&&item.target.kind==='workspace'&&item.target.mode==='practice'}/>)}</div><div className="discovery-secondary"><Link to={skillLibraryHref(module)}>Browse {module.toLowerCase()} sample library</Link><Link to="/mock-tests">Explore short module tests</Link></div></AppShell>;
}
export function SkillInformation({module,criteria=false}:{module:Module;criteria?:boolean}){
 const {activityId}=useParams();const item=localCatalogSource.skills(module).find(a=>a.id===(criteria?'criteria':activityId));
 if(!item)return <AppShell><EmptyState title="Activity not found" detail="Choose an activity from this skill hub." action={`Back to ${module}`} onAction={()=>{window.location.hash=`/${module.toLowerCase()}`;}}/></AppShell>;
 return <AppShell><Link className="discovery-back" to={`/${module.toLowerCase()}`}>Back to {module}</Link><PageHeader eyebrow={criteria?'Scoring reference':'Activity collection'} title={item.title} description={item.description}/><Card className="discovery-information"><span className="availability-label">{criteria?'Reference pending':'Coming soon'}</span><h2>{criteria?'Verified scoring references are not available here yet.':'This activity collection is not available yet.'}</h2><p>{criteria?`This ${module.toLowerCase()} reference will use its own verified source material. Full descriptors and scoring rules have not been integrated. An educational reference does not mean this platform can assign a valid IELTS band.`:'The existing short sample activities remain available below. They are not a replacement for a complete verified test or the planned collection.'}</p><div className="button-row">{!criteria&&<Link className="btn btn-secondary" to={skillLibraryHref(module)}>Browse existing short samples</Link>}<Link className="btn btn-ghost" to={`/${module.toLowerCase()}`}>Back to {module}</Link></div></Card></AppShell>;
}
