"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "splitsmart-username";

export const getStoredUsername = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
};

export const setStoredUsername = (username: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, username);
};

export const clearStoredUsername = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

export const useRequireUser = () => {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUsername();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUsername(stored);
  }, [router]);

  return username;
};
