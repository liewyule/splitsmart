import Link from "next/link";
import { createServerComponentClient } from "../../../../lib/supabase/server";
import { formatCurrency } from "../../../../lib/format";
import FadeIn from "../../../../components/FadeIn";

export default async function TripDashboard({ params }: { params: { code: string } }) {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, code")
    .eq("code", params.code)
    .maybeSingle();

  if (!trip) {
    return (
      <div className="empty-state mt-8">This trip code does not exist.</div>
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

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("trip_id", trip.id);

  const totalSpend = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) ?? 0;

  return (
    <div className="py-6">
      <FadeIn className="space-y-6">
        <div className="card p-5">
          <p className="text-sm text-muted">Trip name</p>
          <h2 className="mt-2 text-lg font-semibold">{trip.name}</h2>
          <p className="mt-4 text-sm text-muted">Trip code</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[0.25em]">{trip.code}</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Members</p>
              <p className="mt-1 text-lg font-semibold">{members?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-muted">Total spend</p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(totalSpend)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <Link
            href={`/trip/${trip.code}/expenses/new`}
            prefetch
            className="btn btn-primary w-full pressable"
          >
            Add expense
          </Link>
          <Link
            href={`/trip/${trip.code}/members`}
            prefetch
            className="btn btn-ghost w-full pressable"
          >
            View members
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
