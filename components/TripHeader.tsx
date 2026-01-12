import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TripHeader({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <header className="flex items-center gap-3 py-4">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          prefetch
          className="rounded-xl border border-border/70 bg-white p-2 shadow-sm hover:bg-slate-50 pressable"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
