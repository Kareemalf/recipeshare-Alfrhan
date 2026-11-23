"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, CUISINES, filterRecipes } from "@/lib/recipe-utils";

const emptyForm = { author: "", title: "", cuisine: "", category: "", ingredients: "", steps: "", prepTime: "", imageUrl: "" };

function Stars({ average, count }) {
  return <span className="rating"><span aria-label={`${average} out of 5 stars`}>{"★".repeat(Math.round(average))}{"☆".repeat(5 - Math.round(average))}</span><small>{count ? ` ${average} · ${count} ${count === 1 ? "rating" : "ratings"}` : " No ratings yet"}</small></span>;
}

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [cuisine, setCuisine] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadRecipes() {
    setLoading(true);
    try {
      const response = await fetch("/api/recipes", { cache: "no-store" });
      const data = await response.json();
      setRecipes(data.recipes || []);
      if (data.warning) setNotice(data.warning);
    } catch {
      setNotice("Could not load recipes. Please refresh the page.");
    } finally { setLoading(false); }
  }
  useEffect(() => { loadRecipes(); }, []);

  const visibleRecipes = useMemo(() => filterRecipes(recipes, cuisine, category), [recipes, cuisine, category]);
  function update(field, value) { setForm((previous) => ({ ...previous, [field]: value })); }

  async function submit(event) {
    event.preventDefault();
    setErrors([]);
    setNotice("");
    setSaving(true);
    const payload = {
      ...form,
      prepTime: Number(form.prepTime),
      ingredients: form.ingredients.split("\n").map((item) => item.trim()).filter(Boolean),
      steps: form.steps.split("\n").map((item) => item.trim()).filter(Boolean)
    };
    try {
      const response = await fetch("/api/recipes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.missing || [data.error || "Please check the form."]);
        return;
      }
      setForm(emptyForm);
      setNotice("Your recipe is on the table!");
      await loadRecipes();
    } catch { setNotice("The recipe could not be saved. Try again."); }
    finally { setSaving(false); }
  }

  return <main>
    <header className="topbar"><Link className="brand" href="/"> <span className="brand-mark">R</span> RecipeShare</Link><a className="nav-link" href="#share">Share a recipe <span>↗</span></a></header>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">GOOD FOOD TRAVELS</p>
        <h1>A world of recipes,<br/><em>at your table.</em></h1>
        <p className="hero-sub">Pass around the dishes you love. Find your next favorite from kitchens around the world.</p>
        <a className="button button-dark" href="#recipes">Explore recipes <span>↓</span></a>
      </div>
      <div className="hero-image" role="img" aria-label="A colorful table filled with shared dishes"><span className="image-note">Cook something<br/>worth sharing.</span></div>
      <div className="hero-stamp"><span>✳</span><small>MADE TO<br/>BE SHARED</small></div>
    </section>

    <section className="recipe-section" id="recipes">
      <div className="section-heading">
        <div><p className="eyebrow">THE COMMUNITY TABLE</p><h2>Find your next favorite</h2></div>
        <p className="muted">{recipes.length} recipes · many happy meals</p>
      </div>
      <div className="filters">
        <label>Cuisine <select value={cuisine} onChange={(event) => setCuisine(event.target.value)}><option value="">All cuisines</option>{CUISINES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Category <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        {(cuisine || category) && <button className="text-button" onClick={() => { setCuisine(""); setCategory(""); }}>Clear filters</button>}
      </div>
      {notice && <p className="notice" role="status">{notice}</p>}
      {loading ? <p className="empty-state">Setting the table…</p> : visibleRecipes.length === 0 ? <p className="empty-state">No recipes found. Try clearing a filter.</p> :
        <div className="recipe-grid">{visibleRecipes.map((recipe) => <Link className="recipe-card" href={`/recipes/${recipe.id}`} key={recipe.id}>
          <div className="card-image"><img src={recipe.imageUrl} alt={recipe.title} loading="lazy"/><span className="card-category">{recipe.category}</span></div>
          <div className="card-body"><p className="card-cuisine">{recipe.cuisine}</p><h3>{recipe.title}</h3><div className="card-footer"><span>By {recipe.author}</span><Stars average={recipe.average || 0} count={recipe.ratingCount || 0}/></div></div>
        </Link>)}</div>}
    </section>

    <section className="share-section" id="share">
      <div className="share-intro"><p className="eyebrow">YOUR TURN TO PASS IT ON</p><h2>Got a good one?</h2><p>Add a recipe that means something to you. Someone’s next favorite meal might start right here.</p><span className="handwritten">From your kitchen, with love. <b>♥</b></span></div>
      <form className="recipe-form" onSubmit={submit}>
        <div className="form-title"><span>01 — SHARE A RECIPE</span><small>All fields are required</small></div>
        {errors.length > 0 && <div className="error-box" role="alert"><strong>Please fill in or fix these fields:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <div className="form-row"><label>Your name<input value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="Who’s cooking?" required/></label><label>Recipe title<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="The name of your dish" required/></label></div>
        <div className="form-row"><label>Cuisine<select value={form.cuisine} onChange={(e) => update("cuisine", e.target.value)} required><option value="">Choose one</option>{CUISINES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)} required><option value="">Choose one</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label></div>
        <label>Ingredients <small>One ingredient per line</small><textarea rows="4" value={form.ingredients} onChange={(e) => update("ingredients", e.target.value)} placeholder={"2 cups flour\n1 tsp salt"} required/></label>
        <label>Steps <small>One step per line</small><textarea rows="4" value={form.steps} onChange={(e) => update("steps", e.target.value)} placeholder={"Mix the dry ingredients…\nBake until golden…"} required/></label>
        <div className="form-row"><label>Prep time <small>Minutes</small><input type="number" min="1" value={form.prepTime} onChange={(e) => update("prepTime", e.target.value)} placeholder="30" required/></label><label>Image link <small>Use a photo URL</small><input type="url" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://…" required/></label></div>
        <button className="button button-dark submit-button" type="submit" disabled={saving}>{saving ? "Adding your recipe…" : "Add to the table"} <span>→</span></button>
      </form>
    </section>
    <footer><Link className="brand" href="/"><span className="brand-mark">R</span> RecipeShare</Link><span>Good food is better together.</span><span>© 2026 RecipeShare</span></footer>
  </main>;
}
