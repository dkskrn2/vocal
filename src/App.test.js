import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("react-router-dom");

import App from "./App.tsx";

test("renders global navigation and brand", () => {
  render(<App />);

  expect(screen.getByRole("link", { name: /coverfit/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "대시보드" })).toBeInTheDocument();
});
