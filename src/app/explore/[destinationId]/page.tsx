
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WeatherInfo, Destination } from '@/lib/types'
import { getDestinationById } from '@/services/destinations'
import DestinationDetailClientContent from './DestinationDetailClientContent'

export default async function DestinationDetailPage({
  params,
}: {
  params: { destinationId: string }
}) {
  let destination: Destination | null = null
  let error: string | null = null
  let weatherInfo: WeatherInfo | null = null

  const destinationId = params.destinationId

  try {
    destination = await getDestinationById(destinationId)
    if (destination?.coordinates?.lat && destination?.coordinates?.lng) {
      // Use Gemini for weather
      // weatherInfo = await getWeatherFromGemini(
      //   destination.name,
      //   destination.coordinates.lat,
      //   destination.coordinates.lng
      // )
    }
  } catch (err) {
    console.error('Error fetching destination or weather:', err)
    error = 'Failed to load destination details'
  }

  if (error || !destination) {
    return (
      <div className="container mx-auto max-w-7xl flex flex-col items-center justify-center h-full text-center p-6">
        <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="text-muted-foreground">
          {error ||
            `The trek details for ID (${destinationId}) could not be loaded. It might not exist or there was an issue fetching it.`}
        </p>
        <Button asChild className="mt-4">
          <Link href="/explore">Back to Explore</Link>
        </Button>
      </div>
    )
  }

  // Provide a fallback WeatherInfo if weatherInfo is null
  const fallbackWeather: WeatherInfo = {
    temperature: '--',
    condition: 'Unavailable',
    iconCode: '01d',
    forecast: [],
  }

  return (
    <DestinationDetailClientContent
      initialDestination={destination}
      mockWeather={weatherInfo || fallbackWeather}
    />
  )
}
