import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star, Sun, CloudSun, CloudRain, CalendarDays, ExternalLink, Share2, ShieldCheck, Edit } from "lucide-react";
import type { Destination, WeatherInfo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

// Mock data - in a real app, this would come from an API
const mockDestinations: Destination[] = [
  { id: "1", name: "Everest Base Camp", description: "Embark on a legendary trek to the foot of Mount Everest, the world's highest peak. Experience Sherpa culture, breathtaking Himalayan scenery, and the challenge of high-altitude trekking. This journey is not for the faint of heart but rewards with unparalleled views and a profound sense of accomplishment.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "Nepal", region: "Himalayas", attractions: ["Kala Patthar Viewpoint", "Tengboche Monastery", "Namche Bazaar"], travelTips: "Acclimatize properly. Pack warm layers. Stay hydrated.", averageRating: 4.8, coordinates: { lat: 28.0046, lng: 86.8529 } },
  { id: "2", name: "Patagonia Wilderness", description: "Explore the raw, untamed beauty of Patagonia, spanning Chile and Argentina. Witness towering granite peaks, vast glaciers, turquoise lakes, and unique wildlife. Ideal for hiking, photography, and escaping into pristine nature.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "Chile/Argentina", region: "Andes", attractions: ["Torres del Paine National Park", "Perito Moreno Glacier", "Fitz Roy Massif"], travelTips: "Weather is unpredictable; pack for all seasons. Book accommodations in advance.", averageRating: 4.9, coordinates: { lat: -50.942, lng: -73.4059 } },
];

const mockWeather: WeatherInfo = {
  temperature: "10°C",
  condition: "Partly Cloudy",
  iconCode: "02d", // Example OpenWeatherMap icon code
  forecast: [
    { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), minTemp: "5°C", maxTemp: "12°C", condition: "Sunny", iconCode: "01d" },
    { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), minTemp: "3°C", maxTemp: "10°C", condition: "Showers", iconCode: "09d" },
  ]
};

function getWeatherIcon(iconCode?: string) {
  if (!iconCode) return <Sun className="h-5 w-5" />;
  if (iconCode.includes("01")) return <Sun className="h-5 w-5" />; // Clear sky
  if (iconCode.includes("02") || iconCode.includes("03") || iconCode.includes("04")) return <CloudSun className="h-5 w-5" />; // Clouds
  if (iconCode.includes("09") || iconCode.includes("10")) return <CloudRain className="h-5 w-5" />; // Rain
  // Add more mappings as needed
  return <Sun className="h-5 w-5" />;
}


export default function DestinationDetailPage({ params }: { params: { destinationId: string } }) {
  const destination = mockDestinations.find(d => d.id === params.destinationId);

  if (!destination) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="text-muted-foreground">The destination you are looking for does not exist or has been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/explore">Back to Explore</Link>
        </Button>
      </div>
    );
  }

  const AITag = destination.id === "1" ? "himalayas mountains" : "patagonia torres del paine";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Share Destination">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Add to Wishlist">
            <Star className="h-5 w-5" /> {/* Toggle fill for wishlist state */}
          </Button>
        </div>
      </div>

      <Card className="shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96">
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint={AITag}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h1 className="font-headline text-3xl md:text-4xl text-primary-foreground mb-1">{destination.name}</h1>
            <div className="flex items-center text-lg text-primary-foreground/80">
              <MapPin className="h-5 w-5 mr-2" />
              {destination.country}{destination.region ? `, ${destination.region}` : ''}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="font-headline text-2xl text-primary mb-2">About {destination.name}</h2>
              <p className="text-foreground/90 leading-relaxed">{destination.description}</p>
            </div>

            {destination.attractions && destination.attractions.length > 0 && (
              <div>
                <h3 className="font-headline text-xl mb-2">Popular Attractions</h3>
                <ul className="list-disc list-inside space-y-1 text-foreground/80">
                  {destination.attractions.map(attraction => <li key={attraction}>{attraction}</li>)}
                </ul>
              </div>
            )}

            {destination.travelTips && (
               <div>
                <h3 className="font-headline text-xl mb-2">Travel Tips</h3>
                <p className="text-foreground/80 italic">{destination.travelTips}</p>
              </div>
            )}
            
            {/* Placeholder for Route Planning */}
            <div>
              <h3 className="font-headline text-xl mb-2">Route Planning</h3>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/5">
                <Edit className="mr-2 h-4 w-4" /> Create Custom Route (Coming Soon)
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><Sun className="mr-2 h-5 w-5 text-yellow-500" /> Weather</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  {getWeatherIcon(mockWeather.iconCode)}
                  <span className="ml-2 text-2xl font-semibold">{mockWeather.temperature}</span>
                  <span className="ml-2 text-muted-foreground">{mockWeather.condition}</span>
                </div>
                <h4 className="font-medium text-sm mb-1">Forecast:</h4>
                <ul className="space-y-1 text-sm">
                  {mockWeather.forecast?.map(day => (
                    <li key={day.date} className="flex justify-between items-center text-muted-foreground">
                      <span>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}:</span>
                      <div className="flex items-center">
                        {getWeatherIcon(day.iconCode)}
                        <span className="ml-1">{day.minTemp} / {day.maxTemp}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                 <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">
                    View Full Forecast <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

            {/* Placeholder for Google Maps */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><MapPin className="mr-2 h-5 w-5 text-red-500"/> Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <p>Map of {destination.name} here</p>
                </div>
                 {destination.coordinates && <p className="text-xs text-muted-foreground mt-1">Lat: {destination.coordinates.lat.toFixed(4)}, Lng: {destination.coordinates.lng.toFixed(4)}</p>}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-blue-500"/> Local Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No upcoming events listed. Check local resources.</p>
                {/* Placeholder for events */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-green-500"/> Safety Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Emergency: 123 (Police), 456 (Ambulance)</p>
                <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">
                    View More Safety Details <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>

      {/* User-uploaded Photos Section (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Photos from Travelers</CardTitle>
          <CardDescription>See {destination.name} through the eyes of the community.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <Image src={PLACEHOLDER_IMAGE_URL(300,300)} alt={`User photo ${i+1}`} layout="fill" objectFit="cover" data-ai-hint="travel photo" />
            </div>
          ))}
           <Button variant="outline" className="aspect-square flex flex-col items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary border-primary">
              <ExternalLink className="h-6 w-6 mb-1"/>
              View All Photos
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate static paths if needed, or handle dynamic fetching.
// For now, this will work with Next.js dynamic segments.
// export async function generateStaticParams() {
//   return mockDestinations.map((destination) => ({
//     destinationId: destination.id,
//   }))
// }
