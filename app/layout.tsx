import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PUSH – Disziplin die sichtbar wird | Warteliste",
  description:
    "PUSH – Disziplin die sichtbar wird. Sichere dir einen Platz auf der Warteliste. Invite friends, move up.",
  icons: { icon: "/penguin-icon.png" },
  openGraph: {
    title: "PUSH – Disziplin die sichtbar wird",
    description: "Warteliste. Invite friends, move up.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
