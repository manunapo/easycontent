# Template System Documentation

This document explains how the template system works and how to create new templates.

## Overview

The template system is designed to be extensible and maintainable, making it easy to add new templates without changing the core logic of the application. Each template is implemented as a class that extends the abstract `Template` class, which defines the required methods and properties.

## Template Class Hierarchy

- `Template` (abstract class): The base class that all templates must extend
  - `BeforeAfterTemplate` (abstract class): A specialized base class for templates that require both "before" and "after" images
    - `SideBySideTemplate`: Implements a side-by-side before/after template
    - `StackedTemplate`: Implements a stacked (vertical) before/after template
    - `DiagonalTemplate`: Implements a diagonal split before/after template

## How to Create a New Template

To create a new template, follow these steps:

1. Decide what type of template you want to create and what inputs it requires
2. Create a new class that extends the appropriate base class (usually `BeforeAfterTemplate`)
3. Implement the required methods
4. Add your template to the `TEMPLATE_INSTANCES` object
5. Add your template to the `AVAILABLE_TEMPLATES` array

### Step 1: Create a New Template Class

Create your template class in `templates/implementation/TemplateImplementations.ts`:

```typescript
export class MyNewTemplate extends BeforeAfterTemplate {
  constructor() {
    super("my-new-template", "My New Template Name", "my-new-template-thumbnail");
  }

  getCropAspectRatio(outputFormat: OutputFormat): number {
    // Implement your aspect ratio calculation logic here
    // This determines how images will be cropped for this template
    return outputFormat.aspectRatio; // Example: use the original aspect ratio
  }

  async drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number, 
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void> {
    // Validate that all required inputs have images
    if (!this.validateInputs(images)) {
      throw new Error("Missing required images for My New Template");
    }

    // Load images
    const beforeImage = await loadImage(images.before.url);
    const afterImage = await loadImage(images.after.url);

    // Draw your template
    // This is where you implement how your template looks
    // Example: draw before image on top 1/3, after image on bottom 2/3
    drawCroppedImage(
      ctx,
      beforeImage,
      images.before.cropArea,
      0,
      0,
      width,
      height / 3
    );

    drawCroppedImage(
      ctx,
      afterImage,
      images.after.cropArea,
      0,
      height / 3,
      width,
      height * 2 / 3
    );

    // Add labels if provided
    if (labelStyle) {
      drawLabel(ctx, "Before", 5, 5, labelStyle);
      drawLabel(ctx, "After", 5, height / 3 + 5, labelStyle);
    }

    // Add caption if provided
    if (caption && caption.text) {
      drawCaption(ctx, caption, width, height);
    }
  }
}
```

### Step 2: Add Your Template to the TEMPLATE_INSTANCES Object

```typescript
// Export template instances
export const TEMPLATE_INSTANCES = {
  "side-by-side": new SideBySideTemplate(),
  "stacked": new StackedTemplate(),
  "diagonal": new DiagonalTemplate(),
  "my-new-template": new MyNewTemplate(), // Add your new template here
};
```

### Step 3: Create a Visual Component for Your Template (optional)

If you need a React component to visually represent your template in the UI:

```typescript
// templates/MyNewTemplate.tsx
import React from 'react';
import { BaseTemplateProps } from '@/types';
import ImageDisplay from '@/templates/ImageDisplay';

const MyNewTemplate: React.FC<BaseTemplateProps> = ({ beforeImage, afterImage, outputFormat }) => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Before Image - top 1/3 */}
      <div className="relative w-full h-1/3">
        <ImageDisplay imageState={beforeImage} outputFormat={outputFormat} />
      </div>

      {/* After Image - bottom 2/3 */}
      <div className="relative w-full h-2/3">
        <ImageDisplay imageState={afterImage} outputFormat={outputFormat} />
      </div>
    </div>
  );
};

export default MyNewTemplate;
```

### Step 4: Add Your Template to AVAILABLE_TEMPLATES

Update `lib/templates.ts` to include your new template:

```typescript
import { TemplateConfig } from '@/types';
import SideBySideTemplate from '@/templates/SideBySideTemplate';
import StackedTemplate from '@/templates/StackedTemplate';
import OverlappingDiagonalTemplate from '@/templates/OverlappingDiagonalTemplate';
import MyNewTemplate from '@/templates/MyNewTemplate'; // Import your component
import { TEMPLATE_INSTANCES } from '@/templates/implementation/TemplateImplementations';

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
  {
    id: 'side-by-side',
    name: 'Before/After - Side-by-Side',
    component: SideBySideTemplate,
    thumbnail: 'side-by-side',
    template: TEMPLATE_INSTANCES['side-by-side'],
  },
  {
    id: 'stacked',
    name: 'Before/After - Stacked',
    component: StackedTemplate,
    thumbnail: 'stacked',
    template: TEMPLATE_INSTANCES['stacked'],
  },
  {
    id: 'diagonal',
    name: 'Before/After - Diagonal Split',
    component: OverlappingDiagonalTemplate,
    thumbnail: 'diagonal',
    template: TEMPLATE_INSTANCES['diagonal'],
  },
  {
    id: 'my-new-template',
    name: 'My New Template',
    component: MyNewTemplate,
    thumbnail: 'my-new-template',
    template: TEMPLATE_INSTANCES['my-new-template'],
  },
];
```

## Advanced: Creating Templates with Different Input Requirements

If you're creating a template that requires different inputs than just "before" and "after" images, you'll need to:

1. Extend the `Template` class directly instead of `BeforeAfterTemplate`
2. Override the `requiredInputs` getter to specify your inputs
3. Update the UI to support your custom inputs

Example:

```typescript
export class TripleImageTemplate extends Template {
  constructor() {
    super("triple-image", "Triple Image Template", "triple-image-thumbnail");
  }

  get requiredInputs(): TemplateRequiredInput[] {
    return [
      { id: "top", label: "Top Image" },
      { id: "middle", label: "Middle Image" },
      { id: "bottom", label: "Bottom Image" },
    ];
  }

  getCropAspectRatio(outputFormat: OutputFormat): number {
    // For triple stacked images, the crop for each is 3x wider than tall
    return outputFormat.aspectRatio * 3;
  }

  async drawOnCanvas(
    ctx: CanvasRenderingContext2D,
    images: Record<string, { url: string; cropArea: Area }>,
    width: number,
    height: number,
    caption?: CaptionState,
    labelStyle?: LabelStyleState
  ): Promise<void> {
    // Implementation
    // ...
  }
}
```

## Conclusion

This template system provides a clean, maintainable way to add new templates without changing the core application logic. By encapsulating template-specific behavior in classes, we make the codebase more robust and easier to extend. 