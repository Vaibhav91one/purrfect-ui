import { notFound } from "next/navigation";
import { ComponentShell } from "@/components/gallery/component-shell";
import { DocSections } from "@/components/gallery/doc-sections";
import { bySlug, COMPONENTS } from "@/lib/components-data";
import { DEFAULT_OG, GITHUB_URL, SITE_URL } from "@/lib/site";

export const generateStaticParams = () => COMPONENTS.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: PageProps<"/components/[slug]">) {
  const item = bySlug((await params).slug);
  if (!item) return {};
  const url = `/components/${item.slug}`;
  const title = `${item.name} · purrfect ui`;
  // a captured poster when there is one; otherwise the site's generated card
  const images = item.clip ? [{ url: `/previews/${item.slug}.jpg`, width: item.clip.w, height: item.clip.h, alt: `${item.name} running on ${item.clip.label}` }] : [DEFAULT_OG];
  return {
    title: item.name,
    description: item.description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description: item.description, url, images },
    twitter: { card: "summary_large_image", title, description: item.description, images: images.map((i) => i.url) },
  };
}

/** A component's own page: a playground (list, live canvas, docs), and a real URL a search engine can index. */
export default async function ComponentPage({ params }: PageProps<"/components/[slug]">) {
  const item = bySlug((await params).slug);
  if (!item) notFound();
  const list = COMPONENTS.map(({ slug, name, category, published }) => ({ slug, name, category, published }));
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: item.name,
      description: item.description,
      url: `${SITE_URL}/components/${item.slug}`,
      codeRepository: GITHUB_URL,
      programmingLanguage: "TypeScript",
      license: "https://opensource.org/license/mit",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "purrfect ui", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Components", item: `${SITE_URL}/components` },
        { "@type": "ListItem", position: 3, name: item.name, item: `${SITE_URL}/components/${item.slug}` },
      ],
    },
  ];
  return (
    <ComponentShell item={item} list={list}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <DocSections slug={item.slug} install={item.install} published={item.published} />
    </ComponentShell>
  );
}
