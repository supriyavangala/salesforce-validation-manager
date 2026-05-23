import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import * as api from "./services/salesforceApi";

describe("App routing", () => {
  test("renders Home navigation link", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

  test("renders Login page", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Login to Salesforce/i)).toBeInTheDocument();
  });

  test("renders Dashboard page", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Validation Rules Dashboard/i)).toBeInTheDocument();
  });

  test("renders Settings page", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/App Settings/i)).toBeInTheDocument();
  });

  test("renders Deploy page", () => {
    render(
      <MemoryRouter initialEntries={["/deploy"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Deploy Validation Rules/i)).toBeInTheDocument(); // ✅ fixed text
  });

  test("renders Error page for invalid route", () => {
    render(
      <MemoryRouter initialEntries={["/invalid"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText(/404 - Page Not Found/i)).toBeInTheDocument();
  });

  test("renders RuleDetails page", async () => {
    jest.spyOn(api, "getRuleById").mockResolvedValue({
      Id: "123",
      ValidationName: "Test Rule",
      Active: true,
      ErrorMessage: "Sample error",
      ErrorConditionFormula: "1=1",
    });

    render(
      <MemoryRouter initialEntries={["/rules/123"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Test Rule/i)).toBeInTheDocument();
    expect(await screen.findByText(/Active ✅/i)).toBeInTheDocument();
  });
});
