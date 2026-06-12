"use client";

import { useEffect, useState } from "react";
import parsePhoneNumber from "libphonenumber-js/max";

import { PROFILE_PHONE_KEY } from "@/lib/auth/storage";

/**
 * The phone the user just verified, shown in the onboarding header so a
 * brand-new user can see which account they're completing. Handed over by
 * the OTP form via sessionStorage; renders nothing if it isn't there (e.g.
 * the user reopened this screen in a fresh tab).
 */
export function ProfilePhone() {
	const [phone, setPhone] = useState<string | null>(null);

	useEffect(() => {
		const stored = sessionStorage.getItem(PROFILE_PHONE_KEY);
		if (!stored) return;
		// Session storage is client-only, so this state is intentionally
		// populated after hydration rather than during render.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPhone(parsePhoneNumber(stored)?.formatInternational() ?? stored);
	}, []);

	if (!phone) return null;

	return (
		<span className="font-mono text-[11px] tracking-[0.08em] text-white/45">
			{phone}
		</span>
	);
}
