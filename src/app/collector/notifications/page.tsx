"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { Bell, RefreshCcw, CheckCircle2, AlertCircle, Info, Package } from "lucide-react";

type NotificationItem = {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  related_quest_id: string | null;
  metadata?: { quest_bounty?: number; waste_type?: string; severity?: string } | null;
  is_read: boolean;
  created_at: string;
};

export default function CollectorNotificationsPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Role based protection
  useEffect(() => {
    if (!loading && user && user.user_type !== "collector") router.replace("/");
  }, [loading, user, router]);

  // Fetch notifications
  useEffect(() => {
    if (!token || !user || user.user_type !== "collector") return;
    let cancelled = false;
    const run = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/notifications?skip=0&limit=20&unread_only=false`,
          {
            headers: {
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ct = res.headers.get("content-type") || "";
        const body = await res.text();
        if (!res.ok) throw new Error(body || `HTTP ${res.status}`);
        if (!ct.includes("application/json")) throw new Error(body.slice(0, 200));
        const data = JSON.parse(body) as {
          items: NotificationItem[];
          total: number;
          unread_count: number;
        };
        if (!cancelled) {
          setItems(data.items || []);
          setTotal(data.total || data.items.length || 0);
          setUnreadCount(data.unread_count || 0);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Failed to load notifications");
          // Fallback dummy data
          const dummy: NotificationItem[] = [
            {
              id: "dummy-1",
              notification_type: "quest_assigned",
              title: "New Quest Assigned! (Dummy)",
              message: "You've been assigned a new cleanup quest: Mixed and Plastic (dummy)",
              related_quest_id: "dummy-quest-123",
              metadata: { quest_bounty: 30, waste_type: "general", severity: "high" },
              is_read: false,
              created_at: new Date().toISOString(),
            },
          ];
          setItems(dummy);
          setTotal(dummy.length);
          setUnreadCount(dummy.filter((d) => !d.is_read).length);
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  // Provide visible feedback instead of rendering nothing
  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-slate-600 text-sm">Loading authentication…</div>
    );
  }
  if (!user) {
    return (
      <div className="px-6 py-10 text-center text-slate-600 text-sm">Not authenticated. Redirecting…</div>
    );
  }
  if (user.user_type !== "collector") {
    return (
      <div className="px-6 py-10 text-center text-slate-600 text-sm">Only collectors can view notifications.</div>
    );
  }

  const refresh = () => {
    setLoadingData(true);
    setError(null);
    fetch(`${API_BASE_URL}/notifications?skip=0&limit=20&unread_only=false`, {
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
        return JSON.parse(tx) as {
          items: NotificationItem[];
          total: number;
          unread_count: number;
        };
      })
      .then((d) => {
        setItems(d.items || []);
        setTotal(d.total || d.items.length || 0);
        setUnreadCount(d.unread_count || 0);
      })
      .catch((e) => {
        setError(e?.message || "Failed to load notifications");
        const dummy: NotificationItem[] = [
          {
            id: "dummy-refresh",
            notification_type: "quest_assigned",
            title: "Dummy Notification",
            message: "Fallback: assigned quest while fetching failed",
            related_quest_id: "dummy-refresh-quest",
            metadata: { quest_bounty: 20, waste_type: "recyclable", severity: "low" },
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ];
        setItems(dummy);
        setTotal(dummy.length);
        setUnreadCount(dummy.filter((d) => !d.is_read).length);
      })
      .finally(() => setLoadingData(false));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      const ct = res.headers.get("content-type") || "";
      const body = await res.text();

      if (!res.ok) {
        throw new Error(body || `HTTP ${res.status}`);
      }
      if (!ct.includes("application/json")) {
        throw new Error(body.slice(0, 200));
      }
      // Success: server confirmed, UI already updated optimistically
    } catch (e: any) {
      // Revert optimistic update on failure
      setItems((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
      setError(e?.message || "Failed to mark as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    if (type.includes("assigned")) return <Package className="w-5 h-5" />;
    if (type.includes("completed")) return <CheckCircle2 className="w-5 h-5" />;
    if (type.includes("alert") || type.includes("warning")) return <AlertCircle className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string) => {
    if (type.includes("assigned")) return "from-blue-500 to-blue-600";
    if (type.includes("completed")) return "from-green-500 to-emerald-600";
    if (type.includes("alert") || type.includes("warning")) return "from-orange-500 to-red-500";
    return "from-purple-500 to-indigo-600";
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
                <p className="text-sm text-slate-500">Stay updated with your tasks</p>
              </div>
            </div>
            <button
              onClick={refresh}
              disabled={loadingData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md text-sm font-medium text-slate-700 disabled:opacity-60 transition-all"
            >
              <RefreshCcw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
              {loadingData ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <div className="flex-1 px-6 py-4 rounded-2xl bg-linear-to-br from-white/80 to-white/60 backdrop-blur-sm border border-slate-200 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Total Notifications</div>
              <div className="text-3xl font-bold text-slate-900">{total}</div>
            </div>
            <div className="flex-1 px-6 py-4 rounded-2xl bg-linear-to-br from-emerald-50 to-green-50 border border-emerald-200 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-1">Unread</div>
              <div className="text-3xl font-bold text-emerald-700">{unreadCount}</div>
            </div>
          </div>

          {error && (
            <div className="mt-4 px-5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loadingData && items.length === 0 && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingData && items.length === 0 && !error && (
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No notifications yet</h3>
            <p className="text-sm text-slate-500">You're all caught up! Check back later for updates.</p>
          </div>
        )}

        {/* Notifications List - One per row */}
        {items.length > 0 && (
          <div className="space-y-4">
            {items.map((n) => {
              const severity = n.metadata?.severity;
              const wasteType = n.metadata?.waste_type;
              const bounty = n.metadata?.quest_bounty;
              const icon = getNotificationIcon(n.notification_type);
              const colorGradient = getNotificationColor(n.notification_type);
              
              return (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`group relative bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${
                    n.is_read 
                      ? "border-slate-200 hover:border-slate-300" 
                      : "border-emerald-200 hover:border-emerald-300 cursor-pointer"
                  }`}
                >
                  {/* Unread Indicator */}
                  {!n.is_read && (
                    <div className="absolute top-5 left-0 w-1.5 h-12 bg-linear-to-b from-emerald-500 to-green-500 rounded-r-full" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`shrink-0 w-12 h-12 rounded-xl bg-linear-to-br ${colorGradient} flex items-center justify-center text-white shadow-md`}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 pr-4">{n.title}</h3>
                        <span
                          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                            n.is_read 
                              ? "bg-slate-100 text-slate-600" 
                              : "bg-emerald-100 text-emerald-700 animate-pulse"
                          }`}
                        >
                          {n.is_read ? "✓ Read" : "● Unread"}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">{n.message}</p>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {n.notification_type && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200">
                            <Info className="w-3 h-3" />
                            {n.notification_type.replace(/_/g, " ")}
                          </span>
                        )}
                        {wasteType && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 capitalize">
                            <Package className="w-3 h-3" />
                            {wasteType}
                          </span>
                        )}
                        {severity && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200 capitalize">
                            <AlertCircle className="w-3 h-3" />
                            {severity}
                          </span>
                        )}
                        {typeof bounty === "number" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200">
                            🎁 {bounty} points
                          </span>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                        {n.related_quest_id && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            Quest: {n.related_quest_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-emerald-400/0 via-emerald-400/0 to-emerald-400/0 group-hover:from-emerald-400/10 group-hover:via-transparent group-hover:to-emerald-400/10 transition-all duration-300 pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
