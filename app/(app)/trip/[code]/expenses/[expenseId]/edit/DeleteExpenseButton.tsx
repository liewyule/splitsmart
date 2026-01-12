"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteExpenseAction } from "../../../../../../../lib/actions/expenses";
import { useToast } from "../../../../../../../components/Toast";

export default function DeleteExpenseButton({
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
    <button className="btn btn-danger w-full pressable" onClick={handleDelete} disabled={isPending}>
      Delete expense
    </button>
  );
}

