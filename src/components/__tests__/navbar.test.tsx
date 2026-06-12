import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Navbar from "../navbar";

describe("Navbar", () => {
  it("renders the Sign in link", () => {
    render(<Navbar />);
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href");
  });

  it("renders the List your property CTA", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /list your property/i }),
    ).toBeInTheDocument();
  });
});
