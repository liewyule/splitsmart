import { createServerComponentClient } from "../../../../../lib/supabase/server";
import { computeTransfers } from "../../../../../lib/settle";
import { formatCurrency } from "../../../../../lib/format";

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
  const meName = members.find((member) => member.id === user.id)?.username ?? "You";
  const myTransfers = transfers.filter(
    (transfer) => transfer.from === meName || transfer.to === meName
  );

  return (
    <div className="py-6">
      <p className="mt-2 text-sm text-muted">Your settlement actions for this trip.</p>

      <div className="mt-5 space-y-3">
        {myTransfers.length ? (
          myTransfers.map((transfer, index) => (
            <div key={`${transfer.from}-${transfer.to}-${index}`} className="card p-4">
              <p className="text-sm">
                {transfer.from === meName ? (
                  <>
                    You pay <span className="font-semibold">{transfer.to}</span>{" "}
                    {formatCurrency(transfer.amount)}
                  </>
                ) : (
                  <>
                    You receive from <span className="font-semibold">{transfer.from}</span>{" "}
                    {formatCurrency(transfer.amount)}
                  </>
                )}
              </p>
            </div>
          ))
        ) : (
          <div className="card p-6 text-sm text-muted">You are settled up.</div>
        )}
      </div>
    </div>
  );
}
