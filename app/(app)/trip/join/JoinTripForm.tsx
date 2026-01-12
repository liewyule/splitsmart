"use client";

import { useFormState } from "react-dom";
import { joinTripAction, lookupTripAction } from "../../../../lib/actions/trips";
import SubmitButton from "../../../../components/SubmitButton";

const initialState = { error: "" as string, trip: undefined as undefined | { id: string; name: string; code: string } };

export default function JoinTripForm() {
  const [state, formAction] = useFormState(lookupTripAction, initialState);
  const [joinState, joinAction] = useFormState(joinTripAction, { error: "" });

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <label className="block text-sm font-medium">
          Trip code
          <input
            name="code"
            type="text"
            className="input mt-2 tracking-[0.3em]"
            placeholder="123456"
            maxLength={6}
            required
          />
        </label>
        {state?.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
        <SubmitButton label="Find trip" />
      </form>

      {state.trip ? (
        <div className="card p-6">
          <p className="text-sm text-muted">Found trip</p>
          <h3 className="mt-2 text-lg font-semibold">{state.trip.name}</h3>
          <p className="mt-1 text-sm text-muted">Code {state.trip.code}</p>
          <form action={joinAction} className="mt-4">
            <input type="hidden" name="code" value={state.trip.code} />
            {joinState?.error ? (
              <p className="mb-2 text-sm text-rose-600">{joinState.error}</p>
            ) : null}
            <SubmitButton label="Join trip" />
          </form>
        </div>
      ) : null}
    </div>
  );
}
