"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy hash links → dedicated My Learning page. */
export function DashboardHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash === "#my-courses") {
      router.replace("/my-learning");
    }
  }, [router]);

  return null;
}
