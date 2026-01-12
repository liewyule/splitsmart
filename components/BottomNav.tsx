"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Home, List, Repeat } from "lucide-react";

const items = [
  { label: "Dashboard", icon: Home, href: "" },
  { label: "Expenses", icon: List, href: "/expenses" },
  { label: "Bill", icon: CreditCard, href: "/bill" },
  { label: "Settle", icon: Repeat, href: "/settle" }
];

export default function BottomNav({ code }: { code: string }) {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      <div className="mx-auto flex max-w-[420px] items-center justify-between px-6 py-3">
        {items.map((item) => {
          const href = `/trip/${code}${item.href}`;
          const active =
            item.href === ""
              ? pathname === `/trip/${code}`
              : pathname.startsWith(`/trip/${code}${item.href}`);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs ${
                active ? "text-ink" : "text-muted"
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
