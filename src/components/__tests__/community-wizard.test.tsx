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

	it("submits the exact POST body and advances on success", async () => {
		vi.mocked(apiFetch).mockResolvedValueOnce({
			community_id: "c-1",
			status: "draft",
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
		});

		expect(
			await screen.findByText(/unit setup lands here/i),
		).toBeInTheDocument();

		const unitsStep = screen.getByText("Units", { selector: "span" });
		expect(unitsStep.closest("li")).toHaveAttribute("aria-current", "step");
	});

	it("resumes mid-wizard from persisted progress", async () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({
				version: 1,
				step: 1,
				communityId: "c-9",
				basics: {
					name: "Harmony Estate",
					contact_email: "admin@example.com",
					contact_phone: "+2348012345678",
				},
			}),
		);

		render(<CommunityWizard />);

		expect(
			await screen.findByText(/unit setup lands here/i),
		).toBeInTheDocument();
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
