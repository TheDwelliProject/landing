import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { setAuthCookies, type TokenPair } from "@/lib/auth/cookies";
import {
  jsendError,
  jsendSuccess,
  mapBackendError,
  zodErrorToMessage,
} from "@/lib/auth/route-utils";
import { verifyBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

type VerifyResponse = TokenPair & { user_id: string };

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsendError("invalid_body", 400, "Malformed JSON");
  }

  const parsed = verifyBodySchema.safeParse(raw);
  if (!parsed.success) {
    return jsendError(
      "validation_failed",
      400,
      zodErrorToMessage(parsed.error),
    );
  }

  try {
    const data = await callBackend<VerifyResponse>("/v1/auth/verify", {
      method: "POST",
      body: parsed.data,
    });

    const response = jsendSuccess({ user_id: data.user_id });
    setAuthCookies(response, data);
    return response;
  } catch (err) {
    return mapBackendError(err);
  }
}
