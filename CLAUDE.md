# purrfect ui

Animated React components with sound, installable with the shadcn CLI. Live at https://purrfectui.com. Read `AGENTS.md` first: this is Next 16, so check `node_modules/next/dist/docs/` before using older Next APIs.

## Stack

Next 16 (App Router), React 19, Tailwind 4, `motion/react`, Cuelume (sound), lucide-react, pnpm. No test runner: `pnpm typecheck && pnpm lint && pnpm check all` is the check.

## Commands

```bash
pnpm dev -p 3120      # dev server (3120 is the port used while working)
pnpm typecheck        # next typegen + tsc
pnpm lint
pnpm build            # runs registry:build first; never run it while the dev server is up
```

Dev server serves stale CSS after editing `app/globals.css` or running `pnpm build`: kill it, `rm -rf .next`, start again, hard reload.

## Layout

- `app/` pages (`/`, `/components`); `app/globals.css` holds tokens and the cat keyframes.
- `registry/<slug>/` one folder per installable component (`<slug>.tsx`, `demo.tsx`, `meta.ts`); `registry.json` lists them; `public/r/*.json` is generated.
- `components/sections/` home sections; `components/gallery/` gallery, previews, cat; `components/notch/` the floating notch; `components/providers/` sound provider.
- `lib/` data and helpers: `components-data.ts`, `layout-classes.ts` (section sizing; dev-only blue/red/green outlines show section bounds), `sound.ts`, `site.ts`.

## Shared pieces

Component cards: `components/gallery/component-card.tsx` (`cardBase`, `CardFace`) on both home and /components. Shell motion tokens (ease, springs, durations): `lib/motion.ts`; registry components keep their own.

The dialog: `components/gallery/use-sheet.tsx` (`openSheet(slug, cardEl)`, `<SheetHost />`, state lives in `?c=`) opens `component-sheet.tsx` from any card; the preview panel grows out of the card (FLIP). Demos in `components/gallery/demos/demos.tsx` take `{ playing, speed, opts }` (`playing` undefined = still card); a component's own controls are `extras` in `lib/components-data.ts`.

The dialog's Usage tab reads `lib/component-docs.ts`; keep the four real entries (button, scroll-reveal, parallax-columns, loader) in step with their `registry/` files.

`--compass` (#1346E7) is the runeicons.com brand blue, used by the home grid's compass tile.

## Conventions

- Colours and theme come from tokens (`bg-background`, `text-muted-foreground`, `text-accent`, ...). Dark and light both must work; the theme toggles in the notch, not via `prefers-color-scheme`. The notch is always black, so things on it use white.
- Keep sections one screen tall (`sectionClasses` = `min-h-svh`); the hero is centred in a full viewport.
- Motion: `transform`/`opacity`, ease-out curves like `cubic-bezier(0.23, 1, 0.32, 1)`, UI under 300ms, and always handle `prefers-reduced-motion` (gentler, not zero). Use native CSS `rotate`/`scale`/`translate` properties in keyframes so they don't fight SVG `transform` attributes.

## Sound

All sound goes through `lib/sound.ts` (Cuelume) and `useSound()` from `components/providers/sound-provider.tsx`. Never import Cuelume anywhere else.

- Plain click: add `data-cuelume-tap | toggle | open | close | navigate | select | type` to the element.
- Outcome: `play("success", { emphasis: "subtle" })` after the thing actually worked (the copy button does this).
- Sound is on by default, off when `localStorage.sound === "off"`; audio is locked until the first gesture, so never rely on a sound playing before a click or key press.
- Currently wired: notch, hero Browse link, every `CopyButton`. See the table in `README.md` and update it when adding cues.

## Toasts

One shared `<Toaster />` (`components/ui/sonner.tsx`, shadcn's sonner wrapper themed from the `dark` class), mounted once in `app/layout.tsx`. Call `toast` from `"sonner"` anywhere on the client; copying already does (`useCopy`, fixed `id: "copy"` so repeats update one toast). Customise per call or change defaults in the wrapper.

## The cat

`gallery/gradient-cat.tsx` is the mascot: each part is drawn twice (a fattened outline copy and a white copy inside a `<mask>`), gradient blobs spin inside the mask, head follows the cursor. The hero uses the sitting cat; the notch uses it (`notch/notch-cat.tsx`) with a new colour variant (`cat-variants.ts`) every time it ducks out and returns. Parked and unwired for now: `hero-cat.tsx` + `walking-cat.tsx` (walk-in), `purr-cat.tsx` + `motion-lines.tsx` (click lines), `lib/cat-sounds.ts` (purr/meow/steps). They are untracked files, so do not delete them without asking.

## Quality gate

`pnpm check <slug>` (rules in `scripts/check/rules.mjs`), `pnpm check <slug> --install` (fresh-app install test), worst-case states at `/dev?c=<slug>` (`registry/<slug>/worst-case.tsx`, listed in `app/dev/fixtures.ts`). The full port checklist is in `README.md` ("Quality gate for a component"). No component goes in `registry.json` with a FAIL.

## Own components only

Ported components are ours. Animation libraries (gsap, motion), WebGL (three, ogl) and headless primitives are fine, and so is starting from shadcn source and modifying it. Never import ready-made components from another component library (Rare UI, MUI, Aceternity...); `pnpm check` has an `own-components` safety net, review is the real gate.

## Working rules

- Do not commit or push unless asked. Commits end with the `Co-Authored-By` line the session gives.
- Check UI changes in a real browser (desktop 1470 wide and phone 390 wide) before saying done; zoom in on small details (the notch at 6x).
- Keep changes small and match the surrounding code's style and comment density.
