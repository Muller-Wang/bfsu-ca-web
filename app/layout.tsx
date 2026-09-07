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
  title: "北外创客俱乐部 · BFSU Makers Club",
  description: "北京外国语大学创客俱乐部内部管理系统",
  icons: { icon: "/club-logo.png", apple: "/club-logo.png" },
  openGraph: {
    title: "北外创客俱乐部",
    description: "创意，在北外。",
    type: "website",
    locale: "zh_CN",
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
