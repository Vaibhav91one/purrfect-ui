# webof-ui

Animated React components with sound, extracted from my own projects (Poinu, Mapinly, Bountydesk, portfolio).
Live at https://components.webof.quest. Install any component with the shadcn CLI, or copy the source.

```bash
npx shadcn@latest add https://components.webof.quest/r/<component>.json
```

## Layout

- `app/` the platform (home, browse, component pages)
- `registry/<slug>/` one folder per component: `<slug>.tsx` (the installable file), `demo.tsx`, `meta.ts`
- `registry.json` lists every installable item; `pnpm registry:build` writes `public/r/*.json` (also runs before `pnpm build`)

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm registry:build
pnpm build
```

Next 16: read `node_modules/next/dist/docs/` before relying on older Next APIs (see `AGENTS.md`).
