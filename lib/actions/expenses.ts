"use server";

import { revalidatePath } from "next/cache";
import { createServerActionClient } from "../supabase/server";

export type SplitInput = {
  user_id: string;
  amount: number;
};

type ExpensePayload = {
  tripCode: string;
  expenseId?: string;
  title: string;
  amount: number;
  splits: SplitInput[];
  receiptUrl?: string | null;
};

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function sumSplits(splits: SplitInput[]) {
  return round2(splits.reduce((sum, split) => sum + split.amount, 0));
}

async function assertMembership(
  tripId: string,
  userId: string,
  supabase: ReturnType<typeof createServerActionClient>
) {
  const { data: member } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) {
    throw new Error("Not a member of this trip.");
  }
}

export async function createExpenseAction(payload: ExpensePayload) {
  const { tripCode, title, amount, splits, receiptUrl } = payload;
  if (!title || amount <= 0) {
    return { error: "Title and amount are required." };
  }

  if (sumSplits(splits) !== round2(amount)) {
    return { error: "Splits must equal total amount." };
  }

  const supabase = createServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code")
    .eq("code", tripCode)
    .maybeSingle();
  if (!trip) return { error: "Trip not found." };

  await assertMembership(trip.id, user.id, supabase);
  const { data: memberRows } = await supabase
    .from("trip_members")
    .select("user_id")
    .eq("trip_id", trip.id);
  const memberIds = new Set(memberRows?.map((row) => row.user_id) ?? []);
  if (splits.some((split) => !memberIds.has(split.user_id))) {
    return { error: "All splits must be trip members." };
  }

  const { data: expense, error } = await supabase
    .from("expenses")
    .insert({
      trip_id: trip.id,
      title,
      amount: round2(amount),
      payer_id: user.id,
      created_by: user.id,
      receipt_url: receiptUrl ?? null
    })
    .select("id")
    .single();

  if (error || !expense) return { error: error?.message ?? "Failed to create expense." };

  const { error: splitError } = await supabase.from("expense_splits").insert(
    splits.map((split) => ({
      expense_id: expense.id,
      user_id: split.user_id,
      amount: round2(split.amount)
    }))
  );

  if (splitError) return { error: splitError.message };

  revalidatePath(`/trip/${tripCode}/expenses`);
  revalidatePath(`/trip/${tripCode}/bill`);
  revalidatePath(`/trip/${tripCode}/settle`);

  return { success: true };
}

export async function updateExpenseAction(payload: ExpensePayload) {
  const { tripCode, expenseId, title, amount, splits, receiptUrl } = payload;
  if (!expenseId) return { error: "Missing expense." };
  if (!title || amount <= 0) return { error: "Title and amount are required." };
  if (sumSplits(splits) !== round2(amount)) return { error: "Splits must equal total amount." };

  const supabase = createServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code")
    .eq("code", tripCode)
    .maybeSingle();
  if (!trip) return { error: "Trip not found." };

  await assertMembership(trip.id, user.id, supabase);
  const { data: expense } = await supabase
    .from("expenses")
    .select("id, created_by")
    .eq("id", expenseId)
    .eq("trip_id", trip.id)
    .maybeSingle();
  if (!expense) return { error: "Expense not found." };
  if (expense.created_by !== user.id) return { error: "Not allowed to edit this expense." };

  const { data: memberRows } = await supabase
    .from("trip_members")
    .select("user_id")
    .eq("trip_id", trip.id);
  const memberIds = new Set(memberRows?.map((row) => row.user_id) ?? []);
  if (splits.some((split) => !memberIds.has(split.user_id))) {
    return { error: "All splits must be trip members." };
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      title,
      amount: round2(amount),
      receipt_url: receiptUrl ?? null
    })
    .eq("id", expenseId);

  if (error) return { error: error.message };

  const { error: deleteError } = await supabase
    .from("expense_splits")
    .delete()
    .eq("expense_id", expenseId);
  if (deleteError) return { error: deleteError.message };

  const { error: splitError } = await supabase.from("expense_splits").insert(
    splits.map((split) => ({
      expense_id: expenseId,
      user_id: split.user_id,
      amount: round2(split.amount)
    }))
  );
  if (splitError) return { error: splitError.message };

  revalidatePath(`/trip/${tripCode}/expenses`);
  revalidatePath(`/trip/${tripCode}/bill`);
  revalidatePath(`/trip/${tripCode}/settle`);

  return { success: true };
}

export async function deleteExpenseAction(tripCode: string, expenseId: string) {
  const supabase = createServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("code", tripCode)
    .maybeSingle();
  if (!trip) return { error: "Trip not found." };

  await assertMembership(trip.id, user.id, supabase);
  const { data: expense } = await supabase
    .from("expenses")
    .select("id, created_by")
    .eq("id", expenseId)
    .eq("trip_id", trip.id)
    .maybeSingle();
  if (!expense) return { error: "Expense not found." };
  if (expense.created_by !== user.id) return { error: "Not allowed to delete this expense." };

  const { error } = await supabase.from("expenses").delete().eq("id", expenseId);
  if (error) return { error: error.message };

  revalidatePath(`/trip/${tripCode}/expenses`);
  revalidatePath(`/trip/${tripCode}/bill`);
  revalidatePath(`/trip/${tripCode}/settle`);

  return { success: true };
}

