'use client'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Chat layout removes the main AppHeader for a full-screen chat experience
  return <div className="h-screen w-full bg-background">{children}</div>
}
