"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type TripCard = {
  id: string;
  name: string;
  code: string;
  members: string[];
};

export default function TripsClient({ trips }: { trips: TripCard[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((trip) =>
      [trip.name, trip.code].some((value) => value.toLowerCase().includes(q))
    );
  }, [query, trips]);

  return (
    <div className="mt-4 space-y-4">
      <label className="block">
        <span className="sr-only">Search trips</span>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by trip name or code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </label>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <Link key={trip.id} href={`/trip/${trip.code}`} className="card block p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold">{trip.name}</p>
                  <p className="mt-1 text-xs text-muted">Code {trip.code}</p>
                </div>
                <span className="rounded-full bg-accentSoft px-3 py-1 text-xs text-ink">
                  {trip.members.length} members
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.members.slice(0, 4).map((member) => (
                  <span
                    key={`${trip.id}-${member}`}
                    className="rounded-full border border-border/60 bg-white px-3 py-1 text-xs text-muted"
                  >
                    {member}
                  </span>
                ))}
                {trip.members.length > 4 ? (
                  <span className="text-xs text-muted">+{trip.members.length - 4} more</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-6 text-sm text-muted">No trips match your search.</div>
      )}
    </div>
  );
}
