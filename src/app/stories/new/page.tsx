
'use client';

import { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomAuth } from '@/contexts/CustomAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Loader2, Save, ImagePlus, AlertTriangle, Sparkles } from 'lucide-react';
import { createStory } from '@/services/stories';
import type { CreateStoryInput } from '@/lib/types';
import NextImage from 'next/image';
import { suggestStoryTags } from '@/ai/flows/suggest-story-tags-flow';

const storyFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title cannot exceed 100 characters."),
  content: z.string().min(50, "Story content must be at least 50 characters.").max(10000, "Story content is too long."),
  coverImageFile: z.any().optional(),
  imageUrl: z.string().optional(), // Can be a data URI from upload or an external URL. Validation happens on submit.
  destinationName: z.string().max(100).optional(),
  tags: z.string().max(200).optional(),
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

export default function NewStoryPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authIsLoading } = useCustomAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: { title: '', content: '', imageUrl: '', destinationName: '', tags: '' },
  });

  const handleCoverImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
          form.setError("imageUrl", { type: "manual", message: "Max file size is 5MB." });
          setCoverImagePreview(null); form.setValue("imageUrl", ""); return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
          form.setError("imageUrl", { type: "manual", message: "Invalid image type. Use JPG, PNG, WEBP, GIF." });
          setCoverImagePreview(null); form.setValue("imageUrl", ""); return;
      }
      form.clearErrors("imageUrl");
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverImagePreview(result);
        form.setValue('imageUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImagePreview(null);
      if(form.getValues('imageUrl')?.startsWith('data:image')) {
        form.setValue('imageUrl', '');
      }
    }
  };

  const handleSuggestTags = async () => {
    const title = form.getValues('title');
    const content = form.getValues('content');

    if (!title || title.length < 5 || !content || content.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Content Required',
        description: 'Please provide a title (min 5 chars) and some content (min 20 chars) to suggest tags.',
      });
      return;
    }
    setIsSuggestingTags(true);
    try {
      const result = await suggestStoryTags({ title, contentPreview: content.substring(0, 500) });
      if (result.suggestedTags && result.suggestedTags.length > 0) {
        form.setValue('tags', result.suggestedTags.join(', '));
        toast({ title: 'AI Tags Suggested!', description: 'Review and adjust the tags as needed.' });
      } else {
        toast({ title: 'No Tags Suggested', description: 'The AI couldn\'t suggest tags for this content. Please add them manually.' });
      }
    } catch (error) {
      console.error("Error suggesting tags:", error);
      toast({ variant: 'destructive', title: 'Tag Suggestion Failed', description: 'Could not suggest tags at this time.' });
    } finally {
      setIsSuggestingTags(false);
    }
  };


  async function onSubmit(data: StoryFormValues) {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to publish a story.' });
      return;
    }
    setIsSubmitting(true);

    const storyInputData: CreateStoryInput = {
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl || null,
      destinationName: data.destinationName || undefined,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      userId: currentUser.id,
      userName: currentUser.name || 'Anonymous Author',
      userAvatarUrl: currentUser.photoUrl || null,
    };

    try {
      const newStory = await createStory(storyInputData);
      if (newStory && newStory.id) {
        toast({ title: 'Story Published!', description: 'Your adventure has been shared with the community.' });
        router.push(`/stories/${newStory.id}`);
      } else {
        throw new Error('Failed to create story. Server did not return story details.');
      }
    } catch (error) {
      console.error("Error creating story:", error);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not publish your story at this time. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authIsLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading...</span></div>;
  }

  if (!currentUser && !authIsLoading) {
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
        <Button asChild variant="outline" size="sm">
          <Link href="/stories"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories</Link>
        </Button>
      </div>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-primary mb-3" />
          <CardTitle className="font-headline text-3xl text-primary">
            Write Your Travel Story
          </CardTitle>
          <CardDescription>Share experiences from your Indian treks. Describe the journey, sights, and tips!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title*</FormLabel><FormControl><Input placeholder="My Epic Journey to the Valley of Flowers" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="content" render={({ field }) => ( <FormItem><FormLabel>Your Story*</FormLabel><FormControl><Textarea placeholder="Describe your adventure in detail..." {...field} rows={15} /></FormControl><FormMessage /></FormItem> )} />

              <FormField control={form.control} name="coverImageFile" render={({ field: { onChange, onBlur, name, ref }}) => (
                <FormItem>
                  <FormLabel htmlFor="cover-image-upload">Cover Image (Optional)</FormLabel>
                  <div className="flex items-start gap-4">
                    <Input
                      id="cover-image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        handleCoverImageChange(e);
                        onChange(e.target.files);
                      }}
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('cover-image-upload')?.click()}>
                        <ImagePlus className="mr-2 h-4 w-4"/> Select Image
                    </Button>
                    {coverImagePreview && ( <NextImage src={coverImagePreview} alt="Cover preview" width={120} height={67} className="h-auto w-30 rounded border object-cover"/> )}
                  </div>
                </FormItem>
              )}/>
               <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem className="mt-2">
                      <FormLabel className="text-xs text-muted-foreground">Or paste image URL (if not uploading)</FormLabel>
                      <FormControl><Input type="url" placeholder="https://example.com/image.jpg" {...field}
                        onChange={(e) => {
                            field.onChange(e);
                            if(!e.target.value.startsWith('data:image')) {
                                setCoverImagePreview(null);
                            }
                        }}
                      /></FormControl>
                      <FormMessage />
                  </FormItem>
              )} />

              <FormField control={form.control} name="destinationName" render={({ field }) => ( <FormItem><FormLabel>Destination (Optional)</FormLabel><FormControl><Input placeholder="Hampta Pass, Himachal Pradesh" {...field} /></FormControl><FormMessage /></FormItem> )} />

              <div className="space-y-2">
                <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem><FormLabel>Tags (Optional, comma-separated)</FormLabel><FormControl><Input placeholder="himalayas, adventure, solo travel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="button" variant="outline" size="sm" onClick={handleSuggestTags} disabled={isSuggestingTags || authIsLoading || !form.watch('title') || !form.watch('content')}>
                  {isSuggestingTags ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Suggest Tags with AI
                </Button>
              </div>

              <Button type="submit" disabled={isSubmitting || authIsLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Publish Story
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
