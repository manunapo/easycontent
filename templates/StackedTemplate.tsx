import React from 'react';
import { BaseTemplateProps } from '@/types';
import ImageDisplay from '@/templates/ImageDisplay';

const StackedTemplate: React.FC<BaseTemplateProps> = ({ beforeImage, afterImage, outputFormat }) => {
  // Special case for 9:16 output, each image takes half the height (aspect 9:8)
  // For other formats, they also take half the height.
  const isTallFormat = outputFormat.aspectRatio < 1; // e.g., 9:16
  const imageContainerHeight = isTallFormat ? 'h-1/2' : 'h-1/2'; // Always half for stacked

  return (
    <div className="flex flex-col w-full h-full">
      {/* Before Image */}
      <div className={`relative w-full ${imageContainerHeight}`}>
        <ImageDisplay imageState={beforeImage} outputFormat={outputFormat} />
      </div>

      {/* After Image */}
      <div className={`relative w-full ${imageContainerHeight}`}>
        <ImageDisplay imageState={afterImage} outputFormat={outputFormat} />
      </div>
    </div>
  );
};

export default StackedTemplate; 