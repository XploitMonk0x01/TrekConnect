'use server'

import type { WeatherInfo, WeatherForecastDay } from '@/lib/types'

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'

interface OpenWeatherCurrentResponse {
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  name: string
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number
    main: {
      temp_min: number
      temp_max: number
    }
    weather: Array<{
      main: string
      description: string
      icon: string
    }>
  }>
}

function kelvinToCelsius(kelvin: number): string {
  return `${Math.round(kelvin - 273.15)}°C`
}

function getWeatherCondition(weatherMain: string): string {
  const conditions: Record<string, string> = {
    Clear: 'Clear Sky',
    Clouds: 'Partly Cloudy',
    Rain: 'Rain',
    Drizzle: 'Light Rain',
    Thunderstorm: 'Thunderstorm',
    Snow: 'Snow',
    Mist: 'Mist',
    Smoke: 'Hazy',
    Haze: 'Hazy',
    Dust: 'Dusty',
    Fog: 'Foggy',
    Sand: 'Sandy',
    Ash: 'Ash',
    Squall: 'Windy',
    Tornado: 'Tornado',
  }
  return conditions[weatherMain] || weatherMain
}

export async function getWeatherByCoordinates(
  lat: number,
  lon: number
): Promise<WeatherInfo> {
  if (!OPENWEATHER_API_KEY) {
    console.warn(
      'OpenWeather API key is not configured. Using fallback weather data.'
    )
    return getFallbackWeather()
  }

  try {
    // Get current weather
    const currentResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    )

    if (!currentResponse.ok) {
      console.error('Failed to fetch current weather:', currentResponse.status)
      return getFallbackWeather()
    }

    const currentData: OpenWeatherCurrentResponse = await currentResponse.json()

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    )

    let forecast: WeatherForecastDay[] = []
    if (forecastResponse.ok) {
      const forecastData: OpenWeatherForecastResponse =
        await forecastResponse.json()

      // Group forecast by day and get daily min/max
      const dailyForecasts = new Map<
        string,
        {
          minTemp: number
          maxTemp: number
          conditions: string[]
          icons: string[]
        }
      >()

      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0]
        const existing = dailyForecasts.get(date) || {
          minTemp: Infinity,
          maxTemp: -Infinity,
          conditions: [],
          icons: [],
        }

        dailyForecasts.set(date, {
          minTemp: Math.min(existing.minTemp, item.main.temp_min),
          maxTemp: Math.max(existing.maxTemp, item.main.temp_max),
          conditions: [...existing.conditions, item.weather[0].main],
          icons: [...existing.icons, item.weather[0].icon],
        })
      })

      // Convert to WeatherForecastDay format (next 5 days)
      const today = new Date()
      forecast = Array.from(dailyForecasts.entries())
        .slice(1, 6) // Skip today, get next 5 days
        .map(([date, data]) => {
          const mostCommonCondition = data.conditions.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const dominantCondition = Object.entries(mostCommonCondition).sort(
            ([, a], [, b]) => b - a
          )[0][0]

          const dominantIcon =
            data.icons.find((icon) =>
              icon.includes(dominantCondition.toLowerCase().slice(0, 3))
            ) || data.icons[0]

          return {
            date: new Date(date).toISOString(),
            minTemp: kelvinToCelsius(data.minTemp),
            maxTemp: kelvinToCelsius(data.maxTemp),
            condition: getWeatherCondition(dominantCondition),
            iconCode: dominantIcon,
          }
        })
    }

    return {
      temperature: kelvinToCelsius(currentData.main.temp),
      condition: getWeatherCondition(currentData.weather[0].main),
      iconCode: currentData.weather[0].icon,
      forecast,
    }
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return getFallbackWeather()
  }
}

export async function getWeatherByCity(city: string): Promise<WeatherInfo> {
  if (!OPENWEATHER_API_KEY) {
    console.warn(
      'OpenWeather API key is not configured. Using fallback weather data.'
    )
    return getFallbackWeather()
  }

  try {
    // Get current weather by city name
    const currentResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(
        city
      )}&appid=${OPENWEATHER_API_KEY}`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    )

    if (!currentResponse.ok) {
      console.error(
        'Failed to fetch current weather for city:',
        currentResponse.status
      )
      return getFallbackWeather()
    }

    const currentData: OpenWeatherCurrentResponse = await currentResponse.json()

    // Get 5-day forecast by city name
    const forecastResponse = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?q=${encodeURIComponent(
        city
      )}&appid=${OPENWEATHER_API_KEY}`,
      {
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    )

    let forecast: WeatherForecastDay[] = []
    if (forecastResponse.ok) {
      const forecastData: OpenWeatherForecastResponse =
        await forecastResponse.json()

      // Group forecast by day and get daily min/max
      const dailyForecasts = new Map<
        string,
        {
          minTemp: number
          maxTemp: number
          conditions: string[]
          icons: string[]
        }
      >()

      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0]
        const existing = dailyForecasts.get(date) || {
          minTemp: Infinity,
          maxTemp: -Infinity,
          conditions: [],
          icons: [],
        }

        dailyForecasts.set(date, {
          minTemp: Math.min(existing.minTemp, item.main.temp_min),
          maxTemp: Math.max(existing.maxTemp, item.main.temp_max),
          conditions: [...existing.conditions, item.weather[0].main],
          icons: [...existing.icons, item.weather[0].icon],
        })
      })

      // Convert to WeatherForecastDay format (next 5 days)
      const today = new Date()
      forecast = Array.from(dailyForecasts.entries())
        .slice(1, 6) // Skip today, get next 5 days
        .map(([date, data]) => {
          const mostCommonCondition = data.conditions.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1
            return acc
          }, {} as Record<string, number>)

          const dominantCondition = Object.entries(mostCommonCondition).sort(
            ([, a], [, b]) => b - a
          )[0][0]

          const dominantIcon =
            data.icons.find((icon) =>
              icon.includes(dominantCondition.toLowerCase().slice(0, 3))
            ) || data.icons[0]

          return {
            date: new Date(date).toISOString(),
            minTemp: kelvinToCelsius(data.minTemp),
            maxTemp: kelvinToCelsius(data.maxTemp),
            condition: getWeatherCondition(dominantCondition),
            iconCode: dominantIcon,
          }
        })
    }

    return {
      temperature: kelvinToCelsius(currentData.main.temp),
      condition: getWeatherCondition(currentData.weather[0].main),
      iconCode: currentData.weather[0].icon,
      forecast,
    }
  } catch (error) {
    console.error('Error fetching weather data for city:', error)
    return getFallbackWeather()
  }
}

function getFallbackWeather(): WeatherInfo {
  return {
    temperature: '22°C',
    condition: 'Partly Cloudy',
    iconCode: '02d',
    forecast: [
      {
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        minTemp: '18°C',
        maxTemp: '25°C',
        condition: 'Sunny',
        iconCode: '01d',
      },
      {
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        minTemp: '16°C',
        maxTemp: '23°C',
        condition: 'Partly Cloudy',
        iconCode: '02d',
      },
      {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        minTemp: '15°C',
        maxTemp: '22°C',
        condition: 'Light Rain',
        iconCode: '10d',
      },
      {
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        minTemp: '17°C',
        maxTemp: '24°C',
        condition: 'Clear Sky',
        iconCode: '01d',
      },
      {
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        minTemp: '19°C',
        maxTemp: '26°C',
        condition: 'Sunny',
        iconCode: '01d',
      },
    ],
  }
}
