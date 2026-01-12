import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="page-container flex min-h-screen flex-col pb-16">
      <div className="pt-16">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-muted">Start splitting with friends in minutes.</p>
      </div>
      <div className="mt-10">
        <SignupForm />
      </div>
      <p className="mt-8 text-center text-sm text-muted">
        Already have an account? <Link className="link" href="/login">Log in</Link>
      </p>
    </main>
  );
}
