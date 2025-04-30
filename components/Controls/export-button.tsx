"use client";

import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { useImageEditor } from "@/contexts/ImageEditorContext";

export default function ExportButton() {
  const { handleExport, selectedOutputFormatIds } = useImageEditor();
  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="w-full"
      disabled={selectedOutputFormatIds.length === 0}
    >
      <Download className="w-4 h-4" />
      Export Selected Formats ({selectedOutputFormatIds.length})
    </Button>
  );
}
