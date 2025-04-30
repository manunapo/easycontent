"use client";

import { useImageEditor } from "@/contexts/ImageEditorContext";
import TemplatePreview from "./template-preview";

export default function Preview() {
  const {
    selectedTemplate,
    beforeImage,
    afterImage,
    activeOutputFormatId,
    activeOutputFormat,
    caption,
  } = useImageEditor();

  const beforeCropPixels =
    beforeImage.formatCrops[activeOutputFormatId]?.croppedAreaPixels;
  const afterCropPixels =
    afterImage.formatCrops[activeOutputFormatId]?.croppedAreaPixels;

  return (
    <TemplatePreview
      key={activeOutputFormatId}
      selectedTemplate={selectedTemplate}
      beforeImageUrl={beforeImage.previewUrl}
      afterImageUrl={afterImage.previewUrl}
      beforeCropPixels={beforeCropPixels}
      afterCropPixels={afterCropPixels}
      outputFormat={activeOutputFormat}
      caption={caption}
    />
  );
}
