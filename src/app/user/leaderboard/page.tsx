"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  TrendingUp,
  Award,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/config";

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

export default function Leaderboard() {
  const { token } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
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
          setError(e?.message || "Failed to load leaderboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const topUsers = leaderboard.slice(0, 3);
  const otherUsers = leaderboard.slice(3);

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 sm:py-12 bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Leaderboard
              </h1>
            </div>
            <p className="text-lg text-slate-600">
              Top contributors making a difference
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-slate-600">Loading leaderboard...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Error Loading Leaderboard</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && leaderboard.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Rankings Yet</h3>
              <p className="text-slate-500">Be the first to make a difference!</p>
            </div>
          )}

          {/* Leaderboard Content */}
          {!loading && !error && leaderboard.length > 0 && (
            <>
              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* 2nd Place */}
                {topUsers[1] && (
                  <div className="md:order-1 transform md:translate-y-8">
                    <div className="bg-linear-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border-2 border-slate-300 shadow-xl hover:shadow-2xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <Medal className="w-8 h-8 text-slate-400" />
                        <span className="text-3xl font-bold text-slate-400">
                          #2
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-linear-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3">
                          {getInitials(topUsers[1].user.full_name)}
                        </div>
                        <h3 className="text-xl font-bold mb-1">
                          {topUsers[1].user.full_name}
                        </h3>
                        <p className="text-3xl font-bold text-slate-400 mb-2">
                          ${topUsers[1].total_bounty_earned.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600">
                          {topUsers[1].quests_completed} quests
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Award className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-500">{topUsers[1].badges_count} badges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topUsers[0] && (
                  <div className="md:order-2">
                    <div className="bg-linear-to-br from-yellow-100 via-yellow-200 to-amber-200 rounded-2xl p-6 border-2 border-yellow-400 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
                      <div className="flex justify-between items-start mb-4">
                        <Crown className="w-10 h-10 text-yellow-600" />
                        <span className="text-4xl font-bold text-yellow-600">
                          #1
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-linear-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-3">
                          {getInitials(topUsers[0].user.full_name)}
                        </div>
                        <h3 className="text-2xl font-bold mb-1">
                          {topUsers[0].user.full_name}
                        </h3>
                        <p className="text-4xl font-bold text-yellow-600 mb-2">
                          ${topUsers[0].total_bounty_earned.toLocaleString()}
                        </p>
                        <p className="text-sm text-yellow-700">
                          {topUsers[0].quests_completed} quests
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-yellow-700">{topUsers[0].badges_count} badges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topUsers[2] && (
                  <div className="md:order-3 transform md:translate-y-12">
                    <div className="bg-linear-to-br from-amber-100 to-orange-200 rounded-2xl p-6 border-2 border-amber-400 shadow-xl hover:shadow-2xl transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <Award className="w-8 h-8 text-amber-600" />
                        <span className="text-3xl font-bold text-amber-600">
                          #3
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3">
                          {getInitials(topUsers[2].user.full_name)}
                        </div>
                        <h3 className="text-xl font-bold mb-1">
                          {topUsers[2].user.full_name}
                        </h3>
                        <p className="text-3xl font-bold text-amber-600 mb-2">
                          ${topUsers[2].total_bounty_earned.toLocaleString()}
                        </p>
                        <p className="text-sm text-amber-700">
                          {topUsers[2].quests_completed} quests
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span className="text-xs text-amber-700">{topUsers[2].badges_count} badges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rest of Leaderboard */}
              {otherUsers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Rankings
                  </h2>
                  <div className="space-y-3">
                    {otherUsers.map((user) => (
                      <div
                        key={user.user.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-linear-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                            {getInitials(user.user.full_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-slate-400">
                                #{user.rank}
                              </span>
                              <h3 className="font-semibold text-lg">
                                {user.user.full_name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {user.quests_completed} quests
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="w-4 h-4 text-blue-500" />
                                {user.badges_count} badges
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-2xl font-bold text-slate-700">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            {user.total_bounty_earned.toLocaleString()}
                          </div>
                          <p className="text-sm text-slate-500">bounty earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
