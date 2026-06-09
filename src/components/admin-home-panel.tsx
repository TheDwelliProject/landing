"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/lib/auth/context";

export function AdminHomePanel() {
  const router = useRouter();
  const auth = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (auth.status === "unknown") {
    return (
      <p className="mt-8 text-[14px] text-white/45 font-mono uppercase tracking-[0.16em]">
        Loading…
      </p>
    );
  }

  if (auth.status === "unauthenticated") {
    return null;
  }

  async function handleSignOut() {
    setSigningOut(true);
    await auth.signOut();
    router.replace("/auth");
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/12 bg-white/5 p-5">
      <p className="font-mono uppercase tracking-[0.16em] text-[10px] text-white/45 mb-2">
        Signed in as
      </p>
      <p className="text-[15px] text-white/90 break-all">{auth.userID}</p>
      {auth.superadmin && (
        <p className="mt-2 text-[12px] text-orange font-mono uppercase tracking-[0.16em]">
          Superadmin
        </p>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-full text-[14px] font-semibold transition-colors bg-white/10 text-white hover:bg-white/15 disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
