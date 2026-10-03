import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { headlineFont, bodyFont } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Political Poster Maker",
  description: "Generate print-ready Bangla political posters",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${headlineFont.variable} ${bodyFont.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}