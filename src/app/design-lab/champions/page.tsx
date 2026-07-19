import type { Metadata } from "next";
import { ChampionsPage } from "@/design-lab/champions/ChampionsPage";

export const metadata: Metadata = {
  title: "Design Lab — Champions Ceremony",
  description:
    "Premium World Cup sweep champions ceremony prototype for the Family World Cup Sweep.",
  robots: { index: false, follow: false },
};

export default function ChampionsDesignLabPage() {
  return <ChampionsPage />;
}
