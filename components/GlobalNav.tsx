"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, User } from "lucide-react";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Trips", href: "/trips", icon: Map },
  { label: "Profile", href: "/profile", icon: User }
];

export default function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="mx-auto flex max-w-[420px] items-center justify-between px-4 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch
              className={`flex flex-col items-center gap-1 rounded-xl px-6 py-5 text-xs font-medium transition pressable ${
                active ? "text-accent" : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
