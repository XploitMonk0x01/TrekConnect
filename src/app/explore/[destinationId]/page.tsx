
'use client';

import { useState, useEffect, use } from 'react'; // Added 'use'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star, Sun, CloudSun, CloudRain, CalendarDays, ExternalLink, Share2, ShieldCheck, Edit, Sparkles, Loader2 } from "lucide-react";
import type { Destination, WeatherInfo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";
import { generateTrekImage } from '@/ai/flows/generate-trek-image-flow';
import { useToast } from "@/hooks/use-toast";

const mockDestinations: Destination[] = [
  { id: "in1", name: "Roopkund Trek", description: "A thrilling trek in Uttarakhand leading to the mysterious Roopkund Lake, known for the human skeletons found at its edge. Offers stunning views of Trishul and Nanda Ghunti peaks.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Himalayas", attractions: ["Roopkund Lake", "Bedni Bugyal", "Trishul Peak views"], travelTips: "High altitude trek, requires good fitness. Best season: May-June, Aug-Sep.", averageRating: 4.7, coordinates: { lat: 30.257, lng: 79.723 } },
  { id: "in2", name: "Hampta Pass Trek", description: "A popular trek in Himachal Pradesh that offers a dramatic crossover from the lush green Kullu valley to the arid landscapes of Lahaul. Features beautiful river crossings and camping spots.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Himachal Pradesh, Himalayas", attractions: ["Chandratal Lake (optional extension)", "Shea Goru campsite", "Hampta Pass crossing"], travelTips: "Moderate difficulty, suitable for beginners with good fitness. Best season: June-September.", averageRating: 4.6, coordinates: { lat: 32.270, lng: 77.395 } },
  { id: "in3", name: "Valley of Flowers Trek", description: "A vibrant and picturesque trek in Uttarakhand, leading to a UNESCO World Heritage site known for its meadows of endemic alpine flowers and diverse flora.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Himalayas", attractions: ["Valley of Flowers National Park", "Hemkund Sahib"], travelTips: "Best visited during monsoon (July-August) when flowers are in full bloom. Moderate difficulty.", averageRating: 4.8, coordinates: { lat: 30.727, lng: 79.605 } },
  { id: "in4", name: "Kedarkantha Trek", description: "A popular winter trek in Uttarakhand known for its stunning summit views of Himalayan peaks and snow-covered landscapes. Suitable for beginners.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Himalayas", attractions: ["Juda-ka-Talab", "Kedarkantha Peak summit"], travelTips: "Best done in winter (Dec-Apr) for snow. Requires warm clothing. Moderate difficulty.", averageRating: 4.5, coordinates: { lat: 31.022, lng: 78.178 } },
  { id: "in5", name: "Triund Trek", description: "A short and popular trek near McLeod Ganj, Himachal Pradesh, offering panoramic views of the Dhauladhar range. Ideal for beginners and weekend getaways.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Himachal Pradesh, Himalayas", attractions: ["Triund Hilltop", "Views of Dhauladhar range"], travelTips: "Easy to moderate trek, can be done year-round (except heavy snowfall). Camping facilities available.", averageRating: 4.4, coordinates: { lat: 32.269, lng: 76.347 } },
  { id: "in6", name: "Kashmir Great Lakes Trek", description: "A breathtaking trek in Kashmir traversing several high-altitude alpine lakes, lush meadows, and stunning mountain passes. Offers a glimpse into the pristine beauty of Kashmir.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Kashmir, Himalayas", attractions: ["Vishansar Lake", "Gadsar Lake", "Gangabal Lake", "Nichnai Pass"], travelTips: "Challenging trek, requires good physical fitness and acclimatization. Best season: July-September.", averageRating: 4.9, coordinates: { lat: 34.260, lng: 75.060 } },
];

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

const destinationAITags: Record<string, string> = {
  "in1": "uttarakhand roopkund",
  "in2": "himachal hampta",
  "in3": "uttarakhand valley flowers",
  "in4": "uttarakhand kedarkantha",
  "in5": "himachal triund",
  "in6": "kashmir lakes",
};


export default function DestinationDetailPage({ params: incomingParams }: { params: { destinationId: string } }) {
  const params = use(incomingParams as any); // Unwrap params using React.use() as per Next.js warning
  const destination = mockDestinations.find(d => d.id === params.destinationId);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!destination) return;
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    try {
      const result = await generateTrekImage({
        destinationName: destination.name,
        destinationDescription: destination.description,
      });
      if (result.imageDataUri) {
        setGeneratedImageUrl(result.imageDataUri);
        toast({
          title: "AI Image Generated!",
          description: `An AI's vision of ${destination.name} is ready.`,
        });
      } else {
        throw new Error("Image data URI is missing in the response.");
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
      toast({
        variant: "destructive",
        title: "AI Image Generation Failed",
        description: "Could not generate an image at this time. Please try again later.",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };


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

  const AITag = destinationAITags[destination.id] || "trekking india";
  const mapEmbedUrl = destination.coordinates 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${destination.coordinates.lng-0.05}%2C${destination.coordinates.lat-0.05}%2C${destination.coordinates.lng+0.05}%2C${destination.coordinates.lat+0.05}&layer=mapnik&marker=${destination.coordinates.lat}%2C${destination.coordinates.lng}`
    : null;


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
            <Star className="h-5 w-5" />
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

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><MapPin className="mr-2 h-5 w-5 text-red-500"/> Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                {mapEmbedUrl ? (
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={mapEmbedUrl}
                    className="rounded-lg"
                    title={`Map of ${destination.name}`}
                  ></iframe>
                ) : (
                  <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    <p>Map data unavailable for {destination.name}</p>
                  </div>
                )}
                 {destination.coordinates && <p className="text-xs text-muted-foreground mt-1">Lat: {destination.coordinates.lat.toFixed(4)}, Lng: {destination.coordinates.lng.toFixed(4)}</p>}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-blue-500"/> Local Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No upcoming events listed. Check local resources.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-green-500"/> Safety Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Emergency: 100 (Police), 108 (Ambulance)</p>
                <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">
                    View More Safety Details <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>

          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-accent" /> AI-Generated Vision
          </CardTitle>
          <CardDescription>See an AI's artistic interpretation of {destination.name}. Results may vary!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateImage} disabled={isGeneratingImage} className="bg-accent hover:bg-accent/90 mb-4">
            {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate AI Image of {destination.name}
          </Button>
          {isGeneratingImage && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating your image, this might take a few moments...
            </div>
          )}
          {generatedImageUrl && (
            <div className="mt-4 relative aspect-video rounded-lg overflow-hidden border shadow-md">
              <Image src={generatedImageUrl} alt={`AI generated image of ${destination.name}`} layout="fill" objectFit="cover" />
            </div>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Photos from Travelers</CardTitle>
          <CardDescription>See {destination.name} through the eyes of the community.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <Image src={PLACEHOLDER_IMAGE_URL(300,300)} alt={`User photo ${i+1} from ${destination.name}`} layout="fill" objectFit="cover" data-ai-hint={`${AITag} photo`} />
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
