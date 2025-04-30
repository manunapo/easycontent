import { Area } from "react-easy-crop";
import { Template } from "@/types";

async function cropImage(imageUrl: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Failed to get canvas context"));
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      resolve(canvas.toDataURL("image/png")); // Resolve with data URL
    };
    image.onerror = reject;
    image.src = imageUrl;
  });
}

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
  // 1. Set font and measure text
  context.font = `${textSize}px Arial`; // Assuming Arial for now
  const textMetrics = context.measureText(text);
  const textWidth = textMetrics.width;
  // Estimate ascent/descent for more accurate height - this varies by font
  const actualHeight =
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
  const textHeight = actualHeight > 0 ? actualHeight : textSize; // Fallback to textSize

  // 2. Calculate pill dimensions
  const pillWidth = textWidth + padding * 2;
  const pillHeight = textHeight + padding * 2;
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

export const drawTemplateOnCanvas = async (
  ctx: CanvasRenderingContext2D,
  beforeImageUrl: string,
  afterImageUrl: string,
  beforeCropPixels: Area,
  afterCropPixels: Area,
  template: Template,
  canvasWidth: number,
  canvasHeight: number
) => {
  const beforeCroppedUrl = await cropImage(beforeImageUrl, beforeCropPixels);
  const afterCroppedUrl = await cropImage(afterImageUrl, afterCropPixels);

  const beforeImg = new Image();
  const afterImg = new Image();
  const loadPromises = [
    new Promise((res) => {
      beforeImg.onload = res;
      beforeImg.src = beforeCroppedUrl;
    }),
    new Promise((res) => {
      afterImg.onload = res;
      afterImg.src = afterCroppedUrl;
    }),
  ];
  await Promise.all(loadPromises);

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (template.id === "side-by-side") {
    ctx.drawImage(beforeImg, 0, 0, canvasWidth / 2, canvasHeight);
    ctx.drawImage(afterImg, canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
  } else if (template.id === "top-bottom") {
    ctx.drawImage(beforeImg, 0, 0, canvasWidth, canvasHeight / 2);
    ctx.drawImage(afterImg, 0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
  } else {
    ctx.drawImage(beforeImg, 0, 0, canvasWidth / 2, canvasHeight);
    ctx.drawImage(afterImg, canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
  }

  drawPill(
    ctx,
    50, // x position
    50, // y position
    20, // padding
    "Before", // text
    40, // text size
    "white", // text color
    "#FF7700", // background color
    1 // opacity
  );
  drawPill(
    ctx,
    canvasWidth - 250, // x position
    50, // y position
    20, // padding
    "After", // text
    40, // text size
    "white", // text color
    "#FF7700", // background color
    1 // opacity
  );
};
