'use server';
/**
 * @fileOverview This file contains the Genkit flow for AI material type recognition.
 * It classifies a material tag image as either 'coil' or 'CTL'.
 *
 * - aiMaterialTypeRecognition - A function that handles the material type recognition process.
 * - AiMaterialTypeRecognitionInput - The input type for the aiMaterialTypeRecognition function.
 * - AiMaterialTypeRecognitionOutput - The return type for the aiMaterialTypeRecognition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiMaterialTypeRecognitionInputSchema = z.object({
  tagImageDataUri: z
    .string()
    .describe(
      "A photo of a material tag, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiMaterialTypeRecognitionInput = z.infer<
  typeof AiMaterialTypeRecognitionInputSchema
>;

const AiMaterialTypeRecognitionOutputSchema = z.object({
  materialType: z.enum(['coil', 'CTL']).describe("The classified material type, either 'coil' or 'CTL'."),
});
export type AiMaterialTypeRecognitionOutput = z.infer<
  typeof AiMaterialTypeRecognitionOutputSchema
>;

export async function aiMaterialTypeRecognition(
  input: AiMaterialTypeRecognitionInput
): Promise<AiMaterialTypeRecognitionOutput> {
  return aiMaterialTypeRecognitionFlow(input);
}

const classifyMaterialTagPrompt = ai.definePrompt({
  name: 'classifyMaterialTagPrompt',
  input: {schema: AiMaterialTypeRecognitionInputSchema},
  output: {schema: AiMaterialTypeRecognitionOutputSchema},
  prompt: `You are an expert in steel manufacturing and material classification.
Your task is to analyze the provided image of a material tag and determine if it belongs to a raw 'coil' or a 'cut-to-length' (CTL) piece.
Examine the tag for any identifiers, dimensions, or descriptions that would distinguish between a large raw coil and a finished, cut-to-length sheet or plate.
Your response MUST be one of two values: 'coil' or 'CTL'. Do not provide any additional text or explanation.

Image of material tag: {{media url=tagImageDataUri}}`,
});

const aiMaterialTypeRecognitionFlow = ai.defineFlow(
  {
    name: 'aiMaterialTypeRecognitionFlow',
    inputSchema: AiMaterialTypeRecognitionInputSchema,
    outputSchema: AiMaterialTypeRecognitionOutputSchema,
  },
  async input => {
    const {output} = await classifyMaterialTagPrompt(input);
    if (!output) {
      throw new Error('Failed to classify material type.');
    }
    return output;
  }
);
