// Shared width/height rules (same idea as Mapinly's layout-classes): every block is capped, every section is one screen tall.

/** Page wrapper: caps the whole page at 2000px. */
export const containerClasses = "mx-auto w-full max-w-[2000px]";

/** Width of a section, no height: content capped at 1800px. Use this alone for a section that is not a full screen. */
export const sectionBaseClasses = "mx-auto flex w-full max-w-[1800px] flex-col";

/** One section = one full screen (svh, so mobile browser bars don't make it jump). */
export const sectionClasses = `${sectionBaseClasses} min-h-svh`;

/** Inside a section: fills the section and centres its content. */
export const sectionInnerClasses = "flex flex-1 flex-col items-center justify-center p-6 md:p-8 lg:p-12";
