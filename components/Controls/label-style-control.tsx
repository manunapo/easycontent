"use client";

import React from "react";
import { useImageEditor } from "@/contexts/ImageEditorContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabelStyleState } from "@/types";
import { RadioGroupItem } from "../ui/radio-group";
import { RadioGroup } from "@radix-ui/react-radio-group";

export default function LabelStyleControl() {
  const { labelStyle, handleLabelStyleChange } = useImageEditor();

  return (
    <div className="flex flex-col gap-4 text-xs text-nowrap">
      {/* Text Size Selector */}
      <div className="flex flex-col justify-start gap-2">
        <Label className="font-light text-xs border-b-1 mb-2 justify-end mr-2">
          Text
        </Label>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Size:</Label>
          <RadioGroup
            className="flex items-center gap-2"
            value={labelStyle.size}
            onValueChange={(value: LabelStyleState["size"]) =>
              handleLabelStyleChange("size", value)
            }
          >
            <div className="flex items-center space-x-1">
              <Label htmlFor="r1" className="text-xs font-light">
                Small
              </Label>
              <RadioGroupItem value="small" id="r1" />
            </div>
            <div className="flex items-center space-x-1">
              <Label htmlFor="r2" className="text-xs font-light">
                Medium
              </Label>
              <RadioGroupItem value="medium" id="r2" />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="r3" className="text-xs font-light">
                Large
              </Label>
              <RadioGroupItem value="large" id="r3" />
            </div>
          </RadioGroup>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="label-textcolor" className="text-xs">
            Color:
          </Label>
          <Input
            id="label-textcolor"
            type="color"
            value={labelStyle.textColor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleLabelStyleChange("textColor", e.target.value)
            }
            className="h-7 w-6 p-0 border-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex w-full flex-col justify-start gap-2">
          <Label className="font-light text-xs border-b-1 mb-2 justify-end mr-2">
            Background
          </Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="label-bgcolor" className="text-xs">
              Color:
            </Label>
            <Input
              id="label-bgcolor"
              type="color"
              value={labelStyle.bgColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleLabelStyleChange("bgColor", e.target.value)
              }
              className="h-7 w-6 p-0 border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
