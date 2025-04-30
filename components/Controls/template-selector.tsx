"use client";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import { OUTPUT_FORMATS, OutputFormatId } from "@/types";
import { Label } from "@radix-ui/react-label";
import { Check } from "lucide-react";
import Icon from "../icons";

export default function FormatHandler() {
  const {
    selectedOutputFormatIds,
    handleOutputFormatToggle,
    setActiveOutputFormatId,
    activeOutputFormatId,
  } = useImageEditor();

  const availableFormats = Object.values(OUTPUT_FORMATS);

  const handleCheckedChange = (formatId: OutputFormatId) => {
    handleOutputFormatToggle(formatId);
    setActiveOutputFormatId(formatId);
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {availableFormats.map((format) => (
          <div key={format.id} className="flex items-center space-x-2">
            {selectedOutputFormatIds.includes(format.id) ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Check className="w-4 h-4 text-gray-500" />
            )}
            <Label
              htmlFor={`format-${format.id}`}
              onClick={() => handleCheckedChange(format.id)}
              className={`cursor-pointer ${
                activeOutputFormatId === format.id
                  ? "font-bold text-primary"
                  : ""
              }`}
              title="Click to set as active format for preview/cropping"
            >
              <div className="flex items-center gap-1">
                <Icon icon={format.icon} />
                {format.name} ({format.width}x{format.height})
              </div>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
