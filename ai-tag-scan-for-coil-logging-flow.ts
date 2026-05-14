'use server';
/**
 * @fileOverview This file implements a Genkit flow for scanning coil packing tags.
 *
 * - aiTagScanForCoilLogging - A function that handles scanning a coil packing tag, extracting details, and validating them.
 * - AiTagScanForCoilLoggingInput - The input type for the aiTagScanForCoilLogging function.
 * - AiTagScanForCoilLoggingOutput - The return type for the aiTagScanForCoilLogging function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExtractCoilDetailsPromptOutputSchema = z.object({
  netWeight: z.coerce.number().describe('The net weight of the coil extracted from the tag.'),
  coilWidth: z.coerce.number().describe('The width of the coil extracted from the tag.'),
  coilThickness: z.coerce.number().describe('The thickness of the coil extracted from the tag.'),
});

type ExtractCoilDetailsPromptOutput = z.infer<typeof ExtractCoilDetailsPromptOutputSchema>;

const AiTagScanForCoilLoggingInputSchema = z.object({
  tagPhotoDataUri: z
    .string()
    .describe(
      "A photo of the coil packing tag, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  predefinedCoilWidth: z.number().describe('The predefined width of the coil for validation.'),
  predefinedCoilThickness: z.number().describe('The predefined thickness of the coil for validation.'),
});
export type AiTagScanForCoilLoggingInput = z.infer<typeof AiTagScanForCoilLoggingInputSchema>;

const AiTagScanForCoilLoggingOutputSchema = z.object({
  netWeight: z.number().describe('The net weight of the coil extracted from the tag.'),
  coilWidth: z.number().describe('The extracted coil width.'),
  coilThickness: z.number().describe('The extracted coil thickness.'),
  validationMessage: z.string().describe('A message indicating the result of the dimension validation.'),
  isValid: z.boolean().describe('True if extracted dimensions match predefined dimensions, false otherwise.'),
});
export type AiTagScanForCoilLoggingOutput = z.infer<typeof AiTagScanForCoilLoggingOutputSchema>;

const extractCoilDetailsPrompt = ai.definePrompt({
  name: 'extractCoilDetailsPrompt',
  input: { schema: AiTagScanForCoilLoggingInputSchema.omit({
    predefinedCoilWidth: true, predefinedCoilThickness: true
  }) },
  output: { schema: ExtractCoilDetailsPromptOutputSchema },
  prompt: `You are an expert assistant for reading industrial packing tags.

Carefully analyze the provided image of a coil packing tag.

Your task is to extract the following information:
1. The net weight of the coil.
2. The width of the coil.
3. The thickness of the coil.

Ensure that the extracted values are precise and in numerical format.

Photo of packing tag: {{media url=tagPhotoDataUri}}`,
});

const aiTagScanForCoilLoggingFlow = ai.defineFlow(
  {
    name: 'aiTagScanForCoilLoggingFlow',
    inputSchema: AiTagScanForCoilLoggingInputSchema,
    outputSchema: AiTagScanForCoilLoggingOutputSchema,
  },
  async (input) => {
    const { tagPhotoDataUri, predefinedCoilWidth, predefinedCoilThickness } = input;

    const { output: extractedDetails } = await extractCoilDetailsPrompt({
      tagPhotoDataUri,
    });

    if (!extractedDetails) {
      throw new Error('Failed to extract coil details from the tag.');
    }

    const { netWeight, coilWidth, coilThickness } = extractedDetails;

    let isValid = false;
    let validationMessage = '';

    if (coilWidth === predefinedCoilWidth && coilThickness === predefinedCoilThickness) {
      isValid = true;
      validationMessage = `Coil dimensions (Width: ${coilWidth}, Thickness: ${coilThickness}) match predefined specifications.`;
    } else {
      isValid = false;
      validationMessage = `Coil dimensions do not match predefined specifications. Extracted: (Width: ${coilWidth}, Thickness: ${coilThickness}), Expected: (Width: ${predefinedCoilWidth}, Thickness: ${predefinedCoilThickness}).`;
    }

    return {
      netWeight,
      coilWidth,
      coilThickness,
      validationMessage,
      isValid,
    };
  }
);

export async function aiTagScanForCoilLogging(
  input: AiTagScanForCoilLoggingInput
): Promise<AiTagScanForCoilLoggingOutput> {
  return aiTagScanForCoilLoggingFlow(input);
}
