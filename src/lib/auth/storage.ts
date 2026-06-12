/**
 * sessionStorage keys shared across the auth flow. Centralized because each
 * key is written on one screen and read on another — a typo'd literal in one
 * file would silently break the handoff.
 */

/** Phone awaiting OTP verification. Written by the sign-in form, read by /auth/verify. */
export const PENDING_PHONE_KEY = "dwelli_pending_phone";

/** RFC 3339 timestamp for when the backend allows the next OTP resend. */
export const RESEND_AVAILABLE_AT_KEY = "dwelli_resend_available_at";

/**
 * Hands the verified phone to /onboarding/profile so its header can show
 * which account the new user just created. Read (and cleared) over there.
 */
export const PROFILE_PHONE_KEY = "dwelli_profile_phone";
