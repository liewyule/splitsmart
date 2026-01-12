import TripHeader from "../../../../components/TripHeader";
import { createClient } from "../../../../lib/supabase/server";

export default async function MembersPage({ params }: { params: { code: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code")
    .eq("code", params.code)
    .maybeSingle();

  if (!trip) {
    return (
      <div className="py-6">
        <TripHeader title="Members" backHref={`/trip/${params.code}`} />
        <p className="text-sm text-muted">Trip not found.</p>
      </div>
    );
  }

  const { data: membership } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", trip.id)
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (!membership) {
    return (
      <div className="py-6">
        <TripHeader title="Members" backHref={`/trip/${params.code}`} />
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: members } = await supabase
    .from("trip_members")
    .select("id, profiles(username)")
    .eq("trip_id", trip.id);

  return (
    <div className="py-6">
      <TripHeader title="Members" backHref={`/trip/${params.code}`} />
      <div className="space-y-3">
        {members?.map((member) => (
          <div key={member.id} className="card p-4 text-sm">
            {(member.profiles as any)?.username ?? "Member"}
          </div>
        ))}
      </div>
    </div>
  );
}
