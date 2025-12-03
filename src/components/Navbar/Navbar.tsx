"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import {
  Menu,
  X,
  Globe,
  User,
  LogOut,
  Recycle,
  Trash2,
  Eye,
  Gift,
  Trophy,
  MessageSquareWarning,
  Zap,
  Bell,
  Package,
  ShoppingBag,
  BarChart3,
  Award,
  FileText,
  Flag,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const isCollector = user?.user_type === "collector";
  const isAdmin = user?.user_type === "admin";
  const isKabadiwala = user?.user_type === "kabadiwala";

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper to render role-based nav links
  const renderNavLinks = () => {
    if (!user) return null;
    switch (user.user_type) {
      case "citizen":
        return (
          <>
            <li>
              <Link href="/user/ReportWaste" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Trash2 className="w-4 h-4" />Report Waste</Link>
            </li>
            <li>
              <Link href="/user/listings" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Eye className="w-4 h-4" />Listings</Link>
            </li>
            <li>
              <Link href="/user/my-listings" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Recycle className="w-4 h-4" />My Listings</Link>
            </li>
            {/* Rewards page does not exist */}
            <li>
              <Link href="/user/leaderboard" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Trophy className="w-4 h-4" />Leaderboard</Link>
            </li>
            <li>
              <Link href="/user/complain" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><MessageSquareWarning className="w-4 h-4" />Complain</Link>
            </li>
          </>
        );
      case "kabadiwala":
        return (
          <>
            <li>
              <Link href="/kabadiwala/my-bids" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Eye className="w-4 h-4" />My Bids</Link>
            </li>
            <li>
              <Link href="/kabadiwala/listings" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Recycle className="w-4 h-4" />Available Pickups</Link>
            </li>
            {/* Bidding History page does not exist */}
          </>
        );
      case "admin":
        return (
          <>
            <li>
              <Link href="/admin" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Eye className="w-4 h-4" />Admin Panel</Link>
            </li>
            {/* Dashboard, Reviews, Heatmap pages do not exist */}
          </>
        );
      case "collector":
        return (
          <>
            <li>
              <Link href="/collector/my-quests" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Trash2 className="w-4 h-4" />My Quests</Link>
            </li>
            <li>
              <Link href="/collector/workload" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Zap className="w-4 h-4" />Workload</Link>
            </li>
            <li>
              <Link href="/user/leaderboard" className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"><Trophy className="w-4 h-4" />Leaderboard</Link>
            </li>
          </>
        )
      default:
        return null;
    }
  };

  return (
    <header className="w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <nav
        className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between fade-in"
        style={{ animationPlayState: "running" }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="ZeroBin Logo"
            width={64}
            height={64}
            className="group-hover:scale-110 transition-transform duration-300"
          />
          <span className="text-2xl font-medium tracking-tight text-slate-900">
            ZeroBin
          </span>
        </a>
        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-900">
          {isAdmin ? (
            <>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/informatics"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Informatics
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/reports"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/flag"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Flag className="w-4 h-4" />
                  Flags
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/binlevel"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Bin Level
                </Link>
              </li>
              
            </>
          ) : isCollector ? (
            <>
              <li>
                <Link
                  href="/collector/dashboard"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/collector/notifications"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Link>
              </li>
              <li>
                <Link
                  href="/collector/reports"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Reports
                </Link>
              </li>
            </>
          ) : isKabadiwala ? (
            <>
              <li>
                <Link
                  href="/kabadiwala/listings"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Available Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/kabadiwala/my-bids"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  My Bids
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/user/ReportWaste"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Report Waste
                </Link>
              </li>
              <li>
                <Link
                  href="/user/showreports"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  All Reports
                </Link>
              </li>
              <li>
                <Link
                  href="/user/listings"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/user/my-listings"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  My Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/user/pickup"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  View Bids
                </Link>
              </li>
              <li>
                <Link
                  href="/user/badges/my-badges"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Badges
                </Link>
              </li>
              <li>
                <Link
                  href="/user/complain"
                  className="hover:text-green-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Complain
                </Link>
              </li>
              
            </>
          )}
        </ul>
        {/* Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-sm font-medium border-r border-slate-200 pr-4">
            <button
              onClick={() => setLanguage("en")}
              className={`hover:text-green-600 transition-colors duration-200 flex items-center gap-1 ${language === "en"
                  ? "text-green-600 font-semibold"
                  : "text-slate-600"
                }`}
            >
              <Globe className="w-4 h-4" />
              EN
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setLanguage("bn")}
              className={`hover:text-green-600 transition-colors duration-200 ${language === "bn"
                  ? "text-green-600 font-semibold"
                  : "text-slate-600"
                }`}
            >
              BN
            </button>
          </div>
          {/* Auth Actions */}
          {!user ? (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-lucide="log-in"
                  className="lucide lucide-log-in w-4 h-4"
                >
                  <path d="m10 17 5-5-5-5" />
                  <path d="M15 12H3" />
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                </svg>{" "}
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-linear-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  data-lucide="user-plus"
                  className="lucide lucide-user-plus w-4 h-4"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx={9} cy={7} r={4} />
                  <line x1={19} x2={19} y1={8} y2={14} />
                  <line x1={22} x2={16} y1={11} y2={11} />
                </svg>{" "}
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpenUserMenu((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-linear-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
              >
                <User className="w-4 h-4" />
                {user.full_name}
              </button>
              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setOpenUserMenu(false)}
                  >
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={() => {
                      setOpenUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Mobile Menu Button */}
          <button
            id="menuBtn"
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              data-lucide="menu"
              className="lucide lucide-menu w-5 h-5"
            >
              <path d="M4 12h16" />
              <path d="M4 18h16" />
              <path d="M4 6h16" />
            </svg>
          </button>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div
        id="mobileMenu"
        className={`lg:hidden mx-4 pb-4 space-y-3 text-sm font-medium ${isMobileMenuOpen ? "" : "hidden"}`}
      >
        {isAdmin ? (
          <>
            <Link
              href="/admin"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Zap className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/informatics"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <BarChart3 className="w-4 h-4" />
              Informatics
            </Link>
            <Link
              href="/admin/reports"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <FileText className="w-4 h-4" />
              Reports
            </Link>
            <Link
              href="/admin/flags"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Flag className="w-4 h-4" />
              Flags
            </Link>
            <Link
              href="/admin/binlevel"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Trash2 className="w-4 h-4" />
              Bin Level
            </Link>
          </>
        ) : isCollector ? (
          <>
            <Link
              href="/collector/dashboard"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Eye className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/collector/notifications"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </Link>
            <Link
              href="/collector/reports"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Trash2 className="w-4 h-4" />
              Reports
            </Link>
          </>
        ) : isKabadiwala ? (
          <>
            <Link
              href="/kabadiwala/listings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Package className="w-4 h-4" />
              Available Listings
            </Link>
            <Link
              href="/kabadiwala/my-bids"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <ShoppingBag className="w-4 h-4" />
              My Bids
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/user/ReportWaste"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Trash2 className="w-4 h-4" />
              Report Waste
            </Link>
            <Link
              href="/user/listings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Eye className="w-4 h-4" />
              Listings
            </Link>
            <Link
              href="/user/my-listings"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Package className="w-4 h-4" />
              My Listings
            </Link>
            <Link
              href="/user/pickup"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <ShoppingBag className="w-4 h-4" />
              View Bids
            </Link>
            <Link
              href="/user/showreports"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <FileText className="w-4 h-4" />
              All Reports
            </Link>
            <Link
              href="/user/leaderboard"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/user/badges/my-badges"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <Award className="w-4 h-4" />
              Badges
            </Link>
            <Link
              href="/user/complain"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"
            >
              <MessageSquareWarning className="w-4 h-4" />
              Complain
            </Link>
          </>
        )}
        {user && user.user_type === "kabadiwala" && (
          <>
            <Link href="/kabadiwala/my-bids" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"><Eye className="w-4 h-4" />My Bids</Link>
            <Link href="/kabadiwala/listings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"><Recycle className="w-4 h-4" />Available Pickups</Link>
          </>
        )}
        {user && user.user_type === "admin" && (
          <>
            <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"><Eye className="w-4 h-4" />Admin Panel</Link>
          </>
        )}
        {user && user.user_type === "collector" && (
          <>
            <Link href="/collector/my-quests" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"><Trash2 className="w-4 h-4" />My Quests</Link>
            <Link href="/collector/workload" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"><Zap className="w-4 h-4" />Workload</Link>
            <Link href="/user/leaderboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-900"><Trophy className="w-4 h-4" />Leaderboard</Link>
          </>
        )}
      </div>
    </header>
  );
}
