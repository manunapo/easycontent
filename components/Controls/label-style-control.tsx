"use client";

import React from "react";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabelStyleState } from "@/types";

export default function LabelStyleControl() {
  const { labelStyle, handleLabelStyleChange } = useImageEditor();

  return (
    <div className="space-y-4">
      <h3 className="text-md font-semibold">
        Label Styles (&apos;Before&apos;/&apos;After&apos;)
      </h3>

      {/* Text Size Selector */}
      <div className="space-y-2">
        <Label>Text Size</Label>
        <Select
          value={labelStyle.size}
          onValueChange={(value: LabelStyleState["size"]) =>
            handleLabelStyleChange("size", value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label-bgcolor">Background</Label>
          <Input
            id="label-bgcolor"
            type="color"
            value={labelStyle.bgColor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleLabelStyleChange("bgColor", e.target.value)
            }
            className="h-10 p-1"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label-textcolor">Text Color</Label>
          <Input
            id="label-textcolor"
            type="color"
            value={labelStyle.textColor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleLabelStyleChange("textColor", e.target.value)
            }
            className="h-10 p-1"
          />
        </div>
      </div>
    </div>
  );
}
