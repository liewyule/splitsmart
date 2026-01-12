"use server";

import { redirect } from "next/navigation";
import { createServerActionClient } from "../supabase/server";

function generateCode() {
  const num = Math.floor(Math.random() * 1000000);
  return num.toString().padStart(6, "0");
}

export async function createTripAction(_prevState: any, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return { error: "Trip name is required." };
  }

  const supabase = createServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const username =
    (user.user_metadata?.username as string | undefined) ??
    (user.email ? user.email.split("@")[0] : "traveler");
  await supabase.from("profiles").upsert({ id: user.id, username });

  let code = generateCode();
  let attempts = 0;
  while (attempts < 15) {
    const { data: existing } = await supabase
      .from("trips")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateCode();
    attempts += 1;
  }
  const { data: existingFinal } = await supabase
    .from("trips")
    .select("id")
    .eq("code", code)
    .maybeSingle();
  if (existingFinal) {
    return { error: "Unable to generate a unique trip code. Try again." };
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .insert({ name, code, created_by: user.id })
    .select("id, code")
    .single();

  if (error || !trip) {
    return { error: error?.message ?? "Failed to create trip." };
  }

  const { error: memberError } = await supabase
    .from("trip_members")
    .insert({ trip_id: trip.id, user_id: user.id });

  if (memberError) {
    return { error: memberError.message };
  }

  redirect(`/trip/${trip.code}`);
}

export async function lookupTripAction(
  _prevState: { error: string; trip?: { id: string; name: string; code: string } },
  formData: FormData
) {
  const code = String(formData.get("code") || "").trim();
  if (!code || code.length !== 6) {
    return { error: "Enter a 6-digit code." };
  }

  const supabase = createServerActionClient();
  const { data, error } = await supabase
    .from("trips")
    .select("id, name, code")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return { error: "Trip not found." };
  }

  return { error: "", trip: data };
}

export async function joinTripAction(_prevState: any, formData: FormData) {
  const code = String(formData.get("code") || "").trim();
  if (!code) {
    return { error: "Invalid code." };
  }

  const supabase = createServerActionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("id, code")
    .eq("code", code)
    .maybeSingle();

  if (!trip) {
    return { error: "Trip not found." };
  }

  const { error } = await supabase.from("trip_members").upsert(
    { trip_id: trip.id, user_id: user.id },
    { onConflict: "trip_id,user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  redirect(`/trip/${trip.code}`);
}

