import Link from "next/link";
import { ChevronRight, Compass, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "../../lib/supabase/server";
import FadeIn from "../../components/FadeIn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
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
    <main className="flex min-h-screen flex-col pb-6">
      <div className="pt-6">
        <div>
          <p className="text-sm text-muted">Welcome</p>
          <h1 className="text-xl font-semibold">{profile?.username ?? "Traveler"}</h1>
        </div>
      </div>

      <FadeIn className="mt-6 space-y-4">
        <Link
          href="/trip/create"
          prefetch
          className="card block p-5 pressable pressable-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accentSoft p-3 text-accent">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Create Trip</h2>
                <p className="mt-1 text-sm text-muted">
                  Start a new trip and split expenses with friends.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </div>
        </Link>
        <Link
          href="/trip/join"
          prefetch
          className="card block p-5 pressable pressable-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-accentSoft p-3 text-accent">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Join Trip</h2>
                <p className="mt-1 text-sm text-muted">
                  Join an existing trip using a 6-digit code.
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted" />
          </div>
        </Link>
      </FadeIn>
    </main>
  );
}
