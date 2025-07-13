import { getAllDestinations } from '@/services/destinations'
import ExploreClientComponent from './ExploreClientComponent'
import type { Destination } from '@/lib/types'
import { getWeatherFromGemini } from '@/services/weather/weather.service'

export default async function ExplorePage() {
  const destinations: Destination[] = await getAllDestinations()

  const destinationsWithWeather = await Promise.all(
    destinations.map(async (dest) => {
      let weather = null
      let weatherError = null
      if (dest.coordinates?.lat && dest.coordinates?.lng) {
        try {
          weather = await getWeatherFromGemini(
            dest.name,
            dest.coordinates.lat,
            dest.coordinates.lng
          )
        } catch (e) {
          weatherError =
            e instanceof Error ? e.message : 'Failed to fetch weather.'
        }
      }
      return {
        ...dest,
        weather,
        weatherError,
      }
    })
  )

  return (
    <ExploreClientComponent initialDestinations={destinationsWithWeather} />
  )
}
