"use client";
import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  allowedUserTypes?: string[];
}

export default function ProtectedRoute({ children, allowedUserTypes }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && allowedUserTypes && !allowedUserTypes.includes(user.user_type)) {
      router.replace("/");
    }
  }, [loading, user, router, allowedUserTypes]);

  // For smoother transitions: don't block render with a spinner during loading.
  if (loading) return null;
  if (!user) return null;
  if (allowedUserTypes && !allowedUserTypes.includes(user.user_type)) return null;

  return <>{children}</>;
}
