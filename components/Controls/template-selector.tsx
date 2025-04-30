"use client";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import { AVAILABLE_TEMPLATES } from "@/lib/templates";
import { Label } from "@radix-ui/react-label";
import { Check } from "lucide-react";

export default function TemplateSelector() {
  const {
    selectedTemplateIds,
    handleTemplateToggle,
    setSelectedTemplateId,
    selectedTemplateId,
  } = useImageEditor();

  const handleTemplateClick = (templateId: string) => {
    handleTemplateToggle(templateId);
    setSelectedTemplateId(templateId);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {AVAILABLE_TEMPLATES.map((template) => (
          <div key={template.id} className="flex items-center space-x-2">
            {selectedTemplateIds.includes(template.id) ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Check className="w-4 h-4 text-gray-500" />
            )}
            <Label
              htmlFor={`template-${template.id}`}
              onClick={() => handleTemplateClick(template.id)}
              className={`cursor-pointer ${
                selectedTemplateId === template.id
                  ? "font-bold text-primary"
                  : ""
              }`}
              title="Click to set as active template for preview/cropping"
            >
              <div className="flex items-center gap-1">
                {template.name}
              </div>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
