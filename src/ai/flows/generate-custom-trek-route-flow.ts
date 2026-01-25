'use server'
/**
 * @fileOverview A Genkit flow for generating custom trek routes.
 *
 * - generateCustomTrekRoute - A function that takes user preferences and returns a detailed trek plan.
 * - GenerateCustomTrekRouteInput - The input type for the flow.
 * - GenerateCustomTrekRouteOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit'
import { z } from 'genkit'

const GenerateCustomTrekRouteInputSchema = z.object({
  destinationName: z
    .string()
    .describe(
      'The general area, starting point, or a known trek name to base the custom route on (e.g., "Manali region", "Sankri for Kedarkantha", "Roopkund area", "Valley of Flowers"). This provides context for the AI.'
    ),
  durationDays: z
    .number()
    .min(1)
    .max(30)
    .describe(
      'Desired duration of the trek in days. The AI may adjust this slightly for a feasible plan.'
    ),
  difficulty: z
    .enum(['Easy', 'Moderate', 'Challenging', 'Expert'])
    .describe('Preferred difficulty level of the trek.'),
  specificInterests: z
    .string()
    .optional()
    .describe(
      'Optional specific interests or preferences to guide route generation, e.g., "alpine lakes", "panoramic views", "less crowded trails", "photography focused", "cultural immersion", "want to see specific peaks like Trishul".'
    ),
})
export type GenerateCustomTrekRouteInput = z.infer<
  typeof GenerateCustomTrekRouteInputSchema
>

const DailyPlanSchema = z.object({
  day: z.number().describe('The day number of the itinerary (e.g., 1, 2, 3).'),
  title: z
    .string()
    .describe(
      'A short, engaging title for the day, e.g., "Arrival in Leh & Acclimatization" or "Trek from Govindghat to Ghangaria".'
    ),
  routeDescription: z
    .string()
    .describe(
      "Detailed plan for the day, including start and end points, key villages or landmarks passed, and approximate trekking time or distance. Example: 'Trek from Sari village to Deoriatal (2.5 km, approx 2-3 hours). Gradual ascent through rhododendron forests.'"
    ),
  altitude: z
    .string()
    .optional()
    .describe(
      'Approximate altitude of the campsite or key points reached during the day (e.g., "Deoriatal: 2,438m").'
    ),
  highlights: z
    .array(z.string())
    .min(1)
    .describe(
      'List at least one key highlight, activity, or point of interest for the day (e.g., "Reflection of Chaukhamba peaks in Deoriatal", "Visit Hemkund Sahib Gurudwara").'
    ),
})

const GenerateCustomTrekRouteOutputSchema = z.object({
  routeName: z
    .string()
    .describe(
      'A creative and suggestive name for the generated custom trek route (e.g., "The Celestial Lakes Circuit" or "Hidden Valleys of Garhwal").'
    ),
  overview: z
    .string()
    .describe(
      'A brief (2-3 sentences) compelling overview of the entire trek route, highlighting its main appeal.'
    ),
  suggestedDurationDays: z
    .number()
    .describe(
      'The AI suggested duration for the trek in days, which might be adjusted from the user input for a more practical plan.'
    ),
  difficultyRating: z
    .string()
    .describe(
      'The AI\'s assessed difficulty level for the generated route (e.g., "Moderate with some challenging sections").'
    ),
  bestSeason: z
    .string()
    .optional()
    .describe(
      'Recommended best season or months to undertake this specific trek (e.g., "May to June and September to October").'
    ),
  dailyItinerary: z
    .array(DailyPlanSchema)
    .min(1)
    .describe(
      'A day-by-day itinerary. The number of days should match suggestedDurationDays.'
    ),
  preparationNotes: z
    .array(z.string())
    .optional()
    .describe(
      'Important notes for preparation, such as permit requirements, fitness level advised, acclimatization guidelines, or general travel advice for the region. Each note as a separate string.'
    ),
  gearSuggestions: z
    .array(z.string())
    .optional()
    .describe(
      'List of 3-5 key gear items specifically recommended for this trek (e.g., "Sturdy trekking shoes with ankle support", "Sub-zero sleeping bag", "Trekking poles"). Each item as a separate string.'
    ),
})
export type GenerateCustomTrekRouteOutput = z.infer<
  typeof GenerateCustomTrekRouteOutputSchema
>

export async function generateCustomTrekRoute(
  input: GenerateCustomTrekRouteInput
): Promise<GenerateCustomTrekRouteOutput> {
  return generateCustomTrekRouteFlow(input)
}

const prompt = ai.definePrompt({
  name: 'generateCustomTrekRoutePrompt',
  input: { schema: GenerateCustomTrekRouteInputSchema },
  output: { schema: GenerateCustomTrekRouteOutputSchema },
  prompt: `You are an expert trek route planner specializing in creating detailed and engaging itineraries for treks in the Indian Himalayas.
The user wants a custom trek route. Generate a comprehensive plan based on their inputs.

User Inputs:
Destination/Area Context: {{{destinationName}}}
Desired Duration: {{{durationDays}}} days
Preferred Difficulty: {{{difficulty}}}
Specific Interests: {{#if specificInterests}}{{{specificInterests}}}{{else}}None specified{{/if}}

Your Task:
Create a detailed trek itinerary. Ensure the output strictly adheres to the 'GenerateCustomTrekRouteOutputSchema'.
- The 'routeName' should be catchy and relevant.
- 'overview' should be a concise summary.
- 'suggestedDurationDays' can be the same as user input or slightly adjusted if it makes the plan more feasible. It MUST match the number of entries in 'dailyItinerary'.
- 'difficultyRating' should reflect the trek described.
- 'bestSeason' should be practical for Indian Himalayan treks.
- 'dailyItinerary' is crucial:
    - Each day must have a 'day' number, 'title', 'routeDescription', and at least one 'highlight'.
    - 'routeDescription' should be descriptive, including start/end points, and estimated time/distance if possible.
    - 'altitude' is optional but good to include for campsites or important points.
- 'preparationNotes' should provide actionable advice (e.g., "Obtain necessary permits from Forest Department in XYZ.", "Acclimatize for at least one day at the starting point if altitude is high.").
- 'gearSuggestions' should list a few essential items.

Focus on creating a realistic and appealing trek plan within the Indian Himalayan context. If the request is too vague or broad (e.g., "trek in India"), try to narrow it down based on common Indian trekking regions like Uttarakhand, Himachal, Ladakh, Sikkim, or suggest a popular trek that fits the criteria if the destination context is very generic.

Example of a good daily plan:
Day 3: Trek to Chomrong (2170m)
Route: From Sinuwa, descend to Chomrong Khola, then climb steeply to Chomrong village. Approx 4-5 hours.
Highlights: Beautiful views of Annapurna South and Hiunchuli. Experience Gurung culture in Chomrong.

Provide the output in the specified JSON format.
`,
})

const generateCustomTrekRouteFlow = ai.defineFlow(
  {
    name: 'generateCustomTrekRouteFlow',
    inputSchema: GenerateCustomTrekRouteInputSchema,
    outputSchema: GenerateCustomTrekRouteOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input)
      if (!output) {
        throw new Error(
          'AI failed to generate a trek route. The output was empty.'
        )
      }
      // Basic validation: Ensure the number of itinerary days matches the suggested duration.
      if (output.dailyItinerary.length !== output.suggestedDurationDays) {
        // Attempt to correct or provide a more robust fallback if critical
        console.warn(
          `AI Warning: Mismatch between suggestedDurationDays (${output.suggestedDurationDays}) and actual itinerary days (${output.dailyItinerary.length}). Adjusting suggestedDurationDays.`
        )
        output.suggestedDurationDays = output.dailyItinerary.length
        if (output.dailyItinerary.length === 0 && input.durationDays > 0) {
          // If AI completely failed to generate itinerary items, this is a more critical failure
          throw new Error(
            'AI generated an empty daily itinerary. Please try refining your request.'
          )
        }
      }
      return output
    } catch (error: any) {
      if (
        error.status === 429 ||
        (error.message && error.message.includes('429'))
      ) {
        throw new Error(
          'AI service is currently busy or quota exceeded. Please try again later.'
        )
      }
      throw error
    }
  }
)
