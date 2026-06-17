import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, NetworkError, apiFetch } from "@/lib/api";
import { AuthProvider, useAuth } from "@/lib/auth/context";

vi.mock("@/lib/api", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/api")>();
	return { ...actual, apiFetch: vi.fn() };
});

function Probe() {
	const { status } = useAuth();
	return <div data-testid="status">{status}</div>;
}

function renderProvider() {
	return render(
		<AuthProvider>
			<Probe />
		</AuthProvider>,
	);
}

beforeEach(() => {
	vi.mocked(apiFetch).mockReset();
});

describe("AuthProvider", () => {
	it("resolves to authenticated when /api/auth/me succeeds", async () => {
		vi.mocked(apiFetch).mockResolvedValueOnce({
			user_id: "u1",
			superadmin: false,
			name: "Ada",
		});

		renderProvider();

		await waitFor(() =>
			expect(screen.getByTestId("status").textContent).toBe(
				"authenticated",
			),
		);
	});

	it("resolves to unauthenticated on a genuine 401", async () => {
		vi.mocked(apiFetch).mockRejectedValueOnce(
			new ApiError("unauthorized", 401, "x"),
		);

		renderProvider();

		await waitFor(() =>
			expect(screen.getByTestId("status").textContent).toBe(
				"unauthenticated",
			),
		);
	});

	it("surfaces a 503 (jwt verifier unavailable) without false logout", async () => {
		vi.mocked(apiFetch).mockRejectedValueOnce(
			new ApiError("jwt_verifier_unavailable", 503, "x"),
		);

		renderProvider();

		await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
		await act(async () => {
			await Promise.resolve();
		});
		expect(screen.getByTestId("status").textContent).toBe("error");
	});

	it("surfaces a network failure without false logout", async () => {
		vi.mocked(apiFetch).mockRejectedValueOnce(
			new NetworkError(new Error("down")),
		);

		renderProvider();

		await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
		await act(async () => {
			await Promise.resolve();
		});
		expect(screen.getByTestId("status").textContent).toBe("error");
	});
});
