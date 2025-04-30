import { OutputFormat } from "@/types";
import { getTemplateById } from "./templates";

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

    const template = getTemplateById(templateId);
    if (template && template.template) {
        return template.template.getCropAspectRatio(outputFormat);
    }

    // Fallback to final aspect ratio if template not found
    console.warn(`Template not found: ${templateId}, using final aspect ratio`);
    return finalAspect;
}; 