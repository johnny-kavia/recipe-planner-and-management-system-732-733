import React, { useMemo } from "react";
import { useAppState } from "../state/AppContext";

function extractIngredientsFromMealItem(item) {
  // Best-effort: meal items may not contain ingredients; this supports enhanced future payloads.
  const v = item?.ingredients;
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split("\n").map((x) => x.trim()).filter(Boolean);
  return [];
}

function uniq(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

// PUBLIC_INTERFACE
export function ShoppingList() {
  /** Generate a shopping list from the current meal plan. */
  const { mealPlan } = useAppState();

  const { daysCount, itemsCount, ingredients } = useMemo(() => {
    const dayKeys = Object.keys(mealPlan || {});
    const allItems = dayKeys.flatMap((k) => mealPlan[k] || []);
    const allIngredients = allItems.flatMap((it) => extractIngredientsFromMealItem(it));

    // Fallback: if no ingredients available, use recipe titles as "items to buy" hint.
    const fallback = allItems.map((it) => it?.title).filter(Boolean).map((t) => `Ingredients for: ${t}`);

    const finalList = allIngredients.length ? uniq(allIngredients) : uniq(fallback);

    return {
      daysCount: dayKeys.length,
      itemsCount: allItems.length,
      ingredients: finalList,
    };
  }, [mealPlan]);

  return (
    <section className="card" aria-label="Shopping list">
      <div className="cardHeader">
        <h2 className="cardTitle">Shopping List</h2>
        <div className="muted">
          {daysCount} day(s), {itemsCount} planned meal(s)
        </div>
      </div>

      <div className="cardBody">
        {ingredients.length === 0 ? (
          <div className="muted">No meals planned yet. Add recipes to the planner to generate a list.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {ingredients.map((x, idx) => (
              <li key={`${x}-${idx}`} style={{ marginBottom: 8, fontWeight: 650 }}>
                {x}
              </li>
            ))}
          </ul>
        )}

        <div className="muted" style={{ marginTop: 12, fontWeight: 700 }}>
          Note: If the backend provides ingredients per planned meal in the future, this list will automatically become more precise.
        </div>
      </div>
    </section>
  );
}
