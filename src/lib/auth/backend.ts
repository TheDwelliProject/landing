import "server-only";

import { env } from "@/lib/env";

export type JSendSuccess<T> = { status: "success"; data: T } | T;
export type JSendError = { status: "error"; code: string; message: string };

export class BackendError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, status: number, message: string) {
    super(message);
    this.name = "BackendError";
    this.code = code;
    this.status = status;
  }
}

export class BackendNetworkError extends Error {
  constructor(cause: unknown) {
    super("Backend unreachable");
    this.name = "BackendNetworkError";
    this.cause = cause;
  }
}

type CallOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  bearer?: string;
};

export async function callBackend<T>(
  path: string,
  options: CallOptions = {},
): Promise<T> {
  const { body, bearer, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (bearer) {
    finalHeaders.set("Authorization", `Bearer ${bearer}`);
  }

  let response: Response;
  try {
    response = await fetch(`${env.DWELLI_API_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (cause) {
    throw new BackendNetworkError(cause);
  }

  const text = await response.text();
  const parsed: unknown = text ? safeJsonParse(text) : undefined;

  if (!response.ok) {
    if (isJSendError(parsed)) {
      throw new BackendError(parsed.code, response.status, parsed.message);
    }
    throw new BackendError(
      "internal_error",
      response.status,
      "Unexpected backend error",
    );
  }

  if (isJSendError(parsed)) {
    throw new BackendError(parsed.code, response.status, parsed.message);
  }

  if (isJSendSuccess(parsed)) {
    return parsed.data as T;
  }
  return parsed as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isJSendError(value: unknown): value is JSendError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    (value as { status: unknown }).status === "error" &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

function isJSendSuccess(
  value: unknown,
): value is { status: "success"; data: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    (value as { status: unknown }).status === "success" &&
    "data" in value
  );
}
