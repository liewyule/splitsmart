"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TripTabsProps {
  tripId: string;
}

export default function TripTabs({ tripId }: TripTabsProps) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  const tabs = [
    { label: "Trip", href: base },
    { label: "Expenses", href: `${base}/expenses` },
    { label: "Summary", href: `${base}/summary` },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-mist">
      <div className="max-w-md mx-auto px-5 py-3 flex justify-between gap-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 text-center text-sm font-medium px-3 py-2 rounded-full border ${
                isActive
                  ? "bg-ink text-white border-ink"
                  : "border-mist text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
