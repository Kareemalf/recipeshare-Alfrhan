export const CUISINES = ["American", "Arabic", "Chinese", "German", "Indian", "Iranian", "Italian", "Japanese", "Mexican", "Other"];
export const CATEGORIES = ["Breakfast", "Main Dish", "Fast Food", "Soup", "Salad", "Dessert", "Snack", "Drink"];

export function filterRecipes(recipes, cuisine = "", category = "") {
  return recipes.filter((recipe) =>
    (!cuisine || recipe.cuisine === cuisine) &&
    (!category || recipe.category === category)
  );
}

export function ratingSummary(ratings = []) {
  if (!ratings.length) return { average: 0, count: 0 };
  const average = ratings.reduce((sum, value) => sum + Number(value), 0) / ratings.length;
  return { average: Math.round(average * 10) / 10, count: ratings.length };
}

export function validateRecipe(input = {}) {
  const missing = [];
  for (const field of ["author", "title", "cuisine", "category", "prepTime", "imageUrl"]) {
    if (input[field] == null || String(input[field]).trim() === "") missing.push(field);
  }
  if (!Array.isArray(input.ingredients) || !input.ingredients.some((item) => String(item).trim())) missing.push("ingredients");
  if (!Array.isArray(input.steps) || !input.steps.some((item) => String(item).trim())) missing.push("steps");
  if (input.cuisine && !CUISINES.includes(input.cuisine)) missing.push("cuisine");
  if (input.category && !CATEGORIES.includes(input.category)) missing.push("category");
  if (input.prepTime && (!Number.isInteger(Number(input.prepTime)) || Number(input.prepTime) < 1)) missing.push("prepTime");
  if (input.imageUrl) {
    try {
      const url = new URL(input.imageUrl);
      if (!["http:", "https:"].includes(url.protocol)) missing.push("imageUrl");
    } catch { missing.push("imageUrl"); }
  }
  return [...new Set(missing)];
}
