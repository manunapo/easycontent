"use client";

import React from "react";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import ImageUploader from "./image-uploader";
import CropTool from "./crop-tool";
import { ImageUp } from "lucide-react";
interface ImageSectionProps {
  id: "before" | "after";
  label: string;
}

const ImageSection: React.FC<ImageSectionProps> = ({ id, label }) => {
  const {
    beforeImage,
    afterImage,
    activeOutputFormatId,
    currentBeforeCrop,
    currentAfterCrop,
    cropAspect,
    handleImageSelect,
    handleCropChange,
    handleCropComplete,
  } = useImageEditor();

  const imageState = id === "before" ? beforeImage : afterImage;
  const currentCropSettings =
    id === "before" ? currentBeforeCrop : currentAfterCrop;

  const crop = currentCropSettings?.crop ?? { x: 0, y: 0 };
  const zoom = currentCropSettings?.zoom ?? 1;

  return (
    <div className="space-y-4">
      <ImageUploader
        id={id}
        label={label}
        imageState={imageState}
        onImageSelect={handleImageSelect}
      />

      {imageState.previewUrl && typeof cropAspect === "number" && (
        <CropTool
          key={`${id}-crop-${activeOutputFormatId}-${imageState.previewUrl}`}
          imageId={imageState.id}
          previewUrl={imageState.previewUrl}
          crop={crop}
          zoom={zoom}
          cropAspect={cropAspect}
          onCropChange={(settings) => handleCropChange(id, settings)}
          onCropComplete={(pixels) => handleCropComplete(id, pixels)}
        />
      )}

      {!imageState.previewUrl && (
        <div className="flex items-center justify-center rounded-md bg-muted p-4 border border-dashed border-gray-300">
          <ImageUp className="w-10 h-10" />
        </div>
      )}
    </div>
  );
};

export default ImageSection;
