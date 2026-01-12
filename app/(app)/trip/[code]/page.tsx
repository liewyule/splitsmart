import Link from "next/link";
import { createServerComponentClient } from "../../../../lib/supabase/server";
import { formatCurrency } from "../../../../lib/format";

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
      <div className="py-10">
        <p className="text-sm text-muted">This trip code does not exist.</p>
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
      <div className="py-10">
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
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
      <div className="card p-5">
        <p className="text-sm text-muted">Trip code</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[0.25em]">{trip.code}</h2>
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

      <div className="mt-6 grid gap-4">
        <Link href={`/trip/${trip.code}/expenses/new`} className="btn btn-primary w-full">
          Add expense
        </Link>
        <Link href={`/trip/${trip.code}/members`} className="btn btn-ghost w-full">
          View members
        </Link>
      </div>
    </div>
  );
}
