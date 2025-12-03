"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-hot-toast";
import {
  Trophy,
  Shield,
  RefreshCcw,
  AlertCircle,
  Smartphone,
  Laptop,
  Package,
  TrendingUp,
  DollarSign,
  BarChart3,
  Award,
  Crown,
  Medal,
  Star,
  Zap,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  user: {
    id: string;
    full_name: string;
    user_type: string;
    reputation_score: number;
    is_sponsor: boolean;
  };
  quests_completed: number;
  total_bounty_earned: number;
  badges_count: number;
};

type EWasteAnalytics = {
  total_listings: number;
  active_listings: number;
  completed_listings: number;
  device_type_breakdown: Record<string, number>;
  total_estimated_value_min: number;
  total_estimated_value_max: number;
  total_realized_value: number;
  average_listing_value: number;
  recent_listings: Array<{
    id: string;
    device_type: string;
    device_name: string;
    condition: string;
    estimated_value_min: number;
    estimated_value_max: number;
    status: string;
    created_at: string;
  }>;
};

export default function AdminInformaticsPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  
  const [analytics, setAnalytics] = useState<EWasteAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Protect admin route
  useEffect(() => {
    if (!loading && user && user.user_type !== "admin") {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Fetch leaderboard
  useEffect(() => {
    if (!token || !user || user.user_type !== "admin") return;
    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/leaderboard?limit=10`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        });

        const ct = res.headers.get("content-type") || "";
        const body = await res.text();

        if (!res.ok) throw new Error(body || `HTTP ${res.status}`);
        if (!ct.includes("application/json")) throw new Error(body.slice(0, 200));

        const data = JSON.parse(body) as LeaderboardEntry[];
        if (!cancelled) setLeaderboard(data);
      } catch (e: any) {
        if (!cancelled) {
          setLeaderboardError(e?.message || "Failed to load leaderboard");
          // Fallback dummy data
          const dummyData: LeaderboardEntry[] = [
            {
              rank: 1,
              user: {
                id: "b1cde4fb-5e69-4bf6-976e-190f47d60a0c",
                full_name: "Collector Beta",
                user_type: "collector",
                reputation_score: 0,
                is_sponsor: false,
              },
              quests_completed: 0,
              total_bounty_earned: 0,
              badges_count: 1,
            },
          ];
          setLeaderboard(dummyData);
        }
      } finally {
        if (!cancelled) setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  // Fetch e-waste analytics
  useEffect(() => {
    if (!token || !user || user.user_type !== "admin") return;
    let cancelled = false;

    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/ewaste-analytics`, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        });

        const ct = res.headers.get("content-type") || "";
        const body = await res.text();

        if (!res.ok) throw new Error(body || `HTTP ${res.status}`);
        if (!ct.includes("application/json")) throw new Error(body.slice(0, 200));

        const data = JSON.parse(body) as EWasteAnalytics;
        if (!cancelled) setAnalytics(data);
      } catch (e: any) {
        if (!cancelled) {
          setAnalyticsError(e?.message || "Failed to load analytics");
          // Fallback dummy data
          const dummyData: EWasteAnalytics = {
            total_listings: 4,
            active_listings: 2,
            completed_listings: 0,
            device_type_breakdown: {
              mobile: 3,
              laptop: 1,
            },
            total_estimated_value_min: 1855,
            total_estimated_value_max: 2880,
            total_realized_value: 502,
            average_listing_value: 591.875,
            recent_listings: [
              {
                id: "3505fddb-67e5-4fa2-8e47-fc0d94c8a964",
                device_type: "mobile",
                device_name: "iPhone 12",
                condition: "working",
                estimated_value_min: 350,
                estimated_value_max: 550,
                status: "picked_up",
                created_at: "2025-12-02T09:49:04.834674",
              },
            ],
          };
          setAnalytics(dummyData);
        }
      } finally {
        if (!cancelled) setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const refreshData = () => {
    if (!token) return;
    setLoadingLeaderboard(true);
    setLoadingAnalytics(true);

    Promise.all([
      fetch(`${API_BASE_URL}/dashboard/leaderboard?limit=10`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch(`${API_BASE_URL}/dashboard/ewaste-analytics`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      }),
    ])
      .then(async ([leaderboardRes, analyticsRes]) => {
        const leaderboardData = await leaderboardRes.json();
        const analyticsData = await analyticsRes.json();
        setLeaderboard(leaderboardData);
        setAnalytics(analyticsData);
        toast.success("Data refreshed successfully");
      })
      .catch((e) => {
        toast.error("Failed to refresh data");
      })
      .finally(() => {
        setLoadingLeaderboard(false);
        setLoadingAnalytics(false);
      });
  };

  if (loading) return null;
  if (!user || user.user_type !== "admin") return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "accepted":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "picked_up":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Informatics Dashboard</h1>
                  <p className="text-sm text-slate-500">Leaderboard & E-Waste Analytics</p>
                </div>
              </div>
              <button
                onClick={refreshData}
                disabled={loadingLeaderboard || loadingAnalytics}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:shadow-md text-sm font-medium disabled:opacity-50 transition-all"
              >
                <RefreshCcw className={`w-4 h-4 ${loadingLeaderboard || loadingAnalytics ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* E-Waste Analytics Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Package className="w-6 h-6 text-emerald-600" />
              E-Waste Analytics
            </h2>

            {analyticsError && (
              <div className="mb-6 flex items-center gap-3 text-sm text-orange-700 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{analyticsError} - Showing fallback data</span>
              </div>
            )}

            {loadingAnalytics && !analytics ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white/60 animate-pulse" />
                ))}
              </div>
            ) : analytics ? (
              <>
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Package className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800 mb-1">{analytics.total_listings}</h3>
                    <p className="text-sm text-slate-600 font-medium">Total Listings</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-green-600 mb-1">{analytics.active_listings}</h3>
                    <p className="text-sm text-slate-600 font-medium">Active Listings</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-purple-600 mb-1">{analytics.completed_listings}</h3>
                    <p className="text-sm text-slate-600 font-medium">Completed</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-amber-600 mb-1">৳{Math.round(analytics.average_listing_value)}</h3>
                    <p className="text-sm text-slate-600 font-medium">Avg Value</p>
                  </div>
                </div>

                {/* Device Breakdown & Value Summary */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {/* Device Type Breakdown */}
                  <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-indigo-600" />
                      Device Type Breakdown
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.device_type_breakdown).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {type === "mobile" ? (
                              <Smartphone className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Laptop className="w-5 h-5 text-purple-600" />
                            )}
                            <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${type === "mobile" ? "bg-blue-500" : "bg-purple-500"}`}
                                style={{ width: `${(count / analytics.total_listings) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-lg font-bold text-slate-800 w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Value Summary */}
                  <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-emerald-600" />
                      Value Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                        <span className="text-sm text-slate-600">Estimated Min</span>
                        <span className="text-lg font-bold text-slate-800">৳{analytics.total_estimated_value_min}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                        <span className="text-sm text-slate-600">Estimated Max</span>
                        <span className="text-lg font-bold text-slate-800">৳{analytics.total_estimated_value_max}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                        <span className="text-sm text-slate-600">Realized Value</span>
                        <span className="text-lg font-bold text-emerald-600">৳{analytics.total_realized_value}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm font-semibold text-slate-700">Average Value</span>
                        <span className="text-xl font-bold text-indigo-600">৳{Math.round(analytics.average_listing_value)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Listings */}
                <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Recent Listings
                  </h3>
                  <div className="space-y-3">
                    {analytics.recent_listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-100 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                            {listing.device_type === "mobile" ? (
                              <Smartphone className="w-5 h-5" />
                            ) : (
                              <Laptop className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{listing.device_name}</h4>
                            <p className="text-xs text-slate-500 capitalize">{listing.condition.replace("_", " ")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${getStatusColor(listing.status)}`}>
                            {listing.status.replace("_", " ").toUpperCase()}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            ৳{listing.estimated_value_min} - ৳{listing.estimated_value_max}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Leaderboard Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Top Contributors Leaderboard
            </h2>

            {leaderboardError && (
              <div className="mb-6 flex items-center gap-3 text-sm text-orange-700 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{leaderboardError} - Showing fallback data</span>
              </div>
            )}

            {loadingLeaderboard && leaderboard.length === 0 ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.user.id}
                    className={`group relative bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-6 hover:shadow-xl transition-all ${
                      entry.rank === 1
                        ? "border-yellow-300 bg-linear-to-r from-yellow-50 to-amber-50"
                        : entry.rank === 2
                        ? "border-slate-300 bg-linear-to-r from-slate-50 to-gray-50"
                        : entry.rank === 3
                        ? "border-amber-300 bg-linear-to-r from-amber-50 to-orange-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white shadow-lg border-2 border-slate-200">
                        {entry.rank <= 3 ? (
                          getRankIcon(entry.rank)
                        ) : (
                          <span className="text-2xl font-bold text-slate-600">#{entry.rank}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-800">{entry.user.full_name}</h3>
                          {entry.user.is_sponsor && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              SPONSOR
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 capitalize">
                            {entry.user.user_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-slate-600">
                              <span className="font-bold text-slate-800">{entry.quests_completed}</span> Quests
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-slate-600">
                              <span className="font-bold text-slate-800">৳{entry.total_bounty_earned}</span> Earned
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-600" />
                            <span className="text-slate-600">
                              <span className="font-bold text-slate-800">{entry.badges_count}</span> Badges
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-slate-600">
                              <span className="font-bold text-slate-800">{entry.user.reputation_score}</span> Rep
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-slate-200 border-dashed">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No leaderboard data</h3>
                <p className="text-slate-500">Check back soon to see top contributors</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
