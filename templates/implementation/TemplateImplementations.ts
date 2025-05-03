import { Area } from "react-easy-crop";
import { Template, TemplateRequiredInput, OutputFormat, CaptionState, LabelStyleState } from "@/types";
import { drawCaptionPill, drawPositionedLabel, drawLine } from "@/lib/canvasUtils";

// Base class for templates that require both before and after images
abstract class BeforeAfterTemplate extends Template {
  get requiredInputs(): TemplateRequiredInput[] {
    return [
      { id: "before", label: "Before" },
      { id: "after", label: "After" },
    ];
  }

  // All templates will need to implement this
  abstract getCropAspectRatio(outputFormat: OutputFormat): number;
  abstract drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number,
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void>;
}

export class SideBySideTemplate extends BeforeAfterTemplate {
  constructor() {
    super("side-by-side", "Before/After - Side-by-Side", "side-by-side");
  }

  getCropAspectRatio(outputFormat: OutputFormat): number {
    // Each image takes half the width, full height
    // Aspect = (Width/2) / Height = (Width/Height) / 2 = finalAspect / 2
    return outputFormat.aspectRatio / 2;
  }

  async drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number,
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void> {
    if (!this.validateInputs(images)) {
      throw new Error("Missing required images for Side-by-Side template");
    }

    const beforeImage = await loadImage(images.before.url);
    const afterImage = await loadImage(images.after.url);

    // Draw the before image on the left half
    drawCroppedImage(
      ctx,
      beforeImage,
      images.before.cropArea,
      0,
      0,
      width / 2,
      height
    );

    // Draw the after image on the right half
    drawCroppedImage(
      ctx,
      afterImage,
      images.after.cropArea,
      width / 2,
      0,
      width / 2,
      height
    );

    // Draw a vertical line
    drawLine(ctx, width / 2, 0, width / 2, height, "white", 10);

    // Draw labels if provided
    if (labelStyle) {
      drawPositionedLabel(
        ctx, 
        "BEFORE", 
        "top-left", 
        width, 
        height, 
        labelStyle.size === "small" ? 16 : labelStyle.size === "medium" ? 20 : 28,
        labelStyle.textColor,
        labelStyle.bgColor
      );
      
      drawPositionedLabel(
        ctx, 
        "AFTER", 
        "top-right", 
        width, 
        height, 
        labelStyle.size === "small" ? 16 : labelStyle.size === "medium" ? 20 : 28,
        labelStyle.textColor,
        labelStyle.bgColor
      );
    }

    // Draw caption if provided
    if (caption && caption.text) {
      drawCaption(ctx, caption, width, height);
    }
  }
}

export class StackedTemplate extends BeforeAfterTemplate {
  constructor() {
    super("stacked", "Before/After - Stacked", "stacked");
  }

  getCropAspectRatio(outputFormat: OutputFormat): number {
    // Each image takes full width, half the height
    // Aspect = Width / (Height/2) = (Width/Height) * 2 = finalAspect * 2
    return outputFormat.aspectRatio * 2;
  }

  async drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number,
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void> {
    if (!this.validateInputs(images)) {
      throw new Error("Missing required images for Stacked template");
    }

    const beforeImage = await loadImage(images.before.url);
    const afterImage = await loadImage(images.after.url);

    // Draw the before image on the top half
    drawCroppedImage(
      ctx,
      beforeImage,
      images.before.cropArea,
      0,
      0,
      width,
      height / 2
    );

    // Draw the after image on the bottom half
    drawCroppedImage(
      ctx,
      afterImage,
      images.after.cropArea,
      0,
      height / 2,
      width,
      height / 2
    );

    // Draw a horizontal line
    drawLine(ctx, 0, height / 2, width, height / 2, "white", 10);

    // Draw labels if provided
    if (labelStyle) {
      drawPositionedLabel(
        ctx, 
        "BEFORE", 
        "top-left", 
        width, 
        height, 
        labelStyle.size === "small" ? 16 : labelStyle.size === "medium" ? 20 : 28,
        labelStyle.textColor,
        labelStyle.bgColor
      );
      
      drawPositionedLabel(
        ctx, 
        "AFTER", 
        "bottom-left", 
        width, 
        height, 
        labelStyle.size === "small" ? 16 : labelStyle.size === "medium" ? 20 : 28,
        labelStyle.textColor,
        labelStyle.bgColor
      );
    }

    // Draw caption if provided
    if (caption && caption.text) {
      drawCaption(ctx, caption, width, height);
    }
  }
}

export class DiagonalTemplate extends BeforeAfterTemplate {
  constructor() {
    super("diagonal", "Before/After - Diagonal Split", "diagonal");
  }

  getCropAspectRatio(outputFormat: OutputFormat): number {
    // For diagonal template, we use the final aspect ratio as is
    // since both images cover the full area
    return outputFormat.aspectRatio;
  }

  async drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number,
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void> {
    if (!this.validateInputs(images)) {
      throw new Error("Missing required images for Diagonal template");
    }

    const beforeImage = await loadImage(images.before.url);
    const afterImage = await loadImage(images.after.url);

    // Save the context state
    ctx.save();

    // Draw the after image as the background (full canvas)
    drawCroppedImage(
      ctx,
      afterImage,
      images.after.cropArea,
      0,
      0,
      width,
      height
    );

    // Create a clip path for the before image (top-left triangle)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.clip();

    // Draw the before image
    drawCroppedImage(
      ctx,
      beforeImage,
      images.before.cropArea,
      0,
      0,
      width,
      height
    );

    // Restore context for further drawing
    ctx.restore();

    // Draw a diagonal line
    drawLine(ctx, 0, height, width, 0, "white", 10);

    // Draw labels if provided
    if (labelStyle) {
      drawPositionedLabel(
        ctx, 
        "BEFORE", 
        "top-left", 
        width, 
        height, 
        labelStyle.size === "small" ? 16 : labelStyle.size === "medium" ? 20 : 28,
        labelStyle.textColor,
        labelStyle.bgColor,
        1.0
      );
      
      drawPositionedLabel(
        ctx, 
        "AFTER", 
        "bottom-right", 
        width, 
        height, 
        labelStyle.size === "small" ? 16 : labelStyle.size === "medium" ? 20 : 28,
        labelStyle.textColor,
        labelStyle.bgColor,
        1.0
      );
    }

    // Draw caption if provided
    if (caption && caption.text) {
      drawCaption(ctx, caption, width, height);
    }
  }
}

// Helper functions for drawing on canvas
async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawCroppedImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cropArea: Area,
  targetX: number,
  targetY: number,
  targetWidth: number,
  targetHeight: number
) {
  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    targetX,
    targetY,
    targetWidth,
    targetHeight
  );
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  caption: CaptionState,
  canvasWidth: number,
  canvasHeight: number
) {
  // Use the shared drawCaptionPill function
  drawCaptionPill(ctx, caption, canvasWidth, canvasHeight);
}