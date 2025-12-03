"use client";

import { useAuth } from "@/context/AuthContext";
import { getRoleColorClasses } from "@/utils/roleColors";

export default function ThemedBackground() {
  const { user } = useAuth();
  const colors = getRoleColorClasses(user?.user_type);

  return (
    <div className="fixed inset-0 -z-10">
      <div className={`absolute inset-0 ${colors.pageBgGradient}`} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-10 w-72 h-72 ${colors.orb1} rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob`}></div>
        <div className={`absolute top-40 right-10 w-72 h-72 ${colors.orb2} rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000`}></div>
        <div className={`absolute bottom-20 left-1/2 w-72 h-72 ${colors.orb3} rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000`}></div>
      </div>
    </div>
  );
}
