import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        <p className="mt-1">Adventure Awaits. Connect Responsibly.</p>
      </div>
    </footer>
  );
}
