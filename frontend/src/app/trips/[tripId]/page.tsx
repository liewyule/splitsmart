"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "../../../components/PageHeader";
import TripTabs from "../../../components/TripTabs";
import { apiFetch } from "../../../lib/api";
import { useRequireUser } from "../../../lib/auth";
import { formatCents } from "../../../lib/currency";

interface Participant {
  userId: string;
  username: string;
}

interface Trip {
  id: string;
  name: string;
  participants: Participant[];
}

interface Summary {
  totalSpendCents: number;
}

export default function TripHomePage() {
  const username = useRequireUser();
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !tripId) return;
    Promise.all([
      apiFetch<Trip>(`/trips/${tripId}`, { username }),
      apiFetch<Summary>(`/trips/${tripId}/summary`, { username }),
    ])
      .then(([tripData, summaryData]) => {
        setTrip(tripData);
        setSummary(summaryData);
      })
      .catch(() => setError("Unable to load trip."));
  }, [username, tripId]);

  return (
    <div className="pb-24">
      <PageHeader title={trip?.name || "Trip"} backHref="/trips" />
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="rounded-2xl border border-mist p-5 shadow-card bg-white">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Total spend
          </div>
          <div className="text-3xl font-semibold mt-2">
            {summary ? formatCents(summary.totalSpendCents) : "--"}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {trip ? `${trip.participants.length} participants` : "Loading..."}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`/trips/${tripId}/participants`}
            className="rounded-2xl border border-mist p-4 text-sm font-medium"
          >
            Manage participants
          </Link>
          <Link
            href={`/trips/${tripId}/add-expense`}
            className="rounded-2xl border border-mist p-4 text-sm font-medium"
          >
            Add expense
          </Link>
          <Link
            href={`/trips/${tripId}/expenses`}
            className="rounded-2xl border border-mist p-4 text-sm font-medium"
          >
            View expenses
          </Link>
          <Link
            href={`/trips/${tripId}/summary`}
            className="rounded-2xl border border-mist p-4 text-sm font-medium"
          >
            View summary
          </Link>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            People
          </div>
          <div className="space-y-2">
            {trip?.participants.map((participant) => (
              <div
                key={participant.userId}
                className="rounded-2xl border border-mist px-4 py-3 text-sm"
              >
                {participant.username}
              </div>
            ))}
            {!trip && (
              <div className="rounded-2xl border border-mist px-4 py-3 text-sm text-slate-500">
                Loading participants...
              </div>
            )}
          </div>
        </div>
      </div>
      <TripTabs tripId={tripId} />
    </div>
  );
}
