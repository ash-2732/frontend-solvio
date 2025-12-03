"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Trophy,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
  Sparkles,
  Target,
  Calendar,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/config";

type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  awarded_at: string;
};

type UserBadgesResponse = {
  user_id: string;
  full_name: string;
  user_type: string;
  reputation_score: number;
  total_transactions: number;
  badges: Badge[];
};

type BadgeCriteria = {
  [key: string]: {
    description: string;
    type: string;
  };
};

export default function MyBadges() {
  const { token } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadgesResponse | null>(null);
  const [badgeCriteria, setBadgeCriteria] = useState<BadgeCriteria>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user badges
        const badgesRes = await fetch(`${API_BASE_URL}/badges/my-badges`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        });

        const badgesCt = badgesRes.headers.get("content-type") || "";
        const badgesBody = await badgesRes.text();

        if (!badgesRes.ok) throw new Error(badgesBody || `HTTP ${badgesRes.status}`);
        if (!badgesCt.includes("application/json"))
          throw new Error(badgesBody.slice(0, 200));

        const badgesData = JSON.parse(badgesBody) as UserBadgesResponse;

        // Fetch badge criteria
        const criteriaRes = await fetch(`${API_BASE_URL}/badges/criteria`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        });

        const criteriaCt = criteriaRes.headers.get("content-type") || "";
        const criteriaBody = await criteriaRes.text();

        if (!criteriaRes.ok) throw new Error(criteriaBody || `HTTP ${criteriaRes.status}`);
        if (!criteriaCt.includes("application/json"))
          throw new Error(criteriaBody.slice(0, 200));

        const criteriaData = JSON.parse(criteriaBody) as BadgeCriteria;

        if (!cancelled) {
          setUserBadges(badgesData);
          setBadgeCriteria(criteriaData);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load badges");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case "e_waste_pro":
        return "💻";
      case "organic_hero":
        return "🌱";
      case "top_collector":
        return "🏆";
      case "trusted_kabadiwala":
        return "⭐";
      case "recycling_champion":
        return "♻️";
      case "verified_seller":
        return "✅";
      default:
        return "🎖️";
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case "e_waste_pro":
        return "from-blue-400 to-blue-600";
      case "organic_hero":
        return "from-green-400 to-green-600";
      case "top_collector":
        return "from-yellow-400 to-amber-600";
      case "trusted_kabadiwala":
        return "from-purple-400 to-purple-600";
      case "recycling_champion":
        return "from-emerald-400 to-emerald-600";
      case "verified_seller":
        return "from-pink-400 to-pink-600";
      default:
        return "from-slate-400 to-slate-600";
    }
  };

  const formatBadgeName = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const earnedBadgeTypes = new Set(
    userBadges?.badges.map((b) => b.badge_type) || []
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 sm:py-12 bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  My Badges
                </h1>
                <p className="text-sm text-slate-500">
                  Showcase your achievements and unlock new badges
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
              <p className="text-slate-600">Loading badges...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    Error Loading Badges
                  </h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && userBadges && (
            <>
              {/* User Stats Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">
                      {userBadges.badges.length}
                    </h3>
                    <p className="text-slate-600 text-sm">Badges Earned</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">
                      {userBadges.reputation_score}
                    </h3>
                    <p className="text-slate-600 text-sm">Reputation Score</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">
                      {Object.keys(badgeCriteria).length - userBadges.badges.length}
                    </h3>
                    <p className="text-slate-600 text-sm">Badges to Unlock</p>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">
                      {userBadges.total_transactions}
                    </h3>
                    <p className="text-slate-600 text-sm">Total Transactions</p>
                  </div>
                </div>
              </div>

              {/* Earned Badges Section */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Your Earned Badges
                  </h2>
                </div>

                {userBadges.badges.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
                    <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                      No Badges Yet
                    </h3>
                    <p className="text-slate-500">
                      Complete challenges below to earn your first badge!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userBadges.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-slate-200 relative overflow-hidden group"
                      >
                        <div className="relative">
                          <div
                            className={`w-20 h-20 bg-linear-to-br ${getBadgeColor(
                              badge.badge_type
                            )} rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm`}
                          >
                            {getBadgeIcon(badge.badge_type)}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2 text-center">
                            {formatBadgeName(badge.badge_type)}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3 text-center leading-relaxed">
                            {badgeCriteria[badge.badge_type]?.description ||
                              "Achievement unlocked!"}
                          </p>
                          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg py-2 px-3">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Earned {formatDate(badge.awarded_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Badges Section */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center text-white shadow-sm">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    Badges to Unlock
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(badgeCriteria)
                    .filter(([type]) => !earnedBadgeTypes.has(type))
                    .map(([type, criteria]) => (
                      <div
                        key={type}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-slate-200 relative opacity-70 hover:opacity-100"
                      >
                        <div className="relative">
                          <div
                            className={`w-20 h-20 bg-linear-to-br ${getBadgeColor(
                              type
                            )} rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl shadow-sm relative`}
                          >
                            {getBadgeIcon(type)}
                            {/* Lock overlay */}
                            <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
                              <Lock className="w-7 h-7 text-white" />
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-3 text-center">
                            {formatBadgeName(type)}
                          </h3>
                          <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200">
                            <p className="text-sm text-slate-700 text-center leading-relaxed">
                              {criteria.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-center">
                            <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                              🎯 Keep going to unlock!
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
