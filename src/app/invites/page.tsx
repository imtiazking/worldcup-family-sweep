import { INVITE_LINKS, getInviteUrl } from "@/lib/invites";

type PageProps = {
  searchParams: Promise<{ key?: string }>;
};

export const metadata = {
  title: "Invite Links — World Cup Sweep",
  robots: { index: false, follow: false },
};

export default async function InvitesPage({ searchParams }: PageProps) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey || key !== adminKey) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-4 font-[family-name:var(--font-bebas)] text-3xl text-wc-gold">
          Access Denied
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Add ADMIN_SECRET_KEY to your environment and visit{" "}
          <code className="text-wc-gold">/invites?key=YOUR_KEY</code>
        </p>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-wc-gold">
        Private Invite Links
      </h1>
      <p className="mt-2 text-sm text-white/60">
        Share each link privately with the named participant only.
      </p>

      <ul className="mt-8 space-y-3">
        {INVITE_LINKS.map(({ name, token }) => (
          <li key={token} className="wc-card rounded-xl p-4">
            <p className="font-[family-name:var(--font-bebas)] text-xl text-wc-gold">
              {name}
            </p>
            <a
              href={getInviteUrl(token, baseUrl)}
              className="mt-1 block break-all text-sm text-white/70 underline hover:text-wc-gold"
            >
              {getInviteUrl(token, baseUrl)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
