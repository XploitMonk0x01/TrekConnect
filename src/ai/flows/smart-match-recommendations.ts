'use server'
/**
 * @fileOverview This file defines a Genkit flow for providing smart travel match recommendations.
 *
 * - getSmartMatchRecommendations - A function that retrieves smart match recommendations for a user.
 * - SmartMatchRecommendationsInput - The input type for the getSmartMatchRecommendations function.
 * - SmartMatchRecommendationsOutput - The return type for the getSmartMatchRecommendations function.
 */

import { ai } from '@/ai/genkit'
import { z } from 'genkit'

const SmartMatchRecommendationsInputSchema = z.object({
  userProfile: z
    .object({
      name: z.string().describe("The user's name."),
      age: z.number().describe("The user's age."),
      gender: z.string().describe("The user's gender."),
      travelPreferences: z
        .object({
          soloOrGroup: z
            .string()
            .describe('Preference for solo or group travel.'),
          budget: z.string().describe('Budget level (e.g., budget, luxury).'),
        })
        .describe("The user's travel preferences."),
      languagesSpoken: z
        .array(z.string())
        .describe('List of languages spoken by the user.'),
      trekkingExperience: z
        .string()
        .describe("The user's trekking experience level."),
      wishlistDestinations: z
        .array(z.string())
        .describe("List of destinations on the user's wishlist."),
      travelHistory: z
        .array(z.string())
        .describe('List of places the user has visited.'),
    })
    .describe('The user profile details.'),
  currentDestination: z
    .string()
    .optional()
    .describe('The destination the user is currently planning to visit.'),
})
export type SmartMatchRecommendationsInput = z.infer<
  typeof SmartMatchRecommendationsInputSchema
>

const SmartMatchRecommendationsOutputSchema = z.object({
  recommendedMatches: z
    .array(
      z.object({
        name: z.string().describe("The recommended match's name."),
        age: z.number().describe("The recommended match's age."),
        gender: z.string().describe("The recommended match's gender."),
        travelPreferences: z
          .object({
            soloOrGroup: z
              .string()
              .describe('Preference for solo or group travel.'),
            budget: z.string().describe('Budget level (e.g., budget, luxury).'),
          })
          .describe("The recommended match's travel preferences."),
        languagesSpoken: z
          .array(z.string())
          .describe('List of languages spoken by the recommended match.'),
        trekkingExperience: z
          .string()
          .describe("The recommended match's trekking experience level."),
        matchScore: z
          .number()
          .describe('A score indicating how well the match aligns.'),
        reason: z
          .string()
          .describe('Why this match was recommended for the user.'),
      })
    )
    .describe('A list of recommended travel matches for the user.'),
  recommendedDestinations: z
    .array(z.string())
    .describe(
      'A list of destinations recommended to the user based on their profile and history.'
    ),
})
export type SmartMatchRecommendationsOutput = z.infer<
  typeof SmartMatchRecommendationsOutputSchema
>

export async function getSmartMatchRecommendations(
  input: SmartMatchRecommendationsInput
): Promise<SmartMatchRecommendationsOutput> {
  return smartMatchRecommendationsFlow(input)
}

const smartMatchRecommendationsPrompt = ai.definePrompt({
  name: 'smartMatchRecommendationsPrompt',
  input: { schema: SmartMatchRecommendationsInputSchema },
  output: { schema: SmartMatchRecommendationsOutputSchema },
  prompt: `You are an AI travel assistant that specializes in connecting travelers with like-minded individuals.

  Based on the user's profile and travel history, provide recommendations for potential travel matches and destinations.

  User Profile:
  Name: {{{userProfile.name}}}
  Age: {{{userProfile.age}}}
  Gender: {{{userProfile.gender}}}
  Travel Preferences: {{{userProfile.travelPreferences.soloOrGroup}}}, {{{userProfile.travelPreferences.budget}}}
  Languages Spoken: {{#each userProfile.languagesSpoken}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Trekking Experience: {{{userProfile.trekkingExperience}}}
  Wishlist Destinations: {{#each userProfile.wishlistDestinations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Travel History: {{#each userProfile.travelHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Current Destination: {{{currentDestination}}}

  Provide a list of recommended travel matches, including their name, age, gender, travel preferences, languages spoken, trekking experience, a match score (out of 100) indicating how well the match aligns with the user, and a brief explanation of why they were recommended. Also suggest some destinations the user may be interested in.
  `,
})

const smartMatchRecommendationsFlow = ai.defineFlow(
  {
    name: 'smartMatchRecommendationsFlow',
    inputSchema: SmartMatchRecommendationsInputSchema,
    outputSchema: SmartMatchRecommendationsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await smartMatchRecommendationsPrompt(input)
      return output!
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
