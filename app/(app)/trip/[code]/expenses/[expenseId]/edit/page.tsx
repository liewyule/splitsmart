import ExpenseForm, { Member } from "../../ExpenseForm";
import DeleteExpenseButton from "./DeleteExpenseButton";
import { createServerComponentClient } from "../../../../../../../lib/supabase/server";

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
      <div className="py-6">
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
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: expense } = await supabase
    .from("expenses")
    .select("id, title, amount, payer_id, receipt_url")
    .eq("id", params.expenseId)
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
      <ExpenseForm
        tripCode={trip.code}
        members={members}
        currentUserId={user.id}
        mode="edit"
        initial={{
          id: expense.id,
          title: expense.title,
          amount: Number(expense.amount),
          payer_id: expense.payer_id,
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
    </div>
  );
}
