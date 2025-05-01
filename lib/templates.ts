import { TemplateConfig } from "@/types";
import {
  DiagonalTemplate,
  SideBySideTemplate,
  StackedTemplate,
} from "@/templates/implementation/TemplateImplementations";

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
  {
    id: "side-by-side",
    name: "Before/After - Side-by-Side",
    thumbnail: "side-by-side",
    template: new SideBySideTemplate(),
  },
  {
    id: "stacked",
    name: "Before/After - Stacked",
    thumbnail: "stacked",
    template: new StackedTemplate(),
  },
  {
    id: "diagonal",
    name: "Before/After - Diagonal Split",
    thumbnail: "diagonal",
    template: new DiagonalTemplate(),
  },
];

export const getTemplateById = (id: string | null): TemplateConfig | null => {
  if (!id) return null;
  return AVAILABLE_TEMPLATES.find((t) => t.id === id) || null;
};
