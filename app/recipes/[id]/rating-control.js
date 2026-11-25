"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RatingControl({ recipeId, initialAverage, initialCount, initialUserRating, isOwner, signedIn }) {
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [userRating, setUserRating] = useState(initialUserRating);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function rate(value) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/recipes/${recipeId}/ratings`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value })
      });
      const data = await response.json();
      if (!response.ok) { setMessage(data.error || "Rating could not be saved."); return; }
      setAverage(data.recipe.average);
      setCount(data.recipe.ratingCount);
      setUserRating(data.recipe.userRating || value);
      setMessage("Thanks for rating!");
    } catch { setMessage("Rating could not be saved."); }
    finally { setBusy(false); }
  }

  return <div className="rate-box"><p>{isOwner ? "Your recipe" : userRating ? "Update your rating" : "Have you tried it?"}</p>
    {isOwner ? <small>You can’t rate your own recipe.</small> : signedIn ? <div className="rate-buttons" aria-label="Rate this recipe">{[1,2,3,4,5].map((value) => <button key={value} disabled={busy} aria-label={`Rate ${value} out of 5 stars`} aria-pressed={userRating === value} onClick={() => rate(value)}>{value <= (userRating || 0) ? "★" : "☆"}</button>)}</div> : <button className="text-button" onClick={() => signIn("google")}>Sign in to rate</button>}
    <p className="rating-summary">{count ? `★ ${average} from ${count} ${count === 1 ? "rating" : "ratings"}` : "No ratings yet"}</p>{message && <small role="status">{message}</small>}
  </div>;
}
