"use client";

import { type ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { createExpenseAction, updateExpenseAction } from "../../../../../lib/actions/expenses";
import { useToast } from "../../../../../components/Toast";
import { formatCurrency } from "../../../../../lib/format";
import { createClient } from "../../../../../lib/supabase/client";
import InlineSpinner from "../../../../../components/InlineSpinner";

export type Member = {
  id: string;
  username: string;
};

type Split = {
  user_id: string;
  amount: number;
};

type ExpenseFormProps = {
  tripCode: string;
  members: Member[];
  currentUserId: string;
  mode?: "create" | "edit";
  initial?: {
    id: string;
    title: string;
    amount: number;
    splits: Split[];
    receipt_url?: string | null;
  };
};

function computeEqualSplits(amount: number, members: Member[]) {
  if (!members.length) return [];
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / members.length);
  const remainder = cents - base * members.length;
  return members.map((member, index) => ({
    user_id: member.id,
    amount: (base + (index < remainder ? 1 : 0)) / 100
  }));
}

function sumSplits(splits: Split[]) {
  return Math.round(splits.reduce((sum, split) => sum + split.amount, 0) * 100) / 100;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function formatAmount(value: number) {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(2).replace(/\.00$/, "");
}

function computeCustomTotals(baseShares: Split[], taxRate: number, taxEnabled: boolean) {
  const baseTotal = round2(sumSplits(baseShares));
  if (!taxEnabled || taxRate <= 0) {
    return {
      baseTotal,
      baseShares,
      finalShares: baseShares,
      finalTotal: baseTotal
    };
  }

  const multiplier = 1 + taxRate / 100;
  const targetTotal = round2(baseTotal * multiplier);
  const finalShares = baseShares.map((share) => ({
    ...share,
    amount: round2(share.amount * multiplier)
  }));
  const sumFinal = round2(sumSplits(finalShares));
  const diff = round2(targetTotal - sumFinal);
  if (finalShares.length && Math.abs(diff) > 0) {
    finalShares[finalShares.length - 1] = {
      ...finalShares[finalShares.length - 1],
      amount: round2(finalShares[finalShares.length - 1].amount + diff)
    };
  }
  const finalTotal = round2(sumFinal + diff);

  return {
    baseTotal,
    baseShares,
    finalShares,
    finalTotal
  };
}

function computeEqualTotals(baseTotal: number, members: Member[], taxRate: number, taxEnabled: boolean) {
  const baseShares = computeEqualSplits(baseTotal, members);
  const totals = computeCustomTotals(baseShares, taxRate, taxEnabled);
  return {
    baseTotal: totals.baseTotal,
    baseShares,
    finalShares: totals.finalShares,
    finalTotal: totals.finalTotal
  };
}

export default function ExpenseForm({
  tripCode,
  members,
  currentUserId,
  mode = "create",
  initial
}: ExpenseFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState(initial?.amount.toString() ?? "");
  const [receiptUrl, setReceiptUrl] = useState(initial?.receipt_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("");
  const [splitMode, setSplitMode] = useState<"equal" | "custom">(
    initial ? "custom" : "equal"
  );
  const initialSplits =
    initial?.splits && initial.splits.length
      ? initial.splits
      : computeEqualSplits(Number(amount || 0), members);
  const [splits, setSplits] = useState<Split[]>(initialSplits);
  const [error, setError] = useState("");

  const numericAmount = Number(amount || 0);
  const baseTotalFromSplits = useMemo(() => round2(sumSplits(splits)), [splits]);
  const taxRateValue = Number(taxRate || 0);

  const totals = useMemo(() => {
    return splitMode === "custom"
      ? computeCustomTotals(splits, taxRateValue, taxEnabled)
      : computeEqualTotals(numericAmount, members, taxRateValue, taxEnabled);
  }, [splitMode, splits, numericAmount, members, taxRateValue, taxEnabled]);

  useEffect(() => {
    if (splitMode === "equal" && members.length) {
      setSplits(computeEqualSplits(numericAmount, members));
    }
  }, [splitMode, numericAmount, members]);

  useEffect(() => {
    if (splitMode === "equal" && !amount && baseTotalFromSplits > 0) {
      setAmount(formatAmount(baseTotalFromSplits));
    }
  }, [splitMode, amount, baseTotalFromSplits]);

  const currentMember = useMemo(
    () => members.find((member) => member.id === currentUserId),
    [members, currentUserId]
  );

  const handleCustomSplitChange = (userId: string, value: string) => {
    const amountValue = Number(value || 0);
    setSplits((prev) =>
      prev.map((split) => (split.user_id === userId ? { ...split, amount: amountValue } : split))
    );
  };

  const handleReceiptChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;
    const filePath = `${tripCode}/${fileName}`;
    const { error } = await supabase.storage.from("receipts").upload(filePath, file, {
      upsert: true
    });
    if (error) {
      setUploading(false);
      push(error.message, "error");
      return;
    }
    const { data } = supabase.storage.from("receipts").getPublicUrl(filePath);
    setReceiptUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSubmit = () => {
    setError("");
    const hasNegativeSplit = splits.some((split) => split.amount < 0);
    if (!title) {
      setError("Enter a title.");
      return;
    }
    if (splitMode === "custom" && (totals.baseTotal <= 0 || hasNegativeSplit)) {
      setError("Each person must have a non-negative amount and total must be greater than 0.");
      return;
    }
    if (splitMode === "equal" && numericAmount <= 0) {
      setError("Enter a title and amount.");
      return;
    }

    const payload = {
      tripCode,
      expenseId: initial?.id,
      title,
      amount: totals.finalTotal,
      splits: totals.finalShares,
      receiptUrl: receiptUrl || null
    };

    startTransition(async () => {
      const result =
        mode === "edit" ? await updateExpenseAction(payload) : await createExpenseAction(payload);
      if (result?.error) {
        setError(result.error);
        push(result.error, "error");
        return;
      }
      push(mode === "edit" ? "Expense updated" : "Expense added", "success");
      router.push(`/trip/${tripCode}/expenses`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <label className="block text-sm font-medium">
          Title
          <input
            className="input mt-2"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Hotel"
          />
        </label>
        <label className="block text-sm font-medium">
          Amount
          <input
            className={`input mt-2 ${splitMode === "custom" ? "bg-slate-50 text-muted" : ""}`}
            inputMode="decimal"
            value={splitMode === "custom" || taxEnabled ? formatAmount(totals.finalTotal) : amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            readOnly={splitMode === "custom"}
          />
        </label>
        {splitMode === "custom" ? (
          <p className="text-sm text-muted">
            Total is auto-calculated from shares{taxEnabled ? " (incl. tax)" : ""}.
          </p>
        ) : null}
        <div className="space-y-1 text-sm">
          <p className="font-medium">Paid by</p>
          <p className="text-muted">
            You{currentMember?.username ? ` (${currentMember.username})` : ""}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Receipt photo</p>
          <label className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm transition hover:bg-slate-50">
            <span className="flex items-center gap-2 text-muted">
              <ImagePlus className="h-4 w-4 text-accent" />
              {uploading ? "Uploading..." : "Add receipt photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleReceiptChange}
              disabled={uploading}
            />
          </label>
          {receiptUrl ? (
            <div className="relative">
              <img
                src={receiptUrl}
                alt="Receipt"
                className="h-40 w-full rounded-xl object-cover"
              />
              <button
                type="button"
                onClick={() => setReceiptUrl("")}
                className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-muted shadow-soft"
                aria-label="Remove receipt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Split</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn pressable ${splitMode === "equal" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setSplitMode("equal")}
            >
              Equal
            </button>
            <button
              type="button"
              className={`btn pressable ${splitMode === "custom" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setSplitMode("custom")}
            >
              Custom
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {members.map((member) => {
            const memberSplit = splits.find((split) => split.user_id === member.id);
            const equalShare = totals.finalShares.find((split) => split.user_id === member.id);
            return (
              <div key={member.id} className="flex items-center justify-between">
                <span className="text-sm">{member.username}</span>
                {splitMode === "equal" ? (
                  <span className="text-sm font-semibold">
                    {formatCurrency(equalShare?.amount ?? 0)}
                  </span>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <input
                      className="input w-24 text-right"
                      inputMode="decimal"
                      value={memberSplit?.amount ?? 0}
                      onChange={(event) => handleCustomSplitChange(member.id, event.target.value)}
                    />
                    {taxEnabled ? (
                      <span className="text-sm text-muted">
                        {formatCurrency(equalShare?.amount ?? 0)}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm shadow-sm">
          <span className="font-medium">Add tax</span>
          <button
            type="button"
            role="switch"
            aria-checked={taxEnabled}
            onClick={() => setTaxEnabled((prev) => !prev)}
            className={`relative h-6 w-11 rounded-full transition ${
              taxEnabled ? "bg-accent" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                taxEnabled ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>
        {taxEnabled ? (
          <label className="block text-sm font-medium">
            Tax rate (%)
            <input
              className="input mt-2"
              inputMode="decimal"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              placeholder="8.5"
            />
            <span className="mt-2 block text-sm text-muted">Total includes tax.</span>
          </label>
        ) : null}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Split total</span>
          <span className={totals.finalTotal <= 0 ? "text-rose-600" : ""}>
            {formatCurrency(totals.finalTotal)}
          </span>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        className="btn btn-primary w-full pressable"
        onClick={handleSubmit}
        disabled={isPending || uploading}
      >
        {isPending || uploading ? (
          <span className="flex items-center justify-center gap-2">
            <InlineSpinner />
            {mode === "edit" ? "Saving..." : "Adding..."}
          </span>
        ) : mode === "edit" ? (
          "Save changes"
        ) : (
          "Add expense"
        )}
      </button>
    </div>
  );
}

