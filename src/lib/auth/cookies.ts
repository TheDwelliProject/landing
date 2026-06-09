import "server-only";

import type { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names";

export { ACCESS_COOKIE, REFRESH_COOKIE };

const REFRESH_PATH = "/api/auth";

export type TokenPair = {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
};

function maxAgeSeconds(expiresAt: string): number {
  const expiresMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresMs)) return 0;
  const seconds = Math.floor((expiresMs - Date.now()) / 1000);
  return seconds > 0 ? seconds : 0;
}

export function setAuthCookies(res: NextResponse, pair: TokenPair): void {
  res.cookies.set({
    name: ACCESS_COOKIE,
    value: pair.access_token,
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds(pair.access_token_expires_at),
  });

  res.cookies.set({
    name: REFRESH_COOKIE,
    value: pair.refresh_token,
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "strict",
    path: REFRESH_PATH,
    maxAge: maxAgeSeconds(pair.refresh_token_expires_at),
  });
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set({
    name: ACCESS_COOKIE,
    value: "",
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  res.cookies.set({
    name: REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    secure: env.AUTH_COOKIE_SECURE,
    sameSite: "strict",
    path: REFRESH_PATH,
    maxAge: 0,
  });
}
