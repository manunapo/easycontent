"use client";
import { useState } from "react";
import CollapsableContainer from "../collapsable-container";
import ImageSection from "../ImageCropper/image-section";
import FormatHandler from "../Controls/format-handler";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import LabelStyleControl from "./label-style-control";
import TemplateSelector from "./template-selector";

export default function Controls() {
  const [templatesIsOpen, setTemplatesIsOpen] = useState(true);
  const [imageSelectionIsOpen, setImageSelectionIsOpen] = useState(true);
  const [labelIsOpen, setLabelIsOpen] = useState(false);
  const [captionIsOpen, setCaptionIsOpen] = useState(false);
  const [formatsIsOpen, setFormatsIsOpen] = useState(false);
  const { afterImage, beforeImage } = useImageEditor();

  const isEnabled = afterImage.file !== null && beforeImage.file !== null;
  return (
    <div className="flex flex-col gap-2">
      <CollapsableContainer
        title="Templates"
        subtitle="Choose the template style(s) for your image"
        isOpen={templatesIsOpen}
        setIsOpen={setTemplatesIsOpen}
        isCollapsable={false}
      >
        <TemplateSelector />
      </CollapsableContainer>

      <CollapsableContainer
        title="Images"
        subtitle="Upload before and after images"
        isOpen={imageSelectionIsOpen}
        setIsOpen={setImageSelectionIsOpen}
        isCollapsable={false}
      >
        <div className="flex flex-col gap-4 justify-evenly">
          <div className="flex md:flex-row flex-col gap-4 justify-evenly">
            <ImageSection id="before" label="Before" />
            <ImageSection id="after" label="After" />
          </div>
        </div>
      </CollapsableContainer>
      <CollapsableContainer
        title="Formats"
        subtitle="In which platform will this image be used?"
        isOpen={formatsIsOpen}
        setIsOpen={setFormatsIsOpen}
        enabled={isEnabled}
        isCollapsable={!isEnabled || false}
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
