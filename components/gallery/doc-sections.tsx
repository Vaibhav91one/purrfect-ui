import { Code } from "./code";
import { CopyButton } from "./copy-button";
import { InstallTabs } from "./install-tabs";
import { DOCS } from "@/lib/component-docs";

const h3 = "mb-3 text-base font-medium tracking-tight";

/** Behaviour, props, install and usage for one component. Shared by the dialog's Usage tab and /components/[slug]. */
export function DocSections({ slug, install, published }: { slug: string; install: string; published: boolean }) {
  const doc = DOCS[slug];
  if (!doc) return null;
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <section>
        <h2 className={h3}>Behaviour</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
          {doc.behaviors.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
      {doc.props && (
        <section>
          <h2 className={h3}>Props</h2>
          <div className="overflow-x-auto rounded-xl bg-muted">
            <table className="w-full text-left text-sm [&_code]:[overflow-wrap:anywhere]">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5 font-medium">Prop</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Type</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border align-top">
                {doc.props.map((p) => (
                  <tr key={p.name}>
                    <th scope="row" className="px-4 py-3 font-mono text-xs font-normal text-[var(--sh-property)]">{p.name}</th>
                    <td className="px-4 py-3">
                      <Code code={p.type} className="text-xs" />
                      {p.default && (
                        <span className="block font-mono text-xs text-muted-foreground">
                          default <Code code={p.default} className="text-xs" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section>
        <h2 className={h3}>Installation</h2>
        {published ? <InstallTabs install={install} /> : <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Coming soon. It becomes installable once it ships.</p>}
      </section>
      {doc.usage ? (
        <section>
          <h2 className={h3}>How to use</h2>
          <div className="relative rounded-xl bg-muted">
            <pre className="p-4 pr-12 text-xs leading-relaxed">
              <Code code={doc.usage} />
            </pre>
            <CopyButton text={doc.usage} label="Copy usage snippet" className="absolute top-2 right-2" />
          </div>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">Props and a usage snippet land when it ships.</p>
      )}
    </div>
  );
}
