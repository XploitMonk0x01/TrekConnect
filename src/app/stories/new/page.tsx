
'use client';

import { useState } from 'react';
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
import { ArrowLeft, BookOpen, Loader2, Save, ImagePlus } from 'lucide-react';
import { createStory } from '@/services/stories';
import type { CreateStoryInput } from '@/lib/types';

const storyFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(100, { message: "Title must not exceed 100 characters."}),
  content: z.string().min(50, { message: "Story content must be at least 50 characters." }).max(10000, { message: "Story content is too long."}),
  imageUrl: z.string().url({ message: "Please enter a valid image URL."}).or(z.literal('')).optional(),
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200, {message: "Tags string is too long."}).optional(), // Comma-separated
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

export default function NewStoryPage() {
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useAuth(); // Renamed to firebaseUser
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  // const [coverImageFile, setCoverImageFile] = useState<File | null>(null); // Not strictly needed if only Data URI is stored


  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: '',
      content: '',
      imageUrl: '',
      destinationName: '',
      tags: '',
    },
  });

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic client-side validation (optional, as Zod handles it on submit too for URL)
      if (file.size > 5000000) { // Example: 5MB limit
          form.setError("imageUrl", { type: "manual", message: "Max file size is 5MB." });
          setCoverImagePreview(null);
          form.setValue("imageUrl", "");
          return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          form.setError("imageUrl", { type: "manual", message: "Invalid image type." });
          setCoverImagePreview(null);
          form.setValue("imageUrl", "");
          return;
      }
      form.clearErrors("imageUrl");
      // setCoverImageFile(file); // Store file if needed for direct upload later
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        form.setValue('imageUrl', reader.result as string, { shouldValidate: true }); // Store Data URI
      };
      reader.readAsDataURL(file);
    } else {
      // setCoverImageFile(null);
      setCoverImagePreview(null);
      form.setValue('imageUrl', '');
    }
  };


  async function onSubmit(data: StoryFormValues) {
    if (!firebaseUser) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to create a story.' });
      return;
    }
    setIsSubmitting(true);

    const storyData: CreateStoryInput = {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl || null, 
      destinationName: data.destinationName || undefined,
      destinationId: undefined, 
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };

    try {
      const newStory = await createStory(storyData, {
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        photoUrl: firebaseUser.photoURL 
      });

      if (newStory) {
        toast({ title: 'Story Published!', description: 'Your adventure has been shared.' });
        router.push(`/stories/${newStory.id}`);
      } else {
        throw new Error('Failed to create story.');
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not publish your story. Please try again.' });
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
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Share Your Story</h1>
        <p className="text-muted-foreground mb-4">Please sign in to write and publish your travel adventures.</p>
        <Button asChild>
          <Link href={`/auth/signin?redirect=/stories/new`}>Sign In to Write Story</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/stories">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <BookOpen className="mr-3 h-8 w-8" /> Write Your Travel Story
          </CardTitle>
          <CardDescription>Share your experiences, insights, and breathtaking moments from your Indian treks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Title</FormLabel>
                    <FormControl><Input placeholder="e.g., My Epic Journey to Roopkund Lake" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Story</FormLabel>
                    <FormControl><Textarea placeholder="Describe your adventure in detail..." {...field} rows={15} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel htmlFor="cover-image-upload">Cover Image (Optional - Data URI for now)</FormLabel>
                <div className="flex items-center gap-4">
                    <Input
                      id="cover-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('cover-image-upload')?.click()}>
                        <ImagePlus className="mr-2 h-4 w-4"/> Select Image
                    </Button>
                    {coverImagePreview && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverImagePreview} alt="Cover preview" className="h-20 w-auto rounded border object-cover"/>
                    )}
                </div>
                {/* This field will pass the Data URI or the manually pasted URL */}
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                    <FormItem className="mt-2">
                        <FormLabel className="text-xs text-muted-foreground">Or paste image URL (if not uploading)</FormLabel>
                        <FormControl>
                            <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </FormItem>


              <FormField
                control={form.control}
                name="destinationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Name (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., Hampta Pass, Ladakh" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="e.g., himalayas, adventure, solo travel, budget trek" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting || authLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Publish Story
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
