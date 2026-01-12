"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../../lib/actions/auth";
import InlineSpinner from "../../components/InlineSpinner";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await signIn({}, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      window.location.href = "/";
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" className="input mt-2" required />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" className="input mt-2" required />
      </label>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button type="submit" className="btn btn-primary w-full pressable" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <InlineSpinner />
            Logging in...
          </span>
        ) : (
          "Log in"
        )}
      </button>
    </form>
  );
}
