import { getAllDestinations } from '@/services/destinations'
import ExploreClientComponent from './ExploreClientComponent'
import type { Destination } from '@/lib/types'
import { getWeather } from '@/services/weather/weather.service'

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ExplorePage() {
  const destinations: Destination[] = await getAllDestinations()

  // No need to fetch weather on the server-side for the main list,
  // let the client component handle it lazily.
  // This improves initial page load speed.

  return <ExploreClientComponent initialDestinations={destinations} />
}
