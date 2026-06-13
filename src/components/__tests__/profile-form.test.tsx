import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileForm } from "@/components/profile-form";
import { apiFetch } from "@/lib/api";

const { replaceMock, searchParamsMock } = vi.hoisted(() => ({
	replaceMock: vi.fn(),
	searchParamsMock: new URLSearchParams("returnTo=/communities"),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ replace: replaceMock }),
	useSearchParams: () => searchParamsMock,
}));

vi.mock("@/lib/api", () => ({
	apiFetch: vi.fn(),
}));

describe("ProfileForm", () => {
	it("requires name and email before submitting the profile", async () => {
		vi.mocked(apiFetch).mockResolvedValueOnce({});
		render(<ProfileForm />);

		const submit = screen.getByRole("button", { name: /continue/i });
		expect(submit).toBeDisabled();

		fireEvent.change(screen.getByLabelText(/full name/i), {
			target: { value: "Adaeze Okeke" },
		});
		expect(submit).toBeDisabled();

		fireEvent.change(screen.getByLabelText(/email address/i), {
			target: { value: "adaeze@example.com" },
		});

		await waitFor(() => expect(submit).toBeEnabled());
		fireEvent.click(submit);

		await waitFor(() =>
			expect(apiFetch).toHaveBeenCalledWith("/api/me", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: "Adaeze Okeke",
					email: "adaeze@example.com",
				}),
			}),
		);
		expect(replaceMock).toHaveBeenCalledWith("/communities");
	});
});
