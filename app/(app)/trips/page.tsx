import { redirect } from "next/navigation";
import { createServerComponentClient } from "../../../lib/supabase/server";
import TripsClient from "./TripsClient";
import FadeIn from "../../../components/FadeIn";

export default async function TripsPage() {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  const trips =
    myTrips?.map((row) => {
      const trip = row.trips as any;
      return {
        id: trip.id as string,
        name: trip.name as string,
        code: trip.code as string,
        members: membersByTrip.get(row.trip_id) ?? []
      };
    }) ?? [];

  return (
    <main className="min-h-screen pb-6">
      <div className="pt-6">
        <h1 className="text-xl font-semibold">Trips</h1>
        <p className="mt-1 text-sm text-muted">All trips you have joined.</p>
      </div>
      <FadeIn>
        <TripsClient trips={trips} />
      </FadeIn>
    </main>
  );
}
