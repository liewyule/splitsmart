"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary w-full" type="submit" disabled={pending}>
      {pending ? "Please wait..." : label}
    </button>
  );
}
