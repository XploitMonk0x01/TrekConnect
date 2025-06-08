import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Footer } from '@/components/layout/Footer';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <AppSidebar />
          <div className="flex flex_col min-h-screen md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-200 ease-linear">
            {/* The div above handles the content shift when sidebar collapses/expands.
                It uses CSS variables defined in the Sidebar component (--sidebar-width-icon, --sidebar-width).
                Need to ensure these variables are correctly applied or use the SidebarInset component.
                Using SidebarInset is the idiomatic way with the provided Sidebar component.
            */}
             <div className="flex flex-col flex-1 min-h-screen"> {/* This will be replaced by SidebarInset */}
                {/* This placeholder div structure is temporary. The actual structure will use SidebarInset */}
             </div>
          </div>
        </SidebarProvider>
        {/* The Toaster should be outside the main layout flow if it needs to overlay everything */}
        
        {/* Corrected structure using SidebarInset */}
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <div className="flex flex-col flex-1 md:ml-[var(--sidebar-width-icon)] group-data-[state=expanded]/sidebar-wrapper:md:ml-[var(--sidebar-width)] transition-[margin-left] duration-200 ease-linear">
              <AppHeader />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
                {children}
              </main>
              <Footer />
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
