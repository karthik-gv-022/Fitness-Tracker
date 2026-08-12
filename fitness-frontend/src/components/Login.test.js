import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { login } from "../services/api";

jest.mock("../services/api", () => ({
  login: jest.fn(),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

test("logs in and stores session on success", async () => {
  login.mockResolvedValue({
    data: { token: "abc123", userId: 1, username: "alice" },
  });

  renderLogin();
  fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "alice" } });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "secret123" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  await waitFor(() => {
    expect(login).toHaveBeenCalledWith({ username: "alice", password: "secret123" });
    expect(localStorage.getItem("token")).toBe("abc123");
    expect(localStorage.getItem("username")).toBe("alice");
  });
});

test("shows error on wrong credentials", async () => {
  login.mockRejectedValue({ response: { status: 401 } });

  renderLogin();
  fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "alice" } });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(await screen.findByText("Invalid username or password.")).toBeInTheDocument();
});

test("shows backend-down message on network error", async () => {
  login.mockRejectedValue(new Error("network"));

  renderLogin();
  fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "alice" } });
  fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "secret123" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(
    await screen.findByText("Could not reach the server. Is the backend running?")
  ).toBeInTheDocument();
});