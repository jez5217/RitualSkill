"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoConnectWalletButton } from "@/components/demo/DemoConnectWalletButton";

const NAV = [
  { href: "/think", label: "Think" },
  { href: "/act", label: "See · Hear · Act" },
  { href: "/agents", label: "Agents" },
  { href: "/remember", label: "Remember" },
  { href: "/authenticate", label: "Authenticate" },
  { href: "/secrets", label: "Keep Secrets" },
  { href: "/wallet", label: "Wallet" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-800 bg-black/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-display text-lg text-gray-100 tracking-tight shrink-0">
            Ritual<span className="text-ritual-green">.</span>Demo
          </Link>
          <DemoConnectWalletButton />
        </div>
        <div className="relative -mx-4 sm:mx-0">
          <nav className="flex gap-1 overflow-x-auto pb-3 -mt-1 text-sm scrollbar-none px-4 sm:px-0">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap border transition-colors ${
                    active
                      ? "border-ritual-green text-ritual-green bg-ritual-green/10"
                      : "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {/* Hints that the nav scrolls horizontally — it has no other visual affordance on narrow screens. */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-black to-transparent sm:hidden" />
        </div>
      </div>
    </header>
  );
}
