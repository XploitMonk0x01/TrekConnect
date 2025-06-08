
'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UploadCloud, Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { createPhoto } from '@/services/photos';
import type { CreatePhotoInput } from '@/lib/types';
import NextImage from 'next/image'; // Using NextImage for preview

const photoFormSchema = z.object({
  image: z.any() // For file input; actual validation done manually
    .refine(files => files?.length > 0, 'Image is required.')
    .refine(files => files?.[0]?.size <= 5000000, `Max file size is 5MB.`) // 5MB limit
    .refine(
      files => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ).optional(), // Optional initially, will validate on submit if no data URI
  imageDataUri: z.string().optional(), // Hidden field to store Data URI
  caption: z.string().max(500, { message: "Caption must not exceed 500 characters." }).optional(),
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200).optional(), // Comma-separated
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

export default function UploadPhotoPage() {
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth(); // Renamed to firebaseUser for clarity
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      caption: '',
      destinationName: '',
      tags: '',
      imageDataUri: '',
    },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size again here for immediate feedback if needed
      if (file.size > 5000000) {
          form.setError("image", { type: "manual", message: "Max file size is 5MB." });
          setImagePreview(null);
          form.setValue("imageDataUri", "");
          return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          form.setError("image", { type: "manual", message: "Invalid file type." });
          setImagePreview(null);
          form.setValue("imageDataUri", "");
          return;
      }
      form.clearErrors("image");


      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageDataUri', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      form.setValue('imageDataUri', '');
    }
  };

  async function onSubmit(data: PhotoFormValues) {
    if (!firebaseUser) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to upload a photo.' });
      return;
    }
    if (!data.imageDataUri) {
        form.setError("image", { type: "manual", message: "Please select an image to upload."});
        toast({ variant: 'destructive', title: 'Image Required', description: 'Please select an image file.' });
        return;
    }

    setIsSubmitting(true);

    const photoData: CreatePhotoInput = {
      imageUrl: data.imageDataUri, // This is the Data URI
      caption: data.caption,
      destinationName: data.destinationName || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };

    try {
      const newPhoto = await createPhoto(photoData, {
        id: firebaseUser.uid, // Firebase UID
        name: firebaseUser.displayName, // Firebase Display Name
        photoUrl: firebaseUser.photoURL // Firebase Photo URL
      });

      if (newPhoto) {
        toast({ title: 'Photo Uploaded!', description: 'Your photo is now live on the feed.' });
        router.push('/feed');
      } else {
        throw new Error('Failed to upload photo.');
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your photo. Please try again. Large images might cause issues.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!firebaseUser && !authLoading) {
     return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Share Your Photo</h1>
        <p className="text-muted-foreground mb-4">Please sign in to upload your travel photos.</p>
        <Button asChild>
          <Link href={`/auth/signin?redirect=/feed/upload`}>Sign In to Upload</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/feed">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Link>
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="font-headline text-3xl text-primary">Upload Your Trek Photo</CardTitle>
          <CardDescription>Share your amazing moments from the trails. (Images are stored as Data URIs for now - max 5MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...restField } }) => ( // Exclude value from being passed to input type="file"
                  <FormItem>
                    <FormLabel>Select Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          handleImageChange(e); // Custom handler
                          onChange(e.target.files); // RHF handler for file object
                        }}
                        {...restField} // Pass rest of RHF props
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
                    <NextImage src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
                  </div>
                </div>
              )}
              
              {/* Hidden field to store Data URI for submission */}
              <FormField control={form.control} name="imageDataUri" render={({ field }) => <Input type="hidden" {...field} />} />


              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caption (Optional)</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Sunrise view from a Himalayan peak!" {...field} rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Name (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Roopkund Lake, Uttarakhand" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., mountains, sunrise, trekking" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || authLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Upload Photo
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
