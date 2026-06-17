export const ALLOWED_RETURN_PREFIXES = [
	"/communities",
	"/onboarding",
	"/wizard",
	"/r",
	"/start-here",
	"/admin",
];

const FALLBACK_RETURN_TO = "/communities";
const LOCAL_ORIGIN = "https://dwelli.local";

export function safeReturnTo(value: string | null | undefined): string {
	if (!value) return FALLBACK_RETURN_TO;

	let url: URL;
	try {
		url = new URL(value, LOCAL_ORIGIN);
	} catch {
		return FALLBACK_RETURN_TO;
	}

	if (url.origin !== LOCAL_ORIGIN) {
		return FALLBACK_RETURN_TO;
	}

	const allowed = ALLOWED_RETURN_PREFIXES.some(
		(prefix) =>
			url.pathname === prefix || url.pathname.startsWith(`${prefix}/`),
	);

	return allowed
		? `${url.pathname}${url.search}${url.hash}`
		: FALLBACK_RETURN_TO;
}
