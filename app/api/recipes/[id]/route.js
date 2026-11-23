import { NextResponse } from "next/server";
import { getRecipe } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  try {
    const recipe = await getRecipe(id);
    return recipe ? NextResponse.json({ recipe }) : NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  } catch (error) {
    console.error("Recipe lookup failed:", error);
    return NextResponse.json({ error: "Could not load this recipe." }, { status: 503 });
  }
}
