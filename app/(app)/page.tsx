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
          className="card block rounded-3xl border border-border/70 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-4 text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Create Trip</h2>
                <p className="mt-1 text-base text-muted">
                  Start a new trip and split expenses with friends.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </div>
        </Link>
        <Link
          href="/trip/join"
          className="card block rounded-3xl border border-border/70 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accentSoft p-4 text-accent">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Join Trip</h2>
                <p className="mt-1 text-base text-muted">
                  Join an existing trip using a 6-digit code.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </div>
        </Link>
      </div>

    </main>
  );
}
