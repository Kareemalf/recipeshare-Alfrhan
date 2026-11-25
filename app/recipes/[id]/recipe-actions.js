"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecipeActions({ recipe }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      ...recipe,
      title: form.get("title"),
      cuisine: form.get("cuisine"),
      category: form.get("category"),
      ingredients: String(form.get("ingredients")).split("\n").map((x) => x.trim()).filter(Boolean),
      steps: String(form.get("steps")).split("\n").map((x) => x.trim()).filter(Boolean),
      prepTime: Number(form.get("prepTime")),
      imageUrl: form.get("imageUrl")
    };
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Could not update the recipe."); return; }
      setEditing(false);
      router.refresh();
    } catch { setMessage("Could not update the recipe."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm("Delete this recipe? This cannot be undone.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (!response.ok) { const data = await response.json(); setMessage(data.error || "Could not delete the recipe."); return; }
      router.push("/");
      router.refresh();
    } catch { setMessage("Could not delete the recipe."); }
    finally { setBusy(false); }
  }

  if (editing) return <form className="recipe-form edit-form" onSubmit={save}>
    <div className="form-title"><span>EDIT YOUR RECIPE</span><button type="button" className="text-button" onClick={() => setEditing(false)}>Cancel</button></div>
    <label>Recipe title<input name="title" defaultValue={recipe.title} required/></label>
    <div className="form-row"><label>Cuisine<input name="cuisine" defaultValue={recipe.cuisine} required/></label><label>Category<input name="category" defaultValue={recipe.category} required/></label></div>
    <label>Ingredients <small>One per line</small><textarea name="ingredients" defaultValue={recipe.ingredients.join("\n")} rows="4" required/></label>
    <label>Steps <small>One per line</small><textarea name="steps" defaultValue={recipe.steps.join("\n")} rows="4" required/></label>
    <div className="form-row"><label>Prep time<input name="prepTime" type="number" min="1" defaultValue={recipe.prepTime} required/></label><label>Image URL<input name="imageUrl" defaultValue={recipe.imageUrl} required/></label></div>
    <button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
    {message && <p role="status">{message}</p>}
  </form>;

  return <div className="owner-actions"><button className="text-button" disabled={busy} onClick={() => setEditing(true)}>Edit recipe</button><button className="text-button danger-button" disabled={busy} onClick={remove}>Delete recipe</button>{message && <small role="status">{message}</small>}</div>;
}
