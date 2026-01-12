"use client";

import type { ReactNode } from "react";

export default function FadeIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`fade-in-up ${className}`.trim()}>{children}</div>;
}
