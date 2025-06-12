
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPinned } from 'lucide-react';

export default function NewCustomRoutePage() {
  const searchParams = useSearchParams();
  const destinationId = searchParams.get('destinationId');

  return (
    <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/explore">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="font-headline text-3xl text-primary">Create Custom Trek Route</CardTitle>
          <CardDescription>
            Plan your unique adventure. This feature is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {destinationId && (
            <p className="mb-4 text-muted-foreground">
              Base Destination ID: <span className="font-semibold text-foreground">{destinationId}</span>
            </p>
          )}
          <p className="text-lg font-semibold text-accent mb-2">Feature Coming Soon!</p>
          <p className="text-muted-foreground">
            We're working hard to bring you an amazing custom route planning experience.
            Stay tuned for updates!
          </p>
          <div className="mt-6">
            <Button variant="secondary" disabled>
              Add Waypoint (Disabled)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
