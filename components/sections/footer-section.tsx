import Link from "next/link";
import { CATEGORIES, categorySlug, COMPONENTS } from "@/lib/components-data";
import { sectionBaseClasses } from "@/lib/layout-classes";
import { GITHUB_URL } from "@/lib/site";
import { Wordmark } from "@/components/gallery/wordmark";
import { CurledCat, LoafCat, StretchCat } from "@/components/gallery/wordmark-cats";

const columns = [
  { title: "Components", links: COMPONENTS.slice(0, 6).map((c) => ({ label: c.name, href: `/components/${c.slug}` })) },
  { title: "Categories", links: CATEGORIES.map((c) => ({ label: c, href: `/components/category/${categorySlug(c)}` })) },
  { title: "Product", links: [{ label: "Components", href: "/components" }, { label: "Docs", href: "/docs" }, { label: "Changelog", href: "/changelog" }, { label: "About", href: "/about" }] },
  { title: "Resources", links: [{ label: "GitHub", href: GITHUB_URL }, { label: "Issues", href: `${GITHUB_URL}/issues` }] },
];

const link = "text-muted-foreground transition-colors hover:text-foreground rounded-sm focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function FooterSection() {
  return (
    <footer className="relative mt-12 overflow-hidden">
      {/* halftone dots that fade out upwards, drawn with tokens so they work in both themes */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(var(--muted-foreground)_1px,transparent_1.5px)] bg-size-[14px_14px] opacity-30 mask-[linear-gradient(to_top,black,transparent)]" />
      <div className={`${sectionBaseClasses} relative px-6 pt-14 pb-8 md:px-8 lg:px-12`}>
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="max-w-xs">
            <p className="text-sm text-muted-foreground">Interactive components for React, live and ready to tune.</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Built by{" "}
              <a href="https://vaibhavtomar.com/" className="text-foreground hover:underline">
                Vaibhav
              </a>
              {" · "}
              <a href="https://x.com/VrsatileVaibhav" className="text-foreground hover:underline">
                X
              </a>
              {" · "}
              <a href="https://github.com/Vaibhav91one" className="text-foreground hover:underline">
                GitHub
              </a>
            </p>
            <a href={GITHUB_URL} aria-label="purrfect ui on GitHub" className={`mt-6 inline-grid ${link}`}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="currentColor">
                <path d="M12 .5C5.73.5.5 5.73.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.73 18.27.5 12 .5Z" />
              </svg>
            </a>
            <p className="mt-4 text-sm text-muted-foreground">© 2026 purrfect ui</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-medium">{col.title}</h2>
                <ul className="mt-4 flex flex-col gap-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      {l.href.startsWith("http") ? (
                        <a href={l.href} className={link}>
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className={link}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <Wordmark className="mt-32 select-none pb-[0.25em] text-center text-[clamp(4rem,19vw,22rem)] leading-[0.8] font-semibold tracking-tighter md:mt-40">
          <span className="relative inline-block">
            pur
            <LoafCat className="bottom-[0.52em] left-[0.02em] w-[0.9em]" />
          </span>
          rfe
          <span className="relative inline-block">
            c<CurledCat className="bottom-[0.12em] left-[0.17em] w-[0.26em]" />
          </span>
          t
          <span className="relative inline-block w-[0.3em]">
            <StretchCat className="bottom-[0.02em] left-[-0.06em] w-[0.42em]" />
          </span>
          ui
        </Wordmark>
      </div>
    </footer>
  );
}
