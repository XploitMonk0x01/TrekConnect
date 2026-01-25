import { NextRequest, NextResponse } from 'next/server'
import { groq, DEFAULT_ROUTE_PLANNING_MODEL } from '@/lib/groq'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteRequest {
  destinationName: string
  durationDays: number
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Expert'
  specificInterests?: string
}

interface DailyPlan {
  day: number
  title: string
  routeDescription: string
  altitude?: string
  highlights: string[]
}

interface RouteResponse {
  routeName: string
  overview: string
  suggestedDurationDays: number
  difficultyRating: string
  bestSeason?: string
  dailyItinerary: DailyPlan[]
  preparationNotes?: string[]
  gearSuggestions?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json()
    const { destinationName, durationDays, difficulty, specificInterests } =
      body

    // Validate input
    if (!destinationName || !durationDays || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the prompt for route generation
    const systemPrompt = `You are an expert trek route planner specializing in creating detailed and engaging itineraries for treks in the Indian Himalayas.

Your task is to generate a comprehensive trek plan based on user inputs. The output must be a valid JSON object with the following structure:

{
  "routeName": "A creative and suggestive name for the trek (e.g., 'The Celestial Lakes Circuit')",
  "overview": "A brief 2-3 sentence compelling overview of the trek",
  "suggestedDurationDays": number (matching the number of days in dailyItinerary),
  "difficultyRating": "string (e.g., 'Moderate with some challenging sections')",
  "bestSeason": "Recommended months (e.g., 'May to June and September to October')",
  "dailyItinerary": [
    {
      "day": number,
      "title": "Short engaging title for the day",
      "routeDescription": "Detailed plan including start/end points, landmarks, distance, and time",
      "altitude": "Approximate altitude (optional, e.g., '2,438m')",
      "highlights": ["Key highlight 1", "Key highlight 2"]
    }
  ],
  "preparationNotes": ["Important preparation note 1", "Note 2"],
  "gearSuggestions": ["Essential gear item 1", "Item 2", "Item 3"]
}

Focus on creating realistic and appealing trek plans within the Indian Himalayan context (Uttarakhand, Himachal, Ladakh, Sikkim). Include practical details like permits, acclimatization, and local context.

IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.`

    const userPrompt = `Generate a custom trek route with these specifications:

Destination/Area: ${destinationName}
Duration: ${durationDays} days
Difficulty Level: ${difficulty}
${specificInterests ? `Specific Interests: ${specificInterests}` : ''}

Create a detailed day-by-day itinerary that matches the duration specified. Ensure the dailyItinerary array has exactly ${durationDays} entries.`

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      model: DEFAULT_ROUTE_PLANNING_MODEL,
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    })

    const responseContent = chatCompletion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response from Groq API')
    }

    // Parse the JSON response
    const routeData: RouteResponse = JSON.parse(responseContent)

    // Validate the response has required fields
    if (
      !routeData.routeName ||
      !routeData.overview ||
      !routeData.dailyItinerary ||
      routeData.dailyItinerary.length === 0
    ) {
      throw new Error('Invalid response structure from AI')
    }

    return NextResponse.json(routeData)
  } catch (error) {
    console.error('Error generating route with Groq:', error)

    // Check if it's a parsing error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate trek route',
      },
      { status: 500 }
    )
  }
}
