import Link from "next/link";
import TripHeader from "../../../../../components/TripHeader";
import { createServerComponentClient } from "../../../../../lib/supabase/server";
import { formatCurrency, formatDate } from "../../../../../lib/format";

export default async function ExpensesPage({ params }: { params: { code: string } }) {
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
      <div className="py-6">
        <TripHeader title="Expenses" backHref={`/trip/${params.code}`} />
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
        <TripHeader title="Expenses" backHref={`/trip/${params.code}`} />
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, title, amount, payer_id, created_at")
    .eq("trip_id", trip.id)
    .order("created_at", { ascending: false });

  const { data: members } = await supabase
    .from("trip_members")
    .select("user_id, profiles(username)")
    .eq("trip_id", trip.id);

  const nameMap = new Map(
    members?.map((member) => [member.user_id, (member.profiles as any)?.username ?? "Member"]) ?? []
  );

  return (
    <div className="py-6">
      <TripHeader title="Expenses" backHref={`/trip/${params.code}`} />
      <div className="space-y-3">
        {expenses?.length ? (
          expenses.map((expense) => (
            <Link
              key={expense.id}
              href={`/trip/${trip.code}/expenses/${expense.id}/edit`}
              className="card block p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {nameMap.get(expense.payer_id) ?? "Member"} · {formatDate(expense.created_at)}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(Number(expense.amount))}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="card p-6 text-sm text-muted">No expenses yet.</div>
        )}
      </div>
      <Link
        href={`/trip/${trip.code}/expenses/new`}
        className="btn btn-primary mt-6 w-full"
      >
        Add expense
      </Link>
    </div>
  );
}



