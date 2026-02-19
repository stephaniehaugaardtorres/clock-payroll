import {render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "./Dashboard";

test("initial status shows not clocked in", () => {
    render(<Dashboard />);
    expect(screen.getByText(/not clocked in/i)).toBeInTheDocument();
});

test("clock in updates status", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByRole("button", { name: /clock in/i}));
    expect(screen.getByText(/clocked in/i)).toBeInTheDocument();
});

test("clock out updates status", async () => {
    const user = userEvent.setup();
    render(<Dashboard />);
    await user.click(screen.getByRole("button", { name: /clock out/i }));
    expect(screen.getByText(/clocked out/i)).toBeInTheDocument();
});