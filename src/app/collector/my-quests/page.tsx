"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2, MapPin, Clock, CheckCircle, AlertCircle, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function MyQuestsPage() {
    const { token } = useAuth();
    const [quests, setQuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");

    useEffect(() => {
        const fetchQuests = async () => {
            if (!token) {
                console.log("No token available");
                setError("Not authenticated. Please log in.");
                setLoading(false);
                return;
            }
            try {
                console.log("Fetching assigned quests with token:", token?.substring(0, 20) + "...");
                const url = statusFilter ? `/collectors/me/quests?status_filter=${statusFilter}` : `/collectors/me/quests`;
                const res = await apiRequest(url, { auth: true, token }) as any;
                console.log("API Response:", res);
                setQuests(res.items || []);
                setError(null);
            } catch (e: any) {
                console.error("Error fetching quests:", e);
                setError(e?.message || "Failed to fetch quests");
            } finally {
                setLoading(false);
            }
        };
        fetchQuests();
    }, [token, statusFilter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'assigned':
                return 'bg-blue-100 text-blue-700';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-700';
            case 'completed':
                return 'bg-purple-100 text-purple-700';
            case 'verified':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <ProtectedRoute allowedUserTypes={["collector"]}>
            <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-slate-900">My Assigned Quests</h1>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter("")}
                                className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "" ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter("assigned")}
                                className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "assigned" ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                            >
                                Assigned
                            </button>
                            <button
                                onClick={() => setStatusFilter("in_progress")}
                                className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "in_progress" ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setStatusFilter("completed")}
                                className={`px-4 py-2 rounded-lg transition-colors font-medium ${statusFilter === "completed" ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border border-slate-300'}`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
                            <p className="text-red-600 font-medium">{error}</p>
                        </div>
                    ) : quests.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <p className="text-slate-500">No quests assigned yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quests.map((quest) => (
                                <div
                                    key={quest.id}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition-all"
                                >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="relative w-full md:w-32 h-32 shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                            {quest.image_url && (
                                                <Image src={quest.image_url} alt={quest.title} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">{quest.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(quest.status)}`}>
                                                    {quest.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm mb-4">{quest.description}</p>

                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>Ward: {quest.ward_geohash}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span className="capitalize">{quest.waste_type} - {quest.severity}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-emerald-600 font-medium">
                                                    <Trophy className="w-4 h-4" />
                                                    <span>{quest.bounty_points} points</span>
                                                </div>
                                                {quest.assigned_at && (
                                                    <div className="flex items-center gap-1 text-slate-600">
                                                        <Clock className="w-4 h-4" />
                                                        <span>Assigned: {new Date(quest.assigned_at).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                                {quest.verified_at && (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span>Verified: {new Date(quest.verified_at).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
