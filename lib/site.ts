export const SITE_URL = "https://webof.vaibhav.quest";
export const GITHUB_REPO = "Vaibhav91one/webof-ui";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

/** The newest component; becomes a link once component pages exist. */
export const LATEST = { name: "Loader", slug: "loader" };

export const installCommand = (slug: string) => `npx shadcn@latest add ${SITE_URL}/r/${slug}.json`;

/** Sections on the home page, in order. Used by the notch links and the search dialog. */
export const NAV_LINKS = [
  { label: "Components", href: "#components" },
  { label: "Loved", href: "#loved" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "FAQ", href: "#faq" },
];
