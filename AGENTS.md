# Repository Guidelines

## Project Structure & Module Organization
- Source code in `src/` with domains: `components/`, `pages/` (admin, merchant, producer, cooperative, marketplace, disputes, auth, user), `services/`, `contexts/`, `hooks/`, `lib/`, `types/`, `assets/`.
- Static assets in `public/`; build output in `dist/`.
- Path alias: `@` resolves to `src`. Example: `import { Button } from "@/components/ui/button"`.
- UI: React + Tailwind + shadcn/ui (see `src/components/ui`) and Radix primitives.

## Build, Test, and Development Commands
- Prereqs: Node 18+; npm preferred (lockfile present). Avoid mixing with Bun (a `bun.lockb` exists).
- `npm run dev` — start Vite dev server (http://localhost:8080).
- `npm run build` — production build to `dist/`.
- `npm run build:dev` — development-mode build (useful for QA).
- `npm run preview` — serve the built app locally.
- `npm run lint` — run ESLint checks.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts/.tsx`), React function components.
- Indentation: 2 spaces; keep imports ordered; prefer named exports.
- Naming: PascalCase for components/files (`MerchantDashboard.tsx`), camelCase for variables/functions, `useX` for hooks (`src/hooks/`).
- Folder-by-domain: add features under the relevant area (e.g., `src/services/merchant`).
- Tailwind: prefer utility classes; use `cn` from `src/lib/utils.ts` to merge classes.
- Linting: ESLint config in `eslint.config.js` (React Hooks + TS rules). No Prettier in this repo.

## Testing Guidelines
- No test runner configured yet. Recommended stack: Vitest + React Testing Library.
- Place tests alongside files or in `__tests__/`; name `*.test.ts`/`*.test.tsx`.
- Keep tests deterministic; mock network/services from `src/services/*`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat`, `fix`, `chore`, `docs`, `refactor` with optional scope. Example: `feat(marketplace): restructurer l’interface avec onglets`.
- PRs: clear description, linked issue, screenshots/GIFs for UI changes, checklist: `npm run lint && npm run build` pass.
- Keep PRs small and focused; note any follow-ups.

## Security & Configuration Tips
- Env vars: Vite requires `VITE_` prefix. Use `.env.local` (git-ignored). Do not commit secrets.
- Demo credentials live in `CREDENTIALS.md` only for local testing.
- PWA SW is temporarily disabled in `index.html`; re-enable thoughtfully when stabilizing caching.

