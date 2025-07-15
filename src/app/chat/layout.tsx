
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout provides a container that allows the chat page to take up the full height
  // within the main content area, minus any global headers/footers if they were present.
  return (
    <div className="h-[calc(100vh-var(--header-height)-var(--footer-height)-2rem)]">
      {children}
    </div>
  );
}
