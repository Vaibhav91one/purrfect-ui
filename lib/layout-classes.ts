// Shared width/height rules (same idea as Mapinly's layout-classes): every block is capped, every section is one screen tall.
// In development each layer gets a coloured outline (container red, section blue, inner green). It is an outline pulled
// inwards, not a border, so it never changes the layout. Production output has none of it.
// Keep a space before each ${dev ...}: Tailwind reads class names from source text, and "p-12${dev" would be one invalid token.
const dev = process.env.NODE_ENV === "development";

/** Page wrapper: caps the whole page at 2000px. */
export const containerClasses = `mx-auto w-full max-w-[2000px] ${dev ? " outline outline-1 -outline-offset-1 outline-red-500" : ""}`;

/** Width and outline of a section, no height: content capped at 1800px. Use this alone for a section that is not a full screen. */
export const sectionBaseClasses = `mx-auto flex w-full max-w-[1800px] flex-col ${dev ? " outline outline-1 -outline-offset-1 outline-blue-500" : ""}`;

/** One section = one full screen (svh, so mobile browser bars don't make it jump). */
export const sectionClasses = `${sectionBaseClasses} min-h-svh`;

/** Inside a section: fills the section and centres its content. */
export const sectionInnerClasses = `flex flex-1 flex-col items-center justify-center p-6 md:p-8 lg:p-12 ${dev ? " outline outline-1 -outline-offset-1 outline-green-500" : ""}`;
