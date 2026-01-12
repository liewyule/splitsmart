import ExpenseForm, { Member } from "../../ExpenseForm";
import DeleteExpenseButton from "./DeleteExpenseButton";
import { createServerComponentClient } from "../../../../../../../lib/supabase/server";
import Link from "next/link";
import FadeIn from "../../../../../../../components/FadeIn";

export default async function EditExpensePage({
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

  if (!membership || !user) {
    return (
      <div className="empty-state mt-8">You are not a member of this trip.</div>
    );
  }

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, title, amount, payer_id, created_by, receipt_url")
    .eq("id", params.expenseId)
    .maybeSingle();

  if (!expense) {
    return (
      <div className="empty-state mt-8">Expense not found.</div>
    );
  }

  if (expense.created_by !== user.id) {
    return (
      <div className="py-6 space-y-4">
        <div className="empty-state">You are not allowed to edit this expense.</div>
        <Link href={`/trip/${trip.code}/expenses`} className="btn btn-primary w-full pressable">
          Back to expenses
        </Link>
      </div>
    );
  }

  const { data: splits } = await supabase
    .from("expense_splits")
    .select("user_id, amount")
    .eq("expense_id", expense.id);

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
      <FadeIn>
        <ExpenseForm
          tripCode={trip.code}
          members={members}
          currentUserId={user.id}
          mode="edit"
          initial={{
            id: expense.id,
            title: expense.title,
            amount: Number(expense.amount),
            receipt_url: expense.receipt_url,
            splits: splits?.map((split) => ({
              user_id: split.user_id,
              amount: Number(split.amount)
            })) ?? []
          }}
        />
        <div className="mt-4">
          <DeleteExpenseButton tripCode={trip.code} expenseId={expense.id} />
        </div>
      </FadeIn>
    </div>
  );
}
