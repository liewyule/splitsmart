"use client";

import { useFormStatus } from "react-dom";
import InlineSpinner from "./InlineSpinner";

export default function SubmitButton({
  label,
  pendingLabel = "Please wait..."
}: {
  label: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary w-full pressable" type="submit" disabled={pending}>
      {pending ? (
        <span className="flex items-center gap-2">
          <InlineSpinner />
          {pendingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
