const KEY = {
  favorites: "rp:favorites:v1",
  mealPlan: "rp:mealPlan:v1",
  profile: "rp:profile:v1",
};

function safeParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  return safeParse(raw, fallback);
}

function write(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// PUBLIC_INTERFACE
export function loadFavorites() {
  /** Load favorites map { [recipeId]: true } */
  return read(KEY.favorites, {});
}

// PUBLIC_INTERFACE
export function saveFavorites(favorites) {
  /** Persist favorites map { [recipeId]: true } */
  write(KEY.favorites, favorites);
}

// PUBLIC_INTERFACE
export function loadMealPlan() {
  /**
   * Load meal plan:
   * { [dayKey: string]: Array<{ id: string, title: string, recipeId: string }> }
   */
  return read(KEY.mealPlan, {});
}

// PUBLIC_INTERFACE
export function saveMealPlan(mealPlan) {
  /** Persist meal plan. */
  write(KEY.mealPlan, mealPlan);
}

// PUBLIC_INTERFACE
export function loadProfile() {
  /** Load profile info: { email, displayName } */
  return read(KEY.profile, { email: "", displayName: "" });
}

// PUBLIC_INTERFACE
export function saveProfile(profile) {
  /** Persist profile info. */
  write(KEY.profile, profile);
}
