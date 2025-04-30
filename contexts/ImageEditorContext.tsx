'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { Area } from 'react-easy-crop';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import {
  ImageState,
  OutputFormatId,
  OUTPUT_FORMATS,
  CropSettings,
  FormatCropSettings,
  CaptionState,
  LabelStyleState,
  Template,
} from '@/types';
import { AVAILABLE_TEMPLATES, getTemplateById } from '@/lib/templates';
import { drawTemplateOnCanvas } from '@/lib/canvasUtils';
import { getCropAspectRatio } from '@/lib/aspectRatioUtils';

// --- Context State & Value Types ---

interface ImageEditorState {
  selectedTemplateId: string | null;
  activeOutputFormatId: OutputFormatId;
  selectedOutputFormatIds: OutputFormatId[];
  beforeImage: ImageState;
  afterImage: ImageState;
  caption: CaptionState;
  labelStyle: LabelStyleState;
}

interface ImageEditorContextValue extends Omit<ImageEditorState, 'beforeCroppedUrl' | 'afterCroppedUrl'> {
  selectedTemplate: Template | null;
  activeOutputFormat: typeof OUTPUT_FORMATS[OutputFormatId];
  cropAspect: number | undefined;
  currentBeforeCrop: FormatCropSettings;
  currentAfterCrop: FormatCropSettings;

  setSelectedTemplateId: (id: string | null) => void;
  setActiveOutputFormatId: (id: OutputFormatId) => void;
  handleOutputFormatToggle: (id: OutputFormatId) => void;
  handleImageSelect: (id: 'before' | 'after', file: File) => void;
  handleCropChange: (id: 'before' | 'after', settings: CropSettings) => void;
  handleCropComplete: (id: 'before' | 'after', croppedAreaPixels: Area) => void;
  handleCaptionChange: (key: keyof CaptionState, value: string | number | boolean) => void;
  handleLabelStyleChange: (key: keyof LabelStyleState, value: string | number | boolean) => void;
  handleExport: () => Promise<void>;
}

// --- Initial State ---

const defaultFormatCrop: FormatCropSettings = {
  crop: { x: 0, y: 0 },
  zoom: 1,
  croppedAreaPixels: null,
};

const initialImageState = (id: 'before' | 'after'): ImageState => ({
  id,
  file: null,
  previewUrl: null,
  formatCrops: Object.keys(OUTPUT_FORMATS).reduce((acc, formatId) => {
    acc[formatId as OutputFormatId] = { ...defaultFormatCrop };
    return acc;
  }, {} as Partial<Record<OutputFormatId, FormatCropSettings>>),
});

const initialCaptionState: CaptionState = {
  text: '',
  size: 'medium',
  bgColor: 'rgba(0, 0, 0, 0.7)',
  textColor: '#FFFFFF',
  position: 'bottom-center',
};

const initialLabelStyleState: LabelStyleState = {
  size: 'medium',
  bgColor: 'rgba(255, 255, 255, 0.9)',
  textColor: '#000000',
};

const initialState: ImageEditorState = {
  selectedTemplateId: AVAILABLE_TEMPLATES[0]?.id || null,
  activeOutputFormatId: 'instagram',
  selectedOutputFormatIds: ['instagram'],
  beforeImage: initialImageState('before'),
  afterImage: initialImageState('after'),
  caption: initialCaptionState,
  labelStyle: initialLabelStyleState,
};

// --- Context Creation ---

const ImageEditorContext = createContext<ImageEditorContextValue | undefined>(undefined);

// --- Provider Component ---

interface ImageEditorProviderProps {
  children: ReactNode;
}

export const ImageEditorProvider: React.FC<ImageEditorProviderProps> = ({ children }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialState.selectedTemplateId);
  const [activeOutputFormatId, setActiveOutputFormatId] = useState<OutputFormatId>(initialState.activeOutputFormatId);
  const [selectedOutputFormatIds, setSelectedOutputFormatIds] = useState<OutputFormatId[]>(initialState.selectedOutputFormatIds);
  const [beforeImage, setBeforeImage] = useState<ImageState>(initialState.beforeImage);
  const [afterImage, setAfterImage] = useState<ImageState>(initialState.afterImage);
  const [caption, setCaption] = useState<CaptionState>(initialState.caption);
  const [labelStyle, setLabelStyle] = useState<LabelStyleState>(initialState.labelStyle);

  // --- Derived State (based on active format) ---
  const selectedTemplate = getTemplateById(selectedTemplateId);
  const activeOutputFormat = OUTPUT_FORMATS[activeOutputFormatId];
  const cropAspect = getCropAspectRatio(selectedTemplateId, activeOutputFormat);
  const currentBeforeCrop = beforeImage.formatCrops[activeOutputFormatId] ?? defaultFormatCrop;
  const currentAfterCrop = afterImage.formatCrops[activeOutputFormatId] ?? defaultFormatCrop;

  // --- Handlers ---

  const handleImageSelect = useCallback((id: 'before' | 'after', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updater = id === 'before' ? setBeforeImage : setAfterImage;
      updater(initialImageState(id));
      updater(prevState => ({ ...prevState, file, previewUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropChange = useCallback((id: 'before' | 'after', settings: CropSettings) => {
    const updater = id === 'before' ? setBeforeImage : setAfterImage;
    updater((prevState) => {
      const newFormatCrops = {
        ...prevState.formatCrops,
        [activeOutputFormatId]: {
          ...(prevState.formatCrops[activeOutputFormatId] ?? defaultFormatCrop),
          crop: settings.crop,
          zoom: settings.zoom,
        },
      };
      return { ...prevState, formatCrops: newFormatCrops };
    });
  }, [activeOutputFormatId]);

  const handleCropComplete = useCallback((id: 'before' | 'after', croppedAreaPixels: Area) => {
    const updater = id === 'before' ? setBeforeImage : setAfterImage;
    updater((prevState) => {
      const newFormatCrops = {
        ...prevState.formatCrops,
        [activeOutputFormatId]: {
          ...(prevState.formatCrops[activeOutputFormatId] ?? defaultFormatCrop),
          croppedAreaPixels,
        },
      };
      return { ...prevState, formatCrops: newFormatCrops };
    });
  }, [activeOutputFormatId]);

  const handleCaptionChange = useCallback((key: keyof CaptionState, value: string | number | boolean) => {
    setCaption((prev: CaptionState) => ({ ...prev, [key]: value }));
  }, []);

  const handleLabelStyleChange = useCallback((key: keyof LabelStyleState, value: string | number | boolean) => {
    setLabelStyle((prev: LabelStyleState) => ({ ...prev, [key]: value }));
  }, []);

  const handleOutputFormatToggle = useCallback((id: OutputFormatId) => {
    setSelectedOutputFormatIds(prevIds =>
      prevIds.includes(id)
        ? prevIds.filter(prevId => prevId !== id)
        : [...prevIds, id]
    );
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedTemplate) {
      alert("Please select a template.");
      return;
    }
    if (selectedOutputFormatIds.length === 0) {
      alert("Please select at least one output format to export.");
      return;
    }
    if (!beforeImage.previewUrl || !afterImage.previewUrl) {
      alert("Please upload both 'Before' and 'After' images.");
      return;
    }

    let exportCount = 0;
    const formatsToExport = [...selectedOutputFormatIds];
    const isZipExport = formatsToExport.length > 1;
    let zip: JSZip | null = null;

    if (isZipExport) {
      zip = new JSZip();
    }

    for (const formatId of formatsToExport) {
      const outputFormat = OUTPUT_FORMATS[formatId];
      const beforeCropSettings = beforeImage.formatCrops[formatId];
      const afterCropSettings = afterImage.formatCrops[formatId];

      if (!beforeCropSettings?.croppedAreaPixels || !afterCropSettings?.croppedAreaPixels) {
        console.warn(`Skipping export for ${formatId}: Missing crop data for 'before' or 'after' image.`);
        alert(`Could not export for ${outputFormat.name}: Please ensure both images are cropped for this format.`);
        continue;
      }

      try {
        console.log(`Exporting format: ${formatId}`);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context for " + formatId);

        canvas.width = outputFormat.width;
        canvas.height = outputFormat.height;

        await drawTemplateOnCanvas(
          ctx,
          beforeImage.previewUrl,
          afterImage.previewUrl,
          beforeCropSettings.croppedAreaPixels,
          afterCropSettings.croppedAreaPixels,
          selectedTemplate,
          canvas.width,
          canvas.height
        );

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

        if (blob) {
          const fileName = `template-${selectedTemplate.id}-${outputFormat.id}.png`;
          if (isZipExport && zip) {
            zip.file(fileName, blob);
            console.log(`Added ${fileName} to zip.`);
          } else {
            saveAs(blob, fileName);
          }
          exportCount++;
        } else {
          throw new Error(`Canvas toBlob failed for ${formatId}.`);
        }
      } catch (error) {
        console.error(`Export failed for format ${formatId}:`, error);
        alert(`Export failed for ${outputFormat.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (isZipExport && zip && exportCount > 0) {
      try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `template-${selectedTemplate.id}-exports.zip`);
        console.log(`Successfully generated and downloaded zip file with ${exportCount} image(s).`);
      } catch (error) {
        console.error("Zip generation failed:", error);
        alert(`Failed to generate zip file: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (exportCount > 0 && exportCount < formatsToExport.length) {
      alert(`Successfully exported ${exportCount} out of ${formatsToExport.length} selected formats. Some formats were skipped or failed.`);
    } else if (exportCount === formatsToExport.length && exportCount > 0 && !isZipExport) {
      console.log(`Successfully exported 1 image.`);
    } else if (exportCount === 0 && formatsToExport.length > 0) {
      alert("Export failed for all selected formats. Please check crop settings or console for errors.");
    }
  }, [selectedTemplate, selectedOutputFormatIds, beforeImage, afterImage, labelStyle, caption]);

  // --- Context Value ---

  const value: ImageEditorContextValue = {
    selectedTemplateId,
    activeOutputFormatId,
    selectedOutputFormatIds,
    beforeImage,
    afterImage,
    caption,
    labelStyle,
    selectedTemplate,
    activeOutputFormat,
    cropAspect,
    currentBeforeCrop,
    currentAfterCrop,
    setSelectedTemplateId,
    setActiveOutputFormatId,
    handleOutputFormatToggle,
    handleImageSelect,
    handleCropChange,
    handleCropComplete,
    handleCaptionChange,
    handleLabelStyleChange,
    handleExport,
  };

  return (
    <ImageEditorContext.Provider value={value}>
      {children}
    </ImageEditorContext.Provider>
  );
};

// --- Custom Hook ---

export const useImageEditor = (): ImageEditorContextValue => {
  const context = useContext(ImageEditorContext);
  if (context === undefined) {
    throw new Error('useImageEditor must be used within an ImageEditorProvider');
  }
  return context;
}; 