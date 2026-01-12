"use client";

import { useFormState } from "react-dom";
import { createTripAction } from "../../../lib/actions/trips";

const initialState = { error: "" };

export default function CreateTripForm() {
  const [state, formAction] = useFormState(createTripAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium">
        Trip name
        <input name="name" type="text" className="input mt-2" placeholder="Italy 2026" required />
      </label>
      {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <button type="submit" className="btn btn-primary w-full">
        Create trip
      </button>
    </form>
  );
}
