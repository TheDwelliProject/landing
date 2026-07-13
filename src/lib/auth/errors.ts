import { toast } from "sonner";
import type {
	FieldValues,
	Path,
	UseFormSetError,
	UseFormSetValue,
} from "react-hook-form";

import { ApiError, NetworkError } from "@/lib/api";
import type { SessionReason } from "@/lib/auth/session-reason";

export type { SessionReason };

export type ErrorBehavior =
	| { kind: "inline"; field: string; message: string }
	| { kind: "toast"; message: string }
	| { kind: "force-logout"; reason?: SessionReason };

const MSG_INTERNAL = "Something went wrong on our end. Please try again.";
const MSG_NETWORK = "Connection trouble. Check your network and try again.";
const MSG_RATE =
	"Too many codes requested. Please wait a few minutes and try again.";
const MSG_INVALID_PHONE = "Please enter a valid mobile number";
const MSG_INVALID_OTP =
	"Code incorrect or expired. Try again or request a new code.";
const MSG_UNIT_LABEL_TAKEN_FALLBACK = "That label is already taken";
const MSG_COMMUNITY_NOT_MUTABLE = "This community can't be changed right now.";
const MSG_UNIT_IN_USE = "This unit is in use and can't be removed.";

/** Maps a thrown error to a UI behavior, per spec §Error mapping reference. */
export function mapError(
	err: unknown,
	fieldMap: Partial<Record<string, string>> = {},
): ErrorBehavior {
	if (err instanceof NetworkError) {
		return { kind: "toast", message: MSG_NETWORK };
	}
	if (!(err instanceof ApiError)) {
		return { kind: "toast", message: MSG_INTERNAL };
	}
	const mappedField = fieldMap[err.code];
	switch (err.code) {
		case "invalid_phone":
			return inlineOrToast(fieldMap["invalid_phone"], MSG_INVALID_PHONE);
		case "invalid_otp":
			return inlineOrToast(fieldMap["invalid_otp"], MSG_INVALID_OTP);
		case "unit_label_taken":
			return inlineOrToast(
				fieldMap["unit_label_taken"],
				unitLabelTakenMessage(err.data),
			);
		case "community_not_mutable":
			return { kind: "toast", message: MSG_COMMUNITY_NOT_MUTABLE };
		case "unit_has_active_tenancy":
		case "unit_in_use":
			return { kind: "toast", message: MSG_UNIT_IN_USE };
		case "validation_failed": {
			const firstField = Object.values(fieldMap).find(Boolean);
			const msg = err.message || "Please check your input.";
			return inlineOrToast(firstField, msg);
		}
		case "rate_limited":
			return {
				kind: "toast",
				message: rateLimitMessage(err.retryAfterSeconds),
			};
		case "invalid_refresh_token":
		case "unauthorized":
			return { kind: "force-logout" };
		case "refresh_token_reuse":
			return { kind: "force-logout", reason: "session-compromised" };
		case "refresh_token_expired":
			return { kind: "force-logout", reason: "session-expired" };
		default:
			if (mappedField) {
				return inlineOrToast(
					mappedField,
					err.message || "Please check your input.",
				);
			}
			return { kind: "toast", message: MSG_INTERNAL };
	}
}

function rateLimitMessage(retryAfterSeconds: number | undefined): string {
	if (!retryAfterSeconds) return MSG_RATE;
	if (retryAfterSeconds < 60) {
		return `Too many requests. Try again in ${retryAfterSeconds} seconds.`;
	}
	const minutes = Math.ceil(retryAfterSeconds / 60);
	return `Too many requests. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/** Narrows the backend's `{label: string}` conflict payload, if present. */
function unitLabelTakenMessage(data: unknown): string {
	if (typeof data !== "object" || data === null) {
		return MSG_UNIT_LABEL_TAKEN_FALLBACK;
	}
	const label = (data as { label?: unknown }).label;
	return typeof label === "string"
		? `"${label}" is already taken`
		: MSG_UNIT_LABEL_TAKEN_FALLBACK;
}

function inlineOrToast(
	field: string | undefined,
	message: string,
): ErrorBehavior {
	return field
		? { kind: "inline", field, message }
		: { kind: "toast", message };
}

export type ApplyErrorOptions<T extends FieldValues> = {
	setError: UseFormSetError<T>;
	/** Maps backend code -> form field name. */
	fieldMap?: Partial<Record<string, Path<T>>>;
	/** Optional: clears these fields after an inline error fires (e.g. clear OTP on bad code). */
	clear?: { setValue: UseFormSetValue<T>; fields: Path<T>[] };
};

/** Applies a thrown error to a react-hook-form / sonner / navigation as appropriate. */
export function applyError<T extends FieldValues>(
	err: unknown,
	{ setError, fieldMap, clear }: ApplyErrorOptions<T>,
): ErrorBehavior {
	const behavior = mapError(err, fieldMap as Partial<Record<string, string>>);
	switch (behavior.kind) {
		case "inline":
			setError(behavior.field as Path<T>, { message: behavior.message });
			if (clear) {
				for (const field of clear.fields) {
					clear.setValue(field, "" as T[Path<T>]);
				}
			}
			break;
		case "toast":
			toast.error(behavior.message);
			break;
		case "force-logout":
			forceLogout(behavior.reason);
			break;
	}
	return behavior;
}

/**
 * Hard-navigate to /auth, preserving the user's current path as returnTo and
 * surfacing the reason (so the auth page can show the right Alert).
 */
export function forceLogout(reason?: SessionReason): void {
	if (typeof window === "undefined") return;
	const here = window.location.pathname + window.location.search;
	const params = new URLSearchParams();
	if (reason) params.set("reason", reason);
	if (here && !here.startsWith("/auth")) {
		params.set("returnTo", here);
	}
	const qs = params.toString();
	window.location.assign(qs ? `/auth?${qs}` : "/auth");
}
