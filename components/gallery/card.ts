/** The component name on a card: plain text, shown on hover or focus (always on touch, which has no hover). */
export const cardLabel =
  "pointer-events-none absolute bottom-2.5 left-3 max-w-[calc(100%-1.5rem)] truncate text-xs text-foreground sm:bottom-4 sm:left-4 sm:text-sm opacity-0 transition-opacity duration-200 ease-snappy group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none";

/** Shared by the home grid and /components: focus ring, hover group, theme surface. Each place adds its own shape. */
export const cardFocus = "group overflow-hidden bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
/** The resting tile: 300:220, rounded. */
export const cardBase = `${cardFocus} relative aspect-[300/220] rounded-3xl`;
