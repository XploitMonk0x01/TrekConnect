export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Auth pages typically don't have the main app sidebar and header.
    // This layout ensures they are displayed as standalone pages.
    <div className="min-h-screen">
      {children}
    </div>
  );
}
