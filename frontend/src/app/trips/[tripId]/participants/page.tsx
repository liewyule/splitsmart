"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageHeader from "../../../../components/PageHeader";
import { apiFetch } from "../../../../lib/api";
import { useRequireUser } from "../../../../lib/auth";

interface Participant {
  userId: string;
  username: string;
}

export default function ParticipantsPage() {
  const username = useRequireUser();
  const params = useParams();
  const tripId = params.tripId as string;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username || !tripId) return;
    apiFetch<Participant[]>(`/trips/${tripId}/participants`, { username })
      .then(setParticipants)
      .catch(() => setError("Unable to load participants."));
  }, [username, tripId]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      setError("Username is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const added = await apiFetch<Participant>(`/trips/${tripId}/participants`, {
        method: "POST",
        username,
        body: JSON.stringify({ username: trimmed }),
      });
      setParticipants((prev) => {
        if (prev.some((p) => p.userId === added.userId)) return prev;
        return [...prev, added];
      });
      setNewName("");
    } catch (err) {
      setError("Unable to add participant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <PageHeader title="Participants" backHref={`/trips/${tripId}`} />
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Add by username</label>
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="e.g. sam"
              className="w-full rounded-2xl border border-mist px-4 py-3 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink text-white py-3 text-sm font-semibold"
          >
            {loading ? "Adding..." : "Add participant"}
          </button>
        </form>

        <div className="rounded-2xl border border-mist p-4 text-xs text-slate-500 bg-cloud">
          New participants only apply to future expenses. Past expenses stay the same.
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.userId}
              className="rounded-2xl border border-mist px-4 py-3 text-sm flex justify-between"
            >
              <span>{participant.username}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
