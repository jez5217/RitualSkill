import type { Metadata } from "next";
import { Archivo_Black, Barlow, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
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
  title: "Ritual Chain — Feature Playground",
  description:
    "An interactive, demo-mode tour of Ritual Chain's enshrined AI precompiles: LLM, HTTP, agents, multimodal generation, scheduling, secrets, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${barlow.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-black text-gray-300 font-body antialiased flex flex-col">
        <Providers>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
