import type { Module } from '../../domain';
import type { SkillActivity } from './types';
export const discoveryRoutes = { learn:'/learn', category:'/learn/category/:categoryId', vocabularyHub:'/learn/vocabulary', vocabularyExplorer:'/learn/vocabulary/all', vocabularyCategoryExplorer:'/learn/category/vocabulary/all', lessons:'/learn/lessons', about:'/ielts-about', aboutTopic:'/ielts-about/:topicId', readiness:'/progress/readiness' } as const;
export const categoryHref = (id:string) => `/learn/category/${encodeURIComponent(id)}`;
export const aboutHref = (id:string) => `/ielts-about/${encodeURIComponent(id)}`;
export const skillLibraryHref = (module:Module) => `/${module.toLowerCase()}/library`;
export function skillActivityHref(module:Module, item:SkillActivity, track:string) {
  const root=`/${module.toLowerCase()}`;
  switch(item.target.kind) {
    case 'workspace': return `${root}/${item.target.mode}/${item.target.resourceId}`;
    case 'task-one': return `/writing/learn/${track==='General Training'?'writing-letter':'writing-1'}`;
    case 'lessons': return `/learn/lessons?category=${encodeURIComponent(item.target.category)}`;
    case 'criteria': return `${root}/scoring-criteria`;
    case 'planned': return `${root}/activities/${item.id}`;
  }
}
