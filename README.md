# RecipeShare

A recipe-sharing website for discovering, adding, and rating food from around the world.

**Live app:** [https://recipeshare-alfrhan.vercel.app](https://recipeshare-alfrhan.vercel.app)

## Run locally

1. Install Node.js 22 or newer.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to a hosted PostgreSQL connection string (Neon is configured for the deployed app).
4. Start the app: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000).

The app creates its tables and two sample recipes the first time it connects to an empty database. Without `DATABASE_URL`, it runs in demo mode with the sample recipes; database saves and ratings require the connection string.

## Tests and build

- `npm test` runs the Vitest suite.
- `npm run build` creates the production build.

GitHub Actions runs both commands on pushes to `main` and pull requests.

## Feature checklist

### Must

- [x] M1 — Browse recipe cards with photos, cuisine, category, and ratings.
- [x] M2 — Open a recipe detail page with ingredients, steps, prep time, and author.
- [x] M3 — Add a recipe with required-field validation.
- [x] M4 — Filter by cuisine and category together; clear filters and see an empty state.
- [x] M5 — Persistent recipes and ratings backed by PostgreSQL.
- [x] M6 — PostgreSQL is hosted on Neon and connected to Vercel.
- [x] M7 — Include two sample recipes with different cuisines and categories.

### Should

- [ ] S1 — Google sign-in and profile (code is ready; configure Google OAuth credentials in Vercel).
- [x] S2 — Edit/delete your own recipes after Google sign-in.
- [x] S3 — One rating per signed-in user; recipe authors cannot rate their own recipes.
- [x] S4 — Upload JPG, PNG, or WebP recipe images (up to 2 MB).
- [x] S5 — Search across titles, authors, cuisine, category, ingredients, and steps.
- [x] S6 — Sort newest and highest rated.

### Could

- [x] Responsive phone layout.

### Engineering

- [x] E1 — Public GitHub repository with incremental commits.
- [x] E2 — `AGENTS.md`, `docs/spec.md`, and `docs/plan.md`.
- [x] E3 — At least three passing automated tests.
- [x] E4 — GitHub Actions test/build run passes on `main`.
- [x] E5 — Automatic deployment from `main` through Vercel.
- [x] E6 — No secrets are in the project files; `.env.example` lists the variable name only.
- [x] E7 — README includes the live Vercel URL.

## Stack

Next.js App Router, React, PostgreSQL (`pg`), and Vitest. See `docs/spec.md` for the assignment checklist and `docs/plan.md` for the build steps.
