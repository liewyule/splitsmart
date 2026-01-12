"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../../components/PageHeader";
import { apiFetch } from "../../lib/api";
import { getStoredUsername, setStoredUsername } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const existing = getStoredUsername();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter a username to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/users/switch", {
        method: "POST",
        body: JSON.stringify({ username: trimmed }),
      });
      setStoredUsername(trimmed);
      router.push("/trips");
    } catch (err) {
      setError("Unable to switch user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Welcome" backHref="/trips" />
      <div className="max-w-md mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">SplitSmart</div>
          <h1 className="text-3xl font-semibold mt-3">Switch user</h1>
          <p className="text-sm text-slate-500 mt-2">
            Enter a username to start or continue a trip.
          </p>
        </div>

        {existing && (
          <div className="mb-6 rounded-2xl border border-mist p-4 bg-cloud">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current</div>
            <div className="text-lg font-semibold mt-1">{existing}</div>
            <button
              type="button"
              onClick={() => router.push("/trips")}
              className="mt-3 w-full rounded-full border border-ink py-2 text-sm font-medium"
            >
              Continue as {existing}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. alex"
              className="w-full rounded-2xl border border-mist px-4 py-3 text-base"
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-ink text-white py-3 text-sm font-semibold"
          >
            {loading ? "Switching..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
