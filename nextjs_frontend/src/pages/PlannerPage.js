import React, { useMemo, useState } from "react";
import { MealPlanner } from "../components/MealPlanner";
import { useAppActions, useAppState } from "../state/AppContext";

// PUBLIC_INTERFACE
export function PlannerPage() {
  /** Meal planning page with weekly calendar drag & drop. */
  const { recipes, favorites } = useAppState();
  const actions = useAppActions();

  const [pendingAddRecipe, setPendingAddRecipe] = useState(null);

  const favoriteRecipes = useMemo(() => {
    const favIds = new Set(Object.keys(favorites || {}));
    return (recipes || [])
      .filter((r) => favIds.has(String(r?.id ?? r?._id ?? r?.recipe_id ?? r?.slug ?? r?.name ?? "")))
      .slice(0, 12);
  }, [recipes, favorites]);

  return (
    <div className="pageGrid">
      <aside className="card" aria-label="Planner sidebar">
        <div className="cardHeader">
          <h2 className="cardTitle">Quick Add</h2>
          <button className="btn btnSmall" onClick={() => actions.refreshRecipes()}>
            Refresh recipes
          </button>
        </div>
        <div className="cardBody stack">
          <div className="muted" style={{ fontWeight: 700 }}>
            Tip: Favorite recipes in the Recipes page, then quickly add them to the calendar here.
          </div>

          {favoriteRecipes.length === 0 ? (
            <div className="muted">No favorite recipes available in current results.</div>
          ) : (
            <div className="stack">
              {favoriteRecipes.map((r, idx) => (
                <button
                  key={idx}
                  className="btn"
                  onClick={() => setPendingAddRecipe(r)}
                >
                  Add: {r?.title || r?.name || "Recipe"}
                </button>
              ))}
            </div>
          )}

          {pendingAddRecipe ? (
            <button className="btn btnDanger" onClick={() => setPendingAddRecipe(null)}>
              Clear pending
            </button>
          ) : null}
        </div>
      </aside>

      <div className="stack">
        <MealPlanner pendingAddRecipe={pendingAddRecipe} onConsumedPendingAdd={() => setPendingAddRecipe(null)} />

        <div className="card">
          <div className="cardBody">
            <h2 className="sectionTitle">Generate Shopping List</h2>
            <div className="muted" style={{ fontWeight: 700 }}>
              Your shopping list is generated from your planned meals (best-effort). Visit the Shopping List page to view.
            </div>
            <a className="btn btnPrimary" href="/shopping">
              View Shopping List →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
