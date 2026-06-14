/**
 * Private invite links for each participant.
 * Share the full URL with each person — only they can draw.
 *
 * Replace YOUR_DOMAIN with your Vercel URL or localhost:3000 for dev.
 */
export const INVITE_LINKS = [
  { name: "Dado", token: "dado-k9m2p7x4" },
  { name: "Babaji", token: "babaji-h3n8q1w6" },
  { name: "Nasir", token: "nasir-r5t0y4z8" },
  { name: "Noman", token: "noman-j2c6v9b3" },
  { name: "Imi", token: "imi-f8g1l5s0" },
  { name: "Nazia", token: "nazia-a4d7e2h9" },
  { name: "Shazia", token: "shazia-u6i0o3p7" },
  { name: "Nabeel", token: "nabeel-m1n4q8t2" },
  { name: "Zach", token: "zach-w5x9y3z6" },
  { name: "Isaac", token: "isaac-b7c0d4f8" },
  { name: "Zahra", token: "zahra-g2h6j0k4" },
] as const;

export function getInvitePath(token: string) {
  return `/sweep/${token}`;
}

export function getInviteUrl(token: string, baseUrl: string) {
  return `${baseUrl.replace(/\/$/, "")}${getInvitePath(token)}`;
}
