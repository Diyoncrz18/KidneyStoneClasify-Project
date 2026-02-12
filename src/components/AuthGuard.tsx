"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isAuthPage = pathname.startsWith("/auth");
    const isPublicPage = pathname.startsWith("/landing") || pathname === "/";
    const storedUser = window.localStorage.getItem("kidney_user");

    if (!storedUser && !isAuthPage && !isPublicPage) {
      router.replace("/landing");
      setChecking(false);
      return;
    }

    if (storedUser && isAuthPage) {
      router.replace("/dashboard");
      setChecking(false);
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-text-dark">
        <span>Memuat...</span>
      </div>
    );
  }

  return <>{children}</>;
}
