"use client";

import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import FloatingChatbot from "@/components/FloatingChatbot";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Hide navbar and chatbot on login, register, and confirmation pages
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/confirmation";

  const hideChatbot =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/confirmation";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased text-slate-900`}
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      >
        {/* Global background gradient and animated orbs */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-green-50 via-emerald-50 to-teal-50" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* App content above background */}
        <div className="relative min-h-screen flex flex-col z-10">
          <AuthProvider>
            <LanguageProvider>
              {!hideNavbar && <Navbar />}
              <main className="flex-1">{children}</main>
              {!hideChatbot && <FloatingChatbot />}
              <Toaster position="top-right" gutter={8} />
            </LanguageProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
