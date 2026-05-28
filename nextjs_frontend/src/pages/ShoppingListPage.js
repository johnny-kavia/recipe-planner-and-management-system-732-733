import React from "react";
import { ShoppingList } from "../components/ShoppingList";

// PUBLIC_INTERFACE
export function ShoppingListPage() {
  /** Shopping list page derived from meal plan. */
  return (
    <div className="pageGrid">
      <aside className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Help</h2>
        </div>
        <div className="cardBody stack">
          <div className="muted" style={{ fontWeight: 700 }}>
            Plan meals in the Meal Planner page to generate your list.
          </div>
          <a className="btn btnPrimary" href="/planner">
            Go to Meal Planner →
          </a>
        </div>
      </aside>

      <div className="stack">
        <ShoppingList />
      </div>
    </div>
  );
}
