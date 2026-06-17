// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BackendNetworkError, callBackend } from "@/lib/auth/backend";

vi.mock("server-only", () => ({}));

const fetchMock = vi.fn();

beforeEach(() => {
	process.env.DWELLI_API_URL = "https://api.example.test";
	fetchMock.mockReset();
	vi.stubGlobal("fetch", fetchMock);
});

describe("callBackend", () => {
	it("maps response body read failures to BackendNetworkError", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			text: vi.fn().mockRejectedValue(new Error("body timed out")),
		});

		await expect(callBackend("/v1/me")).rejects.toBeInstanceOf(
			BackendNetworkError,
		);
	});
});
