export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout wrapper ensures that the chat page can correctly use a full-height container.
  return (
    <div className="h-full">
      {children}
    </div>
  )
}
