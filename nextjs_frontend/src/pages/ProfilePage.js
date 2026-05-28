import React, { useMemo, useState } from "react";
import { apiLogin, getApiBaseUrl } from "../api/client";
import { useAppActions, useAppState } from "../state/AppContext";

// PUBLIC_INTERFACE
export function ProfilePage() {
  /** Profile/settings page: local profile persistence with optional backend login attempt. */
  const { profile, favorites, mealPlan } = useAppState();
  const actions = useAppActions();

  const [email, setEmail] = useState(profile.email || "");
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [status, setStatus] = useState(null);

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const favoritesCount = Object.keys(favorites || {}).length;

  const plannedMealsCount = useMemo(() => {
    const keys = Object.keys(mealPlan || {});
    return keys.reduce((acc, k) => acc + (mealPlan[k]?.length || 0), 0);
  }, [mealPlan]);

  const save = () => {
    actions.setProfile({ email: email.trim(), displayName: displayName.trim() });
    setStatus({ kind: "ok", message: "Saved profile locally." });
  };

  const tryLogin = async () => {
    setStatus({ kind: "info", message: "Attempting login…" });
    try {
      const res = await apiLogin({ email: email.trim() });
      actions.setProfile({ email: email.trim(), displayName: displayName.trim() });
      setStatus({
        kind: "ok",
        message:
          res?.warning
            ? `Logged in locally. Backend note: ${res.warning}`
            : "Login request succeeded (or backend returned a compatible response).",
      });
    } catch (e) {
      setStatus({ kind: "err", message: e?.message || "Login failed." });
    }
  };

  return (
    <div className="pageGrid">
      <aside className="card" aria-label="Account summary">
        <div className="cardHeader">
          <h2 className="cardTitle">Summary</h2>
        </div>
        <div className="cardBody stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="muted" style={{ fontWeight: 800 }}>
              Favorites
            </div>
            <div style={{ fontWeight: 900 }}>{favoritesCount}</div>
          </div>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="muted" style={{ fontWeight: 800 }}>
              Planned meals
            </div>
            <div style={{ fontWeight: 900 }}>{plannedMealsCount}</div>
          </div>

          <div className="muted" style={{ fontWeight: 700 }}>
            API Base:{" "}
            {apiBase ? (
              <span style={{ color: "var(--text)" }}>{apiBase}</span>
            ) : (
              <span style={{ color: "var(--danger)" }}>Not set</span>
            )}
          </div>
          {!apiBase ? (
            <div className="muted" style={{ fontWeight: 700 }}>
              Set <code>REACT_APP_API_BASE</code> or <code>REACT_APP_BACKEND_URL</code> to enable backend integration.
            </div>
          ) : null}
        </div>
      </aside>

      <div className="stack">
        <section className="card" aria-label="Profile settings">
          <div className="cardHeader">
            <h2 className="cardTitle">Profile & Settings</h2>
          </div>
          <div className="cardBody stack">
            <div className="stack">
              <label className="muted" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                className="input"
                placeholder="e.g. Alex"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="stack">
              <label className="muted" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="row">
              <button className="btn btnPrimary" onClick={save}>
                Save
              </button>
              <button className="btn" onClick={tryLogin} disabled={!email.trim()}>
                Login (optional)
              </button>
            </div>

            {status ? (
              <div
                className="card"
                style={{
                  borderRadius: 12,
                  borderColor:
                    status.kind === "err"
                      ? "rgba(239,68,68,0.35)"
                      : status.kind === "ok"
                        ? "rgba(16,185,129,0.35)"
                        : "rgba(245,158,11,0.35)",
                  background:
                    status.kind === "err"
                      ? "rgba(239,68,68,0.08)"
                      : status.kind === "ok"
                        ? "rgba(16,185,129,0.08)"
                        : "rgba(245,158,11,0.08)",
                }}
              >
                <div className="cardBody">
                  <div style={{ fontWeight: 800 }}>{status.message}</div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="card" aria-label="Favorites info">
          <div className="cardHeader">
            <h2 className="cardTitle">Favorites</h2>
          </div>
          <div className="cardBody stack">
            <div className="muted" style={{ fontWeight: 700 }}>
              Favorite recipes are stored locally in your browser for now.
            </div>
            <a className="btn btnPrimary" href="/">
              Browse recipes →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
