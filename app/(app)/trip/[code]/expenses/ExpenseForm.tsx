"use client";

import { type ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { createExpenseAction, updateExpenseAction } from "../../../../../lib/actions/expenses";
import { useToast } from "../../../../../components/Toast";
import { formatCurrency } from "../../../../../lib/format";
import { createClient } from "../../../../../lib/supabase/client";

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
    payer_id: string;
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
  const [payerId, setPayerId] = useState(initial?.payer_id ?? currentUserId);
  const [receiptUrl, setReceiptUrl] = useState(initial?.receipt_url ?? "");
  const [uploading, setUploading] = useState(false);
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

  useEffect(() => {
    if (splitMode === "equal" && members.length) {
      setSplits(computeEqualSplits(numericAmount, members));
    }
  }, [splitMode, numericAmount, members]);

  const totalSplit = useMemo(() => sumSplits(splits), [splits]);

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
    if (!title || numericAmount <= 0) {
      setError("Enter a title and amount.");
      return;
    }
    if (Math.abs(totalSplit - numericAmount) > 0.01) {
      setError("Split total must match expense amount.");
      return;
    }

    const payload = {
      tripCode,
      expenseId: initial?.id,
      title,
      amount: numericAmount,
      payerId,
      splits,
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
            className="input mt-2"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </label>
        <label className="block text-sm font-medium">
          Paid by
          <select
            className="input mt-2"
            value={payerId}
            onChange={(event) => setPayerId(event.target.value)}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.username}
              </option>
            ))}
          </select>
        </label>
        <div className="space-y-2">
          <p className="text-sm font-medium">Receipt photo</p>
          <label className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-4 py-3 text-sm">
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
              className={`btn ${splitMode === "equal" ? "btn-primary" : "btn-ghost"} px-4 py-2 text-xs`}
              onClick={() => setSplitMode("equal")}
            >
              Equal
            </button>
            <button
              type="button"
              className={`btn ${splitMode === "custom" ? "btn-primary" : "btn-ghost"} px-4 py-2 text-xs`}
              onClick={() => setSplitMode("custom")}
            >
              Custom
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {members.map((member) => {
            const memberSplit = splits.find((split) => split.user_id === member.id);
            return (
              <div key={member.id} className="flex items-center justify-between">
                <span className="text-sm">{member.username}</span>
                {splitMode === "equal" ? (
                  <span className="text-sm font-semibold">
                    {formatCurrency(memberSplit?.amount ?? 0)}
                  </span>
                ) : (
                  <input
                    className="input w-24 text-right"
                    inputMode="decimal"
                    value={memberSplit?.amount ?? 0}
                    onChange={(event) => handleCustomSplitChange(member.id, event.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Split total</span>
          <span className={Math.abs(totalSplit - numericAmount) > 0.01 ? "text-rose-600" : ""}>
            {formatCurrency(totalSplit)}
          </span>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button className="btn btn-primary w-full" onClick={handleSubmit} disabled={isPending}>
        {mode === "edit" ? "Save changes" : "Add expense"}
      </button>
    </div>
  );
}

