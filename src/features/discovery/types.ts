import type { Module } from '../../domain';
export type CatalogAvailability = 'SAMPLE' | 'PLANNED' | 'REFERENCE_PENDING';
export type CatalogIcon = 'words' | 'book' | 'headphones' | 'writing' | 'speaking' | 'grammar' | 'video' | 'layers' | 'link' | 'globe' | 'clock' | 'criteria';
export interface CatalogEntry { id: string; title: string; description: string; icon: CatalogIcon; availability: CatalogAvailability }
export interface CatalogAction { label: string; href: string }
export interface LearnCategory extends CatalogEntry { actions: readonly CatalogAction[] }
export type SkillTarget = { kind:'workspace'; resourceId:string; mode:'learn'|'practice'|'test' } | { kind:'task-one' } | { kind:'lessons'; category:string } | { kind:'criteria' } | { kind:'planned' };
export interface SkillActivity extends CatalogEntry { target: SkillTarget }
// UI catalog boundary only. Future content adapters must define their own approved record contracts.
export interface CatalogSource { learn(): readonly LearnCategory[]; skills(module:Module): readonly SkillActivity[]; about(): readonly CatalogEntry[] }
