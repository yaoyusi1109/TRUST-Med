import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap"
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap"
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap"
});

export const metadata: Metadata = {
  title: "TRUST-Med",
  description:
    "Translational Real-world User-grounded Safety Testing for Medical AI."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${newsreader.variable} ${jetbrains.variable} font-body antialiased`}
      >
        <header className="border-b border-line bg-background">
          <nav className="mx-auto flex max-w-content items-center justify-between px-5 py-5">
            <Link href="/" className="font-display text-xl text-primary">
              TRUST-Med
            </Link>
            <div className="flex items-center gap-5 text-sm text-muted">
              <Link className="hover:text-primary" href="/evaluate">
                Evaluate
              </Link>
              <Link className="hover:text-primary" href="/leaderboard">
                Leaderboard
              </Link>
              <Link className="hover:text-primary" href="/about">
                About
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
