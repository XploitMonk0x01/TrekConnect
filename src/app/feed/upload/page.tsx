
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPhotoPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="flex items-center">
         <Button asChild variant="outline">
          <Link href="/feed">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <UploadCloud className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="font-headline text-3xl text-primary">Upload Your Trek Photo</CardTitle>
          <CardDescription>Share your amazing moments from the trails with the TrekConnect community.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="p-8 border-2 border-dashed border-muted-foreground/50 rounded-lg">
            <p className="text-muted-foreground">
              The full photo upload functionality is currently under development. 
              Soon, you'll be able to select your photo, add a caption, tag the destination, and share it!
            </p>
            <p className="text-sm text-accent mt-2">Stay tuned for updates!</p>
          </div>
          <Button disabled className="bg-accent hover:bg-accent/80">
            Select Photo (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
