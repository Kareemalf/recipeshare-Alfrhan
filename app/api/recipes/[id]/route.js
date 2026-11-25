import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/db";
import { validateRecipe } from "@/lib/recipe-utils";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const session = await auth();
    const recipe = await getRecipe(id, session?.user?.id || null);
    return recipe ? NextResponse.json({ recipe }) : NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  } catch (error) {
    console.error("Recipe lookup failed:", error);
    return NextResponse.json({ error: "Could not load this recipe." }, { status: 503 });
  }
}

export async function PATCH(request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to edit your recipe." }, { status: 401 });
  const { id } = await params;
  try {
    const input = await request.json();
    const missing = validateRecipe({ ...input, author: input.author || session.user.name });
    if (missing.length) return NextResponse.json({ missing }, { status: 400 });
    const recipe = await updateRecipe(id, session.user.id, {
      title: String(input.title).trim(), cuisine: input.cuisine, category: input.category,
      ingredients: input.ingredients.map((item) => String(item).trim()).filter(Boolean),
      steps: input.steps.map((item) => String(item).trim()).filter(Boolean),
      prepTime: Number(input.prepTime), imageUrl: String(input.imageUrl).trim()
    });
    return recipe ? NextResponse.json({ recipe }) : NextResponse.json({ error: "You can only edit your own recipes." }, { status: 403 });
  } catch (error) {
    console.error("Recipe update failed:", error);
    return NextResponse.json({ error: "Could not update the recipe." }, { status: 503 });
  }
}

export async function DELETE(_request, { params }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to delete your recipe." }, { status: 401 });
  const { id } = await params;
  try {
    const deleted = await deleteRecipe(id, session.user.id);
    return deleted ? NextResponse.json({ success: true }) : NextResponse.json({ error: "You can only delete your own recipes." }, { status: 403 });
  } catch (error) {
    console.error("Recipe delete failed:", error);
    return NextResponse.json({ error: "Could not delete the recipe." }, { status: 503 });
  }
}
