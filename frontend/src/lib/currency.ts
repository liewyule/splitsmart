export const formatCents = (cents: number) => {
  const amount = (cents / 100).toFixed(2);
  return amount.startsWith("-") ? `-$${amount.slice(1)}` : `$${amount}`;
};

export const parseCurrencyToCents = (value: string) => {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const [dollars, cents = ""] = cleaned.split(".");
  const centsPadded = (cents + "00").slice(0, 2);
  return Number(dollars || 0) * 100 + Number(centsPadded || 0);
};

export const splitEvenly = (amountCents: number, userIds: string[]) => {
  if (!userIds.length) return [] as Array<{ userId: string; shareCents: number }>;
  const base = Math.floor(amountCents / userIds.length);
  const remainder = amountCents % userIds.length;
  return userIds.map((userId, index) => ({
    userId,
    shareCents: base + (index < remainder ? 1 : 0),
  }));
};
