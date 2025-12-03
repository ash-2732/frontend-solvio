"use client";

import { useState, useEffect } from "react";
import {
  ClipboardList,
  MapPin,
  User,
  Calendar,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Loader2,
  AlertCircle,
  Filter,
  Eye,
  X,
  Activity,
  RefreshCcw,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import toast from "react-hot-toast";

type Quest = {
  id: string;
  reporter_id: string;
  collector_id: string | null;
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
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
  collector?: {
    id: string;
    full_name: string;
    user_type: string;
    reputation_score: number;
    is_sponsor: boolean;
  } | null;
};

type QuestsResponse = {
  items: Quest[];
  total: number;
  skip: number;
  limit: number;
};

export default function AdminReportsPage() {
  const { user, loading: authLoading, token } = useAuth();
  const router = useRouter();

  const [quests, setQuests] = useState<Quest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewQuestId, setReviewQuestId] = useState<string>("");
  const [reviewData, setReviewData] = useState({
    ai_confidence_score: 0.5,
    ai_notes: "",
    flag_reason: "low_ai_confidence"
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Role-based protection
  useEffect(() => {
    if (!authLoading && user && user.user_type !== "admin") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!token) return;
    fetchQuests();
  }, [token, filterStatus]);

  const fetchQuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/quests?skip=0&limit=100`, {
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

      const data = JSON.parse(body) as QuestsResponse;
      setQuests(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load quests");
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

  const openReviewModal = (questId: string) => {
    setReviewQuestId(questId);
    setReviewData({
      ai_confidence_score: 0.5,
      ai_notes: "",
      flag_reason: "low_ai_confidence"
    });
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.ai_notes.trim()) {
      toast.error("Please enter AI notes");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quest_id: reviewQuestId,
          ai_confidence_score: reviewData.ai_confidence_score,
          ai_notes: reviewData.ai_notes,
          flag_reason: reviewData.flag_reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to submit review");
      }

      toast.success("Review submitted successfully!");
      setReviewModalOpen(false);
      fetchQuests(); // Refresh the list
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "in_progress":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "verified":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const filteredQuests =
    filterStatus === "all"
      ? quests
      : quests.filter((q) => q.status === filterStatus);

  if (authLoading) return null;
  if (!user || user.user_type !== "admin") return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-600 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                  All Reports & Quests
                </h1>
                <p className="text-sm text-slate-600">
                  Manage and monitor all waste collection reports
                </p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{total}</p>
                  <p className="text-xs text-slate-600">Total Reports</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {quests.filter((q) => q.status === "pending").length}
                  </p>
                  <p className="text-xs text-slate-600">Pending</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {quests.filter((q) => q.status === "assigned").length}
                  </p>
                  <p className="text-xs text-slate-600">Assigned</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {quests.filter((q) => q.status === "in_progress").length}
                  </p>
                  <p className="text-xs text-slate-600">In Progress</p>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {quests.filter((q) => q.status === "completed").length}
                  </p>
                  <p className="text-xs text-slate-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6 border border-slate-200/60">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-700">Filter by Status:</span>
              {["all", "pending", "assigned", "in_progress", "completed", "verified"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === status
                        ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-sm"
                        : "bg-white/60 text-slate-700 hover:bg-white border border-slate-200"
                    }`}
                  >
                    {status === "all" ? "All" : status.replace(/_/g, " ")}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-600">Loading reports...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Error Loading Reports</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Grid */}
          {!loading && !error && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold">{filteredQuests.length}</span> of{" "}
                  <span className="font-semibold">{total}</span> reports
                </p>
                <button
                  onClick={fetchQuests}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/60 border border-slate-300 text-slate-700 hover:bg-white text-sm font-medium transition-all"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {filteredQuests.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow-sm p-12 text-center border border-slate-200/60">
                  <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No Reports Found</h3>
                  <p className="text-slate-500">
                    {filterStatus === "all"
                      ? "No reports available at the moment."
                      : `No ${filterStatus.replace(/_/g, " ")} reports found.`}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="group bg-white/50 backdrop-blur-sm rounded-lg border border-slate-200/60 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                    >
                      {/* Image Header */}
                      {quest.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={quest.image_url}
                            alt={quest.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-semibold text-slate-800 mb-2 line-clamp-2">
                          {quest.title}
                        </h3>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3 text-xs">
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-medium capitalize">
                            {quest.waste_type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded font-medium capitalize ${
                              quest.severity === "high"
                                ? "bg-red-100 text-red-800"
                                : quest.severity === "medium"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {quest.severity}
                          </span>
                          <span
                            className={`px-2 py-1 rounded font-medium capitalize ${
                              quest.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : quest.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : quest.status === "assigned"
                                ? "bg-cyan-100 text-cyan-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {quest.status.replace(/_/g, " ")}
                          </span>
                          <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-medium">
                            {quest.bounty_points} pts
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mb-3 line-clamp-4">
                          {quest.description}
                        </p>

                        {/* Info Section */}
                        <div className="mt-auto space-y-1 text-[11px] text-slate-500 mb-3">
                          {quest.location && (
                            <div>
                              📍 {quest.location.coordinates[1].toFixed(5)},{" "}
                              {quest.location.coordinates[0].toFixed(5)}
                            </div>
                          )}
                          {quest.reporter?.full_name && (
                            <div>Reporter: {quest.reporter.full_name}</div>
                          )}
                          {quest.collector?.full_name && (
                            <div>Collector: {quest.collector.full_name}</div>
                          )}
                          <div>Created: {new Date(quest.created_at).toLocaleString()}</div>
                          {quest.completed_at && (
                            <div>Completed: {new Date(quest.completed_at).toLocaleString()}</div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedQuest(quest);
                              setModalOpen(true);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-medium text-sm transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => openReviewModal(quest.id)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 font-medium text-sm transition-all shadow-sm"
                            title="Manual Review"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Modal */}
        {modalOpen && selectedQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Quest Details</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Photos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedQuest.image_url && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Original Image</p>
                      <img
                        src={selectedQuest.image_url}
                        alt="Original"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                  {selectedQuest.before_photo_url && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Before Photo</p>
                      <img
                        src={selectedQuest.before_photo_url}
                        alt="Before"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                  {selectedQuest.after_photo_url && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">After Photo</p>
                      <img
                        src={selectedQuest.after_photo_url}
                        alt="After"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Title</p>
                      <p className="font-medium text-slate-900">{selectedQuest.title}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(
                          selectedQuest.status
                        )} capitalize mt-1`}
                      >
                        {selectedQuest.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-600">Waste Type</p>
                      <p className="font-medium text-slate-900 capitalize">{selectedQuest.waste_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Severity</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${getSeverityBadge(
                          selectedQuest.severity
                        )} capitalize mt-1`}
                      >
                        {selectedQuest.severity}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-600">Bounty Points</p>
                      <p className="font-medium text-slate-900">{selectedQuest.bounty_points}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Geohash</p>
                      <p className="font-medium text-slate-900 font-mono text-xs">{selectedQuest.geohash}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedQuest.description}</p>
                </div>

                {/* People Involved */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedQuest.reporter && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-900" />
                        Reporter
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-900">
                          <span className="text-slate-700">Name:</span>{" "}
                          <span className="font-medium text-slate-900">{selectedQuest.reporter.full_name}</span>
                        </p>
                        <p className="text-slate-900">
                          <span className="text-slate-700">Type:</span>{" "}
                          <span className="font-medium text-slate-900 capitalize">{selectedQuest.reporter.user_type}</span>
                        </p>
                        <p className="text-slate-900">
                          <span className="text-slate-700">Reputation:</span>{" "}
                          <span className="font-medium text-slate-900">{selectedQuest.reporter.reputation_score}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedQuest.collector && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-900" />
                        Collector
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-900">
                          <span className="text-slate-700">Name:</span>{" "}
                          <span className="font-medium text-slate-900">{selectedQuest.collector.full_name}</span>
                        </p>
                        <p className="text-slate-900">
                          <span className="text-slate-700">Type:</span>{" "}
                          <span className="font-medium text-slate-900 capitalize">{selectedQuest.collector.user_type}</span>
                        </p>
                        <p className="text-slate-900">
                          <span className="text-slate-700">Reputation:</span>{" "}
                          <span className="font-medium text-slate-900">{selectedQuest.collector.reputation_score}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Created:</span>
                      <span className="font-medium text-slate-900">{formatDate(selectedQuest.created_at)}</span>
                    </div>
                    {selectedQuest.assigned_at && (
                      <div className="flex items-center gap-2 text-slate-900">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-700">Assigned:</span>
                        <span className="font-medium text-slate-900">{formatDate(selectedQuest.assigned_at)}</span>
                      </div>
                    )}
                    {selectedQuest.completed_at && (
                      <div className="flex items-center gap-2 text-slate-900">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">Completed:</span>
                        <span className="font-medium text-slate-900">{formatDate(selectedQuest.completed_at)}</span>
                      </div>
                    )}
                    {selectedQuest.verified_at && (
                      <div className="flex items-center gap-2 text-slate-900">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-700">Verified:</span>
                        <span className="font-medium text-slate-900">{formatDate(selectedQuest.verified_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Notes */}
                {selectedQuest.verification_notes && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h3 className="font-semibold text-slate-900 mb-2">Verification Notes</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedQuest.verification_notes}
                    </p>
                  </div>
                )}

                {/* Location */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h3>
                  <p className="text-sm text-slate-700 font-mono">
                    Lat: {selectedQuest.location.coordinates[1]}, Lng:{" "}
                    {selectedQuest.location.coordinates[0]}
                  </p>
                </div>
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

        {/* Manual Review Modal */}
        {reviewModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-linear-to-r from-orange-50 to-red-50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Manual Review</h2>
                </div>
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Quest ID Display */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-sm text-slate-700">Quest ID</p>
                  <p className="text-slate-900 font-mono text-sm mt-1">{reviewQuestId}</p>
                </div>

                {/* AI Confidence Score */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    AI Confidence Score
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={reviewData.ai_confidence_score}
                      onChange={(e) => setReviewData({
                        ...reviewData,
                        ai_confidence_score: parseFloat(e.target.value)
                      })}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <span className="text-lg font-bold text-slate-900 min-w-[60px] text-right">
                      {reviewData.ai_confidence_score.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Lower scores indicate higher suspicion (0.0 - 1.0)
                  </p>
                </div>

                {/* Flag Reason */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Flag Reason
                  </label>
                  <select
                    value={reviewData.flag_reason}
                    onChange={(e) => setReviewData({
                      ...reviewData,
                      flag_reason: e.target.value
                    })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 bg-white"
                  >
                    <option value="low_ai_confidence">Low AI Confidence</option>
                    <option value="location_mismatch">Location Mismatch</option>
                    <option value="photo_quality_issue">Photo Quality Issue</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="duplicate_report">Duplicate Report</option>
                    <option value="incomplete_data">Incomplete Data</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* AI Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    AI Notes / Review Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewData.ai_notes}
                    onChange={(e) => setReviewData({
                      ...reviewData,
                      ai_notes: e.target.value
                    })}
                    placeholder="Enter detailed notes about why this report is flagged for review (e.g., 'Location mismatch detected between before and after photos')"
                    rows={5}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 bg-white resize-none"
                    required
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Provide specific details about the issue detected
                  </p>
                </div>

                {/* Warning Message */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Review Notice</p>
                      <p className="text-xs text-amber-800 mt-1">
                        This action will flag the quest for manual review. Ensure all information is accurate before submitting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-white transition-all duration-200 font-medium"
                  disabled={isSubmittingReview}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !reviewData.ai_notes.trim()}
                  className="flex-1 px-6 py-2.5 bg-linear-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
