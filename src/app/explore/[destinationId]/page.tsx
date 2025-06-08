
'use server'; // Marks this as a Server Component that can be async

import { use } from 'react'; // To unwrap params if they are promises
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star, Sun, CloudSun, CloudRain, CalendarDays, ExternalLink, Share2, ShieldCheck, Edit, Sparkles, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Destination, WeatherInfo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { generateTrekImage } from '@/ai/flows/generate-trek-image-flow';
// Toast will need to be handled by a client component if actions trigger them.
// For now, if handleGenerateImage is client-side, this page needs to be a client component,
// or the image generation part needs to be in its own client component.
// Making this a server component first to fetch data.
// import { useToast } from "@/hooks/use-toast"; 
import { searchPexelsImage } from '@/services/pexels';
import { Skeleton } from '@/components/ui/skeleton';
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

function getWeatherIcon(iconCode?: string) {
  if (!iconCode) return <Sun className="h-5 w-5" />;
  if (iconCode.includes("01")) return <Sun className="h-5 w-5" />;
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) return <CloudSun className="h-5 w-5" />;
  if (iconCode.includes("09") || iconCode.includes("10")) return <CloudRain className="h-5 w-5" />;
  return <Sun className="h-5 w-5" />;
}


export default async function DestinationDetailPage({ params: incomingParams }: { params: { destinationId: string } }) {
  // const resolvedParams = use(incomingParams as any); // For future if params become promises
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

  // The AI-powered image generation and Pexels fetching will be handled in the client component
  // to keep this server component clean for data fetching.
  
  return (
    <DestinationDetailClientContent
      initialDestination={destination}
      mockWeather={mockWeather}
      getWeatherIcon={getWeatherIcon}
    />
  );
}

