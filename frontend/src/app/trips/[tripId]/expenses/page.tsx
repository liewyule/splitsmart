"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PageHeader from "../../../../components/PageHeader";
import TripTabs from "../../../../components/TripTabs";
import { apiFetch } from "../../../../lib/api";
import { useRequireUser } from "../../../../lib/auth";
import { formatCents } from "../../../../lib/currency";

interface Share {
  userId: string;
  username: string;
  shareCents: number;
}

interface Expense {
  id: string;
  description: string;
  amountCents: number;
  payerUsername: string;
  createdAt: string;
  shares: Share[];
}

export default function ExpensesPage() {
  const username = useRequireUser();
  const params = useParams();
  const tripId = params.tripId as string;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !tripId) return;
    apiFetch<Expense[]>(`/trips/${tripId}/expenses`, { username })
      .then(setExpenses)
      .catch(() => setError("Unable to load expenses."));
  }, [username, tripId]);

  return (
    <div className="pb-24">
      <PageHeader
        title="Expenses"
        backHref={`/trips/${tripId}`}
        rightSlot={
          <Link href={`/trips/${tripId}/add-expense`} className="text-xs text-slate-500">
            Add
          </Link>
        }
      />
      <div className="max-w-md mx-auto px-5 py-6 space-y-4">
        {error && <p className="text-sm text-rose-500">{error}</p>}

        {expenses.length === 0 ? (
          <div className="rounded-2xl border border-mist p-6 text-sm text-slate-500 bg-cloud">
            No expenses yet. Add the first one.
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="rounded-2xl border border-mist p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold">{expense.description}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(expense.createdAt).toLocaleDateString()} - Paid by {expense.payerUsername}
                    </div>
                  </div>
                  <div className="text-base font-semibold">{formatCents(expense.amountCents)}</div>
                </div>
                <div className="text-xs text-slate-500 mt-3">
                  Split with {expense.shares.map((share) => share.username).join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TripTabs tripId={tripId} />
    </div>
  );
}
