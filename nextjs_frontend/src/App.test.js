import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders primary navigation", () => {
  render(<App />);
  expect(screen.getByText(/Recipes/i)).toBeInTheDocument();
  expect(screen.getByText(/Meal Planner/i)).toBeInTheDocument();
  expect(screen.getByText(/Shopping List/i)).toBeInTheDocument();
  expect(screen.getByText(/Profile/i)).toBeInTheDocument();
});
