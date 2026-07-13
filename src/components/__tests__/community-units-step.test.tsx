import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommunityUnitsStep } from "@/components/community-units-step";
import { ApiError, apiFetch } from "@/lib/api";
import type { Unit } from "@/lib/units/schemas";

vi.mock("@/lib/api", async () => {
	const actual =
		await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
	return { ...actual, apiFetch: vi.fn() };
});

function makeUnit(overrides: Partial<Unit>): Unit {
	return {
		id: "u-1",
		community_id: "c-1",
		property_id: "p-1",
		label: "Flat 1",
		created_at: "2026-01-01T00:00:00.000Z",
		updated_at: "2026-01-01T00:00:00.000Z",
		...overrides,
	};
}

describe("CommunityUnitsStep", () => {
	beforeEach(() => {
		vi.mocked(apiFetch).mockReset();
	});

	it("bootstraps by fetching units for the given property and rendering rows", async () => {
		const units = [
			makeUnit({ id: "u-1", label: "Flat 1" }),
			makeUnit({ id: "u-2", label: "Flat 2" }),
		];
		vi.mocked(apiFetch).mockImplementation(async (path: string) => {
			if (path === "/api/properties/p-1/units") return { units };
			throw new Error(`unexpected call: ${path}`);
		});

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		expect(await screen.findByText("Units (2)")).toBeInTheDocument();
		expect(screen.getByText("Flat 1")).toBeInTheDocument();
		expect(screen.getByText("Flat 2")).toBeInTheDocument();
		expect(apiFetch).toHaveBeenCalledWith("/api/properties/p-1/units");
	});

	it("shows the empty state and disables Continue when there are no units", async () => {
		vi.mocked(apiFetch).mockResolvedValue({ units: [] });

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		expect(
			await screen.findByText(
				/No units yet — add your first one above\./,
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /continue/i }),
		).toBeDisabled();
	});

	it("adds multiple units, continuing numbering past existing labels", async () => {
		const existing = [makeUnit({ id: "u-1", label: "Flat 1" })];
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					return { units: existing };
				}
				if (path === "/api/properties/p-1/units" && method === "POST") {
					const body = JSON.parse(String(options?.body));
					expect(body).toEqual({
						labels: ["Flat 2", "Flat 3", "Flat 4"],
					});
					return {
						units: body.labels.map((label: string, i: number) =>
							makeUnit({ id: `new-${i}`, label }),
						),
					};
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Units (1)");
		fireEvent.change(screen.getByLabelText(/unit label/i), {
			target: { value: "Flat" },
		});
		const countInput = screen.getByLabelText(/how many/i);
		fireEvent.change(countInput, { target: { value: "" } });
		fireEvent.change(countInput, { target: { value: "3" } });

		const addButton = screen.getByRole("button", { name: /^add$/i });
		await waitFor(() => expect(addButton).toBeEnabled());
		fireEvent.click(addButton);

		await screen.findByText("Units (4)");
		expect(screen.getByText("Flat 2")).toBeInTheDocument();
		expect(screen.getByText("Flat 3")).toBeInTheDocument();
		expect(screen.getByText("Flat 4")).toBeInTheDocument();
		expect(screen.getByLabelText(/unit label/i)).toHaveValue("");
	});

	it("adds a single unit without a numeric suffix", async () => {
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					return { units: [] };
				}
				if (path === "/api/properties/p-1/units" && method === "POST") {
					const body = JSON.parse(String(options?.body));
					expect(body).toEqual({ labels: ["Penthouse"] });
					return {
						units: [makeUnit({ id: "u-p", label: "Penthouse" })],
					};
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Units (0)");
		fireEvent.change(screen.getByLabelText(/unit label/i), {
			target: { value: "Penthouse" },
		});

		const addButton = screen.getByRole("button", { name: /^add$/i });
		await waitFor(() => expect(addButton).toBeEnabled());
		fireEvent.click(addButton);

		expect(await screen.findByText("Penthouse")).toBeInTheDocument();
	});

	it("retries once after a 409 conflict by refetching and renumbering", async () => {
		let postCount = 0;
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					// First (bootstrap) GET: stale list. Refetch after 409: fresh list.
					return postCount === 0
						? { units: [makeUnit({ id: "u-1", label: "Flat 1" })] }
						: {
								units: [
									makeUnit({ id: "u-1", label: "Flat 1" }),
									makeUnit({ id: "u-2", label: "Flat 2" }),
									makeUnit({ id: "u-3", label: "Flat 3" }),
								],
							};
				}
				if (path === "/api/properties/p-1/units" && method === "POST") {
					postCount += 1;
					if (postCount === 1) {
						throw new ApiError("unit_label_taken", 409, "taken", {
							label: "Flat 2",
						});
					}
					const body = JSON.parse(String(options?.body));
					expect(body).toEqual({ labels: ["Flat 4", "Flat 5"] });
					return {
						units: body.labels.map((label: string, i: number) =>
							makeUnit({ id: `new-${i}`, label }),
						),
					};
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Units (1)");
		fireEvent.change(screen.getByLabelText(/unit label/i), {
			target: { value: "Flat" },
		});
		const countInput = screen.getByLabelText(/how many/i);
		fireEvent.change(countInput, { target: { value: "" } });
		fireEvent.change(countInput, { target: { value: "2" } });

		const addButton = screen.getByRole("button", { name: /^add$/i });
		await waitFor(() => expect(addButton).toBeEnabled());
		fireEvent.click(addButton);

		await screen.findByText("Units (5)");
		const posts = vi
			.mocked(apiFetch)
			.mock.calls.filter(
				([p, o]) =>
					p === "/api/properties/p-1/units" &&
					(o as RequestInit | undefined)?.method === "POST",
			);
		expect(posts).toHaveLength(2);
		expect(JSON.parse(String((posts[1][1] as RequestInit).body))).toEqual({
			labels: ["Flat 4", "Flat 5"],
		});
	});

	it("surfaces an inline error when the retry also conflicts", async () => {
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					return {
						units: [makeUnit({ id: "u-1", label: "Flat 1" })],
					};
				}
				if (path === "/api/properties/p-1/units" && method === "POST") {
					throw new ApiError("unit_label_taken", 409, "taken", {
						label: "Flat 2",
					});
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Units (1)");
		fireEvent.change(screen.getByLabelText(/unit label/i), {
			target: { value: "Flat" },
		});
		const countInput = screen.getByLabelText(/how many/i);
		fireEvent.change(countInput, { target: { value: "" } });
		fireEvent.change(countInput, { target: { value: "2" } });

		const addButton = screen.getByRole("button", { name: /^add$/i });
		await waitFor(() => expect(addButton).toBeEnabled());
		fireEvent.click(addButton);

		expect(await screen.findByText(/already taken/i)).toBeInTheDocument();
	});

	it("edits a unit label via inline row edit", async () => {
		const unit = makeUnit({ id: "u-1", label: "Flat 1" });
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					return { units: [unit] };
				}
				if (
					path === "/api/properties/p-1/units/u-1" &&
					method === "PATCH"
				) {
					const body = JSON.parse(String(options?.body));
					expect(body).toEqual({ label: "Flat 1A" });
					return { unit: { ...unit, label: "Flat 1A" } };
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Flat 1");
		fireEvent.click(screen.getByRole("button", { name: /edit/i }));

		const input = screen.getByLabelText("New label for Flat 1");
		fireEvent.change(input, { target: { value: "" } });
		fireEvent.change(input, { target: { value: "Flat 1A" } });
		fireEvent.click(screen.getByRole("button", { name: /save/i }));

		expect(await screen.findByText("Flat 1A")).toBeInTheDocument();
	});

	it("removes a unit", async () => {
		const unit = makeUnit({ id: "u-1", label: "Flat 1" });
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					return { units: [unit] };
				}
				if (
					path === "/api/properties/p-1/units/u-1" &&
					method === "DELETE"
				) {
					return { unit };
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Flat 1");
		fireEvent.click(screen.getByRole("button", { name: /remove/i }));

		await waitFor(() =>
			expect(screen.queryByText("Flat 1")).not.toBeInTheDocument(),
		);
	});

	it("keeps the row when removal fails", async () => {
		const unit = makeUnit({ id: "u-1", label: "Flat 1" });
		vi.mocked(apiFetch).mockImplementation(
			async (path: string, options?: RequestInit) => {
				const method = options?.method ?? "GET";
				if (path === "/api/properties/p-1/units" && method === "GET") {
					return { units: [unit] };
				}
				if (
					path === "/api/properties/p-1/units/u-1" &&
					method === "DELETE"
				) {
					throw new ApiError("unit_in_use", 409, "in use");
				}
				throw new Error(`unexpected call: ${path} ${method}`);
			},
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		await screen.findByText("Flat 1");
		fireEvent.click(screen.getByRole("button", { name: /remove/i }));

		await waitFor(() =>
			expect(apiFetch).toHaveBeenCalledWith(
				"/api/properties/p-1/units/u-1",
				{ method: "DELETE" },
			),
		);
		expect(screen.getByText("Flat 1")).toBeInTheDocument();
	});

	it("calls onContinue when units exist", async () => {
		const onContinue = vi.fn();
		vi.mocked(apiFetch).mockResolvedValue({
			units: [makeUnit({ id: "u-1", label: "Flat 1" })],
		});

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={onContinue}
			/>,
		);

		const continueButton = await screen.findByRole("button", {
			name: /continue/i,
		});
		await waitFor(() => expect(continueButton).toBeEnabled());
		fireEvent.click(continueButton);

		expect(onContinue).toHaveBeenCalled();
	});

	it("shows the capacity note and hides the entry form at 20 units", async () => {
		const units = Array.from({ length: 20 }, (_, i) =>
			makeUnit({ id: `u-${i}`, label: `Flat ${i + 1}` }),
		);
		vi.mocked(apiFetch).mockResolvedValue({ units });

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId="p-1"
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		expect(
			await screen.findByText(/reached its 20-unit limit/i),
		).toBeInTheDocument();
		expect(screen.queryByLabelText(/unit label/i)).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
	});

	it("resolves the property id from the community when null, then fetches its units", async () => {
		const onPropertyResolved = vi.fn();
		vi.mocked(apiFetch).mockImplementation(async (path: string) => {
			if (path === "/api/communities/c-1") {
				return {
					community_id: "c-1",
					name: "Harmony Estate",
					status: "draft",
					default_property_id: "p-9",
				};
			}
			if (path === "/api/properties/p-9/units") {
				return { units: [] };
			}
			throw new Error(`unexpected call: ${path}`);
		});

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId={null}
				onPropertyResolved={onPropertyResolved}
				onContinue={vi.fn()}
			/>,
		);

		await waitFor(() =>
			expect(onPropertyResolved).toHaveBeenCalledWith("p-9"),
		);
		expect(apiFetch).toHaveBeenCalledWith("/api/properties/p-9/units");
		await screen.findByText("Units (0)");
	});

	it("shows a Start over button when the community is not found", async () => {
		vi.mocked(apiFetch).mockRejectedValue(
			new ApiError("not_found", 404, "not found"),
		);

		render(
			<CommunityUnitsStep
				communityId="c-1"
				defaultPropertyId={null}
				onPropertyResolved={vi.fn()}
				onContinue={vi.fn()}
			/>,
		);

		expect(
			await screen.findByRole("button", { name: /start over/i }),
		).toBeInTheDocument();
	});
});
