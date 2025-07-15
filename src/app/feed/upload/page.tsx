
'use client'

import { useState, ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCustomAuth } from '@/contexts/CustomAuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  ArrowLeft,
  UploadCloud,
  Loader2,
  Save,
  AlertTriangle,
} from 'lucide-react'
import { createPhoto } from '@/services/photos'
import type { CreatePhotoInput } from '@/lib/types'
import NextImage from 'next/image'

const photoFormSchema = z.object({
  image: z.any().refine(files => files?.length > 0, 'Image is required.'),
  caption: z.string().max(500).optional(),
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200).optional(),
})

type PhotoFormValues = z.infer<typeof photoFormSchema>

export default function UploadPhotoPage() {
  const router = useRouter()
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      caption: '',
      destinationName: '',
      tags: '',
    },
  })

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5000000) {
        // 5MB limit
        form.setError('image', {
          type: 'manual',
          message: 'Max file size is 5MB.',
        })
        setImagePreview(null)
        setImageDataUri(null)
        return
      }
      if (
        !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
          file.type
        )
      ) {
        form.setError('image', {
          type: 'manual',
          message: 'Invalid file type. Use JPG, PNG, WEBP, or GIF.',
        })
        setImagePreview(null)
        setImageDataUri(null)
        return
      }
      form.clearErrors('image') // Clear previous errors on new valid file
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageDataUri(result);
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
      setImageDataUri(null)
    }
  }

  async function onSubmit(data: PhotoFormValues) {
    if (!currentUser) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to upload photos.',
      })
      return
    }
    if (!imageDataUri) {
      form.setError('image', {
        type: 'manual',
        message: 'Please select an image.',
      })
      return
    }
    setIsSubmitting(true)

    const photoData: CreatePhotoInput = {
      imageUrl: imageDataUri,
      caption: data.caption,
      destinationName: data.destinationName || undefined,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      userId: currentUser.id,
      userName: currentUser.name || 'Anonymous User',
      userAvatarUrl: currentUser.photoUrl || null,
    }

    try {
      const newPhoto = await createPhoto(photoData)
      if (newPhoto) {
        toast({
          title: 'Photo Uploaded!',
          description: 'Your photo is now live on the feed.',
        })
        router.push('/feed')
      } else {
        throw new Error(
          'Failed to upload photo. The server did not return photo details.'
        )
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description:
          'Could not upload your photo at this time. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authIsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!currentUser && !authIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Share Your Photo</h1>
        <p className="text-muted-foreground mb-4">
          Please sign in to upload your travel photos.
        </p>
        <Button asChild className="mt-6">
          <Link href={`/auth/signin?redirect=/feed/upload`}>
            Sign In to Upload
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center">
        <Button asChild variant="outline" size="sm">
          <Link href="/feed">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Link>
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="font-headline text-3xl text-primary">
            Upload Your Trek Photo
          </CardTitle>
          <CardDescription>
            Share your moments. Max 5MB. JPG, PNG, WEBP, GIF supported.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Image*</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          handleImageChange(e)
                          field.onChange(e.target.files)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {imagePreview && (
                <div className="mt-4">
                  <FormLabel>Image Preview</FormLabel>
                  <div className="relative aspect-video w-full max-w-md mx-auto mt-2 rounded-md border overflow-hidden">
                    <NextImage
                      src={imagePreview}
                      alt="Image preview"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Sunrise view over the peaks..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Roopkund Lake" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional, comma-separated)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="mountains, sunrise, himalayas"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting || authIsLoading}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}{' '}
                Upload Photo
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
