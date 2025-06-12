
export default function ExploreRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout can be customized for route-specific needs.
  // For now, it's a simple pass-through.
  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height)-2rem)]">
      {children}
    </div>
  );
}
