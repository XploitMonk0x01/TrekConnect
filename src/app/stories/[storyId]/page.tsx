
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types";
import { ArrowLeft, BookOpen, MessageSquare, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

const mockStories: Story[] = [
  { id: "s1_in", userId: "u1", userName: "Aanya Sharma", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), title: "Journey to the Mysterious Roopkund Lake", content: "The Roopkund trek in Uttarakhand was an unforgettable journey into the heart of the Himalayas. We navigated through dense rhododendron forests, expansive alpine meadows (bugyals) like Bedni and Ali Bugyal, and challenging snowy paths to reach the enigmatic skeletal lake. The views of Trishul and Nanda Ghunti peaks were a constant, awe-inspiring backdrop. Acclimatization at Ghora Lotani was crucial before the final ascent. Reaching Roopkund, with its human remains visible beneath the icy waters, was a surreal and thought-provoking experience. This trek is a true test of endurance and offers a deep connection with nature and history.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), destinationId: "in1", destinationName: "Roopkund Trek", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 95, commentsCount: 15, tags: ["uttarakhand", "roopkund", "mystery", "high altitude", "himalayas"] },
  { id: "s2_in", userId: "u2", userName: "Rohan Kumar", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), title: "Hampta Pass: A Himalayan Crossover Adventure", content: "Crossing Hampta Pass in Himachal Pradesh felt like stepping into another world. The journey started from the lush green Kullu valley, near Manali, winding through pine forests and alongside gushing rivers. The ascent to the pass was gradual, with campsites like Balu ka Ghera offering stunning night skies. The pass itself, at over 14,000 feet, presented a dramatic shift in scenery – from vibrant green to the stark, barren, yet beautiful desert landscapes of Lahaul. Camping at Shea Goru, with the river Chandra flowing nearby, was a highlight. The optional visit to Chandratal Lake added another layer of magic to this incredible crossover trek.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), destinationId: "in2", destinationName: "Hampta Pass Trek", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 130, commentsCount: 22, tags: ["himachal pradesh", "hampta pass", "adventure", "crossover", "kullu", "lahaul"] },
  { id: "s3_in", userId: "u3", userName: "Mira Singh", userAvatarUrl: PLACEHOLDER_IMAGE_URL(40,40), title: "Winter Magic on the Kedarkantha Trek", content: "My first winter trek to Kedarkantha in Uttarakhand was simply magical. The journey began from Sankri, a quaint village. Walking on fresh snow through pine forests, the crisp mountain air, and the 360-degree panoramic views of Himalayan giants like Swargarohini, Bandarpoonch, and Kalanag from the summit were breathtaking. Juda-ka-Talab, a frozen lake campsite, was surreal under the starlit sky. The summit climb was challenging but immensely rewarding. This trek is perfect for anyone looking to experience the charm of a Himalayan winter.", imageUrl: PLACEHOLDER_IMAGE_URL(1200,600), destinationId: "in4", destinationName: "Kedarkantha Trek", createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), likesCount: 110, commentsCount: 19, tags: ["winter trek", "kedarkantha", "uttarakhand", "snow", "himalayas", "beginner friendly"] },
];

const AITagsDetailedStories: Record<string, string> = {
    "s1_in": "uttarakhand roopkund trek",
    "s2_in": "himachal hampta pass",
    "s3_in": "kedarkantha winter snow"
};

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    text: string;
    createdAt: string;
}

const mockComments: Comment[] = [
    { id: "c1", userId: "u3", userName: "Rajesh", userAvatarUrl: PLACEHOLDER_IMAGE_URL(32,32), text: "Wow, Aanya! Roopkund sounds incredible. Adding it to my list!", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "c2", userId: "u4", userName: "Priya", userAvatarUrl: PLACEHOLDER_IMAGE_URL(32,32), text: "Amazing pictures and story, Rohan! Hampta Pass is a classic.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: "c3", userId: "u1", userName: "Aanya", userAvatarUrl: PLACEHOLDER_IMAGE_URL(32,32), text: "Thanks for sharing your Kedarkantha experience, Mira! Looks stunning in winter.", createdAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000).toISOString() },
];


export default function StoryDetailPage({ params }: { params: { storyId: string } }) {
  const story = mockStories.find(s => s.id === params.storyId);

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold">Story not found</h1>
        <p className="text-muted-foreground">The story you are looking for does not exist or has been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/stories">Back to Stories</Link>
        </Button>
      </div>
    );
  }
  
  const storyComments = mockComments.filter(c => Math.random() > 0.3).slice(0,3); // Random comments for demo

  const storyWithAIHint = {
    ...story,
    imageUrl: story.imageUrl ? `${story.imageUrl}?ai_hint=${AITagsDetailedStories[story.id as keyof typeof AITagsDetailedStories] || 'trekking india'}` : undefined,
    userAvatarUrl: `${story.userAvatarUrl}?ai_hint=person ${story.userName.split(' ')[0]}`
  };
  

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Button asChild variant="outline">
          <Link href="/stories">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stories
          </Link>
        </Button>
      </div>

      <StoryCard story={storyWithAIHint} isDetailedView={true} />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Comments ({storyComments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border">
              <AvatarImage src={PLACEHOLDER_IMAGE_URL(36,36)} alt="Your avatar" data-ai-hint="person user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea placeholder="Write a comment..." className="mb-2" />
              <Button size="sm">Post Comment</Button>
            </div>
          </div>
          {storyComments.length > 0 ? (
            storyComments.map(comment => (
              <div key={comment.id} className="flex items-start gap-3 pt-4 border-t">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={comment.userAvatarUrl || PLACEHOLDER_IMAGE_URL(36,36)} alt={comment.userName} data-ai-hint={`person ${comment.userName.split(' ')[0]}`}/>
                  <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">{comment.text}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary">
                      <ThumbsUp className="h-3 w-3 mr-1" /> Like
                    </Button>
                     <Button variant="ghost" size="sm" className="h-auto p-1 text-xs text-muted-foreground hover:text-primary">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
