import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { me } from "../services/api";

jest.mock("../services/api", () => ({
  me: jest.fn(),
}));

const renderProtected = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>SECRET_DASHBOARD</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );

test("redirects to login when no token", () => {
  localStorage.clear();
  renderProtected();
  expect(screen.getByText("LOGIN_PAGE")).toBeInTheDocument();
  expect(screen.queryByText("SECRET_DASHBOARD")).not.toBeInTheDocument();
});

test("renders children when token valid", async () => {
  localStorage.setItem("token", "good-token");
  me.mockResolvedValue({ data: { userId: 1, username: "alice" } });

  renderProtected();
  expect(await screen.findByText("SECRET_DASHBOARD")).toBeInTheDocument();
});

test("redirects to login on 401", async () => {
  localStorage.setItem("token", "expired-token");
  me.mockRejectedValue({ response: { status: 401 } });

  renderProtected();
  expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
});

test("shows retry state on network error, does not log out", async () => {
  localStorage.setItem("token", "some-token");
  me.mockRejectedValue(new Error("network"));

  renderProtected();
  expect(
    await screen.findByText(/Cannot reach the backend/)
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  expect(screen.queryByText("LOGIN_PAGE")).not.toBeInTheDocument();
});