/**
 * Minimal REST client wrapper for the Recipe Planner backend.
 *
 * Uses existing env vars:
 * - REACT_APP_API_BASE (preferred) or REACT_APP_BACKEND_URL
 */

function getApiBase() {
  return (
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    ""
  ).replace(/\/$/, "");
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns resolved API base URL (may be empty if not configured). */
  return getApiBase();
}

async function request(path, options = {}) {
  const base = getApiBase();
  if (!base) {
    const err = new Error(
      "Backend API base URL not configured. Set REACT_APP_API_BASE or REACT_APP_BACKEND_URL."
    );
    err.code = "MISSING_API_BASE";
    throw err;
  }

  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (body && body.detail && String(body.detail)) ||
      (body && body.message && String(body.message)) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/**
 * Heuristically normalize recipe lists coming from unknown API shapes:
 * - array
 * - {items: []}
 * - {recipes: []}
 * - {data: []}
 */
function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["items", "recipes", "data", "results"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function normalizeRecipe(payload) {
  if (!payload || typeof payload !== "object") return null;
  return payload.recipe && typeof payload.recipe === "object" ? payload.recipe : payload;
}

// PUBLIC_INTERFACE
export async function apiSearchRecipes({ q, filters } = {}) {
  /**
   * Search recipes endpoint with best-effort compatibility.
   * Tries common patterns:
   * - GET /recipes?q=...
   * - GET /recipes/search?q=...
   */
  const params = new URLSearchParams();
  if (q) params.set("q", q);

  if (filters?.cuisine) params.set("cuisine", filters.cuisine);
  if (filters?.diet) params.set("diet", filters.diet);
  if (filters?.difficulty) params.set("difficulty", filters.difficulty);
  if (filters?.maxMinutes) params.set("max_minutes", String(filters.maxMinutes));
  if (filters?.ingredients?.length) params.set("ingredients", filters.ingredients.join(","));

  const qs = params.toString() ? `?${params.toString()}` : "";
  const tryPaths = [`/recipes${qs}`, `/recipes/search${qs}`];

  let lastErr = null;
  for (const p of tryPaths) {
    try {
      const payload = await request(p, { method: "GET" });
      return normalizeList(payload);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

// PUBLIC_INTERFACE
export async function apiGetRecipeById(id) {
  /** Fetch a recipe by ID using common patterns: GET /recipes/{id} */
  const payload = await request(`/recipes/${encodeURIComponent(id)}`, { method: "GET" });
  return normalizeRecipe(payload);
}

// PUBLIC_INTERFACE
export async function apiLogin({ email }) {
  /**
   * Minimal "account" support. Since backend contract is unknown, we implement
   * a local-only account with optional server call if endpoint exists.
   *
   * Attempts:
   * - POST /auth/login
   * - POST /login
   */
  const payload = { email };
  const tryPaths = ["/auth/login", "/login"];
  let lastErr = null;

  for (const p of tryPaths) {
    try {
      const res = await request(p, { method: "POST", body: JSON.stringify(payload) });
      return res;
    } catch (e) {
      lastErr = e;
    }
  }

  // If backend doesn't support auth endpoints, fall back to local-only login.
  return { token: null, user: { email }, warning: lastErr?.message || "Using local-only login." };
}
