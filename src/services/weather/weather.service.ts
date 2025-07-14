import type { WeatherInfo } from '@/lib/types'

// --- Only Gemini API is used for weather ---

// Gemini API endpoint
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// Standardized API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

function getFallbackWeather(): WeatherInfo {
  return {
    temperature: '--',
    condition: 'Unavailable',
    iconCode: '01d', // Default sunny icon
    forecast: [],
  }
}

// Helper to call Gemini API for weather
export async function getWeatherFromGemini(
  destinationName: string,
  latitude: number,
  longitude: number
): Promise<WeatherInfo> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not defined. Using fallback weather.');
    return getFallbackWeather();
  }
  // Prompt for Gemini
  const prompt = `Give me the current weather and a 2-day forecast for ${destinationName} (lat: ${latitude}, lon: ${longitude}) in JSON format with keys: temperature, condition, iconCode, forecast (array of {date, minTemp, maxTemp, condition, iconCode}). Use Celsius and short weather codes. Ensure the temperature values are strings ending in '°C'. For dates, use YYYY-MM-DD format.`

  try {
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
      throw new Error(`Failed to fetch weather from Gemini: ${res.statusText}`)
    }
    const data = await res.json()

    // Extract JSON from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    if (!text) {
        throw new Error('Gemini response is empty.');
    }
    const match = text.match(/```json([\s\S]*?)```/)
    const jsonStr = match ? match[1] : text
    
    const weatherJson = JSON.parse(jsonStr)
    
    // Basic validation to ensure it looks like our WeatherInfo object
    if (!weatherJson.temperature || !weatherJson.condition) {
        throw new Error('Parsed JSON from Gemini is missing required weather fields.');
    }

    // Validate and return as WeatherInfo
    return weatherJson as WeatherInfo

  } catch (error) {
    console.error(`Error processing Gemini weather for ${destinationName}:`, error);
    // Return a fallback so the entire page doesn't crash
    return getFallbackWeather();
  }
}

// --- All OpenWeather code removed ---
