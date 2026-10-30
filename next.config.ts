import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // slugs renamed off shadcn's names (they overwrote components/ui/button.tsx etc.); old links and install URLs keep working
  async redirects() {
    const renamed = { button: "roll-button", tabs: "glide-tabs", toggle: "stretch-switch" };
    return Object.entries(renamed).flatMap(([from, to]) => [
      { source: `/components/${from}`, destination: `/components/${to}`, permanent: true },
      { source: `/r/${from}.json`, destination: `/r/${to}.json`, permanent: true },
    ]);
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
