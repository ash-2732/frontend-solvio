"use client";

import { useState, useEffect } from "react";
import {
  Flag,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Calendar,
  User,
  FileText,
  RefreshCcw,
  TrendingDown,
  AlertTriangle,
  Activity,
  Loader,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import toast from "react-hot-toast";

type Review = {
  id: string;
  quest_id: string;
  reviewer_id: string | null;
  flag_reason: string;
  ai_confidence_score: number;
  status: string;
  ai_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type ReviewsResponse = {
  items: Review[];
  total: number;
  pending_count: number;
};

export default function AdminFlagsPage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Role-based protection
  useEffect(() => {
    if (!authLoading && user && user.user_type !== "admin") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && token) {
      fetchReviews();
    }
  }, [token, authLoading]);

  const fetchReviews = async () => {
    if (!token) {
      console.log("No token available, skipping fetch");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE_URL}/admin/reviews?skip=0&limit=50`;
      console.log("Fetching reviews from:", url);
      
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", res.status);
      const ct = res.headers.get("content-type") || "";
      const body = await res.text();

      if (!res.ok) {
        console.error("Response not OK:", body);
        throw new Error(body || `HTTP ${res.status}`);
      }
      
      if (!ct.includes("application/json")) {
        console.error("Invalid content type:", ct);
        throw new Error("Invalid response format");
      }

      const data = JSON.parse(body) as ReviewsResponse;
      console.log("Fetched reviews:", data);
      
      setReviews(data.items || []);
      setTotal(data.total || 0);
      setPendingCount(data.pending_count || 0);
    } catch (e: any) {
      console.error("Error fetching reviews:", e);
      setError(e?.message || "Failed to load reviews");
      toast.error("Failed to load flagged reviews: " + (e?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getFlagReasonBadge = (reason: string) => {
    switch (reason) {
      case "low_ai_confidence":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "location_mismatch":
        return "bg-red-100 text-red-800 border-red-300";
      case "photo_quality_issue":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "suspicious_activity":
        return "bg-red-100 text-red-800 border-red-300";
      case "duplicate_report":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "incomplete_data":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const formatFlagReason = (reason: string) => {
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return "text-green-600";
    if (score >= 0.4) return "text-orange-600";
    return "text-red-600";
  };

  const filteredReviews = filterStatus === "all" 
    ? reviews 
    : reviews.filter(review => review.status === filterStatus);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-green-600 animate-spin" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Flag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Flagged Reviews</h1>
              <p className="text-slate-600 text-sm">
                Review and manage flagged quest reports
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Reviews */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Reviews</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{total}</p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Pending Reviews */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Pending Reviews</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Low Confidence */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Low Confidence</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {reviews.filter(r => r.ai_confidence_score < 0.4).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-linear-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Filter by Status:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "approved", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === status
                        ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-md"
                        : "bg-white/60 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchReviews}
                className="ml-auto px-4 py-2 rounded-lg bg-white/60 hover:bg-white text-slate-700 font-medium transition-all flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-slate-600 text-sm">Loading flagged reviews...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-red-900 font-semibold mb-2">Error Loading Reviews</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          ) : (
            <>
              {filteredReviews.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-12 text-center">
                  <Flag className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-900 font-semibold text-lg mb-2">No Flagged Reviews</p>
                  <p className="text-slate-600 text-sm">
                    {filterStatus === "all" 
                      ? "All quests are verified and have no flags"
                      : `No ${filterStatus} reviews found`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="group bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300"
                    >
                      <div className="p-5 space-y-4">
                        {/* Status and Confidence Score */}
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusBadge(review.status)}`}>
                            {review.status.toUpperCase()}
                          </span>
                          <div className="flex items-center gap-2">
                            <TrendingDown className={`w-4 h-4 ${getConfidenceColor(review.ai_confidence_score)}`} />
                            <span className={`text-sm font-bold ${getConfidenceColor(review.ai_confidence_score)}`}>
                              {(review.ai_confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Flag Reason */}
                        <div>
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getFlagReasonBadge(review.flag_reason)}`}>
                            {formatFlagReason(review.flag_reason)}
                          </span>
                        </div>

                        {/* AI Notes Preview */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <p className="text-xs text-slate-600 font-medium mb-1">AI Notes:</p>
                          <p className="text-sm text-slate-900 line-clamp-2">
                            {review.ai_notes || "No notes available"}
                          </p>
                        </div>

                        {/* Quest ID */}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <FileText className="w-4 h-4" />
                          <span className="font-mono truncate">{review.quest_id}</span>
                        </div>

                        {/* Created At */}
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(review.created_at)}</span>
                        </div>

                        {/* View Details Button */}
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setModalOpen(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-medium text-sm transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Modal */}
        {modalOpen && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-linear-to-r from-green-50 to-emerald-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Flag className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Review Details</h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Status and Confidence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-2">Status</p>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusBadge(selectedReview.status)}`}>
                      {selectedReview.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-2">AI Confidence Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            selectedReview.ai_confidence_score >= 0.7
                              ? "bg-green-600"
                              : selectedReview.ai_confidence_score >= 0.4
                              ? "bg-orange-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${selectedReview.ai_confidence_score * 100}%` }}
                        />
                      </div>
                      <span className={`text-lg font-bold ${getConfidenceColor(selectedReview.ai_confidence_score)}`}>
                        {(selectedReview.ai_confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Flag Reason */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium mb-2">Flag Reason</p>
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold border ${getFlagReasonBadge(selectedReview.flag_reason)}`}>
                    {formatFlagReason(selectedReview.flag_reason)}
                  </span>
                </div>

                {/* IDs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-2">Review ID</p>
                    <p className="text-sm text-slate-900 font-mono break-all">{selectedReview.id}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 font-medium mb-2">Quest ID</p>
                    <p className="text-sm text-slate-900 font-mono break-all">{selectedReview.quest_id}</p>
                  </div>
                </div>

                {/* AI Notes */}
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-orange-900 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    AI Notes
                  </p>
                  <p className="text-sm text-orange-800">
                    {selectedReview.ai_notes || "No AI notes available"}
                  </p>
                </div>

                {/* Admin Notes */}
                {selectedReview.admin_notes && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-900 font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Admin Notes
                    </p>
                    <p className="text-sm text-blue-800">{selectedReview.admin_notes}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-900 font-semibold mb-3">Timeline</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Created:</span>
                      <span className="font-medium text-slate-900">{formatDate(selectedReview.created_at)}</span>
                    </div>
                    {selectedReview.reviewed_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">Reviewed:</span>
                        <span className="font-medium text-slate-900">{formatDate(selectedReview.reviewed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviewer Info */}
                {selectedReview.reviewer_id && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-900 font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Reviewer
                    </p>
                    <p className="text-sm text-green-800 font-mono">{selectedReview.reviewer_id}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
