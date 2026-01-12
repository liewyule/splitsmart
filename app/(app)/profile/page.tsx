import { redirect } from "next/navigation";
import { createServerComponentClient } from "../../../lib/supabase/server";
import { signOut } from "../../../lib/actions/auth";
import FadeIn from "../../../components/FadeIn";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createServerComponentClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <main className="min-h-screen pb-6">
      <div className="flex items-center gap-3 pt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accentSoft text-accent">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="mt-1 text-sm text-muted">Manage your SplitSmart account.</p>
        </div>
      </div>

      <FadeIn className="mt-6 space-y-4">
        <div className="card p-5">
          <p className="text-sm text-muted">Username</p>
          <p className="mt-2 text-base font-semibold">{profile?.username ?? "Traveler"}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Email</p>
          <p className="mt-2 text-base font-semibold">{user?.email ?? ""}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold">About SplitSmart</p>
          <p className="mt-2 text-sm text-muted">
            SplitSmart helps groups split travel costs with clean summaries and easy settlement hints.
          </p>
        </div>
        <form action={signOut}>
          <button className="btn btn-primary w-full pressable" type="submit">
            Sign out
          </button>
        </form>
      </FadeIn>
    </main>
  );
}
