"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  TrendingUp,
  Droplets,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  Activity,
  Thermometer,
  Cloud,
  Loader,
  BarChart3,
  LineChart,
  FileText,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type DustbinDataPoint = {
  timestamp: string;
  day_of_week: string;
  hour: number;
  month: number;
  is_weekend: boolean;
  is_holiday: boolean;
  temperature_c: number;
  precipitation_mm: number;
  foot_traffic_level: string;
  dustbin_capacity_liters: number;
  fill_rate_per_hour: number;
  current_fill_level_percent: number;
};

type DustbinData = {
  data: DustbinDataPoint[];
};

export default function BinLevelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dustbinData, setDustbinData] = useState<DustbinDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [selectedTrafficLevel, setSelectedTrafficLevel] = useState<string>("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<DustbinDataPoint | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const [predictModalOpen, setPredictModalOpen] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    predicted_time_to_full_hours: number;
    current_fill_level_percent: number;
    predicted_full_datetime: string;
    confidence: string;
  } | null>(null);

  // Role-based protection
  useEffect(() => {
    if (!authLoading && user && user.user_type !== "admin") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchDustbinData();
  }, []);

  const fetchDustbinData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/dustbin-data.json");
      const data: DustbinData[] = await response.json();
      setDustbinData(data[0].data);
    } catch (error) {
      console.error("Error loading dustbin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (reading: DustbinDataPoint, index: number) => {
    setEditingReading({ ...reading });
    setEditingIndex(index);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingReading(null);
    setEditingIndex(null);
  };

  const handleEditChange = (field: keyof DustbinDataPoint, value: any) => {
    if (editingReading) {
      setEditingReading({
        ...editingReading,
        [field]: value,
      });
    }
  };

  const saveEditedReading = () => {
    if (editingReading !== null && editingIndex !== null) {
      const updatedData = [...dustbinData];
      updatedData[editingIndex] = editingReading;
      setDustbinData(updatedData);
      closeEditModal();
      
      // Show success toast notification
      toast.success("Data updated successfully!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#10B981",
        },
      });
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const response = await fetch('https://eyasir2047-bin-fill-prediction-2.hf.space/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: dustbinData }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      
      // Use the real API response directly without any modifications
      setPredictionResult(result);
      setPredictModalOpen(true);
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to get prediction. Please try again.', {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          fontWeight: "600",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    } finally {
      setPredicting(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTrafficBadge = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Very_High":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getFillLevelColor = (level: number) => {
    if (level >= 90) return "text-red-600";
    if (level >= 70) return "text-orange-600";
    if (level >= 50) return "text-yellow-600";
    return "text-green-600";
  };

  const getFillLevelBg = (level: number) => {
    if (level >= 90) return "bg-red-600";
    if (level >= 70) return "bg-orange-600";
    if (level >= 50) return "bg-yellow-600";
    return "bg-green-600";
  };

  // Filter data
  const filteredData = dustbinData.filter((item) => {
    const dayMatch = selectedDay === "all" || item.day_of_week === selectedDay;
    const trafficMatch =
      selectedTrafficLevel === "all" || item.foot_traffic_level === selectedTrafficLevel;
    return dayMatch && trafficMatch;
  });

  // Calculate statistics
  const stats = {
    avgFillLevel: (
      filteredData.reduce((sum, item) => sum + item.current_fill_level_percent, 0) /
      filteredData.length
    ).toFixed(1),
    maxFillLevel: Math.max(...filteredData.map((item) => item.current_fill_level_percent)),
    avgFillRate: (
      filteredData.reduce((sum, item) => sum + item.fill_rate_per_hour, 0) /
      filteredData.length
    ).toFixed(2),
    avgTemperature: (
      filteredData.reduce((sum, item) => sum + item.temperature_c, 0) / filteredData.length
    ).toFixed(1),
    criticalReadings: filteredData.filter((item) => item.current_fill_level_percent >= 90).length,
  };

  // Get unique days for filter
  const uniqueDays = Array.from(new Set(dustbinData.map((item) => item.day_of_week)));

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
      <Toaster />
      <div className="min-h-screen bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-linear-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trash2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Bin Level Monitoring</h1>
                <p className="text-slate-600 text-sm">
                  Real-time dustbin fill level tracking and analytics
                </p>
              </div>
            </div>
            <button
              onClick={handlePredict}
              disabled={predicting || dustbinData.length === 0}
              className="px-6 py-3 bg-linear-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {predicting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Predict Fill Time
                </>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Average Fill Level */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Avg Fill Level</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.avgFillLevel}%</p>
            </div>

            {/* Max Fill Level */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Max Fill Level</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.maxFillLevel}%</p>
            </div>

            {/* Avg Fill Rate */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Avg Fill Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.avgFillRate}/hr</p>
            </div>

            {/* Avg Temperature */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Avg Temp</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.avgTemperature}°C</p>
            </div>

            {/* Critical Readings */}
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium">Critical (≥90%)</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.criticalReadings}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Filter by Day:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedDay("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === "all"
                      ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-md"
                      : "bg-white/60 text-slate-700 hover:bg-white"
                  }`}
                >
                  All Days
                </button>
                {uniqueDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDay === day
                        ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-md"
                        : "bg-white/60 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Users className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Traffic Level:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "Low", "Medium", "High", "Very_High"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedTrafficLevel(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTrafficLevel === level
                        ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-md"
                        : "bg-white/60 text-slate-700 hover:bg-white"
                    }`}
                  >
                    {level === "all" ? "All" : level.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-slate-600 text-sm">Loading bin level data...</p>
            </div>
          ) : (
            <>
              {filteredData.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-12 text-center">
                  <Trash2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-900 font-semibold text-lg mb-2">No Data Available</p>
                  <p className="text-slate-600 text-sm">
                    No readings match your selected filters
                  </p>
                </div>
              ) : (
                <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl overflow-hidden shadow-sm">
                  {/* Table Container with Horizontal Scroll */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      {/* Table Header */}
                      <thead className="bg-linear-to-r from-green-600 to-emerald-600 text-white">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Timestamp
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            Day
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            Hour
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-2">
                              <Thermometer className="w-4 h-4" />
                              Temp (°C)
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-2">
                              <Users className="w-4 h-4" />
                              Traffic
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-2">
                              <Trash2 className="w-4 h-4" />
                              Capacity (L)
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Fill Rate
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-2">
                              <Activity className="w-4 h-4" />
                              Fill Level (%)
                            </div>
                          </th>
                          <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      {/* Table Body */}
                      <tbody className="divide-y divide-slate-200">
                        {filteredData.map((reading, index) => (
                          <tr
                            key={index}
                            className="hover:bg-green-50/50 transition-colors duration-200"
                          >
                            {/* Timestamp */}
                            <td className="px-3 py-3 whitespace-nowrap">
                              <div className="text-xs font-medium text-slate-900">
                                {formatTime(reading.timestamp)}
                              </div>
                            </td>

                            {/* Day of Week */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span className="text-xs font-medium text-slate-900">
                                {reading.day_of_week}
                              </span>
                            </td>

                            {/* Hour */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span className="text-xs font-medium text-slate-900">
                                {reading.hour}:00
                              </span>
                            </td>

                            {/* Month */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span className="text-xs font-medium text-slate-900">
                                {reading.month}
                              </span>
                            </td>

                            {/* Temperature */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                                {reading.temperature_c}
                              </span>
                            </td>

                            {/* Traffic Level */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold border ${getTrafficBadge(
                                  reading.foot_traffic_level
                                )}`}
                              >
                                {reading.foot_traffic_level.replace("_", " ")}
                              </span>
                            </td>

                            {/* Capacity */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span className="text-xs font-semibold text-slate-900">
                                {reading.dustbin_capacity_liters}
                              </span>
                            </td>

                            {/* Fill Rate */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                                {reading.fill_rate_per_hour}
                              </span>
                            </td>

                            {/* Fill Level with Progress Bar */}
                            <td className="px-3 py-3">
                              <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                <span
                                  className={`text-xs font-bold ${getFillLevelColor(
                                    reading.current_fill_level_percent
                                  )}`}
                                >
                                  {reading.current_fill_level_percent.toFixed(1)}%
                                </span>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full transition-all ${getFillLevelBg(
                                      reading.current_fill_level_percent
                                    )}`}
                                    style={{
                                      width: `${reading.current_fill_level_percent}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Actions - Edit Button */}
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => openEditModal(reading, index)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
                              >
                                <FileText className="w-3 h-3" />
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary Footer */}
              {filteredData.length > 0 && (
                <div className="mt-8 bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-slate-700">
                        Showing {filteredData.length} readings
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <span className="text-slate-600">Capacity: </span>
                        <span className="font-bold text-slate-900">
                          {filteredData[0]?.dustbin_capacity_liters}L
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Date Range: </span>
                        <span className="font-bold text-slate-900">
                          {formatTime(filteredData[0]?.timestamp)} -{" "}
                          {formatTime(filteredData[filteredData.length - 1]?.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Modal */}
        {editModalOpen && editingReading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-linear-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">Edit Bin Reading</h2>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Timestamp */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Timestamp
                    </label>
                    <input
                      type="text"
                      value={editingReading.timestamp}
                      onChange={(e) => handleEditChange("timestamp", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Day of Week */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Day of Week
                    </label>
                    <select
                      value={editingReading.day_of_week}
                      onChange={(e) => handleEditChange("day_of_week", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    >
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>
                  </div>

                  {/* Hour */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hour (0-23)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={editingReading.hour}
                      onChange={(e) => handleEditChange("hour", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Month (1-12)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={editingReading.month}
                      onChange={(e) => handleEditChange("month", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Is Weekend */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Is Weekend
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={editingReading.is_weekend === true}
                          onChange={() => handleEditChange("is_weekend", true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={editingReading.is_weekend === false}
                          onChange={() => handleEditChange("is_weekend", false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Is Holiday */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Is Holiday
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={editingReading.is_holiday === true}
                          onChange={() => handleEditChange("is_holiday", true)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={editingReading.is_holiday === false}
                          onChange={() => handleEditChange("is_holiday", false)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-slate-700">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingReading.temperature_c}
                      onChange={(e) =>
                        handleEditChange("temperature_c", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Precipitation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Precipitation (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingReading.precipitation_mm}
                      onChange={(e) =>
                        handleEditChange("precipitation_mm", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Foot Traffic Level */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Foot Traffic Level
                    </label>
                    <select
                      value={editingReading.foot_traffic_level}
                      onChange={(e) => handleEditChange("foot_traffic_level", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Very_High</option>
                    </select>
                  </div>

                  {/* Dustbin Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dustbin Capacity (Liters)
                    </label>
                    <input
                      type="number"
                      value={editingReading.dustbin_capacity_liters}
                      onChange={(e) =>
                        handleEditChange("dustbin_capacity_liters", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Fill Rate Per Hour */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fill Rate Per Hour
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingReading.fill_rate_per_hour}
                      onChange={(e) =>
                        handleEditChange("fill_rate_per_hour", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>

                  {/* Current Fill Level Percent */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Fill Level (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={editingReading.current_fill_level_percent}
                      onChange={(e) =>
                        handleEditChange("current_fill_level_percent", parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeEditModal}
                  className="px-5 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedReading}
                  className="px-5 py-2 rounded-lg bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 font-medium transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Modal */}
        {predictModalOpen && predictionResult && (
          <div className="fixed inset-0 bg-slate-500/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-300">
              {/* Modal Header */}
              <div className="sticky top-0 bg-linear-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Bin Fill Prediction Results</h2>
                </div>
                <button
                  onClick={() => setPredictModalOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Current Fill Level */}
                <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Current Fill Level</h3>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {predictionResult.current_fill_level_percent.toFixed(1)}%
                  </div>
                  <div className="mt-3 bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500"
                      style={{ width: `${predictionResult.current_fill_level_percent}%` }}
                    />
                  </div>
                </div>

                {/* Predicted Time to Full */}
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Time Until Full</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600">
                    {predictionResult.predicted_time_to_full_hours.toFixed(1)} hours
                  </div>
                  <p className="text-slate-600 mt-2">
                    {(() => {
                      const totalHours = predictionResult.predicted_time_to_full_hours;
                      const days = Math.floor(totalHours / 24);
                      const hours = Math.floor(totalHours % 24);
                      
                      if (days === 0) {
                        return `Approximately ${hours} hours`;
                      } else if (days === 1) {
                        return hours === 0 
                          ? `Approximately 1 day`
                          : `Approximately 1 day, ${hours} hours`;
                      } else {
                        return hours === 0
                          ? `Approximately ${days} days`
                          : `Approximately ${days} days, ${hours} hours`;
                      }
                    })()}
                  </p>
                </div>

                {/* Predicted Full DateTime */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Expected Full Date & Time</h3>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {new Date(predictionResult.predicted_full_datetime).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Prediction Confidence</h3>
                  </div>
                  <div className="text-4xl font-bold text-green-600 capitalize">
                    {predictionResult.confidence}
                  </div>
                  {predictionResult.confidence.includes('%') && (
                    <div className="mt-3 bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-linear-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: predictionResult.confidence }}
                      />
                    </div>
                  )}
                </div>

                {/* Alert Message */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-700">
                        <strong>Note:</strong> This prediction is based on historical data patterns and current fill levels. 
                        Actual results may vary due to unforeseen circumstances or changes in usage patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setPredictModalOpen(false)}
                  className="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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
