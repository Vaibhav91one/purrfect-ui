"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS } from "@/lib/site";

// ponytail: a native <dialog> that filters the section links. Component search and arrow-key navigation come with the
// real command palette in Phase 2.
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const matches = NAV_LINKS.filter((l) => l.label.toLowerCase().includes(query.trim().toLowerCase()));
  const go = (href: string) => {
    onClose();
    setQuery("");
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label="Search"
      className="m-auto mt-[15vh] w-[min(92vw,34rem)] rounded-2xl border border-border bg-background p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          if (matches[0]) go(matches[0].href);
        }}
      >
        <label className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to a section…"
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </label>
        <ul className="max-h-72 overflow-auto p-2">
          {matches.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing found</li>}
          {matches.map((l) => (
            <li key={l.href}>
              <button type="button" onClick={() => go(l.href)} data-cuelume-navigate className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      </form>
    </dialog>
  );
}
