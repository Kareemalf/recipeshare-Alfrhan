import { describe, expect, it } from "vitest";
import { filterRecipes, ratingSummary, validateRecipe } from "../lib/recipe-utils";

const recipes = [
  { cuisine: "Iranian", category: "Main Dish" },
  { cuisine: "Iranian", category: "Dessert" },
  { cuisine: "Mexican", category: "Main Dish" }
];

describe("RecipeShare core requirements", () => {
  it("filters by cuisine and category together", () => {
    expect(filterRecipes(recipes, "Iranian", "Main Dish")).toEqual([recipes[0]]);
    expect(filterRecipes(recipes)).toHaveLength(3);
  });

  it("calculates average and rating count", () => {
    expect(ratingSummary([5, 4, 3])).toEqual({ average: 4, count: 3 });
    expect(ratingSummary([])).toEqual({ average: 0, count: 0 });
  });

  it("reports missing required recipe fields and accepts a valid recipe", () => {
    expect(validateRecipe({ title: "Soup" })).toContain("author");
    expect(validateRecipe({
      author: "Ari", title: "Soup", cuisine: "American", category: "Soup",
      ingredients: ["beans"], steps: ["cook"], prepTime: 20,
      imageUrl: "https://example.com/soup.jpg"
    })).toEqual([]);
  });
});
