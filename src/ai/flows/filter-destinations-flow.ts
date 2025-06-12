
'use server';
/**
 * @fileOverview A Genkit flow for filtering trek destinations based on a natural language query.
 *
 * - filterDestinationsFlow - A function that takes a user query and a list of destinations,
 *                            and returns an ordered list of relevant destination IDs.
 * - FilterDestinationsInput - The input type for the flow.
 * - FilterDestinationsOutput - The return type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Simplified Destination schema for AI processing (to manage token count)
const DestinationInfoSchema = z.object({
  id: z.string().describe('Unique identifier for the destination.'),
  name: z.string().describe('Name of the trek destination.'),
  description: z.string().describe('A brief description of the trek destination.'),
  region: z.string().optional().describe('The geographical region of the trek (e.g., Uttarakhand, Ladakh).'),
  travelTips: z.string().optional().describe('Specific travel tips or best season information.'),
  aiHint: z.string().optional().describe('Keywords related to the trek, often used for image generation.'),
});
type DestinationInfo = z.infer<typeof DestinationInfoSchema>;

const FilterDestinationsInputSchema = z.object({
  filterQuery: z.string().describe("The user's natural language query to filter treks (e.g., 'easy winter treks near Manali', 'challenging treks with lake views in June')."),
  destinationsToFilter: z.array(DestinationInfoSchema).min(1).describe('An array of available trek destinations with their key details.'),
});
export type FilterDestinationsInput = z.infer<typeof FilterDestinationsInputSchema>;

const FilterDestinationsOutputSchema = z.object({
  relevantDestinationIds: z.array(z.string()).describe('An array of destination IDs, ordered by relevance to the filter query. Only IDs of matching destinations should be included.'),
  aiExplanation: z.string().optional().describe('A brief explanation from the AI on why these destinations were chosen or if no matches were found.'),
});
export type FilterDestinationsOutput = z.infer<typeof FilterDestinationsOutputSchema>;

export async function filterDestinations(
  input: FilterDestinationsInput
): Promise<FilterDestinationsOutput> {
  return filterDestinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterDestinationsPrompt',
  input: {schema: FilterDestinationsInputSchema},
  output: {schema: FilterDestinationsOutputSchema},
  prompt: `You are an expert Indian Himalayan trek recommender and filter.
The user has provided a natural language query to filter a list of available trek destinations.
Your task is to analyze the query and the provided list of destinations.
Return an ordered list of 'relevantDestinationIds' that best match the user's query. The order should be from most relevant to least relevant.
If no destinations match the query, return an empty array for 'relevantDestinationIds'.
Also, provide a brief 'aiExplanation' for your choices or if no matches were found.

User's Filter Query:
{{{filterQuery}}}

Available Destinations (Key Details):
{{#each destinationsToFilter}}
- ID: {{{this.id}}}, Name: {{{this.name}}}, Region: {{#if this.region}}{{{this.region}}}{{else}}N/A{{/if}}
  Description: {{{this.description}}}
  Travel Tips/Season: {{#if this.travelTips}}{{{this.travelTips}}}{{else}}N/A{{/if}}
  Keywords: {{#if this.aiHint}}{{{this.aiHint}}}{{else}}N/A{{/if}}
{{/each}}

Based on the query and the destination details, determine which destinations are relevant and their order of relevance.
Ensure your output strictly adheres to the 'FilterDestinationsOutputSchema' JSON format.
Focus on matching aspects like location, difficulty implied (e.g., "easy", "challenging"), season, specific features (e.g., "lakes", "views", "winter trek"), etc.
`,
});

const filterDestinationsFlow = ai.defineFlow(
  {
    name: 'filterDestinationsFlow',
    inputSchema: FilterDestinationsInputSchema,
    outputSchema: FilterDestinationsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback if AI provides an empty response, though the schema should guide it.
      return { relevantDestinationIds: [], aiExplanation: "AI could not process the filter request at this time." };
    }
    return output;
  }
);
