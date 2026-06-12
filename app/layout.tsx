import type { Metadata } from "next";
import { Barlow_Condensed, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-sc"
});

const barlowCondensed = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed"
});

export const metadata: Metadata = {
  title: "美加墨世界杯小程序",
  description: "世界杯头条、精彩视频、全部赛程、积分排名聚合落地页"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${notoSansSC.variable} ${barlowCondensed.variable}`}
      lang="zh-CN"
      suppressHydrationWarning
    >
      <body className={`${notoSansSC.className} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
