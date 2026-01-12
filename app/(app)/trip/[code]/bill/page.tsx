import Link from "next/link";
import TripHeader from "../../../../../components/TripHeader";
import { createServerComponentClient } from "../../../../../lib/supabase/server";
import { formatCurrency, formatDate } from "../../../../../lib/format";

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
      <div className="py-6">
        <TripHeader title="My bill" backHref={`/trip/${params.code}`} />
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
        <TripHeader title="My bill" backHref={`/trip/${params.code}`} />
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: paidExpenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("trip_id", trip.id)
    .eq("payer_id", user.id);

  const totalPaid = paidExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) ?? 0;

  const { data: lineItems } = await supabase
    .from("expense_splits")
    .select("amount, expenses(id, title, amount, payer_id, created_at, trip_id)")
    .eq("user_id", user.id)
    .eq("expenses.trip_id", trip.id);

  const items =
    lineItems?.filter((item) => (item.expenses as any)?.id)?.map((item) => ({
      splitAmount: Number(item.amount),
      expense: item.expenses as any
    })) ?? [];

  const totalOwed = items.reduce((sum, item) => sum + item.splitAmount, 0);
  const net = totalPaid - totalOwed;

  return (
    <div className="py-6">
      <TripHeader title="My bill" backHref={`/trip/${params.code}`} />
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
              href={`/trip/${trip.code}/expenses/${item.expense.id}/edit`}
              className="card block p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.expense.title}</p>
                  <p className="text-xs text-muted">{formatDate(item.expense.created_at)}</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(item.splitAmount)}</p>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                {item.expense.payer_id === user.id ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">You paid</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">You owe</span>
                )}
                <span>
                  {item.expense.payer_id === user.id
                    ? `You paid ${formatCurrency(item.splitAmount)}`
                    : `You owe ${formatCurrency(item.splitAmount)}`}
                </span>
                <span>{formatCurrency(item.expense.amount)} total</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="card p-6 text-sm text-muted">No bill items yet.</div>
        )}
      </div>
    </div>
  );
}



