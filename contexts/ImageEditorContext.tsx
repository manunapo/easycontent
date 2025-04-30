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
  TemplateConfig,
} from '@/types';
import { AVAILABLE_TEMPLATES, getTemplateById } from '@/lib/templates';
import { drawTemplateOnCanvas } from '@/lib/canvasUtils';
import { getCropAspectRatio } from '@/lib/aspectRatioUtils';

// --- Context State & Value Types ---

interface ImageEditorState {
  selectedTemplateId: string | null;
  selectedTemplateIds: string[];
  activeOutputFormatId: OutputFormatId;
  selectedOutputFormatIds: OutputFormatId[];
  beforeImage: ImageState;
  afterImage: ImageState;
  caption: CaptionState;
  labelStyle: LabelStyleState;
}

interface ImageEditorContextValue extends Omit<ImageEditorState, 'beforeCroppedUrl' | 'afterCroppedUrl'> {
  selectedTemplate: TemplateConfig | null;
  activeOutputFormat: typeof OUTPUT_FORMATS[OutputFormatId];
  cropAspect: number | undefined;
  currentBeforeCrop: FormatCropSettings;
  currentAfterCrop: FormatCropSettings;
  totalExportCount: number;

  setSelectedTemplateId: (id: string | null) => void;
  handleTemplateToggle: (id: string) => void;
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

const initialImageState = (id: 'before' | 'after'): ImageState => {
  // Initialize crop settings for all templates and formats
  const templateFormatCrops: Partial<Record<string, Partial<Record<OutputFormatId, FormatCropSettings>>>> = {};
  
  // For each template
  AVAILABLE_TEMPLATES.forEach(template => {
    templateFormatCrops[template.id] = {};
    
    // For each format
    Object.keys(OUTPUT_FORMATS).forEach(formatId => {
      if (templateFormatCrops[template.id]) {
        templateFormatCrops[template.id]![formatId as OutputFormatId] = { ...defaultFormatCrop };
      }
    });
  });
  
  return {
    id,
    file: null,
    previewUrl: null,
    templateFormatCrops,
  };
};

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
  selectedTemplateIds: [AVAILABLE_TEMPLATES[0]?.id || ''],
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
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>(initialState.selectedTemplateIds);
  const [activeOutputFormatId, setActiveOutputFormatId] = useState<OutputFormatId>(initialState.activeOutputFormatId);
  const [selectedOutputFormatIds, setSelectedOutputFormatIds] = useState<OutputFormatId[]>(initialState.selectedOutputFormatIds);
  const [beforeImage, setBeforeImage] = useState<ImageState>(initialState.beforeImage);
  const [afterImage, setAfterImage] = useState<ImageState>(initialState.afterImage);
  const [caption, setCaption] = useState<CaptionState>(initialState.caption);
  const [labelStyle, setLabelStyle] = useState<LabelStyleState>(initialState.labelStyle);

  // --- Derived State (based on active format and template) ---
  const selectedTemplate = getTemplateById(selectedTemplateId);
  const activeOutputFormat = OUTPUT_FORMATS[activeOutputFormatId];
  const cropAspect = getCropAspectRatio(selectedTemplateId, activeOutputFormat);
  
  // Get current crop settings for the active template and format
  const currentBeforeCrop = beforeImage.templateFormatCrops[selectedTemplateId || '']?.[activeOutputFormatId] ?? defaultFormatCrop;
  const currentAfterCrop = afterImage.templateFormatCrops[selectedTemplateId || '']?.[activeOutputFormatId] ?? defaultFormatCrop;
  
  // Calculate total exports (template count × format count)
  const totalExportCount = selectedTemplateIds.length * selectedOutputFormatIds.length;

  // --- Handlers ---
  
  const handleTemplateToggle = useCallback((id: string) => {
    setSelectedTemplateIds(prevIds => {
      // If id already exists, remove it (unless it's the last one)
      if (prevIds.includes(id)) {
        // Don't allow removing the last template
        if (prevIds.length <= 1) return prevIds;
        return prevIds.filter(prevId => prevId !== id);
      }
      // Otherwise add it
      return [...prevIds, id];
    });
    
    // If toggling on a template, and it's not already the active one, make it active
    if (!selectedTemplateIds.includes(id)) {
      setSelectedTemplateId(id);
    } else if (selectedTemplateId === id && selectedTemplateIds.length > 1) {
      // If toggling off the active template, select the first available one
      const newActive = selectedTemplateIds.find(tId => tId !== id);
      if (newActive) setSelectedTemplateId(newActive);
    }
  }, [selectedTemplateIds, selectedTemplateId]);

  const handleImageSelect = useCallback((id: 'before' | 'after', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updater = id === 'before' ? setBeforeImage : setAfterImage;
      updater((prevState) => {
        // Keep the existing crop settings when updating the image
        return {
          ...initialImageState(id),
          templateFormatCrops: prevState.templateFormatCrops,
          file,
          previewUrl: reader.result as string,
        };
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropChange = useCallback((id: 'before' | 'after', settings: CropSettings) => {
    if (!selectedTemplateId) return;
    
    const updater = id === 'before' ? setBeforeImage : setAfterImage;
    updater((prevState) => {
      // Create a deep copy of the nested structure
      const newTemplateFormatCrops = { ...prevState.templateFormatCrops };
      
      // Ensure the entries exist
      if (!newTemplateFormatCrops[selectedTemplateId]) {
        newTemplateFormatCrops[selectedTemplateId] = {};
      }
      
      if (!newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId]) {
        newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId] = { ...defaultFormatCrop };
      }
      
      // Update the crop settings
      newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId] = {
        ...newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId]!,
        crop: settings.crop,
        zoom: settings.zoom,
      };
      
      return { ...prevState, templateFormatCrops: newTemplateFormatCrops };
    });
  }, [selectedTemplateId, activeOutputFormatId]);

  const handleCropComplete = useCallback((id: 'before' | 'after', croppedAreaPixels: Area) => {
    if (!selectedTemplateId) return;
    
    const updater = id === 'before' ? setBeforeImage : setAfterImage;
    updater((prevState) => {
      // Create a deep copy of the nested structure
      const newTemplateFormatCrops = { ...prevState.templateFormatCrops };
      
      // Ensure the entries exist
      if (!newTemplateFormatCrops[selectedTemplateId]) {
        newTemplateFormatCrops[selectedTemplateId] = {};
      }
      
      if (!newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId]) {
        newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId] = { ...defaultFormatCrop };
      }
      
      // Update the crop settings
      newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId] = {
        ...newTemplateFormatCrops[selectedTemplateId]![activeOutputFormatId]!,
        croppedAreaPixels,
      };
      
      return { ...prevState, templateFormatCrops: newTemplateFormatCrops };
    });
  }, [selectedTemplateId, activeOutputFormatId]);

  const handleCaptionChange = useCallback((key: keyof CaptionState, value: string | number | boolean) => {
    setCaption((prev: CaptionState) => ({ ...prev, [key]: value }));
  }, []);

  const handleLabelStyleChange = useCallback((key: keyof LabelStyleState, value: string | number | boolean) => {
    setLabelStyle((prev: LabelStyleState) => ({ ...prev, [key]: value }));
  }, []);

  const handleOutputFormatToggle = useCallback((id: OutputFormatId) => {
    setSelectedOutputFormatIds(prevIds => {
      // Don't allow removing the last format
      if (prevIds.includes(id) && prevIds.length <= 1) return prevIds;
        
      return prevIds.includes(id)
        ? prevIds.filter(prevId => prevId !== id)
        : [...prevIds, id];
    });
    
    // If toggling on a format, and it's not already the active one, make it active
    if (!selectedOutputFormatIds.includes(id)) {
      setActiveOutputFormatId(id);
    } else if (activeOutputFormatId === id && selectedOutputFormatIds.length > 1) {
      // If toggling off the active format, select the first available one
      const newActive = selectedOutputFormatIds.find(fId => fId !== id);
      if (newActive) setActiveOutputFormatId(newActive);
    }
  }, [selectedOutputFormatIds, activeOutputFormatId]);

  const handleExport = useCallback(async () => {
    if (selectedTemplateIds.length === 0) {
      alert("Please select at least one template.");
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
    const isZipExport = selectedTemplateIds.length * selectedOutputFormatIds.length > 1;
    let zip: JSZip | null = null;

    if (isZipExport) {
      zip = new JSZip();
    }
    
    // Generate default crop data if missing
    const generateDefaultCropIfNeeded = (image: HTMLImageElement): Area => {
      // Calculate a reasonable default crop that takes the center portion of the image
      // with the correct aspect ratio
      const aspectRatio = 1; // Default to square
      let cropWidth, cropHeight;
      
      if (image.width / image.height > aspectRatio) {
        // Image is wider than target aspect ratio
        cropHeight = image.height;
        cropWidth = cropHeight * aspectRatio;
      } else {
        // Image is taller than target aspect ratio
        cropWidth = image.width;
        cropHeight = cropWidth / aspectRatio;
      }
      
      // Center the crop
      const x = (image.width - cropWidth) / 2;
      const y = (image.height - cropHeight) / 2;
      
      return { x, y, width: cropWidth, height: cropHeight };
    };
    
    // For each template
    for (const templateId of selectedTemplateIds) {
      const template = getTemplateById(templateId);
      if (!template) {
        console.warn(`Template with ID ${templateId} not found, skipping.`);
        continue;
      }
      
      // For each format
      for (const formatId of selectedOutputFormatIds) {
        const outputFormat = OUTPUT_FORMATS[formatId];
        let beforeCropSettings = beforeImage.templateFormatCrops[templateId]?.[formatId];
        let afterCropSettings = afterImage.templateFormatCrops[templateId]?.[formatId];
        
        // If we don't have crop settings, we'll use a default based on the image dimensions
        const useDefaultCrop = !beforeCropSettings?.croppedAreaPixels || !afterCropSettings?.croppedAreaPixels;
        
        try {
          console.log(`Exporting format: ${formatId} with template: ${templateId}`);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error(`Could not get canvas context for ${formatId} with template ${templateId}`);

          canvas.width = outputFormat.width;
          canvas.height = outputFormat.height;
          
          // If we need to use default crop, load images and calculate default crop areas
          if (useDefaultCrop) {
            console.log("Using default crop settings for this template-format combination");
            
            // Load images to get dimensions
            const loadImage = (url: string): Promise<HTMLImageElement> => {
              return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = url;
              });
            };
            
            // Only load if needed
            if (!beforeCropSettings?.croppedAreaPixels) {
              const beforeImg = await loadImage(beforeImage.previewUrl!);
              const defaultBeforeCrop = generateDefaultCropIfNeeded(beforeImg);
              beforeCropSettings = {
                crop: { x: 0, y: 0 },
                zoom: 1,
                croppedAreaPixels: defaultBeforeCrop
              };
            }
            
            if (!afterCropSettings?.croppedAreaPixels) {
              const afterImg = await loadImage(afterImage.previewUrl!);
              const defaultAfterCrop = generateDefaultCropIfNeeded(afterImg);
              afterCropSettings = {
                crop: { x: 0, y: 0 },
                zoom: 1,
                croppedAreaPixels: defaultAfterCrop
              };
            }
          }

          await drawTemplateOnCanvas(
            ctx,
            beforeImage.previewUrl!,
            afterImage.previewUrl!,
            beforeCropSettings!.croppedAreaPixels!,
            afterCropSettings!.croppedAreaPixels!,
            template,
            canvas.width,
            canvas.height,
            caption,
            labelStyle
          );

          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

          if (blob) {
            const fileName = `template-${template.id}-${outputFormat.id}.png`;
            if (isZipExport && zip) {
              zip.file(fileName, blob);
              console.log(`Added ${fileName} to zip.`);
            } else {
              saveAs(blob, fileName);
            }
            exportCount++;
          } else {
            throw new Error(`Canvas toBlob failed for ${formatId} with template ${templateId}.`);
          }
        } catch (error) {
          console.error(`Export failed for format ${formatId} with template ${templateId}:`, error);
          alert(`Export failed for ${outputFormat.name} with template ${template.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    if (isZipExport && zip && exportCount > 0) {
      try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `multiple-templates-exports.zip`);
        console.log(`Successfully generated and downloaded zip file with ${exportCount} image(s).`);
      } catch (error) {
        console.error("Zip generation failed:", error);
        alert(`Failed to generate zip file: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (exportCount > 0 && exportCount < totalExportCount) {
      alert(`Successfully exported ${exportCount} out of ${totalExportCount} possible outputs. Some were skipped or failed.`);
    } else if (exportCount === 1 && !isZipExport) {
      console.log(`Successfully exported 1 image.`);
    } else if (exportCount === 0 && totalExportCount > 0) {
      alert("Export failed for all selected templates and formats. Please check crop settings or console for errors.");
    }
  }, [selectedTemplateIds, selectedOutputFormatIds, beforeImage, afterImage, labelStyle, caption, totalExportCount]);

  // --- Context Value ---

  const value: ImageEditorContextValue = {
    selectedTemplateId,
    selectedTemplateIds,
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
    totalExportCount,
    setSelectedTemplateId,
    handleTemplateToggle,
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