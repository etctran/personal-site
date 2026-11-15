# personal-site

Ethan Tran's personal website — https://ethanctran.dev

Vite + TypeScript, hosted as a Cloudflare Worker with static assets (Workers Builds runs `wrangler deploy` on push to `main`). Unknown paths serve the home page, so per-application links like `/stripe` show up as their own paths in Web Analytics.

- `npm run dev` — local dev server
- `npm test` — unit tests (Vitest)
- `npm run build` — type-check + production build to `dist/`

All copy lives in `src/content.ts`. Design: `docs/superpowers/specs/`, plan: `docs/superpowers/plans/`.

Preview URL: https://personal-site.ethanctran05.workers.dev
