# RecipeShare specification

This document tracks the requirements from the ECE 35400 Final Activity: RecipeShare.

## Fixed choices
- Cuisine: American, Arabic, Chinese, German, Indian, Iranian, Italian, Japanese, Mexican, Other
- Category: Breakfast, Main Dish, Fast Food, Soup, Salad, Dessert, Snack, Drink

## Must features
- [ ] M1 Browse cards with photo, title, cuisine, category, and average rating.
- [ ] M2 Detail page with recipe fields and author.
- [ ] M3 Add recipe with required-field validation and field errors.
- [ ] M4 Filter by cuisine and category together; clear filters; empty state.
- [ ] M5 Rate 1–5 stars and show average and count.
- [ ] M6 Store recipes and ratings in hosted PostgreSQL.
- [ ] M7 Seed at least two distinct sample recipes.

## Should features
- [ ] S1 Google sign-in and profile.
- [ ] S2 Edit/delete own recipes.
- [ ] S3 One rating per signed-in user; no self-rating.
- [ ] S4 Upload recipe image.
- [ ] S5 Keyword search.
- [ ] S6 Sort newest and highest rated.

## Could features
- [ ] Could: responsive phone layout.

## Engineering
- [ ] E1 Public GitHub repo with clear commits.
- [x] E2 AGENTS.md, docs/spec.md, docs/plan.md.
- [x] E3 Automated tests; all run with `npm test`.
- [x] E4 GitHub Actions runs tests and build.
- [ ] E5 Automatic Vercel deployment.
- [x] E6 No secrets committed; `.env.example` contains variable name only.
- [ ] E7 README with live URL, setup, and feature checklist.

Update this checklist only after the live or local acceptance check has confirmed the criterion.
