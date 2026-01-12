import Link from "next/link";
import { ArrowUpRight, Compass, Sparkles, Users } from "lucide-react";
import { createClient } from "../lib/supabase/server";
import { signOut } from "../lib/actions/auth";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const { data: myTrips } = await supabase
    .from("trip_members")
    .select("trip_id, trips(id, name, code, created_at)")
    .eq("user_id", user?.id ?? "")
    .order("joined_at", { ascending: false });

  const tripIds = myTrips?.map((row) => row.trip_id) ?? [];

  const { data: memberRows } = await supabase
    .from("trip_members")
    .select("trip_id, user_id, profiles(username)")
    .in("trip_id", tripIds.length ? tripIds : ["00000000-0000-0000-0000-000000000000"]);

  const membersByTrip = new Map<string, string[]>();
  memberRows?.forEach((row) => {
    const username = (row.profiles as any)?.username ?? "Member";
    const list = membersByTrip.get(row.trip_id) ?? [];
    list.push(username);
    membersByTrip.set(row.trip_id, list);
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-5 pb-24">
      <div className="flex items-center justify-between pt-10">
        <div>
          <p className="text-sm text-muted">Welcome</p>
          <h1 className="text-2xl font-semibold">{profile?.username ?? "Traveler"}</h1>
        </div>
        <form action={signOut}>
          <button className="btn btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted">
          <Users className="h-4 w-4 text-accent" />
          Your trips
        </div>
        <div className="mt-4 space-y-3">
          {myTrips?.length ? (
            myTrips.map((row) => {
              const trip = row.trips as any;
              const members = membersByTrip.get(row.trip_id) ?? [];
              return (
                <Link key={trip.id} href={`/trip/${trip.code}`} className="card block p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold">{trip.name}</p>
                      <p className="mt-1 text-xs text-muted">Code {trip.code}</p>
                    </div>
                    <span className="rounded-full bg-accentSoft px-3 py-1 text-xs text-ink">
                      {members.length} members
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.slice(0, 4).map((member) => (
                      <span
                        key={`${trip.id}-${member}`}
                        className="rounded-full border border-border/60 bg-white px-3 py-1 text-xs text-muted"
                      >
                        {member}
                      </span>
                    ))}
                    {members.length > 4 ? (
                      <span className="text-xs text-muted">+{members.length - 4} more</span>
                    ) : null}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="card p-6 text-sm text-muted">No trips yet. Create or join one.</div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <Link href="/trip/create" className="card block p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create Trip</h2>
                <p className="mt-1 text-sm text-muted">
                  Start a new trip and invite friends with a 6-digit code.
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted" />
          </div>
        </Link>
        <Link href="/trip/join" className="card block p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Join Trip</h2>
                <p className="mt-1 text-sm text-muted">Enter a code to join an existing trip.</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted" />
          </div>
        </Link>
      </div>
    </main>
  );
}
