
'use server';
/**
 * @fileOverview A Genkit flow for generating an image of a trek destination.
 *
 * - generateTrekImage - A function that takes a destination name and description, and returns an image data URI.
 * - GenerateTrekImageInput - The input type for the generateTrekImage function.
 * - GenerateTrekImageOutput - The return type for the generateTrekImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTrekImageInputSchema = z.object({
  destinationName: z.string().describe('The name of the trek destination.'),
  destinationDescription: z
    .string()
    .describe('A brief description of the trek destination to guide image generation.'),
});
export type GenerateTrekImageInput = z.infer<
  typeof GenerateTrekImageInputSchema
>;

const GenerateTrekImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI. Format: 'data:image/png;base64,<encoded_data>'."
    ),
});
export type GenerateTrekImageOutput = z.infer<
  typeof GenerateTrekImageOutputSchema
>;

export async function generateTrekImage(
  input: GenerateTrekImageInput
): Promise<GenerateTrekImageOutput> {
  return generateTrekImageFlow(input);
}

const generateTrekImageFlow = ai.defineFlow(
  {
    name: 'generateTrekImageFlow',
    inputSchema: GenerateTrekImageInputSchema,
    outputSchema: GenerateTrekImageOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: `Generate a captivating and scenic image representing the trek destination: "${input.destinationName}". 
      Consider the following description for inspiration: "${input.destinationDescription}". 
      Focus on landscapes, mountains, trails, or iconic views typical of such a trek. Avoid text or people unless specifically part of an iconic landmark.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include both
         safetySettings: [ // Relax safety settings for more creative outputs if needed, be mindful of policies
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or did not return a media URL.');
    }
    
    return {imageDataUri: media.url};
  }
);

    