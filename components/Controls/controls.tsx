"use client";
import { useState } from "react";
import CollapsableContainer from "../collapsable-container";
import ImageSection from "../ImageCropper/image-section";
import FormatHandler from "../Controls/format-handler";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import { Label } from "@radix-ui/react-label";
import { OUTPUT_FORMATS } from "@/types";
import Icon from "../icons";
import LabelStyleControl from "./label-style-control";

export default function Controls() {
  const [imageSelectionIsOpen, setImageSelectionIsOpen] = useState(true);
  const [labelIsOpen, setLabelIsOpen] = useState(false);
  const [captionIsOpen, setCaptionIsOpen] = useState(false);
  const [formatsIsOpen, setFormatsIsOpen] = useState(false);
  const { activeOutputFormatId, afterImage, beforeImage } = useImageEditor();
  const availableFormats = Object.values(OUTPUT_FORMATS);

  const isEnabled = afterImage.file !== null && beforeImage.file !== null;
  return (
    <div className="flex flex-col">
      <CollapsableContainer
        title="Images"
        subtitle="Upload before and after images"
        isOpen={imageSelectionIsOpen}
        setIsOpen={setImageSelectionIsOpen}
      >
        <div className="flex flex-col gap-4 justify-evenly">
          <div className="flex md:flex-row flex-col gap-4 justify-evenly">
            <ImageSection id="before" label="Before" />
            <ImageSection id="after" label="After" />
          </div>
          {(() => {
            const activeFormat = availableFormats.find(
              (format) => format.id === activeOutputFormatId
            );
            return (
              activeFormat && (
                <Label className="flex items-center gap-1 text-xs font-light italic">
                  Cropping for:
                  <Icon icon={activeFormat.icon} />
                  <span className="font-bold">
                    {activeFormat.name} ({activeFormat.width}x
                    {activeFormat.height})
                  </span>
                </Label>
              )
            );
          })()}
        </div>
      </CollapsableContainer>
      <CollapsableContainer
        title="Formats"
        subtitle="To which platform will this image be used?"
        isOpen={formatsIsOpen}
        setIsOpen={setFormatsIsOpen}
        enabled={isEnabled}
      >
        <FormatHandler />
      </CollapsableContainer>
      <CollapsableContainer
        title="Labels"
        subtitle="Before and after labels"
        isOpen={labelIsOpen}
        setIsOpen={setLabelIsOpen}
        enabled={isEnabled}
      >
        <LabelStyleControl />
      </CollapsableContainer>
      <CollapsableContainer
        title="Caption"
        subtitle="Caption for the image or CTA"
        isOpen={captionIsOpen}
        setIsOpen={setCaptionIsOpen}
        enabled={isEnabled}
      >
        <div>Caption</div>
      </CollapsableContainer>
    </div>
  );
}
