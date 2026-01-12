import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="page-container flex min-h-screen flex-col pb-16">
      <div className="pt-16">
        <h1 className="text-xl font-semibold">Welcome back</h1>
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
