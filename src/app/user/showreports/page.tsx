"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Trophy,
  User,
  RefreshCw,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/config";

type ReportItem = {
  id: string;
  reporter_id: string;
  collector_id: string | null;
  title: string;
  description: string;
  location: { type: string; coordinates: [number, number] };
  geohash: string;
  waste_type: string;
  severity: string;
  status: string;
  bounty_points: number;
  image_url: string | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
  ai_verification_score: number | null;
  verification_notes: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  reporter?: {
    id: string;
    full_name: string;
    user_type: string;
    reputation_score: number;
    is_sponsor: boolean;
  } | null;
  collector?: any;
};

export default function ShowReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/quests?skip=0&limit=100`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();
      
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      if (!contentType.includes("application/json")) {
        throw new Error(`Unexpected response: ${text.slice(0, 150)}`);
      }
      
      const data = JSON.parse(text) as {
        items: ReportItem[];
        total: number;
        skip: number;
        limit: number;
      };
      
      setReports(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : data.items.length);
    } catch (e: any) {
      setError(e?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reported":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "verified":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-8 sm:py-12 bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    All Quest Reports
                  </h1>
                </div>
                <p className="text-slate-600 ml-15">
                  Browse all reported waste quests in the community
                </p>
              </div>
              <button
                onClick={fetchReports}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{total}</p>
                  <p className="text-xs text-slate-600">Total Reports</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{reports.length}</p>
                  <p className="text-xs text-slate-600">Showing</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reports.filter((r) => r.status === "reported").length}
                  </p>
                  <p className="text-xs text-slate-600">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reports.filter((r) => r.status === "completed").length}
                  </p>
                  <p className="text-xs text-slate-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-slate-600">Loading reports...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    Error Loading Reports
                  </h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && reports.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <Trash2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No Reports Yet
              </h3>
              <p className="text-slate-500">
                Be the first to report waste in your area!
              </p>
            </div>
          )}

          {/* Reports Grid */}
          {!loading && !error && reports.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => {
                const lat = report.location?.coordinates?.[1];
                const lng = report.location?.coordinates?.[0];
                return (
                  <div
                    key={report.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 overflow-hidden transition-all duration-200"
                  >
                    {/* Image */}
                    {report.image_url && (
                      <div className="h-48 overflow-hidden bg-slate-100">
                        <img
                          src={report.image_url}
                          alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2">
                        {report.title}
                      </h3>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getSeverityColor(
                            report.severity
                          )}`}
                        >
                          {report.severity.toUpperCase()}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {report.waste_type.replace("_", " ").toUpperCase()}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                        {report.description}
                      </p>

                      {/* Meta Info */}
                      <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-4">
                        {/* Bounty Points */}
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-700">
                            {report.bounty_points} Points
                          </span>
                        </div>

                        {/* Location */}
                        {lat && lng && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>
                              {lat.toFixed(5)}, {lng.toFixed(5)}
                            </span>
                          </div>
                        )}

                        {/* Reporter */}
                        {report.reporter?.full_name && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600" />
                            <span>Reported by {report.reporter.full_name}</span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formatDate(report.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
