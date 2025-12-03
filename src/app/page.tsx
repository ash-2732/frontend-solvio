"use client";

import {
  ArrowRight,
  LayoutDashboard,
  Truck,
  BarChart3,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
  <div className="relative min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated Background Orbs - Behind all content */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* All existing content - unchanged */}
      <div className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="flex-1 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-24 flex flex-col items-center justify-center text-center relative min-h-[80vh]">
            {/* Left Content */}
            <div
              className="slide-in-left"
              style={{ animationPlayState: "running" }}
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-medium mb-6 fade-in"
                style={{ animationPlayState: "running" }}
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
                  className="w-4 h-4"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
                <span>{t("trustedBy")}</span>
              </div>
              <h1 className="sm:text-5xl lg:text-6xl xl:text-7xl leading-tight fade-in-delay-1 text-4xl font-normal tracking-tighter mb-6">
                <span className="bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t("heroTitleSmart")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                </span>
                <br />
                <span className="text-slate-900">{t("heroTitleWaste")}</span>
                <br />
                <span className="text-slate-600">
                  {t("heroTitleReimagined")}
                </span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed fade-in-delay-2">
                {t("heroDescription")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 fade-in-delay-3">
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  <ArrowRight className="w-5 h-5" />
                  {t("startJourney")}
                </button>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-300">
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
                    className="w-5 h-5"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  {t("watchDemo")}
                </button>
              </div>
              {/* Enhanced Partners Section */}
              <div className="space-y-6 fade-in-delay-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {t("globalPartners")}
                  </h3>
                  <div className="flex-1 h-px bg-linear-to-r from-slate-200 to-transparent" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 items-center">
                  <div className="flex items-center justify-center p-4 rounded-lg bg-white border border-slate-100 hover:border-green-200 transition-colors duration-200">
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
                      className="w-6 h-6 text-green-500"
                    >
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                      <path d="M10 6h4" />
                      <path d="M10 10h4" />
                      <path d="M10 14h4" />
                      <path d="M10 18h4" />
                    </svg>
                    <span className="ml-2 font-semibold text-slate-600">
                      EcoCity
                    </span>
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-lg bg-white border border-slate-100 hover:border-green-200 transition-colors duration-200">
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
                      className="w-6 h-6 text-green-500"
                    >
                      <path d="M10 18v-7" />
                      <path d="M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z" />
                      <path d="M14 18v-7" />
                      <path d="M18 18v-7" />
                      <path d="M3 22h18" />
                      <path d="M6 18v-7" />
                    </svg>
                    <span className="ml-2 font-semibold text-slate-600">
                      GreenGov
                    </span>
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-lg bg-white border border-slate-100 hover:border-green-200 transition-colors duration-200">
                    <Truck className="w-6 h-6 text-green-500" />
                    <span className="ml-2 font-semibold text-slate-600">
                      WasteX
                    </span>
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-lg bg-white border border-slate-100 hover:border-green-200 transition-colors duration-200">
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
                      className="w-6 h-6 text-green-500"
                    >
                      <path d="M7 10v12" />
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                    </svg>
                    <span className="ml-2 font-semibold text-slate-600">
                      RecycleHub
                    </span>
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-lg bg-white border border-slate-100 hover:border-green-200 transition-colors duration-200">
                    <Leaf className="w-6 h-6 text-green-500" />
                    <span className="ml-2 font-semibold text-slate-600">
                      EarthCare
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
  <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                {t("whyChoose")} <span className="text-green-600">ZeroBin</span>
                ?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {t("whyChooseSubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t("featureSmartDashboard")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("featureSmartDashboardDesc")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t("featureAIRoutes")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("featureAIRoutesDesc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t("featureAnalytics")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("featureAnalyticsDesc")}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t("featureEcoFriendly")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("featureEcoFriendlyDesc")}
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-7 h-7 text-white"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t("featureCostSavings")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("featureCostSavingsDesc")}
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-8 rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-7 h-7 text-white"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {t("featureCommunity")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("featureCommunityDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
  <section className="py-20 bg-linear-to-br from-slate-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                {t("howItWorks").split(" ")[0]} {t("howItWorks").split(" ")[1]}{" "}
                <span className="text-green-600">
                  {t("howItWorks").split(" ")[2]}
                </span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                {t("howItWorksSubtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-linear-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute top-10 left-1/2 w-full h-0.5 bg-green-200 -z-10 hidden md:block"></div>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t("step1Title")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("step1Desc")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-linear-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute top-10 left-1/2 w-full h-0.5 bg-green-200 -z-10 hidden md:block"></div>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t("step2Title")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("step2Desc")}
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-linear-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  {t("step3Title")}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {t("step3Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
  <section className="py-20 bg-linear-to-r from-green-600 to-emerald-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-white mb-2">500K+</div>
                <div className="text-green-100 text-lg">{t("activeUsers")}</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">2M+</div>
                <div className="text-green-100 text-lg">
                  {t("tonsRecycled")}
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">40%</div>
                <div className="text-green-100 text-lg">
                  {t("costReduction")}
                </div>
              </div>
              <div>
                <div className="text-5xl font-bold text-white mb-2">150+</div>
                <div className="text-green-100 text-lg">
                  {t("citiesCovered")}
                </div>
              </div>
            </div>
          </div>
        </section>
  </div>
  </div>
  );
}
