import "server-only";

function required(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required env var: ${name}`);
	}
	return value;
}

export const env = {
	get DWELLI_API_URL(): string {
		return required("DWELLI_API_URL");
	},
	get AUTH_COOKIE_SECURE(): boolean {
		return process.env.AUTH_COOKIE_SECURE !== "false";
	},
};
