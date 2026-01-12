"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteExpenseAction } from "../../../../../../lib/actions/expenses";
import { useToast } from "../../../../../../components/Toast";

export default function ExpenseDetailActions({
  tripCode,
  expenseId
}: {
  tripCode: string;
  expenseId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { push } = useToast();

  const handleDelete = () => {
    if (!confirm("Delete this expense?")) return;
    startTransition(async () => {
      const result = await deleteExpenseAction(tripCode, expenseId);
      if (result?.error) {
        push(result.error, "error");
        return;
      }
      push("Expense deleted", "success");
      router.push(`/trip/${tripCode}/expenses`);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/trip/${tripCode}/expenses/${expenseId}/edit`}
        prefetch
        className="btn btn-ghost px-3 pressable"
        aria-label="Edit expense"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        className="btn btn-danger px-3 pressable"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete expense"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
