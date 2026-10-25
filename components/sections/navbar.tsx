import { Notch } from "@/components/notch/notch";

// Fixed to the top, floating over the hero (no layout push). The wrapper ignores the pointer so only the notch itself
// catches clicks; its width is capped like every section.
export function Navbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4 md:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1800px] justify-center">
        <Notch />
      </div>
    </header>
  );
}
