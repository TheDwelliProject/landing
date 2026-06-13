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
			setState({ status: "unauthenticated" });
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
