export type Balance = {
  user_id: string;
  username: string;
  net: number;
};

export type Transfer = {
  from: string;
  to: string;
  amount: number;
};

export function computeTransfers(balances: Balance[]) {
  const creditors = balances
    .filter((b) => b.net > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter((b) => b.net < -0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(creditor.net, -debtor.net);

    if (amount > 0.005) {
      transfers.push({
        from: debtor.username,
        to: creditor.username,
        amount: Math.round(amount * 100) / 100
      });
    }

    debtor.net += amount;
    creditor.net -= amount;

    if (Math.abs(debtor.net) < 0.01) i += 1;
    if (Math.abs(creditor.net) < 0.01) j += 1;
  }

  return transfers;
}
