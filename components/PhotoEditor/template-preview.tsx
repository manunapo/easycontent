"use client";

import React, { useState, useEffect, useRef } from "react";
import { Template, OutputFormat, CaptionState } from "@/types";
import { Area } from "react-easy-crop";
import { drawTemplateOnCanvas } from "@/lib/canvasUtils";
import { useImageEditor } from "@/contexts/ImageEditorContext";

export interface TemplatePreviewProps {
  selectedTemplate: { template: Template, id: string } | null;
  beforeImageUrl: string | null;
  afterImageUrl: string | null;
  beforeCropPixels: Area | null | undefined;
  afterCropPixels: Area | null | undefined;
  outputFormat: OutputFormat;
  caption: CaptionState;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  selectedTemplate,
  beforeImageUrl,
  afterImageUrl,
  beforeCropPixels,
  afterCropPixels,
  outputFormat,
  caption,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { labelStyle } = useImageEditor();

  useEffect(() => {
    const drawPreview = async () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas || !selectedTemplate) return;

      if (
        !beforeImageUrl ||
        !afterImageUrl ||
        !beforeCropPixels ||
        !afterCropPixels
      ) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e0e0e0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#666";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Upload & Crop Both Images",
          canvas.width / 2,
          canvas.height / 2
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#666";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Generating Preview...",
        canvas.width / 2,
        canvas.height / 2
      );

      try {
        await drawTemplateOnCanvas(
          ctx,
          beforeImageUrl,
          afterImageUrl,
          beforeCropPixels,
          afterCropPixels,
          selectedTemplate,
          canvas.width,
          canvas.height,
          caption,
          labelStyle
        );
      } catch (err) {
        console.error("Error drawing preview canvas:", err);
        setError("Failed to generate preview.");
        ctx.fillStyle = "red";
        ctx.fillText("Preview Error", canvas.width / 2, canvas.height / 2 + 20);
      } finally {
        setIsLoading(false);
      }
    };

    drawPreview();
  }, [
    selectedTemplate,
    beforeImageUrl,
    afterImageUrl,
    beforeCropPixels,
    afterCropPixels,
    outputFormat,
    caption,
    labelStyle,
  ]);

  return (
    <div className="relative w-full flex items-center justify-center p-4">
      {/* Add aspect ratio directly to canvas container */}
      <div
        style={{
          aspectRatio: `${outputFormat.width} / ${outputFormat.height}`,
          maxWidth: "100%",
          maxHeight: "100%",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          width={outputFormat.width}
          height={outputFormat.height}
          className="block max-w-full max-h-full"
        />
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
          Loading Preview...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 bg-red-100/50 flex items-center justify-center text-red-700">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;
