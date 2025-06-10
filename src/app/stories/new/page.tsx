
'use client';

import { useState } from 'react';
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
import { ArrowLeft, BookOpen, Loader2, Save, ImagePlus, AlertTriangle } from 'lucide-react';
import { createStory } from '@/services/stories';
import type { CreateStoryInput } from '@/lib/types'; // UserProfile part of this type needs update

const storyFormSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(50).max(10000),
  imageUrl: z.string().url().or(z.literal('')).optional(), // For Data URI or external URL
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200).optional(),
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

export default function NewStoryPage() {
  const router = useRouter();
  // const { user: firebaseUser, loading: authLoading } = useAuth(); // Removed
  // Simulate auth state
  const currentUser = null; // Placeholder for user from custom auth
  const authLoading = false; // Placeholder

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: { title: '', content: '', imageUrl: '', destinationName: '', tags: '' },
  });

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
          form.setError("imageUrl", { type: "manual", message: "Max file size is 5MB." });
          setCoverImagePreview(null); form.setValue("imageUrl", ""); return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          form.setError("imageUrl", { type: "manual", message: "Invalid image type." });
          setCoverImagePreview(null); form.setValue("imageUrl", ""); return;
      }
      form.clearErrors("imageUrl");
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
        form.setValue('imageUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImagePreview(null); form.setValue('imageUrl', '');
    }
  };

  async function onSubmit(data: StoryFormValues) {
    // if (!currentUser) { // currentUser from custom auth
    //   toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
    //   return;
    // }
    setIsSubmitting(true);

    const storyInputData: CreateStoryInput = {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl || null,
      destinationName: data.destinationName || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      // These will be provided by your custom auth user object
      userId: "temp-user-id", // Replace with actual user ID from custom auth
      userName: "Temp User", // Replace with actual user name from custom auth
      userAvatarUrl: null, // Replace with actual user avatar from custom auth
    };

    try {
      // const newStory = await createStory(storyInputData, currentUser); // Pass custom user object
      const newStory = await createStory(storyInputData); // createStory service needs update
      if (newStory) {
        toast({ title: 'Story Published!', description: 'Your adventure has been shared.' });
        router.push(`/stories/${newStory.id}`);
      } else {
        throw new Error('Failed to create story.');
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not publish your story.' });
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
        <h1 className="text-2xl font-semibold">Share Your Story</h1>
        <p className="text-muted-foreground mb-4">Please sign in to write and publish your travel adventures.</p>
        <Button asChild className="mt-6">
          <Link href={`/auth/signin?redirect=/stories/new`}>Sign In to Write Story</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/stories"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories</Link>
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center">
            <BookOpen className="mr-3 h-8 w-8" /> Write Your Travel Story
          </CardTitle>
          <CardDescription>Share experiences from your Indian treks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="My Epic Journey..." {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="content" render={({ field }) => ( <FormItem><FormLabel>Your Story</FormLabel><FormControl><Textarea placeholder="Describe your adventure..." {...field} rows={15} /></FormControl><FormMessage /></FormItem> )} />
              <FormItem>
                <FormLabel htmlFor="cover-image-upload">Cover Image (Optional)</FormLabel>
                <div className="flex items-center gap-4">
                    <Input id="cover-image-upload" type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('cover-image-upload')?.click()}>
                        <ImagePlus className="mr-2 h-4 w-4"/> Select Image
                    </Button>
                    {coverImagePreview && ( /* eslint-disable-next-line @next/next/no-img-element */ <img src={coverImagePreview} alt="Cover preview" className="h-20 w-auto rounded border object-cover"/> )}
                </div>
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem className="mt-2">
                        <FormLabel className="text-xs text-muted-foreground">Or paste image URL</FormLabel>
                        <FormControl><Input type="url" placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem> )} />
              </FormItem>
              <FormField control={form.control} name="destinationName" render={({ field }) => ( <FormItem><FormLabel>Destination</FormLabel><FormControl><Input placeholder="Hampta Pass" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input placeholder="himalayas, adventure" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <Button type="submit" disabled={isSubmitting || authLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Publish
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
