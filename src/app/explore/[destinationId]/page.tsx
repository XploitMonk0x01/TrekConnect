
'use client';

import { useState, useEffect, use } from 'react';
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
import { searchPexelsImage } from '@/services/pexels';
import { Skeleton } from '@/components/ui/skeleton';

const mockDestinationsList: Destination[] = [
  // Existing Uttarakhand
  { id: "UT1", name: "Roopkund Trek", description: "A thrilling trek in Uttarakhand leading to the mysterious Roopkund Lake, known for the human skeletons found at its edge. Offers stunning views of Trishul and Nanda Ghunti peaks.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Himalayas", attractions: ["Roopkund Lake", "Bedni Bugyal", "Trishul Peak views", "Junargali Pass"], travelTips: "High altitude trek, requires excellent fitness and acclimatization. Best season: May-June, Aug-Sep.", averageRating: 4.7, coordinates: { lat: 30.257, lng: 79.723 } },
  { id: "UT2", name: "Valley of Flowers & Hemkund Sahib", description: "A UNESCO World Heritage site, the Valley of Flowers is a vibrant expanse of alpine flora. Paired with a visit to the sacred Hemkund Sahib lake and Gurudwara.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Himalayas", attractions: ["Valley of Flowers National Park", "Hemkund Sahib Lake & Gurudwara", "Pushpawati River", "Diverse alpine flora"], travelTips: "Best visited during monsoon (July-August) for full bloom. Moderate difficulty. Ensure permits.", averageRating: 4.8, coordinates: { lat: 30.727, lng: 79.605 } },
  { id: "UT3", name: "Kedarkantha Trek", description: "A popular winter trek in Uttarakhand, known for its stunning 360-degree summit views of Himalayan peaks like Swargarohini and Bandarpoonch, often snow-covered.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Himalayas", attractions: ["Juda-ka-Talab", "Kedarkantha Peak summit", "Sankri village", "Govind National Park views"], travelTips: "Best done in winter (Dec-Apr) for snow. Suitable for beginners with good fitness. Requires warm clothing.", averageRating: 4.5, coordinates: { lat: 31.022, lng: 78.178 } },
  { id: "UT4", name: "Har Ki Dun Trek", description: "Known as the 'Valley of Gods', this cradle-shaped valley in the Garhwal Himalayas offers stunning views of Swargarohini peaks, lush meadows, and traditional Garhwali villages like Osla.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Har Ki Dun Valley", "Swargarohini Peak views", "Osla & Seema Villages", "Jaundhar Glacier (optional)"], travelTips: "Moderate trek, ideal for beginners to intermediate trekkers. Best seasons: April-June, September-November.", averageRating: 4.6, coordinates: { lat: 31.065, lng: 78.215 } },
  // Existing Himachal Pradesh
  { id: "HP1", name: "Hampta Pass Trek", description: "A popular trek in Himachal Pradesh that offers a dramatic crossover from the lush green Kullu valley to the arid, stark landscapes of Lahaul. Features beautiful river crossings and camping at Shea Goru.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Himachal Pradesh, Himalayas", attractions: ["Chandratal Lake (optional extension)", "Shea Goru campsite", "Hampta Pass crossing (14,100 ft)", "Rohtang Pass views"], travelTips: "Moderate difficulty, suitable for beginners with good fitness. Best season: June-September.", averageRating: 4.6, coordinates: { lat: 32.270, lng: 77.395 } },
  { id: "HP2", name: "Bhrigu Lake Trek", description: "A high-altitude alpine lake trek near Manali, Himachal Pradesh. The lake is believed to be the meditation spot of Sage Bhrigu and is known for its stunning blue waters and panoramic Himalayan views.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Himachal Pradesh, Himalayas", attractions: ["Bhrigu Lake", "Vashisht Village", "Views of Pir Panjal and Dhauladhar ranges", "Alpine meadows"], travelTips: "Moderate trek, can be done in 3-4 days. Best season: May-June, September-October. Acclimatize well.", averageRating: 4.5, coordinates: { lat: 32.300, lng: 77.220 } },
  { id: "HP3", name: "Beas Kund Trek", description: "A classic trek in Himachal Pradesh leading to Beas Kund, the source of the Beas River. Offers breathtaking close-up views of major peaks like Hanuman Tibba and Seven Sisters.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Himachal Pradesh, Himalayas", attractions: ["Beas Kund Glacier Lake", "Dhundi & Bakarthach campsites", "Solang Valley", "Views of Hanuman Tibba"], travelTips: "Easy to moderate trek, suitable for beginners. Best season: May-October.", averageRating: 4.4, coordinates: { lat: 32.395, lng: 77.065 } },
  { id: "HP4", name: "Kareri Lake Trek", description: "A serene trek in Himachal to the stunning freshwater Kareri Lake, nestled in the Dhauladhar range. The trail passes through lush forests, meadows, and shepherd villages.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Himachal Pradesh, Himalayas", attractions: ["Kareri Lake", "Kareri Village", "Nyund Nallah", "Dhauladhar views"], travelTips: "Moderate difficulty. Best seasons: April-June, September-November. Can be slippery post-monsoon.", averageRating: 4.3, coordinates: { lat: 32.388, lng: 76.277 } },
  // Existing Ladakh
  { id: "LA1", name: "Markha Valley Trek", description: "A classic trek in Ladakh, often called 'tea house trek' due to homestay options. It traverses through remote villages, stunning canyons, high passes like Ganda La & Kongmaru La, with views of Kang Yatse peak.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Ladakh, Himalayas", attractions: ["Hemis National Park", "Ganda La (4900m)", "Kongmaru La (5200m)", "Markha River", "Ladakhi villages & monasteries"], travelTips: "Moderate to strenuous trek. Requires good acclimatization to high altitude. Best season: June-September.", averageRating: 4.7, coordinates: { lat: 33.875, lng: 77.430 } },
  { id: "LA2", name: "Sham Valley Trek", description: "Known as the 'Baby Trek' of Ladakh, this is a relatively easier option to experience Ladakhi culture, ancient monasteries (Likir, Rizong, Temisgam), and beautiful arid landscapes.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Ladakh, Himalayas", attractions: ["Likir Monastery", "Rizong Monastery", "Temisgam Village", "Apricot orchards", "Views of Indus Valley"], travelTips: "Easy trek, ideal for beginners or families. Best season: May-October. Good for acclimatization.", averageRating: 4.2, coordinates: { lat: 34.250, lng: 77.200 } },
  { id: "LA3", name: "Kang Yatse II & Stok Base Trek", description: "A challenging yet rewarding trek in Ladakh offering an ascent of Kang Yatse II (around 6250m) or views from Stok Kangri Base Camp. Provides a true high-altitude mountaineering experience.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Ladakh, Himalayas", attractions: ["Kang Yatse II summit views", "Stok Kangri Base Camp (views)", "Nimaling plains", "Ganda La & Kongmaru La (if part of Markha Valley approach)"], travelTips: "Strenuous, requires prior high-altitude trekking experience and excellent fitness. Proper acclimatization is critical. Best season: July-September.", averageRating: 4.8, coordinates: { lat: 33.900, lng: 77.550 } },
  { id: "LA4", name: "Lamayuru to Alchi Trek", description: "A cultural odyssey through Ladakh, connecting the ancient monasteries of Lamayuru and Alchi. The trail crosses remote passes and offers stunning views of the unique moonscape terrain.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Ladakh, Himalayas", attractions: ["Lamayuru Monastery ('Moonland')", "Alchi Monastery (UNESCO site)", "Wanla Monastery", "Prinkiti La pass"], travelTips: "Moderate trek, good for experiencing Ladakhi culture and history. Best season: June-September.", averageRating: 4.4, coordinates: { lat: 34.281, lng: 76.781 } },
  // New Treks (Primarily Uttarakhand)
  { id: "UT5", name: "Satopanth Tal Trek", description: "A challenging trek to a high-altitude glacial lake of immense religious significance, nestled amidst towering peaks near Badrinath.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Satopanth Tal Lake", "Views of Chaukhamba, Nilkantha, Swargarohini", "Laxmi Van", "Dhano Glacier"], travelTips: "Requires excellent fitness and prior high-altitude experience. Best season: May-June, September-October.", averageRating: 4.8, coordinates: { lat: 30.789, lng: 79.305 } },
  { id: "UT6", name: "Rudranath Trek", description: "A spiritual trek to the Rudranath temple, one of the Panch Kedar, dedicated to Lord Shiva. Involves traversing beautiful meadows and forests.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Rudranath Temple", "Anusuya Devi Temple", "Panar Bugyal", "Views of Nanda Devi, Trishul"], travelTips: "Moderate to difficult. Can be approached from multiple routes. Best season: May-June, September-October.", averageRating: 4.6, coordinates: { lat: 30.537, lng: 79.321 } },
  { id: "UT7", name: "Tungnath - Chandrashila Trek", description: "A popular trek to the highest Shiva temple (Tungnath) and the Chandrashila summit, offering breathtaking 360-degree views of Himalayan peaks including Nanda Devi, Trishul, and Chaukhamba.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Tungnath Temple", "Chandrashila Peak", "Deoriatal Lake (optional)", "Chopta meadows"], travelTips: "Relatively easy to moderate, suitable for beginners. Can be done year-round (snow in winter). Best views in spring and autumn.", averageRating: 4.7, coordinates: { lat: 30.487, lng: 79.217 } },
  { id: "UT8", name: "Vasuki Tal Trek", description: "A high-altitude trek near Kedarnath, leading to the pristine Vasuki Tal lake, surrounded by stunning views of Chaukhamba peaks.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Vasuki Tal Lake", "Kedarnath Temple (nearby)", "Views of Chaukhamba peaks", "Glacial terrain"], travelTips: "Strenuous trek, requires good acclimatization. Best done post-monsoon: September-October.", averageRating: 4.5, coordinates: { lat: 30.770, lng: 79.098 } },
  { id: "UT9", name: "Gaumukh Tapovan Trek", description: "A revered trek to Gaumukh, the snout of the Gangotri Glacier and source of the Ganges river, followed by an ascent to Tapovan, a high-altitude meadow offering spectacular views of Mt. Shivling.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Gaumukh (source of Ganges)", "Tapovan meadow", "Mt. Shivling views", "Gangotri Glacier", "Gangotri Temple"], travelTips: "Moderate to strenuous. Requires permits and acclimatization. Best season: May-June, September-October.", averageRating: 4.9, coordinates: { lat: 30.955, lng: 79.078 } },
  { id: "UT10", name: "Nag Tibba Trek", description: "A relatively easy weekend trek near Mussoorie, offering panoramic views of the Swargarohini, Bandarpoonch, Kedarnath, and Gangotri peaks. Ideal for beginners.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Nag Tibba summit", "Pantwari village", "Views of Himalayan ranges", "Oak and rhododendron forests"], travelTips: "Easy to moderate, perfect for beginners and weekend trips. Can be done year-round.", averageRating: 4.3, coordinates: { lat: 30.596, lng: 78.123 } },
  { id: "UT11", name: "Pindari Glacier Trek", description: "A classic trek in the Kumaon Himalayas leading to the Pindari Glacier, the source of the Pindar River. Offers stunning views of Nanda Devi and Nanda Kot.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Kumaon Himalayas", attractions: ["Pindari Glacier", "Zero Point", "Views of Nanda Devi, Nanda Kot", "Khati village", "Beautiful forests and river valleys"], travelTips: "Moderate difficulty. Best seasons: April-June, September-October.", averageRating: 4.6, coordinates: { lat: 30.257, lng: 79.970 } },
  { id: "UT12", name: "Kuari Pass Trek", description: "Known as the Lord Curzon Trail, this trek offers magnificent views of Nanda Devi, Dronagiri, Kamet, and other Himalayan giants. Passes through lush meadows and dense forests.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Kuari Pass", "Auli (ski resort)", "Joshimath", "Views of Nanda Devi sanctuary peaks", "Gorson Bugyal"], travelTips: "Moderate trek, suitable for beginners with good fitness. Best seasons: April-June, September-November. Winter snow trek option available.", averageRating: 4.7, coordinates: { lat: 30.517, lng: 79.600 } },
  { id: "UT13", name: "Brahmatal Trek", description: "A popular winter trek offering stunning views of Mt. Trishul and Nanda Ghunti, with the highlight being the frozen Brahmatal lake.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Brahmatal Lake", "Bekaltal Lake", "Views of Mt. Trishul, Nanda Ghunti", "Rhododendron forests"], travelTips: "Moderate trek, ideal for winter. Requires warm clothing. Best season: December-March.", averageRating: 4.5, coordinates: { lat: 30.173, lng: 79.490 } },
  { id: "UT14", name: "Dayara Bugyal Trek", description: "A beautiful trek to one of Uttarakhand's largest alpine meadows, Dayara Bugyal, offering panoramic views of Himalayan peaks like Bandarpoonch and Gangotri range.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Dayara Bugyal meadow", "Barnala Tal", "Raithal village", "Views of Bandarpoonch, Srikanth peaks"], travelTips: "Easy to moderate, suitable for beginners and families. Can be done year-round (snow in winter).", averageRating: 4.6, coordinates: { lat: 30.853, lng: 78.575 } },
  { id: "UT15", name: "Madhyamaheshwar Trek", description: "A serene trek to Madhyamaheshwar temple, one of the Panch Kedar, located in a beautiful valley with views of Chaukhamba, Kedarnath, and Neelkanth peaks.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Madhyamaheshwar Temple", "Buda Madhyamaheshwar", "Ransi village", "Views of Chaukhamba"], travelTips: "Moderate difficulty. Best season: May-June, September-October.", averageRating: 4.5, coordinates: { lat: 30.638, lng: 79.223 } },
  { id: "UT16", name: "Kalpeshwar Trek", description: "The only Panch Kedar temple accessible throughout the year. A relatively short and easy trek through beautiful landscapes.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Kalpeshwar Temple", "Urgam Valley", "Dhyan Badri Temple"], travelTips: "Easy trek, suitable for all ages. Can be visited year-round.", averageRating: 4.2, coordinates: { lat: 30.579, lng: 79.457 } },
  { id: "UT17", name: "Panch Kedar Trek", description: "A comprehensive pilgrimage trek covering all five Kedar shrines: Kedarnath, Tungnath, Rudranath, Madhyamaheshwar, and Kalpeshwar. A challenging and spiritually rewarding journey.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["All five Kedar temples", "Varied landscapes from high mountains to lush valleys", "Spiritual significance"], travelTips: "Very strenuous and long duration. Requires excellent fitness, planning, and often guides. Best attempted in parts or by experienced trekkers. Season: May-June, Sep-Oct (avoiding monsoon).", averageRating: 4.9, coordinates: { lat: 30.600, lng: 79.200 } },
  { id: "UT18", name: "Bali Pass Trek", description: "A challenging high-altitude crossover trek connecting Har Ki Dun valley with Yamunotri. Offers stunning views and a true wilderness experience.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Bali Pass (4950m)", "Ruinsara Tal", "Yamunotri Temple (descent)", "Views of Swargarohini, Bandarpoonch"], travelTips: "Strenuous and technical in parts. Requires prior high-altitude trekking experience and good fitness. Best season: June, September-October.", averageRating: 4.7, coordinates: { lat: 31.028, lng: 78.350 } },
  { id: "UT19", name: "Dodital Trek", description: "A beautiful trek to the freshwater Dodital lake, believed to be the birthplace of Lord Ganesha. Surrounded by dense forests and offering serene Himalayan views.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Dodital Lake", "Darwa Top (optional)", "Asi Ganga valley", "Sangam Chatti"], travelTips: "Easy to moderate trek, suitable for beginners and families. Best season: April-June, September-November.", averageRating: 4.4, coordinates: { lat: 30.842, lng: 78.489 } },
  { id: "UT20", name: "Auden's Col Trek", description: "An extremely challenging and technical high-altitude pass connecting Gangotri valley with Kedarnath valley. Considered one of the toughest treks in India.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), country: "India", region: "Uttarakhand, Garhwal Himalayas", attractions: ["Auden's Col (5490m)", "Khatling Glacier", "Views of Gangotri and Jogin group of peaks", "Mayali Pass"], travelTips: "Highly strenuous and technical, requires mountaineering skills, equipment, and experienced guides. For expert trekkers only. Best season: May-June, September.", averageRating: 4.9, coordinates: { lat: 30.845, lng: 78.817 } }
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
  "UT1": "uttarakhand roopkund trek",
  "UT2": "valley of flowers hemkund sahib",
  "UT3": "kedarkantha winter trek",
  "UT4": "har ki dun uttarakhand",
  "HP1": "himachal hampta pass",
  "HP2": "bhrigu lake manali",
  "HP3": "beas kund himachal",
  "HP4": "kareri lake dhauladhar",
  "LA1": "ladakh markha valley",
  "LA2": "ladakh sham valley trek",
  "LA3": "kang yatse ladakh",
  "LA4": "lamayuru alchi ladakh",
  "UT5": "satopanth tal uttarakhand",
  "UT6": "rudranath trek uttarakhand",
  "UT7": "tungnath chandrashila trek",
  "UT8": "vasuki tal kedarnath",
  "UT9": "gaumukh tapovan trek",
  "UT10": "nag tibba trek mussoorie",
  "UT11": "pindari glacier kumaon",
  "UT12": "kuari pass trek uttarakhand",
  "UT13": "brahmatal winter trek",
  "UT14": "dayara bugyal trek",
  "UT15": "madhyamaheshwar trek panch kedar",
  "UT16": "kalpeshwar temple trek",
  "UT17": "panch kedar pilgrimage trek",
  "UT18": "bali pass trek uttarakhand",
  "UT19": "dodital lake trek",
  "UT20": "audens col trek"
};


export default function DestinationDetailPage({ params: incomingParams }: { params: { destinationId: string } }) {
  const resolvedParams = use(incomingParams as any);
  
  const [destination, setDestination] = useState<Destination | undefined>(undefined);
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);
  const [travelerPhotos, setTravelerPhotos] = useState<string[]>([]);
  const [areTravelerPhotosLoading, setAreTravelerPhotosLoading] = useState(true);

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const currentDestinationId = resolvedParams.destinationId;
    const foundDestination = mockDestinationsList.find(d => d.id === currentDestinationId);

    if (foundDestination) {
      setDestination(prev => ({...foundDestination, imageUrl: prev?.imageUrl || foundDestination.imageUrl }));

      const fetchMainImage = async () => {
        setIsMainImageLoading(true);
        const query = destinationAITags[foundDestination.id] || `${foundDestination.name} landscape`;
        try {
          const imageUrl = await searchPexelsImage(query, 1200, 600);
          setDestination(prevDest => prevDest ? { ...prevDest, imageUrl } : { ...foundDestination, imageUrl });
        } catch (error) {
          console.error("Failed to load main image:", error);
           setDestination(prevDest => prevDest || {...foundDestination});
        } finally {
          setIsMainImageLoading(false);
        }
      };
      fetchMainImage();

      const fetchTravelerPhotos = async () => {
        setAreTravelerPhotosLoading(true);
        const photoQueryBase = destinationAITags[foundDestination.id] || foundDestination.name;
        const queries = [
          `${photoQueryBase} trek photo`,
          `${photoQueryBase} landscape detail`,
          `${photoQueryBase} mountain view`,
          `${photoQueryBase} trail`,
          `${photoQueryBase} nature scenery`
        ];
        try {
          const photoPromises = queries.map(q => searchPexelsImage(q, 300, 300));
          const photos = await Promise.all(photoPromises);
          setTravelerPhotos(photos.filter(p => !p.includes('placehold.co')));
        } catch (error) {
          console.error("Failed to load traveler photos:", error);
          setTravelerPhotos([...Array(5)].map(() => PLACEHOLDER_IMAGE_URL(300,300)));
        } finally {
          setAreTravelerPhotosLoading(false);
        }
      };
      fetchTravelerPhotos();
    } else {
      setDestination(undefined);
    }
  }, [resolvedParams.destinationId]);


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


  if (!resolvedParams.destinationId && !destination) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader2 className="w-16 h-16 text-muted-foreground mb-4 animate-spin" />
        <h1 className="text-2xl font-semibold">Loading destination...</h1>
      </div>
    );
  }
  
  if (!destination) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Destination not found</h1>
        <p className="text-muted-foreground">The destination you are looking for ({resolvedParams.destinationId}) does not exist or has been moved.</p>
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
          {isMainImageLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <Image
              src={destination.imageUrl}
              alt={destination.name}
              layout="fill"
              objectFit="cover"
              priority
              data-ai-hint={AITag}
              onError={() => {
                setDestination(prev => prev ? { ...prev, imageUrl: PLACEHOLDER_IMAGE_URL(1200,600) } : undefined);
              }}
            />
          )}
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
          {areTravelerPhotosLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                 <Skeleton className="h-full w-full" />
              </div>
            ))
          ) : (
            travelerPhotos.map((photoUrl, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                <Image
                  src={photoUrl}
                  alt={`User photo ${i+1} from ${destination.name}`}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={`${AITag} photo ${i+1}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL(300,300);
                  }}
                />
              </div>
            ))
          )}
           <Button variant="outline" className="aspect-square flex flex-col items-center justify-center text-muted-foreground hover:bg-primary/5 hover:text-primary border-primary">
              <ExternalLink className="h-6 w-6 mb-1"/>
              View All Photos
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
