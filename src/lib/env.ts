import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  DWELLI_API_URL: required("DWELLI_API_URL"),
  AUTH_COOKIE_SECURE: process.env.AUTH_COOKIE_SECURE !== "false",
};
