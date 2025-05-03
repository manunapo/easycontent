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

export const drawLabel = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  textSize: number,
  textColor: string,
  bgColor: string,
  opacity: number = 1.0,
  padding: number = 15,
  fontWeight: string = "bold"
) => {
  // Scale the text size for better visibility
  const scaledTextSize = textSize * 2;
  
  // 1. Set font and measure text
  context.font = `${fontWeight} ${scaledTextSize}px Arial`;
  const textMetrics = context.measureText(text);
  const textWidth = textMetrics.width;
  // Estimate text height
  const actualHeight =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  const textHeight = actualHeight > 0 ? actualHeight : scaledTextSize;

  // 2. Calculate label dimensions
  const scaledPadding = padding * 2;
  const labelWidth = textWidth + scaledPadding * 2;
  const labelHeight = textHeight + scaledPadding * 2;

  // 3. Draw the square/rectangle background
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = bgColor;
  context.beginPath();
  context.rect(x, y, labelWidth, labelHeight);
  context.fill();
  context.restore();

  // 4. Draw the text
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x + labelWidth / 2, y + labelHeight / 2);
};

export const drawPositionedLabel = (
  context: CanvasRenderingContext2D,
  text: string,
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  canvasWidth: number,
  canvasHeight: number,
  textSize: number = 18,
  textColor: string = '#FFFFFF',
  bgColor: string = '#000000',
  opacity: number = 1.0,
  padding: number = 15
) => {
  // Set font and measure text to calculate label dimensions
  const scaledTextSize = textSize * 2;
  context.font = `bold ${scaledTextSize}px Arial`;
  const textMetrics = context.measureText(text);
  const textWidth = textMetrics.width;
  const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  const textHeight = actualHeight > 0 ? actualHeight : scaledTextSize;
  
  const scaledPadding = padding * 2;
  const labelWidth = textWidth + scaledPadding * 2;
  const labelHeight = textHeight + scaledPadding * 2;
  
  // Determine x and y based on position
  let x = 0;
  let y = 0;
  const margin = 20; // Margin from edge of canvas
  
  switch (position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = canvasWidth - labelWidth - margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = canvasHeight - labelHeight - margin;
      break;
    case 'bottom-right':
      x = canvasWidth - labelWidth - margin;
      y = canvasHeight - labelHeight - margin;
      break;
  }
  
  // Draw the label
  drawLabel(context, x, y, text, textSize, textColor, bgColor, opacity, padding);
};

export const drawLine = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = '#FFFFFF',
  width: number = 3,
  opacity: number = 1.0,
  dashPattern: number[] = []
) => {
  context.save();
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.globalAlpha = opacity;
  context.strokeStyle = color;
  context.lineWidth = width;
  
  // Apply dash pattern if provided
  if (dashPattern.length > 0) {
    context.setLineDash(dashPattern);
  }
  
  context.stroke();
  context.restore();
};

export const drawArrow = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = '#FFFFFF',
  width: number = 3,
  arrowSize: number = 10,
  opacity: number = 1.0
) => {
  // Draw the main line
  drawLine(context, x1, y1, x2, y2, color, width, opacity);
  
  // Calculate the angle of the line
  const angle = Math.atan2(y2 - y1, x2 - x1);
  
  // Save context state
  context.save();
  context.globalAlpha = opacity;
  context.fillStyle = color;
  
  // Draw the arrowhead
  context.beginPath();
  context.translate(x2, y2);
  context.rotate(angle);
  context.moveTo(0, 0);
  context.lineTo(-arrowSize, -arrowSize / 2);
  context.lineTo(-arrowSize, arrowSize / 2);
  context.closePath();
  context.fill();
  
  // Restore context state
  context.restore();
};

export const drawHighlight = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number = radiusX,
  color: string = 'rgba(255, 255, 0, 0.3)',
  strokeColor: string = 'rgba(255, 255, 0, 0.7)',
  strokeWidth: number = 2,
  rotation: number = 0
) => {
  // Save the current context state
  context.save();
  
  // Move to center and rotate if needed
  context.translate(centerX, centerY);
  context.rotate(rotation);
  
  // Draw the highlight ellipse
  context.beginPath();
  context.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
  
  // Fill with the highlight color
  context.fillStyle = color;
  context.fill();
  
  // Stroke the outline if stroke width > 0
  if (strokeWidth > 0) {
    context.strokeStyle = strokeColor;
    context.lineWidth = strokeWidth;
    context.stroke();
  }
  
  // Restore the context state
  context.restore();
};

export const drawGradientOverlay = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  startColor: string,
  endColor: string,
  direction: 'horizontal' | 'vertical' | 'diagonal' = 'horizontal',
  opacity: number = 1.0
) => {
  context.save();
  context.globalAlpha = opacity;
  
  // Create gradient based on direction
  let gradient;
  if (direction === 'horizontal') {
    gradient = context.createLinearGradient(x, y, x + width, y);
  } else if (direction === 'vertical') {
    gradient = context.createLinearGradient(x, y, x, y + height);
  } else { // diagonal
    gradient = context.createLinearGradient(x, y, x + width, y + height);
  }
  
  // Set gradient colors
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  
  // Fill with gradient
  context.fillStyle = gradient;
  context.fillRect(x, y, width, height);
  
  context.restore();
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
