"use client";

import { ChevronDown } from "lucide-react";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a utility like clsx or tailwind-merge

interface CollapsableContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  enabled?: boolean;
}

export default function CollapsableContainer({
  title,
  subtitle,
  children,
  isOpen = false,
  setIsOpen = () => {},
  enabled = true,
}: CollapsableContainerProps) {
  const toggleOpen = () => {
    if (enabled) {
      setIsOpen(!isOpen);
    }
  };

  const headerClasses = cn(
    "flex justify-between items-center p-4 bg-gray-100",
    {
      "cursor-pointer hover:bg-gray-200": enabled,
      "cursor-not-allowed opacity-60": !enabled,
    }
  );

  const textClasses = cn("flex w-full gap-2 text-sm justify-start items-center", {
    "text-gray-500": !enabled,
  });

  return (
    <div className={cn("border rounded-md overflow-hidden mb-4", { "bg-gray-50": !enabled })}>
      <div
        className={headerClasses}
        onClick={toggleOpen}
        role="button"
        tabIndex={enabled ? 0 : -1}
        onKeyDown={(e) =>
          enabled && (e.key === "Enter" || e.key === " ") && toggleOpen()
        }
        aria-expanded={isOpen}
        aria-disabled={!enabled}
      >
        <div className={textClasses}>
          <h3 className="font-normal">{title} -</h3>
          {subtitle && (
            <p className="text-xs font-light italic">
              {subtitle}
            </p>
          )}
        </div>
        <span
          className={cn(
            "transform transition-transform duration-200",
            { "rotate-180": isOpen, "rotate-0": !isOpen },
            { "text-gray-400": !enabled } // Mute chevron when disabled
          )}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>
      {/* Content remains visually unchanged but won't expand if disabled */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen && enabled ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        // Ensure content is hidden if disabled, even if isOpen was true initially
        style={{ maxHeight: isOpen && enabled ? '1000px' : '0px' }} // Use a large enough max-height or calculate dynamically if needed
      >
        <div className="p-4 border-t">{children}</div>
      </div>
    </div>
  );
}
