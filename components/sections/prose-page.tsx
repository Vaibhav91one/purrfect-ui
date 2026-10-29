import { Code } from "@/components/gallery/code";
import { CopyButton } from "@/components/gallery/copy-button";
import { containerClasses, sectionBaseClasses } from "@/lib/layout-classes";
import { FooterSection } from "./footer-section";
import { Navbar } from "./navbar";

/** A text page (docs, changelog, about): navbar, a big title and intro, a narrow column, the footer. */
export function ProsePage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className={`flex flex-1 flex-col ${containerClasses}`}>
        <article className={`${sectionBaseClasses} px-6 pt-32 pb-24 md:px-8 md:pt-40 lg:px-12`}>
          <header className="mx-auto w-full max-w-2xl">
            <h1 className="pb-1 text-5xl font-light tracking-[-0.05em] sm:text-7xl">{title}</h1>
            <p className="mt-6 text-lg text-muted-foreground">{intro}</p>
          </header>
          <div className="mx-auto mt-16 flex w-full max-w-2xl flex-col gap-12 text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground [&_p+p]:mt-3 [&_p_code]:font-mono [&_p_code]:text-[0.85em] [&_p_code]:text-foreground">
            {children}
          </div>
        </article>
        <FooterSection />
      </main>
    </>
  );
}

/** A code block with a copy button. */
export function Snippet({ code, lang = "shell" }: { code: string; lang?: "typescript" | "shell" }) {
  return (
    <div className="relative mt-4 rounded-xl bg-muted">
      <pre className="overflow-x-auto p-4 pr-12 text-xs leading-relaxed">
        <Code code={code} lang={lang} />
      </pre>
      <CopyButton text={code} label="Copy snippet" className="absolute top-2 right-2" />
    </div>
  );
}
