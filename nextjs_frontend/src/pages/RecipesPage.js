import React, { useEffect, useMemo, useState } from "react";
import { FiltersSidebar } from "../components/FiltersSidebar";
import { RecipeGrid } from "../components/RecipeGrid";
import { useAppActions, useAppState } from "../state/AppContext";
import { getApiBaseUrl } from "../api/client";

// PUBLIC_INTERFACE
export function RecipesPage() {
  /** Main recipe browsing page: sidebar filters + recipe list. */
  const state = useAppState();
  const actions = useAppActions();
  const [pendingAdd, setPendingAdd] = useState(null);

  useEffect(() => {
    // initial load
    actions.refreshRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const missingApi = !apiBase;

  return (
    <div className="pageGrid">
      <FiltersSidebar />

      <div className="stack">
        {missingApi ? (
          <div className="card">
            <div className="cardBody">
              <h1 className="sectionTitle">Connect to backend</h1>
              <div className="muted" style={{ fontWeight: 700 }}>
                Set <code>REACT_APP_API_BASE</code> (preferred) or <code>REACT_APP_BACKEND_URL</code> to enable recipe
                search and details.
              </div>
            </div>
          </div>
        ) : null}

        {pendingAdd ? (
          <div className="card">
            <div className="cardBody row" style={{ justifyContent: "space-between" }}>
              <div className="muted" style={{ fontWeight: 800 }}>
                Pending add to planner:{" "}
                <span style={{ color: "var(--text)" }}>{pendingAdd?.title || pendingAdd?.name}</span>
              </div>
              <a className="btn btnSmall btnPrimary" href="/planner">
                Go to planner →
              </a>
              <button className="btn btnSmall btnDanger" onClick={() => setPendingAdd(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <RecipeGrid
          onAddToPlan={(recipe) => {
            setPendingAdd(recipe);
            // Store "pending add" in session memory only; the planner page has its own add UX.
          }}
        />

        <div className="card">
          <div className="cardBody">
            <h2 className="sectionTitle">Favorites</h2>
            <div className="muted" style={{ fontWeight: 700 }}>
              You have {Object.keys(state.favorites || {}).length} favorite recipe(s).
              {" "}Open a recipe and click ☆/★ to favorite it.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
