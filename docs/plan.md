# RecipeShare plan

1. Create the Next.js project shell, fixed choices, and initial responsive layout.
   - Files: package.json, app/, lib/recipe-utils.js
   - Check: run locally and confirm the home page and recipe cards render.
2. Add sample recipes, detail view, form validation, and combined filters.
   - Files: lib/db.js, app/page.js, app/api/recipes/, app/recipes/
   - Check: open a recipe, submit a complete recipe, submit an empty form, and combine filters.
3. Add PostgreSQL persistence and star ratings.
   - Files: lib/db.js, app/api/recipes/[id]/ratings/route.js, .env.example
   - Check: rate a recipe and verify average/count; restart and confirm data remains.
4. Add tests, CI, and documentation.
   - Files: tests/, .github/workflows/ci.yml, AGENTS.md, docs/, README.md
   - Check: `npm test`, `npm run build`, then verify the latest GitHub Actions run.
5. Connect free hosted PostgreSQL and Vercel.
   - Set DATABASE_URL in Vercel and deploy the main branch.
   - Check the live URL, sample records, filters, recipe creation, and ratings from another device.
