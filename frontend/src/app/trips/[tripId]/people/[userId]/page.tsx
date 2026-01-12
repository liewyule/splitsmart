"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "../../../../../components/PageHeader";
import { apiFetch } from "../../../../../lib/api";
import { useRequireUser } from "../../../../../lib/auth";
import { formatCents } from "../../../../../lib/currency";

interface LineItem {
  expenseId: string;
  description: string;
  amountCents: number;
  payerUsername: string;
  shareCents: number;
  createdAt: string;
}

interface SummaryPerson {
  userId: string;
  username: string;
  netCents: number;
  paidCents: number;
  owedCents: number;
}

interface SummaryResponse {
  netBalances: SummaryPerson[];
  perPersonLineItems: Array<{ userId: string; items: LineItem[] }>;
}

export default function PersonBillPage() {
  const username = useRequireUser();
  const params = useParams();
  const tripId = params.tripId as string;
  const userId = params.userId as string;
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !tripId) return;
    apiFetch<SummaryResponse>(`/trips/${tripId}/summary`, { username })
      .then(setSummary)
      .catch(() => setError("Unable to load bill details."));
  }, [username, tripId]);

  const person = summary?.netBalances.find((entry) => entry.userId === userId);
  const items = useMemo(() => {
    if (!summary) return [] as LineItem[];
    return summary.perPersonLineItems.find((entry) => entry.userId === userId)?.items || [];
  }, [summary, userId]);

  return (
    <div className="pb-16">
      <PageHeader title={person?.username || "Bill details"} backHref={`/trips/${tripId}/summary`} />
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {error && <p className="text-sm text-rose-500">{error}</p>}

        {person && (
          <div className="rounded-2xl border border-mist p-5 shadow-card">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Balance</div>
            <div className={person.netCents >= 0 ? "text-2xl font-semibold text-emerald-600" : "text-2xl font-semibold text-rose-500"}>
              {formatCents(person.netCents)}
            </div>
            <div className="text-sm text-slate-500 mt-2">
              Paid {formatCents(person.paidCents)} - Owes {formatCents(person.owedCents)}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Line items
          </div>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-mist p-5 text-sm text-slate-500 bg-cloud">
              No line items yet.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.expenseId} className="rounded-2xl border border-mist p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-semibold">{item.description}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()} - Paid by {item.payerUsername}
                      </div>
                    </div>
                    <div className="text-base font-semibold">{formatCents(item.shareCents)}</div>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Total {formatCents(item.amountCents)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
