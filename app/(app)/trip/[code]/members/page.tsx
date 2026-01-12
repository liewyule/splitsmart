import { createServerComponentClient } from "../../../../../lib/supabase/server";

export default async function MembersPage({ params }: { params: { code: string } }) {
  const supabase = createServerComponentClient();
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
      <div className="empty-state mt-8">Trip not found.</div>
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
      <div className="empty-state mt-8">You are not a member of this trip.</div>
    );
  }

  const { data: members } = await supabase
    .from("trip_members")
    .select("id, profiles(username)")
    .eq("trip_id", trip.id);

  return (
    <div className="py-6">
      <div className="space-y-3">
        {members?.map((member) => (
          <div key={member.id} className="card p-4 text-sm font-medium">
            {(member.profiles as any)?.username ?? "Member"}
          </div>
        ))}
      </div>
    </div>
  );
}
