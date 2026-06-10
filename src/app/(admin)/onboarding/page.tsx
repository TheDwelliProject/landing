import { redirect } from "next/navigation";

// /onboarding is just the door — the only V1 onboarding step is the
// profile-completion screen. Keep the returnTo hint riding along.
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  redirect(
    returnTo
      ? `/onboarding/profile?returnTo=${encodeURIComponent(returnTo)}`
      : "/onboarding/profile",
  );
}
