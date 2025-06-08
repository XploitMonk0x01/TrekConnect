import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Story } from '@/lib/types';
import { CalendarDays, MessageCircle, Heart, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

interface StoryCardProps {
  story: Story;
  isDetailedView?: boolean; // To control content truncation
}

export function StoryCard({ story, isDetailedView = false }: StoryCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {story.imageUrl && (
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={story.imageUrl}
            alt={story.title}
            layout="fill"
            objectFit="cover"
            data-ai-hint="travel story"
          />
        </div>
      )}
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={story.userAvatarUrl || PLACEHOLDER_IMAGE_URL(40,40) + `?text=${story.userName.charAt(0)}`} alt={story.userName} data-ai-hint="person avatar"/>
          <AvatarFallback>{story.userName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="grid gap-0.5">
          <Link href={`/profile/${story.userId}`} className="font-semibold hover:underline">{story.userName}</Link>
          <div className="text-xs text-muted-foreground flex items-center">
            <CalendarDays className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
            {story.updatedAt && story.updatedAt !== story.createdAt && ` (edited ${formatDistanceToNow(new Date(story.updatedAt), { addSuffix: true })})`}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-2">
          <Link href={`/stories/${story.id}`} className="hover:text-primary transition-colors">
            {story.title}
          </Link>
        </CardTitle>
        {story.destinationName && <Badge variant="secondary" className="mb-2">Destination: {story.destinationName}</Badge>}
        <CardDescription className={isDetailedView ? "prose dark:prose-invert max-w-none" : "line-clamp-4 text-foreground/80"}>
          {isDetailedView ? story.content : (story.content.substring(0, 200) + (story.content.length > 200 ? "..." : ""))}
        </CardDescription>
        {story.tags && story.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {story.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <Heart className="h-5 w-5 mr-1" />
            <span>{story.likesCount || 0}</span>
          </button>
          <button className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="h-5 w-5 mr-1" />
            <span>{story.commentsCount || 0}</span>
          </button>
        </div>
        {!isDetailedView && (
          <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/5">
            <Link href={`/stories/${story.id}`}>
              Read More <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
