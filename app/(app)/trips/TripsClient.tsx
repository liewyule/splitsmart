"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
          <input
            className="input"
            placeholder="Search by trip name or code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </label>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <Link
              key={trip.id}
              href={`/trip/${trip.code}`}
              prefetch
              className="card block p-5 pressable pressable-card motion-safe:transition motion-safe:duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{trip.name}</p>
                  <p className="mt-1 text-sm text-muted">Code {trip.code}</p>
                </div>
                <span className="rounded-full bg-accentSoft px-3 py-1 text-sm font-medium text-accent">
                  {trip.members.length} members
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {trip.members.slice(0, 4).map((member) => (
                  <span
                    key={`${trip.id}-${member}`}
                    className="rounded-full border border-border/70 bg-white px-3 py-1 text-sm text-muted"
                  >
                    {member}
                  </span>
                ))}
                {trip.members.length > 4 ? (
                  <span className="text-sm text-muted">+{trip.members.length - 4} more</span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">No trips match your search.</div>
      )}
    </div>
  );
}
