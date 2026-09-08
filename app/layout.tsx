import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const newsreader = localFont({
  src: [
    { path: "./fonts/newsreader-latin.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/newsreader-latin-italic.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-serif-display",
  display: "swap",
});

const geist = localFont({
  src: "./fonts/geist-latin.woff2",
  weight: "400 600",
  variable: "--font-sans-body",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "400 500",
  variable: "--font-mono-data",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "https://39.105.122.95"),
  title: "北外创客俱乐部 · BFSU Makers Club",
  description: "创意，在北外。",
  icons: { icon: "/club-logo.png", apple: "/club-logo.png" },
  openGraph: {
    title: "北外创客俱乐部 · BFSU Makers Club",
    description: "创意，在北外。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: "/share-logo.jpg", width: 200, height: 200, type: "image/jpeg", alt: "北外创客俱乐部 LOGO" }],
  },
  twitter: {
    card: "summary",
    title: "北外创客俱乐部 · BFSU Makers Club",
    description: "创意，在北外。",
    images: ["/share-logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="bauhaus" className={`${newsreader.variable} ${geist.variable} ${mono.variable}`}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
