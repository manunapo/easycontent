import React, { useEffect, useRef } from 'react';
import { OutputFormat } from '@/types'; // Removed FormatCropSettings
import { Area } from 'react-easy-crop'; // Need Area type
import getCroppedImg from '@/lib/cropImage';

// Redefine ImageState subset needed by ImageDisplay
interface ImageDisplayStateSubset {
    id: 'before' | 'after';
    previewUrl: string | null;
    croppedAreaPixels: Area | null;
}

interface ImageDisplayProps {
  imageState: ImageDisplayStateSubset | null; // Expect the relevant subset
  outputFormat: OutputFormat; // Still needed?
  onCroppedUrlGenerated: (id: 'before' | 'after', url: string | null) => void;
}

// This component now focuses on GENERATING the cropped URL via callback
// It no longer displays the image itself, as the canvas in TemplatePreview will handle that.
const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
    imageState,
    // outputFormat, 
    onCroppedUrlGenerated 
}) => {
  const prevCropRef = useRef<string | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null); // Keep track of the last generated URL

  useEffect(() => {
    let isMounted = true;
    let generatedUrlInThisEffect: string | null = null;

    const generateCroppedImage = async () => {
      // Use fields from imageState prop
      if (imageState?.previewUrl && imageState.croppedAreaPixels) {
         const cropKey = JSON.stringify(imageState.croppedAreaPixels);
          if (prevCropRef.current === cropKey && currentBlobUrlRef.current) {
             return;
          }
          prevCropRef.current = cropKey;
          try {
            const url = await getCroppedImg(imageState.previewUrl, imageState.croppedAreaPixels);
             generatedUrlInThisEffect = url;
              if (isMounted) {
                 if (currentBlobUrlRef.current && currentBlobUrlRef.current !== url) {
                   URL.revokeObjectURL(currentBlobUrlRef.current);
                 }
                 currentBlobUrlRef.current = url;
                 onCroppedUrlGenerated(imageState.id, url); // Use id from imageState
             }
         } catch (e) {
            console.error('Error cropping image:', e);
             if (isMounted) {
                if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
                currentBlobUrlRef.current = null;
                onCroppedUrlGenerated(imageState ? imageState.id : 'before', null); // Need an id
                prevCropRef.current = null;
             }
         }
      } else {
         // No source or no crop defined
          if (isMounted && imageState) { // Only call if imageState was provided
              if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
              currentBlobUrlRef.current = null;
              onCroppedUrlGenerated(imageState.id, null);
              prevCropRef.current = null;
          } else if (isMounted) {
              // Handle case where imageState itself is null (image removed)
               if (currentBlobUrlRef.current) URL.revokeObjectURL(currentBlobUrlRef.current);
               currentBlobUrlRef.current = null;
               // We don't know the ID if imageState is null, maybe parent handles this?
               // For safety, let's call with a default or skip.
               // Skipping might be safer if parent clears URL state anyway.
               prevCropRef.current = null;
          }
      }
    };

    generateCroppedImage();

    // Cleanup
    return () => {
      isMounted = false;
      if (generatedUrlInThisEffect && generatedUrlInThisEffect !== currentBlobUrlRef.current) {
          URL.revokeObjectURL(generatedUrlInThisEffect);
      }
    };
  }, [imageState?.previewUrl, imageState?.croppedAreaPixels, imageState?.id, onCroppedUrlGenerated]);

    // This component no longer renders an image directly.
    // It could render a status indicator or nothing.
    return null;
};

export default ImageDisplay; 