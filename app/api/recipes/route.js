import { NextResponse } from "next/server";
import { addRecipe, getRecipes, hasDatabase } from "@/lib/db";
import { validateRecipe } from "@/lib/recipe-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recipes = await getRecipes();
    return NextResponse.json({ recipes, warning: hasDatabase ? undefined : "Demo mode: add DATABASE_URL to enable saved recipes and ratings." });
  } catch (error) {
    console.error("Recipe list failed:", error);
    return NextResponse.json({ error: "The recipe database is unavailable. Check DATABASE_URL." }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    const input = await request.json();
    const missing = validateRecipe(input);
    if (missing.length) return NextResponse.json({ missing }, { status: 400 });
    const recipe = await addRecipe({
      author: String(input.author).trim(),
      title: String(input.title).trim(),
      cuisine: input.cuisine,
      category: input.category,
      ingredients: input.ingredients.map((item) => String(item).trim()).filter(Boolean),
      steps: input.steps.map((item) => String(item).trim()).filter(Boolean),
      prepTime: Number(input.prepTime),
      imageUrl: String(input.imageUrl).trim()
    });
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    console.error("Recipe create failed:", error);
    return NextResponse.json({ error: "Could not save the recipe. Check the database connection." }, { status: 503 });
  }
}
