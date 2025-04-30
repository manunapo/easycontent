import React from 'react';
import { BaseTemplateProps } from '@/types';
import ImageDisplay from '@/templates/ImageDisplay';

const OverlappingDiagonalTemplate: React.FC<BaseTemplateProps> = ({ beforeImage, afterImage, outputFormat }) => {
  // Diagonal line from top-left to bottom-right
  const clipPathBefore = 'polygon(0 0, 100% 0, 0 100%)';
  // Diagonal line complementing the above
  const clipPathAfter = 'polygon(100% 0, 100% 100%, 0 100%)';

  return (
    <div className="relative w-full h-full bg-gray-300"> {/* Added background for visibility */}
      {/* Before Image (Top-Left Triangle) */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ clipPath: clipPathBefore }}
      >
        <ImageDisplay imageState={beforeImage} outputFormat={outputFormat} />
      </div>

      {/* After Image (Bottom-Right Triangle) */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{ clipPath: clipPathAfter }}
      >
         <ImageDisplay imageState={afterImage} outputFormat={outputFormat} />
      </div>

       {/* Diagonal Divider Line - Approximation */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="0" y1="100%" x2="100%" y2="0" stroke="white" strokeWidth="1.5" />
          </svg>
      </div>

    </div>
  );
};

export default OverlappingDiagonalTemplate; 