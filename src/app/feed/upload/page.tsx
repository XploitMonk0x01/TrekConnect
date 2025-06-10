
'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Removed useAuth
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UploadCloud, Loader2, Save, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { createPhoto } from '@/services/photos';
import type { CreatePhotoInput } from '@/lib/types';
import NextImage from 'next/image';

const photoFormSchema = z.object({
  image: z.any()
    .refine(files => files?.length > 0, 'Image is required.')
    .refine(files => files?.[0]?.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      files => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    ).optional(),
  imageDataUri: z.string().optional(),
  caption: z.string().max(500).optional(),
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200).optional(),
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

export default function UploadPhotoPage() {
  const router = useRouter();
  // const { user: firebaseUser, loading: authLoading } = useAuth(); // Removed
  // Simulate auth state
  const currentUser = null; // Placeholder for user from custom auth
  const authLoading = false; // Placeholder

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: { caption: '', destinationName: '', tags: '', imageDataUri: '' },
  });

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
          form.setError("image", { type: "manual", message: "Max file size is 5MB." });
          setImagePreview(null); form.setValue("imageDataUri", ""); return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          form.setError("image", { type: "manual", message: "Invalid file type." });
          setImagePreview(null); form.setValue("imageDataUri", ""); return;
      }
      form.clearErrors("image");
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue('imageDataUri', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null); form.setValue('imageDataUri', '');
    }
  };

  async function onSubmit(data: PhotoFormValues) {
    // if (!currentUser) { // currentUser from custom auth
    //   toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
    //   return;
    // }
    if (!data.imageDataUri) {
        form.setError("image", { type: "manual", message: "Please select an image."});
        toast({ variant: 'destructive', title: 'Image Required', description: 'Please select an image file.' });
        return;
    }
    setIsSubmitting(true);

    // const photoOwner = { // Get from custom auth context
    //   id: currentUser.id, 
    //   name: currentUser.name,
    //   photoUrl: currentUser.photoUrl
    // };

    const photoData: CreatePhotoInput = {
      imageUrl: data.imageDataUri,
      caption: data.caption,
      destinationName: data.destinationName || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      // These will be provided by your custom auth user object
      userId: "temp-user-id", // Replace with actual user ID from custom auth
      userName: "Temp User", // Replace with actual user name from custom auth
      userAvatarUrl: null, // Replace with actual user avatar from custom auth
    };

    try {
      // const newPhoto = await createPhoto(photoData, photoOwner); // Pass custom user object
      const newPhoto = await createPhoto(photoData); // createPhoto service needs to be updated
      if (newPhoto) {
        toast({ title: 'Photo Uploaded!', description: 'Your photo is now live.' });
        router.push('/feed');
      } else {
        throw new Error('Failed to upload photo.');
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your photo.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) { // authLoading from custom auth
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!currentUser && !authLoading) { // currentUser from custom auth
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold">Share Your Photo</h1>
        <p className="text-muted-foreground mb-4">Please sign in to upload your travel photos.</p>
        <Button asChild className="mt-6">
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
          <CardDescription>Share your moments. Max 5MB. Images stored as Data URIs.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="image" render={({ field: { onChange, value, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Select Image</FormLabel>
                    <FormControl><Input type="file" accept="image/*" onChange={(e) => { handleImageChange(e); onChange(e.target.files); }} {...restField} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              {imagePreview && (
                <div className="mt-4"><FormLabel>Image Preview</FormLabel>
                  <div className="relative aspect-video w-full max-w-md mx-auto mt-2 rounded-md border overflow-hidden">
                    <NextImage src={imagePreview} alt="Image preview" layout="fill" objectFit="contain" />
                  </div></div> )}
              <FormField control={form.control} name="imageDataUri" render={({ field }) => <Input type="hidden" {...field} />} />
              <FormField control={form.control} name="caption" render={({ field }) => ( <FormItem><FormLabel>Caption</FormLabel><FormControl><Textarea placeholder="Sunrise view..." {...field} rows={3} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="destinationName" render={({ field }) => ( <FormItem><FormLabel>Destination</FormLabel><FormControl><Input placeholder="Roopkund Lake" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input placeholder="mountains, sunrise" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <Button type="submit" disabled={isSubmitting || authLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Upload
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
