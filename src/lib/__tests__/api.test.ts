import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/api";

const assignMock = vi.fn();
const fetchMock = vi.fn();

function jsonRes(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

beforeEach(() => {
	fetchMock.mockReset();
	assignMock.mockReset();
	vi.stubGlobal("fetch", fetchMock);
	Object.defineProperty(window, "location", {
		configurable: true,
		value: { pathname: "/communities", search: "", assign: assignMock },
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("apiFetch", () => {
	it("returns the JSend data on success without refreshing", async () => {
		fetchMock.mockResolvedValueOnce(
			jsonRes(200, { status: "success", data: { hi: 1 } }),
		);

		await expect(apiFetch("/api/me")).resolves.toEqual({ hi: 1 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("turns response body read failures into NetworkError", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			status: 200,
			text: vi.fn().mockRejectedValue(new Error("body timed out")),
		});

		await expect(apiFetch("/api/me")).rejects.toMatchObject({
			name: "NetworkError",
		});
	});

	it("refreshes once on a 401 then replays the original request", async () => {
		fetchMock
			.mockResolvedValueOnce(
				jsonRes(401, {
					status: "error",
					code: "unauthorized",
					message: "no",
				}),
			)
			.mockResolvedValueOnce(
				jsonRes(200, { status: "success", data: { ok: true } }),
			)
			.mockResolvedValueOnce(
				jsonRes(200, { status: "success", data: { hi: 2 } }),
			);

		await expect(apiFetch("/api/me")).resolves.toEqual({ hi: 2 });
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/refresh");
	});

	it("refreshes on a 401 even when the backend uses a non-unauthorized code", async () => {
		fetchMock
			.mockResolvedValueOnce(
				jsonRes(401, {
					status: "error",
					code: "token_expired",
					message: "x",
				}),
			)
			.mockResolvedValueOnce(
				jsonRes(200, { status: "success", data: { ok: true } }),
			)
			.mockResolvedValueOnce(
				jsonRes(200, { status: "success", data: "done" }),
			);

		await expect(apiFetch("/api/me")).resolves.toBe("done");
		expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/refresh");
	});

	it("treats a 2xx refresh carrying an error envelope as failure: no replay, redirect to /auth", async () => {
		fetchMock
			.mockResolvedValueOnce(
				jsonRes(401, {
					status: "error",
					code: "unauthorized",
					message: "x",
				}),
			)
			.mockResolvedValueOnce(
				jsonRes(200, {
					status: "error",
					code: "refresh_token_expired",
					message: "x",
				}),
			);

		await expect(apiFetch("/api/me")).rejects.toMatchObject({
			name: "ApiError",
			status: 401,
		});
		// No third call — the bogus 2xx-with-error refresh must not trigger a replay.
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(assignMock).toHaveBeenCalledWith(
			"/auth?reason=session-expired&returnTo=%2Fcommunities",
		);
	});

	it("does not refresh when skipRefresh is set", async () => {
		fetchMock.mockResolvedValueOnce(
			jsonRes(401, {
				status: "error",
				code: "unauthorized",
				message: "x",
			}),
		);

		await expect(
			apiFetch("/api/auth/me", { skipRefresh: true }),
		).rejects.toBeInstanceOf(ApiError);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
