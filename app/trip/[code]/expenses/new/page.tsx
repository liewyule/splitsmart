import TripHeader from "../../../../../components/TripHeader";
import ExpenseForm, { Member } from "../ExpenseForm";
import { createServerComponentClient } from "../../../../../lib/supabase/server";

export default async function NewExpensePage({ params }: { params: { code: string } }) {
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
      <div className="py-6">
        <TripHeader title="Add expense" backHref={`/trip/${params.code}/expenses`} />
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

  if (!membership || !user) {
    return (
      <div className="py-6">
        <TripHeader title="Add expense" backHref={`/trip/${params.code}/expenses`} />
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: membersData } = await supabase
    .from("trip_members")
    .select("user_id, profiles(username)")
    .eq("trip_id", trip.id);

  const members: Member[] =
    membersData?.map((member) => ({
      id: member.user_id,
      username: (member.profiles as any)?.username ?? "Member"
    })) ?? [];

  return (
    <div className="py-6">
      <TripHeader title="Add expense" backHref={`/trip/${params.code}/expenses`} />
      <ExpenseForm tripCode={trip.code} members={members} currentUserId={user.id} />
    </div>
  );
}


