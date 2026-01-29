import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./pages/Dashboard", () => ({
  default: () => <div>Dashboard</div>,
}));
vi.mock("./pages/History", () => ({
  default: () => <div>History</div>,
}));
vi.mock("./pages/Zones", () => ({
  default: () => <div>Zones</div>,
}));
vi.mock("./pages/System", () => ({
  default: () => <div>System</div>,
}));

describe("App", () => {
  it("renders navigation", () => {
    render(<App />);

    expect(screen.getByText("WaterPal")).toBeInTheDocument();
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
  });
});
