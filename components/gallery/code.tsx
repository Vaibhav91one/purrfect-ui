import { highlight } from "sugar-high";

/** Highlighted code that wraps instead of scrolling sideways. Colours come from the --sh-* tokens in globals.css (light and dark). */
export function Code({ code, lang = "typescript", className = "" }: { code: string; lang?: "typescript" | "shell"; className?: string }) {
  return <code className={`font-mono whitespace-pre-wrap [overflow-wrap:anywhere] ${className}`} dangerouslySetInnerHTML={{ __html: highlight(code, { lang }) }} />;
}
