"use client";

import { Download } from "lucide-react";
import { Button } from "../ui/button";
import { useImageEditor } from "@/contexts/ImageEditorContext";

export default function ExportButton() {
  const { handleExport, totalExportCount } = useImageEditor();
  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="w-full"
      disabled={totalExportCount === 0}
    >
      <Download className="w-4 h-4 mr-2" />
      Export ({totalExportCount}) {totalExportCount === 1 ? 'File' : 'Files'}
    </Button>
  );
}
