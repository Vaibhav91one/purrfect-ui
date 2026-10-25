// Chips pop out of the notch, so each one is a small notch of its own: black in both themes.
const chipBase =
  "shrink-0 rounded-full bg-black text-white/80 shadow-[0_6px_20px_rgb(0_0_0/0.3)] ring-1 ring-white/10 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** Text chip (links, stars). */
export const chip = `${chipBase} inline-flex h-10 items-center gap-2 px-4 text-sm`;

/** Round icon chip (sound, theme). */
export const iconButton = `${chipBase} grid size-10 place-items-center`;
