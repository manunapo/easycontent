"use client";

import { useImageEditor } from "@/contexts/ImageEditorContext";
import TemplatePreview from "./template-preview";

export default function Preview() {
  const {
    selectedTemplate,
    selectedTemplateId,
    beforeImage,
    afterImage,
    activeOutputFormatId,
    activeOutputFormat,
    caption,
  } = useImageEditor();

  const beforeCropPixels =
    beforeImage.templateFormatCrops[selectedTemplateId || '']?.[activeOutputFormatId]?.croppedAreaPixels;
  const afterCropPixels =
    afterImage.templateFormatCrops[selectedTemplateId || '']?.[activeOutputFormatId]?.croppedAreaPixels;

  return (
    <TemplatePreview
      key={`${selectedTemplateId}-${activeOutputFormatId}`}
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
