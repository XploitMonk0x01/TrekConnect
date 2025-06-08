import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Compass, Users, Wand2, ImageIcon, BookOpen, ArrowRight } from "lucide-react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

export default function DashboardPage() {
  const features = [
    { title: "Explore Destinations", description: "Discover breathtaking new places.", icon: Compass, href: "/explore", imageHint: "mountains landscape" },
    { title: "ConnectSphere", description: "Find like-minded travel companions.", icon: Users, href: "/connect", imageHint: "group friends" },
    { title: "Smart Recommendations", description: "AI-powered travel suggestions.", icon: Wand2, href: "/recommendations", imageHint: "travel map" },
    { title: "Photo Feed", description: "Share and view travel photos.", icon: ImageIcon, href: "/feed", imageHint: "camera photos" },
    { title: "Travel Stories", description: "Read and write inspiring tales.", icon: BookOpen, href: "/stories", imageHint: "journal notebook" },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Welcome to TrekConnect!</CardTitle>
          <CardDescription className="text-lg">
            Your adventure starts here. Explore, connect, and share your journey with a vibrant community of travelers.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative h-64 sm:h-80 md:h-96 rounded-b-lg overflow-hidden">
          <Image
            src={PLACEHOLDER_IMAGE_URL(1200, 400)}
            alt="Scenic travel collage"
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint="adventure travel"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h2 className="text-2xl sm:text-3xl font-headline text-primary-foreground mb-2">Ready for Your Next Adventure?</h2>
            <Button asChild className="self-start bg-accent hover:bg-accent/90 text-accent-foreground w-auto">
              <Link href="/explore">
                Start Exploring <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 relative h-40 rounded-md overflow-hidden mb-4 mx-6">
               <Image
                src={PLACEHOLDER_IMAGE_URL(400, 200)}
                alt={feature.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={feature.imageHint}
              />
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 hover:text-primary">
                <Link href={feature.href}>
                  Go to {feature.title} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recently Matched?</CardTitle>
          <CardDescription>Check your messages and start planning your next adventure together!</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for recent matches or messages */}
          <p className="text-muted-foreground">No new messages. <Link href="/connect" className="text-primary hover:underline">Find new connections!</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
