import Link from "next/link";
import { createServerComponentClient } from "../../../../../../lib/supabase/server";
import { formatCurrency, formatDate } from "../../../../../../lib/format";
import ExpenseDetailActions from "./ExpenseDetailActions";
import FadeIn from "../../../../../../components/FadeIn";

export default async function ExpenseDetailsPage({
  params
}: {
  params: { code: string; expenseId: string };
}) {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code, name")
    .eq("code", params.code)
    .maybeSingle();

  if (!trip || !user) {
    return (
      <div className="py-6">
        <p className="text-sm text-muted">Trip not found.</p>
      </div>
    );
  }

  const { data: membership } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", trip.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return (
      <div className="py-6">
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, title, amount, payer_id, created_by, created_at, receipt_url")
    .eq("id", params.expenseId)
    .eq("trip_id", trip.id)
    .maybeSingle();

  if (!expense) {
    return (
      <div className="py-6">
        <p className="text-sm text-muted">Expense not found.</p>
      </div>
    );
  }

  const { data: splits } = await supabase
    .from("expense_splits")
    .select("user_id, amount")
    .eq("expense_id", expense.id);

  const { data: members } = await supabase
    .from("trip_members")
    .select("user_id, profiles(username)")
    .eq("trip_id", trip.id);

  const nameMap = new Map(
    members?.map((member) => [member.user_id, (member.profiles as any)?.username ?? "Member"]) ?? []
  );

  const totalSplit =
    splits?.reduce((sum, split) => sum + Number(split.amount), 0) ?? 0;
  const isOwner = expense.created_by === user.id;

  return (
    <div className="py-6 space-y-6">
      <FadeIn className="space-y-6">
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted">{formatDate(expense.created_at)}</p>
              <h1 className="mt-1 text-lg font-semibold">{expense.title}</h1>
              <p className="mt-1 text-xs text-muted">{trip.name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-semibold">{formatCurrency(Number(expense.amount))}</p>
              {isOwner ? (
                <ExpenseDetailActions tripCode={trip.code} expenseId={expense.id} />
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Paid by</span>
              <span className="font-medium">
                {nameMap.get(expense.payer_id) ?? "Member"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Created by</span>
              <span className="font-medium">
                {nameMap.get(expense.created_by) ?? "Member"}
              </span>
            </div>
          </div>

          {expense.receipt_url ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Receipt photo</p>
              <img
                src={expense.receipt_url}
                alt="Receipt"
                className="h-48 w-full rounded-xl object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Split</h2>
            <span className="text-xs text-muted">{splits?.length ?? 0} people</span>
          </div>
          <div className="space-y-2">
            {splits?.map((split) => (
              <div key={split.user_id} className="flex items-center justify-between text-sm">
                <span>{nameMap.get(split.user_id) ?? "Member"}</span>
                <span className="font-medium">{formatCurrency(Number(split.amount))}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
            <span className="text-muted">Split total</span>
            <span className="font-semibold">{formatCurrency(totalSplit)}</span>
          </div>
        </div>

        <Link href={`/trip/${trip.code}/expenses`} prefetch className="btn btn-ghost w-full pressable">
          Back to expenses
        </Link>
      </FadeIn>
    </div>
  );
}
