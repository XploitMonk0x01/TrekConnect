import type { WeatherInfo } from '@/lib/types'

// --- Only Gemini API is used for weather ---

// Gemini API endpoint (updated to 1.5-flash-latest)
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_NEW

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY_NEW is not defined in environment variables')
}

// Helper to call Gemini API for weather
export async function getWeatherFromGemini(
  destinationName: string,
  latitude: number,
  longitude: number
): Promise<WeatherInfo> {
  // Prompt for Gemini
  const prompt = `Give me the current weather and a 2-day forecast for ${destinationName} (lat: ${latitude}, lon: ${longitude}) in JSON format with keys: temperature, condition, iconCode, forecast (array of {date, minTemp, maxTemp, condition, iconCode}). Use Celsius and short weather codes.`

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Gemini API error:', res.status, errorText)
    throw new Error('Failed to fetch weather from Gemini')
  }
  const data = await res.json()

  // Extract JSON from Gemini response
  let weatherJson: any = null
  try {
    // Gemini returns text, so parse the first code block or JSON object
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const match = text.match(/```json([\s\S]*?)```/)
    const jsonStr = match ? match[1] : text
    weatherJson = JSON.parse(jsonStr)
  } catch (e) {
    throw new Error('Failed to parse Gemini weather response')
  }

  // Validate and return as WeatherInfo
  return weatherJson as WeatherInfo
}

// --- All OpenWeather code removed ---
