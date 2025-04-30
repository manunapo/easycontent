import React from 'react';
import { BaseTemplateProps } from '@/types';
import ImageDisplay from '@/templates/ImageDisplay'; // Use absolute path

const SideBySideTemplate: React.FC<BaseTemplateProps> = ({ beforeImage, afterImage, outputFormat }) => {
  return (
    <div className="flex w-full h-full">
      {/* Before Image */}
      <div className="relative w-1/2 h-full">
        <ImageDisplay imageState={beforeImage} outputFormat={outputFormat} />
      </div>

      {/* After Image */}
      <div className="relative w-1/2 h-full">
        <ImageDisplay imageState={afterImage} outputFormat={outputFormat} />
      </div>
    </div>
  );
};

export default SideBySideTemplate; 