import pg from "pg";
import { randomUUID } from "node:crypto";
import { ratingSummary } from "@/lib/recipe-utils";

const { Pool } = pg;
const demoRecipes = [
  { id: "sample-iranian-rice", author: "RecipeShare", title: "Saffron Jeweled Rice", cuisine: "Iranian", category: "Main Dish", ingredients: ["2 cups basmati rice", "1 pinch saffron", "2 tbsp butter", "1/3 cup dried cranberries"], steps: ["Rinse rice until water runs clear.", "Parboil for 6 minutes, then drain.", "Bloom saffron in warm water. Layer rice and butter in a pot; steam until fluffy.", "Top with cranberries and saffron water."], prepTime: 45, imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85", ratings: [5, 4] },
  { id: "sample-mexican-tacos", author: "RecipeShare", title: "Weeknight Veggie Tacos", cuisine: "Mexican", category: "Fast Food", ingredients: ["8 corn tortillas", "1 can black beans", "1 avocado", "1 lime", "1 tsp cumin"], steps: ["Warm the beans with cumin.", "Toast tortillas in a dry pan.", "Fill with beans and sliced avocado.", "Finish with lime juice."], prepTime: 20, imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=85", ratings: [5, 5, 4] }
];
let memoryRecipes = demoRecipes.map((recipe) => ({ ...recipe, ratings: [...recipe.ratings] }));
const memoryUserRatings = new Map();
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  max: 5
}) : null;
let initialized = false;
let initializing;

function mapRow(row) {
  return {
    id: row.id, author: row.author, ownerId: row.owner_id || null, title: row.title, cuisine: row.cuisine,
    category: row.category, ingredients: row.ingredients, steps: row.steps,
    prepTime: Number(row.prep_time), imageUrl: row.image_url,
    average: Number(row.average || 0), ratingCount: Number(row.rating_count || 0),
    createdAt: row.created_at
  };
}

async function initDb() {
  if (!pool || initialized) return;
  if (!initializing) initializing = (async () => {
    await pool.query("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, image TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())");
    await pool.query(`CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY, author TEXT NOT NULL, title TEXT NOT NULL, cuisine TEXT NOT NULL,
      category TEXT NOT NULL, ingredients TEXT[] NOT NULL, steps TEXT[] NOT NULL,
      prep_time INTEGER NOT NULL CHECK (prep_time > 0), image_url TEXT NOT NULL,
      owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ratings (
      id BIGSERIAL PRIMARY KEY, recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await pool.query("ALTER TABLE recipes ADD COLUMN IF NOT EXISTS owner_id TEXT REFERENCES users(id) ON DELETE SET NULL");
    await pool.query("ALTER TABLE ratings ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS ratings_one_per_user ON ratings(recipe_id,user_id) WHERE user_id IS NOT NULL");
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
  if (!pool) return memoryRecipes.map((recipe) => ({ ...recipe, ownerId: recipe.ownerId || null, ...ratingSummary(recipe.ratings), ratingCount: recipe.ratings.length }));
  await initDb();
  const { rows } = await pool.query(`SELECT r.*, COALESCE(AVG(rt.value),0)::numeric(3,1) AS average, COUNT(rt.id)::int AS rating_count
    FROM recipes r LEFT JOIN ratings rt ON rt.recipe_id=r.id GROUP BY r.id ORDER BY r.created_at DESC`);
  return rows.map(mapRow);
}

export async function getRecipe(id, userId = null) {
  if (!pool) {
    const recipe = memoryRecipes.find((item) => item.id === id);
    if (!recipe) return null;
    const mapped = { ...recipe, ownerId: recipe.ownerId || null, ...ratingSummary(recipe.ratings), ratingCount: recipe.ratings.length };
    mapped.userRating = memoryUserRatings.get(`${id}:${userId}`) || null;
    return mapped;
  }
  await initDb();
  const { rows } = await pool.query(`SELECT r.*, COALESCE(AVG(rt.value),0)::numeric(3,1) AS average, COUNT(rt.id)::int AS rating_count
    FROM recipes r LEFT JOIN ratings rt ON rt.recipe_id=r.id WHERE r.id=$1 GROUP BY r.id`, [id]);
  if (!rows[0]) return null;
  const recipe = mapRow(rows[0]);
  if (userId) {
    const ownRating = await pool.query("SELECT value FROM ratings WHERE recipe_id=$1 AND user_id=$2", [id, userId]);
    recipe.userRating = ownRating.rows[0]?.value || null;
  }
  return recipe;
}

export async function addRecipe(recipe) {
  const saved = { ...recipe, id: randomUUID(), average: 0, ratingCount: 0, createdAt: new Date().toISOString() };
  if (!pool) { memoryRecipes.unshift(saved); return saved; }
  await initDb();
  const { rows } = await pool.query(
    "INSERT INTO recipes (id,author,title,cuisine,category,ingredients,steps,prep_time,image_url,owner_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING created_at",
    [saved.id, saved.author, saved.title, saved.cuisine, saved.category, saved.ingredients, saved.steps, saved.prepTime, saved.imageUrl, saved.ownerId || null]
  );
  saved.createdAt = rows[0].created_at;
  return saved;
}

export async function addRating(id, value, userId) {
  if (!pool) {
    const recipe = memoryRecipes.find((item) => item.id === id);
    if (!recipe) return null;
    if (recipe.ownerId && recipe.ownerId === userId) return { error: "You cannot rate your own recipe." };
    const key = `${id}:${userId}`;
    const previous = memoryUserRatings.get(key);
    if (!previous) recipe.ratings.push(value);
    memoryUserRatings.set(key, value);
    return { ...recipe, ownerId: recipe.ownerId || null, ...ratingSummary(recipe.ratings), ratingCount: recipe.ratings.length, userRating: value };
  }
  await initDb();
  const exists = await pool.query("SELECT owner_id FROM recipes WHERE id=$1", [id]);
  if (!exists.rowCount) return null;
  if (exists.rows[0].owner_id && exists.rows[0].owner_id === userId) return { error: "You cannot rate your own recipe." };
  await pool.query("INSERT INTO ratings (recipe_id,value,user_id) VALUES ($1,$2,$3) ON CONFLICT (recipe_id,user_id) WHERE user_id IS NOT NULL DO UPDATE SET value=EXCLUDED.value", [id, value, userId]);
  return getRecipe(id, userId);
}

export async function upsertUser(user) {
  if (!pool) return;
  await initDb();
  await pool.query("INSERT INTO users (id,name,email,image) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,email=EXCLUDED.email,image=EXCLUDED.image", [user.id, user.name || "RecipeShare member", user.email || null, user.image || null]);
}

export async function updateRecipe(id, ownerId, recipe) {
  if (!pool) {
    const existing = memoryRecipes.find((item) => item.id === id && item.ownerId === ownerId);
    if (!existing) return null;
    Object.assign(existing, recipe);
    return existing;
  }
  await initDb();
  const { rowCount } = await pool.query("UPDATE recipes SET title=$1,cuisine=$2,category=$3,ingredients=$4,steps=$5,prep_time=$6,image_url=$7 WHERE id=$8 AND owner_id=$9", [recipe.title, recipe.cuisine, recipe.category, recipe.ingredients, recipe.steps, recipe.prepTime, recipe.imageUrl, id, ownerId]);
  return rowCount ? getRecipe(id, ownerId) : null;
}

export async function deleteRecipe(id, ownerId) {
  if (!pool) {
    const index = memoryRecipes.findIndex((item) => item.id === id && item.ownerId === ownerId);
    if (index < 0) return false;
    memoryRecipes.splice(index, 1);
    return true;
  }
  await initDb();
  const { rowCount } = await pool.query("DELETE FROM recipes WHERE id=$1 AND owner_id=$2", [id, ownerId]);
  return rowCount > 0;
}

export const hasDatabase = Boolean(pool);
