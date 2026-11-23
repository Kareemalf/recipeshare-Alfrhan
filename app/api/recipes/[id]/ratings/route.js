import { NextResponse } from "next/server";
import { addRating } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const value = Number(body.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) return NextResponse.json({ error: "Choose a rating from 1 to 5 stars." }, { status: 400 });
  try {
    const recipe = await addRating(id, value);
    if (!recipe) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
    if (recipe.error) return NextResponse.json({ error: recipe.error }, { status: 503 });
    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Rating save failed:", error);
    return NextResponse.json({ error: "Could not save your rating. Check the database connection." }, { status: 503 });
  }
}
