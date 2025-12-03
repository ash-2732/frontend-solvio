export type UserType = "citizen" | "admin" | "kabadiwala" | "collector" | null | undefined;

export interface RoleColorClasses {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;

  // Gradient backgrounds
  bgGradient: string;
  bgGradientLight: string;

  // Page backgrounds
  pageBg: string;
  pageBgGradient: string;

  // Animated orbs
  orb1: string;
  orb2: string;
  orb3: string;

  // Feature cards
  featureCardBg: string;
  featureCardBorder: string;
  featureIconBg: string;

  // Stats section
  statsBg: string;

  // Text colors
  textPrimary: string;
  textLight: string;
  textMuted: string;

  // Border colors
  border: string;
  borderLight: string;

  // Icon and accent colors
  iconColor: string;
  accentColor: string;

  // Button colors
  buttonBg: string;
  buttonBgHover: string;
  buttonText: string;
}

export function getRoleColorClasses(userType: UserType): RoleColorClasses {
  switch (userType) {
    case "citizen":
      return {
        primary: "text-green-600",
        primaryHover: "hover:text-green-600",
        primaryLight: "text-green-500",
        primaryDark: "text-green-700",

        bgGradient: "bg-gradient-to-br from-green-900 via-green-800 to-green-900",
        bgGradientLight: "bg-gradient-to-r from-green-600 to-emerald-600",

        pageBg: "bg-green-50",
        pageBgGradient: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",

        orb1: "bg-green-200",
        orb2: "bg-emerald-200",
        orb3: "bg-teal-200",

        featureCardBg: "bg-gradient-to-br from-green-50 to-emerald-50",
        featureCardBorder: "border-green-100",
        featureIconBg: "bg-gradient-to-br from-green-600 to-emerald-600",

        statsBg: "bg-gradient-to-r from-green-600 to-emerald-600",

        textPrimary: "text-green-600",
        textLight: "text-green-200",
        textMuted: "text-green-300",

        border: "border-green-700",
        borderLight: "border-green-200",

        iconColor: "text-green-400",
        accentColor: "bg-green-600",

        buttonBg: "bg-gradient-to-r from-green-600 to-emerald-600",
        buttonBgHover: "hover:from-green-700 hover:to-emerald-700",
        buttonText: "text-white"
      };

    case "admin":
      return {
        primary: "text-red-600",
        primaryHover: "hover:text-red-600",
        primaryLight: "text-red-500",
        primaryDark: "text-red-700",

        bgGradient: "bg-gradient-to-br from-red-900 via-red-800 to-red-900",
        bgGradientLight: "bg-gradient-to-r from-red-600 to-rose-600",

        pageBg: "bg-red-50",
        pageBgGradient: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50",

        orb1: "bg-red-200",
        orb2: "bg-rose-200",
        orb3: "bg-pink-200",

        featureCardBg: "bg-gradient-to-br from-red-50 to-rose-50",
        featureCardBorder: "border-red-100",
        featureIconBg: "bg-gradient-to-br from-red-600 to-rose-600",

        statsBg: "bg-gradient-to-r from-red-600 to-rose-600",

        textPrimary: "text-red-600",
        textLight: "text-red-200",
        textMuted: "text-red-300",

        border: "border-red-700",
        borderLight: "border-red-200",

        iconColor: "text-red-400",
        accentColor: "bg-red-600",

        buttonBg: "bg-gradient-to-r from-red-600 to-rose-600",
        buttonBgHover: "hover:from-red-700 hover:to-rose-700",
        buttonText: "text-white"
      };

    case "kabadiwala":
      return {
        primary: "text-blue-600",
        primaryHover: "hover:text-blue-600",
        primaryLight: "text-blue-500",
        primaryDark: "text-blue-700",

        bgGradient: "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900",
        bgGradientLight: "bg-gradient-to-r from-blue-600 to-cyan-600",

        pageBg: "bg-blue-50",
        pageBgGradient: "bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50",

        orb1: "bg-blue-200",
        orb2: "bg-cyan-200",
        orb3: "bg-sky-200",

        featureCardBg: "bg-gradient-to-br from-blue-50 to-cyan-50",
        featureCardBorder: "border-blue-100",
        featureIconBg: "bg-gradient-to-br from-blue-600 to-cyan-600",

        statsBg: "bg-gradient-to-r from-blue-600 to-cyan-600",

        textPrimary: "text-blue-600",
        textLight: "text-blue-200",
        textMuted: "text-blue-300",

        border: "border-blue-700",
        borderLight: "border-blue-200",

        iconColor: "text-blue-400",
        accentColor: "bg-blue-600",

        buttonBg: "bg-gradient-to-r from-blue-600 to-cyan-600",
        buttonBgHover: "hover:from-blue-700 hover:to-cyan-700",
        buttonText: "text-white"
      };

    case "collector":
      return {
        primary: "text-orange-600",
        primaryHover: "hover:text-orange-600",
        primaryLight: "text-orange-500",
        primaryDark: "text-orange-700",

        bgGradient: "bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900",
        bgGradientLight: "bg-gradient-to-r from-orange-600 to-amber-600",

        pageBg: "bg-orange-50",
        pageBgGradient: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",

        orb1: "bg-orange-200",
        orb2: "bg-amber-200",
        orb3: "bg-yellow-200",

        featureCardBg: "bg-gradient-to-br from-orange-50 to-amber-50",
        featureCardBorder: "border-orange-100",
        featureIconBg: "bg-gradient-to-br from-orange-600 to-amber-600",

        statsBg: "bg-gradient-to-r from-orange-600 to-amber-600",

        textPrimary: "text-orange-600",
        textLight: "text-orange-200",
        textMuted: "text-orange-300",

        border: "border-orange-700",
        borderLight: "border-orange-200",

        iconColor: "text-orange-400",
        accentColor: "bg-orange-600",

        buttonBg: "bg-gradient-to-r from-orange-600 to-amber-600",
        buttonBgHover: "hover:from-orange-700 hover:to-amber-700",
        buttonText: "text-white"
      };

    default:
      // Default to green (citizen) colors for null/undefined
      return {
        primary: "text-green-600",
        primaryHover: "hover:text-green-600",
        primaryLight: "text-green-500",
        primaryDark: "text-green-700",

        bgGradient: "bg-gradient-to-br from-green-900 via-green-800 to-green-900",
        bgGradientLight: "bg-gradient-to-r from-green-600 to-emerald-600",

        pageBg: "bg-green-50",
        pageBgGradient: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50",

        orb1: "bg-green-200",
        orb2: "bg-emerald-200",
        orb3: "bg-teal-200",

        featureCardBg: "bg-gradient-to-br from-green-50 to-emerald-50",
        featureCardBorder: "border-green-100",
        featureIconBg: "bg-gradient-to-br from-green-600 to-emerald-600",

        statsBg: "bg-gradient-to-r from-green-600 to-emerald-600",

        textPrimary: "text-green-600",
        textLight: "text-green-200",
        textMuted: "text-green-300",

        border: "border-green-700",
        borderLight: "border-green-200",

        iconColor: "text-green-400",
        accentColor: "bg-green-600",

        buttonBg: "bg-gradient-to-r from-green-600 to-emerald-600",
        buttonBgHover: "hover:from-green-700 hover:to-emerald-700",
        buttonText: "text-white"
      };
  }
}
