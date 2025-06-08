
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting travel destinations based on user preferences and past travel experiences.
 *
 * The flow takes user preferences and travel history as input and uses an LLM to suggest destinations.
 * It exports:
 *   - suggestTravelDestinations: The main function to trigger the flow.
 *   - SuggestTravelDestinationsInput: The input type for the suggestTravelDestinations function.
 *   - SuggestTravelDestinationsOutput: The output type for the suggestTravelDestinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTravelDestinationsInputSchema = z.object({
  preferences: z
    .string()
    .describe('The user travel preferences, such as preferred activities, budget, and travel style.'),
  travelHistory: z
    .string()
    .describe('The user past travel experiences, including destinations visited and activities enjoyed.'),
});

export type SuggestTravelDestinationsInput = z.infer<
  typeof SuggestTravelDestinationsInputSchema
>;

const SuggestTravelDestinationsOutputSchema = z.object({
  suggestedDestinations: z
    .string()
    .describe('A list of suggested travel destinations based on the user preferences and travel history.'),
});

export type SuggestTravelDestinationsOutput = z.infer<
  typeof SuggestTravelDestinationsOutputSchema
>;

export async function suggestTravelDestinations(
  input: SuggestTravelDestinationsInput
): Promise<SuggestTravelDestinationsOutput> {
  return suggestTravelDestinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTravelDestinationsPrompt',
  input: {schema: SuggestTravelDestinationsInputSchema},
  output: {schema: SuggestTravelDestinationsOutputSchema},
  prompt: `Based on the user's travel preferences and past experiences, suggest a list of travel destinations.

Travel Preferences: {{{preferences}}}
Travel History: {{{travelHistory}}}

Suggested Destinations:`,
});

const suggestTravelDestinationsFlow = ai.defineFlow(
  {
    name: 'suggestTravelDestinationsFlow',
    inputSchema: SuggestTravelDestinationsInputSchema,
    outputSchema: SuggestTravelDestinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
