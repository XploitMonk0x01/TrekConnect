'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Loader2,
  Mountain,
  MapPin,
  Image as ImageIcon,
  Plus,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface EditDestinationPageProps {
  params: Promise<{ id: string }>
}

export default function EditDestinationPage({
  params,
}: EditDestinationPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [altitude, setAltitude] = useState('')
  const [travelTips, setTravelTips] = useState('')
  const [aiHint, setAiHint] = useState('')
  const [attractions, setAttractions] = useState<string[]>([])
  const [newAttraction, setNewAttraction] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  // Fetch destination data
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const res = await fetch(`/api/admin/destinations/${id}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        setName(data.name || '')
        setDescription(data.description || '')
        setImageUrl(data.imageUrl || '')
        setCountry(data.country || '')
        setRegion(data.region || '')
        setAltitude(data.altitude?.toString() || '')
        setTravelTips(data.travelTips || '')
        setAiHint(data.aiHint || '')
        setAttractions(data.attractions || [])
        setLat(data.coordinates?.lat?.toString() || '')
        setLng(data.coordinates?.lng?.toString() || '')
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load destination',
          variant: 'destructive',
        })
        router.push('/admin/destinations')
      } finally {
        setLoading(false)
      }
    }

    fetchDestination()
  }, [id, router, toast])

  const handleAddAttraction = () => {
    if (newAttraction.trim()) {
      setAttractions([...attractions, newAttraction.trim()])
      setNewAttraction('')
    }
  }

  const handleRemoveAttraction = (index: number) => {
    setAttractions(attractions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        name,
        description,
        imageUrl,
        country,
        region,
        altitude: altitude ? Number(altitude) : null,
        travelTips,
        aiHint: aiHint || name.toLowerCase(),
        attractions,
        coordinates: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
      }

      const res = await fetch(`/api/admin/destinations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update')
      }

      toast({
        title: 'Success!',
        description: 'Destination updated successfully.',
      })

      router.push('/admin/destinations')
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to update destination',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/destinations"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Destinations
        </Link>
        <h1 className="text-3xl font-bold font-heading">Edit Destination</h1>
        <p className="text-muted-foreground mt-1">Update destination details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mountain className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the basic details of the destination
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Everest Base Camp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="altitude">Altitude (meters)</Label>
                <Input
                  id="altitude"
                  type="number"
                  placeholder="e.g., 5364"
                  value={altitude}
                  onChange={(e) => setAltitude(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the trek destination..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiHint">AI Hint (for image search)</Label>
              <Input
                id="aiHint"
                placeholder="Keywords for AI image generation"
                value={aiHint}
                onChange={(e) => setAiHint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the destination name
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
            <CardDescription>
              Where is this destination located?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="e.g., Nepal"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  placeholder="e.g., Khumbu"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  placeholder="e.g., 27.9881"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  placeholder="e.g., 86.9250"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Media
            </CardTitle>
            <CardDescription>Add an image for this destination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            {imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-xs rounded-lg border"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attractions */}
        <Card>
          <CardHeader>
            <CardTitle>Attractions</CardTitle>
            <CardDescription>
              Key attractions or highlights of this destination
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add an attraction..."
                value={newAttraction}
                onChange={(e) => setNewAttraction(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddAttraction()
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddAttraction}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {attractions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attractions.map((attraction, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {attraction}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttraction(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Travel Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Tips</CardTitle>
            <CardDescription>
              Helpful tips for travelers visiting this destination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share travel tips, best time to visit, what to pack, etc..."
              value={travelTips}
              onChange={(e) => setTravelTips(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/destinations">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving || !name}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
