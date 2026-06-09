import "server-only";

import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { BackendError, BackendNetworkError } from "@/lib/auth/backend";

export type JSendBody<T> =
  | { status: "success"; data: T }
  | { status: "error"; code: string; message: string };

export function jsendSuccess<T>(
  data: T,
  init?: ResponseInit,
): NextResponse<JSendBody<T>> {
  return NextResponse.json<JSendBody<T>>(
    { status: "success", data },
    init,
  );
}

export function jsendError(
  code: string,
  status: number,
  message: string,
): NextResponse<JSendBody<never>> {
  return NextResponse.json<JSendBody<never>>(
    { status: "error", code, message },
    { status },
  );
}

export function mapBackendError(err: unknown): NextResponse<JSendBody<never>> {
  if (err instanceof BackendError) {
    return jsendError(err.code, err.status, err.message);
  }
  if (err instanceof BackendNetworkError) {
    return jsendError(
      "internal_error",
      502,
      "Backend unreachable",
    );
  }
  return jsendError("internal_error", 500, "Unexpected error");
}

export function zodErrorToMessage(err: ZodError): string {
  const first = err.issues[0];
  if (!first) return "Invalid request";
  return first.message;
}
