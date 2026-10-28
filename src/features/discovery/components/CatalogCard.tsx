import { Link } from 'react-router-dom';
import { ArrowRight,BookOpen,Headphones,PenTool,Mic,Languages,Video,Layers,Link as LinkIcon,Globe,Clock3,ClipboardCheck,type LucideIcon } from 'lucide-react';
import { Card } from '../../../components/UI';
import type { CatalogEntry,CatalogIcon } from '../types';
const icons:Record<CatalogIcon,LucideIcon>={words:Languages,book:BookOpen,headphones:Headphones,writing:PenTool,speaking:Mic,grammar:Languages,video:Video,layers:Layers,link:LinkIcon,globe:Globe,clock:Clock3,criteria:ClipboardCheck};
export function CatalogCard({item,href,locked=false,statusLabel,actionLabel}:{item:CatalogEntry;href:string;locked?:boolean;statusLabel?:string;actionLabel?:string}) {
 const Icon=icons[item.icon];const pending=item.availability!=='SAMPLE';
 const status=statusLabel??(locked?'Assessment required':item.availability==='SAMPLE'?'Sample available':item.availability==='REFERENCE_PENDING'?'Reference pending':'Coming soon');
 const action=actionLabel??(locked?'View requirements':pending?'View availability':'Explore');
 return <Card className="discovery-card"><div className="discovery-card-top"><span className="discovery-icon"><Icon size={22} aria-hidden="true"/></span><span className="availability-label">{status}</span></div><h2>{item.title}</h2><p>{item.description}</p><Link className="discovery-action" to={href} aria-label={`${action}: ${item.title}`}>{action}<ArrowRight size={17} aria-hidden="true"/></Link></Card>;
}
