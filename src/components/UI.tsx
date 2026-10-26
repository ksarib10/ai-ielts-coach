import React from "react";
import {Check, LoaderCircle, AlertCircle, Sparkles, ArrowRight} from "lucide-react";
export const Button=({children,kind="primary",onClick,disabled,type="button",className=""}:{children:React.ReactNode;kind?:"primary"|"secondary"|"ai"|"ghost"|"danger";onClick?:()=>void;disabled?:boolean;type?:"button"|"submit";className?:string})=><button type={type} disabled={disabled} onClick={onClick} className={`btn btn-${kind} ${className}`}>{children}</button>;
export const Badge=({children,tone="blue"}:{children:React.ReactNode;tone?:"blue"|"ai"|"green"|"amber"|"gray"})=><span className={`badge badge-${tone}`}>{children}</span>;
export const Card=({children,className=""}:{children:React.ReactNode;className?:string})=><section className={`card ${className}`}>{children}</section>;
export const ProgressBar=({value,height=7,label,valueText}:{value:number;height?:number;label?:string;valueText?:string})=>{
  const normalized=Math.max(0,Math.min(100,value));
  return <div className="progress-line" style={{height}} {...(label?{role:'progressbar','aria-label':label,'aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':Math.round(normalized),'aria-valuetext':valueText}: {'aria-hidden':true})}><span style={{width:`${normalized}%`}}/></div>;
};
export const EmptyState=({title,detail,onAction,action="Explore"}:{title:string;detail:string;onAction?:()=>void;action?:string})=><Card className="empty-state"><div className="empty-icon"><Sparkles size={20}/></div><h3>{title}</h3><p>{detail}</p>{onAction&&<Button onClick={onAction}>{action}<ArrowRight size={15}/></Button>}</Card>;
export const LoadingState=({label="Loading your workspace..."})=><Card className="center-state"><LoaderCircle className="spin" size={24}/><span>{label}</span></Card>;
export const ErrorState=({detail="Something went wrong in this prototype state."})=><Card className="center-state error-state"><AlertCircle size={22}/><div><strong>Unable to load this view</strong><p>{detail}</p></div></Card>;
export const SuccessMark=({label}:{label:string})=><div className="success-line"><Check size={15}/><span>{label}</span></div>;
export const PageHeader=({eyebrow,title,description,actions}:{eyebrow:string;title:string;description?:string;actions?:React.ReactNode})=><div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{actions}</div>;
