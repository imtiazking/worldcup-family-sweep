import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Design lab routes use a full-viewport shell; children cover the site chrome. */
export default function DesignLabLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
