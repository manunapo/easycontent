import React from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CropSettings } from "@/types";

interface CropToolProps {
  imageId: "before" | "after";
  previewUrl: string | null;
  crop: Point;
  zoom: number;
  cropAspect: number;
  onCropComplete: (croppedAreaPixels: Area) => void;
  onCropChange: (settings: CropSettings) => void;
}

const CropTool: React.FC<CropToolProps> = ({
  imageId,
  previewUrl,
  crop,
  zoom,
  cropAspect,
  onCropComplete,
  onCropChange,
}) => {
  if (!previewUrl) {
    return (
      <div className="text-center text-muted-foreground">
        Upload an image to crop.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-white border rounded-md">
      <div className="relative h-64 w-full bg-muted rounded-md overflow-hidden">
        <Cropper
          image={previewUrl}
          crop={crop}
          zoom={zoom}
          aspect={cropAspect}
          onCropChange={(newCrop) => onCropChange({ crop: newCrop, zoom })}
          onZoomChange={(newZoom) => onCropChange({ crop, zoom: newZoom })}
          onCropComplete={(_, croppedAreaPixels) => {
            onCropComplete(croppedAreaPixels);
          }}
        />
      </div>
      <div className="flex gap-2">
        <Label htmlFor={`zoom-${imageId}`}>Zoom</Label>
        <Slider
          id={`zoom-${imageId}`}
          min={1}
          max={3}
          step={0.05}
          value={[zoom]}
          onValueChange={(value) => onCropChange({ crop, zoom: value[0] })}
        />
      </div>
      {/* Optional: Add reset button */}
      {/* <Button variant="outline" size="sm" onClick={handleReset}>Reset Crop</Button> */}
    </div>
  );
};

export default CropTool;
