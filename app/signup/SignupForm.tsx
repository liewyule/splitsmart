"use client";

import { useState, useTransition } from "react";
import { signUp } from "../../lib/actions/auth";
import InlineSpinner from "../../components/InlineSpinner";

export default function SignupForm() {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await signUp({}, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.needsEmailConfirmation) {
        setNotice("Check your email to confirm your account, then log in.");
        return;
      }
      window.location.replace("/");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium">
        Username
        <input name="username" type="text" className="input mt-2" required />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" className="input mt-2" required />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" className="input mt-2" required />
      </label>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
      <button type="submit" className="btn btn-primary w-full pressable" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <InlineSpinner />
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}
