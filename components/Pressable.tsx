"use client";

import type { ReactNode } from "react";

export default function Pressable({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`pressable ${className}`.trim()}>{children}</div>;
}
