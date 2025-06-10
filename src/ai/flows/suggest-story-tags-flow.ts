
'use server';
/**
 * @fileOverview A Genkit flow for suggesting relevant tags for a travel story.
 *
 * - suggestStoryTags - A function that takes story title and content, and returns suggested tags.
 * - SuggestStoryTagsInput - The input type for the suggestStoryTags function.
 * - SuggestStoryTagsOutput - The return type for the suggestStoryTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestStoryTagsInputSchema = z.object({
  title: z.string().describe('The title of the travel story.'),
  contentPreview: z
    .string()
    .describe('A preview of the story content (e.g., first 500 characters) to help generate relevant tags.'),
});
export type SuggestStoryTagsInput = z.infer<
  typeof SuggestStoryTagsInputSchema
>;

const SuggestStoryTagsOutputSchema = z.object({
  suggestedTags: z
    .array(z.string())
    .describe(
      'An array of 3-5 relevant, concise tags for the travel story. Tags should be lowercase and can be multi-word if appropriate (e.g., "solo travel").'
    ),
});
export type SuggestStoryTagsOutput = z.infer<
  typeof SuggestStoryTagsOutputSchema
>;

export async function suggestStoryTags(
  input: SuggestStoryTagsInput
): Promise<SuggestStoryTagsOutput> {
  return suggestStoryTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStoryTagsPrompt',
  input: {schema: SuggestStoryTagsInputSchema},
  output: {schema: SuggestStoryTagsOutputSchema},
  prompt: `You are an expert travel blog editor. Based on the following story title and content preview, suggest 3-5 relevant, concise, and common travel blog tags.
Tags should be lowercase. Examples: "himalayas", "trekking", "adventure", "solo travel", "cultural immersion", "uttarakhand", "food journey".

Story Title: {{{title}}}
Content Preview: {{{contentPreview}}}

Provide your suggested tags in the specified output format.`,
});

const suggestStoryTagsFlow = ai.defineFlow(
  {
    name: 'suggestStoryTagsFlow',
    inputSchema: SuggestStoryTagsInputSchema,
    outputSchema: SuggestStoryTagsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    // Ensure we always return an array, even if the LLM fails to produce one.
    if (output && Array.isArray(output.suggestedTags)) {
      return { suggestedTags: output.suggestedTags.map(tag => tag.toLowerCase()) };
    }
    return { suggestedTags: [] };
  }
);
