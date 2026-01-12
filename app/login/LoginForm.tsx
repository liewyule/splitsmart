"use client";

import { useFormState } from "react-dom";
import { signIn } from "../../lib/actions/auth";

const initialState = { error: "" };

export default function LoginForm() {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium">
        Email
        <input name="email" type="email" className="input mt-2" required />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input name="password" type="password" className="input mt-2" required />
      </label>
      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button type="submit" className="btn btn-primary w-full">
        Log in
      </button>
    </form>
  );
}
