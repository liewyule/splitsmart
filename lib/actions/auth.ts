"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerActionClient } from "../supabase/server";

async function ensureProfile(user: { id: string; email?: string | null; user_metadata?: any }) {
  const supabase = createServerActionClient();
  const username =
    (user.user_metadata?.username as string | undefined) ??
    (user.email ? user.email.split("@")[0] : "traveler");

  await supabase.from("profiles").upsert({
    id: user.id,
    username
  });
}

export async function signUp(_prevState: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const username = String(formData.get("username") || "").trim();

  if (!email || !password || !username) {
    return { error: "All fields are required." };
  }

  const supabase = createServerActionClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // Profile is created on first successful sign-in to avoid RLS issues
  // when email confirmation is enabled.

  revalidatePath("/");
  redirect("/");
}

export async function signIn(_prevState: any, formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createServerActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) {
    await ensureProfile(user);
  }

  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const supabase = createServerActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}

