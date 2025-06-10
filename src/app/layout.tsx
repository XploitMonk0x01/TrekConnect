import type { Metadata } from 'next'
import './globals.css'
// import { Toaster } from '@/components/ui/toaster' // Toaster is now in ClientLayout
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'
import { ClientLayout } from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: '/logo.jpeg', // Updated path to your logo
    // apple: '/apple-icon.png', // Example for Apple touch icon if you have one
    // shortcut: '/favicon-16x16.png', // Example for another shortcut icon
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com" />
<link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
<link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
<link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        /></head><body className="font-body antialiased"><ClientLayout>{children}</ClientLayout></body></html>
  )
}
