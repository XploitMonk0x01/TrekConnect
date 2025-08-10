export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout provides a container that allows the chat page to take up the full height
  // within the main content area, minus any global headers/footers if they were present.
  return (
    // The inner page now controls its own height relative to the viewport
    <div>
      {children}
    </div>
  )
}
