import React, { useMemo } from "react";
import { useAppActions, useAppState } from "../state/AppContext";

function getId(r) {
  return String(r?.id ?? r?._id ?? r?.recipe_id ?? r?.slug ?? r?.name ?? "");
}

function getTitle(r) {
  return r?.title ?? r?.name ?? r?.label ?? "Recipe";
}

function normalizeIngredients(r) {
  const v = r?.ingredients ?? r?.ingredient_list ?? r?.items;
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split("\n").map((x) => x.trim()).filter(Boolean);
  return [];
}

function normalizeSteps(r) {
  const v = r?.steps ?? r?.instructions ?? r?.directions;
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split("\n").map((x) => x.trim()).filter(Boolean);
  return [];
}

// PUBLIC_INTERFACE
export function RecipeModal({ recipe, onClose, onAddToPlan }) {
  /** Modal with recipe details + favorite toggle + add-to-planner. */
  const { favorites } = useAppState();
  const actions = useAppActions();

  const id = getId(recipe);
  const title = getTitle(recipe);
  const isFavorite = !!favorites[id];

  const ingredients = useMemo(() => normalizeIngredients(recipe), [recipe]);
  const steps = useMemo(() => normalizeSteps(recipe), [recipe]);

  return (
    <div
      className="modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Recipe details: ${title}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal">
        <div className="modalHeader">
          <div className="stack" style={{ gap: 6 }}>
            <h3 className="modalTitle">{title}</h3>
            <div className="muted" style={{ fontWeight: 700 }}>
              {recipe?.cuisine ? `${recipe.cuisine} • ` : ""}
              {recipe?.difficulty ? `${recipe.difficulty} • ` : ""}
              {recipe?.minutes ? `${recipe.minutes} min` : ""}
            </div>
          </div>

          <div className="row">
            <button
              className={isFavorite ? "btn btnSmall" : "btn btnSmall"}
              onClick={() => actions.toggleFavorite(id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "Unfavorite" : "Favorite"}
            >
              {isFavorite ? "★ Favorite" : "☆ Favorite"}
            </button>
            <button
              className="btn btnSmall btnPrimary"
              onClick={() => onAddToPlan?.(recipe)}
            >
              Add to plan
            </button>
            <button className="btn btnSmall" onClick={() => onClose?.()} aria-label="Close modal">
              Close
            </button>
          </div>
        </div>

        <div className="modalBody">
          <div className="kv">
            <div className="k">ID</div>
            <div className="v">{id || <span className="muted">n/a</span>}</div>
          </div>
          <div className="kv">
            <div className="k">Cuisine</div>
            <div className="v">{recipe?.cuisine || <span className="muted">n/a</span>}</div>
          </div>
          <div className="kv">
            <div className="k">Diet</div>
            <div className="v">{recipe?.diet || recipe?.dietary || <span className="muted">n/a</span>}</div>
          </div>

          <div className="stack" style={{ marginTop: 12 }}>
            <h4 className="sectionTitle">Ingredients</h4>
            {ingredients.length === 0 ? (
              <div className="muted">No ingredients provided by backend payload.</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {ingredients.map((x, idx) => (
                  <li key={`${x}-${idx}`} style={{ marginBottom: 6, fontWeight: 600 }}>
                    {x}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="stack" style={{ marginTop: 12 }}>
            <h4 className="sectionTitle">Steps</h4>
            {steps.length === 0 ? (
              <div className="muted">No steps provided by backend payload.</div>
            ) : (
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {steps.map((x, idx) => (
                  <li key={`${x}-${idx}`} style={{ marginBottom: 8, fontWeight: 600 }}>
                    {x}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
