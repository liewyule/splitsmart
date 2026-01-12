"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Dashboard", href: "" },
  { label: "Expenses", href: "/expenses" },
  { label: "My Bill", href: "/bill" },
  { label: "Settle", href: "/settle" }
];

export default function TripTabs({ code }: { code: string }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[420px] items-center justify-between px-2 pt-4 pb-2">
        <div className="flex w-full items-center gap-2 rounded-full border border-border/70 bg-accentSoft/60 p-1">
          {tabs.map((tab) => {
            const href = `/trip/${code}${tab.href}`;
            const active = tab.href === "" ? pathname === `/trip/${code}` : pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                prefetch
                className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-medium transition pressable ${
                  active ? "bg-accent text-white shadow-soft" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
