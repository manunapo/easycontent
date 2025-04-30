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
  isCollapsable?: boolean;
}

export default function CollapsableContainer({
  title,
  subtitle,
  children,
  isOpen = false,
  setIsOpen = () => {},
  enabled = true,
  isCollapsable = true,
}: CollapsableContainerProps) {
  const effectiveIsOpen = !isCollapsable || isOpen;
  const isInteractive = isCollapsable && enabled;

  const toggleOpen = () => {
    if (isInteractive) {
      setIsOpen(!isOpen);
    }
  };

  const headerClasses = cn(
    "flex justify-between items-center py-2 px-4 bg-gray-100",
    {
      "cursor-pointer hover:bg-gray-200": isInteractive,
      "cursor-not-allowed": !enabled && isCollapsable,
      "cursor-default": !isCollapsable,
      "opacity-60": !enabled,
    }
  );

  const textClasses = cn("flex w-full gap-2 text-sm justify-start items-center", {
    "text-gray-500": !enabled,
  });

  return (
    <div className={cn("border rounded-md overflow-hidden", { "bg-gray-50": !enabled })}>
      <div
        className={headerClasses}
        onClick={isInteractive ? toggleOpen : undefined}
        role={isInteractive ? "button" : undefined}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={
          isInteractive
            ? (e) => (e.key === "Enter" || e.key === " ") && toggleOpen()
            : undefined
        }
        aria-expanded={isCollapsable ? effectiveIsOpen : undefined}
        aria-disabled={!enabled}
      >
        <div className={textClasses}>
          <h3 className="font-normal">{title}</h3>
          {subtitle && (
            <p className="text-xs font-light italic">
              {subtitle}
            </p>
          )}
        </div>
        {isCollapsable && (
          <span
            className={cn(
              "transform transition-transform duration-200",
              { "rotate-180": isOpen, "rotate-0": !isOpen },
              { "text-gray-400": !enabled }
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        )}
      </div>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          effectiveIsOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ maxHeight: effectiveIsOpen ? '1000px' : '0px' }}
      >
        <div className="p-4 border-t">{children}</div>
      </div>
    </div>
  );
}
