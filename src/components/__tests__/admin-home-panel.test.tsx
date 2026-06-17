import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminHomePanel } from "@/components/admin-home-panel";
import { useAuth } from "@/lib/auth/context";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
	usePathname: () => "/admin/queue",
}));

vi.mock("@/lib/auth/context", () => ({ useAuth: vi.fn() }));

beforeEach(() => {
	replaceMock.mockReset();
	vi.mocked(useAuth).mockReset();
});

describe("AdminHomePanel", () => {
	it("redirects to /auth (preserving returnTo) when the session is unauthenticated", async () => {
		vi.mocked(useAuth).mockReturnValue({
			status: "unauthenticated",
			refresh: vi.fn(),
			signOut: vi.fn(),
		});

		render(<AdminHomePanel />);

		await waitFor(() =>
			expect(replaceMock).toHaveBeenCalledWith(
				"/auth?returnTo=%2Fadmin%2Fqueue",
			),
		);
		// No dead-end: a loading affordance shows while the redirect is in flight.
		expect(screen.getByText("Loading…")).toBeInTheDocument();
	});

	it("does not redirect while the session is still resolving", () => {
		vi.mocked(useAuth).mockReturnValue({
			status: "unknown",
			refresh: vi.fn(),
			signOut: vi.fn(),
		});

		render(<AdminHomePanel />);

		expect(replaceMock).not.toHaveBeenCalled();
		expect(screen.getByText("Loading…")).toBeInTheDocument();
	});

	it("shows auth infrastructure failures without redirecting", () => {
		vi.mocked(useAuth).mockReturnValue({
			status: "error",
			message:
				"Authentication is temporarily unavailable. Please try again.",
			refresh: vi.fn(),
			signOut: vi.fn(),
		});

		render(<AdminHomePanel />);

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Authentication is temporarily unavailable",
		);
		expect(replaceMock).not.toHaveBeenCalled();
	});

	it("renders the signed-in panel when authenticated", () => {
		vi.mocked(useAuth).mockReturnValue({
			status: "authenticated",
			userID: "u1",
			superadmin: true,
			name: "Ada Obi",
			refresh: vi.fn(),
			signOut: vi.fn(),
		});

		render(<AdminHomePanel />);

		expect(screen.getByText("Ada Obi")).toBeInTheDocument();
		expect(screen.getByText("Superadmin")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign out/i }),
		).toBeInTheDocument();
		expect(replaceMock).not.toHaveBeenCalled();
	});
});
