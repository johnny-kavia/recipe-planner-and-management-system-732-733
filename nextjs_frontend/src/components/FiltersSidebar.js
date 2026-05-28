import React, { useMemo, useState } from "react";
import { useAppActions, useAppState } from "../state/AppContext";

const CUISINES = ["", "Italian", "Mexican", "Indian", "Japanese", "Mediterranean", "American"];
const DIETS = ["", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"];
const DIFFICULTIES = ["", "Easy", "Medium", "Hard"];

// PUBLIC_INTERFACE
export function FiltersSidebar() {
  /** Sidebar that edits query/filters and triggers recipe refresh. */
  const { query, filters, loadingRecipes } = useAppState();
  const actions = useAppActions();

  const [ingredientInput, setIngredientInput] = useState("");

  const ingredientPills = useMemo(() => filters.ingredients || [], [filters.ingredients]);

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (!trimmed) return;
    const next = Array.from(new Set([...(filters.ingredients || []), trimmed]));
    actions.setFilters({ ingredients: next });
    setIngredientInput("");
  };

  const removeIngredient = (name) => {
    const next = (filters.ingredients || []).filter((x) => x !== name);
    actions.setFilters({ ingredients: next });
  };

  return (
    <aside className="card" aria-label="Search and filters">
      <div className="cardHeader">
        <h2 className="cardTitle">Search & Filters</h2>
        <button className="btn btnSmall" onClick={() => actions.refreshRecipes()} disabled={loadingRecipes}>
          Refresh
        </button>
      </div>

      <div className="cardBody stack">
        <div className="stack">
          <label className="muted" htmlFor="q">
            Keyword search
          </label>
          <input
            id="q"
            className="input"
            placeholder="e.g. chicken, pasta, salad..."
            value={query}
            onChange={(e) => actions.setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") actions.refreshRecipes();
            }}
          />
        </div>

        <div className="stack">
          <label className="muted" htmlFor="cuisine">
            Cuisine
          </label>
          <select
            id="cuisine"
            className="select"
            value={filters.cuisine || ""}
            onChange={(e) => actions.setFilters({ cuisine: e.target.value })}
          >
            {CUISINES.map((c) => (
              <option key={c || "any"} value={c}>
                {c ? c : "Any"}
              </option>
            ))}
          </select>
        </div>

        <div className="stack">
          <label className="muted" htmlFor="diet">
            Dietary preference
          </label>
          <select
            id="diet"
            className="select"
            value={filters.diet || ""}
            onChange={(e) => actions.setFilters({ diet: e.target.value })}
          >
            {DIETS.map((d) => (
              <option key={d || "any"} value={d}>
                {d ? d : "Any"}
              </option>
            ))}
          </select>
        </div>

        <div className="stack">
          <label className="muted" htmlFor="difficulty">
            Difficulty
          </label>
          <select
            id="difficulty"
            className="select"
            value={filters.difficulty || ""}
            onChange={(e) => actions.setFilters({ difficulty: e.target.value })}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d || "any"} value={d}>
                {d ? d : "Any"}
              </option>
            ))}
          </select>
        </div>

        <div className="stack">
          <label className="muted" htmlFor="maxMinutes">
            Max cook time (minutes)
          </label>
          <input
            id="maxMinutes"
            className="input"
            type="number"
            min="0"
            placeholder="e.g. 30"
            value={filters.maxMinutes || ""}
            onChange={(e) => actions.setFilters({ maxMinutes: e.target.value })}
          />
        </div>

        <div className="stack">
          <label className="muted">Ingredients (smart filter)</label>
          <div className="row">
            <input
              className="input"
              placeholder="Add ingredient e.g. tomato"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addIngredient();
              }}
            />
            <button className="btn btnSmall" onClick={addIngredient}>
              Add
            </button>
          </div>

          <div className="pillRow" aria-label="Selected ingredients">
            {ingredientPills.length === 0 ? (
              <span className="muted">No ingredients selected.</span>
            ) : (
              ingredientPills.map((name) => (
                <button
                  key={name}
                  className="pill pillActive"
                  onClick={() => removeIngredient(name)}
                  title="Remove ingredient"
                >
                  {name} ✕
                </button>
              ))
            )}
          </div>
        </div>

        <div className="row">
          <button className="btn btnPrimary" onClick={() => actions.refreshRecipes()} disabled={loadingRecipes}>
            {loadingRecipes ? "Loading..." : "Search"}
          </button>
          <button
            className="btn"
            onClick={() => {
              actions.setQuery("");
              actions.setFilters({ cuisine: "", diet: "", difficulty: "", maxMinutes: "", ingredients: [] });
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
}
