"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { MapPin, Loader2, ClipboardList, Gauge, ShieldCheck, Trash2, Award, TrendingUp, CheckCircle2, Clock, AlertCircle, Upload, Camera, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadToFirebase } from "@/lib/upload";

export default function CollectorDashboardPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();

  // Modal + form state
  const [open, setOpen] = useState(false);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Workload state
  type Workload = {
    active_quests: number;
    max_concurrent: number;
    capacity_remaining: number;
    completed_last_week: number;
    status: string;
    fraud_risk_score: number;
  };
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [loadingWorkload, setLoadingWorkload] = useState<boolean>(false);
  const [workloadError, setWorkloadError] = useState<string | null>(null);
  // Assigned quests state
  type AssignedQuest = {
    id: string;
    reporter_id: string;
    collector_id: string;
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
    assigned_at: string | null;
    completed_at: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    reporter?: { id: string; full_name: string; user_type: string; reputation_score: number; is_sponsor: boolean } | null;
    collector?: { id: string; full_name: string; user_type: string; reputation_score: number; is_sponsor: boolean } | null;
  };
  const [assigned, setAssigned] = useState<AssignedQuest[]>([]);
  const [assignedTotal, setAssignedTotal] = useState<number>(0);
  const [loadingAssigned, setLoadingAssigned] = useState<boolean>(false);
  const [assignedError, setAssignedError] = useState<string | null>(null);

  // Complete Quest Modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<AssignedQuest | null>(null);
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string>("");
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>("");
  const [verificationNotes, setVerificationNotes] = useState<string>("");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [completingQuest, setCompletingQuest] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [questLatitude, setQuestLatitude] = useState<string>("");
  const [questLongitude, setQuestLongitude] = useState<string>("");
  
  // Result Modal state
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultMessage, setResultMessage] = useState<string>("");

  // Role-based protection: only allow collectors
  useEffect(() => {
    if (!loading && user && user.user_type !== "collector") {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Note: Avoid early returns before effects to keep hook order stable.

  // Fetch workload after auth ready
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const run = async () => {
      setLoadingWorkload(true);
      setWorkloadError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/collectors/me/workload`, {
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
        const data = JSON.parse(body) as Workload;
        if (!cancelled) setWorkload(data);
      } catch (e: any) {
        if (!cancelled) setWorkloadError(e?.message || "Failed to load workload");
      } finally {
        if (!cancelled) setLoadingWorkload(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Fetch assigned quests
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const run = async () => {
      setLoadingAssigned(true);
      setAssignedError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/collectors/me/quests?skip=0&limit=100`, {
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
        const data = JSON.parse(body) as { items: AssignedQuest[]; total: number; skip: number; limit: number };
        if (!cancelled) {
          setAssigned(Array.isArray(data.items) ? data.items : []);
          setAssignedTotal(typeof data.total === "number" ? data.total : data.items.length);
        }
      } catch (e: any) {
        if (!cancelled) setAssignedError(e?.message || "Failed to load assigned quests");
      } finally {
        if (!cancelled) setLoadingAssigned(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const useMyLocation = () => {
    setFormError(null);
    if (!navigator.geolocation) {
      setFormError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
      },
      (err) => {
        setFormError("Couldn't get location. Please allow location access.");
        // eslint-disable-next-line no-console
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    setFormError(null);
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (
      Number.isNaN(latNum) ||
      Number.isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      setFormError("Please enter valid coordinates: lat [-90..90], lng [-180..180].");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/collectors/me/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ latitude: latNum, longitude: lngNum }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed: ${res.status}`);
      }
      toast.success("Location updated");
      setOpen(false);
      setLatitude("");
      setLongitude("");
    } catch (e: any) {
      const msg = e?.message || "Failed to update location";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openCompleteModal = (quest: AssignedQuest) => {
    // Check if quest is already completed
    if (quest.status === "completed" || quest.status === "verified") {
      toast.success("✅ This quest is already completed!");
      return;
    }
    
    setSelectedQuest(quest);
    setBeforePhoto(null);
    setAfterPhoto(null);
    // Use existing quest image as before photo
    setBeforePhotoUrl(quest.image_url || "");
    setAfterPhotoUrl("");
    setVerificationNotes("");
    setCompleteError(null);
    setQuestLatitude("");
    setQuestLongitude("");
    setCompleteModalOpen(true);
  };

  const useQuestLocation = () => {
    setCompleteError(null);
    if (!navigator.geolocation) {
      setCompleteError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setQuestLatitude(String(pos.coords.latitude));
        setQuestLongitude(String(pos.coords.longitude));
      },
      (err) => {
        setCompleteError("Couldn't get location. Please allow location access.");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCompleteQuest = async () => {
    if (!selectedQuest || !user) return;
    setCompleteError(null);

    // Validate photos
    // Before photo should already be set from quest image
    if (!beforePhotoUrl) {
      setCompleteError("Before photo is missing from the quest.");
      return;
    }
    if (!afterPhoto) {
      setCompleteError("Please upload an after photo showing the cleaned area.");
      return;
    }

    setCompletingQuest(true);
    setUploadingPhotos(true);

    try {
      // Upload after photo to Firebase
      const uploadToastId = toast.loading("Uploading after photo to Firebase...");
      const finalAfterUrl = await uploadToFirebase(afterPhoto);
      toast.dismiss(uploadToastId);
      toast.success("Photo uploaded successfully!");
      
      setUploadingPhotos(false);

      // Prepare payload - before_photo_url is from the original quest image
      const payload = {
        collector_id: user.id,
        status: "completed",
        before_photo_url: beforePhotoUrl, // Original quest image
        after_photo_url: finalAfterUrl, // Newly uploaded after photo
        before_photo_metadata: {},
        after_photo_metadata: {},
        ai_verification_score: 0,
        verification_notes: verificationNotes || "Completed by collector",
      };

      // Submit completion
      const res = await fetch(`${API_BASE_URL}/quests/${selectedQuest.id}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      const body = await res.text();

      if (!res.ok) {
        throw new Error(body || `HTTP ${res.status}`);
      }
      if (!ct.includes("application/json")) {
        throw new Error(body.slice(0, 200));
      }

      // Dismiss any remaining toasts
      toast.dismiss();
      setCompleteModalOpen(false);
      
      // Refresh assigned quests
      setLoadingAssigned(true);
      const refreshRes = await fetch(`${API_BASE_URL}/collectors/me/quests?skip=0&limit=100`, {
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });
      const refreshData = await refreshRes.json();
      setAssigned(Array.isArray(refreshData.items) ? refreshData.items : []);
      setAssignedTotal(typeof refreshData.total === "number" ? refreshData.total : refreshData.items.length);
      setLoadingAssigned(false);
      
      // Show success modal
      setResultType("success");
      setResultMessage("Quest completed successfully! Your bounty points have been added.");
      setResultModalOpen(true);
      setCompleteModalOpen(false);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setResultModalOpen(false);
      }, 3000);
    } catch (e: any) {
      // Dismiss any remaining toasts
      toast.dismiss();
      
      // Show error modal
      setResultType("error");
      setResultMessage(e?.message || "Failed to complete quest. Please try again.");
      setResultModalOpen(true);
      setCompleteModalOpen(false);
      
      // Auto close after 4 seconds
      setTimeout(() => {
        setResultModalOpen(false);
      }, 4000);
    } finally {
      setCompletingQuest(false);
      setUploadingPhotos(false);
    }
  };

  // Now safely gate rendering
  if (loading) return null;
  if (!user || user.user_type !== "collector") return null;

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Collector Dashboard</h1>
                  <p className="text-sm text-slate-500">Welcome back, {user?.full_name || "Collector"}!</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <MapPin className="w-5 h-5" /> Update Location
            </button>
          </div>

          {/* Quick Info Banner */}
          <div className="bg-linear-to-br from-green-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Stay Connected & Active</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Keep your location updated to receive nearby waste collection assignments. The system will match you with quests based on your current position and availability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Workload Metrics Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Your Workload</h2>
              <p className="text-sm text-slate-500">Track your active tasks and performance</p>
            </div>
            {workload && (
              <span className={`ml-auto px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                workload.status === "available"
                  ? "bg-emerald-500 text-white"
                  : workload.status === "busy"
                  ? "bg-orange-500 text-white"
                  : "bg-slate-400 text-white"
              }`}>
                ● {workload.status}
              </span>
            )}
          </div>

          {workloadError && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {workloadError}
            </div>
          )}

          {loadingWorkload && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-white/60 animate-pulse" />
              ))}
            </div>
          )}

          {!loadingWorkload && workload && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Active Quests */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-green-400/20 to-emerald-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Active Quests</div>
                  <div className="text-3xl font-bold text-slate-900">{workload.active_quests}</div>
                </div>
              </div>

              {/* Max Concurrent */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-400/20 to-cyan-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Max Concurrent</div>
                  <div className="text-3xl font-bold text-slate-900">{workload.max_concurrent}</div>
                </div>
              </div>

              {/* Capacity Remaining */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Capacity Available</div>
                  <div className="text-3xl font-bold text-slate-900">{workload.capacity_remaining}</div>
                </div>
              </div>

              {/* Completed Last Week */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-amber-400/20 to-orange-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Completed (7 days)</div>
                  <div className="text-3xl font-bold text-slate-900">{workload.completed_last_week}</div>
                </div>
              </div>

              {/* Status */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-emerald-400/20 to-green-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Current Status</div>
                  <div className="text-2xl font-bold text-slate-900 capitalize">{workload.status}</div>
                </div>
              </div>

              {/* Fraud Risk Score */}
              <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-rose-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-rose-400/20 to-red-400/20 rounded-bl-full" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">Fraud Risk Score</div>
                  <div className="text-3xl font-bold text-slate-900">{workload.fraud_risk_score}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Quests Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Assigned Reports</h2>
                <p className="text-sm text-slate-500">Your active waste collection tasks</p>
              </div>
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:shadow-md text-sm font-medium disabled:opacity-50 transition-all"
              disabled={loadingAssigned}
              onClick={() => {
                setLoadingAssigned(true);
                setAssignedError(null);
                fetch(`${API_BASE_URL}/me/quests?skip=0&limit=100`, {
                  headers: {
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": "true",
                    Authorization: `Bearer ${token}`,
                  },
                })
                  .then(async (r) => {
                    const ct = r.headers.get("content-type") || "";
                    const tx = await r.text();
                    if (!r.ok) throw new Error(tx || `HTTP ${r.status}`);
                    if (!ct.includes("application/json")) throw new Error(tx.slice(0, 200));
                    return JSON.parse(tx) as { items: AssignedQuest[]; total: number };
                  })
                  .then((d) => {
                    setAssigned(Array.isArray(d.items) ? d.items : []);
                    setAssignedTotal(typeof d.total === "number" ? d.total : d.items.length);
                  })
                  .catch((e) => setAssignedError(e?.message || "Failed to load assigned quests"))
                  .finally(() => setLoadingAssigned(false));
              }}
            >
              {loadingAssigned ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {assignedError && (
            <div className="mb-5 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {assignedError}
            </div>
          )}

          {loadingAssigned && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-white/60 animate-pulse" />
              ))}
            </div>
          )}

          {!loadingAssigned && !assignedError && assigned.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Assigned Reports</h3>
              <p className="text-sm text-slate-500">You're all caught up! New tasks will appear here when assigned.</p>
            </div>
          )}

          {!loadingAssigned && !assignedError && assigned.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold">
                    {assigned.length}{assignedTotal ? ` / ${assignedTotal}` : ""}
                  </span>
                  reports assigned to you
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {assigned.map((r) => {
                  const lat = r.location?.coordinates?.[1];
                  const lng = r.location?.coordinates?.[0];
                  return (
                    <div
                      key={r.id}
                      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                          r.status === "assigned" 
                            ? "bg-blue-500 text-white" 
                            : r.status === "in_progress"
                            ? "bg-orange-500 text-white"
                            : r.status === "completed"
                            ? "bg-green-500 text-white"
                            : "bg-slate-500 text-white"
                        }`}>
                          {r.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Image Section - Click to Complete */}
                      {r.image_url && (
                        <div 
                          className="relative h-44 overflow-hidden cursor-pointer"
                          onClick={() => openCompleteModal(r)}
                        >
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="text-white text-center">
                              <Camera className="w-10 h-10 mx-auto mb-2" />
                              <span className="text-sm font-semibold">Click to Complete</span>
                            </div>
                          </div>
                          <img
                            src={r.image_url}
                            alt={r.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="text-lg font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {r.title}
                        </h4>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 capitalize">
                            <Trash2 className="w-3 h-3" />
                            {r.waste_type}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border capitalize ${
                            r.severity === "high"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : r.severity === "medium"
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }`}>
                            <AlertCircle className="w-3 h-3" />
                            {r.severity}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                            <Award className="w-3 h-3" />
                            {r.bounty_points} pts
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                          {r.description}
                        </p>

                        {/* Footer Info */}
                        <div className="mt-auto pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
                          {lat && lng && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
                            </div>
                          )}
                          {r.reporter?.full_name && (
                            <div className="flex items-center gap-2">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Reporter: <span className="font-medium">{r.reporter.full_name}</span>
                            </div>
                          )}
                          {r.assigned_at && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              Assigned: {new Date(r.assigned_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover Gradient Effect */}
                      <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-emerald-400/0 via-emerald-400/0 to-emerald-400/0 group-hover:from-emerald-400/5 group-hover:via-transparent group-hover:to-emerald-400/5 transition-all duration-300 pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Complete Quest Modal */}
        {completeModalOpen && selectedQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
              onClick={() => !completingQuest && setCompleteModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-8 py-6 bg-linear-to-br from-emerald-50 to-green-50 border-b-2 border-emerald-200 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800">Complete Quest</h3>
                    <p className="text-sm text-slate-600">{selectedQuest.title}</p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-all"
                    onClick={() => !completingQuest && setCompleteModalOpen(false)}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-6 overflow-y-auto flex-1">
                {completeError && (
                  <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{completeError}</span>
                  </div>
                )}

                {/* Quest Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-slate-800">Quest Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Waste Type:</span>
                      <span className="ml-2 font-medium text-slate-800 capitalize">{selectedQuest.waste_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Severity:</span>
                      <span className="ml-2 font-medium text-slate-800 capitalize">{selectedQuest.severity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Bounty:</span>
                      <span className="ml-2 font-medium text-emerald-700">{selectedQuest.bounty_points} pts</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="ml-2 font-medium text-blue-700 capitalize">{selectedQuest.status}</span>
                    </div>
                  </div>
                </div>

                {/* Before Photo - From Quest */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Camera className="w-4 h-4" />
                    Before Photo (Original Quest Image)
                  </label>
                  <div className="relative">
                    {beforePhotoUrl ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-emerald-200 bg-slate-50">
                        <img src={beforePhotoUrl} alt="Before - Original Quest" className="w-full h-64 object-cover" />
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-lg">
                          <CheckCircle2 className="w-3 h-3" />
                          Original Quest Image
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 w-full px-4 py-8 rounded-xl border-2 border-slate-300 bg-slate-50">
                        <AlertCircle className="w-6 h-6 text-slate-400" />
                        <span className="text-slate-600">No before photo available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* After Photo Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Upload className="w-4 h-4" />
                    After Photo (Cleaned Area) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAfterPhoto(file);
                          setAfterPhotoUrl(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                      id="after-photo"
                      disabled={completingQuest}
                    />
                    <label
                      htmlFor="after-photo"
                      className={`flex items-center justify-center gap-3 w-full px-4 py-8 rounded-xl border-2 border-dashed transition-all ${
                        afterPhotoUrl 
                          ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100" 
                          : "border-blue-300 bg-blue-50 hover:bg-blue-100"
                      } cursor-pointer`}
                    >
                      {afterPhotoUrl ? (
                        <div className="text-center w-full">
                          <img src={afterPhotoUrl} alt="After - Cleaned" className="max-h-48 mx-auto rounded-lg mb-3 border-2 border-emerald-300" />
                          <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            Photo selected - Click to change
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                          <span className="text-blue-700 font-semibold text-base block mb-1">
                            Upload After Cleanup Photo
                          </span>
                          <span className="text-blue-600 text-sm">
                            Show the cleaned area after collection
                          </span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Location Inputs */}
                <div className="bg-blue-50 rounded-xl p-5 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Collection Location</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={questLatitude}
                        onChange={(e) => setQuestLatitude(e.target.value)}
                        placeholder="e.g., 23.8103"
                        className="w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        disabled={completingQuest}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={questLongitude}
                        onChange={(e) => setQuestLongitude(e.target.value)}
                        placeholder="e.g., 90.4125"
                        className="w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        disabled={completingQuest}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={useQuestLocation}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-blue-300 bg-white text-blue-700 hover:bg-blue-50 font-medium transition-all disabled:opacity-60"
                    disabled={completingQuest}
                  >
                    <MapPin className="w-4 h-4" />
                    Use My Current Location
                  </button>
                </div>

                {/* Verification Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <FileText className="w-4 h-4" />
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add any notes about the completion..."
                    rows={4}
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all resize-none"
                    disabled={completingQuest}
                  />
                </div>

                {uploadingPhotos && (
                  <div className="flex items-center gap-3 text-sm text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                    <span>Uploading photos to Firebase...</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t-2 border-slate-200 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => !completingQuest && setCompleteModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-60 transition-all"
                  disabled={completingQuest}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteQuest}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition-all"
                  disabled={completingQuest}
                >
                  {completingQuest && <Loader2 className="w-4 h-4 animate-spin" />}
                  {completingQuest ? "Completing..." : "Complete Quest"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location Update Modal */}
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => !submitting && setOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-200">
              {/* Modal Header */}
              <div className="relative px-8 py-6 bg-linear-to-br from-green-50 to-emerald-50 border-b-2 border-emerald-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800">Update Your Location</h3>
                    <p className="text-sm text-slate-600">Set your current position for nearby tasks</p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white/60 transition-all"
                    onClick={() => !submitting && setOpen(false)}
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6 space-y-5">
                {formError && (
                  <div className="flex items-center gap-3 text-sm text-red-700 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
                    </svg>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., 23.8103"
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
                    </svg>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., 90.4125"
                    className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-all disabled:opacity-60"
                    disabled={submitting}
                  >
                    <MapPin className="w-4 h-4" />
                    Use My Current Location
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t-2 border-slate-200 flex items-center justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => !submitting && setOpen(false)}
                  className="px-6 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-60 transition-all"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition-all"
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Updating..." : "Update Location"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Modal (Success/Error) */}
        {resultModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              onClick={() => setResultModalOpen(false)}
            />
            <div className={`relative z-10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-4 ${
              resultType === "success" 
                ? "bg-linear-to-br from-green-50 to-emerald-100 border-green-400" 
                : "bg-linear-to-br from-red-50 to-rose-100 border-red-400"
            } animate-[scaleIn_0.3s_ease-out]`}>
              {/* Modal Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <div className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${
                  resultType === "success"
                    ? "bg-linear-to-br from-green-500 to-emerald-600"
                    : "bg-linear-to-br from-red-500 to-rose-600"
                } shadow-2xl`}>
                  {resultType === "success" ? (
                    <CheckCircle2 className="w-11 h-11 text-white" />
                  ) : (
                    <AlertCircle className="w-11 h-11 text-white" />
                  )}
                </div>

                {/* Title */}
                <h3 className={`text-2xl font-bold mb-3 ${
                  resultType === "success" ? "text-green-800" : "text-red-800"
                }`}>
                  {resultType === "success" ? "Success! 🎉" : "Oops! ⚠️"}
                </h3>

                {/* Message */}
                <p className={`text-base leading-relaxed mb-6 ${
                  resultType === "success" ? "text-green-700" : "text-red-700"
                }`}>
                  {resultMessage}
                </p>

                {/* Close Button */}
                <button
                  onClick={() => setResultModalOpen(false)}
                  className={`px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all ${
                    resultType === "success"
                      ? "bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                      : "bg-linear-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
                  }`}
                >
                  Got it!
                </button>

                {/* Auto-close indicator */}
                <p className="text-xs text-slate-500 mt-4">
                  Auto-closing in {resultType === "success" ? "3" : "4"} seconds...
                </p>
              </div>

              {/* Progress bar animation */}
              <div className="h-1.5 bg-slate-200 overflow-hidden">
                <div 
                  className={`h-full ${
                    resultType === "success" ? "bg-green-500" : "bg-red-500"
                  } animate-[progressBar_${resultType === "success" ? "3" : "4"}s_linear]`}
                  style={{
                    animation: `progressBar ${resultType === "success" ? "3" : "4"}s linear`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}
