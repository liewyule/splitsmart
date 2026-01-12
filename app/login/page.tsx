import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pb-16">
      <div className="pt-16">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">Log in to view your trip.</p>
      </div>
      <div className="mt-10">
        <LoginForm />
      </div>
      <p className="mt-8 text-center text-sm text-muted">
        New here? <Link className="link" href="/signup">Create an account</Link>
      </p>
    </main>
  );
}
