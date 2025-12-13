'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Compass,
  Users,
  Wand2,
  ImageIcon,
  BookOpen,
  ArrowRight,
  Mountain,
  MapPin,
  Snowflake,
  Sun,
  Wind,
  Tent,
  Trophy,
} from 'lucide-react'
import Image from 'next/image'
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants'
import { searchPexelsImage } from '@/services/pexels'
import { useState, useEffect } from 'react'
import { getCachedImage, cacheImage } from '@/lib/image-cache'

interface Feature {
  title: string
  description: string
  icon: React.ElementType
  href: string
  queryHint: string
  imageHint: string
  imageUrl: string
}

const initialFeaturesData: Omit<Feature, 'imageUrl'>[] = [
  {
    title: 'Explore Expeditions',
    description:
      'Discover legendary Himalayan trails from Everest Base Camp to hidden valleys.',
    icon: Compass,
    href: '/explore',
    queryHint: 'himalayan mountain trek',
    imageHint: 'himalayan mountain trek',
  },
  {
    title: 'Find Trek Partners',
    description:
      'Connect with experienced mountaineers and fellow adventure seekers.',
    icon: Users,
    href: '/connect',
    queryHint: 'mountain climbers team',
    imageHint: 'mountain climbers team',
  },
  {
    title: 'AI Trail Guide',
    description:
      'Get personalized route recommendations based on your experience level.',
    icon: Wand2,
    href: '/recommendations',
    queryHint: 'mountain trail map',
    imageHint: 'mountain trail map',
  },
  {
    title: 'Summit Gallery',
    description: 'Share breathtaking views from the roof of the world.',
    icon: ImageIcon,
    href: '/feed',
    queryHint: 'himalayan summit view',
    imageHint: 'himalayan summit view',
  },
  {
    title: 'Expedition Stories',
    description:
      'Read inspiring tales of triumph and adventure from fellow trekkers.',
    icon: BookOpen,
    href: '/stories',
    queryHint: 'mountain expedition camp',
    imageHint: 'mountain expedition camp',
  },
]

// Stats to inspire
const stats = [
  { icon: Mountain, value: '8,000+', label: 'Meter Peaks' },
  { icon: MapPin, value: '500+', label: 'Trek Routes' },
  { icon: Users, value: '10K+', label: 'Trekkers' },
  { icon: Trophy, value: '50+', label: 'Expeditions' },
]

export default function DashboardPage() {
  const [heroImageUrl, setHeroImageUrl] = useState<string>(
    PLACEHOLDER_IMAGE_URL(1920, 1080)
  )
  const [features, setFeatures] = useState<Feature[]>(
    initialFeaturesData.map((f) => ({
      ...f,
      imageUrl: PLACEHOLDER_IMAGE_URL(600, 400),
    }))
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      try {
        const heroQuery = 'himalayan mountain peak sunrise'
        const cachedHeroImage = getCachedImage(heroQuery)
        if (cachedHeroImage) {
          setHeroImageUrl(cachedHeroImage)
        } else {
          const fetchedHeroImageUrl = await searchPexelsImage(
            heroQuery,
            1920,
            1080
          )
          setHeroImageUrl(fetchedHeroImageUrl)
          cacheImage(fetchedHeroImageUrl)
        }

        const fetchedFeatures = await Promise.all(
          initialFeaturesData.map(async (feature) => {
            const cachedFeatureImage = getCachedImage(feature.queryHint)
            if (cachedFeatureImage) {
              return { ...feature, imageUrl: cachedFeatureImage }
            }
            const imageUrl = await searchPexelsImage(
              feature.queryHint,
              600,
              400
            )
            cacheImage(imageUrl)
            return { ...feature, imageUrl }
          })
        )
        setFeatures(fetchedFeatures)
      } catch (error) {
        console.error('Failed to fetch images for dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section - Epic Mountain Vista */}
      <section className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageUrl}
            alt="Himalayan Mountain Peaks"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-900/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-transparent to-transparent" />
        </div>

        {/* Floating snow particles effect */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <Snowflake className="absolute top-20 left-[10%] h-4 w-4 text-white/20 animate-pulse" />
          <Snowflake className="absolute top-40 left-[30%] h-3 w-3 text-white/15 animate-pulse delay-300" />
          <Snowflake className="absolute top-32 right-[20%] h-5 w-5 text-white/10 animate-pulse delay-500" />
          <Wind className="absolute bottom-40 right-[15%] h-8 w-8 text-white/10 animate-pulse delay-700" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sun className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-white">
                Season 2025 Now Open
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl lg:text-8xl">
              Conquer the{' '}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent">
                Himalayas
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-2xl text-xl text-gray-200 md:text-2xl">
              Join a community of passionate mountaineers. Plan your expedition,
              find your tribe, and chase the summit of your dreams.
            </p>

            {/* CTA Buttons */}
            <div className="mb-12 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="group bg-primary text-lg font-semibold hover:bg-primary/90"
                asChild
              >
                <Link href="/explore">
                  <Tent className="mr-2 h-5 w-5" />
                  Plan Your Trek
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="/connect">
                  <Users className="mr-2 h-5 w-5" />
                  Find Partners
                </Link>
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 flex justify-center">
                    <stat.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-white md:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/60">Explore</span>
            <div className="h-10 w-6 rounded-full border-2 border-white/30 p-1">
              <div className="h-2 w-full rounded-full bg-white/60 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-background py-24">
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-primary">
              <Mountain className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">
                Your Journey Awaits
              </span>
            </div>
            <h2 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
              Everything for Your Expedition
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From planning your route to sharing summit photos, TrekConnect has
              everything you need for an unforgettable Himalayan adventure.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Link key={feature.title} href={feature.href} className="group">
                <Card className="trek-card h-full border-none">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={feature.imageUrl}
                      alt={feature.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                    {/* Icon badge */}
                    <div className="absolute top-4 left-4 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>

                    {/* Title overlay on image */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                        {feature.title}
                        <ArrowRight className="h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                      </h3>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Motivational Quote Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={heroImageUrl}
            alt="Mountain backdrop"
            fill
            className="object-cover"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <blockquote className="mx-auto max-w-4xl">
            <p className="mb-8 font-serif text-3xl font-light leading-relaxed md:text-4xl lg:text-5xl">
              "The mountains are calling and I must go."
            </p>
            <footer className="text-lg text-gray-400">— John Muir</footer>
          </blockquote>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
              <Mountain className="h-12 w-12 text-primary" />
            </div>
            <h2 className="mb-6 font-serif text-4xl font-bold md:text-5xl">
              Your Summit Awaits
            </h2>
            <p className="mb-10 text-xl text-muted-foreground">
              Join thousands of adventurers who have found their path in the
              Himalayas. Start your journey today — for free.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="px-10 text-lg font-semibold" asChild>
                <Link href="/auth/signup">
                  Start Your Adventure
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-10 text-lg"
                asChild
              >
                <Link href="/explore">Browse Treks</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
