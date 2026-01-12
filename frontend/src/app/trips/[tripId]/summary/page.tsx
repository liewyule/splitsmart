"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "../../../../components/PageHeader";
import TripTabs from "../../../../components/TripTabs";
import { apiFetch } from "../../../../lib/api";
import { useRequireUser } from "../../../../lib/auth";
import { formatCents } from "../../../../lib/currency";

interface NetBalance {
  userId: string;
  username: string;
  netCents: number;
  paidCents: number;
  owedCents: number;
}

interface Settlement {
  fromUserId: string;
  toUserId: string;
  amountCents: number;
}

interface Summary {
  totalSpendCents: number;
  netBalances: NetBalance[];
  settlements: Settlement[];
}

export default function SummaryPage() {
  const username = useRequireUser();
  const params = useParams();
  const tripId = params.tripId as string;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !tripId) return;
    apiFetch<Summary>(`/trips/${tripId}/summary`, { username })
      .then(setSummary)
      .catch(() => setError("Unable to load summary."));
  }, [username, tripId]);

  const nameFor = (userId: string) =>
    summary?.netBalances.find((entry) => entry.userId === userId)?.username || "";

  return (
    <div className="pb-24">
      <PageHeader title="Summary" backHref={`/trips/${tripId}`} />
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="rounded-2xl border border-mist p-5 shadow-card">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Total spend</div>
          <div className="text-2xl font-semibold mt-2">
            {summary ? formatCents(summary.totalSpendCents) : "--"}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Net balances
          </div>
          <div className="space-y-2">
            {summary?.netBalances.map((entry) => (
              <Link
                key={entry.userId}
                href={`/trips/${tripId}/people/${entry.userId}`}
                className="block rounded-2xl border border-mist px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.username}</span>
                  <span className={entry.netCents >= 0 ? "text-emerald-600" : "text-rose-500"}>
                    {formatCents(entry.netCents)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Paid {formatCents(entry.paidCents)} - Owes {formatCents(entry.owedCents)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Settlements
          </div>
          {summary?.settlements.length ? (
            <div className="space-y-2">
              {summary.settlements.map((settlement, index) => (
                <div key={index} className="rounded-2xl border border-mist px-4 py-3 text-sm">
                  <span className="font-medium">{nameFor(settlement.fromUserId)}</span> pays{" "}
                  <span className="font-medium">{nameFor(settlement.toUserId)}</span> {formatCents(settlement.amountCents)}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-mist p-4 text-sm text-slate-500 bg-cloud">
              Everyone is settled up.
            </div>
          )}
        </div>
      </div>
      <TripTabs tripId={tripId} />
    </div>
  );
}
