import Link from 'next/link';
import { MountainSnow } from 'lucide-react';

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-semibold font-headline text-primary">
      <MountainSnow className="h-7 w-7" />
      <span>TrekConnect</span>
    </Link>
  );
}
