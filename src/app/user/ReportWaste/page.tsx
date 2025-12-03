"use client";

import { useState, useEffect } from "react";
import { uploadToFirebase } from "@/lib/upload";
import { API_BASE_URL } from "@/lib/config";
import { Upload, Trash2, Camera, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

// Dynamically import the MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

import "leaflet/dist/leaflet.css";

export default function ReportWaste() {
  const { token } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<{
    confidence_score: number;
    description: string;
    severity: string;
    waste_type: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [lat, setLat] = useState<number | null>(23.8103); // Default to Dhaka, Bangladesh
  const [lng, setLng] = useState<number | null>(90.4125);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  // Reports state
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
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsTotal, setReportsTotal] = useState<number>(0);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  
  // Fraud detection modal state
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [fraudDetails, setFraudDetails] = useState<{
    fraud_type?: string;
    message?: string;
    confidence_score?: number;
    detailed_reason?: string;
    web_matches?: any[];
  } | null>(null);

  // Fix for default marker icon in react-leaflet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setIsMapReady(true);
    }
  }, []);

  // Fetch reports list
  useEffect(() => {
    let cancelled = false;
    const fetchReports = async () => {
      setLoadingReports(true);
      setReportsError(null);
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
        if (!contentType.includes("application/json")) {
          throw new Error(`Unexpected response: ${text.slice(0,150)}`);
        }
        const data = JSON.parse(text) as { items: ReportItem[]; total: number; skip: number; limit: number };
        if (!cancelled) {
          setReports(Array.isArray(data.items) ? data.items : []);
          setReportsTotal(typeof data.total === "number" ? data.total : data.items.length);
        }
      } catch (e: any) {
        if (!cancelled) setReportsError(e?.message || "Failed to load reports");
      } finally {
        if (!cancelled) setLoadingReports(false);
      }
    };
    fetchReports();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadedUrl(null);
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setSubmitting(true);
    setMessage(null);
    setFraudDetails(null);
    setShowFraudModal(false);
    
    try {
      // 1) Upload to Firebase
      const url = await uploadToFirebase(selectedFile, setUploadProgress);
      setUploadedUrl(url);

      // 2) Call analysis endpoint
      const res = await fetch(`${API_BASE_URL}/quests/analyze-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image_url: url }),
      });
      
      // Try to parse JSON response
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // If not JSON, likely an error page
        const text = await res.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response. Please check the backend logs.");
      }
      
      // Check if fraud was detected (400 status)
      if (!res.ok) {
        if (res.status === 400 && data.detail?.error === "Image fraud detected") {
          // Show fraud detection modal
          setFraudDetails(data.detail);
          setShowFraudModal(true);
          setMessage(null);
          // Clear the uploaded image
          setSelectedImage(null);
          setSelectedFile(null);
          setUploadedUrl(null);
          setUploadProgress(0);
        } else {
          setMessage(data.detail?.message || data.detail || JSON.stringify(data) || "Failed to analyze image");
        }
        return;
      }
      
      setAnalysisData(data);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || "Failed to analyze image");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseMyLocation = () => {
    setMessage(null);
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => {
        setMessage("Couldn't get location. Please allow location access.");
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCreateQuest = async () => {
    if (!analysisData || !uploadedUrl || !title || lat == null || lng == null) {
      toast.error("Please complete upload, analysis, title, and location.");
      return;
    }
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/quests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          description: analysisData.description,
          image_url: uploadedUrl,
          location: { latitude: lat, longitude: lng },
          severity: analysisData.severity,
          title,
          waste_type: analysisData.waste_type,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      toast.success("Quest created successfully! 🎉");
      
      // Reset form
      setSelectedImage(null);
      setSelectedFile(null);
      setUploadedUrl(null);
      setUploadProgress(0);
      setAnalysisData(null);
      setTitle("");
      
      // Navigate to show reports page after a short delay
      setTimeout(() => {
        router.push("/user/showreports");
      }, 1500);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create quest");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      {/* Fraud Detection Modal */}
      {showFraudModal && fraudDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                      ⚠️ Fraudulent Image Detected
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowFraudModal(false);
                    setFraudDetails(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-700 ml-15">
                {fraudDetails.message || "This image appears to be downloaded from the internet"}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Detection Info Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Detection Type:</p>
                    <p className="text-sm font-medium text-slate-700">Confidence:</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded mb-2">
                      Web Image
                    </div>
                    <div className="bg-red-600 text-white text-lg font-bold px-3 py-1 rounded">
                      {fraudDetails.confidence_score ? `${(fraudDetails.confidence_score * 100).toFixed(0)}%` : '100%'}
                    </div>
                  </div>
                </div>

                {fraudDetails.detailed_reason && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm text-slate-700">
                      <strong>Details:</strong> {fraudDetails.detailed_reason}
                    </p>
                  </div>
                )}

                {fraudDetails.web_matches && fraudDetails.web_matches.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      Found {fraudDetails.web_matches.length} web match(es)
                    </p>
                    <div className="space-y-1">
                      {fraudDetails.web_matches.slice(0, 3).map((match: any, idx: number) => (
                        <div key={idx} className="text-xs text-blue-600 hover:text-blue-800">
                          <span className="font-medium">• visual_match:</span>{' '}
                          <a 
                            href={match.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline break-all"
                          >
                            {match.url || match.page_title || 'Web source'}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Why This Matters */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-900">
                  <strong className="font-semibold">Why this matters:</strong> We only accept authentic, original photos 
                  taken at the waste location to prevent fraud and ensure genuine waste reports.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowFraudModal(false);
                  setFraudDetails(null);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Understood - Upload Real Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Report Waste
                </h1>
                <p className="text-slate-600 mt-1">
                  Help keep our environment clean by reporting waste
                </p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div className="bg-white/40 rounded-lg p-6 border border-slate-200/50">
                  <label className="block text-sm font-semibold text-slate-800 mb-3">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Upload Photo
                  </label>
                  {!selectedImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer bg-white/30 hover:bg-emerald-50/30 transition-all duration-300 hover:border-emerald-400">
                      <Upload className="w-12 h-12 text-emerald-500 mb-3" />
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-emerald-600">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        required
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={selectedImage}
                        alt="Waste preview"
                        className="w-full h-64 object-cover"
                      />
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-lg p-3">
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-linear-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-xs text-slate-700 mt-2 font-medium">
                            Uploading {uploadProgress}%
                          </div>
                        </div>
                      )}
                      {uploadedUrl && (
                        <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Uploaded
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedFile(null);
                          setUploadedUrl(null);
                          setUploadProgress(0);
                        }}
                        className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !selectedFile}
                    className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {submitting
                      ? "Uploading & Analyzing..."
                      : "Upload & Analyze"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedFile(null);
                      setUploadedUrl(null);
                      setUploadProgress(0);
                    }}
                    className="px-6 py-3 border border-slate-300 hover:bg-white/50 text-slate-700 font-semibold rounded-lg transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {/* Create quest section */}
              <div className="bg-white/40 rounded-lg p-6 border border-slate-200/50 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Create Quest
                </h3>
                {message && (
                  <div className="text-sm text-slate-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {message}
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Plastic waste pile near Dhanmondi Lake"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Severity
                    </label>
                    <input
                      type="text"
                      value={analysisData?.severity ?? ""}
                      readOnly
                      className="w-full rounded-lg border border-slate-200 bg-slate-100/50 px-4 py-2.5 text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Waste Type
                    </label>
                    <input
                      type="text"
                      value={analysisData?.waste_type ?? ""}
                      readOnly
                      className="w-full rounded-lg border border-slate-200 bg-slate-100/50 px-4 py-2.5 text-slate-600"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={analysisData?.description ?? ""}
                      readOnly
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-slate-100/50 px-4 py-2.5 text-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      value={lat ?? ""}
                      onChange={(e) =>
                        setLat(e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="23.7461"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      value={lng ?? ""}
                      onChange={(e) =>
                        setLng(e.target.value ? Number(e.target.value) : null)
                      }
                      placeholder="90.3742"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/40"
                    />
                  </div>
                </div>

                {/* Map Display */}
                {typeof window !== 'undefined' && isMapReady && lat !== null && lng !== null && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location Preview
                    </label>
                    <div className="rounded-lg overflow-hidden border border-slate-300 h-[300px]">
                      <MapContainer
                        center={[lat, lng]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        key={`${lat}-${lng}`}
                        scrollWheelZoom={false}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[lat, lng]}>
                          <Popup>
                            <div className="text-sm">
                              <strong>Waste Location</strong>
                              <br />
                              Lat: {lat.toFixed(6)}
                              <br />
                              Lng: {lng.toFixed(6)}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-emerald-300 text-emerald-700 hover:bg-emerald-50/50 transition-all duration-200 font-medium"
                  >
                    Take my recent location
                  </button>
                  <button
                    type="button"
                    disabled={creating}
                    onClick={handleCreateQuest}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-linear-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 transition-all duration-200 font-semibold disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create Quest"}
                  </button>
                </div>
                {uploadedUrl && (
                  <div className="text-xs text-slate-600 bg-slate-100 rounded-lg p-2 break-all">
                    Image URL: {uploadedUrl}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Information */}
            <div className="space-y-6">
              {/* Info Card 1 */}
              <div className="bg-white/40 rounded-lg p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      Why Report Waste?
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Your reports help identify pollution hotspots and enable
                      quick cleanup actions. Together, we can create a cleaner,
                      healthier environment for everyone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Card 2 */}
              <div className="bg-white/40 rounded-lg p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      How It Works
                    </h3>
                    <ul className="text-slate-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Upload a photo of the waste you've spotted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>
                          AI analyzes the image and identifies waste type
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>
                          Add location details and create a cleanup quest
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>
                          Community members can accept and complete the quest
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Info Card 3 */}
              <div className="bg-white/40 rounded-lg p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      Best Practices
                    </h3>
                    <ul className="text-slate-600 text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>Take clear, well-lit photos of the waste</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>
                          Include surrounding context for better location
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>
                          Provide accurate GPS coordinates if possible
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>
                          Add descriptive titles to help others find it
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-linear-to-br from-green-600 to-emerald-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Community Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">1,234</div>
                    <div className="text-sm text-green-100">
                      Reports Submitted
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">892</div>
                    <div className="text-sm text-green-100">
                      Quests Completed
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">5.2T</div>
                    <div className="text-sm text-green-100">Waste Cleaned</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl font-bold mb-1">456</div>
                    <div className="text-sm text-green-100">Active Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Cards Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Latest Reports</h2>
            <button
              type="button"
              disabled={loadingReports}
              onClick={() => {
                setLoadingReports(true);
                setReportsError(null);
                fetch(`${API_BASE_URL}/quests?skip=0&limit=100`, {
                  headers: {
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": "true",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                })
                  .then(async (r) => {
                    const ct = r.headers.get("content-type") || "";
                    const tx = await r.text();
                    if (!ct.includes("application/json")) throw new Error(tx.slice(0,150));
                    return JSON.parse(tx) as { items: ReportItem[]; total: number };
                  })
                  .then((d) => {
                    setReports(Array.isArray(d.items) ? d.items : []);
                    setReportsTotal(typeof d.total === "number" ? d.total : d.items.length);
                  })
                  .catch((e) => setReportsError(e?.message || "Failed to load reports"))
                  .finally(() => setLoadingReports(false));
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-white/60 text-slate-700 text-sm disabled:opacity-50"
            >
              {loadingReports ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {reportsError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
              {reportsError}
            </div>
          )}
          {loadingReports && !reportsError && (
            <div className="mb-6 bg-white/60 border border-slate-200 rounded-lg p-6 text-slate-700">
              Loading reports...
            </div>
          )}
          {!loadingReports && !reportsError && reports.length === 0 && (
            <div className="mb-6 bg-white/60 border border-slate-200 rounded-lg p-6 text-slate-700">
              No reports available.
            </div>
          )}
          {!loadingReports && !reportsError && reports.length > 0 && (
            <>
              <p className="text-sm text-slate-600 mb-4">
                Showing {reports.length}{reportsTotal ? ` of ${reportsTotal}` : ""} reports
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((r) => {
                  const lat = r.location?.coordinates?.[1];
                  const lng = r.location?.coordinates?.[0];
                  return (
                    <div
                      key={r.id}
                      className="group bg-white/50 backdrop-blur-sm rounded-lg border border-slate-200/60 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                    >
                      {r.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={r.image_url}
                            alt={r.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-semibold text-slate-800 mb-2 line-clamp-2">
                          {r.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3 text-xs">
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-medium capitalize">
                            {r.waste_type}
                          </span>
                          <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 font-medium capitalize">
                            {r.severity}
                          </span>
                          <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium capitalize">
                            {r.status}
                          </span>
                          <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-medium">
                            {r.bounty_points} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mb-3 line-clamp-4">
                          {r.description}
                        </p>
                        <div className="mt-auto space-y-1 text-[11px] text-slate-500">
                          {lat && lng && (
                            <div>
                              📍 {lat.toFixed(5)}, {lng.toFixed(5)}
                            </div>
                          )}
                          {r.reporter?.full_name && (
                            <div>Reporter: {r.reporter.full_name}</div>
                          )}
                          <div>ID: {r.id.slice(0, 8)}...</div>
                          <div>
                            Created: {new Date(r.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
