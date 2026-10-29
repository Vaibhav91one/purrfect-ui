import { notFound } from "next/navigation";
import { ComponentsExplorer } from "@/components/gallery/components-explorer";
import { FooterSection, Navbar } from "@/components/sections";
import { CATEGORIES, categorySlug, COMPONENTS } from "@/lib/components-data";
import { containerClasses } from "@/lib/layout-classes";
import { DEFAULT_OG } from "@/lib/site";

const byParam = (param: string) => CATEGORIES.find((c) => categorySlug(c) === param);

export const generateStaticParams = () => CATEGORIES.map((c) => ({ category: categorySlug(c) }));

export async function generateMetadata({ params }: PageProps<"/components/category/[category]">) {
  const category = byParam((await params).category);
  if (!category) return {};
  const names = COMPONENTS.filter((c) => c.category === category).map((c) => c.name);
  const title = `${category} components`;
  const description = `Animated React ${category.toLowerCase()} components with sound: ${names.join(", ")}. Install with the shadcn CLI or copy the source.`;
  const url = `/components/category/${categorySlug(category)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} · purrfect ui`, description, url, type: "website", images: [DEFAULT_OG] },
    twitter: { card: "summary_large_image", title: `${title} · purrfect ui`, description, images: [DEFAULT_OG.url] },
  };
}

export default async function CategoryPage({ params }: PageProps<"/components/category/[category]">) {
  const category = byParam((await params).category);
  if (!category) notFound();
  return (
    <>
      <Navbar />
      <main className={`flex flex-1 flex-col ${containerClasses}`}>
        <ComponentsExplorer category={category} />
        <FooterSection />
      </main>
    </>
  );
}
