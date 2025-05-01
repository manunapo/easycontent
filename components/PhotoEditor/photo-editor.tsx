"use client";
import Preview from "./preview";
import Controls from "../Controls/controls";
import ExportButton from "../Controls/export-button";
import { Label } from "@radix-ui/react-label";
import Icon from "../icon";
import { OUTPUT_FORMATS } from "@/types";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import { getTemplateById } from "@/lib/templates";

export default function PhotoEditor() {
  const { activeOutputFormatId, selectedTemplateId } = useImageEditor();
  const availableFormats = Object.values(OUTPUT_FORMATS);
  return (
    <div className="flex flex-col h-full w-full">
      <h1>Photo Editor</h1>
      <div className="flex md:flex-row flex-col w-full gap-4 justify-center items-center">
        <div className="flex flex-col md:h-[90vh] md:overflow-y-auto gap-4 justify-start p-4">
          <Controls />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center max-w-md">
          {(() => {
            const activeTemplate = getTemplateById(selectedTemplateId);
            const activeFormat = availableFormats.find(
              (format) => format.id === activeOutputFormatId
            );
            return (
              activeFormat && (
                <div className="flex flex-col w-full px-4 gap-1 items-end mb-2 font-semibold text-xs italic text-gray-600">
                  <Label className="flex items-center">
                    <span>{activeTemplate?.name}</span>
                  </Label>
                  <Label className="flex items-center gap-1 ">
                    <Icon icon={activeFormat.icon} />
                    <span>
                      {activeFormat.name} ({activeFormat.width}x
                      {activeFormat.height})
                    </span>
                  </Label>
                </div>
              )
            );
          })()}
          <Preview />
          <div className="w-full px-4">
            <ExportButton />
          </div>
        </div>
      </div>
    </div>
  );
}
