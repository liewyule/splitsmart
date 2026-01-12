"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import { apiFetch } from "../../lib/api";
import { useRequireUser } from "../../lib/auth";

interface Trip {
  id: string;
  name: string;
  createdAt: string;
}

export default function TripsPage() {
  const username = useRequireUser();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    apiFetch<Trip[]>("/trips", { username })
      .then(setTrips)
      .catch(() => setError("Unable to load trips."));
  }, [username]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Trip name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const trip = await apiFetch<Trip>("/trips", {
        method: "POST",
        username,
        body: JSON.stringify({ name: trimmed }),
      });
      setTrips((prev) => [trip, ...prev]);
      setName("");
    } catch (err) {
      setError("Unable to create trip.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Trips"
        backHref="/login"
        rightSlot={
          <Link href="/login" className="text-xs text-slate-500">
            Switch
          </Link>
        }
      />
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">New trip</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Paris girls weekend"
              className="w-full rounded-2xl border border-mist px-4 py-3 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink text-white py-3 text-sm font-semibold"
          >
            {loading ? "Creating..." : "Create trip"}
          </button>
        </form>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              My trips
            </h2>
            <span className="text-xs text-slate-400">{trips.length} total</span>
          </div>

          {trips.length === 0 ? (
            <div className="rounded-2xl border border-mist p-6 text-sm text-slate-500 bg-cloud">
              No trips yet. Create one to start splitting travel expenses.
            </div>
          ) : (
            <div className="space-y-3">
              {trips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block rounded-2xl border border-mist p-4 shadow-card hover:shadow-none transition"
                >
                  <div className="text-base font-semibold">{trip.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Created {new Date(trip.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
