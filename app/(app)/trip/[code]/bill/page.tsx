import Link from "next/link";
import { createServerComponentClient } from "../../../../../lib/supabase/server";
import { formatCurrency, formatDate } from "../../../../../lib/format";
import FadeIn from "../../../../../components/FadeIn";

export default async function BillPage({ params }: { params: { code: string } }) {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code")
    .eq("code", params.code)
    .maybeSingle();

  if (!trip || !user) {
    return (
      <div className="empty-state mt-8">Trip not found.</div>
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
      <div className="empty-state mt-8">You are not a member of this trip.</div>
    );
  }

  const { data: paidExpenses } = await supabase
    .from("expenses")
    .select("id, title, amount, payer_id, created_at, trip_id")
    .eq("trip_id", trip.id)
    .eq("payer_id", user.id);

  const totalPaid = paidExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) ?? 0;

  const { data: lineItems } = await supabase
    .from("expense_splits")
    .select("amount, expenses(id, title, amount, payer_id, created_at, trip_id)")
    .eq("user_id", user.id)
    .eq("expenses.trip_id", trip.id);

  const { data: members } = await supabase
    .from("trip_members")
    .select("user_id, profiles(username)")
    .eq("trip_id", trip.id);

  const nameMap = new Map(
    members?.map((member) => [member.user_id, (member.profiles as any)?.username ?? "Member"]) ?? []
  );

  const splitItems =
    lineItems
      ?.filter((item) => (item.expenses as any)?.id)
      ?.map((item) => ({
        splitAmount: Number(item.amount),
        expense: item.expenses as any
      })) ?? [];

  const paidExpenseMap = new Map(
    paidExpenses?.map((expense) => [expense.id, expense]) ?? []
  );

  splitItems.forEach((item) => {
    paidExpenseMap.delete(item.expense.id);
  });

  const paidOnlyItems = Array.from(paidExpenseMap.values()).map((expense) => ({
    splitAmount: 0,
    expense
  }));

  const items = [...splitItems, ...paidOnlyItems].filter(
    (item) => item.splitAmount > 0 || item.expense.payer_id === user.id
  );

  const totalOwed = items.reduce((sum, item) => sum + item.splitAmount, 0);
  const net = totalPaid - totalOwed;

  return (
    <div className="py-6">
      <FadeIn>
        <div className="card p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Total paid</span>
            <span className="font-semibold">{formatCurrency(totalPaid)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted">Total owed</span>
            <span className="font-semibold">{formatCurrency(totalOwed)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-base">
            <span className="font-semibold">Net balance</span>
            <span className={net >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
              {formatCurrency(net)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {items.length ? (
            items.map((item) => (
              <Link
                key={item.expense.id}
                href={`/trip/${trip.code}/expenses/${item.expense.id}`}
                prefetch
                className={`card block p-4 pressable pressable-card motion-safe:transition motion-safe:duration-200 ${
                  item.expense.payer_id === user.id ? "border-emerald-400 bg-emerald-200" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.expense.title}</p>
                    <p className="text-sm text-muted">{formatDate(item.expense.created_at)}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.splitAmount)}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <span>
                    {item.expense.payer_id === user.id
                      ? `You paid ${formatCurrency(item.expense.amount)}`
                      : `${nameMap.get(item.expense.payer_id) ?? "Member"} paid ${formatCurrency(item.expense.amount)}`}
                  </span>
                </div>
              </Link>
          ))
        ) : (
          <div className="empty-state">No bill items yet.</div>
        )}
        </div>
      </FadeIn>
    </div>
  );
}
