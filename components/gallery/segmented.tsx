"use client";

/** A pill of mutually exclusive options (the dialog's Variant control, the gallery's category filter). */
export function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex w-max rounded-full bg-muted p-1 text-sm">
      {options.map((o) => (
        <button key={o} type="button" aria-pressed={value === o} onClick={(e) => { onChange(o); e.currentTarget.scrollIntoView({ inline: "center", block: "nearest" }); }} data-cuelume-tap className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 transition-colors duration-200 ${value === o ? "bg-border text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}
