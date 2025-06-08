
import { getAllDestinations } from '@/services/destinations';
import ExploreClientComponent from './ExploreClientComponent';
import type { Destination } from '@/lib/types';

export default async function ExplorePage() {
  const destinations: Destination[] = await getAllDestinations();
  return <ExploreClientComponent initialDestinations={destinations} />;
}

