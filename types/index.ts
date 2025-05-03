import { Area, Point } from "react-easy-crop";

export type OutputFormatId = "instagram" | "facebook" | "pinterest";

export const OUTPUT_FORMATS: Record<OutputFormatId, OutputFormat> = {
  instagram: {
    id: "instagram",
    name: "Instagram (4:5)",
    icon: "instagram",
    aspectRatio: 4 / 5,
    width: 1080,
    height: 1350,
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

export type TemplateId = "before-after" | "side-by-side" | "stacked" | "diagonal";

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
  // Store crop settings keyed by template ID and then by OutputFormatId
  templateFormatCrops: Partial<Record<string, Partial<Record<OutputFormatId, FormatCropSettings>>>>;
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

// Required input images for a template
export type TemplateRequiredInput = {
  id: string;
  label: string;
};

// Abstract Template class that all templates should extend
export abstract class Template {
  id: string;
  name: string;
  thumbnail: string;
  
  // Define the required inputs for this template
  abstract get requiredInputs(): TemplateRequiredInput[];
  
  // Get the crop aspect ratio for this template based on the output format
  abstract getCropAspectRatio(outputFormat: OutputFormat): number;
  
  // Draw this template on a canvas with the provided images
  abstract drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number,
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void>;
  
  constructor(id: string, name: string, thumbnail: string) {
    this.id = id;
    this.name = name;
    this.thumbnail = thumbnail;
  }
  
  // Validate that all required inputs have images
  validateInputs(images: Record<string, { url: string | null; cropArea: Area | null }>): boolean {
    return this.requiredInputs.every(input => 
      images[input.id]?.url && images[input.id]?.cropArea
    );
  }
}

// Base Template Configuration
export interface BaseTemplateProps {
  beforeImage: ImageState | null;
  afterImage: ImageState | null;
  outputFormat: OutputFormat;
}

// Template Configuration extended to work with our Template class
export interface TemplateConfig {
  id: string;
  name: string;
  thumbnail: string;
  template: Template; // Reference to the Template instance
}
