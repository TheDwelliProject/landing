import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import { mapError } from "@/lib/auth/errors";

describe("mapError", () => {
	it("maps arbitrary backend field codes when the form provides a fieldMap", () => {
		const behavior = mapError(
			new ApiError(
				"invalid_contact_phone",
				400,
				"contact phone is not a valid SMS-reachable number",
			),
			{ invalid_contact_phone: "contact_phone" },
		);

		expect(behavior).toEqual({
			kind: "inline",
			field: "contact_phone",
			message: "contact phone is not a valid SMS-reachable number",
		});
	});
});
