import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageState } from "@/types";
import { SwitchCamera, Upload } from "lucide-react";

interface ImageUploaderProps {
  id: "before" | "after";
  label: string;
  imageState: ImageState | null;
  onImageSelect: (id: "before" | "after", file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  label,
  imageState,
  onImageSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageSelect(id, event.target.files[0]);
      // Reset input value to allow re-selecting the same file
      event.target.value = "";
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        id={id}
        ref={inputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button variant="outline" onClick={handleButtonClick} className="w-full">
        {imageState?.file ? (
          <>
            <SwitchCamera className="w-4 h-4 mr-2" />
            Change {label} Image
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload {label} Image
          </>
        )}
      </Button>
    </div>
  );
};

export default ImageUploader;
