import localFont from "next/font/local";

export const headlineFont = localFont({
  src: "../../public/fonts/AnekBangla-ExtraBold.ttf",
  variable: "--font-headline",
  display: "block",
});

export const bodyFont = localFont({
  src: "../../public/fonts/HindSiliguri-Medium.ttf",
  variable: "--font-body",
  display: "swap",
});