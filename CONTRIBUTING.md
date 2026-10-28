# Contributing

Issues and pull requests are welcome.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Add a component

1. Create `registry/<slug>/` with `<slug>.tsx` (one self-contained file) and `demo.tsx`.
2. List it in `registry.json`, `lib/components-data.ts` and `lib/component-docs.ts`.
3. Run `pnpm registry:build` and commit the generated `public/r/<slug>.json`.
4. Run the gate: `pnpm check <slug>` (`pnpm check all` runs every component). A FAIL blocks the PR; a WARN needs a one-line reason in the PR. `pnpm check --rules` lists every rule.

The full port checklist and the rules behind the gate are in the [README](README.md#quality-gate-for-a-component) and `CLAUDE.md`.
