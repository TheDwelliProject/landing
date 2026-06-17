"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { apiFetch, ApiError } from "@/lib/api";

type MeResponse = { user_id: string; superadmin: boolean; name: string | null };

export type AuthState =
	| { status: "unknown" }
	| { status: "unauthenticated" }
	| { status: "error"; message: string }
	| {
			status: "authenticated";
			userID: string;
			superadmin: boolean;
			name: string | null;
	  };

export type AuthContextValue = AuthState & {
	refresh: () => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>({ status: "unknown" });
	const initialized = useRef(false);

	const refresh = useCallback(async () => {
		try {
			const me = await apiFetch<MeResponse>("/api/auth/me", {
				method: "GET",
				skipRefresh: true,
			});
			setState({
				status: "authenticated",
				userID: me.user_id,
				superadmin: me.superadmin,
				name: me.name,
			});
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				setState({ status: "unauthenticated" });
				return;
			}
			// Infrastructure failures — a network blip, a 503 from the
			// jwt-verifier-unavailable path, any 5xx — must NOT masquerade as a
			// signed-out session. Leave a resolved session intact; otherwise surface
			// the failure so protected UI does not sit in the initial loading state.
			setState((prev) =>
				prev.status === "authenticated"
					? prev
					: {
							status: "error",
							message:
								"Authentication is temporarily unavailable. Please try again.",
						},
			);
		}
	}, []);

	const signOut = useCallback(async () => {
		try {
			await apiFetch("/api/auth/logout", {
				method: "POST",
				skipRefresh: true,
			});
		} catch {
			// Logout is best-effort client-side too: server clears cookies either way.
		}
		setState({ status: "unauthenticated" });
	}, []);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;
		void refresh();
	}, [refresh]);

	const value = useMemo<AuthContextValue>(
		() => ({ ...state, refresh, signOut }),
		[state, refresh, signOut],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within an <AuthProvider>");
	}
	return ctx;
}
