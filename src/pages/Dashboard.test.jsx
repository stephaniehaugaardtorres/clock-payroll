import { test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./Dashboard";

function mockGeoSuccess({ lat = 33, lng = -84, accuracy = 10 } = {}) {
  const getCurrentPosition = vi.fn((success) => {
    success({ coords: { latitude: lat, longitude: lng, accuracy } });
  });

  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition },
    configurable: true,
  });

  return { getCurrentPosition };
}

function mockGeoError(code = 1) {
  const getCurrentPosition = vi.fn((_, error) => {
    error({ code });
  });

  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition },
    configurable: true,
  });

  return { getCurrentPosition };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

test("shows initial status", () => {
  render(<Dashboard />);
  expect(screen.getByText(/not clocked in/i)).toBeInTheDocument();
});

test("clock out updates status", async () => {
  const user = userEvent.setup();
  render(<Dashboard />);

  await user.click(screen.getByRole("button", { name: /clock out/i }));
  expect(screen.getByText(/clocked out/i)).toBeInTheDocument();
});

test("clock in calls geolocation", async () => {
  const { getCurrentPosition } = mockGeoSuccess();
  const user = userEvent.setup();
  render(<Dashboard />);

  await user.click(screen.getByRole("button", { name: /clock in/i }));
  expect(getCurrentPosition).toHaveBeenCalledTimes(1);
});

test("clock in shows permission denied error", async () => {
  mockGeoError(1);
  const user = userEvent.setup();
  render(<Dashboard />);

  await user.click(screen.getByRole("button", { name: /clock in/i }));
  expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
});