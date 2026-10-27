import { Link,useParams,useSearchParams } from 'react-router-dom';
import { AppShell } from '../../../components/AppShell';
import { Card,EmptyState,PageHeader } from '../../../components/UI';
import { LearningHub } from '../../Learning';
import { CatalogCard } from '../components/CatalogCard';
import { localCatalogSource } from '../services/catalog';
import { categoryHref,discoveryRoutes } from '../routes';
export function LearnCatalog(){
 const [params]=useSearchParams();
 if(params.get('search'))return <LearningHub/>;
 return <AppShell><PageHeader eyebrow="Learn" title="Build the language behind your IELTS goal." description="Choose a language area. Explore available samples or see what is being prepared."/><div className="discovery-grid">{localCatalogSource.learn().map(item=><CatalogCard key={item.id} item={item} href={categoryHref(item.id)}/>)}</div><div className="discovery-secondary"><Link to={discoveryRoutes.lessons}>Browse all sample lessons</Link></div></AppShell>;
}
export function LearnCategoryPage(){
 const {categoryId}=useParams();const item=localCatalogSource.learn().find(c=>c.id===categoryId);
 if(!item)return <AppShell><EmptyState title="Category not found" detail="Choose an area from Learn." action="Back to Learn" onAction={()=>{window.location.hash='/learn';}}/></AppShell>;
 const available=item.availability==='SAMPLE';
 return <AppShell><Link className="discovery-back" to="/learn">Back to Learn</Link><PageHeader eyebrow="Language learning" title={item.title} description={item.description}/><Card className="discovery-information"><span className="availability-label">{available?'Sample collection':'Coming soon'}</span><h2>{available?'Start with the available samples.':'This collection is not available yet.'}</h2><p>{available?'These are the existing small learning examples and saved-word tools. A complete resource bank has not been integrated.':'Verified learning content will be connected in a later content-engineering slice. No CSV, Excel or external content bank is loaded here.'}</p><div className="button-row">{item.actions.map(action=><Link className="btn btn-secondary" key={action.href} to={action.href}>{action.label}</Link>)}<Link className="btn btn-ghost" to="/learn">Explore another category</Link></div></Card></AppShell>;
}
