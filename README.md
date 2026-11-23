# RecipeShare

A recipe-sharing website for discovering, adding, and rating food from around the world.

**Live app:** Not deployed yet — add the Vercel URL here after setup.

## Run locally

1. Install Node.js 22 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a free hosted PostgreSQL connection string (Neon is one option).
4. Start the app: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

The app creates its tables and two sample recipes the first time it connects to an empty database. Without `DATABASE_URL`, it runs in demo mode with the sample recipes; database saves and ratings require the connection string.

## Tests and build

- `npm test` runs the Vitest suite.
- `npm run build` creates the production build.

GitHub Actions runs both commands on pushes to `main` and pull requests.

## Feature checklist

### Must

- [x] M1 — Browse recipe cards with photos, cuisine, category, and ratings (implementation ready; verify in the deployed app).
- [x] M2 — Open a recipe detail page with ingredients, steps, prep time, and author.
- [x] M3 — Add a recipe with required-field validation.
- [x] M4 — Filter by cuisine and category together; clear filters and see an empty state.
- [x] M5 — Implemented; persistence across devices requires PostgreSQL.
- [ ] M6 — Partly done: PostgreSQL support and auto-seeding are implemented; connect a hosted database by setting `DATABASE_URL` locally and in Vercel.
- [x] M7 — Include two sample recipes with different cuisines and categories.

### Should

- [ ] S1 — Google sign-in and profile.
- [ ] S2 — Edit/delete own recipes.
- [ ] S3 — One rating per signed-in user and no self-rating.
- [ ] S4 — Upload recipe images.
- [ ] S5 — Keyword search.
- [ ] S6 — Sort newest and highest rated.

### Could

- [x] Responsive phone layout (implemented; confirm on a phone).

### Engineering

- [x] E1 — Public GitHub repository with incremental commits.
- [x] E2 — `AGENTS.md`, `docs/spec.md`, and `docs/plan.md`.
- [ ] E3 — At least three passing automated tests (run `npm test`).
- [x] E4 — GitHub Actions test/build run passes on `main`.
- [ ] E5 — Automatic deployment from `main` (connect this repo to Vercel).
- [x] E6 — No secrets are in the project files; `.env.example` lists the variable name only.
- [ ] E7 — Complete this README with the live Vercel URL after deployment.

## Stack

Next.js App Router, React, PostgreSQL (`pg`), and Vitest. See `docs/spec.md` for the assignment checklist and `docs/plan.md` for the build steps.
