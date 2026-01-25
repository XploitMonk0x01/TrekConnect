'use client'

import { ResponsiveContainer } from '@/components/layout/ResponsiveContainer'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Mountain,
  Camera,
  MapPin,
  Users,
  Heart,
  Star,
  Compass,
  Calendar,
} from 'lucide-react'

export default function DemoPage() {
  return (
    <ResponsiveContainer>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-responsive-xl font-headline font-bold text-foreground">
            Welcome to TrekConnect
          </h1>
          <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
            Experience our new responsive layout designed for adventurers.
            Connect, explore, and share your journey with fellow trekkers.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Mountain className="w-3 h-3 mr-1" />
              Adventure Ready
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Community Driven
            </Badge>
            <Badge className="text-xs">
              <Camera className="w-3 h-3 mr-1" />
              Story Sharing
            </Badge>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid-responsive">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Explore Destinations
                  </CardTitle>
                  <CardDescription>Discover amazing places</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Find your next adventure with our curated collection of
                breathtaking destinations.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Start Exploring
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Connect & Chat</CardTitle>
                  <CardDescription>Meet fellow trekkers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Build meaningful connections with adventure enthusiasts from
                around the world.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Join Community
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Camera className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Share Stories</CardTitle>
                  <CardDescription>Tell your adventures</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Share your incredible journey through photos and captivating
                stories.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Share Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="grid-responsive-3">
          <div className="text-center space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              10K+
            </div>
            <div className="text-sm text-muted-foreground">Active Trekkers</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-accent">
              500+
            </div>
            <div className="text-sm text-muted-foreground">Destinations</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl sm:text-3xl font-bold text-secondary-foreground">
              25K+
            </div>
            <div className="text-sm text-muted-foreground">Stories Shared</div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              See what the community has been up to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'Sarah M.',
                  action: 'shared a story from',
                  location: 'Mount Everest Base Camp',
                  time: '2 hours ago',
                },
                {
                  name: 'Alex K.',
                  action: 'uploaded photos from',
                  location: 'Annapurna Circuit',
                  time: '4 hours ago',
                },
                {
                  name: 'Maya P.',
                  action: 'discovered',
                  location: 'Hidden Valley Trek',
                  time: '6 hours ago',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        <span className="text-primary">{activity.name}</span>{' '}
                        {activity.action}{' '}
                        <span className="text-accent">{activity.location}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-responsive-lg font-headline font-semibold">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-responsive-base text-muted-foreground max-w-xl mx-auto">
            Join thousands of trekkers sharing their passion for exploration and
            discovery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="font-medium">
              <MapPin className="w-4 h-4 mr-2" />
              Start Exploring
            </Button>
            <Button variant="outline" size="lg" className="font-medium">
              <Users className="w-4 h-4 mr-2" />
              Join Community
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  )
}
