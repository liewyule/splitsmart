import TripHeader from "../../../../components/TripHeader";
import { createServerComponentClient } from "../../../../lib/supabase/server";
import { computeTransfers } from "../../../../lib/settle";
import { formatCurrency } from "../../../../lib/format";

export default async function SettlePage({ params }: { params: { code: string } }) {
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
        <TripHeader title="Settle" backHref={`/trip/${params.code}`} />
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
        <TripHeader title="Settle" backHref={`/trip/${params.code}`} />
        <p className="text-sm text-muted">You are not a member of this trip.</p>
      </div>
    );
  }

  const { data: membersData } = await supabase
    .from("trip_members")
    .select("user_id, profiles(username)")
    .eq("trip_id", trip.id);

  const members =
    membersData?.map((member) => ({
      id: member.user_id,
      username: (member.profiles as any)?.username ?? "Member"
    })) ?? [];

  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, amount, payer_id")
    .eq("trip_id", trip.id);

  const expenseIds = expenses?.map((expense) => expense.id) ?? [];

  const { data: splits } = await supabase
    .from("expense_splits")
    .select("expense_id, user_id, amount")
    .in("expense_id", expenseIds.length ? expenseIds : ["00000000-0000-0000-0000-000000000000"]);

  const paidMap = new Map<string, number>();
  const owedMap = new Map<string, number>();

  members.forEach((member) => {
    paidMap.set(member.id, 0);
    owedMap.set(member.id, 0);
  });

  expenses?.forEach((expense) => {
    paidMap.set(
      expense.payer_id,
      (paidMap.get(expense.payer_id) ?? 0) + Number(expense.amount)
    );
  });

  splits?.forEach((split) => {
    owedMap.set(
      split.user_id,
      (owedMap.get(split.user_id) ?? 0) + Number(split.amount)
    );
  });

  const balances = members.map((member) => ({
    user_id: member.id,
    username: member.username,
    net: (paidMap.get(member.id) ?? 0) - (owedMap.get(member.id) ?? 0)
  }));

  const transfers = computeTransfers(balances);
  const me = balances.find((balance) => balance.user_id === user.id);

  return (
    <div className="py-6">
      <TripHeader title="Settle" backHref={`/trip/${params.code}`} />
      <div className="card p-5">
        <p className="text-sm text-muted">Your balance</p>
        <p className={me && me.net >= 0 ? "mt-2 text-lg font-semibold text-emerald-600" : "mt-2 text-lg font-semibold text-rose-600"}>
          {me ? formatCurrency(me.net) : formatCurrency(0)}
        </p>
        <p className="mt-2 text-xs text-muted">
          Positive means you should receive money. Negative means you should pay.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {transfers.length ? (
          transfers.map((transfer, index) => (
            <div key={`${transfer.from}-${transfer.to}-${index}`} className="card p-4">
              <p className="text-sm">
                <span className="font-semibold">{transfer.from}</span> pays{" "}
                <span className="font-semibold">{transfer.to}</span> {formatCurrency(transfer.amount)}
              </p>
            </div>
          ))
        ) : (
          <div className="card p-6 text-sm text-muted">No transfers needed.</div>
        )}
      </div>
    </div>
  );
}


