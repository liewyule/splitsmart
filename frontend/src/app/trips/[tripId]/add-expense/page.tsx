"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "../../../../components/PageHeader";
import { apiFetch } from "../../../../lib/api";
import { useRequireUser } from "../../../../lib/auth";
import { formatCents, parseCurrencyToCents, splitEvenly } from "../../../../lib/currency";

interface Participant {
  userId: string;
  username: string;
}

export default function AddExpensePage() {
  const username = useRequireUser();
  const router = useRouter();
  const params = useParams();
  const tripId = params.tripId as string;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerUserId, setPayerUserId] = useState("");
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    apiFetch<Participant[]>(`/trips/${tripId}/participants`, { username })
      .then((data) => {
        setParticipants(data);
        if (data.length) {
          const defaultPayer = data.find((p) => p.username === username) || data[0];
          setPayerUserId((prev) => prev || defaultPayer.userId);
          setSelectedIds((prev) => (prev.length ? prev : data.map((p) => p.userId)));
          setCustomShares((prev) => {
            if (Object.keys(prev).length) return prev;
            const initial: Record<string, string> = {};
            data.forEach((p) => {
              initial[p.userId] = "";
            });
            return initial;
          });
        }
      })
      .catch(() => setError("Unable to load participants."));
  }, [username, tripId]);

  const amountCents = useMemo(() => parseCurrencyToCents(amount), [amount]);

  const customTotal = useMemo(() => {
    return selectedIds.reduce((sum, userId) => {
      const value = customShares[userId] || "";
      return sum + parseCurrencyToCents(value);
    }, 0);
  }, [customShares, selectedIds]);

  const remaining = amountCents - customTotal;

  const toggleParticipant = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username) return;

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (amountCents <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (!payerUserId) {
      setError("Select who paid.");
      return;
    }
    if (selectedIds.length === 0) {
      setError("Select at least one participant to split with.");
      return;
    }

    const split =
      splitMode === "equal"
        ? splitEvenly(amountCents, selectedIds)
        : selectedIds.map((userId) => ({
            userId,
            shareCents: parseCurrencyToCents(customShares[userId] || ""),
          }));

    const totalSplit = split.reduce((sum, item) => sum + item.shareCents, 0);
    if (totalSplit !== amountCents) {
      setError("Split amounts must add up to the total.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiFetch(`/trips/${tripId}/expenses`, {
        method: "POST",
        username,
        body: JSON.stringify({
          description: description.trim(),
          amountCents,
          payerUserId,
          split,
        }),
      });
      router.push(`/trips/${tripId}/expenses`);
    } catch (err) {
      setError("Unable to save expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <PageHeader title="Add expense" backHref={`/trips/${tripId}`} />
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Taxi to hotel"
              className="w-full rounded-2xl border border-mist px-4 py-3 text-base"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="$0.00"
              className="w-full rounded-2xl border border-mist px-4 py-3 text-base"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Paid by</label>
            <select
              value={payerUserId}
              onChange={(event) => setPayerUserId(event.target.value)}
              className="w-full rounded-2xl border border-mist px-4 py-3 text-base bg-white"
            >
              <option value="">Select payer</option>
              {participants.map((participant) => (
                <option key={participant.userId} value={participant.userId}>
                  {participant.username}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Split between</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSplitMode("equal")}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    splitMode === "equal" ? "bg-ink text-white border-ink" : "border-mist"
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode("custom")}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    splitMode === "custom" ? "bg-ink text-white border-ink" : "border-mist"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {participants.map((participant) => {
                const checked = selectedIds.includes(participant.userId);
                return (
                  <div
                    key={participant.userId}
                    className="flex items-center justify-between rounded-2xl border border-mist px-4 py-3"
                  >
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleParticipant(participant.userId)}
                        className="h-4 w-4"
                      />
                      {participant.username}
                    </label>
                    {splitMode === "custom" && checked && (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={customShares[participant.userId] || ""}
                        onChange={(event) =>
                          setCustomShares((prev) => ({
                            ...prev,
                            [participant.userId]: event.target.value,
                          }))
                        }
                        placeholder="$0.00"
                        className="w-24 text-right text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {splitMode === "custom" && (
            <div className="rounded-2xl border border-mist p-4 text-sm bg-cloud">
              <div className="flex justify-between">
                <span>Total</span>
                <span>{formatCents(amountCents)}</span>
              </div>
              <div className="flex justify-between">
                <span>Custom split</span>
                <span>{formatCents(customTotal)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Remaining</span>
                <span>{formatCents(remaining)}</span>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink text-white py-3 text-sm font-semibold"
          >
            {loading ? "Saving..." : "Save expense"}
          </button>
        </form>
      </div>
    </div>
  );
}
