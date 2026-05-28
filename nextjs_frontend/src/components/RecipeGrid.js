import React, { useMemo, useState } from "react";
import { useAppActions, useAppState } from "../state/AppContext";
import { RecipeModal } from "./RecipeModal";

function getId(r) {
  return r?.id ?? r?._id ?? r?.recipe_id ?? r?.slug ?? r?.name ?? String(Math.random());
}

function getTitle(r) {
  return r?.title ?? r?.name ?? r?.label ?? "Untitled recipe";
}

function getMinutes(r) {
  const v = r?.minutes ?? r?.cook_time_minutes ?? r?.time_minutes ?? r?.time;
  return typeof v === "number" ? v : v ? Number(v) : null;
}

function getCuisine(r) {
  return r?.cuisine ?? r?.category ?? "";
}

function getDifficulty(r) {
  return r?.difficulty ?? "";
}

// PUBLIC_INTERFACE
export function RecipeGrid({ onAddToPlan }) {
  /** Displays recipes list and handles opening recipe details modal. */
  const { recipes, loadingRecipes, recipesError, favorites } = useAppState();
  const actions = useAppActions();

  const [selected, setSelected] = useState(null);

  const cards = useMemo(() => {
    return (recipes || []).map((r) => {
      const id = String(getId(r));
      const title = getTitle(r);
      return {
        raw: r,
        id,
        title,
        minutes: getMinutes(r),
        cuisine: getCuisine(r),
        difficulty: getDifficulty(r),
        isFavorite: !!favorites[id],
      };
    });
  }, [recipes, favorites]);

  return (
    <section className="card" aria-label="Recipes">
      <div className="cardHeader">
        <h2 className="cardTitle">Recipes</h2>
        <div className="muted">{cards.length} results</div>
      </div>

      <div className="cardBody">
        {recipesError ? (
          <div className="stack">
            <div className="muted">Could not load recipes.</div>
            <div className="muted" style={{ fontWeight: 700 }}>
              {recipesError}
            </div>
          </div>
        ) : null}

        {loadingRecipes ? <div className="muted">Loading recipes…</div> : null}

        {!loadingRecipes && cards.length === 0 ? (
          <div className="muted">No recipes yet. Try searching or adjusting filters.</div>
        ) : null}

        <div className="recipesGrid">
          {cards.map((c) => (
            <div
              key={c.id}
              className="recipeCard"
              role="button"
              tabIndex={0}
              onClick={() => setSelected(c.raw)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected(c.raw);
              }}
              aria-label={`Open recipe ${c.title}`}
            >
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h3 className="recipeTitle">{c.title}</h3>
                <button
                  className={c.isFavorite ? "pill pillActive" : "pill"}
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.toggleFavorite(c.id);
                  }}
                  aria-label={c.isFavorite ? "Remove favorite" : "Add favorite"}
                  title={c.isFavorite ? "Unfavorite" : "Favorite"}
                >
                  {c.isFavorite ? "★" : "☆"}
                </button>
              </div>

              <div className="recipeMeta">
                {c.cuisine ? <span>{c.cuisine}</span> : null}
                {c.difficulty ? <span>• {c.difficulty}</span> : null}
                {c.minutes != null ? <span>• {c.minutes} min</span> : null}
              </div>

              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="muted" style={{ fontSize: 12, fontWeight: 700 }}>
                  Click for details
                </span>
                <button
                  className="btn btnSmall btnPrimary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlan?.(c.raw);
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {selected ? (
          <RecipeModal
            recipe={selected}
            onClose={() => setSelected(null)}
            onAddToPlan={(r) => onAddToPlan?.(r)}
          />
        ) : null}
      </div>
    </section>
  );
}
