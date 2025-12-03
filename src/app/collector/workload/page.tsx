"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, Activity, TrendingUp, CheckCircle, AlertTriangle, Zap } from "lucide-react";

export default function WorkloadPage() {
    const { token } = useAuth();
    const [workload, setWorkload] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWorkload = async () => {
            if (!token) {
                console.log("No token available");
                setError("Not authenticated. Please log in.");
                setLoading(false);
                return;
            }
            try {
                console.log("Fetching workload with token:", token?.substring(0, 20) + "...");
                const res = await apiRequest("/collectors/me/workload", { auth: true, token }) as any;
                console.log("Workload Response:", res);
                setWorkload(res);
                setError(null);
            } catch (e: any) {
                console.error("Error fetching workload:", e);
                setError(e?.message || "Failed to fetch workload");
            } finally {
                setLoading(false);
            }
        };
        fetchWorkload();
    }, [token]);

    const getFraudRiskColor = (score: number) => {
        if (score < 0.3) return 'text-green-600';
        if (score < 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getFraudRiskBg = (score: number) => {
        if (score < 0.3) return 'bg-green-100';
        if (score < 0.6) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-700';
            case 'busy':
                return 'bg-yellow-100 text-yellow-700';
            case 'offline':
                return 'bg-slate-100 text-slate-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <ProtectedRoute allowedUserTypes={["collector"]}>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">My Workload</h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    ) : workload ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Active Quests Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Activity className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-slate-500">Active Quests</h3>
                                        <p className="text-3xl font-bold text-slate-900">{workload.active_quests}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Max Concurrent</span>
                                    <span className="font-medium text-slate-900">{workload.max_concurrent}</span>
                                </div>
                            </div>

                            {/* Capacity Remaining Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-emerald-100 rounded-lg">
                                        <Zap className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-slate-500">Capacity Remaining</h3>
                                        <p className="text-3xl font-bold text-slate-900">{workload.capacity_remaining}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-emerald-600 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${(workload.capacity_remaining / workload.max_concurrent) * 100}%`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Completed Last Week Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-slate-500">Completed Last Week</h3>
                                        <p className="text-3xl font-bold text-slate-900">{workload.completed_last_week}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Keep up the great work!</span>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Activity className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-slate-500">Current Status</h3>
                                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(workload.status)}`}>
                                            {workload.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Fraud Risk Score Card */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-3 ${getFraudRiskBg(workload.fraud_risk_score)} rounded-lg`}>
                                        <AlertTriangle className={`w-6 h-6 ${getFraudRiskColor(workload.fraud_risk_score)}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm text-slate-500">Fraud Risk Score</h3>
                                        <p className={`text-3xl font-bold ${getFraudRiskColor(workload.fraud_risk_score)}`}>
                                            {(workload.fraud_risk_score * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${
                                            workload.fraud_risk_score < 0.3 ? 'bg-green-600' :
                                            workload.fraud_risk_score < 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                                        }`}
                                        style={{
                                            width: `${workload.fraud_risk_score * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-3">
                                    {workload.fraud_risk_score < 0.3
                                        ? 'Low risk - Great job maintaining quality!'
                                        : workload.fraud_risk_score < 0.6
                                        ? 'Medium risk - Please ensure photo quality and accuracy'
                                        : 'High risk - Your submissions require additional review'}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </ProtectedRoute>
    );
}
