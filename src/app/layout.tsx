
import type { Metadata } from 'next'
import './globals.css'
// import { Toaster } from '@/components/ui/toaster' // Toaster is now in ClientLayout
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { PT_Sans, Playfair_Display } from 'next/font/google'

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: '/logo.png', // Updated path to your logo
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
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable} ${playfairDisplay.variable}`}>
      <head />
      <body className="font-body antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
