"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getRoleColorClasses, type RoleColorClasses } from "@/utils/roleColors";

interface ThemeContextType {
  colors: RoleColorClasses;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const colors = useMemo(() => {
    return getRoleColorClasses(user?.user_type);
  }, [user?.user_type]);

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
