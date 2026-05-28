import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { apiSearchRecipes } from "../api/client";
import { loadFavorites, loadMealPlan, loadProfile, saveFavorites, saveMealPlan, saveProfile } from "./storage";

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

const initialState = {
  loadingRecipes: false,
  recipesError: null,
  recipes: [],
  query: "",
  filters: {
    cuisine: "",
    diet: "",
    difficulty: "",
    maxMinutes: "",
    ingredients: [],
  },
  favorites: {},
  mealPlan: {},
  profile: { email: "", displayName: "" },
};

function reducer(state, action) {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.payload };
    case "setQuery":
      return { ...state, query: action.query };
    case "setFilters":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case "setLoadingRecipes":
      return { ...state, loadingRecipes: action.value, recipesError: null };
    case "setRecipes":
      return { ...state, recipes: action.recipes, loadingRecipes: false, recipesError: null };
    case "setRecipesError":
      return { ...state, recipesError: action.error, loadingRecipes: false };
    case "toggleFavorite": {
      const next = { ...state.favorites };
      if (next[action.recipeId]) delete next[action.recipeId];
      else next[action.recipeId] = true;
      return { ...state, favorites: next };
    }
    case "setMealPlan":
      return { ...state, mealPlan: action.mealPlan };
    case "setProfile":
      return { ...state, profile: action.profile };
    default:
      return state;
  }
}

// PUBLIC_INTERFACE
export function AppProvider({ children }) {
  /** Global app provider for state/actions used throughout the UI. */
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const hydrated = {
      favorites: loadFavorites(),
      mealPlan: loadMealPlan(),
      profile: loadProfile(),
    };
    dispatch({ type: "hydrate", payload: hydrated });
  }, []);

  useEffect(() => {
    saveFavorites(state.favorites);
  }, [state.favorites]);

  useEffect(() => {
    saveMealPlan(state.mealPlan);
  }, [state.mealPlan]);

  useEffect(() => {
    saveProfile(state.profile);
  }, [state.profile]);

  const actions = useMemo(() => {
    return {
      // PUBLIC_INTERFACE
      async refreshRecipes() {
        /** Fetch recipes based on current query+filters. */
        dispatch({ type: "setLoadingRecipes", value: true });
        try {
          const recipes = await apiSearchRecipes({
            q: state.query,
            filters: {
              ...state.filters,
              maxMinutes: state.filters.maxMinutes ? Number(state.filters.maxMinutes) : undefined,
            },
          });
          dispatch({ type: "setRecipes", recipes });
        } catch (e) {
          dispatch({ type: "setRecipesError", error: e?.message || "Failed to load recipes." });
        }
      },
      // PUBLIC_INTERFACE
      setQuery(query) {
        /** Update recipe query string. */
        dispatch({ type: "setQuery", query });
      },
      // PUBLIC_INTERFACE
      setFilters(filters) {
        /** Update recipe filters. */
        dispatch({ type: "setFilters", filters });
      },
      // PUBLIC_INTERFACE
      toggleFavorite(recipeId) {
        /** Toggle favorite status for a recipe ID. */
        dispatch({ type: "toggleFavorite", recipeId });
      },
      // PUBLIC_INTERFACE
      setMealPlan(mealPlan) {
        /** Replace current meal plan. */
        dispatch({ type: "setMealPlan", mealPlan });
      },
      // PUBLIC_INTERFACE
      setProfile(profile) {
        /** Replace current profile. */
        dispatch({ type: "setProfile", profile });
      },
    };
  }, [state.query, state.filters]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={actions}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAppState() {
  /** Read-only access to global state. */
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function useAppActions() {
  /** Access to global actions. */
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error("useAppActions must be used within AppProvider");
  return ctx;
}
