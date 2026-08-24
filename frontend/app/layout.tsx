import type { Metadata } from "next";
import { Archivo_Black, Barlow, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ritual Research Agent",
  description: "An autonomous research agent running on Ritual Chain's Sovereign Agent precompile.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-black text-gray-300 font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
