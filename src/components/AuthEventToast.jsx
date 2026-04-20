"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AuthEventToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const authEvent = searchParams.get("auth_event");

    if (authEvent === "signup") {
      toast.success("Account created successfully!", {
        duration: 3000,
      });
      // Clean up URL
      router.replace("/", { scroll: false });
    } else if (authEvent === "login") {
      toast.success("Welcome back!", {
        duration: 3000,
      });
      // Clean up URL
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}
