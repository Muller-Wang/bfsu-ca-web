import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono, Geist } from "next/font/google";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif-display",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-data",
  display: "swap",
});

export const metadata: Metadata = {
  title: "北外创客俱乐部 · BFSU Makers Club",
  description: "北京外国语大学创客俱乐部内部管理系统",
  icons: { icon: "/bfsu-badge.png", apple: "/bfsu-badge.png" },
  openGraph: {
    title: "北外创客俱乐部",
    description: "创意，在北外。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="mono" className={`${newsreader.variable} ${geist.variable} ${mono.variable}`}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
