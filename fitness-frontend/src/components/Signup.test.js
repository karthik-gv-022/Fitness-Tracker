import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "./Signup";
import { register } from "../services/api";

jest.mock("../services/api", () => ({
  register: jest.fn(),
}));

const renderSignup = () =>
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );

const fillForm = () => {
  fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "bob" } });
  fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "secret123" } });
  fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "secret123" } });
};

test("registers and stores session on success", async () => {
  register.mockResolvedValue({
    data: { token: "xyz789", userId: 2, username: "bob" },
  });

  renderSignup();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

  await waitFor(() => {
    expect(register).toHaveBeenCalledWith({ username: "bob", password: "secret123" });
    expect(localStorage.getItem("token")).toBe("xyz789");
    expect(localStorage.getItem("username")).toBe("bob");
  });
});

test("shows error on duplicate username", async () => {
  register.mockRejectedValue({ response: { status: 409 } });

  renderSignup();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(await screen.findByText("Username already exists.")).toBeInTheDocument();
});

test("shows error when passwords mismatch", () => {
  renderSignup();
  fireEvent.change(screen.getByPlaceholderText("Username"), { target: { value: "bob" } });
  fireEvent.change(screen.getByPlaceholderText("Password (min 6 characters)"), { target: { value: "secret123" } });
  fireEvent.change(screen.getByPlaceholderText("Confirm Password"), { target: { value: "different" } });
  fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

  expect(screen.getByText("Passwords do not match!")).toBeInTheDocument();
});