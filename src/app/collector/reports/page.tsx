"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CollectorReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.user_type !== "collector") {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) return null;
  if (!user || user.user_type !== "collector") return null;

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
        <p className="text-slate-600 mt-2">Coming soon: reports assigned to you and nearby reports.</p>
      </div>
    </ProtectedRoute>
  );
}
