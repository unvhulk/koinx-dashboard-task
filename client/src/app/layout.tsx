import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "KoinX Content Dashboard",
  description: "KoinX-inspired dashboard for discovering crypto content opportunities.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/koinx-favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/koinx-favicon.svg",
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
        className={`${bodyFont.variable} ${displayFont.variable} bg-[var(--background)] font-[family-name:var(--font-body)] text-slate-100 antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(58,184,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(44,214,170,0.14),transparent_24%),linear-gradient(180deg,#08101f_0%,#0b1327_48%,#08111d_100%)]">
          <div className="pointer-events-none fixed inset-0 opacity-50">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:110px_110px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
          </div>
          <Navbar />
          <main className="relative">{children}</main>
        </div>
      </body>
    </html>
  );
}
