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
  const required = ["author", "title", "cuisine", "category", "ingredients", "steps", "prepTime", "imageUrl"];
  const missing = required.filter((field) => {
    const value = input[field];
    return value == null || String(value).trim() === "";
  });
  if (input.cuisine && !CUISINES.includes(input.cuisine)) missing.push("cuisine");
  if (input.category && !CATEGORIES.includes(input.category)) missing.push("category");
  if (input.prepTime && (!Number.isInteger(Number(input.prepTime)) || Number(input.prepTime) < 1)) missing.push("prepTime");
  if (input.imageUrl && !/^https?:\/\//i.test(input.imageUrl)) missing.push("imageUrl");
  return [...new Set(missing)];
}
