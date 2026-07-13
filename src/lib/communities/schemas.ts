import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";

const DEFAULT_PHONE_COUNTRY = "NG";
const INVALID_PHONE_MESSAGE = "Please enter a valid mobile number";

function normalizeContactPhone(value: string, ctx: z.RefinementCtx): string {
	const phone = parsePhoneNumberFromString(value, DEFAULT_PHONE_COUNTRY);
	if (!phone?.isValid()) {
		ctx.addIssue({
			code: "custom",
			message: INVALID_PHONE_MESSAGE,
		});
		return z.NEVER;
	}
	return phone.number;
}

export const createCommunityBodySchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Please enter a community name")
		.max(255, "That name looks a little long"), // backend varchar(255)
	contact_email: z
		.string()
		.trim()
		.email("Please enter a valid email address")
		.max(254, "That email looks a little long"),
	contact_phone: z.string().trim().transform(normalizeContactPhone),
});
export type CreateCommunityBody = z.infer<typeof createCommunityBodySchema>;
