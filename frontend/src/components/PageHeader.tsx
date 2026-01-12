"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  rightSlot?: ReactNode;
}

export default function PageHeader({ title, backHref, rightSlot }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-mist">
      <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="h-9 w-16 rounded-full border border-mist flex items-center justify-center text-xs"
            >
              Back
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="h-9 w-16 rounded-full border border-mist flex items-center justify-center text-xs"
            >
              Back
            </button>
          )}
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </div>
        {rightSlot}
      </div>
    </div>
  );
}
