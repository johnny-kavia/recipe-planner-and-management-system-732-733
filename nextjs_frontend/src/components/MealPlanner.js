import React, { useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useAppActions, useAppState } from "../state/AppContext";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday as start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function normalizeRecipeForPlan(recipe) {
  const id = String(recipe?.id ?? recipe?._id ?? recipe?.recipe_id ?? recipe?.slug ?? recipe?.name ?? "");
  const title = recipe?.title ?? recipe?.name ?? recipe?.label ?? "Recipe";
  return { id: `${id}:${Date.now()}`, recipeId: id, title };
}

// PUBLIC_INTERFACE
export function MealPlanner({ pendingAddRecipe, onConsumedPendingAdd }) {
  /**
   * Weekly planner with drag & drop.
   * - Draggable items within/between days
   * - "Add recipe to current day" quick action when pendingAddRecipe is set
   */
  const { mealPlan } = useAppState();
  const actions = useAppActions();

  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const weekStart = useMemo(() => startOfWeek(anchorDate), [anchorDate]);
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, idx) => addDays(weekStart, idx));
  }, [weekStart]);

  const planForDay = (k) => mealPlan?.[k] || [];

  const updateMealPlan = (next) => {
    actions.setMealPlan(next);
  };

  const addToDay = (date, recipe) => {
    const k = dayKey(date);
    const next = { ...(mealPlan || {}) };
    const item = normalizeRecipeForPlan(recipe);
    next[k] = [...(next[k] || []), item];
    updateMealPlan(next);
  };

  const removeItem = (dayK, itemId) => {
    const next = { ...(mealPlan || {}) };
    next[dayK] = (next[dayK] || []).filter((x) => x.id !== itemId);
    updateMealPlan(next);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const fromK = source.droppableId;
    const toK = destination.droppableId;

    if (fromK === toK && source.index === destination.index) return;

    const next = { ...(mealPlan || {}) };
    const fromItems = Array.from(next[fromK] || []);
    const [moved] = fromItems.splice(source.index, 1);

    const toItems = fromK === toK ? fromItems : Array.from(next[toK] || []);
    toItems.splice(destination.index, 0, moved);

    next[fromK] = fromItems;
    next[toK] = toItems;

    updateMealPlan(next);
  };

  return (
    <section className="card" aria-label="Meal planner calendar">
      <div className="cardHeader">
        <h2 className="cardTitle">Meal Planner (Weekly)</h2>
        <div className="row">
          <button className="btn btnSmall" onClick={() => setAnchorDate(addDays(anchorDate, -7))}>
            ← Prev
          </button>
          <button className="btn btnSmall" onClick={() => setAnchorDate(new Date())}>
            Today
          </button>
          <button className="btn btnSmall" onClick={() => setAnchorDate(addDays(anchorDate, 7))}>
            Next →
          </button>
        </div>
      </div>

      <div className="cardBody">
        {pendingAddRecipe ? (
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
            <div className="muted" style={{ fontWeight: 800 }}>
              Pending: <span style={{ color: "var(--text)" }}>{pendingAddRecipe?.title || pendingAddRecipe?.name}</span>
              {" — "}choose a day to add.
            </div>
            <button className="btn btnSmall btnDanger" onClick={() => onConsumedPendingAdd?.()}>
              Cancel
            </button>
          </div>
        ) : null}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="calendarGrid" role="grid" aria-label="Week grid">
            {days.map((d, idx) => {
              const k = dayKey(d);
              const items = planForDay(k);
              return (
                <div className="calendarDay" key={k}>
                  <div className="dayHeader">
                    <div className="dayName">{DAY_NAMES[idx]}</div>
                    <div className="dayDate">
                      {d.getMonth() + 1}/{d.getDate()}
                    </div>
                  </div>

                  {pendingAddRecipe ? (
                    <button
                      className="btn btnSmall btnPrimary"
                      onClick={() => {
                        addToDay(d, pendingAddRecipe);
                        onConsumedPendingAdd?.();
                      }}
                    >
                      Add here
                    </button>
                  ) : null}

                  <Droppable droppableId={k}>
                    {(provided) => (
                      <div className="dropZone" ref={provided.innerRef} {...provided.droppableProps}>
                        {items.map((item, itemIdx) => (
                          <Draggable draggableId={item.id} index={itemIdx} key={item.id}>
                            {(drag) => (
                              <div
                                className="mealItem"
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                aria-label={`Meal item ${item.title}`}
                              >
                                <div className="stack" style={{ gap: 2 }}>
                                  <div>{item.title}</div>
                                  <div className="mealItemMeta">ID: {item.recipeId}</div>
                                </div>
                                <button
                                  className="pill"
                                  onClick={() => removeItem(k, item.id)}
                                  aria-label="Remove from day"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </section>
  );
}
