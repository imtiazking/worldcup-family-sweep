import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">🚫</p>
      <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
        Invalid Invite Link
      </h1>
      <p className="mt-3 text-sm text-white/60">
        This link doesn&apos;t match any participant. Check your private invite
        URL and try again.
      </p>
      <Link
        href="/"
        className="wc-btn-gold mt-8 rounded-full px-8 py-3 text-sm uppercase tracking-wider"
      >
        Go Home
      </Link>
    </div>
  );
}
