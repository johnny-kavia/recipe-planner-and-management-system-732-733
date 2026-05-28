import React from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppProvider } from "./state/AppContext";
import { RecipesPage } from "./pages/RecipesPage";
import { PlannerPage } from "./pages/PlannerPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { ProfilePage } from "./pages/ProfilePage";

// PUBLIC_INTERFACE
function App() {
  /** Root application component: provides global state, layout shell, and page routing. */
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="appShell">
          <header className="header">
            <div className="brand" aria-label="Recipe Planner">
              <span className="brandDot" aria-hidden="true" />
              <span>Recipe Planner</span>
            </div>

            <nav className="nav" aria-label="Primary navigation">
              <NavItem to="/" label="Recipes" end />
              <NavItem to="/planner" label="Meal Planner" />
              <NavItem to="/shopping" label="Shopping List" />
              <NavItem to="/profile" label="Profile" />
            </nav>

            <div className="headerRight">
              <EnvBadge />
            </div>
          </header>

          <main className="container">
            <Routes>
              <Route path="/" element={<RecipesPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/shopping" element={<ShoppingListPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

function NavItem({ to, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => (isActive ? "navLink navLinkActive" : "navLink")}
    >
      {label}
    </NavLink>
  );
}

function EnvBadge() {
  const env = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development";
  return <span className="badge">Env: {env}</span>;
}

export default App;
