import SideBySideTemplate from "@/templates/SideBySideTemplate";
import { Area, Point } from "react-easy-crop";

export type OutputFormatId = "instagram" | "facebook" | "pinterest";

export const OUTPUT_FORMATS: Record<OutputFormatId, OutputFormat> = {
  instagram: {
    id: "instagram",
    name: "Instagram (9:16)",
    icon: "instagram",
    aspectRatio: 9 / 16,
    width: 1080,
    height: 1920,
  },
  facebook: {
    id: "facebook",
    name: "Facebook (1:1)",
    icon: "facebook",
    aspectRatio: 1,
    width: 1080,
    height: 1080,
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest (2:3)",
    icon: "pinterest",
    aspectRatio: 2 / 3,
    width: 1000,
    height: 1500,
  },
};

export type TemplateId = "before-after";

export interface TemplateFormat {
  id: TemplateId;
  name: string;
  aspectRatio: number; // width / height
  width: number; // Optional: Target export width
  height: number; // Optional: Target export height
  icon: string;
}

export interface OutputFormat {
  id: OutputFormatId;
  name: string;
  aspectRatio: number; // width / height
  width: number; // Optional: Target export width
  height: number; // Optional: Target export height
  icon: string;
}

export interface FormatCropSettings {
  crop: Point;
  zoom: number;
  croppedAreaPixels: Area | null;
}

export interface ImageState {
  id: "before" | "after";
  file: File | null;
  previewUrl: string | null;
  // Store crop settings keyed by OutputFormatId
  formatCrops: Partial<Record<OutputFormatId, FormatCropSettings>>;
}

export interface CropSettings {
  crop: Point;
  zoom: number;
}

// Caption State
export interface CaptionState {
  text: string;
  size: "small" | "medium" | "large";
  bgColor: string; // CSS color string (e.g., 'rgba(0,0,0,0.7)', '#FFFFFF')
  textColor: string; // CSS color string
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "middle-center"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

// Style State for "Before" / "After" Labels
export interface LabelStyleState {
  size: "small" | "medium" | "large";
  bgColor: string;
  textColor: string;
}

// Base Template Configuration
export interface BaseTemplateProps {
  beforeImage: ImageState | null;
  afterImage: ImageState | null;
  outputFormat: OutputFormat;
}

// Specific Template Configurations (Can be extended)
export interface TemplateConfig {
  id: string;
  name: string;
  component: React.FC<BaseTemplateProps>;
  thumbnail: string;
  // Add any other template-specific config here if needed
  // e.g., default label positions, required inputs beyond images
}

// Export TemplateConfig as Template for easier usage
export type Template = TemplateConfig;

export const TEMPLATES: Record<TemplateId, TemplateConfig> = {
  "before-after": {
    id: "before-after",
    name: "Before/After",
    thumbnail: "before-after",
    component: SideBySideTemplate,
  },
};