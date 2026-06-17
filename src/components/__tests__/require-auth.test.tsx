import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth/context";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
	usePathname: () => "/communities/create",
	useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth/context", () => ({ useAuth: vi.fn() }));

beforeEach(() => {
	replaceMock.mockReset();
	vi.mocked(useAuth).mockReset();
});

describe("RequireAuth", () => {
	it("shows auth infrastructure failures without redirecting", () => {
		vi.mocked(useAuth).mockReturnValue({
			status: "error",
			message:
				"Authentication is temporarily unavailable. Please try again.",
			refresh: vi.fn(),
			signOut: vi.fn(),
		});

		render(
			<RequireAuth>
				<div>Protected</div>
			</RequireAuth>,
		);

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Authentication is temporarily unavailable",
		);
		expect(screen.queryByText("Protected")).not.toBeInTheDocument();
		expect(replaceMock).not.toHaveBeenCalled();
	});
});
