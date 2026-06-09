import { AuthProvider } from "@/lib/auth/context";

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
