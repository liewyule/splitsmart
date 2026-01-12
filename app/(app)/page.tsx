import Link from "next/link";
import { ChevronRight, Compass, LogOut, Sparkles, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "../../lib/supabase/server";
import { signOut } from "../../lib/actions/auth";

export default async function HomePage() {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
    <main className="flex min-h-screen flex-col pb-6">
      <div className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm text-muted">Welcome</p>
          <h1 className="text-2xl font-semibold">{profile?.username ?? "Traveler"}</h1>
        </div>
        <details className="relative">
          <summary className="list-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accentSoft text-accent">
              <Users className="h-5 w-5" />
            </div>
          </summary>
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border/70 bg-white p-2 shadow-soft">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-accentSoft"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </details>
      </div>

      <div className="mt-6 space-y-4">
        <Link
          href="/trip/create"
          className="card block rounded-2xl border border-border/70 p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create Trip</h2>
                <p className="mt-1 text-sm text-muted">
                  Start a new trip, get a 6-digit code, and invite friends instantly.
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </div>
        </Link>
        <Link
          href="/trip/join"
          className="card block rounded-2xl border border-border/70 p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Join Trip</h2>
                <p className="mt-1 text-sm text-muted">
                  Enter a 6-digit code to join a shared trip and start splitting.
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted" />
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-sm font-semibold text-muted">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Your trips
          </div>
          <Link href="/trips" className="text-xs text-accent hover:underline">
            See all
          </Link>
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
            <div className="card flex items-start gap-3 p-6 text-sm text-muted">
              <div className="rounded-full bg-accentSoft p-2 text-accent">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-ink">No trips yet</p>
                <p className="mt-1 text-sm text-muted">Create a new trip or join one with a code.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
