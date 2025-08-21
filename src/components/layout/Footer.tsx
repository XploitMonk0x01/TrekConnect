import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import { Heart, MapPin, Camera, Users } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8 lg:py-12">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-headline text-foreground">
              {APP_NAME}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connect with fellow trekkers, discover breathtaking destinations,
              and share your adventure stories.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-accent" />
              <span>Adventure Awaits</span>
            </div>
          </div>

          {/* Explore links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Explore</h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/explore"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Destinations
                </div>
              </Link>
              <Link
                href="/feed"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Camera className="h-3 w-3" />
                  Photo Feed
                </div>
              </Link>
              <Link
                href="/stories"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Travel Stories
              </Link>
              <Link
                href="/recommendations"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Smart Picks
              </Link>
            </nav>
          </div>

          {/* Community links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Community</h4>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/connect"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  ConnectSphere
                </div>
              </Link>
              <Link
                href="/profile"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                My Profile
              </Link>
              <Link
                href="/settings"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Settings
              </Link>
            </nav>
          </div>

          {/* Support links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <nav className="flex flex-col space-y-2">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Help Center
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Safety Guidelines
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Built with ❤️ for adventure seekers
          </p>
        </div>
      </div>
    </footer>
  )
}
