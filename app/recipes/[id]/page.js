import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getRecipe, hasDatabase } from "@/lib/db";
import RatingControl from "./rating-control";
import RecipeActions from "./recipe-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  return { title: recipe ? `${recipe.title} — RecipeShare` : "Recipe — RecipeShare" };
}

export default async function RecipePage({ params }) {
  const { id } = await params;
  const session = await auth();
  const recipe = await getRecipe(id, session?.user?.id || null);
  if (!recipe) notFound();

  return <main className="detail-page">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">R</span> RecipeShare</Link><div className="topbar-actions"><Link className="nav-link" href="/">← All recipes</Link>{session?.user ? <span className="profile-name">{session.user.name}</span> : <Link className="nav-link" href="/api/auth/signin">Sign in</Link>}</div></header>
    <article className="detail">
      <div className="detail-image"><img src={recipe.imageUrl} alt={recipe.title}/></div>
      <div className="detail-copy">
        <p className="eyebrow">{recipe.cuisine} · {recipe.category}</p>
        <h1>{recipe.title}</h1>
        <p className="byline">Shared by <strong>{recipe.author}</strong> · {recipe.prepTime} minutes</p>
        <div className="detail-rating">★ {recipe.average || "—"} <span>· {recipe.ratingCount || 0} ratings</span></div>
        <div className="detail-columns">
          <section><p className="eyebrow">WHAT YOU’LL NEED</p><ul className="ingredient-list">{recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
          <section><p className="eyebrow">LET’S MAKE IT</p><ol className="steps-list">{recipe.steps.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol></section>
        </div>
        {recipe.ownerId === session?.user?.id && <RecipeActions recipe={recipe}/>}
        <RatingControl recipeId={recipe.id} initialAverage={recipe.average || 0} initialCount={recipe.ratingCount || 0} initialUserRating={recipe.userRating || null} isOwner={recipe.ownerId === session?.user?.id} signedIn={Boolean(session?.user?.id)}/>
        {!hasDatabase && <p className="notice">Add DATABASE_URL to save ratings across visits.</p>}
      </div>
    </article>
    <footer><Link className="brand" href="/"><span className="brand-mark">R</span> RecipeShare</Link><span>Good food is better together.</span></footer>
  </main>;
}
