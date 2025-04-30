import { Area } from "react-easy-crop";
import { Template, CaptionState, LabelStyleState } from "@/types";

export const drawPill = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  padding: number,
  text: string,
  textSize: number,
  textColor: string,
  bgColor: string,
  opacity: number
) => {
  // Double the text size for better visibility
  const scaledTextSize = textSize * 2;
  
  // 1. Set font and measure text
  context.font = `${scaledTextSize}px Arial`; // Assuming Arial for now
  const textMetrics = context.measureText(text);
  const textWidth = textMetrics.width;
  // Estimate ascent/descent for more accurate height - this varies by font
  const actualHeight =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  const textHeight = actualHeight > 0 ? actualHeight : scaledTextSize; // Fallback to scaledTextSize

  // 2. Calculate pill dimensions - double the padding too
  const scaledPadding = padding * 2;
  const pillWidth = textWidth + scaledPadding * 2;
  const pillHeight = textHeight + scaledPadding * 2;
  const borderRadius = pillHeight / 2;

  // Check if borderRadius is valid
  if (borderRadius <= 0) {
    console.error(
      "Cannot draw pill: invalid dimensions result in zero or negative radius."
    );
    return;
  }

  // 3. Draw the pill background
  context.save(); // Save current context state
  context.globalAlpha = opacity;
  context.fillStyle = bgColor;
  context.beginPath();
  // Ensure radius isn't larger than half the width, which prevents distortions
  const safeRadius = Math.min(borderRadius, pillWidth / 2);
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + pillWidth - safeRadius, y);
  context.arcTo(x + pillWidth, y, x + pillWidth, y + safeRadius, safeRadius);
  context.lineTo(x + pillWidth, y + pillHeight - safeRadius);
  context.arcTo(
    x + pillWidth,
    y + pillHeight,
    x + pillWidth - safeRadius,
    y + pillHeight,
    safeRadius
  );
  context.lineTo(x + safeRadius, y + pillHeight);
  context.arcTo(x, y + pillHeight, x, y + pillHeight - safeRadius, safeRadius);
  context.lineTo(x, y + safeRadius);
  context.arcTo(x, y, x + safeRadius, y, safeRadius);
  context.closePath();
  context.fill();
  context.restore(); // Restore context state (clears globalAlpha)

  // 4. Draw the text
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  // Adjust text position to be centered within the pill
  context.fillText(text, x + pillWidth / 2, y + pillHeight / 2);
};

// Similar to drawPill but specifically for captions with positioning
export const drawCaptionPill = (
  context: CanvasRenderingContext2D,
  caption: CaptionState,
  canvasWidth: number,
  canvasHeight: number
) => {
  if (!caption.text) return;
  
  // Set font size based on caption size (doubled for better visibility)
  let textSize = 32; // Default doubled from 16
  switch (caption.size) {
    case "small":
      textSize = 28; // Doubled from 14
      break;
    case "medium":
      textSize = 36; // Doubled from 18
      break;
    case "large":
      textSize = 48; // Doubled from 24
      break;
  }

  context.font = `${textSize}px Arial`;
  const textMetrics = context.measureText(caption.text);
  const textWidth = textMetrics.width;
  const padding = 20; // Doubled from 10
  const pillWidth = textWidth + padding * 2;
  const pillHeight = textSize + padding * 2;

  // Calculate position based on caption.position
  let x = 0;
  let y = 0;

  if (caption.position.includes("top")) {
    y = padding;
  } else if (caption.position.includes("middle")) {
    y = canvasHeight / 2 - pillHeight / 2;
  } else if (caption.position.includes("bottom")) {
    y = canvasHeight - pillHeight - padding;
  }

  if (caption.position.includes("left")) {
    x = padding;
  } else if (caption.position.includes("center")) {
    x = canvasWidth / 2 - pillWidth / 2;
  } else if (caption.position.includes("right")) {
    x = canvasWidth - pillWidth - padding;
  }

  // Draw the pill
  drawPill(
    context,
    x,
    y,
    padding,
    caption.text,
    textSize/2, // We divide by 2 because drawPill will multiply by 2
    caption.textColor,
    caption.bgColor,
    0.9 // slightly transparent by default
  );
};

export const drawTemplateOnCanvas = async (
  ctx: CanvasRenderingContext2D,
  beforeImageUrl: string,
  afterImageUrl: string,
  beforeCropPixels: Area,
  afterCropPixels: Area,
  templateConfig: { template: Template, id: string },
  canvasWidth: number,
  canvasHeight: number,
  caption?: CaptionState,
  labelStyle?: LabelStyleState
) => {
  // Create a map of images for the template
  const images: Record<string, { url: string; cropArea: Area }> = {
    before: { url: beforeImageUrl, cropArea: beforeCropPixels },
    after: { url: afterImageUrl, cropArea: afterCropPixels },
  };

  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Use the template's drawOnCanvas method
  await templateConfig.template.drawOnCanvas(
    ctx,
    images,
    canvasWidth,
    canvasHeight,
    caption,
    labelStyle
  );
};
