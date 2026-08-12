import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LogWorkout from "./LogWorkout";
import { logWorkout } from "../services/api";

jest.mock("../services/api", () => ({
  logWorkout: jest.fn(),
}));

const renderLogWorkout = () =>
  render(
    <MemoryRouter initialEntries={["/log-workout"]}>
      <Routes>
        <Route path="/log-workout" element={<LogWorkout />} />
        <Route path="/dashboard" element={<div>DASHBOARD_PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

test("shows error when required fields are missing", () => {
  renderLogWorkout();
  fireEvent.click(screen.getByRole("button", { name: "Save Workout" }));
  expect(screen.getByText("Please fill in all required fields!")).toBeInTheDocument();
  expect(logWorkout).not.toHaveBeenCalled();
});

test("submits workout and navigates to dashboard", async () => {
  logWorkout.mockResolvedValue({
    data: { id: 1, title: "Morning Run", duration: 30, calories: 300 },
  });

  renderLogWorkout();
  fireEvent.change(screen.getByPlaceholderText("e.g. Morning Run"), {
    target: { value: "Morning Run" },
  });
  fireEvent.change(screen.getByLabelText("Duration (minutes)"), {
    target: { value: "30" },
  });
  fireEvent.change(screen.getByLabelText("Calories Burned"), {
    target: { value: "300" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save Workout" }));

  await waitFor(() => {
    expect(logWorkout).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Morning Run", duration: 30, calories: 300 })
    );
  });
  expect(await screen.findByText("DASHBOARD_PAGE")).toBeInTheDocument();
});

test("shows backend-down message on failure", async () => {
  logWorkout.mockRejectedValue(new Error("network"));

  renderLogWorkout();
  fireEvent.change(screen.getByPlaceholderText("e.g. Morning Run"), {
    target: { value: "Morning Run" },
  });
  fireEvent.change(screen.getByLabelText("Duration (minutes)"), {
    target: { value: "30" },
  });
  fireEvent.change(screen.getByLabelText("Calories Burned"), {
    target: { value: "300" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save Workout" }));

  expect(
    await screen.findByText("Could not save the workout. Is the backend running?")
  ).toBeInTheDocument();
});