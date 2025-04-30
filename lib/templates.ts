import { TemplateConfig } from '@/types';
import SideBySideTemplate from '@/templates/SideBySideTemplate';
import StackedTemplate from '@/templates/StackedTemplate';
import OverlappingDiagonalTemplate from '@/templates/OverlappingDiagonalTemplate';

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
  {
    id: 'side-by-side',
    name: 'Before/After - Side-by-Side',
    component: SideBySideTemplate,
  },
  {
    id: 'stacked',
    name: 'Before/After - Stacked',
    component: StackedTemplate,
  },
  {
    id: 'diagonal',
    name: 'Before/After - Diagonal Split',
    component: OverlappingDiagonalTemplate,
  },
];

export const getTemplateById = (id: string | null): TemplateConfig | null => {
    if (!id) return null;
    return AVAILABLE_TEMPLATES.find(t => t.id === id) || null;
}; 