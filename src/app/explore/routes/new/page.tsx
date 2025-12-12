'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowLeft,
  MapPinned,
  Loader2,
  Sparkles,
  Route,
  CalendarDays,
  Mountain,
  ListChecks,
  AlertTriangle,
} from 'lucide-react'
import { getDestinationById } from '@/services/destinations'
import type { Destination } from '@/lib/types'
import {
  generateCustomTrekRoute,
  GenerateCustomTrekRouteInput,
  GenerateCustomTrekRouteOutput,
} from '@/ai/flows/generate-custom-trek-route-flow'
import { useToast } from '@/hooks/use-toast'

const routeFormSchema = z.object({
  destinationName: z
    .string()
    .min(3, 'Destination name must be at least 3 characters.'),
  durationDays: z.coerce
    .number()
    .min(1, 'Duration must be at least 1 day.')
    .max(30, 'Duration cannot exceed 30 days.'),
  difficulty: z.enum(['Easy', 'Moderate', 'Challenging', 'Expert'], {
    required_error: 'Please select a difficulty level.',
  }),
  specificInterests: z
    .string()
    .max(500, 'Interests cannot exceed 500 characters.')
    .optional(),
})

type RouteFormValues = z.infer<typeof routeFormSchema>

function NewCustomRouteForm() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [isLoadingDestination, setIsLoadingDestination] = useState(false)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [generatedRoute, setGeneratedRoute] =
    useState<GenerateCustomTrekRouteOutput | null>(null)

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      destinationName: '',
      durationDays: 7,
      difficulty: 'Moderate',
      specificInterests: '',
    },
  })

  useEffect(() => {
    const destinationId = searchParams.get('destinationId')
    if (destinationId) {
      setIsLoadingDestination(true)
      getDestinationById(destinationId)
        .then((data) => {
          if (data) {
            setDestination(data)
            form.setValue('destinationName', data.name)
          } else {
            toast({
              variant: 'destructive',
              title: 'Error',
              description: `Could not find destination with ID: ${destinationId}`,
            })
          }
        })
        .catch((err) => {
          console.error('Failed to fetch destination:', err)
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load destination details.',
          })
        })
        .finally(() => setIsLoadingDestination(false))
    }
  }, [searchParams, form, toast])

  async function onSubmit(values: RouteFormValues) {
    setIsLoadingRoute(true)
    setGeneratedRoute(null)
    try {
      const input: GenerateCustomTrekRouteInput = {
        destinationName: values.destinationName,
        durationDays: values.durationDays,
        difficulty: values.difficulty,
        specificInterests: values.specificInterests,
      }
      const result = await generateCustomTrekRoute(input)
      setGeneratedRoute(result)
      toast({
        title: 'Trek Route Generated!',
        description: 'Your custom trek plan is ready.',
      })
    } catch (error) {
      console.error('Error generating custom trek route:', error)
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not generate trek route. Please try again or refine your inputs.',
      })
    } finally {
      setIsLoadingRoute(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center">
        <Button asChild variant="outline" size="sm">
          <Link href={destination ? `/explore/${destination.id}` : '/explore'}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to{' '}
            {destination ? destination.name : 'Explore'}
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <MapPinned className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="font-headline text-3xl text-primary">
            Create Your Custom Trek Route
          </CardTitle>
          <CardDescription>
            Tell us your preferences, and our AI will craft a unique Indian
            Himalayan adventure for you!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="destinationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination/Area*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Manali, Roopkund Area, Ladakh"
                        {...field}
                        disabled={isLoadingDestination || !!destination}
                      />
                    </FormControl>
                    <FormMessage />
                    {isLoadingDestination && (
                      <p className="text-sm text-muted-foreground">
                        Loading destination name...
                      </p>
                    )}
                    {destination && (
                      <p className="text-sm text-muted-foreground">
                        Planning for: {destination.name}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="durationDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)*</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Easy">Easy</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Challenging">
                            Challenging
                          </SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="specificInterests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Interests (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., alpine lakes, photography, less crowded, cultural experiences"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoadingRoute || isLoadingDestination}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90"
              >
                {isLoadingRoute ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Trek Route
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoadingRoute && (
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">
              Our AI is crafting your custom trek... this might take a moment!
            </p>
          </CardContent>
        </Card>
      )}

      {generatedRoute && (
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <Route className="mr-2 h-6 w-6" /> {generatedRoute.routeName}
            </CardTitle>
            <CardDescription>{generatedRoute.overview}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-muted rounded-md">
                <strong>Duration:</strong>{' '}
                {generatedRoute.suggestedDurationDays} days
              </div>
              <div className="p-3 bg-muted rounded-md">
                <strong>Difficulty:</strong> {generatedRoute.difficultyRating}
              </div>
              <div className="p-3 bg-muted rounded-md">
                <strong>Best Season:</strong>{' '}
                {generatedRoute.bestSeason || 'N/A'}
              </div>
            </div>

            <div>
              <h3 className="font-headline text-lg mt-4 mb-2 flex items-center">
                <CalendarDays className="mr-2 h-5 w-5 text-primary" /> Daily
                Itinerary:
              </h3>
              {generatedRoute.dailyItinerary.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {generatedRoute.dailyItinerary.map((item) => (
                    <AccordionItem value={`day-${item.day}`} key={item.day}>
                      <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 rounded-md">
                        Day {item.day}: {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 py-3 space-y-2 text-sm">
                        <p className="text-foreground/90">
                          {item.routeDescription}
                        </p>
                        {item.altitude && (
                          <p className="text-xs text-muted-foreground">
                            Altitude: {item.altitude}
                          </p>
                        )}
                        {item.highlights && item.highlights.length > 0 && (
                          <div>
                            <strong className="text-xs font-semibold">
                              Highlights:
                            </strong>
                            <ul className="list-disc list-inside ml-4 text-muted-foreground">
                              {item.highlights.map((highlight, idx) => (
                                <li key={idx}>{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="flex items-center text-muted-foreground p-4 border rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                  The AI could not generate a daily itinerary. Please try
                  refining your request.
                </div>
              )}
            </div>

            {generatedRoute.preparationNotes &&
              generatedRoute.preparationNotes.length > 0 && (
                <div>
                  <h3 className="font-headline text-lg mt-4 mb-2 flex items-center">
                    <Mountain className="mr-2 h-5 w-5 text-primary" />{' '}
                    Preparation Notes:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 bg-muted p-4 rounded-md">
                    {generatedRoute.preparationNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

            {generatedRoute.gearSuggestions &&
              generatedRoute.gearSuggestions.length > 0 && (
                <div>
                  <h3 className="font-headline text-lg mt-4 mb-2 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-primary" /> Key
                    Gear Suggestions:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 bg-muted p-4 rounded-md">
                    {generatedRoute.gearSuggestions.map((gear, idx) => (
                      <li key={idx}>{gear}</li>
                    ))}
                  </ul>
                </div>
              )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              AI-generated route. Always verify details and prepare adequately
              before any trek.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

export default function NewCustomRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">
              Loading route generator...
            </span>
          </div>
        </div>
      }
    >
      <NewCustomRouteForm />
    </Suspense>
  )
}
