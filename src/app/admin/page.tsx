"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Shield,
  Package,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Activity,
  DollarSign,
  Scale,
  RefreshCcw,
  AlertCircle,
  Zap,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "react-hot-toast";

type AnalyticsData = {
  total_users: number;
  total_collectors: number;
  total_kabadiwalas: number;
  total_quests: number;
  quests_completed: number;
  quests_pending: number;
  total_listings: number;
  listings_active: number;
  total_transactions_value: number;
  total_waste_collected_kg: number;
};

type HeatmapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  waste_type: string;
  severity: "low" | "medium" | "high";
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState<boolean>(false);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);

  // Protect admin route - only admins can access
  useEffect(() => {
    if (!loading && user && user.user_type !== "admin") {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Fetch analytics data
  useEffect(() => {
    if (!token || !user || user.user_type !== "admin") return;
    let cancelled = false;

    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/analytics`, {
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

        const data = JSON.parse(body) as AnalyticsData;
        if (!cancelled) setAnalytics(data);
      } catch (e: any) {
        if (!cancelled) {
          setAnalyticsError(e?.message || "Failed to load analytics");
          // Fallback dummy data
          const dummyData: AnalyticsData = {
            total_users: 4,
            total_collectors: 1,
            total_kabadiwalas: 1,
            total_quests: 4,
            quests_completed: 0,
            quests_pending: 4,
            total_listings: 4,
            listings_active: 2,
            total_transactions_value: 0,
            total_waste_collected_kg: 0,
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

  // Fetch heatmap data
  useEffect(() => {
    if (!token || !user || user.user_type !== "admin") return;
    let cancelled = false;

    const fetchHeatmap = async () => {
      setLoadingHeatmap(true);
      setHeatmapError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/heatmap?limit=500`, {
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

        const data = JSON.parse(body) as HeatmapPoint[];
        if (!cancelled) setHeatmapData(data);
      } catch (e: any) {
        if (!cancelled) {
          setHeatmapError(e?.message || "Failed to load heatmap");
          // Fallback dummy data
          const dummyData: HeatmapPoint[] = [
            {
              id: "b0990934-5392-41ce-b6fe-4b98d69c20b8",
              latitude: 23.790575019718442,
              longitude: 90.4063720702751,
              waste_type: "general",
              severity: "high",
              status: "assigned",
              created_at: "2025-12-02T08:58:54.313838",
            },
            {
              id: "3ca053d0-1499-45af-bc15-631fbcedeb35",
              latitude: 23.8103,
              longitude: 90.4125,
              waste_type: "general",
              severity: "medium",
              status: "reported",
              created_at: "2025-12-02T08:55:11.516513",
            },
            {
              id: "5350603c-90e8-4ca7-a540-50746387cd96",
              latitude: 23.805,
              longitude: 90.415,
              waste_type: "recyclable",
              severity: "medium",
              status: "reported",
              created_at: "2025-12-02T08:51:26.198777",
            },
            {
              id: "16ac2fc6-1b86-4084-a6d7-c0ff7154111b",
              latitude: 23.809,
              longitude: 90.418,
              waste_type: "e_waste",
              severity: "high",
              status: "reported",
              created_at: "2025-12-02T08:51:26.198777",
            },
          ];
          setHeatmapData(dummyData);
        }
      } finally {
        if (!cancelled) setLoadingHeatmap(false);
      }
    };

    fetchHeatmap();

    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const refreshAnalytics = () => {
    if (!token) return;
    setLoadingAnalytics(true);
    setAnalyticsError(null);

    fetch(`${API_BASE_URL}/dashboard/analytics`, {
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
        return JSON.parse(tx) as AnalyticsData;
      })
      .then((d) => {
        setAnalytics(d);
        toast.success("Analytics refreshed");
      })
      .catch((e) => {
        setAnalyticsError(e?.message || "Failed to load analytics");
        toast.error("Failed to refresh analytics");
      })
      .finally(() => setLoadingAnalytics(false));
  };

  if (loading) return null;
  if (!user || user.user_type !== "admin") return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
                  <p className="text-sm text-slate-500">Welcome back, {user?.full_name || "Admin"}!</p>
                </div>
              </div>
              <button
                onClick={refreshAnalytics}
                disabled={loadingAnalytics}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:shadow-md text-sm font-medium disabled:opacity-50 transition-all"
              >
                <RefreshCcw className={`w-4 h-4 ${loadingAnalytics ? "animate-spin" : ""}`} />
                {loadingAnalytics ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Info Banner */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-800 mb-1">System Analytics Overview</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Monitor real-time metrics, user activity, quest progress, and platform performance at a glance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {analyticsError && (
            <div className="mb-6 flex items-center gap-3 text-sm text-orange-700 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{analyticsError} - Showing fallback data</span>
            </div>
          )}

          {/* Analytics Grid */}
          {loadingAnalytics && !analytics && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl bg-white/60 animate-pulse" />
              ))}
            </div>
          )}

          {analytics && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <MetricCard
                title="Total Users"
                value={analytics.total_users.toString()}
                icon={<Users className="w-6 h-6" />}
                gradient="from-blue-500 to-indigo-600"
                bgGradient="from-blue-400/20 to-indigo-400/20"
              />

              {/* Total Collectors */}
              <MetricCard
                title="Total Collectors"
                value={analytics.total_collectors.toString()}
                icon={<Activity className="w-6 h-6" />}
                gradient="from-emerald-500 to-green-600"
                bgGradient="from-emerald-400/20 to-green-400/20"
              />

              {/* Total Kabadiwalas */}
              <MetricCard
                title="Total Kabadiwalas"
                value={analytics.total_kabadiwalas.toString()}
                icon={<ShoppingCart className="w-6 h-6" />}
                gradient="from-purple-500 to-pink-600"
                bgGradient="from-purple-400/20 to-pink-400/20"
              />

              {/* Total Quests */}
              <MetricCard
                title="Total Quests"
                value={analytics.total_quests.toString()}
                icon={<Package className="w-6 h-6" />}
                gradient="from-amber-500 to-orange-600"
                bgGradient="from-amber-400/20 to-orange-400/20"
              />

              {/* Quests Completed */}
              <MetricCard
                title="Quests Completed"
                value={analytics.quests_completed.toString()}
                icon={<CheckCircle2 className="w-6 h-6" />}
                gradient="from-green-500 to-emerald-600"
                bgGradient="from-green-400/20 to-emerald-400/20"
              />

              {/* Quests Pending */}
              <MetricCard
                title="Quests Pending"
                value={analytics.quests_pending.toString()}
                icon={<Clock className="w-6 h-6" />}
                gradient="from-orange-500 to-red-600"
                bgGradient="from-orange-400/20 to-red-400/20"
              />

              {/* Total Listings */}
              <MetricCard
                title="Total Listings"
                value={analytics.total_listings.toString()}
                icon={<LayoutDashboard className="w-6 h-6" />}
                gradient="from-cyan-500 to-blue-600"
                bgGradient="from-cyan-400/20 to-blue-400/20"
              />

              {/* Active Listings */}
              <MetricCard
                title="Active Listings"
                value={analytics.listings_active.toString()}
                icon={<TrendingUp className="w-6 h-6" />}
                gradient="from-teal-500 to-cyan-600"
                bgGradient="from-teal-400/20 to-cyan-400/20"
              />

              {/* Total Transaction Value */}
              <MetricCard
                title="Transaction Value"
                value={`৳${analytics.total_transactions_value.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6" />}
                gradient="from-violet-500 to-purple-600"
                bgGradient="from-violet-400/20 to-purple-400/20"
              />

              {/* Waste Collected */}
              <MetricCard
                title="Waste Collected"
                value={`${analytics.total_waste_collected_kg} kg`}
                icon={<Scale className="w-6 h-6" />}
                gradient="from-lime-500 to-green-600"
                bgGradient="from-lime-400/20 to-green-400/20"
              />
            </div>
          )}

          {/* Heatmap Section */}
          <div className="mt-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Waste Hotspot Map</h2>
              <p className="text-sm text-slate-600">
                Real-time visualization of waste reports across the city. Hover over markers to see details.
              </p>
            </div>

            {heatmapError && (
              <div className="mb-4 flex items-center gap-3 text-sm text-orange-700 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{heatmapError} - Showing fallback data</span>
              </div>
            )}

            {loadingHeatmap && heatmapData.length === 0 ? (
              <div className="h-[600px] rounded-2xl bg-white/60 animate-pulse border-2 border-slate-200" />
            ) : (
              <HeatmapView data={heatmapData} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function MetricCard({
  title,
  value,
  icon,
  gradient,
  bgGradient,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
}) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-linear-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        </div>
        
        <h3 className="text-3xl font-bold text-slate-800 mb-1 group-hover:text-slate-900">
          {value}
        </h3>
        <p className="text-sm text-slate-600 font-medium">{title}</p>
      </div>
      
      {/* Decorative Element */}
      <div className="absolute -right-2 -top-2 w-20 h-20 bg-linear-to-br from-white/40 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
    </div>
  );
}

function HeatmapView({ data }: { data: HeatmapPoint[] }) {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    import("@/components/MapComponent").then((mod) => {
      setMapComponent(() => mod.default);
    });
  }, []);

  if (!MapComponent) {
    return (
      <div className="h-[600px] rounded-2xl bg-white/60 border-2 border-slate-200 flex items-center justify-center">
        <div className="text-slate-500">Loading map...</div>
      </div>
    );
  }

  // Group by severity for stats
  const severityCounts = data.reduce(
    (acc, point) => {
      acc[point.severity] = (acc[point.severity] || 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<string, number>
  );

  // Group by status for stats
  const statusCounts = data.reduce(
    (acc, point) => {
      acc[point.status] = (acc[point.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800">{data.length}</div>
          <div className="text-xs text-slate-600 font-medium">Total Reports</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border-2 border-red-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{severityCounts.high || 0}</div>
          <div className="text-xs text-slate-600 font-medium">High Severity</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border-2 border-orange-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-600">{severityCounts.medium || 0}</div>
          <div className="text-xs text-slate-600 font-medium">Medium Severity</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border-2 border-yellow-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">{severityCounts.low || 0}</div>
          <div className="text-xs text-slate-600 font-medium">Low Severity</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{statusCounts.reported || 0}</div>
          <div className="text-xs text-slate-600 font-medium">Reported</div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg">
        <MapComponent
          latitude={data.length > 0 ? data[0].latitude : 23.8103}
          longitude={data.length > 0 ? data[0].longitude : 90.4125}
          zoom={12}
          markers={data.map((point) => ({
            id: point.id,
            position: [point.latitude, point.longitude] as [number, number],
            popup: `
              <div style="min-width: 200px;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1e293b;">
                  ${point.waste_type.replace("_", " ").toUpperCase()}
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${
                    point.severity === "high"
                      ? "#fee2e2"
                      : point.severity === "medium"
                      ? "#fed7aa"
                      : "#fef3c7"
                  }; color: ${
                    point.severity === "high"
                      ? "#dc2626"
                      : point.severity === "medium"
                      ? "#ea580c"
                      : "#ca8a04"
                  };">
                    ${point.severity.toUpperCase()}
                  </span>
                  <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${
                    point.status === "completed"
                      ? "#d1fae5"
                      : point.status === "assigned"
                      ? "#dbeafe"
                      : "#f3f4f6"
                  }; color: ${
                    point.status === "completed"
                      ? "#059669"
                      : point.status === "assigned"
                      ? "#2563eb"
                      : "#6b7280"
                  };">
                    ${point.status.toUpperCase()}
                  </span>
                </div>
                <div style="font-size: 12px; color: #64748b;">
                  ${new Date(point.created_at).toLocaleString()}
                </div>
              </div>
            `,
            color:
              point.severity === "high"
                ? "red"
                : point.severity === "medium"
                ? "orange"
                : "yellow",
          }))}
          height="600px"
        />
      </div>
    </div>
  );
}
