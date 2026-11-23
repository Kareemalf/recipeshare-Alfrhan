# RecipeShare instructions

## Purpose
RecipeShare is a public recipe-sharing web app. The attached course specification in `docs/spec.md` is the source of truth.

## Stack
- Next.js App Router, React, JavaScript
- PostgreSQL through the `pg` package
- Vitest for unit tests

## Commands
- `npm install` — install dependencies
- `npm run dev` — run the local app
- `npm test` — run all tests
- `npm run build` — build for deployment

## Conventions
- Keep the fixed cuisine and category choices in `lib/recipe-utils.js`.
- Validate all recipe input on the server.
- Read database configuration from `DATABASE_URL`; never commit secrets.
- Add a test for each feature once it works.
- Keep `docs/spec.md` as the requirements source and update `docs/plan.md` as work progresses.
