import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// One variable family carries both body and display; its width axis is animated.
const sans = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-serif", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Tharun B.L — Frontend Developer × AI Builder",
  description:
    "Tharun B.L builds interfaces for AI products — frontend engineering, interaction and motion, from Coimbatore, India.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0A0A0B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="font-sans text-bone">{children}</body>
    </html>
  );
}
