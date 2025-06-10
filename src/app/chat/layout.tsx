
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Chat pages typically don't have the main app sidebar and header.
  // This layout ensures they are displayed as standalone pages.
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}

    