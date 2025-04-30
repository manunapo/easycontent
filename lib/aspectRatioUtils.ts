import { OutputFormat } from "@/types";

/**
 * Calculates the aspect ratio needed for the cropping tool based on the
 * selected template and the final output format.
 *
 * @param templateId The ID of the selected template ('side-by-side', 'stacked', 'diagonal').
 * @param outputFormat The final output format object.
 * @returns The aspect ratio (width / height) to be used for cropping.
 */
export const getCropAspectRatio = (
    templateId: string | null,
    outputFormat: OutputFormat
): number => {
    const finalAspect = outputFormat.aspectRatio;

    if (!templateId) {
        return finalAspect; // Default to final aspect if no template selected
    }

    switch (templateId) {
        case 'side-by-side':
            // Each image takes half the width, full height
            // Aspect = (Width/2) / Height = (Width/Height) / 2 = finalAspect / 2
            return finalAspect / 2;
        case 'stacked':
            // Each image takes full width, half the height
            // Aspect = Width / (Height/2) = (Width/Height) * 2 = finalAspect * 2
            return finalAspect * 2;
        case 'diagonal':
            // Each image covers the full area but is clipped.
            // Cropping to the final aspect ratio is most intuitive here.
            return finalAspect;
        default:
            console.warn(`Unknown templateId "${templateId}" in getCropAspectRatio, defaulting to final aspect.`);
            return finalAspect;
    }
}; 