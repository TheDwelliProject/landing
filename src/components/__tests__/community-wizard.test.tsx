import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommunityWizard } from "@/components/community-wizard";
import { ApiError, apiFetch } from "@/lib/api";
import { WIZARD_PROGRESS_KEY } from "@/lib/wizard/storage";

vi.mock("@/lib/api", async () => {
	const actual =
		await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
	return { ...actual, apiFetch: vi.fn() };
});

describe("CommunityWizard", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.mocked(apiFetch).mockReset();
	});

	it("disables submit until name, email, and phone are all valid", async () => {
		render(<CommunityWizard />);

		const submit = await screen.findByRole("button", {
			name: /continue/i,
		});
		expect(submit).toBeDisabled();

		fireEvent.change(screen.getByLabelText(/community name/i), {
			target: { value: "Harmony Estate" },
		});
		expect(submit).toBeDisabled();

		fireEvent.change(screen.getByLabelText(/contact email/i), {
			target: { value: "admin@example.com" },
		});
		expect(submit).toBeDisabled();

		fireEvent.change(screen.getByLabelText(/contact phone/i), {
			target: { value: "+2348012345678" },
		});

		await waitFor(() => expect(submit).toBeEnabled());
	});

	it("submits the exact POST body and advances to the Units step on success", async () => {
		vi.mocked(apiFetch).mockImplementation(async (path: string) => {
			if (path === "/api/communities") {
				return {
					community_id: "c-1",
					status: "draft",
					default_property_id: "p-1",
				};
			}
			if (path === "/api/properties/p-1/units") {
				return { units: [] };
			}
			throw new Error(`unexpected call: ${path}`);
		});
		render(<CommunityWizard />);

		fireEvent.change(await screen.findByLabelText(/community name/i), {
			target: { value: "Harmony Estate" },
		});
		fireEvent.change(screen.getByLabelText(/contact email/i), {
			target: { value: "admin@example.com" },
		});
		fireEvent.change(screen.getByLabelText(/contact phone/i), {
			target: { value: "+2348012345678" },
		});

		const submit = screen.getByRole("button", { name: /continue/i });
		await waitFor(() => expect(submit).toBeEnabled());
		fireEvent.click(submit);

		await waitFor(() =>
			expect(apiFetch).toHaveBeenCalledWith("/api/communities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Harmony Estate",
					contact_email: "admin@example.com",
					contact_phone: "+2348012345678",
				}),
			}),
		);

		await waitFor(() => {
			const raw = localStorage.getItem(WIZARD_PROGRESS_KEY);
			expect(raw).not.toBeNull();
			const parsed = JSON.parse(raw ?? "{}");
			expect(parsed.step).toBe(1);
			expect(parsed.communityId).toBe("c-1");
			expect(parsed.defaultPropertyId).toBe("p-1");
		});

		expect(await screen.findByText("Units (0)")).toBeInTheDocument();
		expect(
			screen.getByText(/No units yet — add your first one above\./),
		).toBeInTheDocument();

		const unitsStep = screen.getByText("Units", { selector: "span" });
		expect(unitsStep.closest("li")).toHaveAttribute("aria-current", "step");
	});

	it("resumes mid-wizard from persisted progress and loads the Units step", async () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({
				version: 1,
				step: 1,
				communityId: "c-9",
				defaultPropertyId: "p-9",
				basics: {
					name: "Harmony Estate",
					contact_email: "admin@example.com",
					contact_phone: "+2348012345678",
				},
			}),
		);
		vi.mocked(apiFetch).mockImplementation(async (path: string) => {
			if (path === "/api/properties/p-9/units") {
				return { units: [] };
			}
			throw new Error(`unexpected call: ${path}`);
		});

		render(<CommunityWizard />);

		expect(await screen.findByText("Units (0)")).toBeInTheDocument();
		expect(apiFetch).toHaveBeenCalledWith("/api/properties/p-9/units");
	});

	it("resolves a missing propertyId on resume and persists it", async () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({
				version: 1,
				step: 1,
				communityId: "c-9",
				defaultPropertyId: null,
				basics: {
					name: "Harmony Estate",
					contact_email: "admin@example.com",
					contact_phone: "+2348012345678",
				},
			}),
		);
		vi.mocked(apiFetch).mockImplementation(async (path: string) => {
			if (path === "/api/communities/c-9") {
				return {
					community_id: "c-9",
					name: "Harmony Estate",
					status: "draft",
					default_property_id: "p-42",
				};
			}
			if (path === "/api/properties/p-42/units") {
				return { units: [] };
			}
			throw new Error(`unexpected call: ${path}`);
		});

		render(<CommunityWizard />);

		await waitFor(() =>
			expect(apiFetch).toHaveBeenCalledWith("/api/communities/c-9"),
		);
		await screen.findByText("Units (0)");

		await waitFor(() => {
			const raw = localStorage.getItem(WIZARD_PROGRESS_KEY);
			const parsed = JSON.parse(raw ?? "{}");
			expect(parsed.defaultPropertyId).toBe("p-42");
		});
	});

	it("renders the Ownership placeholder at step 2", async () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({
				version: 1,
				step: 2,
				communityId: "c-9",
				defaultPropertyId: "p-9",
				basics: {
					name: "Harmony Estate",
					contact_email: "admin@example.com",
					contact_phone: "+2348012345678",
				},
			}),
		);

		render(<CommunityWizard />);

		expect(
			await screen.findByText(/ownership setup lands here/i),
		).toBeInTheDocument();
	});

	it("clamps back to step 0 when step is past Basics without a communityId", async () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({
				version: 1,
				step: 1,
				communityId: null,
				defaultPropertyId: null,
				basics: null,
			}),
		);

		render(<CommunityWizard />);

		expect(
			await screen.findByLabelText(/community name/i),
		).toBeInTheDocument();
	});

	it("advances to Ownership when Continue is clicked from the Units step", async () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({
				version: 1,
				step: 1,
				communityId: "c-9",
				defaultPropertyId: "p-9",
				basics: {
					name: "Harmony Estate",
					contact_email: "admin@example.com",
					contact_phone: "+2348012345678",
				},
			}),
		);
		vi.mocked(apiFetch).mockImplementation(async (path: string) => {
			if (path === "/api/properties/p-9/units") {
				return {
					units: [
						{
							id: "u-1",
							community_id: "c-9",
							property_id: "p-9",
							label: "Flat 1",
							created_at: "2026-01-01T00:00:00.000Z",
							updated_at: "2026-01-01T00:00:00.000Z",
						},
					],
				};
			}
			throw new Error(`unexpected call: ${path}`);
		});

		render(<CommunityWizard />);

		const continueButton = await screen.findByRole("button", {
			name: /continue/i,
		});
		await waitFor(() => expect(continueButton).toBeEnabled());
		fireEvent.click(continueButton);

		expect(
			await screen.findByText(/ownership setup lands here/i),
		).toBeInTheDocument();

		await waitFor(() => {
			const raw = localStorage.getItem(WIZARD_PROGRESS_KEY);
			const parsed = JSON.parse(raw ?? "{}");
			expect(parsed.step).toBe(2);
		});
	});

	it("shows an inline error on the name field when submission fails", async () => {
		vi.mocked(apiFetch).mockRejectedValueOnce(
			new ApiError("validation_failed", 400, "name is required"),
		);
		render(<CommunityWizard />);

		fireEvent.change(await screen.findByLabelText(/community name/i), {
			target: { value: "Harmony Estate" },
		});
		fireEvent.change(screen.getByLabelText(/contact email/i), {
			target: { value: "admin@example.com" },
		});
		fireEvent.change(screen.getByLabelText(/contact phone/i), {
			target: { value: "+2348012345678" },
		});

		const submit = screen.getByRole("button", { name: /continue/i });
		await waitFor(() => expect(submit).toBeEnabled());
		fireEvent.click(submit);

		expect(
			await screen.findByText(/name is required/i),
		).toBeInTheDocument();
	});
});
