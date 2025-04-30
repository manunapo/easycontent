"use client";
import Preview from "./preview";
import Controls from "../Controls/controls";
import ExportButton from "../Controls/export-button";

export default function PhotoEditor() {
  return (
    <div className="flex flex-col h-full w-full">
      <h1>Photo Editor</h1>
      <div className="flex md:flex-row flex-col w-full justify-center items-center">
        <div className="flex flex-col md:h-[90vh] md:overflow-y-auto gap-4 justify-start p-4 max-w-lg">
          <Controls />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center p-4 bg-gray-100 dark:bg-gray-800 max-w-md">
          <Preview />
          <div className="w-full px-6">
            <ExportButton />
          </div>
        </div>
      </div>
    </div>
  );
}
