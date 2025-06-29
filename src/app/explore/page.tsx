import { getAllDestinations } from '@/services/destinations'
import ExploreClientComponent from './ExploreClientComponent'
import type { Destination } from '@/lib/types'
import { getWeatherFromGemini } from '@/services/weather/weather.service'
import NodeCache from 'node-cache'

// Use node-cache for persistent in-process caching
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }) // 10 min TTL
const CACHE_KEY = 'destinationsWithWeather'

export default async function ExplorePage() {
  let destinationsWithWeather = cache.get<Destination[]>(CACHE_KEY)

  if (destinationsWithWeather) {
    return (
      <ExploreClientComponent initialDestinations={destinationsWithWeather} />
    )
  }

  const destinations: Destination[] = await getAllDestinations()

  destinationsWithWeather = await Promise.all(
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
        } catch (e: any) {
          weatherError = e?.message || 'Failed to fetch weather.'
        }
      }
      return {
        ...dest,
        weather,
        weatherError,
      }
    })
  )

  cache.set(CACHE_KEY, destinationsWithWeather)

  return (
    <ExploreClientComponent initialDestinations={destinationsWithWeather} />
  )
}
