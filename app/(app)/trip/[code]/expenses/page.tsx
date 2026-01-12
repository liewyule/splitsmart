import { createServerComponentClient } from "../../../../../lib/supabase/server";
import { formatCurrency, formatDate } from "../../../../../lib/format";
import Link from "next/link";
import FadeIn from "../../../../../components/FadeIn";

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
      <FadeIn className="space-y-3">
        {expenses?.length ? (
          expenses.map((expense) => (
            <Link
              key={expense.id}
              href={`/trip/${trip.code}/expenses/${expense.id}`}
              prefetch
              className="card block p-4 pressable pressable-card motion-safe:transition motion-safe:duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {nameMap.get(expense.payer_id) ?? "Member"} -{" "}
                    {formatDate(expense.created_at)}
                  </p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(Number(expense.amount))}</p>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">No expenses yet.</div>
        )}
      </FadeIn>
      <Link
        href={`/trip/${trip.code}/expenses/new`}
        prefetch
        className="btn btn-primary mt-6 w-full pressable"
      >
        Add expense
      </Link>
    </div>
  );
}
