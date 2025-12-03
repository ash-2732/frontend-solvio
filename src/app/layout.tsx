"use client";

import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";
import ThemedBackground from "@/components/ThemedBackground";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
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

  // Hide navbar, footer and chatbot on login, register, and confirmation pages
  const hideNavbar =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/confirmation";

  const hideFooter =
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
        {/* App content above background */}
        <div className="relative min-h-screen flex flex-col z-10">
          <AuthProvider>
            <LanguageProvider>
              <ThemeProvider>
                {/* Global background gradient and animated orbs */}
                <ThemedBackground />

                {!hideNavbar && <Navbar />}
                <main className="flex-1">{children}</main>
                {!hideFooter && <Footer />}
                {!hideChatbot && <FloatingChatbot />}
                <Toaster position="top-right" gutter={8} />
              </ThemeProvider>
            </LanguageProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
