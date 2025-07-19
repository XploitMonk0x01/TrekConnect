import type { WeatherInfo } from '@/lib/types'
import { getCache, setCache } from '@/lib/cache'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

async function getOpenMeteoWeather(
  latitude: number,
  longitude: number
): Promise<WeatherInfo | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const data = await response.json()
    return {
      temperature: `${Math.round(data.current.temperature_2m)}°C`,
      condition: getWeatherConditionFromCode(data.current.weather_code),
      iconCode: data.current.weather_code.toString(),
      forecast: data.daily.time.slice(1, 3).map((date: string, i: number) => ({
        date,
        minTemp: `${Math.round(data.daily.temperature_2m_min[i + 1])}°C`,
        maxTemp: `${Math.round(data.daily.temperature_2m_max[i + 1])}°C`,
        condition: getWeatherConditionFromCode(data.daily.weather_code[i + 1]),
        iconCode: data.daily.weather_code[i + 1].toString(),
      })),
    }
  } catch (error) {
    console.error('Open-Meteo error:', error)
    return null
  }
}

async function getWeatherFromGoogleSearch(
  destinationName: string
): Promise<WeatherInfo | null> {
  // This is a placeholder for a more robust scraping solution
  // as direct Google searches from the backend are unreliable.
  console.log(
    `Placeholder: Would perform a Google search for "weather in ${destinationName}"`
  )
  return null
}

function getFallbackWeather(): WeatherInfo {
  return {
    temperature: '--',
    condition: 'Weather data not available',
    iconCode: '01d',
    forecast: [],
  }
}

export async function getWeather(
  destinationName: string,
  latitude: number,
  longitude: number
): Promise<WeatherInfo> {
  const cacheKey = `weather-${destinationName}-${latitude}-${longitude}`
  const cachedWeather = getCache<WeatherInfo>(cacheKey)
  if (cachedWeather) {
    return cachedWeather
  }

  // 1. Try Open-Meteo first
  const openMeteoData = await getOpenMeteoWeather(latitude, longitude)
  if (openMeteoData) {
    setCache(cacheKey, openMeteoData)
    return openMeteoData
  }

  // 2. Fallback to Gemini
  if (GEMINI_API_KEY) {
    const prompt = `Give me the current weather and a 2-day forecast for ${destinationName} (lat: ${latitude}, lon: ${longitude}) in JSON format with keys: temperature, condition, iconCode, forecast (array of {date, minTemp, maxTemp, condition, iconCode}). Use Celsius and short weather codes. Ensure the temperature values are strings ending in '°C'. For dates, use YYYY-MM-DD format.`
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const match = text.match(/```json([\s\S]*?)```/)
        const jsonStr = match ? match[1] : text
        const weatherJson = JSON.parse(jsonStr)
        if (weatherJson.temperature && weatherJson.condition) {
          setCache(cacheKey, weatherJson)
          return weatherJson
        }
      }
    } catch (error) {
      console.error(`Gemini weather error for ${destinationName}:`, error)
    }
  }

  // 3. Fallback to Google Search (placeholder)
  const googleSearchData = await getWeatherFromGoogleSearch(destinationName)
  if (googleSearchData) {
    setCache(cacheKey, googleSearchData)
    return googleSearchData
  }

  // 4. Final fallback
  return getFallbackWeather()
}

function getWeatherConditionFromCode(code: number): string {
  const conditions: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  }
  return conditions[code] || 'Unknown'
}

