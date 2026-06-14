import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "World Cup Family Sweep 2026",
  description:
    "Private family sweep draw for FIFA World Cup 2026. Spin the slot machine to claim your team!",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "World Cup Family Sweep 2026",
    description: "Who will you get in the family sweep?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bebas.variable} ${inter.variable} wc-gradient-bg antialiased`}
      >
        <Header />
        <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
      </body>
    </html>
  );
}
