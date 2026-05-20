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
  title: "创协 BFSU · Creative Association",
  description: "北京外国语大学创协内部管理系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${newsreader.variable} ${geist.variable} ${mono.variable}`}>
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
