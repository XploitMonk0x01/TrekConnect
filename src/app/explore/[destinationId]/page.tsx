
'use server'; // Marks this as a Server Component that can be async

import Link from "next/link";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { WeatherInfo } from "@/lib/types";
import { getDestinationById } from '@/services/destinations';
import DestinationDetailClientContent from './DestinationDetailClientContent';


// Mock weather, can be replaced by an API call
const mockWeather: WeatherInfo = {
  temperature: "10°C",
  condition: "Partly Cloudy",
  iconCode: "02d",
  forecast: [
    { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), minTemp: "5°C", maxTemp: "12°C", condition: "Sunny", iconCode: "01d" },
    { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), minTemp: "3°C", maxTemp: "10°C", condition: "Showers", iconCode: "09d" },
  ]
};


export default async function DestinationDetailPage({ params: incomingParams }: { params: { destinationId: string } }) {
  const destinationId = incomingParams.destinationId;
  
  const destination = await getDestinationById(destinationId);

  if (!destination) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="text-muted-foreground">The trek details for ID ({destinationId}) could not be loaded. It might not exist or there was an issue fetching it.</p>
        <Button asChild className="mt-4">
          <Link href="/explore">Back to Explore</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <DestinationDetailClientContent
      initialDestination={destination}
      mockWeather={mockWeather}
    />
  );
}
