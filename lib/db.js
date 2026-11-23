import pg from "pg";
import { randomUUID } from "node:crypto";
import { ratingSummary } from "@/lib/recipe-utils";

const { Pool } = pg;
const demoRecipes = [
  { id: "sample-iranian-rice", author: "RecipeShare", title: "Saffron Jeweled Rice", cuisine: "Iranian", category: "Main Dish", ingredients: ["2 cups basmati rice", "1 pinch saffron", "2 tbsp butter", "1/3 cup dried cranberries"], steps: ["Rinse rice until water runs clear.", "Parboil for 6 minutes, then drain.", "Bloom saffron in warm water. Layer rice and butter in a pot; steam until fluffy.", "Top with cranberries and saffron water."], prepTime: 45, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85", ratings: [5, 4] },
  { id: "sample-mexican-tacos", author: "RecipeShare", title: "Weeknight Veggie Tacos", cuisine: "Mexican", category: "Fast Food", ingredients: ["8 corn tortillas", "1 can black beans", "1 avocado", "1 lime", "1 tsp cumin"], steps: ["Warm the beans with cumin.", "Toast tortillas in a dry pan.", "Fill with beans and sliced avocado.", "Finish with lime juice."], prepTime: 20, imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=85", ratings: [5, 5, 4] }
];
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 5
}) : null;
let initialized = false;
let initializing;

function mapRow(row) {
  return {
    id: row.id, author: row.author, title: row.title, cuisine: row.cuisine,
    category: row.category, ingredients: row.ingredients, steps: row.steps,
    prepTime: Number(row.prep_time), imageUrl: row.image_url,
    average: Number(row.average || 0), ratingCount: Number(row.rating_count || 0),
    createdAt: row.created_at
  };
}

async function initDb() {
  if (!pool || initialized) return;
  if (!initializing) initializing = (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY, author TEXT NOT NULL, title TEXT NOT NULL, cuisine TEXT NOT NULL,
      category TEXT NOT NULL, ingredients TEXT[] NOT NULL, steps TEXT[] NOT NULL,
      prep_time INTEGER NOT NULL CHECK (prep_time > 0), image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ratings (
      id BIGSERIAL PRIMARY KEY, recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const count = await pool.query("SELECT COUNT(*)::int AS count FROM recipes");
    if (count.rows[0].count === 0) {
      for (const recipe of demoRecipes) {
        const result = await pool.query(
          "INSERT INTO recipes (id,author,title,cuisine,category,ingredients,steps,prep_time,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
          [recipe.id, recipe.author, recipe.title, recipe.cuisine, recipe.category, recipe.ingredients, recipe.steps, recipe.prepTime, recipe.imageUrl]
        );
        for (const value of recipe.ratings) await pool.query("INSERT INTO ratings (recipe_id,value) VALUES ($1,$2)", [result.rows[0].id, value]);
      }
    }
    initialized = true;
  })();
  await initializing;
}

export async function getRecipes() {
  if (!pool) return demoRecipes.map((recipe) => ({ ...recipe, ...ratingSummary(recipe.ratings), ratingCount: recipe.ratings.length }));
  await initDb();
  const { rows } = await pool.query(`SELECT r.*, COALESCE(AVG(rt.value),0)::numeric(3,1) AS average, COUNT(rt.id)::int AS rating_count
    FROM recipes r LEFT JOIN ratings rt ON rt.recipe_id=r.id GROUP BY r.id ORDER BY r.created_at DESC`);
  return rows.map(mapRow);
}

export async function getRecipe(id) {
  if (!pool) {
    const recipe = demoRecipes.find((item) => item.id === id);
    return recipe ? { ...recipe, ...ratingSummary(recipe.ratings), ratingCount: recipe.ratings.length } : null;
  }
  await initDb();
  const { rows } = await pool.query(`SELECT r.*, COALESCE(AVG(rt.value),0)::numeric(3,1) AS average, COUNT(rt.id)::int AS rating_count
    FROM recipes r LEFT JOIN ratings rt ON rt.recipe_id=r.id WHERE r.id=$1 GROUP BY r.id`, [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function addRecipe(recipe) {
  const saved = { ...recipe, id: randomUUID(), average: 0, ratingCount: 0, createdAt: new Date().toISOString() };
  if (!pool) return saved;
  await initDb();
  const { rows } = await pool.query(
    "INSERT INTO recipes (id,author,title,cuisine,category,ingredients,steps,prep_time,image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING created_at",
    [saved.id, saved.author, saved.title, saved.cuisine, saved.category, saved.ingredients, saved.steps, saved.prepTime, saved.imageUrl]
  );
  saved.createdAt = rows[0].created_at;
  return saved;
}

export async function addRating(id, value) {
  if (!pool) return { error: "Rating storage needs DATABASE_URL. Add a free PostgreSQL connection to enable ratings." };
  await initDb();
  const exists = await pool.query("SELECT 1 FROM recipes WHERE id=$1", [id]);
  if (!exists.rowCount) return null;
  await pool.query("INSERT INTO ratings (recipe_id,value) VALUES ($1,$2)", [id, value]);
  return getRecipe(id);
}

export const hasDatabase = Boolean(pool);
