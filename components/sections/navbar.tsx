// Floating pill, fixed to the top. It overlays the hero instead of pushing it down, so the hero is exactly one screen.
export function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-6 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1800px] justify-center">
        <nav className="pointer-events-auto rounded-full border border-border bg-card px-6 py-3 text-sm uppercase tracking-wider text-muted-foreground">
          Navbar
        </nav>
      </div>
    </header>
  );
}
