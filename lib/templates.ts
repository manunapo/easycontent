import { TemplateConfig } from '@/types';
import SideBySideTemplate from '@/templates/SideBySideTemplate';
import StackedTemplate from '@/templates/StackedTemplate';
import OverlappingDiagonalTemplate from '@/templates/OverlappingDiagonalTemplate';
import { TEMPLATE_INSTANCES } from '@/templates/implementation/TemplateImplementations';

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
  {
    id: 'side-by-side',
    name: 'Before/After - Side-by-Side',
    component: SideBySideTemplate,
    thumbnail: 'side-by-side',
    template: TEMPLATE_INSTANCES['side-by-side'],
  },
  {
    id: 'stacked',
    name: 'Before/After - Stacked',
    component: StackedTemplate,
    thumbnail: 'stacked',
    template: TEMPLATE_INSTANCES['stacked'],
  },
  {
    id: 'diagonal',
    name: 'Before/After - Diagonal Split',
    component: OverlappingDiagonalTemplate,
    thumbnail: 'diagonal',
    template: TEMPLATE_INSTANCES['diagonal'],
  },
];

export const getTemplateById = (id: string | null): TemplateConfig | null => {
    if (!id) return null;
    return AVAILABLE_TEMPLATES.find(t => t.id === id) || null;
}; 