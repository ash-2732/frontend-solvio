"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "bn";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    home: "Home",
    about: "About",
    services: "Services",
    contact: "Contact",
    login: "Login",
    register: "Register",
    logout: "Logout",
    getStarted: "Get Started",
    welcome: "Welcome",
    email: "Email",
    password: "Password",
    name: "Name",
    submit: "Submit",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    heroTitle: "Build faster with Intelligent Solutions",
    heroSubtitle:
      "Solvio empowers your team to create stunning digital experiences with ease.",
    viewDemo: "View Demo",
    // Landing Page
    trustedBy: "Trusted by 500K+ Eco-Conscious Communities",
    heroTitleSmart: "Smart",
    heroTitleWaste: "Waste Management",
    heroTitleReimagined: "Reimagined",
    heroDescription:
      "Experience next-generation waste management with AI-powered collection optimization, real-time tracking, and sustainable recycling solutions for a cleaner tomorrow.",
    startJourney: "Start Your Green Journey",
    watchDemo: "Watch Demo",
    globalPartners: "Global Partners",
    // Features
    whyChoose: "Why Choose",
    whyChooseSubtitle:
      "Revolutionizing waste management with cutting-edge technology and sustainable practices",
    featureSmartDashboard: "Smart Dashboard",
    featureSmartDashboardDesc:
      "Real-time monitoring and analytics to track your waste management efficiency and environmental impact.",
    featureAIRoutes: "AI-Powered Routes",
    featureAIRoutesDesc:
      "Optimized collection routes using machine learning to reduce fuel consumption and carbon footprint.",
    featureAnalytics: "Advanced Analytics",
    featureAnalyticsDesc:
      "Comprehensive insights and reporting to help you make data-driven decisions for sustainability.",
    featureEcoFriendly: "Eco-Friendly",
    featureEcoFriendlyDesc:
      "Promote recycling and reduce landfill waste with our intelligent sorting and tracking system.",
    featureCostSavings: "Cost Savings",
    featureCostSavingsDesc:
      "Reduce operational costs by up to 40% with optimized routes and efficient resource allocation.",
    featureCommunity: "Community Driven",
    featureCommunityDesc:
      "Engage communities with gamification, rewards, and educational programs for better participation.",
    // How It Works
    howItWorks: "How It Works",
    howItWorksSubtitle: "Get started in three simple steps",
    step1Title: "Sign Up",
    step1Desc:
      "Create your account in minutes and set up your waste management profile with your specific needs.",
    step2Title: "Schedule",
    step2Desc:
      "Set up automated collection schedules or request on-demand pickups through our intuitive platform.",
    step3Title: "Track & Optimize",
    step3Desc:
      "Monitor your waste reduction progress and receive AI-powered recommendations for improvement.",
    // Stats
    activeUsers: "Active Users",
    tonsRecycled: "Tons Recycled",
    costReduction: "Cost Reduction",
    citiesCovered: "Cities Covered",
  },
  bn: {
    home: "হোম",
    about: "সম্পর্কে",
    services: "সেবাসমূহ",
    contact: "যোগাযোগ",
    login: "লগইন",
    register: "নিবন্ধন",
    logout: "লগআউট",
    getStarted: "শুরু করুন",
    welcome: "স্বাগতম",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    name: "নাম",
    submit: "জমা দিন",
    dontHaveAccount: "অ্যাকাউন্ট নেই?",
    alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে?",
    heroTitle: "বুদ্ধিমান সমাধানের সাথে দ্রুত তৈরি করুন",
    heroSubtitle:
      "সলভিও আপনার দলকে সহজে অত্যাশ্চর্য ডিজিটাল অভিজ্ঞতা তৈরি করতে সক্ষম করে।",
    viewDemo: "ডেমো দেখুন",
    // Landing Page
    trustedBy: "৫ লক্ষ+ পরিবেশ সচেতন সম্প্রদায়ের বিশ্বাসী",
    heroTitleSmart: "স্মার্ট",
    heroTitleWaste: "বর্জ্য ব্যবস্থাপনা",
    heroTitleReimagined: "পুনর্কল্পিত",
    heroDescription:
      "এআই-চালিত সংগ্রহ অপ্টিমাইজেশন, রিয়েল-টাইম ট্র্যাকিং এবং একটি পরিচ্ছন্ন আগামীর জন্য টেকসই পুনর্ব্যবহার সমাধান সহ পরবর্তী প্রজন্মের বর্জ্য ব্যবস্থাপনার অভিজ্ঞতা নিন।",
    startJourney: "আপনার সবুজ যাত্রা শুরু করুন",
    watchDemo: "ডেমো দেখুন",
    globalPartners: "বৈশ্বিক অংশীদার",
    // Features
    whyChoose: "কেন বেছে নেবেন",
    whyChooseSubtitle:
      "অত্যাধুনিক প্রযুক্তি এবং টেকসই অনুশীলনের সাথে বর্জ্য ব্যবস্থাপনায় বিপ্লব",
    featureSmartDashboard: "স্মার্ট ড্যাশবোর্ড",
    featureSmartDashboardDesc:
      "আপনার বর্জ্য ব্যবস্থাপনা দক্ষতা এবং পরিবেশগত প্রভাব ট্র্যাক করতে রিয়েল-টাইম মনিটরিং এবং বিশ্লেষণ।",
    featureAIRoutes: "এআই-চালিত রুট",
    featureAIRoutesDesc:
      "জ্বালানী খরচ এবং কার্বন পদচিহ্ন কমাতে মেশিন লার্নিং ব্যবহার করে অপ্টিমাইজড সংগ্রহ রুট।",
    featureAnalytics: "উন্নত বিশ্লেষণ",
    featureAnalyticsDesc:
      "টেকসইতার জন্য ডেটা-চালিত সিদ্ধান্ত নিতে সাহায্য করার জন্য ব্যাপক অন্তর্দৃষ্টি এবং রিপোর্টিং।",
    featureEcoFriendly: "পরিবেশ বান্ধব",
    featureEcoFriendlyDesc:
      "আমাদের বুদ্ধিমান বাছাই এবং ট্র্যাকিং সিস্টেমের সাথে পুনর্ব্যবহার প্রচার এবং ল্যান্ডফিল বর্জ্য হ্রাস করুন।",
    featureCostSavings: "খরচ সাশ্রয়",
    featureCostSavingsDesc:
      "অপ্টিমাইজড রুট এবং দক্ষ সম্পদ বরাদ্দের মাধ্যমে ৪০% পর্যন্ত পরিচালন খরচ কমান।",
    featureCommunity: "সম্প্রদায় চালিত",
    featureCommunityDesc:
      "ভাল অংশগ্রহণের জন্য গ্যামিফিকেশন, পুরস্কার এবং শিক্ষামূলক প্রোগ্রামের সাথে সম্প্রদায়কে জড়িত করুন।",
    // How It Works
    howItWorks: "এটি কীভাবে কাজ করে",
    howItWorksSubtitle: "তিনটি সহজ ধাপে শুরু করুন",
    step1Title: "সাইন আপ করুন",
    step1Desc:
      "মিনিটের মধ্যে আপনার অ্যাকাউন্ট তৈরি করুন এবং আপনার নির্দিষ্ট প্রয়োজনের সাথে আপনার বর্জ্য ব্যবস্থাপনা প্রোফাইল সেট আপ করুন।",
    step2Title: "সময়সূচী",
    step2Desc:
      "আমাদের স্বজ্ঞাত প্ল্যাটফর্মের মাধ্যমে স্বয়ংক্রিয় সংগ্রহের সময়সূচী সেট আপ করুন বা অন-ডিমান্ড পিকআপের অনুরোধ করুন।",
    step3Title: "ট্র্যাক এবং অপ্টিমাইজ করুন",
    step3Desc:
      "আপনার বর্জ্য হ্রাস অগ্রগতি নিরীক্ষণ করুন এবং উন্নতির জন্য এআই-চালিত সুপারিশ পান।",
    // Stats
    activeUsers: "সক্রিয় ব্যবহারকারী",
    tonsRecycled: "টন পুনর্ব্যবহৃত",
    costReduction: "খরচ হ্রাস",
    citiesCovered: "শহর কভার করা হয়েছে",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
